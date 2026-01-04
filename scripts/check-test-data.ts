/**
 * Check test data for drag-and-drop testing
 * Run with: npx tsx scripts/check-test-data.ts
 */
import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createLogger } from "../src/lib/logger";
import "dotenv/config";

const log = createLogger("CheckTestData");

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Checking test data for Semester 2/2567...\n");

  // Check existing responsibilities for semester 2/2567
  const existingResp = await prisma.teachers_responsibility.findMany({
    where: {
      AcademicYear: 2567,
      Semester: "SEMESTER_2",
    },
    include: {
      teacher: true,
      subject: true,
      gradelevel: true,
    },
    take: 10,
  });

  console.log(`Found ${existingResp.length} subject assignments for Semester 2/2567:`);
  existingResp.forEach((r) => {
    const name = `${r.teacher.Prefix}${r.teacher.Firstname} ${r.teacher.Lastname}`;
    console.log(`  - ${name}: ${r.subject.SubjectName} (${r.gradelevel.GradeID})`);
  });

  // Check the E2E test teacher (ID=1) or first available
  const e2eTeacher = await prisma.teacher.findFirst({
    orderBy: { TeacherID: "asc" },
  });
  const teacherName = e2eTeacher ? `${e2eTeacher.Prefix}${e2eTeacher.Firstname} ${e2eTeacher.Lastname}` : "NOT FOUND";
  console.log(`\nFirst Teacher: ID ${e2eTeacher?.TeacherID} - ${teacherName}`);

  // List all teachers
  const allTeachers = await prisma.teacher.findMany({
    take: 5,
    orderBy: { TeacherID: "asc" },
  });
  console.log(`\nAll teachers (first 5):`);
  allTeachers.forEach((t) => {
    console.log(`  - ID ${t.TeacherID}: ${t.Prefix}${t.Firstname} ${t.Lastname} (${t.Department})`);
  });

  // Check E2E teacher's responsibilities
  const e2eResp = await prisma.teachers_responsibility.findMany({
    where: {
      TeacherID: e2eTeacher?.TeacherID || 1,
      AcademicYear: 2567,
      Semester: "SEMESTER_2",
    },
    include: {
      subject: true,
      gradelevel: true,
    },
  });

  console.log(`E2E Teacher has ${e2eResp.length} subject assignments for Semester 2/2567`);

  // Check available subjects
  const subjects = await prisma.subject.findMany({
    take: 5,
    where: {
      LearningArea: "MATHEMATICS",
    },
  });
  console.log(`\nSample Math subjects in database:`);
  subjects.forEach((s) => {
    console.log(`  - ${s.SubjectCode}: ${s.SubjectName}`);
  });

  // Check available grade levels
  const grades = await prisma.gradelevel.findMany({
    take: 6,
    orderBy: { GradeID: "asc" },
  });
  console.log(`\nAvailable grade levels:`);
  grades.forEach((g) => {
    console.log(`  - ${g.GradeID}: ${g.GradeName}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
