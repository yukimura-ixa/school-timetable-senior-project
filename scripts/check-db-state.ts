import prisma from "../src/lib/prisma";

async function main() {
  console.log("=== Database State Check ===\n");
  
  // Basic counts
  console.log("Teachers:", await prisma.teacher.count());
  console.log("Subjects:", await prisma.subject.count());
  console.log("Rooms:", await prisma.room.count());
  console.log("GradeLevels:", await prisma.gradelevel.count());
  console.log("Programs:", await prisma.program.count());
  
  // Config
  const configs = await prisma.table_config.findMany({
    orderBy: { AcademicYear: "desc" },
    take: 3,
    select: { AcademicYear: true, Semester: true },
  });
  console.log("\nConfigs (newest first):", configs);
  
  // Teacher responsibilities by term
  const responsibilities = await prisma.teachers_responsibility.groupBy({
    by: ["AcademicYear", "Semester"],
    _count: true,
  });
  console.log("\nResponsibilities by term:", responsibilities);
  
  // Timeslots by term
  const timeslots = await prisma.timeslot.groupBy({
    by: ["AcademicYear", "Semester"],
    _count: true,
  });
  console.log("\nTimeslots by term:", timeslots);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
