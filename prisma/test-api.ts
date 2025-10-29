import { PrismaClient } from '../prisma/generated';

const prisma = new PrismaClient();

async function testAPI() {
  console.log('🧪 Testing API call simulation...\n');

  // Simulate the API call that the page makes
  const year = 1;
  console.log(`Fetching programs for Year=${year}...`);

  const programs = await prisma.program.findMany({
    where: {
      Year: year,
    },
  });

  console.log(`\n✅ Found ${programs.length} programs:`);
  programs.forEach(p => {
    console.log(`   - ${p.ProgramCode}: ${p.ProgramName} (Year ${p.Year})`);
  });

  await prisma.$disconnect();
}

testAPI().catch(console.error);
