/**
 * Fix script for TimeslotID Format Inconsistency
 *
 * Problem: 1/2568 timeslots have wrong format "1-2568-FRI-1" instead of "1-2568-FRI1"
 * Solution: Delete existing 1/2568 timeslots and recreate with correct format
 *
 * Since there are 0 schedules for 1/2568, this is safe to do.
 *
 * Usage:
 *   pnpm tsx scripts/fix-timeslot-format.ts --dry-run   # Preview
 *   pnpm tsx scripts/fix-timeslot-format.ts             # Actually fix
 */

import {
  PrismaClient,
  semester,
  day_of_week,
  breaktime,
} from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

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

// Standard periods configuration (matches seed.ts)
const STANDARD_PERIODS = [
  { start: "08:30", end: "09:20", break: "NOT_BREAK" },
  { start: "09:20", end: "10:10", break: "NOT_BREAK" },
  { start: "10:10", end: "11:00", break: "NOT_BREAK" },
  { start: "11:00", end: "11:50", break: "NOT_BREAK" },
  { start: "12:50", end: "13:40", break: "BREAK_JUNIOR" },
  { start: "13:40", end: "14:30", break: "BREAK_SENIOR" },
  { start: "14:30", end: "15:20", break: "NOT_BREAK" },
  { start: "15:20", end: "16:10", break: "NOT_BREAK" },
];

const SCHOOL_DAYS: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];

async function generateCorrectTimeslots(academicYear: number, sem: semester) {
  const semesterNum = sem === "SEMESTER_1" ? 1 : 2;
  const timeslots = [];

  for (const day of SCHOOL_DAYS) {
    for (let periodNum = 1; periodNum <= STANDARD_PERIODS.length; periodNum++) {
      const period = STANDARD_PERIODS[periodNum - 1];
      if (!period) continue;

      timeslots.push({
        // Correct format: no hyphen before period number
        TimeslotID: `${semesterNum}-${academicYear}-${day}${periodNum}`,
        AcademicYear: academicYear,
        Semester: sem,
        StartTime: new Date(`2024-01-01T${period.start}:00`),
        EndTime: new Date(`2024-01-01T${period.end}:00`),
        Breaktime: period.break as breaktime,
        DayOfWeek: day,
      });
    }
  }

  return timeslots;
}

async function fixTimeslotFormat(dryRun: boolean) {
  const targetYear = 2568;
  const targetSem: semester = "SEMESTER_1";

  console.log(
    `🔍 Checking timeslots for ${targetSem === "SEMESTER_1" ? 1 : 2}/${targetYear}...\n`,
  );

  // Check if there are schedules (should be 0)
  const scheduleCount = await prisma.class_schedule.count({
    where: {
      timeslot: {
        AcademicYear: targetYear,
        Semester: targetSem,
      },
    },
  });

  if (scheduleCount > 0) {
    console.error(`❌ Found ${scheduleCount} schedules for 1/${targetYear}!`);
    console.error(
      "   Cannot safely delete timeslots with schedule references.",
    );
    console.error(
      "   Please delete schedules first or use a different approach.",
    );
    process.exit(1);
  }

  console.log(`   ✅ No schedules for 1/${targetYear} - safe to proceed.\n`);

  // Get existing timeslots
  const existingTimeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: targetYear,
      Semester: targetSem,
    },
    select: {
      TimeslotID: true,
      DayOfWeek: true,
    },
    orderBy: { TimeslotID: "asc" },
  });

  console.log(`📋 Existing timeslots: ${existingTimeslots.length}`);
  if (existingTimeslots.length > 0) {
    console.log(
      `   Sample: ${existingTimeslots
        .slice(0, 5)
        .map((t) => t.TimeslotID)
        .join(", ")}`,
    );

    // Check if format is wrong
    const hasWrongFormat = existingTimeslots.some((t) =>
      t.TimeslotID.includes("-", 7),
    ); // Has hyphen after day
    console.log(
      `   Format issue: ${hasWrongFormat ? "YES (has extra hyphen)" : "NO (format OK)"}\n`,
    );

    if (!hasWrongFormat) {
      console.log(
        "✅ TimeslotIDs already have correct format. Nothing to fix.",
      );
      return;
    }
  }

  // Generate correct timeslots
  const correctTimeslots = await generateCorrectTimeslots(
    targetYear,
    targetSem,
  );
  console.log(
    `📝 Will create ${correctTimeslots.length} timeslots with correct format:`,
  );
  console.log(
    `   Sample: ${correctTimeslots
      .slice(0, 5)
      .map((t) => t.TimeslotID)
      .join(", ")}\n`,
  );

  if (dryRun) {
    console.log("⚠️  DRY RUN - No changes made.");
    console.log("   Run without --dry-run to apply the fix.");
    return;
  }

  console.log("🗑️  Deleting existing timeslots...");
  const deleted = await prisma.timeslot.deleteMany({
    where: {
      AcademicYear: targetYear,
      Semester: targetSem,
    },
  });
  console.log(`   ✓ Deleted ${deleted.count} timeslots\n`);

  console.log("📦 Creating timeslots with correct format...");
  await prisma.timeslot.createMany({
    data: correctTimeslots,
    skipDuplicates: true,
  });
  console.log(`   ✓ Created ${correctTimeslots.length} timeslots\n`);

  console.log("✅ TimeslotID format fix complete!");
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("═══════════════════════════════════════════════════════");
  console.log("  Fix TimeslotID Format Inconsistency");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(
    `📡 Database: ${isAccelerate ? "Prisma Accelerate" : "Direct PostgreSQL"}\n`,
  );

  if (dryRun) {
    console.log("🔒 Running in DRY RUN mode (no changes will be made)\n");
  } else {
    console.log("⚠️  Running in LIVE mode (timeslots will be recreated!)\n");
  }

  try {
    await fixTimeslotFormat(dryRun);
  } catch (error) {
    console.error("❌ Error during fix:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
