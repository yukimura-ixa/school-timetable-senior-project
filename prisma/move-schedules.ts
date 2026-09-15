/**
 * Move every class_schedule row of one subject from one slot to another
 * (same term), keeping ClassID, GradeID, RoomID, IsLocked and the teacher
 * links. Built for relocating a locked school-wide activity (e.g. ACT-CLUB
 * for all junior grades) after a new slot was appended with
 * remap-timeslot-slots.ts.
 *
 * Usage (dry-run is the default; nothing is written without --apply):
 *   pnpm dotenv -e .env.prod-ops.local -- tsx prisma/move-schedules.ts \
 *     --config 1-2568 --subject ACT-CLUB --from TUE5 --to TUE10
 *   ... --grades M1-1,M1-2,M1-3            # optional subset
 *   ... --apply
 *
 * --from / --to are DAY+period suffixes of a TimeslotID (TUE5 → 1-2568-TUE5).
 *
 * Aborts before writing when the target timeslot does not exist, is a
 * universal break, or any moved row would collide at the target: the grade
 * already has a class there, one of its teachers already teaches there, or
 * its room is already in use there.
 */

/* eslint-disable no-console */

import prisma from "../src/lib/prisma";
import { invalidatePublicCache } from "../src/lib/cache-invalidation";

type Args = {
  configId: string;
  subject: string;
  from: string;
  to: string;
  grades?: string[];
  apply: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> & { apply: boolean } = { apply: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === "--apply") args.apply = true;
    else if (a === "--config") args.configId = next();
    else if (a === "--subject") args.subject = next();
    else if (a === "--from") args.from = next();
    else if (a === "--to") args.to = next();
    else if (a === "--grades") args.grades = next().split(",").map((g) => g.trim()).filter(Boolean);
    else throw new Error(`Unknown argument ${a}`);
  }
  for (const k of ["configId", "subject", "from", "to"] as const) {
    if (!args[k]) throw new Error(`--${k === "configId" ? "config" : k} is required`);
  }
  for (const k of ["from", "to"] as const) {
    if (!/^(MON|TUE|WED|THU|FRI|SAT|SUN)\d+$/.test(args[k]!)) {
      throw new Error(`--${k} must look like TUE5, got "${args[k]}"`);
    }
  }
  return args as Args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(
    args.apply
      ? "🚀 APPLY mode — rows will be moved in one transaction"
      : "🔍 DRY-RUN (default) — no writes; pass --apply to commit",
  );

  const fromId = `${args.configId}-${args.from}`;
  const toId = `${args.configId}-${args.to}`;
  const [fromSlot, toSlot] = await Promise.all([
    prisma.timeslot.findUnique({ where: { TimeslotID: fromId } }),
    prisma.timeslot.findUnique({ where: { TimeslotID: toId } }),
  ]);
  if (!fromSlot) throw new Error(`timeslot ${fromId} not found`);
  if (!toSlot) throw new Error(`timeslot ${toId} not found`);
  if (toSlot.Breaktime === "BREAK" || toSlot.Breaktime === "BREAK_BOTH") {
    throw new Error(`${toId} is a universal break (${toSlot.Breaktime})`);
  }
  const clock = (d: Date) => d.toISOString().slice(11, 16);
  console.log(`\n📋 ${args.configId}: ${args.subject}  ${fromId} (${clock(fromSlot.StartTime)}-${clock(fromSlot.EndTime)}) → ${toId} (${clock(toSlot.StartTime)}-${clock(toSlot.EndTime)}, ${toSlot.Breaktime})`);

  const rows = await prisma.class_schedule.findMany({
    where: {
      TimeslotID: fromId,
      SubjectCode: args.subject,
      ...(args.grades ? { GradeID: { in: args.grades } } : {}),
    },
    include: { teachers_responsibility: { select: { TeacherID: true } }, room: { select: { RoomName: true } } },
    orderBy: { GradeID: "asc" },
  });
  if (rows.length === 0) throw new Error(`no ${args.subject} rows at ${fromId}`);
  if (args.grades) {
    const missing = args.grades.filter((g) => !rows.some((r) => r.GradeID === g));
    if (missing.length) throw new Error(`no ${args.subject} row at ${fromId} for: ${missing.join(", ")}`);
  }

  const atTarget = await prisma.class_schedule.findMany({
    where: { TimeslotID: toId },
    include: { teachers_responsibility: { select: { TeacherID: true } } },
  });
  const gradesAtTarget = new Set(atTarget.map((r) => r.GradeID));
  const roomsAtTarget = new Set(atTarget.map((r) => r.RoomID).filter((r): r is number => r !== null));
  const teachersAtTarget = new Map<number, string>();
  for (const r of atTarget) for (const t of r.teachers_responsibility) teachersAtTarget.set(t.TeacherID, r.GradeID);

  const problems: string[] = [];
  console.log(`\n   ${rows.length} row(s) to move:`);
  for (const r of rows) {
    const teachers = r.teachers_responsibility.map((t) => t.TeacherID);
    console.log(`     ClassID ${String(r.ClassID).padEnd(6)} ${r.GradeID.padEnd(6)} ${r.SubjectCode}  room=${r.room?.RoomName ?? "-"}  teachers=${teachers.join(",") || "-"}  locked=${r.IsLocked}`);
    if (gradesAtTarget.has(r.GradeID)) problems.push(`${r.GradeID}: already has a class at ${toId}`);
    if (r.RoomID !== null && roomsAtTarget.has(r.RoomID)) problems.push(`${r.GradeID}: room ${r.room?.RoomName} already used at ${toId}`);
    for (const t of teachers) {
      const busyWith = teachersAtTarget.get(t);
      if (busyWith) problems.push(`${r.GradeID}: teacher ${t} already teaches ${busyWith} at ${toId}`);
    }
  }
  if (problems.length) {
    for (const p of problems) console.error(`   ❌ ${p}`);
    throw new Error(`${problems.length} collision(s) at ${toId} — aborting`);
  }
  console.log(`   no collisions at ${toId}`);

  if (!args.apply) {
    console.log("\n(dry-run: no writes)");
    return;
  }

  const ids = rows.map((r) => r.ClassID);
  await prisma.$transaction(async (tx) => {
    const res = await tx.class_schedule.updateMany({
      where: { ClassID: { in: ids }, TimeslotID: fromId },
      data: { TimeslotID: toId },
    });
    if (res.count !== ids.length) {
      throw new Error(`moved ${res.count} of ${ids.length} rows; rolling back`);
    }
  });
  console.log(`\n✅ applied: ${ids.length} row(s) now at ${toId}`);
  await invalidatePublicCache(["static_data", "stats"]);
  console.log("   public cache invalidated (no-op without Accelerate)");
}

main()
  .catch((e) => {
    console.error("\n❌", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
