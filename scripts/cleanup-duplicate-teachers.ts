/**
 * Cleanup script for BUG-7: Duplicate Teacher Records
 *
 * This script removes duplicate teacher records that have no assignments,
 * keeping the ones with actual schedule assignments.
 *
 * Usage:
 *   pnpm tsx scripts/cleanup-duplicate-teachers.ts --dry-run   # Preview
 *   pnpm tsx scripts/cleanup-duplicate-teachers.ts             # Actually delete
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

interface TeacherWithCount {
  TeacherID: number;
  Prefix: string | null;
  Firstname: string;
  Lastname: string;
  _count: {
    teachers_responsibility: number;
  };
}

async function findDuplicatesToDelete(): Promise<TeacherWithCount[]> {
  // Get all teachers with their responsibility counts
  const allTeachers = await prisma.teacher.findMany({
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
    orderBy: [{ Firstname: "asc" }, { Lastname: "asc" }],
  });

  // Group by Firstname + Lastname
  const groupedByName = new Map<string, TeacherWithCount[]>();

  for (const teacher of allTeachers) {
    const key = `${teacher.Firstname} ${teacher.Lastname}`;
    const group = groupedByName.get(key) || [];
    group.push(teacher);
    groupedByName.set(key, group);
  }

  // For each duplicate group, find the teachers WITHOUT assignments to delete
  const toDelete: TeacherWithCount[] = [];

  for (const [_name, teachers] of groupedByName.entries()) {
    if (teachers.length > 1) {
      // Sort by responsibility count (descending) - keep the one with most assignments
      const sorted = [...teachers].sort(
        (a, b) =>
          b._count.teachers_responsibility - a._count.teachers_responsibility,
      );

      // Keep the first one (most assignments), mark others for deletion
      // But only delete those with NO assignments to be safe
      for (let i = 1; i < sorted.length; i++) {
        const teacher = sorted[i];
        if (teacher && teacher._count.teachers_responsibility === 0) {
          toDelete.push(teacher);
        }
      }
    }
  }

  return toDelete;
}

async function cleanupDuplicates(dryRun: boolean) {
  console.log("🔍 Finding duplicate teachers to clean up...\n");

  const toDelete = await findDuplicatesToDelete();

  if (toDelete.length === 0) {
    console.log("✅ No safe duplicates to delete (all have assignments).");
    return;
  }

  console.log(
    `Found ${toDelete.length} duplicate teachers with NO assignments:\n`,
  );

  for (const teacher of toDelete) {
    console.log(
      `  - ID: ${teacher.TeacherID} | ${teacher.Prefix || ""}${teacher.Firstname} ${teacher.Lastname}`,
    );
  }

  if (dryRun) {
    console.log("\n⚠️  DRY RUN - No data was deleted.");
    console.log("   Run without --dry-run to actually delete the data.");
    return;
  }

  console.log("\n🗑️  Deleting duplicate teachers...\n");

  const teacherIds = toDelete.map((t) => t.TeacherID);

  const deletedTeachers = await prisma.teacher.deleteMany({
    where: {
      TeacherID: { in: teacherIds },
    },
  });

  console.log(`  ✓ Deleted ${deletedTeachers.count} duplicate teachers`);
  console.log("\n✅ Duplicate teacher cleanup complete!");
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("═══════════════════════════════════════════════════════");
  console.log("  BUG-7 Cleanup: Duplicate Teacher Records");
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
    await cleanupDuplicates(dryRun);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
