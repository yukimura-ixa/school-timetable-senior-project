const {
  PrismaClient,
} = require("b:/Dev/school-timetable-senior-project/prisma/generated");

const prisma = new PrismaClient({});

async function main() {
  console.log("Checking assignments (CJS)...");
  try {
    const teacher = await prisma.teacher.findFirst({
      where: { Firstname: "Test Teacher-B" },
    });

    if (!teacher) {
      console.log("Teacher not found");
      return;
    }
    console.log("Teacher ID:", teacher.TeacherID);

    const assignments = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: teacher.TeacherID,
        AcademicYear: 2568,
        Semester: "SEMESTER_1",
      },
      include: {
        subject: true,
      },
    });

    console.log(
      `Found ${assignments.length} assignments for ${teacher.Firstname}:`,
    );
    assignments.forEach((a) => {
      console.log(
        `- ${a.SubjectCode} (${a.subject ? a.subject.SubjectName : "Unknown"})`,
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
