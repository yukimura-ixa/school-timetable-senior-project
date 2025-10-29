import { PrismaClient } from '../prisma/generated';

const prisma = new PrismaClient();

async function checkData() {
  console.log('📊 Checking database after migration...\n');

  // Check programs
  const programs = await prisma.program.findMany({
    orderBy: { Year: 'asc' },
    select: {
      ProgramID: true,
      ProgramCode: true,
      ProgramName: true,
      Year: true,
      Track: true,
    },
  });

  console.log('📚 Programs:');
  console.log(`   Total: ${programs.length}`);
  for (const p of programs) {
    console.log(`   - ${p.ProgramCode}: Year=${p.Year}, Track=${p.Track}`);
  }

  // Check grade levels
  console.log('\n🎓 Grade Levels:');
  const gradeLevels = await prisma.gradelevel.findMany({
    orderBy: [{ Year: 'asc' }, { Number: 'asc' }],
    select: {
      GradeID: true,
      Year: true,
      Number: true,
    },
  });

  console.log(`   Total: ${gradeLevels.length}`);
  for (const g of gradeLevels) {
    console.log(`   - ${g.GradeID}: Year=${g.Year}, Section=${g.Number}`);
  }

  // Check specific year
  console.log('\n🔍 Programs for Year 1 (ม.1):');
  const year1Programs = await prisma.program.findMany({
    where: { Year: 1 },
  });
  console.log(`   Found: ${year1Programs.length}`);
  year1Programs.forEach(p => {
    console.log(`   - ${p.ProgramCode}: ${p.ProgramName}`);
  });

  await prisma.$disconnect();
}

checkData().catch(console.error);
