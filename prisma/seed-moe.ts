/**
 * MOE-Compliant Seed File for Thai School Timetable System
 * Based on Thai Ministry of Education Basic Education Core Curriculum B.E. 2551 (2008)
 *
 * This seed creates realistic data structure including:
 * - 3 Program tracks: วิทย์-คณิต, ศิลป์-คำนวณ, ศิลป์-ภาษา
 * - MOE 8 Learning Areas with proper credit allocation
 * - Activities: ชุมนุม, ลูกเสือ, แนะแนว, กิจกรรมเพื่อสังคม
 * - Grade levels M.1-M.6 with program assignments
 *
 * Usage:
 *   pnpm tsx prisma/seed-moe.ts
 */

import {
  PrismaClient,
  ProgramTrack,
  SubjectCategory,
  LearningArea,
  ActivityType,
  subject_credit,
} from "../prisma/generated/client";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting MOE-compliant seed...");

  // ===== CLEAN DATA =====
  console.log("🧹 Cleaning existing data...");
  await prisma.class_schedule.deleteMany({});
  await prisma.teachers_responsibility.deleteMany({});
  await prisma.program_subject.deleteMany({});
  await prisma.timeslot.deleteMany({});
  await prisma.table_config.deleteMany({});
  await prisma.gradelevel.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.room.deleteMany({});

  // Keep Auth.js user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@school.local" },
  });

  if (!existingAdmin) {
    const adminPassword = await hashPassword("admin123");
    await prisma.user.create({
      data: {
        email: "admin@school.local",
        name: "System Administrator",
        password: adminPassword,
        role: "admin",
        emailVerified: new Date(),
      },
    });
    console.log("✅ Admin user created");
  }

  // ===== CORE SUBJECTS (พื้นฐาน) =====
  console.log("📚 Creating core subjects...");

  const coreSubjects = [
    // ภาษาไทย (Thai Language)
    {
      code: "TH101",
      name: "ภาษาไทย 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "TH201",
      name: "ภาษาไทย 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "TH301",
      name: "ภาษาไทย 3",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "TH401",
      name: "ภาษาไทย 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "TH501",
      name: "ภาษาไทย 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "TH601",
      name: "ภาษาไทย 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },

    // คณิตศาสตร์ (Mathematics)
    {
      code: "MA101",
      name: "คณิตศาสตร์ 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "MA201",
      name: "คณิตศาสตร์ 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "MA301",
      name: "คณิตศาสตร์ 3",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "MA401",
      name: "คณิตศาสตร์ 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "MA501",
      name: "คณิตศาสตร์ 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "MA601",
      name: "คณิตศาสตร์ 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },

    // วิทยาศาสตร์และเทคโนโลยี (Science & Technology)
    {
      code: "SC101",
      name: "วิทยาศาสตร์ 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC201",
      name: "วิทยาศาสตร์ 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC301",
      name: "วิทยาศาสตร์ 3",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC401",
      name: "วิทยาศาสตร์ 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC501",
      name: "วิทยาศาสตร์ 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC601",
      name: "วิทยาศาสตร์ 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },

    // สังคมศึกษา ศาสนา และวัฒนธรรม (Social Studies, Religion & Culture)
    {
      code: "SO101",
      name: "สังคมศึกษา 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "SO201",
      name: "สังคมศึกษา 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "SO301",
      name: "สังคมศึกษา 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "SO401",
      name: "สังคมศึกษา 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "SO501",
      name: "สังคมศึกษา 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "SO601",
      name: "สังคมศึกษา 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },

    // สุขศึกษาและพลศึกษา (Health & Physical Education)
    {
      code: "PE101",
      name: "พลศึกษา 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "PE201",
      name: "พลศึกษา 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "PE301",
      name: "พลศึกษา 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "PE401",
      name: "พลศึกษา 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "PE501",
      name: "พลศึกษา 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },
    {
      code: "PE601",
      name: "พลศึกษา 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "HEALTH_PE" as LearningArea,
    },

    // ศิลปะ (Arts)
    {
      code: "AR101",
      name: "ศิลปะ 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "AR201",
      name: "ศิลปะ 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "AR301",
      name: "ศิลปะ 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "AR401",
      name: "ศิลปะ 4",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "AR501",
      name: "ศิลปะ 5",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },
    {
      code: "AR601",
      name: "ศิลปะ 6",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "ARTS" as LearningArea,
    },

    // การงานอาชีพ (Career & Technology)
    {
      code: "CA101",
      name: "การงานอาชีพ 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "CA201",
      name: "การงานอาชีพ 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "CA301",
      name: "การงานอาชีพ 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "CA401",
      name: "การงานอาชีพ 4",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "CA501",
      name: "การงานอาชีพ 5",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },
    {
      code: "CA601",
      name: "การงานอาชีพ 6",
      credit: "CREDIT_05" as subject_credit,
      learningArea: "CAREER" as LearningArea,
    },

    // ภาษาต่างประเทศ (Foreign Language - English)
    {
      code: "EN101",
      name: "ภาษาอังกฤษ 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "EN201",
      name: "ภาษาอังกฤษ 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "EN301",
      name: "ภาษาอังกฤษ 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "EN401",
      name: "ภาษาอังกฤษ 4",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "EN501",
      name: "ภาษาอังกฤษ 5",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "EN601",
      name: "ภาษาอังกฤษ 6",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
  ];

  for (const subject of coreSubjects) {
    await prisma.subject.create({
      data: {
        SubjectCode: subject.code,
        SubjectName: subject.name,
        Credit: subject.credit,
        Category: "CORE",
        LearningArea: subject.learningArea,
        IsGraded: true,
      },
    });
  }

  // ===== ADDITIONAL SUBJECTS (เพิ่มเติม) =====
  console.log("➕ Creating additional subjects...");

  const additionalSubjects = [
    // วิทย์-คณิต Track
    {
      code: "MA102",
      name: "คณิตศาสตร์เพิ่มเติม 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "MA202",
      name: "คณิตศาสตร์เพิ่มเติม 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "MA302",
      name: "คณิตศาสตร์เพิ่มเติม 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "SC102",
      name: "วิทยาศาสตร์เพิ่มเติม 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC202",
      name: "วิทยาศาสตร์เพิ่มเติม 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC302",
      name: "วิทยาศาสตร์เพิ่มเติม 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },

    {
      code: "MA402",
      name: "แคลคูลัส 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "MA502",
      name: "แคลคูลัส 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "MATHEMATICS" as LearningArea,
    },
    {
      code: "SC402",
      name: "ฟิสิกส์ 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC502",
      name: "ฟิสิกส์ 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC403",
      name: "เคมี 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC503",
      name: "เคมี 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC404",
      name: "ชีววิทยา 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },
    {
      code: "SC504",
      name: "ชีววิทยา 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "SCIENCE" as LearningArea,
    },

    // ศิลป์-ภาษา Track
    {
      code: "TH102",
      name: "วรรณคดีไทย",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "TH202",
      name: "การเขียนเชิงสร้างสรรค์",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "THAI" as LearningArea,
    },
    {
      code: "EN102",
      name: "ภาษาอังกฤษเพิ่มเติม 1",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "EN202",
      name: "ภาษาอังกฤษเพิ่มเติม 2",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "EN302",
      name: "ภาษาอังกฤษเพิ่มเติม 3",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },

    {
      code: "EN402",
      name: "English Communication 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "EN502",
      name: "English Communication 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "CH401",
      name: "ภาษาจีน 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "CH501",
      name: "ภาษาจีน 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "FR401",
      name: "ภาษาฝรั่งเศส 1",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },
    {
      code: "FR501",
      name: "ภาษาฝรั่งเศส 2",
      credit: "CREDIT_15" as subject_credit,
      learningArea: "FOREIGN_LANGUAGE" as LearningArea,
    },

    {
      code: "SO402",
      name: "ประวัติศาสตร์สากล",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
    {
      code: "SO502",
      name: "เศรษฐศาสตร์เบื้องต้น",
      credit: "CREDIT_10" as subject_credit,
      learningArea: "SOCIAL" as LearningArea,
    },
  ];

  for (const subject of additionalSubjects) {
    await prisma.subject.create({
      data: {
        SubjectCode: subject.code,
        SubjectName: subject.name,
        Credit: subject.credit,
        Category: "ADDITIONAL",
        LearningArea: subject.learningArea,
        IsGraded: true,
      },
    });
  }

  // ===== ACTIVITY SUBJECTS (กิจกรรมพัฒนาผู้เรียน) =====
  console.log("🎭 Creating activity subjects...");

  const activitySubjects = [
    { code: "ACT-CLUB", name: "ชุมนุม", activityType: "CLUB" as ActivityType },
    {
      code: "ACT-SCOUT-M1",
      name: "ลูกเสือ ม.1",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-SCOUT-M2",
      name: "ลูกเสือ ม.2",
      activityType: "SCOUT" as ActivityType,
    },
    {
      code: "ACT-SCOUT-M3",
      name: "ลูกเสือ ม.3",
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
    {
      code: "ACT-GUIDE",
      name: "แนะแนว",
      activityType: "GUIDANCE" as ActivityType,
    },
    {
      code: "ACT-SERVICE",
      name: "กิจกรรมเพื่อสังคมและสาธารณประโยชน์",
      activityType: "SOCIAL_SERVICE" as ActivityType,
    },
  ];

  for (const subject of activitySubjects) {
    await prisma.subject.create({
      data: {
        SubjectCode: subject.code,
        SubjectName: subject.name,
        Credit: "CREDIT_10", // 1 hour/week
        Category: "ACTIVITY",
        ActivityType: subject.activityType,
        IsGraded: false,
      },
    });
  }

  console.log(
    `✅ Created ${coreSubjects.length + additionalSubjects.length + activitySubjects.length} subjects`,
  );

  // ===== PROGRAMS (หลักสูตร) =====
  console.log("🎓 Creating programs...");

  const programs = [];

  // M.1 Programs
  programs.push(
    await prisma.program.create({
      data: {
        ProgramCode: "M1-SCI",
        ProgramName: "หลักสูตรวิทย์-คณิต ม.1",
        Year: 1,
        Track: "SCIENCE_MATH",
        MinTotalCredits: 43,
        Description:
          "หลักสูตรเน้นวิทยาศาสตร์และคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 1",
      },
    }),
  );

  programs.push(
    await prisma.program.create({
      data: {
        ProgramCode: "M1-LANG-MATH",
        ProgramName: "หลักสูตรศิลป์-คำนวณ ม.1",
        Year: 1,
        Track: "LANGUAGE_MATH",
        MinTotalCredits: 43,
        Description:
          "หลักสูตรเน้นภาษาและคณิตศาสตร์สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 1",
      },
    }),
  );

  programs.push(
    await prisma.program.create({
      data: {
        ProgramCode: "M1-LANG",
        ProgramName: "หลักสูตรศิลป์-ภาษา ม.1",
        Year: 1,
        Track: "LANGUAGE_ARTS",
        MinTotalCredits: 43,
        Description:
          "หลักสูตรเน้นภาษาและศิลปะสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 1",
      },
    }),
  );

  // M.2-M.3 Programs (similar structure)
  for (let year = 2; year <= 3; year++) {
    programs.push(
      await prisma.program.create({
        data: {
          ProgramCode: `M${year}-SCI`,
          ProgramName: `หลักสูตรวิทย์-คณิต ม.${year}`,
          Year: year,
          Track: "SCIENCE_MATH",
          MinTotalCredits: 43,
        },
      }),
    );

    programs.push(
      await prisma.program.create({
        data: {
          ProgramCode: `M${year}-LANG-MATH`,
          ProgramName: `หลักสูตรศิลป์-คำนวณ ม.${year}`,
          Year: year,
          Track: "LANGUAGE_MATH",
          MinTotalCredits: 43,
        },
      }),
    );

    programs.push(
      await prisma.program.create({
        data: {
          ProgramCode: `M${year}-LANG`,
          ProgramName: `หลักสูตรศิลป์-ภาษา ม.${year}`,
          Year: year,
          Track: "LANGUAGE_ARTS",
          MinTotalCredits: 43,
        },
      }),
    );
  }

  // M.4-M.6 Programs (track selection becomes important)
  for (let year = 4; year <= 6; year++) {
    programs.push(
      await prisma.program.create({
        data: {
          ProgramCode: `M${year}-SCI`,
          ProgramName: `หลักสูตรวิทย์-คณิต ม.${year}`,
          Year: year,
          Track: "SCIENCE_MATH",
          MinTotalCredits: 40,
        },
      }),
    );

    programs.push(
      await prisma.program.create({
        data: {
          ProgramCode: `M${year}-LANG-MATH`,
          ProgramName: `หลักสูตรศิลป์-คำนวณ ม.${year}`,
          Year: year,
          Track: "LANGUAGE_MATH",
          MinTotalCredits: 40,
        },
      }),
    );

    programs.push(
      await prisma.program.create({
        data: {
          ProgramCode: `M${year}-LANG`,
          ProgramName: `หลักสูตรศิลป์-ภาษา ม.${year}`,
          Year: year,
          Track: "LANGUAGE_ARTS",
          MinTotalCredits: 40,
        },
      }),
    );
  }

  console.log(`✅ Created ${programs.length} programs`);

  // ===== PROGRAM-SUBJECT ASSIGNMENTS (Example for M.1 Science-Math) =====
  console.log("🔗 Assigning subjects to M.1 Science-Math program...");

  const m1SciProgram = programs.find((p) => p.ProgramCode === "M1-SCI")!;

  const m1SciSubjects = [
    // Core subjects (all mandatory)
    {
      code: "TH101",
      category: "CORE" as SubjectCategory,
      minCredits: 1.5,
      mandatory: true,
    },
    {
      code: "MA101",
      category: "CORE" as SubjectCategory,
      minCredits: 1.5,
      mandatory: true,
    },
    {
      code: "SC101",
      category: "CORE" as SubjectCategory,
      minCredits: 1.5,
      mandatory: true,
    },
    {
      code: "SO101",
      category: "CORE" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },
    {
      code: "PE101",
      category: "CORE" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },
    {
      code: "AR101",
      category: "CORE" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },
    {
      code: "CA101",
      category: "CORE" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },
    {
      code: "EN101",
      category: "CORE" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },

    // Additional subjects (track-specific)
    {
      code: "MA102",
      category: "ADDITIONAL" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },
    {
      code: "SC102",
      category: "ADDITIONAL" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },

    // Activities
    {
      code: "ACT-CLUB",
      category: "ACTIVITY" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },
    {
      code: "ACT-SCOUT-M1",
      category: "ACTIVITY" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },
    {
      code: "ACT-GUIDE",
      category: "ACTIVITY" as SubjectCategory,
      minCredits: 1.0,
      mandatory: true,
    },
    {
      code: "ACT-SERVICE",
      category: "ACTIVITY" as SubjectCategory,
      minCredits: 0.5,
      mandatory: true,
    },
  ];

  let sortOrder = 1;
  for (const ps of m1SciSubjects) {
    await prisma.program_subject.create({
      data: {
        ProgramID: m1SciProgram.ProgramID,
        SubjectCode: ps.code,
        Category: ps.category,
        IsMandatory: ps.mandatory,
        MinCredits: ps.minCredits,
        SortOrder: sortOrder++,
      },
    });
  }

  console.log(
    `✅ Assigned ${m1SciSubjects.length} subjects to M.1 Science-Math program`,
  );
  console.log("ℹ️  Other programs can be populated similarly via the UI");

  // ===== GRADE LEVELS =====
  console.log("🏫 Creating grade levels...");

  const gradeLevels = [];

  // Create 3 sections per grade (M.1/1, M.1/2, M.1/3, etc.)
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
        await prisma.gradelevel.create({
          data: {
            GradeID: gradeId,
            Year: year,
            Number: number,
            StudentCount: 35 + Math.floor(Math.random() * 10), // 35-44 students
            ProgramID: program?.ProgramID,
          },
        }),
      );
    }
  }

  console.log(
    `✅ Created ${gradeLevels.length} grade levels with program assignments`,
  );

  // ===== TEACHERS =====
  console.log("👨‍🏫 Creating sample teachers...");

  const teachers = [
    {
      prefix: "นาย",
      firstname: "สมชาย",
      lastname: "วิชาการ",
      dept: "คณิตศาสตร์",
      email: "somchai@school.local",
    },
    {
      prefix: "นางสาว",
      firstname: "สุดารัตน์",
      lastname: "วิทยา",
      dept: "วิทยาศาสตร์",
      email: "sudarat@school.local",
    },
    {
      prefix: "นาง",
      firstname: "วรรณา",
      lastname: "ภาษา",
      dept: "ภาษาไทย",
      email: "wanna@school.local",
    },
    {
      prefix: "นาย",
      firstname: "ประวิทย์",
      lastname: "อังกฤษ",
      dept: "ภาษาอังกฤษ",
      email: "prawit@school.local",
    },
    {
      prefix: "นางสาว",
      firstname: "นิภา",
      lastname: "สังคม",
      dept: "สังคมศึกษา",
      email: "nipa@school.local",
    },
  ];

  for (const t of teachers) {
    await prisma.teacher.create({
      data: {
        Prefix: t.prefix,
        Firstname: t.firstname,
        Lastname: t.lastname,
        Department: t.dept,
        Email: t.email,
        Role: "teacher",
      },
    });
  }

  console.log(`✅ Created ${teachers.length} teachers`);

  // ===== ROOMS =====
  console.log("🚪 Creating rooms...");

  const rooms = [];
  for (let i = 1; i <= 20; i++) {
    rooms.push(
      await prisma.room.create({
        data: {
          RoomName: `ห้อง ${i}`,
          Building: i <= 10 ? "อาคาร 1" : "อาคาร 2",
          Floor: Math.ceil((i % 10 || 10) / 5).toString(),
        },
      }),
    );
  }

  console.log(`✅ Created ${rooms.length} rooms`);

  console.log("");
  console.log("✅ MOE-compliant seed completed!");
  console.log("");
  console.log("📊 Summary:");
  console.log(
    `   - ${programs.length} programs (วิทย์-คณิต, ศิลป์-คำนวณ, ศิลป์-ภาษา)`,
  );
  console.log(
    `   - ${gradeLevels.length} grade levels (M.1-M.6, 3 sections each)`,
  );
  console.log(`   - ${coreSubjects.length} core subjects`);
  console.log(`   - ${additionalSubjects.length} additional subjects`);
  console.log(`   - ${activitySubjects.length} activity subjects`);
  console.log(`   - ${teachers.length} teachers`);
  console.log(`   - ${rooms.length} rooms`);
  console.log("");
  console.log("🎯 Next steps:");
  console.log("   1. Assign remaining subjects to other programs via UI");
  console.log("   2. Create timeslots for the semester");
  console.log("   3. Assign teachers to subjects (teachers_responsibility)");
  console.log("   4. Build the timetable (class_schedule)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
