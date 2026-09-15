/**
 * Repair timeslot rows in place so their StartTime/EndTime match what
 * table_config.Config generates — WITHOUT touching TimeslotIDs, so every
 * class_schedule / teachers_responsibility row for the term survives.
 *
 * Use this instead of the "edit timeslots" dialog on a term that already
 * holds schedules: the dialog regenerates by deleting the term first.
 *
 * Usage (dry-run is the default; nothing is written without --apply):
 *   pnpm dotenv -e .env.production -- tsx prisma/repair-timeslot-rows.ts --config 1-2568
 *   pnpm dotenv -e .env.production -- tsx prisma/repair-timeslot-rows.ts --config 1-2568 --apply
 *
 * When the stored config itself is wrong, override it; the override is
 * written to table_config.Config in the same transaction as the rows:
 *   ... --config 1-2568 --start 08:00 --slots 50,50,50,15:junior,15:senior,50,50,50
 *
 * Slot tokens: <minutes> (teaching) or <minutes>:<group>[+<group>] where group
 * is a break_group.Name for the config, or * for a universal break.
 * Shorthands: j = junior, s = senior.
 *
 * Preconditions enforced before any write:
 *   - the term's timeslot ids are exactly the ids the config generates
 *     (same slot count per day). A count mismatch cannot be repaired in place —
 *     it needs an id remap like prisma/migration-slots-realbreaks.ts.
 *   - every breakGroups name in the (possibly overridden) config exists in
 *     break_group for that ConfigID (or is *).
 *   - the planned change is not a uniform whole-hour shift of every row and no
 *     row moves ≥ 3h. Either pattern means the stored rows do not follow the
 *     timeslot time convention (UTC instant of the Thai wall-clock, see
 *     bangkokClockToTimeslotDate), not that the bell times changed.
 *
 * Breaktime on the rows is left untouched: consumers still read the legacy
 * BREAK_JUNIOR / BREAK_SENIOR enums, and the slot-number ↔ config mapping is
 * what decides break rendering today.
 *
 * Back up first: pnpm dotenv -e .env.production -- tsx scripts/db-backup.ts
 */

/* eslint-disable no-console */

import { assertClock, describeSlots, parseSlots } from "./lib/slot-args";

import { Prisma, type day_of_week } from "../prisma/generated/client";
import prisma from "../src/lib/prisma";
import { invalidatePublicCache } from "../src/lib/cache-invalidation";
import { generateTimeslots } from "../src/features/timeslot/domain/services/timeslot.service";
import { planTimeslotRowRepair } from "../src/features/timeslot/domain/services/timeslot-repair.service";
import { parseConfigData } from "../src/features/config/domain/types/config-data.types";
import type { ConfigData } from "../src/features/config/domain/types/config-data.types";
import type { SlotConfig } from "../src/features/timeslot/domain/models/break.types";

type Args = {
  configId: string;
  apply: boolean;
  start?: string;
  slots?: SlotConfig[];
};

// Real bell-time corrections are a few tens of minutes; anything ≥ 3h is a TZ artefact.
const MAX_BELL_TIME_MOVE_MINUTES = 180;
// Accelerate free plan caps interactive transactions at 15s; keep headroom.
const TX_OPTIONS = { timeout: 14_000, maxWait: 5_000 };

