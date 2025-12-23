import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient({} as any);

async function runCheck(args?: any) {
  console.log("Checking assignments...");
  try {
    const teacher = await prisma.teacher.findFirst({
      where: { Firstname: "Test Teacher-B" },
    });

    if (!teacher) {
      console.log("Teacher not found");
      return;
    }

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
        `- ${a.SubjectCode} (${a.subject?.SubjectName}) GradeID: ${a.GradeID} Hours: ${a.TeachHour}`,
      );
    });
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

runCheck();
