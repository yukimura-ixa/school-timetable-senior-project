/**
 * Prisma Seed File for School Timetable System
 * MOE-Compliant with Comprehensive Test/Demo Data
 *
 * This seed creates a comprehensive mock database based on Thai Ministry of Education
 * Basic Education Core Curriculum B.E. 2551 (2008) standards.
 *
 * SEEDING MODES:
 * ==============================================================================
 * 1. Default (no env vars):
 *    - Creates admin user only
 *    - Safe for production initialization
 *
 * 2. SEED_DEMO_DATA=true (pnpm db:seed:demo):
 *    - Creates minimal demo data for production preview
 *    - Includes: 3 semesters, 10 teachers, 3 grades, core subjects, schedules
 *    - Idempotent: safe to run multiple times
 *    - NO data cleanup (additive only)
 *
 * 3. SEED_CLEAN_DATA=true (pnpm db:seed:clean):
 *    - Full E2E test data with cleanup
 *    - 40 teachers, 18 grades, 70+ subjects, 80+ timeslots
 *
 * 4. SEED_FOR_TESTS=true (pnpm test:db:seed):
 *    - Same as SEED_CLEAN_DATA + auth session cleanup
 *    - Used by CI/CD pipeline
 * ==============================================================================
 *
 * Data Scale (Full Test Mode):
 * - 40+ Teachers across 8 departments (aligned with MOE 8 learning areas)
 * - 40 Classrooms (3 buildings)
 * - 18 Grade levels (M.1-M.6, 3 sections each)
 * - 3 Program tracks: วิทย์-คณิต, ศิลป์-คำนวณ, ศิลป์-ภาษา
 * - MOE 8 Learning Areas with proper credit allocation
 * - 70+ Subjects (Thai curriculum: core + additional + activities)
 * - 8 Periods per day, 5 days per week (MON-FRI)
 * - 3 Semesters: 1-2567, 2-2567, 1-2568
 *
 * Features:
 * - ✅ Retry logic for transient database connection errors (Docker Desktop compatibility)
 * - ✅ MOE-compliant 8 learning areas structure
 * - ✅ Proper ActivityType for student development activities (ชุมนุม, ลูกเสือ, แนะแนว, etc.)
 * - ✅ Three program tracks with proper subject assignments
 * - ✅ Teachers with realistic workload distribution (1-3 subjects per Ministry standard)
 * - ✅ Locked timeslots for school-wide activities
 * - ✅ Sample class schedules for visual testing
 * - ✅ Different break times for junior/senior levels
 * - ✅ Mixed credit subjects (0.5 to 2.0 credits)
 * - ✅ Department-based teacher distribution
 *
 * Usage:
 *   pnpm db:seed              # Admin user only
 *   pnpm db:seed:demo         # Demo data for production
 *   pnpm db:seed:clean        # Full test data
 *   pnpm test:db:seed         # CI/CD test mode
 */

import {
  PrismaClient,
  day_of_week,
  semester,
  subject_credit,
  breaktime,
  ProgramTrack,
  SubjectCategory,
  LearningArea,
  ActivityType,
} from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const isAccelerate = connectionString.startsWith("prisma+");

const prisma = new PrismaClient({
  log: ["error", "warn"],
  errorFormat: "minimal",
  ...(isAccelerate
    ? {
        // Prisma Accelerate / Data Proxy path (no pg adapter)
        accelerateUrl: connectionString,
      }
    : {
        // Direct Postgres connection via pg adapter
        adapter: new PrismaPg({
          connectionString,
        }),
      }),
  // Connection pooling settings for Docker Desktop on Windows
  // Helps with connection stability when Docker network isn't in host mode
});

