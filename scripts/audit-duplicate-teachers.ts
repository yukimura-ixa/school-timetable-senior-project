/**
 * Audit script for BUG-7: Duplicate Teacher Records
 *
 * This script identifies duplicate teacher records in the database
 * (teachers with identical Firstname + Lastname combinations).
 *
 * Usage:
 *   pnpm tsx scripts/audit-duplicate-teachers.ts
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

interface DuplicateGroup {
  name: string;
  count: number;
  teachers: TeacherWithCount[];
}

async function findDuplicateTeachers(): Promise<DuplicateGroup[]> {
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

  // Filter to only duplicates (count > 1)
  const duplicates: DuplicateGroup[] = [];
  for (const [name, teachers] of groupedByName.entries()) {
    if (teachers.length > 1) {
      duplicates.push({
        name,
        count: teachers.length,
        teachers,
      });
    }
  }

  return duplicates.sort((a, b) => b.count - a.count);
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  BUG-7 Audit: Duplicate Teacher Records");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(
    `📡 Database: ${isAccelerate ? "Prisma Accelerate" : "Direct PostgreSQL"}\n`,
  );

  console.log("🔍 Searching for duplicate teachers...\n");

  try {
    const duplicates = await findDuplicateTeachers();

    if (duplicates.length === 0) {
      console.log("✅ No duplicate teacher records found!");
      return;
    }

    console.log(`Found ${duplicates.length} name(s) with duplicate records:\n`);

    let totalDuplicates = 0;
    for (const group of duplicates) {
      console.log(`\n📋 "${group.name}" - ${group.count} records:`);
      for (const teacher of group.teachers) {
        const respCount = teacher._count.teachers_responsibility;
        const status =
          respCount > 0 ? `🔗 ${respCount} assignments` : "⚪ No assignments";
        console.log(
          `   ID: ${teacher.TeacherID.toString().padStart(4)} | ${teacher.Prefix || ""}${teacher.Firstname} ${teacher.Lastname} | ${status}`,
        );
      }
      totalDuplicates += group.count - 1; // Count excess duplicates
    }

    console.log("\n" + "─".repeat(55));
    console.log(`📊 Summary:`);
    console.log(`   - Duplicate groups: ${duplicates.length}`);
    console.log(`   - Total duplicate records to merge: ${totalDuplicates}`);

    console.log("\n💡 Recommendation:");
    console.log(
      "   For each group, keep the teacher with the most assignments",
    );
    console.log("   and migrate references from the others, then delete.");
  } catch (error) {
    console.error("❌ Error during audit:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
