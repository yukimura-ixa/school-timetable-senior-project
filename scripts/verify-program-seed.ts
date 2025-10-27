/**
 * Verification script to check program seed data
 * Shows programs grouped by Academic Year and Semester
 */

import { PrismaClient } from '../prisma/generated';

const prisma = new PrismaClient();

async function verifyProgramSeed() {
  console.log('🔍 Verifying Program Seed Data\n');
  console.log('='.repeat(80));
  
  // Get all programs ordered by AcademicYear, Semester, ProgramName
  const programs = await prisma.program.findMany({
    orderBy: [
      { AcademicYear: 'desc' },
      { Semester: 'asc' },
      { ProgramName: 'asc' }
    ],
    include: {
      _count: {
        select: {
          gradelevel: true
        }
      }
    }
  });
  
  console.log(`\n📊 Total Programs: ${programs.length}\n`);
  
  // Group by Academic Year
  const groupedByYear = programs.reduce((acc, program) => {
    const year = program.AcademicYear;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(program);
    return acc;
  }, {} as Record<number, typeof programs>);
  
  // Display grouped data
  for (const [year, yearPrograms] of Object.entries(groupedByYear).sort((a, b) => Number(b[0]) - Number(a[0]))) {
    console.log(`\n📅 Academic Year ${year} (${yearPrograms.length} programs)`);
    console.log('-'.repeat(80));
    
    const semester1 = yearPrograms.filter(p => p.Semester === 'SEMESTER_1');
    const semester2 = yearPrograms.filter(p => p.Semester === 'SEMESTER_2');
    
    if (semester1.length > 0) {
      console.log('\n  📖 Semester 1:');
      semester1.forEach(p => {
        console.log(`    • ${p.ProgramName.padEnd(40)} (${p._count.gradelevel} grade levels)`);
      });
    }
    
    if (semester2.length > 0) {
      console.log('\n  📖 Semester 2:');
      semester2.forEach(p => {
        console.log(`    • ${p.ProgramName.padEnd(40)} (${p._count.gradelevel} grade levels)`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Verification Complete\n');
  
  // Test composite uniqueness
  console.log('🔐 Testing Composite Unique Constraint...');
  const duplicateTest = await prisma.program.findMany({
    where: {
      ProgramName: 'หลักสูตรแกนกลาง ม.ต้น',
      Semester: 'SEMESTER_1',
      AcademicYear: 2568
    }
  });
  
  console.log(`   Found ${duplicateTest.length} program(s) with (หลักสูตรแกนกลาง ม.ต้น, SEMESTER_1, 2568)`);
  console.log(`   ✓ Composite constraint ${duplicateTest.length === 1 ? 'working correctly' : 'FAILED - duplicate found!'}\n`);
  
  await prisma.$disconnect();
}

verifyProgramSeed().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
