import prisma from "../src/lib/prisma";

const minExpected = {
  teachers: 8,
  schedules: 30,
  timeslots: 80,
  grades: 3,
  subjects: 8,
};

async function verifySeed(): Promise<void> {
  try {
    const [teachers, schedules, timeslots, grades, subjects] = await Promise.all(
      [
        prisma.teacher.count(),
        prisma.class_schedule.count(),
        prisma.timeslot.count(),
        prisma.gradelevel.count(),
        prisma.subject.count(),
      ],
    );

    const counts = { teachers, schedules, timeslots, grades, subjects };
    const ready =
      teachers >= minExpected.teachers &&
      schedules >= minExpected.schedules &&
      timeslots >= minExpected.timeslots &&
      grades >= minExpected.grades &&
      subjects >= minExpected.subjects;

    console.log("Database seed verification:", {
      ready,
      counts,
      minExpected,
    });

    if (!ready) {
      throw new Error(
        "Seed verification failed. Ensure migrations and seed completed.",
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifySeed().catch((error) => {
  console.error(
    "Database seed verification failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
