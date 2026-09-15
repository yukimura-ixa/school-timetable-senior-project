/**
 * Change a term's slot list (insert real break slots, change durations /
 * start time) WITHOUT losing its schedules: timeslot rows are regenerated from
 * the new config and every class_schedule row is repointed to the slot its
 * period moved to. Companion to repair-timeslot-rows.ts, which only handles
 * the same-count case.
 *
 * Usage (dry-run is the default; nothing is written without --apply):
 *   pnpm dotenv -e .env.production -- tsx prisma/remap-timeslot-slots.ts \
 *     --config 1-2568 --start 08:30 \
 *     --slots 50,15:*,50,50,50:junior,50:senior,50,50,50 --inserted 2
 *   ... --apply
 *
 * --slots     the complete NEW slot list (see prisma/lib/slot-args.ts for tokens)
 * --inserted  NEW slot numbers that have no old counterpart. Old periods keep
 *             their order and fill the remaining positions (8 old + 1 inserted
 *             = 9 new → old 2..8 become 3..9). Inserted slots receive no
 *             schedules, so they must be breaks nobody is scheduled in.
 * --start     optional new StartTime (defaults to the stored one)
 * --tz        see pinProcessTz
 *
 * Breaktime: each moved row keeps the Breaktime it had (legacy terms carry
 * BREAK_JUNIOR / BREAK_SENIOR and several dashboard readers still key off
 * them); inserted slots get what generateTimeslots emits. Pass
 * --canonical-breaktime to regenerate every row's Breaktime instead
 * (NOT_BREAK for staggered breaks, BREAK for universal — the Phase 2A shape).
 *
 * Aborts before writing when: slot counts do not add up, an inserted slot is
 * not a break, a break group name has no break_group row, any class_schedule
 * id fails to parse or maps onto a slot the config does not generate, a
 * schedule would land on a universal break, or a moved row's clock would jump
 * by ≥ 3h (process-TZ mismatch — see pinProcessTz; re-run with --tz).
 *
 * Mechanics (one transaction, see migration-slots-realbreaks.ts): stage new
 * rows under temp ids → repoint class_schedule (one VALUES-join UPDATE per
 * pass — Accelerate caps interactive transactions at 15s on the free plan,
 * so no per-id round trips) → delete old rows (cascade hits nothing) →
 * create final rows → repoint to final ids → drop temp rows → write Config.
 * Then the Accelerate public cache is invalidated the way the app does it.
 *
 * Back up first: pnpm dotenv -e .env.production -- tsx scripts/db-backup.ts
 */

/* eslint-disable no-console */

import {
  assertClock,
  describeSlots,
  parseIntList,
  parseSlots,
  pinProcessTz,
} from "./lib/slot-args";

pinProcessTz(process.argv);

import { Prisma, type day_of_week } from "../prisma/generated/client";
import prisma from "../src/lib/prisma";
import { invalidatePublicCache } from "../src/lib/cache-invalidation";
import { generateTimeslots } from "../src/features/timeslot/domain/services/timeslot.service";
import {
  clockDistance,
  planSlotNumberRemap,
  remapTimeslotIdWith,
  utcClock,
} from "../src/features/timeslot/domain/services/timeslot-repair.service";
import { parseConfigData } from "../src/features/config/domain/types/config-data.types";
import type { ConfigData } from "../src/features/config/domain/types/config-data.types";
import type { SlotConfig } from "../src/features/timeslot/domain/models/break.types";

const TEMP_PREFIX = "__remap__";
// Real bell-time corrections are a few tens of minutes; anything ≥ 3h is a TZ artefact.
const MAX_BELL_TIME_MOVE_MINUTES = 180;
// Accelerate free plan caps interactive transactions at 15s; keep headroom.
const TX_OPTIONS = { timeout: 14_000, maxWait: 5_000 };

