/**
 * Create table_config records for semesters
 */

import { PrismaClient } from '../prisma/generated';

const prisma = new PrismaClient();

async function main() {
  console.log('📅 Creating table_config records for semesters...');

  // Semester 1, Year 2567 (PUBLISHED)
  await prisma.table_config.upsert({
    where: { ConfigID: '1-2567' },
    update: {
      status: 'PUBLISHED',
      isPinned: true,
      updatedAt: new Date(),
    },
    create: {
      ConfigID: '1-2567',
      AcademicYear: 2567,
      Semester: 'SEMESTER_1',
      Config: {
        periodsPerDay: 8,
        startTime: '08:00',
        periodDuration: 50,
        schoolDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        lunchBreak: { after: 4, duration: 60 },
        breakTimes: {
          junior: { after: 4 },
          senior: { after: 5 }
        }
      },
      status: 'PUBLISHED',
      isPinned: true,
      configCompleteness: 75,
      lastAccessedAt: new Date(),
    },
  });

  // Semester 2, Year 2567 (DRAFT)
  await prisma.table_config.upsert({
    where: { ConfigID: '2-2567' },
    update: {
      updatedAt: new Date(),
    },
    create: {
      ConfigID: '2-2567',
      AcademicYear: 2567,
      Semester: 'SEMESTER_2',
      Config: {
        periodsPerDay: 8,
        startTime: '08:00',
        periodDuration: 50,
        schoolDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        lunchBreak: { after: 4, duration: 60 },
        breakTimes: {
          junior: { after: 4 },
          senior: { after: 5 }
        }
      },
      status: 'DRAFT',
      isPinned: false,
      configCompleteness: 0,
      lastAccessedAt: new Date(),
    },
  });

  // Semester 1, Year 2568 (DRAFT - for testing future semester)
  await prisma.table_config.upsert({
    where: { ConfigID: '1-2568' },
    update: {},
    create: {
      ConfigID: '1-2568',
      AcademicYear: 2568,
      Semester: 'SEMESTER_1',
      Config: {
        periodsPerDay: 8,
        startTime: '08:00',
        periodDuration: 50,
        schoolDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        lunchBreak: { after: 4, duration: 60 },
        breakTimes: {
          junior: { after: 4 },
          senior: { after: 5 }
        }
      },
      status: 'DRAFT',
      isPinned: false,
      configCompleteness: 0,
      lastAccessedAt: new Date(),
    },
  });

  console.log('✅ Created 3 table_config records');
  console.log('   - 1-2567 (PUBLISHED, Pinned)');
  console.log('   - 2-2567 (DRAFT)');
  console.log('   - 1-2568 (DRAFT)');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
