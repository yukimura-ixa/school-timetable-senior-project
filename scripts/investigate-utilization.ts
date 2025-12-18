/**
 * Investigation script for BUG-9: All Utilization Shows 0%
 *
 * This script checks the data state for semester 1/2568 to understand
 * why utilization might show 0%.
 *
 * Usage:
 *   pnpm tsx scripts/investigate-utilization.ts
 */

import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

const isAccelerate = connectionString.startsWith("prisma+");

// Create PrismaClient conditionally
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

async function investigateSemester(semester: 1 | 2, year: number) {
  console.log(`\n📅 Semester ${semester}/${year}:\n`);

  const semesterEnum = `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2";

  // 1. Check timeslots exist
  const timeslotCount = await prisma.timeslot.count({
    where: {
      AcademicYear: year,
      Semester: semesterEnum,
    },
  });
  console.log(`   Timeslots: ${timeslotCount}`);

  // 2. Check class_schedule records
  const scheduleCount = await prisma.class_schedule.count({
    where: {
      timeslot: {
        AcademicYear: year,
        Semester: semesterEnum,
      },
    },
  });
  console.log(`   Class Schedules: ${scheduleCount}`);

  // 3. Check if timeslotIDs are correctly formatted
  if (timeslotCount > 0) {
    const sampleTimeslots = await prisma.timeslot.findMany({
      where: {
        AcademicYear: year,
        Semester: semesterEnum,
      },
      take: 5,
      select: {
        TimeslotID: true,
        DayOfWeek: true,
      },
    });
    console.log(
      `   Sample TimeslotIDs: ${sampleTimeslots.map((t) => t.TimeslotID).join(", ")}`,
    );
  }

  // 4. Check table_config for this semester
  const configId = `${semester}-${year}`;
  const tableConfig = await prisma.table_config.findUnique({
    where: { ConfigID: configId },
  });
  console.log(
    `   Table Config (${configId}): ${tableConfig ? "EXISTS" : "NOT FOUND"}`,
  );

  return {
    timeslots: timeslotCount,
    schedules: scheduleCount,
    hasConfig: !!tableConfig,
  };
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  BUG-9 Investigation: 0% Utilization");
  console.log("═══════════════════════════════════════════════════════");

  console.log(
    `\n📡 Database: ${isAccelerate ? "Prisma Accelerate" : "Direct PostgreSQL"}\n`,
  );

  try {
    // Check multiple semesters to compare
    const semesters: Array<{ sem: 1 | 2; year: number }> = [
      { sem: 1, year: 2567 },
      { sem: 2, year: 2567 },
      { sem: 1, year: 2568 },
    ];

    const results: Array<{
      sem: string;
      timeslots: number;
      schedules: number;
      hasConfig: boolean;
    }> = [];

    for (const { sem, year } of semesters) {
      const result = await investigateSemester(sem, year);
      results.push({ sem: `${sem}/${year}`, ...result });
    }

    console.log("\n" + "─".repeat(55));
    console.log("📊 Summary:\n");

    console.log("   Semester    | Timeslots | Schedules | Config");
    console.log("   " + "─".repeat(47));
    for (const r of results) {
      const configIcon = r.hasConfig ? "✅" : "❌";
      console.log(
        `   ${r.sem.padEnd(11)} | ${r.timeslots.toString().padStart(9)} | ${r.schedules.toString().padStart(9)} | ${configIcon}`,
      );
    }

    // Diagnosis
    console.log("\n💡 Diagnosis:\n");

    const target = results.find((r) => r.sem === "1/2568");
    if (target) {
      if (target.timeslots === 0) {
        console.log("   ⚠️  Semester 1/2568 has NO timeslots!");
        console.log(
          "      → Need to run seed or create timeslots for this semester.",
        );
      } else if (target.schedules === 0) {
        console.log("   ⚠️  Semester 1/2568 has timeslots but NO schedules!");
        console.log(
          "      → This is likely intentional if schedules haven't been created yet.",
        );
        console.log(
          "      → Consider adding empty state messaging in the analytics UI.",
        );
      } else {
        console.log("   ✅ Semester 1/2568 has both timeslots and schedules.");
        console.log(
          "      → The issue may be in the analytics calculation logic.",
        );
      }

      if (!target.hasConfig) {
        console.log("\n   ⚠️  No table_config for 1-2568!");
        console.log(
          "      → This may prevent the analytics from calculating correctly.",
        );
      }
    }
  } catch (error) {
    console.error("❌ Error during investigation:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