function parseArgs(argv: string[]): Args {
  const args: Args = { configId: "", apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === "--apply") args.apply = true;
    else if (a === "--config") args.configId = next();
    else if (a === "--start") args.start = next();
    else if (a === "--slots") args.slots = parseSlots(next());
    else throw new Error(`Unknown argument ${a}`);
  }
  if (!args.configId) throw new Error("--config <ConfigID> is required (e.g. --config 1-2568)");
  assertClock(args.start, "--start");
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(
    args.apply
      ? "🚀 APPLY mode — rows will be updated in one transaction"
      : "🔍 DRY-RUN (default) — no writes; pass --apply to commit",
  );

  const cfg = await prisma.table_config.findUnique({ where: { ConfigID: args.configId } });
  if (!cfg) throw new Error(`table_config ${args.configId} not found`);

  const stored = parseConfigData(cfg.Config);
  const effective: ConfigData = {
    Days: stored.Days,
    StartTime: args.start ?? stored.StartTime,
    slots: args.slots ?? stored.slots,
  };
  const configChanged =
    effective.StartTime !== stored.StartTime ||
    JSON.stringify(effective.slots) !== JSON.stringify(stored.slots);

  console.log(`\n📋 ${cfg.ConfigID} (${cfg.AcademicYear}/${cfg.Semester})`);
  console.log(`   stored config:    StartTime=${stored.StartTime}  slots: ${describeSlots(stored.slots)}`);
  if (configChanged) {
    console.log(`   effective config: StartTime=${effective.StartTime}  slots: ${describeSlots(effective.slots)}  (override → table_config.Config will be updated)`);
  }

  // break_group names referenced by the effective config must exist.
  const breakGroups = await prisma.break_group.findMany({
    where: { ConfigID: cfg.ConfigID },
    include: { grades: { select: { GradeID: true } } },
  });
  console.log(`   break_group rows: ${breakGroups.length === 0 ? "none" : ""}`);
  for (const g of breakGroups) {
    console.log(`     - ${g.Name} (${g.Label}) grades=${g.grades.map((x) => x.GradeID).join(",") || "none"}`);
  }
  const knownGroups = new Set(breakGroups.map((g) => g.Name));
  const unknownGroups = effective.slots
    .flatMap((s) => s.breakGroups ?? [])
    .filter((name) => name !== "*" && !knownGroups.has(name));
  if (unknownGroups.length) {
    throw new Error(`Config references break groups with no break_group row: ${[...new Set(unknownGroups)].join(", ")}`);
  }

  const existing = await prisma.timeslot.findMany({
    where: { AcademicYear: cfg.AcademicYear, Semester: cfg.Semester },
    orderBy: [{ DayOfWeek: "asc" }, { TimeslotID: "asc" }],
  });
  const generated = generateTimeslots({
    AcademicYear: cfg.AcademicYear,
    Semester: cfg.Semester,
    Days: effective.Days as day_of_week[],
    StartTime: effective.StartTime,
    slots: effective.slots,
  });

  const perDay = new Map<string, number>();
  for (const r of existing) perDay.set(r.DayOfWeek, (perDay.get(r.DayOfWeek) ?? 0) + 1);
  console.log(`   timeslot rows in DB: ${existing.length} (${[...perDay].map(([d, n]) => `${d}=${n}`).join(" ")})`);
  const firstRow = existing[0];
  if (firstRow) {
    console.log(`   raw first row: ${firstRow.TimeslotID} StartTime=${firstRow.StartTime.toISOString()} EndTime=${firstRow.EndTime.toISOString()}`);
  }
  console.log(`   rows the config generates: ${generated.length} (${effective.slots.length}/day × ${effective.Days.length} days)`);

  const plan = planTimeslotRowRepair(existing, generated);
  if (plan.missingInDb.length || plan.extraInDb.length) {
    if (plan.missingInDb.length) console.error(`   ❌ ids the config generates but the DB lacks: ${plan.missingInDb.join(", ")}`);
    if (plan.extraInDb.length) console.error(`   ❌ ids in the DB the config does not generate: ${plan.extraInDb.join(", ")}`);
    throw new Error(
      "Slot count mismatch — in-place repair is impossible; a class_schedule id remap is required. " +
        "prisma/migration-slots-realbreaks.ts shows the temp-id technique but skips configs already on slots[], so a new remap script is needed.",
    );
  }

  const byId = new Map(existing.map((r) => [r.TimeslotID, r]));
  console.log(`\n   ${plan.updates.length} row(s) to update, ${plan.unchanged} already correct`);
  for (const u of plan.updates) {
    const row = byId.get(u.TimeslotID)!;
    console.log(`     ${u.TimeslotID.padEnd(14)} ${u.from.StartTime}-${u.from.EndTime} → ${u.to.StartTime}-${u.to.EndTime}   (Breaktime=${row.Breaktime}, kept)`);
  }

  const schedules = await prisma.class_schedule.count({
    where: { timeslot: { AcademicYear: cfg.AcademicYear, Semester: cfg.Semester } },
  });
  console.log(`   class_schedule rows on this term: ${schedules} (untouched — ids are preserved)`);

  const tzHint =
    "Rows written before bangkokClockToTimeslotDate existed may carry a process-TZ offset; " +
    "check the raw first row above (08:30 Bangkok must read 01:30Z) and fix the rows deliberately rather than through this script.";
  if (plan.uniformShiftMinutes !== null) {
    throw new Error(
      `Every row would shift by exactly ${plan.uniformShiftMinutes / 60}h — that is a TZ artefact, not a bell-time change. ${tzHint}`,
    );
  }
  if (plan.maxShiftMinutes >= MAX_BELL_TIME_MOVE_MINUTES) {
    throw new Error(
      `A row would move by ${plan.maxShiftMinutes} min — bell-time repairs move rows by minutes, a multi-hour move means a TZ artefact. ${tzHint}`,
    );
  }

  if (plan.updates.length === 0 && !configChanged) {
    console.log("\n✅ Nothing to do — rows already match the config.");
    return;
  }
  if (!args.apply) {
    console.log("\n(dry-run: no writes)");
    return;
  }

  await prisma.$transaction(async (tx) => {
    // One UPDATE for every row: Accelerate caps interactive transactions at
    // 15s on the free plan, so no per-row round trips. `to` is the UTC clock,
    // which is exactly what the Time(0) column stores.
    if (plan.updates.length) {
      const rows = plan.updates.map(
        (u) => Prisma.sql`(${u.TimeslotID}, ${u.to.StartTime}::time, ${u.to.EndTime}::time)`,
      );
      const updated = await tx.$executeRaw`
        UPDATE "timeslot" AS t
        SET "StartTime" = m.start_at, "EndTime" = m.end_at
        FROM (VALUES ${Prisma.join(rows)}) AS m(id, start_at, end_at)
        WHERE t."TimeslotID" = m.id`;
      if (updated !== plan.updates.length) {
        throw new Error(`updated ${updated} of ${plan.updates.length} rows; rolling back`);
      }
    }
    if (configChanged) {
      await tx.table_config.update({
        where: { ConfigID: cfg.ConfigID },
        data: { Config: effective },
      });
    }
  }, TX_OPTIONS);
  console.log(`\n✅ applied: ${plan.updates.length} timeslot row(s) updated${configChanged ? ", table_config.Config updated" : ""}`);
  await invalidatePublicCache(["static_data", "stats"]);
  console.log("   public cache invalidated (no-op without Accelerate)");
}

main()
  .catch((e) => {
    console.error("\n❌", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
