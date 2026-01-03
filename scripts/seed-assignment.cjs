const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient(/** @type {any} */ ({}));

/**
 * Seed teachers_responsibility (Subject-Teacher Assignment)
 * Creates a teaching responsibility record linking Teacher -> Subject -> Grade -> Semester
 *
 * Usage: node scripts/seed-assignment.cjs
 */
async function main() {
  console.log("Seeding Teacher Assignment (teachers_responsibility)...");

  try {
    // 1. Find Teacher by Firstname
    const teacher = await prisma.teacher.findFirst({
      where: { Firstname: "Test Teacher-B" },
    });
    if (!teacher)
      throw new Error(
        "Teacher 'Test Teacher-B' not found. Please seed teacher first.",
      );
    console.log(
      "Found Teacher:",
      teacher.TeacherID,
      `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`,
    );

    // 2. Find Subject by SubjectCode
    const subject = await prisma.subject.findFirst({
      where: { SubjectCode: "TEST-SUBJ-B" },
    });
    if (!subject)
      throw new Error(
        "Subject 'TEST-SUBJ-B' not found. Please seed subject first.",
      );
    console.log("Found Subject:", subject.SubjectCode, subject.SubjectName);

    // 3. Find first available Grade Level
    const grade = await prisma.gradelevel.findFirst();
    if (!grade) throw new Error("No Grade Level found in database.");
    console.log(
      "Found Grade:",
      grade.GradeID,
      `ม.${grade.Year}/${grade.Number}`,
    );

    // 4. Define semester and year for assignment
    const academicYear = 2568; // Thai Buddhist year
    const semester = "SEMESTER_1";
    const teachHour = 2; // Hours per week

    // 5. Check if assignment exists
    const assignments = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: teacher.TeacherID,
        AcademicYear: academicYear,
        Semester: semester,
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
        `- ${a.SubjectCode} (${a.subject?.SubjectName}) Grade: ${a.GradeID} Hours: ${a.TeachHour}`,
      );
    });
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
