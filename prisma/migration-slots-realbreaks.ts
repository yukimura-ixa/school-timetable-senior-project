/**
 * Phase 2A migration — regenerate timeslots as real break slots + remap class_schedule.
 *
 * Converts legacy table_config { Duration, TimeslotPerDay, breakDefinitions } to
 * the slots[] model, regenerates one real timeslot per slot (breaks occupy real
 * rows), and remaps existing class_schedule.TimeslotID old→new so placements
 * survive. Idempotent: configs already on slots[] are skipped.
 *
 * Usage:
 *   pnpm dotenv -e .env -- tsx prisma/migration-slots-realbreaks.ts          # dry-run (default)
 *   pnpm dotenv -e .env -- tsx prisma/migration-slots-realbreaks.ts --apply  # apply
 *
 * Safety: class_schedule.TimeslotID FK is onDelete:Cascade, so old timeslots
 * cannot be deleted while class_schedule still points at them. We stage new rows
 * under a temp id, repoint class_schedule, delete old rows (cascade hits
 * nothing), then swap temp → final ids inside one transaction per config.
 */
import { PrismaClient, day_of_week, semester } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";
import { generateTimeslots } from "../src/features/timeslot/domain/services/timeslot.service";
import {
  configToSlots,
  remapTimeslotId,
} from "../src/features/timeslot/domain/services/slot-migration";

const TEMP_PREFIX = "__mig__";

const connectionString = process.env.DATABASE_URL!;
const isAccelerate = connectionString.startsWith("prisma+");

let prisma: PrismaClient;
if (isAccelerate) {
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "minimal",
    accelerateUrl: connectionString,
  }).$extends(withAccelerate()) as unknown as PrismaClient;
} else {
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "minimal",
    adapter,
  });
}

type LegacyConfig = {
  Days: day_of_week[];
  StartTime: string;
  Duration: number;
  TimeslotPerDay: number;
  breakDefinitions?: { slotNumber: number; duration: number; groups: string[] }[];
};

function hasSlots(config: unknown): boolean {
  return (
    typeof config === "object" &&
    config !== null &&
    Array.isArray((config as { slots?: unknown }).slots)
  );
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(
    apply
      ? "🚀 APPLY mode — changes will be written"
      : "🔍 DRY-RUN (default) — no writes; pass --apply to commit",
  );

  const configs = await prisma.table_config.findMany();
  console.log(`Found ${configs.length} table_config row(s)\n`);

  let migrated = 0;
  let skipped = 0;

  for (const cfg of configs) {
    const raw = cfg.Config as unknown;
    if (hasSlots(raw)) {
      console.log(`⏭️  ${cfg.ConfigID}: already on slots[] — skip`);
      skipped++;
      continue;
    }

    const old = raw as LegacyConfig;
    if (typeof old.Duration !== "number" || typeof old.TimeslotPerDay !== "number") {
      console.warn(`⚠️  ${cfg.ConfigID}: not legacy shape (no Duration/TimeslotPerDay) — skip`);
      skipped++;
      continue;
    }

    const newSlots = configToSlots(old);
    const breakSlotNumbers = (old.breakDefinitions ?? []).map((b) => b.slotNumber);
    const newTimeslots = generateTimeslots({
      AcademicYear: cfg.AcademicYear,
      Semester: cfg.Semester as semester,
      Days: old.Days,
      StartTime: old.StartTime,
      slots: newSlots,
    });
    const newIdSet = new Set(newTimeslots.map((t) => t.TimeslotID));

    // Existing placements for this term (join through timeslot).
    const schedules = await prisma.class_schedule.findMany({
      where: { timeslot: { AcademicYear: cfg.AcademicYear, Semester: cfg.Semester } },
      select: { ClassID: true, TimeslotID: true },
    });

    // Build + validate old→new id map.
    const idMap = new Map<string, string>();
    const orphans: string[] = [];
    for (const s of schedules) {
      const newId = remapTimeslotId(s.TimeslotID, breakSlotNumbers);
      idMap.set(s.TimeslotID, newId);
      if (!newIdSet.has(newId)) orphans.push(`${s.TimeslotID} → ${newId}`);
    }

    console.log(`\n📋 ${cfg.ConfigID} (${cfg.AcademicYear}/${cfg.Semester})`);
    console.log(`   legacy: Duration=${old.Duration} TimeslotPerDay=${old.TimeslotPerDay} breaks=${breakSlotNumbers.join(",") || "none"}`);
    console.log(`   → ${newSlots.length} slots/day, ${newTimeslots.length} timeslot rows`);
    console.log(`   class_schedule rows to remap: ${schedules.length}`);
    const sample = [...idMap.entries()].slice(0, 6).map(([o, n]) => `${o}→${n}`);
    if (sample.length) console.log(`   id remap sample: ${sample.join(", ")}`);

    if (orphans.length) {
      console.error(`   ❌ ${orphans.length} class_schedule rows would map to a non-existent new timeslot:`);
      for (const o of orphans.slice(0, 10)) console.error(`      ${o}`);
      throw new Error(`Aborting: ${cfg.ConfigID} has unmappable class_schedule rows`);
    }

    if (!apply) {
      console.log(`   (dry-run: no writes)`);
      migrated++;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Stage new timeslots under a temp id (avoids collision with old ids).
      await tx.timeslot.createMany({
        data: newTimeslots.map((t) => ({
          TimeslotID: `${TEMP_PREFIX}${t.TimeslotID}`,
          AcademicYear: t.AcademicYear,
          Semester: t.Semester,
          StartTime: t.StartTime,
          EndTime: t.EndTime,
          Breaktime: t.Breaktime,
          DayOfWeek: t.DayOfWeek,
        })),
      });

      // 2. Repoint class_schedule to the temp ids.
      for (const [oldId, newId] of idMap) {
        await tx.class_schedule.updateMany({
          where: { TimeslotID: oldId },
          data: { TimeslotID: `${TEMP_PREFIX}${newId}` },
        });
      }

      // 3. Delete old timeslots (cascade hits nothing — schedules are on temp ids).
      await tx.timeslot.deleteMany({
        where: {
          AcademicYear: cfg.AcademicYear,
          Semester: cfg.Semester,
          TimeslotID: { not: { startsWith: TEMP_PREFIX } },
        },
      });

      // 4. Create final timeslots with real ids.
      await tx.timeslot.createMany({
        data: newTimeslots.map((t) => ({
          TimeslotID: t.TimeslotID,
          AcademicYear: t.AcademicYear,
          Semester: t.Semester,
          StartTime: t.StartTime,
          EndTime: t.EndTime,
          Breaktime: t.Breaktime,
          DayOfWeek: t.DayOfWeek,
        })),
      });

      // 5. Repoint class_schedule from temp ids to final ids.
      for (const newId of new Set(idMap.values())) {
        await tx.class_schedule.updateMany({
          where: { TimeslotID: `${TEMP_PREFIX}${newId}` },
          data: { TimeslotID: newId },
        });
      }

      // 6. Drop temp timeslots.
      await tx.timeslot.deleteMany({
        where: {
          AcademicYear: cfg.AcademicYear,
          Semester: cfg.Semester,
          TimeslotID: { startsWith: TEMP_PREFIX },
        },
      });

      // 7. Persist the new config shape.
      await tx.table_config.update({
        where: { ConfigID: cfg.ConfigID },
        data: { Config: { Days: old.Days, StartTime: old.StartTime, slots: newSlots } },
      });
    });

    console.log(`   ✅ applied`);
    migrated++;
  }

  console.log(`\nDone. ${migrated} config(s) ${apply ? "migrated" : "planned"}, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
