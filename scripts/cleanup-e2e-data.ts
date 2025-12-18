/**
 * Cleanup script for BUG-6: E2E Test Data Pollution
 *
 * This script identifies and removes E2E test data that was accidentally
 * written to the production database.
 *
 * Usage:
 *   pnpm tsx scripts/cleanup-e2e-data.ts --dry-run   # Preview what would be deleted
 *   pnpm tsx scripts/cleanup-e2e-data.ts             # Actually delete the data
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

const E2E_PATTERNS = {
  teacher: {
    // Teachers with E2E- prefix in name
    prefixes: ["E2E-", "e2e-", "E2E_", "e2e_"],
  },
};

async function findE2ETeachers() {
  const teachers = await prisma.teacher.findMany({
    where: {
      OR: [
        ...E2E_PATTERNS.teacher.prefixes.map((prefix) => ({
          Firstname: { startsWith: prefix },
        })),
        ...E2E_PATTERNS.teacher.prefixes.map((prefix) => ({
          Lastname: { startsWith: prefix },
        })),
      ],
    },
    select: {
      TeacherID: true,
      Prefix: true,
      Firstname: true,
      Lastname: true,
      _count: {
        select: {
          teachers_responsibility: true,
        },
      },
    },
  });

  return teachers;
}

async function findRelatedData(teacherIds: number[]) {
  if (teacherIds.length === 0) return { responsibilities: 0 };

  const responsibilities = await prisma.teachers_responsibility.count({
    where: {
      TeacherID: { in: teacherIds },
    },
  });

  return { responsibilities };
}

async function cleanupE2EData(dryRun: boolean) {
  console.log("🔍 Searching for E2E test data...\n");

  // Find E2E teachers
  const e2eTeachers = await findE2ETeachers();

  if (e2eTeachers.length === 0) {
    console.log("✅ No E2E test data found in the database.");
    return;
  }

  console.log(`Found ${e2eTeachers.length} E2E teacher records:\n`);

  for (const teacher of e2eTeachers) {
    console.log(
      `  - ID: ${teacher.TeacherID} | ${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname} | Responsibilities: ${teacher._count.teachers_responsibility}`,
    );
  }

  const teacherIds = e2eTeachers.map((t) => t.TeacherID);
  const relatedData = await findRelatedData(teacherIds);

  console.log("\n📊 Related data that will be affected:");
  console.log(`  - Teacher responsibilities: ${relatedData.responsibilities}`);

  if (dryRun) {
    console.log("\n⚠️  DRY RUN - No data was deleted.");
    console.log("   Run without --dry-run to actually delete the data.");
    return;
  }

  console.log("\n🗑️  Cleaning up E2E test data...\n");

  // Delete in correct order (dependencies first)
  // 1. Delete teacher responsibilities
  const deletedResponsibilities =
    await prisma.teachers_responsibility.deleteMany({
      where: {
        TeacherID: { in: teacherIds },
      },
    });
  console.log(
    `  ✓ Deleted ${deletedResponsibilities.count} teacher responsibilities`,
  );

  // 2. Delete teachers
  const deletedTeachers = await prisma.teacher.deleteMany({
    where: {
      TeacherID: { in: teacherIds },
    },
  });
  console.log(`  ✓ Deleted ${deletedTeachers.count} teachers`);

  console.log("\n✅ E2E test data cleanup complete!");
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("═══════════════════════════════════════════════════════");
  console.log("  BUG-6 Cleanup: E2E Test Data Pollution");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(
    `📡 Database: ${isAccelerate ? "Prisma Accelerate" : "Direct PostgreSQL"}\n`,
  );

  if (dryRun) {
    console.log("🔒 Running in DRY RUN mode (no changes will be made)\n");
  } else {
    console.log("⚠️  Running in LIVE mode (data will be deleted!)\n");
  }

  try {
    await cleanupE2EData(dryRun);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