type Args = {
  configId: string;
  apply: boolean;
  canonicalBreaktime: boolean;
  start?: string;
  slots: SlotConfig[];
  inserted: number[];
};

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> & Pick<Args, "apply" | "canonicalBreaktime" | "inserted"> = {
    apply: false,
    canonicalBreaktime: false,
    inserted: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === "--apply") args.apply = true;
    else if (a === "--canonical-breaktime") args.canonicalBreaktime = true;
    else if (a === "--config") args.configId = next();
    else if (a === "--start") args.start = next();
    else if (a === "--slots") args.slots = parseSlots(next());
    else if (a === "--inserted") args.inserted = parseIntList(next(), "--inserted");
    else if (a === "--tz") next(); // consumed by pinProcessTz
    else throw new Error(`Unknown argument ${a}`);
  }
  if (!args.configId) throw new Error("--config <ConfigID> is required (e.g. --config 1-2568)");
  if (!args.slots) throw new Error("--slots <complete new slot list> is required");
  assertClock(args.start, "--start");
  return args as Args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(
    args.apply
      ? "🚀 APPLY mode — rows regenerated + schedules repointed in one transaction"
      : "🔍 DRY-RUN (default) — no writes; pass --apply to commit",
  );

  const cfg = await prisma.table_config.findUnique({ where: { ConfigID: args.configId } });
  if (!cfg) throw new Error(`table_config ${args.configId} not found`);
  const stored = parseConfigData(cfg.Config);
  const effective: ConfigData = {
    Days: stored.Days,
    StartTime: args.start ?? stored.StartTime,
    slots: args.slots,
  };

  console.log(`\n📋 ${cfg.ConfigID} (${cfg.AcademicYear}/${cfg.Semester}) status=${cfg.status}`);
  console.log(`   stored config: StartTime=${stored.StartTime}  slots: ${describeSlots(stored.slots)}`);
  console.log(`   new config:    StartTime=${effective.StartTime}  slots: ${describeSlots(effective.slots)}`);
  console.log(`   inserted new slots: ${args.inserted.join(", ") || "none"}`);

  for (const n of args.inserted) {
    const slot = effective.slots[n - 1];
    if (!slot?.breakGroups?.length) {
      throw new Error(`inserted slot ${n} is a teaching slot — inserted slots must be breaks (nothing can be scheduled there)`);
    }
  }

  const breakGroups = await prisma.break_group.findMany({ where: { ConfigID: cfg.ConfigID } });
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
  const perDay = new Map<string, number>();
  for (const r of existing) perDay.set(r.DayOfWeek, (perDay.get(r.DayOfWeek) ?? 0) + 1);
  const oldCounts = new Set(perDay.values());
  if (oldCounts.size !== 1) {
    throw new Error(`Days have different slot counts: ${[...perDay].map(([d, n]) => `${d}=${n}`).join(" ")}`);
  }
  const oldSlotCount = [...oldCounts][0] ?? 0;
  console.log(`   timeslot rows in DB: ${existing.length} (${oldSlotCount}/day over ${perDay.size} days)`);
  const firstRow = existing[0];
  if (firstRow) {
    console.log(`   raw first row: ${firstRow.TimeslotID} StartTime=${firstRow.StartTime.toISOString()}  (comparing under TZ=${process.env.TZ})`);
  }

  const periodMap = planSlotNumberRemap(oldSlotCount, effective.slots.length, args.inserted);
  console.log(`   period map: ${[...periodMap].map(([o, n]) => `${o}→${n}`).join(" ")}`);

  // New rows: times from the config; Breaktime carried over from the row that
  // moves here unless --canonical-breaktime. Moved rows also feed the TZ guard.
  const inverseMap = new Map([...periodMap].map(([oldP, newP]) => [newP, oldP]));
  const existingById = new Map(existing.map((r) => [r.TimeslotID, r]));
  let maxMove = 0;
  let breaktimeCarried = 0;
  const generated = generateTimeslots({
    AcademicYear: cfg.AcademicYear,
    Semester: cfg.Semester,
    Days: effective.Days as day_of_week[],
    StartTime: effective.StartTime,
    slots: effective.slots,
  }).map((t) => {
    const period = Number(t.TimeslotID.match(/(\d+)$/)?.[1]);
    if (!inverseMap.has(period)) return t;
    const oldId = remapTimeslotIdWith(t.TimeslotID, inverseMap);
    const old = existingById.get(oldId);
    if (!old) throw new Error(`${t.TimeslotID} should inherit from ${oldId}, which does not exist`);
    maxMove = Math.max(
      maxMove,
      clockDistance(utcClock(old.StartTime), utcClock(t.StartTime)),
      clockDistance(utcClock(old.EndTime), utcClock(t.EndTime)),
    );
    if (args.canonicalBreaktime || old.Breaktime === t.Breaktime) return t;
    breaktimeCarried++;
    return { ...t, Breaktime: old.Breaktime };
  });
  const generatedById = new Map(generated.map((t) => [t.TimeslotID, t]));
  console.log(`   rows to generate: ${generated.length} (${breaktimeCarried} keep a legacy Breaktime${args.canonicalBreaktime ? ", --canonical-breaktime" : ""})`);
  const monday = generated.filter((t) => t.DayOfWeek === generated[0]?.DayOfWeek);
  for (const t of monday) {
    const period = Number(t.TimeslotID.match(/(\d+)$/)?.[1]);
    const oldP = inverseMap.get(period);
    const old = oldP === undefined ? undefined : existingById.get(remapTimeslotIdWith(t.TimeslotID, inverseMap));
    const was = old ? `was ${utcClock(old.StartTime)}-${utcClock(old.EndTime)} ${old.Breaktime}` : "new";
    console.log(`     ${t.TimeslotID.padEnd(14)} ${utcClock(t.StartTime)}-${utcClock(t.EndTime)}  ${t.Breaktime.padEnd(12)} (${was})`);
  }
  if (maxMove >= MAX_BELL_TIME_MOVE_MINUTES) {
    throw new Error(
      `A moved row's clock would jump by ${maxMove} min — bell-time changes are minutes, a multi-hour jump means a process-TZ mismatch. ` +
        `Rows were probably written under TZ=${process.env.TZ === "UTC" ? "Asia/Bangkok" : "UTC"}; check the raw first row above and re-run with --tz <that zone>.`,
    );
  }

  const schedules = await prisma.class_schedule.findMany({
    where: { timeslot: { AcademicYear: cfg.AcademicYear, Semester: cfg.Semester } },
    select: { ClassID: true, TimeslotID: true, IsLocked: true },
  });
  const idMap = new Map<string, string>();
  const problems: string[] = [];
  for (const s of schedules) {
    let newId: string;
    try {
      newId = remapTimeslotIdWith(s.TimeslotID, periodMap);
    } catch (e) {
      problems.push(e instanceof Error ? e.message : String(e));
      continue;
    }
    const target = generatedById.get(newId);
    if (!target) problems.push(`${s.TimeslotID} → ${newId}: config does not generate that slot`);
    else if (target.Breaktime === "BREAK" || target.Breaktime === "BREAK_BOTH") {
      problems.push(`${s.TimeslotID} → ${newId}: lands on a universal break`);
    }
    idMap.set(s.TimeslotID, newId);
  }
  const lockedCount = schedules.filter((s) => s.IsLocked).length;
  console.log(`   class_schedule rows to repoint: ${schedules.length} (${lockedCount} locked) across ${idMap.size} distinct old ids`);
  const sample = [...idMap.entries()].slice(0, 5).map(([o, n]) => `${o}→${n}`);
  if (sample.length) console.log(`   sample: ${sample.join(", ")}`);
  if (problems.length) {
    for (const p of [...new Set(problems)].slice(0, 10)) console.error(`   ❌ ${p}`);
    throw new Error(`${problems.length} class_schedule row(s) cannot be remapped — aborting`);
  }

  if (!args.apply) {
    console.log("\n(dry-run: no writes)");
    return;
  }

  await prisma.$transaction(async (tx) => {
    const rowData = (prefix: string) =>
      generated.map((t) => ({
        TimeslotID: `${prefix}${t.TimeslotID}`,
        AcademicYear: t.AcademicYear,
        Semester: t.Semester,
        StartTime: t.StartTime,
        EndTime: t.EndTime,
        Breaktime: t.Breaktime,
        DayOfWeek: t.DayOfWeek,
      }));

    // One UPDATE per pass: class_schedule joined to a VALUES list of (from, to).
    const repoint = async (pairs: [string, string][]) => {
      if (pairs.length === 0) return 0;
      const rows = pairs.map(([from, to]) => Prisma.sql`(${from}, ${to})`);
      return tx.$executeRaw`
        UPDATE "class_schedule" AS cs
        SET "TimeslotID" = m.to_id
        FROM (VALUES ${Prisma.join(rows)}) AS m(from_id, to_id)
        WHERE cs."TimeslotID" = m.from_id`;
    };

    await tx.timeslot.createMany({ data: rowData(TEMP_PREFIX) });
    const toTemp = await repoint([...idMap].map(([o, n]) => [o, `${TEMP_PREFIX}${n}`]));
    if (toTemp !== schedules.length) {
      throw new Error(`repointed ${toTemp} of ${schedules.length} schedules to temp ids; rolling back`);
    }
    await tx.timeslot.deleteMany({
      where: {
        AcademicYear: cfg.AcademicYear,
        Semester: cfg.Semester,
        TimeslotID: { not: { startsWith: TEMP_PREFIX } },
      },
    });
    await tx.timeslot.createMany({ data: rowData("") });
    const toFinal = await repoint([...new Set(idMap.values())].map((n) => [`${TEMP_PREFIX}${n}`, n]));
    if (toFinal !== schedules.length) {
      throw new Error(`repointed ${toFinal} of ${schedules.length} schedules to final ids; rolling back`);
    }
    await tx.timeslot.deleteMany({
      where: {
        AcademicYear: cfg.AcademicYear,
        Semester: cfg.Semester,
        TimeslotID: { startsWith: TEMP_PREFIX },
      },
    });
    await tx.table_config.update({
      where: { ConfigID: cfg.ConfigID },
      data: { Config: effective },
    });

    const after = await tx.class_schedule.count({
      where: { timeslot: { AcademicYear: cfg.AcademicYear, Semester: cfg.Semester } },
    });
    if (after !== schedules.length) {
      throw new Error(`class_schedule count changed ${schedules.length} → ${after}; rolling back`);
    }
  }, TX_OPTIONS);

  console.log(`\n✅ applied: ${generated.length} timeslot rows, ${schedules.length} schedules repointed, Config updated`);
  await invalidatePublicCache(["static_data", "stats"]);
  console.log("   public cache invalidated (no-op without Accelerate)");
}

main()
  .catch((e) => {
    console.error("\n❌", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
