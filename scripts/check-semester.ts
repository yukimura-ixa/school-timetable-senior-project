/**
 * Quick script to check if semester exists in database
 * Usage: pnpm tsx scripts/check-semester.ts 1-2567
 */

import prisma from "../src/lib/prisma";

async function checkSemester(configId: string) {
  try {
    const [semStr, yearStr] = configId.split('-');
    const semester = Number(semStr);
    const year = Number(yearStr);
    
    console.log(`\n🔍 Checking semester: ${configId}`);
    console.log(`   Semester: ${semester}, Year: ${year}`);
    
    // Check table_config
    const config = await prisma.table_config.findFirst({
      where: {
        ConfigID: configId
      }
    });
    
    if (config) {
      console.log('✅ Semester EXISTS in table_config');
      console.log(`   Status: ${config.status}`);
      console.log(`   Completeness: ${config.configCompleteness}%`);
      console.log(`   Academic Year: ${config.AcademicYear}`);
      console.log(`   Semester: ${config.Semester}`);
    } else {
      console.log('❌ Semester NOT FOUND in table_config');
      console.log('   Run `pnpm db:seed` to create sample data');
    }
    
    // Check timeslots count
    const semesterEnum = semester === 1 ? 'SEMESTER_1' : 'SEMESTER_2';
    const timeslotCount = await prisma.timeslot.count({
      where: {
        AcademicYear: year,
        Semester: semesterEnum
      }
    });
    
    console.log(`\n📅 Timeslots found: ${timeslotCount}`);
    
    // Check class schedules
    const scheduleCount = await prisma.class_schedule.count({
      where: {
        timeslot: {
          AcademicYear: year,
          Semester: semesterEnum
        }
      }
    });
    
    console.log(`📚 Class schedules: ${scheduleCount}`);
    
    if (!config) {
      console.log('\n💡 To fix: Run `pnpm db:seed` to populate the database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const semesterId = process.argv[2] || '1-2567';
checkSemester(semesterId);