// Helper: Retry logic for transient database errors
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const isRetryable =
        error.code === "P1017" ||
        error.code === "P2024" ||
        error.message?.includes("connection");
      if (attempt < maxRetries && isRetryable) {
        console.warn(
          `⚠️  ${operationName} failed (attempt ${attempt}/${maxRetries}): ${error.message}`,
        );
        console.warn(`   Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw lastError!;
}

// ============================================================================
// DEMO DATA SEEDING FUNCTION
// Creates minimal but complete data for production demos
// ============================================================================
async function seedDemoData() {
  console.log("🌐 Starting demo data seed (idempotent, additive)...");

  const academicYear = 2567;
  const semesters: { semester: semester; number: number }[] = [
    { semester: "SEMESTER_1", number: 1 },
    { semester: "SEMESTER_2", number: 2 },
  ];

  // Add semester 1-2568 for future testing
  const nextYearSemesters: { semester: semester; number: number; year: number }[] = [
    { semester: "SEMESTER_1", number: 1, year: 2568 },
  ];

  const days: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];
  const periods = [
    { start: "08:30", end: "09:20", break: "NOT_BREAK" as breaktime },
    { start: "09:20", end: "10:10", break: "NOT_BREAK" as breaktime },
    { start: "10:10", end: "11:00", break: "NOT_BREAK" as breaktime },
    { start: "11:00", end: "11:50", break: "NOT_BREAK" as breaktime },
    { start: "12:50", end: "13:40", break: "BREAK_JUNIOR" as breaktime },
    { start: "13:40", end: "14:30", break: "BREAK_SENIOR" as breaktime },
    { start: "14:30", end: "15:20", break: "NOT_BREAK" as breaktime },
    { start: "15:20", end: "16:10", break: "NOT_BREAK" as breaktime },
  ];

  // ===== DEMO SUBJECTS (10 core subjects) =====
  console.log("📚 Creating demo subjects...");

  // Demo subjects using MOE format (ม.1 subjects for demo purposes)
  const demoSubjects = [
    { code: "ท21101", name: "ภาษาไทย พื้นฐาน 1", credit: "CREDIT_15" as subject_credit, learningArea: "THAI" as LearningArea },
    { code: "ค21101", name: "คณิตศาสตร์ พื้นฐาน 1", credit: "CREDIT_15" as subject_credit, learningArea: "MATHEMATICS" as LearningArea },
    { code: "ว21101", name: "วิทยาศาสตร์และเทคโนโลยี พื้นฐาน 1", credit: "CREDIT_15" as subject_credit, learningArea: "SCIENCE" as LearningArea },
    { code: "ส21101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม 1", credit: "CREDIT_10" as subject_credit, learningArea: "SOCIAL" as LearningArea },
    { code: "พ21101", name: "สุขศึกษาและพลศึกษา 1", credit: "CREDIT_10" as subject_credit, learningArea: "HEALTH_PE" as LearningArea },
    { code: "ศ21101", name: "ศิลปะ พื้นฐาน 1", credit: "CREDIT_10" as subject_credit, learningArea: "ARTS" as LearningArea },
    { code: "ง21101", name: "การงานอาชีพ พื้นฐาน 1", credit: "CREDIT_10" as subject_credit, learningArea: "CAREER" as LearningArea },
    { code: "อ21101", name: "ภาษาอังกฤษ พื้นฐาน 1", credit: "CREDIT_10" as subject_credit, learningArea: "FOREIGN_LANGUAGE" as LearningArea },
    { code: "ACT-CLUB", name: "ชุมนุม", credit: "CREDIT_10" as subject_credit, learningArea: null, activityType: "CLUB" as ActivityType },
    { code: "ACT-GUIDE", name: "แนะแนว", credit: "CREDIT_10" as subject_credit, learningArea: null, activityType: "GUIDANCE" as ActivityType },
  ];

  for (const subject of demoSubjects) {
    await withRetry(
      () =>
        prisma.subject.upsert({
          where: { SubjectCode: subject.code },
          update: {},
          create: {
            SubjectCode: subject.code,
            SubjectName: subject.name,
            Credit: subject.credit,
            Category: subject.activityType ? "ACTIVITY" : "CORE",
            LearningArea: subject.learningArea,
            ActivityType: subject.activityType,
            IsGraded: !subject.activityType,
          },
        }),
      `Upsert demo subject ${subject.code}`,
    );
  }
  console.log(`✅ Created ${demoSubjects.length} demo subjects`);

  // ===== DEMO PROGRAM =====
  console.log("🎓 Creating demo program...");
  const demoProgram = await withRetry(
    () =>
      prisma.program.upsert({
        where: { ProgramCode: "M1-SCI" },
        update: {},
        create: {
          ProgramCode: "M1-SCI",
          ProgramName: "หลักสูตรวิทย์-คณิต ม.1",
          Year: 1,
          Track: "SCIENCE_MATH" as ProgramTrack,
          MinTotalCredits: 43,
          Description: "หลักสูตรเน้นวิทยาศาสตร์และคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 1",
        },
      }),
    "Upsert demo program M1-SCI",
  );
  console.log(`✅ Created demo program: ${demoProgram.ProgramName}`);

  // ===== DEMO GRADE LEVELS (3 sections of M.1) =====
  console.log("🏫 Creating demo grade levels...");
  const demoGrades = [
    { id: "M1-1", year: 1, number: 1 },
    { id: "M1-2", year: 1, number: 2 },
    { id: "M1-3", year: 1, number: 3 },
  ];

  const gradeLevels = [];
  for (const grade of demoGrades) {
    const gradeLevel = await withRetry(
      () =>
        prisma.gradelevel.upsert({
          where: { GradeID: grade.id },
          update: {},
          create: {
            GradeID: grade.id,
            Year: grade.year,
            Number: grade.number,
            StudentCount: 35,
            ProgramID: demoProgram.ProgramID,
          },
        }),
      `Upsert demo grade ${grade.id}`,
    );
    gradeLevels.push(gradeLevel);
  }
  console.log(`✅ Created ${demoGrades.length} demo grade levels`);

  // ===== DEMO ROOMS (5 rooms) =====
  console.log("🚪 Creating demo rooms...");
  const demoRooms = [
    { name: "ห้อง 111", building: "อาคาร 1", floor: "ชั้น 1" },
    { name: "ห้อง 112", building: "อาคาร 1", floor: "ชั้น 1" },
    { name: "ห้อง 113", building: "อาคาร 1", floor: "ชั้น 1" },
    { name: "ห้อง 211", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 1" },
    { name: "ห้อง 212", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 1" },
  ];

  const rooms = [];
  for (const room of demoRooms) {
    const createdRoom = await withRetry(
      () =>
        prisma.room.upsert({
          where: { RoomName: room.name },
          update: {},
          create: {
            RoomName: room.name,
            Building: room.building,
            Floor: room.floor,
          },
        }),
      `Upsert demo room ${room.name}`,
    );
    rooms.push(createdRoom);
  }
  console.log(`✅ Created ${demoRooms.length} demo rooms`);

  // ===== DEMO TEACHERS (8 teachers, 1 per department) =====
  console.log("👨‍🏫 Creating demo teachers...");
  const demoTeachers = [
    { prefix: "ครู", firstname: "สมชาย", lastname: "ทองดี", dept: "ภาษาไทย", email: "teacher1@school.ac.th" },
    { prefix: "ครู", firstname: "สมหญิง", lastname: "ใจดี", dept: "คณิตศาสตร์", email: "teacher2@school.ac.th" },
    { prefix: "ครู", firstname: "วิชัย", lastname: "เก่งมาก", dept: "วิทยาศาสตร์และเทคโนโลยี", email: "teacher3@school.ac.th" },
    { prefix: "ครู", firstname: "สุดา", lastname: "รักเรียน", dept: "สังคมศึกษา", email: "teacher4@school.ac.th" },
    { prefix: "ครู", firstname: "ประสิทธิ์", lastname: "แข็งแรง", dept: "สุขศึกษาและพลศึกษา", email: "teacher5@school.ac.th" },
    { prefix: "ครู", firstname: "ศิริพร", lastname: "ศิลป์งาม", dept: "ศิลปะ", email: "teacher6@school.ac.th" },
    { prefix: "ครู", firstname: "บุญส่ง", lastname: "อาชีพดี", dept: "การงานอาชีพ", email: "teacher7@school.ac.th" },
    { prefix: "ครู", firstname: "จอห์น", lastname: "สมิธ", dept: "ภาษาต่างประเทศ", email: "teacher8@school.ac.th" },
  ];

  const teachers = [];
  for (const teacher of demoTeachers) {
    const createdTeacher = await withRetry(
      () =>
        prisma.teacher.upsert({
          where: { Email: teacher.email },
          update: {},
          create: {
            Prefix: teacher.prefix,
            Firstname: teacher.firstname,
            Lastname: teacher.lastname,
            Department: teacher.dept,
            Email: teacher.email,
            Role: "teacher",
          },
        }),
      `Upsert demo teacher ${teacher.email}`,
    );
    teachers.push(createdTeacher);
  }
  console.log(`✅ Created ${teachers.length} demo teachers`);

  // ===== DEMO TIMESLOTS (for all 3 semesters) =====
  console.log("⏰ Creating demo timeslots...");
  let timeslotCount = 0;

  // Semesters for 2567
  for (const sem of semesters) {
    for (const day of days) {
      for (let periodNum = 1; periodNum <= periods.length; periodNum++) {
        const period = periods[periodNum - 1];
        const timeslotId = `${sem.number}-${academicYear}-${day}-${periodNum}`;

        await withRetry(
          () =>
            prisma.timeslot.upsert({
              where: { TimeslotID: timeslotId },
              update: {},
              create: {
                TimeslotID: timeslotId,
                AcademicYear: academicYear,
                Semester: sem.semester,
                StartTime: new Date(`2024-01-01T${period.start}:00`),
                EndTime: new Date(`2024-01-01T${period.end}:00`),
                Breaktime: period.break,
                DayOfWeek: day,
              },
            }),
          `Upsert timeslot ${timeslotId}`,
        );
        timeslotCount++;
      }
    }
  }

  // Semester 1-2568
  for (const sem of nextYearSemesters) {
    for (const day of days) {
      for (let periodNum = 1; periodNum <= periods.length; periodNum++) {
        const period = periods[periodNum - 1];
        const timeslotId = `${sem.number}-${sem.year}-${day}-${periodNum}`;

        await withRetry(
          () =>
            prisma.timeslot.upsert({
              where: { TimeslotID: timeslotId },
              update: {},
              create: {
                TimeslotID: timeslotId,
                AcademicYear: sem.year,
                Semester: sem.semester,
                StartTime: new Date(`2024-01-01T${period.start}:00`),
                EndTime: new Date(`2024-01-01T${period.end}:00`),
                Breaktime: period.break,
                DayOfWeek: day,
              },
            }),
          `Upsert timeslot ${timeslotId}`,
        );
        timeslotCount++;
      }
    }
  }
  console.log(`✅ Created ${timeslotCount} demo timeslots`);

  // ===== DEMO TABLE CONFIGS =====
  console.log("⚙️  Creating demo table configurations...");
  const configTemplate = {
    periodsPerDay: 8,
    startTime: "08:30",
    periodDuration: 50,
    schoolDays: ["MON", "TUE", "WED", "THU", "FRI"],
    lunchBreak: { after: 4, duration: 60 },
    breakTimes: { junior: { after: 4 }, senior: { after: 5 } },
  };

  await withRetry(
    () =>
      prisma.table_config.upsert({
        where: { ConfigID: `1-${academicYear}` },
        update: {},
        create: {
          ConfigID: `1-${academicYear}`,
          AcademicYear: academicYear,
          Semester: "SEMESTER_1",
          Config: configTemplate,
        },
      }),
    "Upsert table config 1-2567",
  );

  await withRetry(
    () =>
      prisma.table_config.upsert({
        where: { ConfigID: `2-${academicYear}` },
        update: {},
        create: {
          ConfigID: `2-${academicYear}`,
          AcademicYear: academicYear,
          Semester: "SEMESTER_2",
          Config: configTemplate,
          status: "DRAFT",
        },
      }),
    "Upsert table config 2-2567",
  );

  await withRetry(
    () =>
      prisma.table_config.upsert({
        where: { ConfigID: "1-2568" },
        update: {},
        create: {
          ConfigID: "1-2568",
          AcademicYear: 2568,
          Semester: "SEMESTER_1",
          Config: configTemplate,
          status: "DRAFT",
        },
      }),
    "Upsert table config 1-2568",
  );
  console.log("✅ Created 3 demo table configurations (1-2567, 2-2567, 1-2568)");

  // ===== DEMO TEACHER RESPONSIBILITIES =====
  console.log("📝 Creating demo teacher responsibilities...");
  const responsibilities = [];

  // Map MOE subject codes to teachers (by index matching departments)
  const subjectTeacherMap = [
    { subjectCode: "ท21101", teacherIndex: 0 }, // Thai teacher
    { subjectCode: "ค21101", teacherIndex: 1 }, // Math teacher
    { subjectCode: "ว21101", teacherIndex: 2 }, // Science teacher
    { subjectCode: "ส21101", teacherIndex: 3 }, // Social teacher
    { subjectCode: "พ21101", teacherIndex: 4 }, // PE teacher
    { subjectCode: "ศ21101", teacherIndex: 5 }, // Art teacher
    { subjectCode: "ง21101", teacherIndex: 6 }, // Career teacher
    { subjectCode: "อ21101", teacherIndex: 7 }, // English teacher
  ];

  // Create responsibilities for all 3 grades with each subject/teacher
  for (const grade of gradeLevels) {
    for (const mapping of subjectTeacherMap) {
      const teacher = teachers[mapping.teacherIndex];
      const respId = `${teacher.TeacherID}-${grade.GradeID}-${mapping.subjectCode}-1-2567`;

      const resp = await withRetry(
        () =>
          prisma.teachers_responsibility.upsert({
            where: { RespID: parseInt(respId.replace(/\D/g, "").slice(0, 9)) || undefined },
            update: {},
            create: {
              TeacherID: teacher.TeacherID,
              GradeID: grade.GradeID,
              SubjectCode: mapping.subjectCode,
              AcademicYear: 2567,
              Semester: "SEMESTER_1",
              TeachHour: 2,
            },
          }),
        `Upsert responsibility ${mapping.subjectCode} for ${grade.GradeID}`,
      ).catch(async () => {
        // If upsert fails due to no unique constraint, try findFirst + create
        const existing = await prisma.teachers_responsibility.findFirst({
          where: {
            TeacherID: teacher.TeacherID,
            GradeID: grade.GradeID,
            SubjectCode: mapping.subjectCode,
            AcademicYear: 2567,
            Semester: "SEMESTER_1",
          },
        });
        if (existing) return existing;

        return prisma.teachers_responsibility.create({
          data: {
            TeacherID: teacher.TeacherID,
            GradeID: grade.GradeID,
            SubjectCode: mapping.subjectCode,
            AcademicYear: 2567,
            Semester: "SEMESTER_1",
            TeachHour: 2,
          },
        });
      });
      responsibilities.push(resp);
    }
  }
  console.log(`✅ Created ${responsibilities.length} demo teacher responsibilities`);

  // ===== DEMO CLASS SCHEDULES =====
  console.log("📅 Creating demo class schedules...");
  let scheduleCount = 0;

  // Create 3 schedules per grade (showing populated timetables for visual tests)
  // Each grade gets TH, MA, EN on different days/periods
  // Sample class schedule template using MOE subject codes for M.1 (ม.1)
  const scheduleTemplate = [
    { day: "MON", period: 1, subjectCode: "ท21101", teacherIndex: 0 },  // ภาษาไทย
    { day: "MON", period: 2, subjectCode: "ค21101", teacherIndex: 1 },  // คณิตศาสตร์
    { day: "MON", period: 3, subjectCode: "อ21101", teacherIndex: 7 },  // ภาษาอังกฤษ
    { day: "TUE", period: 1, subjectCode: "ว21101", teacherIndex: 2 },  // วิทยาศาสตร์
    { day: "TUE", period: 2, subjectCode: "ส21101", teacherIndex: 3 },  // สังคมศึกษา
    { day: "TUE", period: 3, subjectCode: "พ21101", teacherIndex: 4 },  // พลศึกษา
    { day: "WED", period: 1, subjectCode: "ศ21101", teacherIndex: 5 },  // ศิลปะ
    { day: "WED", period: 2, subjectCode: "ง21101", teacherIndex: 6 },  // การงานอาชีพ
    { day: "THU", period: 1, subjectCode: "ท21101", teacherIndex: 0 },  // ภาษาไทย (คาบที่ 2)
    { day: "THU", period: 2, subjectCode: "ค21101", teacherIndex: 1 },  // คณิตศาสตร์ (คาบที่ 2)
    { day: "FRI", period: 1, subjectCode: "อ21101", teacherIndex: 7 },  // ภาษาอังกฤษ (คาบที่ 2)
    { day: "FRI", period: 2, subjectCode: "ว21101", teacherIndex: 2 },  // วิทยาศาสตร์ (คาบที่ 2)
  ];

  for (const grade of gradeLevels) {
    for (const schedule of scheduleTemplate) {
      const timeslotId = `1-${academicYear}-${schedule.day}-${schedule.period}`;
      const classId = `${timeslotId}-${schedule.subjectCode}-${grade.GradeID}`;
      const teacher = teachers[schedule.teacherIndex];
      const room = rooms[schedule.period % rooms.length];

      // Find the responsibility for this teacher/grade/subject
      const resp = responsibilities.find(
        (r) =>
          r.TeacherID === teacher.TeacherID &&
          r.GradeID === grade.GradeID &&
          r.SubjectCode === schedule.subjectCode,
      );

      if (resp) {
        try {
          await withRetry(
            () =>
              prisma.class_schedule.upsert({
                where: { ClassID: classId },
                update: {},
                create: {
                  ClassID: classId,
                  TimeslotID: timeslotId,
                  SubjectCode: schedule.subjectCode,
                  GradeID: grade.GradeID,
                  RoomID: room.RoomID,
                  IsLocked: false,
                  teachers_responsibility: {
                    connect: [{ RespID: resp.RespID }],
                  },
                },
              }),
            `Upsert schedule ${classId}`,
          );
          scheduleCount++;
        } catch (error: any) {
          // Skip if already exists or constraint violation
          if (!error.message?.includes("Unique constraint")) {
            console.warn(`⚠️  Skipping schedule ${classId}: ${error.message}`);
          }
        }
      }
    }
  }
  console.log(`✅ Created ${scheduleCount} demo class schedules`);

  // ===== DEMO SUMMARY =====
  console.log("\n" + "=".repeat(70));
  console.log("🌐 Demo Data Seed Completed Successfully!");
  console.log("=".repeat(70));
  console.log("📊 Demo Data Summary:");
  console.log(`   • Subjects: ${demoSubjects.length}`);
  console.log(`   • Program: 1 (${demoProgram.ProgramName})`);
  console.log(`   • Grade Levels: ${demoGrades.length} (M.1/1-3)`);
  console.log(`   • Rooms: ${demoRooms.length}`);
  console.log(`   • Teachers: ${teachers.length}`);
  console.log(`   • Timeslots: ${timeslotCount} (3 semesters)`);
  console.log(`   • Table Configurations: 3 (1-2567, 2-2567, 1-2568)`);
  console.log(`   • Teacher Responsibilities: ${responsibilities.length}`);
  console.log(`   • Class Schedules: ${scheduleCount}`);
  console.log("=".repeat(70));
  console.log("\n✨ Demo data ready for production preview!");
  console.log("💡 Teacher schedules will show populated timetables.");
  console.log("=".repeat(70));
}

// ============================================================================
// FULL TEST DATA CONSTANTS
// ============================================================================

// Thai teacher prefixes and names for realistic data
const THAI_PREFIXES = ["นาย", "นางสาว", "นาง", "ครู", "อาจารย์"];
const THAI_FIRSTNAMES = [
  "สมชาย",
  "สมหญิง",
  "วิชัย",
  "ประภาส",
  "สุรชัย",
  "อนุชา",
  "กิตติ",
  "วรรณา",
  "สุดารัตน์",
  "ปิยะ",
  "นิภา",
  "รัตนา",
  "ชัยวัฒน์",
  "ศิริพร",
  "พิมพ์ใจ",
  "จารุวรรณ",
  "ธนพล",
  "อรุณ",
  "วิภา",
  "สมศักดิ์",
  "นันทวัน",
  "วิไล",
  "ประวิทย์",
  "สุภาพ",
  "กมล",
  "ชญาน์นันท์",
  "ธีรศักดิ์",
  "พัชรินทร์",
  "วีรพงษ์",
  "สุวรรณา",
  "มานิต",
  "ศุภชัย",
  "สมพร",
  "พิชญา",
  "อภิชาติ",
  "รัชนี",
  "ประดิษฐ์",
  "จินตนา",
  "บุญส่ง",
  "นภา",
  "ธนัช",
  "ปรียา",
  "อัญชลี",
  "วัชระ",
  "สมบูรณ์",
  "กนกวรรณ",
  "ชนินทร์",
  "พรพิมล",
  "ธนาวุฒิ",
  "สุดา",
  "ณัฐพงษ์",
  "วิชญา",
  "ภูมิ",
  "นวพร",
  "สาลินี",
  "ตุลา",
  "ชนิดา",
  "สุรเชษฐ์",
  "นริศรา",
  "ภัทรพล",
  "กัญญา",
];

const THAI_LASTNAMES = [
  "สมบูรณ์",
  "จิตรใจ",
  "วงศ์สวัสดิ์",
  "ประเสริฐ",
  "ศรีสุข",
  "มั่นคง",
  "บุญมี",
  "เจริญสุข",
  "พันธ์ดี",
  "วัฒนา",
  "สุขเจริญ",
  "ทองดี",
  "รักษา",
  "เพชรรัตน์",
  "สว่างแสง",
  "ชัยชนะ",
  "วิริยะ",
  "สุวรรณ",
  "แสงทอง",
  "เลิศล้ำ",
  "ภูมิใจ",
  "คงดี",
  "มีสุข",
  "เกิดผล",
  "พิทักษ์",
  "อุดมพร",
  "ชูเกียรติ",
  "ทรงศิลป์",
  "วรรณกร",
  "ธรรมศาสตร์",
  "สุขใจ",
  "เลิศศิริ",
  "เจริญรัตน์",
  "ศรีทอง",
  "พรหมมา",
  "วิชาญ",
  "กิตติศักดิ์",
  "บุญชู",
  "สมศรี",
  "รัตนพันธ์",
  "วิทยา",
  "ประทุม",
  "มหาวงศ์",
  "พูลสวัสดิ์",
  "ดำรงค์",
  "ชนะชัย",
  "อมรรัตน์",
  "ศิลปชัย",
  "กาญจนา",
  "วรวัฒน์",
  "ปิยะวัฒน์",
  "กมลชนก",
  "สุทธิ",
  "พิมพ์พิไล",
  "เพ็ชรสว่าง",
  "วัฒนพันธุ์",
  "สิริวัฒน์",
  "มงคล",
  "ศรีประพันธ์",
  "สมานมิตร",
  "ประดับศิริ",
];

// Thai department names aligned with MOE 8 Learning Areas (updated per latest MOE standard)
// Note: "วิทยาศาสตร์" renamed to "วิทยาศาสตร์และเทคโนโลยี"; "การงานอาชีพและเทคโนโลยี" standardized as "การงานอาชีพ"
const DEPARTMENTS = [
  "ภาษาไทย", // Thai Language
  "คณิตศาสตร์", // Mathematics
  "วิทยาศาสตร์และเทคโนโลยี", // Science & Technology (MOE phrasing)
  "สังคมศึกษา", // Social Studies
  "ภาษาต่างประเทศ", // Foreign Languages
  "สุขศึกษาและพลศึกษา", // Health & PE
  "ศิลปะ", // Arts
  "การงานอาชีพ", // Career & Technology
];

// Building names
const BUILDINGS = [
  { name: "อาคาร 1", shortName: "1", floors: 4, roomsPerFloor: 4 },
  { name: "อาคารวิทยาศาสตร์", shortName: "2", floors: 4, roomsPerFloor: 4 },
  { name: "อาคารกีฬา", shortName: "3", floors: 2, roomsPerFloor: 4 },
];

async function main() {
  console.log("🌱 Starting MOE-compliant seed with retry logic...");
  console.log(
    "🔧 Connection: " + (process.env.DATABASE_URL?.substring(0, 50) + "..."),
  );

  // ===== BETTER-AUTH USERS =====
  console.log("👤 Creating admin user...");

  // FORCE DELETE existing admin user and associated auth records
  // This ensures CI always has fresh credentials with correct password hash
  const existingAdmin = await withRetry(
    () => prisma.user.findUnique({ where: { email: "admin@school.local" } }),
    "Check existing admin",
  );

  if (existingAdmin) {
    console.log("🗑️  Deleting existing admin user and auth data...");
    // Delete associated Account records first (foreign key constraint)
    await withRetry(
      () => prisma.account.deleteMany({ where: { userId: existingAdmin.id } }),
      "Delete admin accounts",
    );
    // Delete the user
    await withRetry(
      () => prisma.user.delete({ where: { id: existingAdmin.id } }),
      "Delete admin user",
    );
    console.log("✅ Existing admin user deleted");
  }

  // Use better-auth's API to create user with proper password hashing
  // This ensures password is hashed correctly and Account record is created automatically
  const { auth } = await import("../src/lib/auth.js");

  const signUpResult = await auth.api.signUpEmail({
    body: {
      email: "admin@school.local",
      password: "admin123",
      name: "System Administrator",
    },
  });

  if (!signUpResult || !signUpResult.user) {
    throw new Error("Failed to create admin user via better-auth API");
  }

  // Update role to admin (can't be set during signup)
  await withRetry(
    () =>
      prisma.user.update({
        where: { id: signUpResult.user.id },
        data: {
          role: "admin",
          emailVerified: true,
        },
      }),
    "Update admin user role",
  );

  console.log(
    "✅ Admin user created via better-auth API (email: admin@school.local, password: admin123)",
  );

  // ===== SEEDING MODE SELECTION =====
  const isDemoMode = process.env.SEED_DEMO_DATA === "true";
  const isTestMode = process.env.SEED_FOR_TESTS === "true";
  const shouldCleanData =
    process.env.SEED_CLEAN_DATA === "true" || isTestMode;

  if (!shouldCleanData && !isDemoMode) {
    console.log(
      "ℹ️  Skipping data seeding (set SEED_DEMO_DATA=true for demo or SEED_CLEAN_DATA=true for full test data)",
    );
    console.log("✅ Seed completed - admin user ready");
    return;
  }

  if (isDemoMode) {
    console.log("🌐 Demo mode enabled - Seeding production demo data...");
    await seedDemoData();
    return;
  }

  if (isTestMode) {
    console.log("🧪 Test mode enabled - Seeding E2E test data...");
  } else {
    console.log(
      "⚠️  SEED_CLEAN_DATA=true - Cleaning existing timetable data...",
    );
  }

  // Clean existing timetable data (preserve better-auth tables)
  console.log("🧹 Cleaning existing data...");

  // Clean better-auth sessions and verification tokens for test mode to prevent stale auth conflicts
  if (isTestMode) {
    console.log("🔐 Cleaning auth sessions for test mode...");
    await withRetry(() => prisma.session.deleteMany({}), "Delete sessions");
    await withRetry(
      () => prisma.verification.deleteMany({}),
      "Delete verification tokens",
    );
    console.log("✅ Auth sessions cleaned");
  }
  await withRetry(
    () => prisma.class_schedule.deleteMany({}),
    "Delete class_schedule",
  );
  await withRetry(
    () => prisma.teachers_responsibility.deleteMany({}),
    "Delete teachers_responsibility",
  );
  await withRetry(
    () => prisma.program_subject.deleteMany({}),
    "Delete program_subject",
  );
  await withRetry(() => prisma.timeslot.deleteMany({}), "Delete timeslot");
  await withRetry(
    () => prisma.table_config.deleteMany({}),
    "Delete table_config",
  );
  await withRetry(() => prisma.gradelevel.deleteMany({}), "Delete gradelevel");
  await withRetry(() => prisma.subject.deleteMany({}), "Delete subject");
  await withRetry(() => prisma.program.deleteMany({}), "Delete program");
  await withRetry(() => prisma.teacher.deleteMany({}), "Delete teacher");
  await withRetry(() => prisma.room.deleteMany({}), "Delete room");
  console.log("✅ Timetable data cleaned (better-auth tables preserved)");

  // ===== SUBJECTS (MOE 8 Learning Areas) =====
  console.log("📚 Creating subjects with MOE 8 Learning Areas...");

  // ========================================================================
  // MOE Subject Code Format (Thai Ministry of Education Standard)
  // ========================================================================
  // Format: [Area][Level][Year][Type][Sequence] (6 characters)
  //
  // Position 1 - Learning Area Code:
  //   ท = Thai (ภาษาไทย)
  //   ค = Mathematics (คณิตศาสตร์)
  //   ว = Science (วิทยาศาสตร์และเทคโนโลยี)
  //   ส = Social Studies (สังคมศึกษา ศาสนา และวัฒนธรรม)
  //   พ = Health & PE (สุขศึกษาและพลศึกษา)
  //   ศ = Arts (ศิลปะ)
  //   ง = Career (การงานอาชีพ)
  //   อ = English (ภาษาอังกฤษ)
  //   จ = Chinese (ภาษาจีน)
  //   ญ = Japanese (ภาษาญี่ปุ่น)
  //
  // Position 2 - Education Level:
  //   2 = Lower Secondary (มัธยมศึกษาตอนต้น - ม.1-3)
  //   3 = Upper Secondary (มัธยมศึกษาตอนปลาย - ม.4-6)
  //
  // Position 3 - Year within Level:
  //   1 = Year 1 (ม.1 or ม.4)
  //   2 = Year 2 (ม.2 or ม.5)
  //   3 = Year 3 (ม.3 or ม.6)
  //   0 = Any year (electives)
  //
  // Position 4 - Subject Type:
  //   1 = Core/Required (รายวิชาพื้นฐาน)
  //   2 = Elective/Additional (รายวิชาเพิ่มเติม)
  //
  // Positions 5-6 - Sequence Number (01-99)
  //
  // Examples:
  //   ท21101 = Thai Language, M.1, Core, Subject 01
  //   ค31201 = Mathematics, M.4, Elective, Subject 01
  // ========================================================================

  const coreSubjects = [
    // 1. ภาษาไทย (Thai Language) - รหัส: ท
    // มัธยมศึกษาตอนต้น (ม.1-3): 1.5 หน่วยกิต/ภาคเรียน = 3 คาบ/สัปดาห์
    // มัธยมศึกษาตอนปลาย (ม.4-6): 1.0 หน่วยกิต/ภาคเรียน = 2 คาบ/สัปดาห์
    {
      code: "ท21101",
      name: "ภาษาไทย พื้นฐาน 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "ท22101",
      name: "ภาษาไทย พื้นฐาน 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "ท23101",
      name: "ภาษาไทย พื้นฐาน 3",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "ท31101",
      name: "ภาษาไทย พื้นฐาน 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "ท32101",
      name: "ภาษาไทย พื้นฐาน 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "ท33101",
      name: "ภาษาไทย พื้นฐาน 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },

    // 2. คณิตศาสตร์ (Mathematics) - รหัส: ค
    // มัธยมศึกษาตอนต้น (ม.1-3): 1.5 หน่วยกิต/ภาคเรียน = 3 คาบ/สัปดาห์
    // มัธยมศึกษาตอนปลาย (ม.4-6): 1.0 หน่วยกิต/ภาคเรียน = 2 คาบ/สัปดาห์
    {
      code: "ค21101",
      name: "คณิตศาสตร์ พื้นฐาน 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "ค22101",
      name: "คณิตศาสตร์ พื้นฐาน 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "ค23101",
      name: "คณิตศาสตร์ พื้นฐาน 3",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "ค31101",
      name: "คณิตศาสตร์ พื้นฐาน 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "ค32101",
      name: "คณิตศาสตร์ พื้นฐาน 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "ค33101",
      name: "คณิตศาสตร์ พื้นฐาน 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },

    // 3. วิทยาศาสตร์และเทคโนโลยี (Science & Technology) - รหัส: ว
    // มัธยมศึกษาตอนต้น (ม.1-3): 1.5 หน่วยกิต/ภาคเรียน = 3 คาบ/สัปดาห์
    // มัธยมศึกษาตอนปลาย (ม.4-6): 1.0 หน่วยกิต/ภาคเรียน = 2 คาบ/สัปดาห์
    {
      code: "ว21101",
      name: "วิทยาศาสตร์และเทคโนโลยี พื้นฐาน 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว22101",
      name: "วิทยาศาสตร์และเทคโนโลยี พื้นฐาน 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว23101",
      name: "วิทยาศาสตร์และเทคโนโลยี พื้นฐาน 3",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว31101",
      name: "วิทยาศาสตร์และเทคโนโลยี พื้นฐาน 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว32101",
      name: "วิทยาศาสตร์และเทคโนโลยี พื้นฐาน 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว33101",
      name: "วิทยาศาสตร์และเทคโนโลยี พื้นฐาน 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },

    // 4. สังคมศึกษา ศาสนา และวัฒนธรรม (Social Studies, Religion & Culture) - รหัส: ส
    // มัธยมศึกษาตอนต้น (ม.1-3): ประวัติศาสตร์ 0.5 + สังคม 1.0 = 1.5 หน่วยกิต/ภาคเรียน
    // มัธยมศึกษาตอนปลาย (ม.4-6): ประวัติศาสตร์ 0.5 + สังคม 0.5 = 1.0 หน่วยกิต/ภาคเรียน
    {
      code: "ส21101",
      name: "สังคมศึกษา ศาสนาและวัฒนธรรม 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "ส22101",
      name: "สังคมศึกษา ศาสนาและวัฒนธรรม 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "ส23101",
      name: "สังคมศึกษา ศาสนาและวัฒนธรรม 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "ส31101",
      name: "สังคมศึกษา ศาสนาและวัฒนธรรม 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "ส32101",
      name: "สังคมศึกษา ศาสนาและวัฒนธรรม 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "ส33101",
      name: "สังคมศึกษา ศาสนาและวัฒนธรรม 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },

    // 5. สุขศึกษาและพลศึกษา (Health & Physical Education) - รหัส: พ
    // ทุกระดับชั้น: 0.5-1.0 หน่วยกิต/ภาคเรียน = 1-2 คาบ/สัปดาห์
    {
      code: "พ21101",
      name: "สุขศึกษาและพลศึกษา 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "พ22101",
      name: "สุขศึกษาและพลศึกษา 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "พ23101",
      name: "สุขศึกษาและพลศึกษา 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "พ31101",
      name: "สุขศึกษาและพลศึกษา 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "พ32101",
      name: "สุขศึกษาและพลศึกษา 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "พ33101",
      name: "สุขศึกษาและพลศึกษา 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },

    // 6. ศิลปะ (Arts) - รหัส: ศ
    // มัธยมศึกษาตอนต้น (ม.1-3): 1.0 หน่วยกิต/ภาคเรียน = 2 คาบ/สัปดาห์
    // มัธยมศึกษาตอนปลาย (ม.4-6): 0.5 หน่วยกิต/ภาคเรียน = 1 คาบ/สัปดาห์
    {
      code: "ศ21101",
      name: "ศิลปะ พื้นฐาน 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "ศ22101",
      name: "ศิลปะ พื้นฐาน 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "ศ23101",
      name: "ศิลปะ พื้นฐาน 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "ศ31101",
      name: "ศิลปะ พื้นฐาน 4",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "ศ32101",
      name: "ศิลปะ พื้นฐาน 5",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "ศ33101",
      name: "ศิลปะ พื้นฐาน 6",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },

    // 7. การงานอาชีพ (Career & Technology) - รหัส: ง
    // มัธยมศึกษาตอนต้น (ม.1-3): 1.0 หน่วยกิต/ภาคเรียน = 2 คาบ/สัปดาห์
    // มัธยมศึกษาตอนปลาย (ม.4-6): 0.5 หน่วยกิต/ภาคเรียน = 1 คาบ/สัปดาห์
    {
      code: "ง21101",
      name: "การงานอาชีพ พื้นฐาน 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "ง22101",
      name: "การงานอาชีพ พื้นฐาน 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "ง23101",
      name: "การงานอาชีพ พื้นฐาน 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "ง31101",
      name: "การงานอาชีพ พื้นฐาน 4",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "ง32101",
      name: "การงานอาชีพ พื้นฐาน 5",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "ง33101",
      name: "การงานอาชีพ พื้นฐาน 6",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },

    // 8. ภาษาต่างประเทศ (Foreign Language - English) - รหัส: อ
    // ทุกระดับชั้น: 1.0-1.5 หน่วยกิต/ภาคเรียน = 2-3 คาบ/สัปดาห์
    {
      code: "อ21101",
      name: "ภาษาอังกฤษ พื้นฐาน 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "อ22101",
      name: "ภาษาอังกฤษ พื้นฐาน 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "อ23101",
      name: "ภาษาอังกฤษ พื้นฐาน 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "อ31101",
      name: "ภาษาอังกฤษ พื้นฐาน 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "อ32101",
      name: "ภาษาอังกฤษ พื้นฐาน 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "อ33101",
      name: "ภาษาอังกฤษ พื้นฐาน 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
  ];

  // ========================================================================
  // รายวิชาเพิ่มเติม (Elective Subjects) - รหัสแบบ [Area][Level][0][2][Sequence]
  // Type = 2 (เพิ่มเติม), Year = 0 (any year in level)
  // ========================================================================
  const additionalSubjects = [
    // ========================================================================
    // วิทย์-คณิต Track - รายวิชาเพิ่มเติม (Science-Math Track Electives)
    // ========================================================================

    // คณิตศาสตร์เพิ่มเติม (ม.1-3)
    {
      code: "ค21201",
      name: "คณิตศาสตร์เพิ่มเติม 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "ค22201",
      name: "คณิตศาสตร์เพิ่มเติม 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "ค23201",
      name: "คณิตศาสตร์เพิ่มเติม 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },

    // วิทยาศาสตร์เพิ่มเติม (ม.1-3)
    {
      code: "ว21201",
      name: "วิทยาศาสตร์เพิ่มเติม 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว22201",
      name: "วิทยาศาสตร์เพิ่มเติม 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว23201",
      name: "วิทยาศาสตร์เพิ่มเติม 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },

    // คณิตศาสตร์เพิ่มเติม (ม.4-6) - แคลคูลัส
    {
      code: "ค31201",
      name: "แคลคูลัส 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "ค32201",
      name: "แคลคูลัส 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },

    // ฟิสิกส์ (ม.4-6)
    {
      code: "ว31201",
      name: "ฟิสิกส์ 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว32201",
      name: "ฟิสิกส์ 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },

    // เคมี (ม.4-6)
    {
      code: "ว31202",
      name: "เคมี 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว32202",
      name: "เคมี 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },

    // ชีววิทยา (ม.4-6)
    {
      code: "ว31203",
      name: "ชีววิทยา 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "ว32203",
      name: "ชีววิทยา 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },

    // ========================================================================
    // ศิลป์-ภาษา Track - รายวิชาเพิ่มเติม (Arts-Language Track Electives)
    // ========================================================================

    // ภาษาไทยเพิ่มเติม (วรรณคดี, การเขียน)
    {
      code: "ท20201",
      name: "วรรณคดีไทย",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "ท20202",
      name: "การเขียนเชิงสร้างสรรค์",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },

    // ภาษาอังกฤษเพิ่มเติม (ม.1-3)
    {
      code: "อ21201",
      name: "ภาษาอังกฤษเพิ่มเติม 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "อ22201",
      name: "ภาษาอังกฤษเพิ่มเติม 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "อ23201",
      name: "ภาษาอังกฤษเพิ่มเติม 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },

    // ภาษาอังกฤษเพิ่มเติม (ม.4-6) - English Communication
    {
      code: "อ31201",
      name: "ภาษาอังกฤษเพื่อการสื่อสาร 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "อ32201",
      name: "ภาษาอังกฤษเพื่อการสื่อสาร 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },

    // ภาษาจีน (ม.4-6) - รหัส: จ
    {
      code: "จ31201",
      name: "ภาษาจีน 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "จ32201",
      name: "ภาษาจีน 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },

    // สังคมศึกษาเพิ่มเติม (ม.4-6)
    {
      code: "ส31201",
      name: "ประวัติศาสตร์สากล",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "ส32201",
      name: "เศรษฐศาสตร์เบื้องต้น",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
  ];

  // ========================================================================
  // กิจกรรมพัฒนาผู้เรียน (Student Development Activities)
  // ========================================================================
  // ตามหลักสูตรแกนกลาง พ.ศ. 2551 กิจกรรมพัฒนาผู้เรียนประกอบด้วย 4 ประเภท:
  // 1. กิจกรรมแนะแนว (Guidance) - 1 คาบ/สัปดาห์
  // 2. กิจกรรมนักเรียน (Student Activities):
  //    - ลูกเสือ/เนตรนารี/ยุวกาชาด (Scout/Guide/Red Cross) - 1 คาบ/สัปดาห์
  //    - ชุมนุม (Clubs) - 1-2 คาบ/สัปดาห์
  // 3. กิจกรรมเพื่อสังคมและสาธารณประโยชน์ (Social Service) - บูรณาการ
  // ========================================================================
  const activitySubjects = [
    // ========================================================================
    // 1. กิจกรรมแนะแนว (Guidance Activities) - ActivityType: GUIDANCE
    // ========================================================================
    {
      code: "ACT-GUIDE",
      name: "แนะแนว",
      activityType: "GUIDANCE" as ActivityType,
    },
    {
      code: "ACT-GUIDE-M1",
      name: "แนะแนว ม.1",
      activityType: "GUIDANCE" as ActivityType,
    },
    {
      code: "ACT-GUIDE-M2",
      name: "แนะแนว ม.2",
      activityType: "GUIDANCE" as ActivityType,
    },
    {
      code: "ACT-GUIDE-M3",
      name: "แนะแนว ม.3",
      activityType: "GUIDANCE" as ActivityType,
    },
    {
      code: "ACT-GUIDE-M4",
      name: "แนะแนว ม.4",
      activityType: "GUIDANCE" as ActivityType,
    },
    {
      code: "ACT-GUIDE-M5",
      name: "แนะแนว ม.5",
      activityType: "GUIDANCE" as ActivityType,
    },
    {
      code: "ACT-GUIDE-M6",
      name: "แนะแนว ม.6",
      activityType: "GUIDANCE" as ActivityType,
    },
    {
      code: "ACT-HOMEROOM",
      name: "โฮมรูม/ชั่วโมงพบครูที่ปรึกษา",
      activityType: "GUIDANCE" as ActivityType,
    },

    // ========================================================================
    // 2a. ลูกเสือ (Boy Scout) - ActivityType: SCOUT
    // มัธยมศึกษาตอนต้น: ลูกเสือสามัญรุ่นใหญ่
    // มัธยมศึกษาตอนปลาย: ลูกเสือวิสามัญ
    // ========================================================================
    {
      code: "ACT-SCOUT-M1",
      name: "ลูกเสือสามัญรุ่นใหญ่ ม.1",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-SCOUT-M2",
      name: "ลูกเสือสามัญรุ่นใหญ่ ม.2",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-SCOUT-M3",
      name: "ลูกเสือสามัญรุ่นใหญ่ ม.3",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-SCOUT-M4",
      name: "ลูกเสือวิสามัญ ม.4",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-SCOUT-M5",
      name: "ลูกเสือวิสามัญ ม.5",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-SCOUT-M6",
      name: "ลูกเสือวิสามัญ ม.6",
      activityType: "SCOUT" as ActivityType,
    },

    // ========================================================================
    // 2b. เนตรนารี (Girl Guide) - ActivityType: SCOUT
    // มัธยมศึกษาตอนต้น: เนตรนารีสามัญรุ่นใหญ่
    // มัธยมศึกษาตอนปลาย: ผู้บำเพ็ญประโยชน์
    // ========================================================================
    {
      code: "ACT-GIRLGUIDE-M1",
      name: "เนตรนารีสามัญรุ่นใหญ่ ม.1",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-GIRLGUIDE-M2",
      name: "เนตรนารีสามัญรุ่นใหญ่ ม.2",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-GIRLGUIDE-M3",
      name: "เนตรนารีสามัญรุ่นใหญ่ ม.3",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-GIRLGUIDE-M4",
      name: "ผู้บำเพ็ญประโยชน์ ม.4",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-GIRLGUIDE-M5",
      name: "ผู้บำเพ็ญประโยชน์ ม.5",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-GIRLGUIDE-M6",
      name: "ผู้บำเพ็ญประโยชน์ ม.6",
      activityType: "SCOUT" as ActivityType,
    },

    // ========================================================================
    // 2c. ยุวกาชาด (Red Cross Youth) - ActivityType: SCOUT
    // มัธยมศึกษาตอนต้น: ยุวกาชาด
    // มัธยมศึกษาตอนปลาย: อาสายุวกาชาด
    // ========================================================================
    {
      code: "ACT-REDCROSS-M1",
      name: "ยุวกาชาด ม.1",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-REDCROSS-M2",
      name: "ยุวกาชาด ม.2",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-REDCROSS-M3",
      name: "ยุวกาชาด ม.3",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-REDCROSS-M4",
      name: "อาสายุวกาชาด ม.4",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-REDCROSS-M5",
      name: "อาสายุวกาชาด ม.5",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-REDCROSS-M6",
      name: "อาสายุวกาชาด ม.6",
      activityType: "SCOUT" as ActivityType,
    },

    // ========================================================================
    // 2d. ชุมนุม (Club Activities) - ActivityType: CLUB
    // นักเรียนเลือกตามความสนใจ
    // ========================================================================
    // ชุมนุมทั่วไป
    {
      code: "ACT-CLUB",
      name: "ชุมนุม",
      activityType: "CLUB" as ActivityType,
    },
    // ชุมนุมวิชาการ
    {
      code: "ACT-CLUB-ACADEMIC",
      name: "ชุมนุมวิชาการ",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-SCIENCE",
      name: "ชุมนุมวิทยาศาสตร์",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-MATH",
      name: "ชุมนุมคณิตศาสตร์",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-THAI",
      name: "ชุมนุมภาษาไทย",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-ENGLISH",
      name: "ชุมนุมภาษาอังกฤษ",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-CHINESE",
      name: "ชุมนุมภาษาจีน",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-JAPANESE",
      name: "ชุมนุมภาษาญี่ปุ่น",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-SOCIAL",
      name: "ชุมนุมสังคมศึกษา",
      activityType: "CLUB" as ActivityType,
    },
    // ชุมนุมศิลปะและดนตรี
    {
      code: "ACT-CLUB-ARTS",
      name: "ชุมนุมศิลปะ",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-MUSIC",
      name: "ชุมนุมดนตรี",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-DRAMA",
      name: "ชุมนุมละคร/การแสดง",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-PHOTO",
      name: "ชุมนุมถ่ายภาพ",
      activityType: "CLUB" as ActivityType,
    },
    // ชุมนุมกีฬา
    {
      code: "ACT-CLUB-SPORTS",
      name: "ชุมนุมกีฬา",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-FOOTBALL",
      name: "ชุมนุมฟุตบอล",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-BASKETBALL",
      name: "ชุมนุมบาสเกตบอล",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-VOLLEYBALL",
      name: "ชุมนุมวอลเลย์บอล",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-BADMINTON",
      name: "ชุมนุมแบดมินตัน",
      activityType: "CLUB" as ActivityType,
    },
    // ชุมนุมเทคโนโลยี
    {
      code: "ACT-CLUB-TECH",
      name: "ชุมนุมคอมพิวเตอร์และเทคโนโลยี",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-ROBOT",
      name: "ชุมนุมหุ่นยนต์",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-CODING",
      name: "ชุมนุมโค้ดดิ้ง/การเขียนโปรแกรม",
      activityType: "CLUB" as ActivityType,
    },
    // ชุมนุมอาชีพ
    {
      code: "ACT-CLUB-COOKING",
      name: "ชุมนุมอาหารและโภชนาการ",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-GARDEN",
      name: "ชุมนุมเกษตรกรรม",
      activityType: "CLUB" as ActivityType,
    },
    {
      code: "ACT-CLUB-BUSINESS",
      name: "ชุมนุมธุรกิจ/การขาย",
      activityType: "CLUB" as ActivityType,
    },

    // ========================================================================
    // 3. กิจกรรมเพื่อสังคมและสาธารณประโยชน์ (Social Service) - ActivityType: SOCIAL_SERVICE
    // ========================================================================
    {
      code: "ACT-SERVICE",
      name: "กิจกรรมเพื่อสังคมและสาธารณประโยชน์",
      activityType: "SOCIAL_SERVICE" as ActivityType,
    },
    {
      code: "ACT-SERVICE-SCHOOL",
      name: "กิจกรรมจิตอาสาในโรงเรียน",
      activityType: "SOCIAL_SERVICE" as ActivityType,
    },
    {
      code: "ACT-SERVICE-COMMUNITY",
      name: "กิจกรรมจิตอาสาชุมชน",
      activityType: "SOCIAL_SERVICE" as ActivityType,
    },
    {
      code: "ACT-SERVICE-ENV",
      name: "กิจกรรมอนุรักษ์สิ่งแวดล้อม",
      activityType: "SOCIAL_SERVICE" as ActivityType,
    },
    {
      code: "ACT-SERVICE-ELDERLY",
      name: "กิจกรรมดูแลผู้สูงอายุ",
      activityType: "SOCIAL_SERVICE" as ActivityType,
    },
    {
      code: "ACT-SERVICE-TEMPLE",
      name: "กิจกรรมทำนุบำรุงศาสนา",
      activityType: "SOCIAL_SERVICE" as ActivityType,
    },
  ];

  // Create all subjects with retry logic
  for (const subject of coreSubjects) {
    await withRetry(
      () =>
        prisma.subject.create({
          data: {
            SubjectCode: subject.code,
            SubjectName: subject.name,
            Credit: subject.credit,
            Category: "CORE",
            LearningArea: subject.learningArea,
            IsGraded: true,
          },
        }),
      `Create core subject ${subject.code}`,
    );
  }

  for (const subject of additionalSubjects) {
    await withRetry(
      () =>
        prisma.subject.create({
          data: {
            SubjectCode: subject.code,
            SubjectName: subject.name,
            Credit: subject.credit,
            Category: "ADDITIONAL",
            LearningArea: subject.learningArea,
            IsGraded: true,
          },
        }),
      `Create additional subject ${subject.code}`,
    );
  }

  for (const subject of activitySubjects) {
    await withRetry(
      () =>
        prisma.subject.create({
          data: {
            SubjectCode: subject.code,
            SubjectName: subject.name,
            Credit: "CREDIT_10",
            Category: "ACTIVITY",
            ActivityType: subject.activityType,
            IsGraded: false,
          },
        }),
      `Create activity subject ${subject.code}`,
    );
  }

  const totalSubjects =
    coreSubjects.length + additionalSubjects.length + activitySubjects.length;
  console.log(
    `✅ Created ${totalSubjects} subjects (${coreSubjects.length} core + ${additionalSubjects.length} additional + ${activitySubjects.length} activities)`,
  );

  // ===== PROGRAMS (3 tracks × 6 years) =====
  console.log("🎓 Creating programs...");
  const programs = [];

  for (let year = 1; year <= 6; year++) {
    const isJunior = year <= 3;
    const minCredits = isJunior ? 43 : 40;

    programs.push(
      await withRetry(
        () =>
          prisma.program.create({
            data: {
              ProgramCode: `M${year}-SCI`,
              ProgramName: `หลักสูตรวิทย์-คณิต ม.${year}`,
              Year: year,
              Track: "SCIENCE_MATH" as ProgramTrack,
              MinTotalCredits: minCredits,
              Description: `หลักสูตรเน้นวิทยาศาสตร์และคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ ${year}`,
            },
          }),
        `Create program M${year}-SCI`,
      ),
    );

    programs.push(
      await withRetry(
        () =>
          prisma.program.create({
            data: {
              ProgramCode: `M${year}-LANG-MATH`,
              ProgramName: `หลักสูตรศิลป์-คำนวณ ม.${year}`,
              Year: year,
              Track: "LANGUAGE_MATH" as ProgramTrack,
              MinTotalCredits: minCredits,
              Description: `หลักสูตรเน้นภาษาและคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ ${year}`,
            },
          }),
        `Create program M${year}-LANG-MATH`,
      ),
    );

    programs.push(
      await withRetry(
        () =>
          prisma.program.create({
            data: {
              ProgramCode: `M${year}-LANG`,
              ProgramName: `หลักสูตรศิลป์-ภาษา ม.${year}`,
              Year: year,
              Track: "LANGUAGE_ARTS" as ProgramTrack,
              MinTotalCredits: minCredits,
              Description: `หลักสูตรเน้นภาษาและศิลปะสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ ${year}`,
            },
          }),
        `Create program M${year}-LANG`,
      ),
    );
  }

  console.log(`✅ Created ${programs.length} programs (3 tracks × 6 years)`);

  // ===== GRADE LEVELS =====
  console.log("🏫 Creating grade levels with program assignments...");
  const gradeLevels = [];

  for (let year = 1; year <= 6; year++) {
    for (let number = 1; number <= 3; number++) {
      const gradeId = `M${year}-${number}`;

      // Assign programs: Section 1 = SCI, Section 2 = LANG-MATH, Section 3 = LANG
      let programCode = "";
      if (number === 1) programCode = `M${year}-SCI`;
      else if (number === 2) programCode = `M${year}-LANG-MATH`;
      else programCode = `M${year}-LANG`;

      const program = programs.find((p) => p.ProgramCode === programCode);

      gradeLevels.push(
        await withRetry(
          () =>
            prisma.gradelevel.create({
              data: {
                GradeID: gradeId,
                Year: year,
                Number: number,
                StudentCount: 35 + Math.floor(Math.random() * 10),
                ProgramID: program?.ProgramID,
              },
            }),
          `Create grade level ${gradeId}`,
        ),
      );
    }
  }

  console.log(
    `✅ Created ${gradeLevels.length} grade levels with program assignments`,
  );

  // ===== ROOMS =====
  console.log("🚪 Creating rooms...");
  const rooms = [];

  for (const building of BUILDINGS) {
    for (let floor = 1; floor <= building.floors; floor++) {
      for (let roomNum = 1; roomNum <= building.roomsPerFloor; roomNum++) {
        const roomName = `ห้อง ${building.shortName}${floor}${roomNum}`;

        rooms.push(
          await withRetry(
            () =>
              prisma.room.create({
                data: {
                  RoomName: roomName,
                  Building: building.name,
                  Floor: `ชั้น ${floor}`,
                },
              }),
            `Create room ${roomName}`,
          ),
        );
      }
    }
  }

  console.log(
    `✅ Created ${rooms.length} rooms across ${BUILDINGS.length} buildings`,
  );

  // ===== TEACHERS =====
  console.log("👨‍🏫 Creating teachers (target: 40)...");
  const teachers: any[] = [];
  let teacherEmailCount = 1;
  const TOTAL_TEACHERS = 40;
  const teachersPerDept = Math.floor(TOTAL_TEACHERS / DEPARTMENTS.length); // 5 each for 8 departments

  for (const dept of DEPARTMENTS) {
    for (let i = 0; i < teachersPerDept; i++) {
      const prefix =
        THAI_PREFIXES[Math.floor(Math.random() * THAI_PREFIXES.length)];
      const firstname =
        THAI_FIRSTNAMES[Math.floor(Math.random() * THAI_FIRSTNAMES.length)];
      const lastname =
        THAI_LASTNAMES[Math.floor(Math.random() * THAI_LASTNAMES.length)];

      teachers.push(
        await withRetry(
          () =>
            prisma.teacher.create({
              data: {
                Prefix: prefix,
                Firstname: firstname,
                Lastname: lastname,
                Department: dept,
                Email: `teacher${teacherEmailCount}@school.ac.th`,
                Role: i === 0 ? "admin" : "teacher",
              },
            }),
          `Create teacher ${teacherEmailCount}`,
        ),
      );
      teacherEmailCount++;
    }
  }

  console.log(
    `✅ Created ${teachers.length} teachers across ${DEPARTMENTS.length} departments`,
  );

  // ===== TIMESLOTS =====
  console.log("⏰ Creating timeslots...");
  const academicYear = 2567;
  const sem: semester = "SEMESTER_1";
  const semesterNumber =
    sem === "SEMESTER_1" ? 1 : sem === "SEMESTER_2" ? 2 : 3;
  const days: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];
  const periods = [
    { start: "08:30", end: "09:20", break: "NOT_BREAK" },
    { start: "09:20", end: "10:10", break: "NOT_BREAK" },
    { start: "10:10", end: "11:00", break: "NOT_BREAK" },
    { start: "11:00", end: "11:50", break: "NOT_BREAK" },
    { start: "12:50", end: "13:40", break: "BREAK_JUNIOR" },
    { start: "13:40", end: "14:30", break: "BREAK_SENIOR" },
    { start: "14:30", end: "15:20", break: "NOT_BREAK" },
    { start: "15:20", end: "16:10", break: "NOT_BREAK" },
  ];

  const timeslots: any[] = [];
  for (const day of days) {
    for (let periodNum = 1; periodNum <= periods.length; periodNum++) {
      const period = periods[periodNum - 1];
      timeslots.push(
        await withRetry(
          () =>
            prisma.timeslot.create({
              data: {
                TimeslotID: `${semesterNumber}-${academicYear}-${day}-${periodNum}`,
                AcademicYear: academicYear,
                Semester: sem,
                StartTime: new Date(`2024-01-01T${period.start}:00`),
                EndTime: new Date(`2024-01-01T${period.end}:00`),
                Breaktime: period.break as breaktime,
                DayOfWeek: day,
              },
            }),
          `Create timeslot ${day}-${periodNum}`,
        ),
      );
    }
  }

  console.log(
    `✅ Created ${timeslots.length} timeslots for Semester 1 (5 days × 8 periods)`,
  );

  // ===== TIMESLOTS (SEMESTER 2) =====
  console.log("⏰ Creating timeslots for Semester 2...");
  const sem2: semester = "SEMESTER_2";
  const semesterNumber2 = 2;
  const timeslotsSem2: any[] = [];
  for (const day of days) {
    for (let periodNum = 1; periodNum <= periods.length; periodNum++) {
      const period = periods[periodNum - 1];
      timeslotsSem2.push(
        await withRetry(
          () =>
            prisma.timeslot.create({
              data: {
                TimeslotID: `${semesterNumber2}-${academicYear}-${day}-${periodNum}`,
                AcademicYear: academicYear,
                Semester: sem2,
                StartTime: new Date(`2024-01-01T${period.start}:00`),
                EndTime: new Date(`2024-01-01T${period.end}:00`),
                Breaktime: period.break as breaktime,
                DayOfWeek: day,
              },
            }),
          `Create timeslot S2 ${day}-${periodNum}`,
        ),
      );
    }
  }
  console.log(
    `✅ Created ${timeslotsSem2.length} timeslots for Semester 2 (5 days × 8 periods)`,
  );

  // ===== TIMESLOTS (SEMESTER 1-2568) =====
  console.log("⏰ Creating timeslots for Semester 1-2568...");
  const academicYear2568 = 2568;
  const timeslotsSem1_2568: any[] = [];
  for (const day of days) {
    for (let periodNum = 1; periodNum <= periods.length; periodNum++) {
      const period = periods[periodNum - 1];
      timeslotsSem1_2568.push(
        await withRetry(
          () =>
            prisma.timeslot.create({
              data: {
                TimeslotID: `1-${academicYear2568}-${day}-${periodNum}`,
                AcademicYear: academicYear2568,
                Semester: "SEMESTER_1",
                StartTime: new Date(`2024-01-01T${period.start}:00`),
                EndTime: new Date(`2024-01-01T${period.end}:00`),
                Breaktime: period.break as breaktime,
                DayOfWeek: day,
              },
            }),
          `Create timeslot S1-2568 ${day}-${periodNum}`,
        ),
      );
    }
  }
  console.log(
    `✅ Created ${timeslotsSem1_2568.length} timeslots for Semester 1-2568 (5 days × 8 periods)`,
  );

  // ===== TABLE CONFIG =====
  console.log("⚙️  Creating timetable configuration...");
  await withRetry(
    () =>
      prisma.table_config.create({
        data: {
          ConfigID: `${semesterNumber}-${academicYear}`,
          AcademicYear: academicYear,
          Semester: sem,
          Config: {
            periodsPerDay: 8,
            startTime: "08:30",
            periodDuration: 50,
            schoolDays: ["MON", "TUE", "WED", "THU", "FRI"],
            lunchBreak: { after: 4, duration: 60 },
            breakTimes: {
              junior: { after: 4 },
              senior: { after: 5 },
            },
          },
        },
      }),
    "Create table config",
  );
  console.log("✅ Created timetable configuration for 1-2567");

  // ===== TABLE CONFIG FOR SEMESTER 2 =====
  console.log("⚙️  Creating timetable configuration for Semester 2...");
  await withRetry(
    () =>
      prisma.table_config.create({
        data: {
          ConfigID: `${semesterNumber2}-${academicYear}`,
          AcademicYear: academicYear,
          Semester: "SEMESTER_2",
          Config: {
            periodsPerDay: 8,
            startTime: "08:30",
            periodDuration: 50,
            schoolDays: ["MON", "TUE", "WED", "THU", "FRI"],
            lunchBreak: { after: 4, duration: 60 },
            breakTimes: {
              junior: { after: 4 },
              senior: { after: 5 },
            },
          },
          status: "DRAFT",
        },
      }),
    "Create table config for Semester 2",
  );
  console.log("✅ Created timetable configuration for 2-2567");

  // ===== TABLE CONFIG FOR SEMESTER 1-2568 =====
  console.log("⚙️  Creating timetable configuration for Semester 1-2568...");
  await withRetry(
    () =>
      prisma.table_config.create({
        data: {
          ConfigID: "1-2568",
          AcademicYear: 2568,
          Semester: "SEMESTER_1",
          Config: {
            periodsPerDay: 8,
            startTime: "08:30",
            periodDuration: 50,
            schoolDays: ["MON", "TUE", "WED", "THU", "FRI"],
            lunchBreak: { after: 4, duration: 60 },
            breakTimes: {
              junior: { after: 4 },
              senior: { after: 5 },
            },
          },
          status: "DRAFT",
        },
      }),
    "Create table config for Semester 1-2568",
  );
  console.log("✅ Created timetable configuration for 1-2568");

  // ===== PROGRAM-SUBJECT ASSIGNMENTS (Example for M.1 programs) =====
  console.log("🔗 Assigning subjects to M.1 programs...");

  const m1SciProgram = programs.find((p) => p.ProgramCode === "M1-SCI")!;
  const m1LangMathProgram = programs.find(
    (p) => p.ProgramCode === "M1-LANG-MATH",
  )!;
  const m1LangProgram = programs.find((p) => p.ProgramCode === "M1-LANG")!;

  // Helper to convert credit to number
  const creditToNumber = (credit: string): number => {
    switch (credit) {
      case "CREDIT_05":
        return 0.5;
      case "CREDIT_10":
        return 1.0;
      case "CREDIT_15":
        return 1.5;
      case "CREDIT_20":
        return 2.0;
      default:
        return 1.0;
    }
  };

  // M.1 Science-Math program subjects using MOE codes
  const m1SciSubjects = [
    { code: "ท21101", category: "CORE" as SubjectCategory },
    { code: "ค21101", category: "CORE" as SubjectCategory },
    { code: "ว21101", category: "CORE" as SubjectCategory },
    { code: "ส21101", category: "CORE" as SubjectCategory },
    { code: "พ21101", category: "CORE" as SubjectCategory },
    { code: "ศ21101", category: "CORE" as SubjectCategory },
    { code: "ง21101", category: "CORE" as SubjectCategory },
    { code: "อ21101", category: "CORE" as SubjectCategory },
    { code: "ค21201", category: "ADDITIONAL" as SubjectCategory },
    { code: "ว21201", category: "ADDITIONAL" as SubjectCategory },
    { code: "ACT-CLUB", category: "ACTIVITY" as SubjectCategory },
    { code: "ACT-SCOUT-M1", category: "ACTIVITY" as SubjectCategory },
    { code: "ACT-GUIDE", category: "ACTIVITY" as SubjectCategory },
    { code: "ACT-SERVICE", category: "ACTIVITY" as SubjectCategory },
  ];

  let sortOrder = 1;
  for (const ps of m1SciSubjects) {
    const subject = [
      ...coreSubjects,
      ...additionalSubjects,
      ...activitySubjects,
    ].find((s) => s.code === ps.code);

    if (subject) {
      await withRetry(
        () =>
          prisma.program_subject.create({
            data: {
              ProgramID: m1SciProgram.ProgramID,
              SubjectCode: ps.code,
              Category: ps.category,
              IsMandatory: true,
              MinCredits:
                "credit" in subject ? creditToNumber(subject.credit) : 1.0,
              SortOrder: sortOrder++,
            },
          }),
        `Link subject ${ps.code} to M1-SCI`,
      );
    }
  }

  console.log(
    `✅ Assigned ${m1SciSubjects.length} subjects to M.1 Science-Math program`,
  );
  console.log(
    "ℹ️  Other programs can be populated similarly via the UI or additional seed logic",
  );

  // ===== SAMPLE TEACHER RESPONSIBILITIES =====
  console.log("📝 Creating sample teacher responsibilities...");

  const getTeachersByDept = (dept: string) =>
    teachers.filter((t) => t.Department === dept);

  const responsibilities: any[] = [];
  const teacherWorkload = new Map<number, number>();

  const assignResponsibility = async (
    teacherID: number,
    gradeID: string,
    subjectCode: string,
    teachHour: number,
  ) => {
    const currentLoad = teacherWorkload.get(teacherID) || 0;
    if (currentLoad >= 3) return null;

    const resp = await withRetry(
      () =>
        prisma.teachers_responsibility.create({
          data: {
            TeacherID: teacherID,
            GradeID: gradeID,
            SubjectCode: subjectCode,
            AcademicYear: 2567,
            Semester: "SEMESTER_1",
            TeachHour: teachHour,
          },
        }),
      `Assign ${subjectCode} to teacher ${teacherID} for ${gradeID}`,
    );

    teacherWorkload.set(teacherID, currentLoad + 1);
    responsibilities.push(resp);
    return resp;
  };

  // Assign core subjects to all grades
  const thaiTeachers = getTeachersByDept("ภาษาไทย");
  const mathTeachers = getTeachersByDept("คณิตศาสตร์");
  const scienceTeachers = getTeachersByDept("วิทยาศาสตร์และเทคโนโลยี");
  const englishTeachers = getTeachersByDept("ภาษาต่างประเทศ");
  const socialTeachers = getTeachersByDept("สังคมศึกษา");
  const peTeachers = getTeachersByDept("สุขศึกษา-พลศึกษา");
  const artsTeachers = getTeachersByDept("ศิลปะ");
  const careerTeachers = getTeachersByDept("การงานอาชีพ");

  // Assign core subjects to first 3 grades as sample
  // MOE subject codes use Thai characters: ท=Thai, ค=Math, ว=Science, อ=English,
  // ส=Social, พ=PE, ศ=Art, ง=Career
  // Format: {Thai letter}{grade level}{subject number} e.g., ท21101 = Thai M.1 Subject 1
  for (let i = 0; i < 3; i++) {
    const gradeLevel = gradeLevels[i];
    const year = gradeLevel.Year;
    // Grade level indicator: M.1=21, M.2=22, M.3=23, M.4=31, M.5=32, M.6=33
    const gradeIndicator = year <= 3 ? `2${year}` : `3${year - 3}`;

    if (thaiTeachers.length > 0) {
      await assignResponsibility(
        thaiTeachers[i % thaiTeachers.length].TeacherID,
        gradeLevel.GradeID,
        `ท${gradeIndicator}101`, // Thai core subject
        3,
      );
    }
    if (mathTeachers.length > 0) {
      await assignResponsibility(
        mathTeachers[i % mathTeachers.length].TeacherID,
        gradeLevel.GradeID,
        `ค${gradeIndicator}101`, // Math core subject
        3,
      );
    }
    if (scienceTeachers.length > 0) {
      await assignResponsibility(
        scienceTeachers[i % scienceTeachers.length].TeacherID,
        gradeLevel.GradeID,
        `ว${gradeIndicator}101`, // Science core subject
        3,
      );
    }
    if (englishTeachers.length > 0) {
      await assignResponsibility(
        englishTeachers[i % englishTeachers.length].TeacherID,
        gradeLevel.GradeID,
        `อ${gradeIndicator}101`, // English core subject
        2,
      );
    }
    if (socialTeachers.length > 0) {
      await assignResponsibility(
        socialTeachers[i % socialTeachers.length].TeacherID,
        gradeLevel.GradeID,
        `ส${gradeIndicator}101`, // Social core subject
        2,
      );
    }
    if (peTeachers.length > 0) {
      await assignResponsibility(
        peTeachers[i % peTeachers.length].TeacherID,
        gradeLevel.GradeID,
        `พ${gradeIndicator}101`, // PE core subject
        1,
      );
    }
    if (artsTeachers.length > 0) {
      await assignResponsibility(
        artsTeachers[i % artsTeachers.length].TeacherID,
        gradeLevel.GradeID,
        `ศ${gradeIndicator}101`, // Arts core subject
        1,
      );
    }
    if (careerTeachers.length > 0) {
      await assignResponsibility(
        careerTeachers[i % careerTeachers.length].TeacherID,
        gradeLevel.GradeID,
        `ง${gradeIndicator}101`, // Career core subject
        1,
      );
    }
  }

  console.log(
    `✅ Created ${responsibilities.length} sample teacher responsibilities`,
  );

  // ===== SAMPLE CLASS SCHEDULES =====
  console.log("📅 Creating sample class schedules...");
  const classSchedules: any[] = [];

  // Create regular class schedules for M.1 grades (first 3 grades)
  // This ensures teacher timetables show populated data for visual tests
  // Sample class schedule template using MOE subject codes for M.1 (ม.1)
  // รายวิชาพื้นฐานทั้ง 8 กลุ่มสาระ พร้อมคาบเพิ่มเติมตามมาตรฐาน กสพท.
  const scheduleTemplate = [
    { day: "MON", period: 1, subjectCode: "ท21101" },  // ภาษาไทย
    { day: "MON", period: 2, subjectCode: "ค21101" },  // คณิตศาสตร์
    { day: "MON", period: 3, subjectCode: "อ21101" },  // ภาษาอังกฤษ
    { day: "TUE", period: 1, subjectCode: "ว21101" },  // วิทยาศาสตร์
    { day: "TUE", period: 2, subjectCode: "ส21101" },  // สังคมศึกษา
    { day: "TUE", period: 3, subjectCode: "พ21101" },  // พลศึกษา
    { day: "WED", period: 1, subjectCode: "ศ21101" },  // ศิลปะ
    { day: "WED", period: 2, subjectCode: "ง21101" },  // การงานอาชีพ
    { day: "WED", period: 3, subjectCode: "ท21101" },  // ภาษาไทย (คาบที่ 2)
    { day: "THU", period: 1, subjectCode: "ค21101" },  // คณิตศาสตร์ (คาบที่ 2)
    { day: "THU", period: 2, subjectCode: "ว21101" },  // วิทยาศาสตร์ (คาบที่ 2)
    { day: "THU", period: 3, subjectCode: "อ21101" },  // ภาษาอังกฤษ (คาบที่ 2)
    { day: "FRI", period: 1, subjectCode: "ส21101" },  // สังคมศึกษา (คาบที่ 2)
    { day: "FRI", period: 2, subjectCode: "พ21101" },  // พลศึกษา (คาบที่ 2)
    { day: "FRI", period: 3, subjectCode: "ศ21101" },  // ศิลปะ (คาบที่ 2)
  ];

  for (let i = 0; i < 3; i++) {
    const gradeLevel = gradeLevels[i];
    const room = rooms[i % rooms.length];

    for (const schedule of scheduleTemplate) {
      const timeslot = timeslots.find(
        (t) => t.TimeslotID === `${semesterNumber}-${academicYear}-${schedule.day}-${schedule.period}`,
      );

      if (timeslot) {
        const resp = responsibilities.find(
          (r) => r.GradeID === gradeLevel.GradeID && r.SubjectCode === schedule.subjectCode,
        );

        if (resp) {
          try {
            classSchedules.push(
              await withRetry(
                () =>
                  prisma.class_schedule.create({
                    data: {
                      ClassID: `${timeslot.TimeslotID}-${schedule.subjectCode}-${gradeLevel.GradeID}`,
                      TimeslotID: timeslot.TimeslotID,
                      SubjectCode: schedule.subjectCode,
                      GradeID: gradeLevel.GradeID,
                      RoomID: room.RoomID,
                      IsLocked: false,
                      teachers_responsibility: {
                        connect: [{ RespID: resp.RespID }],
                      },
                    },
                  }),
                `Create schedule for ${schedule.subjectCode} in ${gradeLevel.GradeID}`,
              ),
            );
          } catch (error: any) {
            // Skip if constraint violation (subject may not match responsibility)
            if (!error.message?.includes("constraint")) {
              console.warn(`⚠️  Skipping schedule: ${error.message}`);
            }
          }
        }
      }
    }
  }

  // Also create locked schedules for activities (ชุมนุม)
  const clubSubject = activitySubjects.find((s) => s.code === "ACT-CLUB");
  if (clubSubject) {
    for (let i = 0; i < 3; i++) {
      const gradeLevel = gradeLevels[i];
      const timeslot = timeslots.find(
        (t) => t.TimeslotID === `${semesterNumber}-${academicYear}-MON-8`,
      );

      if (timeslot) {
        const activityResp = responsibilities.find(
          (r) =>
            r.GradeID === gradeLevel.GradeID && r.SubjectCode.startsWith("ACT"),
        );

        if (activityResp) {
          classSchedules.push(
            await withRetry(
              () =>
                prisma.class_schedule.create({
                  data: {
                    ClassID: `${timeslot.TimeslotID}-${clubSubject.code}-${gradeLevel.GradeID}`,
                    TimeslotID: timeslot.TimeslotID,
                    SubjectCode: clubSubject.code,
                    GradeID: gradeLevel.GradeID,
                    RoomID: null,
                    IsLocked: true,
                    teachers_responsibility: {
                      connect: [{ RespID: activityResp.RespID }],
                    },
                  },
                }),
              `Create locked schedule for ${clubSubject.code}`,
            ),
          );
        }
      }
    }
  }

  console.log(`✅ Created ${classSchedules.length} sample class schedules (including locked activities)`);

  // ===== SUMMARY =====
  console.log("\n" + "=".repeat(70));
  console.log("🎉 MOE-Compliant Seed Completed Successfully!");
  console.log("=".repeat(70));
  console.log("📊 Database Summary:");
  console.log(`   • Programs: ${programs.length} (3 tracks × 6 years)`);
  console.log(
    `   • Grade Levels: ${gradeLevels.length} (M.1-M.6, 3 sections each)`,
  );
  console.log(`   • Rooms: ${rooms.length} (${BUILDINGS.length} buildings)`);
  console.log(
    `   • Teachers: ${teachers.length} (${DEPARTMENTS.length} departments; target 40 met)`,
  );
  console.log(`   • Subjects: ${totalSubjects} subjects`);
  console.log(`     - Core (8 learning areas): ${coreSubjects.length}`);
  console.log(
    `     - Additional (track-specific): ${additionalSubjects.length}`,
  );
  console.log(`     - Activities (MOE-compliant): ${activitySubjects.length}`);
  const totalTimeslots =
    timeslots.length +
    (typeof timeslotsSem2 !== "undefined" ? timeslotsSem2.length : 0) +
    (typeof timeslotsSem1_2568 !== "undefined" ? timeslotsSem1_2568.length : 0);
  console.log(
    `   • Timeslots: ${totalTimeslots} (3 semesters: 1-2567, 2-2567, 1-2568)`,
  );
  console.log(`   • Teacher Responsibilities: ${responsibilities.length}`);
  console.log(`   • Class Schedules: ${classSchedules.length}`);
  console.log(`   • Table Configurations: 3`);
  console.log("=".repeat(70));
  console.log("\n✨ Your MOE-compliant database is ready!");
  console.log("💡 Features included:");
  console.log("   - ✅ Retry logic for Docker Desktop connection stability");
  console.log("   - ✅ MOE 8 Learning Areas structure");
  console.log(
    "   - ✅ Proper ActivityType (ชุมนุม, ลูกเสือ, แนะแนว, กิจกรรมเพื่อสังคม)",
  );
  console.log(
    "   - ✅ Three program tracks (วิทย์-คณิต, ศิลป์-คำนวณ, ศิลป์-ภาษา)",
  );
  console.log(
    "   - ✅ Realistic teacher workload (1-3 subjects per Ministry standard)",
  );
  console.log("   - ✅ Sample class schedules for visual testing");
  console.log("   - ✅ Locked timeslots for school-wide activities");
  console.log("   - ✅ Grade-program assignments");
  console.log("   - ✅ 3 semesters: 1-2567, 2-2567, 1-2568");
  console.log("=".repeat(70));
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
