/**
 * Compliance Test Seed
 *
 * Creates specific data scenarios for testing:
 * 1. Specialization Mismatch: Teacher with Dept 'Mathematics' assigned to 'Thai' subject.
 * 2. Grade Level Mismatch: Subject for M.4-6 assigned to M.1.
 * 3. Program Compliance: Program with missing mandatory subjects and credit totals.
 */

import {
  PrismaClient,
  semester,
  day_of_week,
} from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;

async function initPrisma(): Promise<PrismaClient> {
  if (connectionString.startsWith("prisma+")) {
    const { withAccelerate } = await import("@prisma/extension-accelerate");
    return new PrismaClient({
      log: ["error", "warn"],
      errorFormat: "minimal",
      accelerateUrl: connectionString,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  } else {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({
      log: ["error", "warn"],
      errorFormat: "minimal",
      adapter,
    });
  }
}

async function main() {
  const prisma = await initPrisma();
  console.log("🌱 Seeding compliance test data...");

  const ACADEMIC_YEAR = 2568;
  const SEMESTER: semester = "SEMESTER_1";

  try {
    // 1. Create Teachers
    const teacherMath = await prisma.teacher.upsert({
      where: { Email: "comp.math@example.com" },
      update: { Firstname: "COMP-T1", Department: "คณิตศาสตร์" },
      create: {
        Prefix: "ครู",
        Firstname: "COMP-T1",
        Lastname: "Mathematics",
        Department: "คณิตศาสตร์",
        Email: "comp.math@example.com",
        Role: "teacher",
      },
    });

    const teacherThai = await prisma.teacher.upsert({
      where: { Email: "comp.thai@example.com" },
      update: { Firstname: "COMP-T2", Department: "ภาษาไทย" },
      create: {
        Prefix: "ครู",
        Firstname: "COMP-T2",
        Lastname: "Thai",
        Department: "ภาษาไทย",
        Email: "comp.thai@example.com",
        Role: "teacher",
      },
    });

    // 2. Create Subjects
    const subjectMath1 = await prisma.subject.upsert({
      where: { SubjectCode: "ค21101" },
      update: {
        LearningArea: "MATHEMATICS",
        Category: "CORE",
      },
      create: {
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์ พื้นฐาน 1",
        Credit: "CREDIT_15",
        LearningArea: "MATHEMATICS",
        Category: "CORE",
        IsGraded: true,
      },
    });

    const subjectThai4 = await prisma.subject.upsert({
      where: { SubjectCode: "ท41101" },
      update: {
        LearningArea: "THAI",
        Category: "CORE",
      },
      create: {
        SubjectCode: "ท41101",
        SubjectName: "ภาษาไทย พื้นฐาน 1 (ม.4)",
        Credit: "CREDIT_10",
        LearningArea: "THAI",
        Category: "CORE",
        IsGraded: true,
      },
    });

    // Add subject specifically for COMP-01
    await prisma.subject.upsert({
      where: { SubjectCode: "ว31101" },
      update: {
        LearningArea: "SCIENCE",
        Category: "CORE",
      },
      create: {
        SubjectCode: "ว31101",
        SubjectName: "วิทยาศาสตร์ (ม.4-ม.6)",
        Credit: "CREDIT_15",
        LearningArea: "SCIENCE",
        Category: "CORE",
        IsGraded: true,
      },
    });

    // Add subject for THAI mismatch test
    await prisma.subject.upsert({
      where: { SubjectCode: "ท21101" },
      update: {
        LearningArea: "THAI",
        Category: "CORE",
      },
      create: {
        SubjectCode: "ท21101",
        SubjectName: "ภาษาไทย (ม.1)",
        Credit: "CREDIT_15",
        LearningArea: "THAI",
        Category: "CORE",
        IsGraded: true,
      },
    });

    // 3. Create Program
    const program = await prisma.program.upsert({
      where: { ProgramCode: "COMP-P1" },
      update: {
        IsActive: true,
        ProgramName: "Compliance Program M.1 (COMP-P1)",
        Year: 1,
      },
      create: {
        ProgramName: "Compliance Program M.1 (COMP-P1)",
        ProgramCode: "COMP-P1",
        Track: "GENERAL",
        Year: 1, // M.1
        IsActive: true,
        MinTotalCredits: 20.0,
      },
    });

    // 4. Link Program Subject (Mandatory)
    await prisma.program_subject.upsert({
      where: {
        ProgramID_SubjectCode: {
          ProgramID: program.ProgramID,
          SubjectCode: "ค21101",
        },
      },
      update: { IsMandatory: true },
      create: {
        ProgramID: program.ProgramID,
        SubjectCode: "ค21101",
        Category: "CORE",
        IsMandatory: true,
        MinCredits: 1.5,
        MaxCredits: 1.5,
      },
    });

    // 5. Create Grade Level for M.1/99 (linked to program)
    const gradeM1 = await prisma.gradelevel.upsert({
      where: { GradeID: "M1-99" },
      update: { ProgramID: program.ProgramID, Number: 99, Year: 1 },
      create: {
        GradeID: "M1-99",
        Year: 1, // ม.1
        Number: 99, // ม.1/99
        StudentCount: 30,
        ProgramID: program.ProgramID,
      },
    });

    // 6. Create common timeslots
    const days: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];
    for (const day of days) {
      const timeslotId = `1-${ACADEMIC_YEAR}-${day}1`;
      await prisma.timeslot.upsert({
        where: { TimeslotID: timeslotId },
        update: {},
        create: {
          TimeslotID: timeslotId,
          AcademicYear: ACADEMIC_YEAR,
          Semester: SEMESTER,
          StartTime: new Date("2024-01-01T08:30:00"),
          EndTime: new Date("2024-01-01T09:20:00"),
          Breaktime: "NOT_BREAK",
          DayOfWeek: day,
        },
      });
    }

    console.log("✅ Compliance test data seeded successfully!");
    console.log(`- Teacher Math ID: ${teacherMath.TeacherID} (COMP-T1)`);
    console.log(`- Teacher Thai ID: ${teacherThai.TeacherID} (COMP-T2)`);
    console.log(`- Grade Level ID: ${gradeM1.GradeID} (ม.1/1)`);
    console.log(`- Program Code: ${program.ProgramCode}`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
