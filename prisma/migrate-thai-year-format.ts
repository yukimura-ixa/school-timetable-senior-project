/**
 * Migration Script: Convert Year 7-12 to Thai School Year 1-6 (ม.1-ม.6)
 *
 * CRITICAL: This script modifies existing database data
 *
 * Changes:
 * - program.Year: 7→1, 8→2, 9→3, 10→4, 11→5, 12→6
 * - gradelevel.Year: 7→1, 8→2, 9→3, 10→4, 11→5, 12→6
 * - gradelevel.GradeID: "7-1"→"ม.1/1", "8-2"→"ม.2/2", etc.
 *
 * Thai School System Mapping:
 * - ม.ต้น (Junior): ม.1-ม.3 (Year 1-3)
 * - ม.ปลาย (Senior): ม.4-ม.6 (Year 4-6)
 *
 * Run: pnpm exec tsx prisma/migrate-thai-year-format.ts
 */

import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient();

/**
 * Convert international year (7-12) to Thai year (1-6)
 */
function convertToThaiYear(internationalYear: number): number {
  return internationalYear - 6; // 7→1, 8→2, ..., 12→6
}

/**
 * Generate new Thai-format GradeID
 * Format: "ม.{YEAR}/{SECTION}" (e.g., "ม.1/1", "ม.2/2")
 */
function generateThaiGradeID(year: number, section: number): string {
  const thaiYear = convertToThaiYear(year);
  return `ม.${thaiYear}/${section}`;
}

async function migrateThaiYearFormat() {
  console.log("🔄 Starting Thai Year Format Migration...\n");

  try {
    // Step 1: Fetch all grade levels to update
    console.log("📊 Step 1: Fetching grade levels...");
    const gradeLevels = await prisma.gradelevel.findMany({
      where: {
        Year: {
          gte: 7,
          lte: 12,
        },
      },
      orderBy: [{ Year: "asc" }, { Number: "asc" }],
    });

    console.log(`   Found ${gradeLevels.length} grade levels to migrate\n`);

    if (gradeLevels.length === 0) {
      console.log(
        "✅ No grade levels need migration (already in Thai format)\n",
      );
      return;
    }

    // Step 2: Update grade levels with new GradeID and Year
    console.log("📝 Step 2: Updating grade levels...");
    const gradeIDMapping: Record<string, string> = {};

    for (const grade of gradeLevels) {
      const newYear = convertToThaiYear(grade.Year);
      const newGradeID = generateThaiGradeID(grade.Year, grade.Number);

      // Store mapping for foreign key updates
      gradeIDMapping[grade.GradeID] = newGradeID;

      console.log(
        `   ${grade.GradeID} (Year ${grade.Year}) → ${newGradeID} (Year ${newYear})`,
      );

      // Update gradelevel
      await prisma.gradelevel.update({
        where: { GradeID: grade.GradeID },
        data: {
          GradeID: newGradeID,
          Year: newYear,
        },
      });
    }

    console.log(`   ✅ Updated ${gradeLevels.length} grade levels\n`);

    // Step 3: Update programs
    console.log("📝 Step 3: Updating programs...");
    const programs = await prisma.program.findMany({
      where: {
        Year: {
          gte: 7,
          lte: 12,
        },
      },
    });

    let programCount = 0;
    for (const program of programs) {
      const newYear = convertToThaiYear(program.Year);
      await prisma.program.update({
        where: { ProgramID: program.ProgramID },
        data: { Year: newYear },
      });
      console.log(
        `   ${program.ProgramCode}: Year ${program.Year} → ${newYear}`,
      );
      programCount++;
    }

    console.log(`   ✅ Updated ${programCount} programs\n`);

    // Step 4: Update class_schedule foreign keys
    console.log("📝 Step 4: Updating class schedules...");
    let scheduleCount = 0;
    for (const [oldGradeID, newGradeID] of Object.entries(gradeIDMapping)) {
      const updated = await prisma.class_schedule.updateMany({
        where: { GradeID: oldGradeID },
        data: { GradeID: newGradeID },
      });
      scheduleCount += updated.count;
    }
    console.log(`   ✅ Updated ${scheduleCount} class schedules\n`);

    // Step 5: Update teachers_responsibility foreign keys
    console.log("📝 Step 5: Updating teacher responsibilities...");
    let respCount = 0;
    for (const [oldGradeID, newGradeID] of Object.entries(gradeIDMapping)) {
      const updated = await prisma.teachers_responsibility.updateMany({
        where: { GradeID: oldGradeID },
        data: { GradeID: newGradeID },
      });
      respCount += updated.count;
    }
    console.log(`   ✅ Updated ${respCount} teacher responsibilities\n`);

    // Summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Migration Complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`   Grade Levels: ${gradeLevels.length} updated`);
    console.log(`   Programs: ${programCount} updated`);
    console.log(`   Class Schedules: ${scheduleCount} updated`);
    console.log(`   Teacher Responsibilities: ${respCount} updated`);
    console.log("\n📋 New Format:");
    console.log("   - Year: 1-6 (was 7-12)");
    console.log('   - GradeID: "ม.1/1", "ม.2/2", etc. (was "7-1", "8-2")');
    console.log("\n⚠️  Important:");
    console.log("   - Update seed scripts to use new format");
    console.log("   - Run: pnpm prisma generate");
    console.log("   - Restart dev server if running");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\n⚠️  Database may be in inconsistent state!");
    console.error("   Consider restoring from backup or running:");
    console.error("   pnpm prisma migrate reset --force");
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateThaiYearFormat().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
