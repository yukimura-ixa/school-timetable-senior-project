/**
 * Full Semester Seed - MOE-Compliant Complete School Data
 *
 * Creates a comprehensive, production-ready semester dataset following
 * Thai Ministry of Education (MOE) Basic Education Core Curriculum B.E. 2551 standards.
 *
 * Data Created:
 * =============================================================================
 * - 6 Grade Levels: M.1 through M.6 (3 sections each = 18 total classrooms)
 * - 3 Programs: วิทย์-คณิต, ศิลป์-คำนวณ, ศิลป์-ภาษา
 * - 60+ Subjects following MOE subject code patterns (ท21101, ค21101, etc.)
 * - 40+ Teachers across 8 MOE learning areas
 * - 41 Rooms across 3 buildings
 * - Full timeslot grid (8 periods × 5 days × 2 semesters)
 * - Teacher responsibilities and sample class schedules
 *
 * MOE Learning Areas (8 areas):
 * - ท (ภาษาไทย) - Thai Language
 * - ค (คณิตศาสตร์) - Mathematics
 * - ว (วิทยาศาสตร์) - Science & Technology
 * - ส (สังคมศึกษา) - Social Studies
 * - พ (สุขศึกษาและพลศึกษา) - Health & PE
 * - ศ (ศิลปะ) - Arts
 * - ง (การงานอาชีพ) - Career & Technology
 * - อ (ภาษาต่างประเทศ) - Foreign Languages
 *
 * Usage:
 *   npx tsx scripts/seed-semester-full.ts
 *   - or -
 *   pnpm db:seed:full
 * =============================================================================
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

// ===========================================================================
// DATABASE CONNECTION
// ===========================================================================
const connectionString = process.env.DATABASE_URL!;

let prisma: PrismaClient;

async function initPrisma(): Promise<PrismaClient> {
  if (connectionString.startsWith("prisma+")) {
    // Prisma Accelerate path - use dynamic import for ESM compatibility
    const { withAccelerate } = await import("@prisma/extension-accelerate");
    return new PrismaClient({
      log: ["error", "warn"],
      errorFormat: "minimal",
      accelerateUrl: connectionString,
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  } else {
    // Direct Postgres connection
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({
      log: ["error", "warn"],
      errorFormat: "minimal",
      adapter,
    });
  }
}

// ===========================================================================
// CONFIGURATION
// ===========================================================================
const ACADEMIC_YEAR = 2568;
const SEMESTERS = [
  { semester: "SEMESTER_1" as semester, number: 1 },
  { semester: "SEMESTER_2" as semester, number: 2 },
];
const DAYS: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];
const PERIODS = [
  { num: 1, start: "08:30", end: "09:20", break: "NOT_BREAK" as breaktime },
  { num: 2, start: "09:20", end: "10:10", break: "NOT_BREAK" as breaktime },
  { num: 3, start: "10:10", end: "11:00", break: "NOT_BREAK" as breaktime },
  { num: 4, start: "11:00", end: "11:50", break: "NOT_BREAK" as breaktime },
  { num: 5, start: "12:50", end: "13:40", break: "BREAK_JUNIOR" as breaktime },
  { num: 6, start: "13:40", end: "14:30", break: "BREAK_SENIOR" as breaktime },
  { num: 7, start: "14:30", end: "15:20", break: "NOT_BREAK" as breaktime },
  { num: 8, start: "15:20", end: "16:10", break: "NOT_BREAK" as breaktime },
];

// ===========================================================================
// MOE SUBJECT DATA
// ===========================================================================

/**
 * MOE Subject Code Format: [Thai Letter][Level][Year][Type][Sequence]
 * - Thai Letter: ท, ค, ว, ส, พ, ศ, ง, อ (8 learning areas)
 * - Level: 1=Primary, 2=Lower Secondary (M.1-3), 3=Upper Secondary (M.4-6)
 * - Year: 1-3 within level
 * - Type: 1=Core, 2=Additional
 * - Sequence: 01-99
 */

interface SubjectDef {
  code: string;
  name: string;
  credit: subject_credit;
  learningArea: LearningArea | null;
  category: SubjectCategory;
  activityType?: ActivityType;
}

// Lower Secondary Subjects (M.1-M.3) - Level 2
const LOWER_SECONDARY_SUBJECTS: SubjectDef[] = [
  // ภาษาไทย (Core)
  {
    code: "ท21101",
    name: "ภาษาไทย พื้นฐาน 1",
    credit: "CREDIT_15",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท21102",
    name: "ภาษาไทย พื้นฐาน 2",
    credit: "CREDIT_15",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท22101",
    name: "ภาษาไทย พื้นฐาน 3",
    credit: "CREDIT_15",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท22102",
    name: "ภาษาไทย พื้นฐาน 4",
    credit: "CREDIT_15",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท23101",
    name: "ภาษาไทย พื้นฐาน 5",
    credit: "CREDIT_15",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท23102",
    name: "ภาษาไทย พื้นฐาน 6",
    credit: "CREDIT_15",
    learningArea: "THAI",
    category: "CORE",
  },

  // คณิตศาสตร์ (Core)
  {
    code: "ค21101",
    name: "คณิตศาสตร์ พื้นฐาน 1",
    credit: "CREDIT_15",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค21102",
    name: "คณิตศาสตร์ พื้นฐาน 2",
    credit: "CREDIT_15",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค22101",
    name: "คณิตศาสตร์ พื้นฐาน 3",
    credit: "CREDIT_15",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค22102",
    name: "คณิตศาสตร์ พื้นฐาน 4",
    credit: "CREDIT_15",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค23101",
    name: "คณิตศาสตร์ พื้นฐาน 5",
    credit: "CREDIT_15",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค23102",
    name: "คณิตศาสตร์ พื้นฐาน 6",
    credit: "CREDIT_15",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  // คณิตศาสตร์ (Additional)
  {
    code: "ค21201",
    name: "คณิตศาสตร์ เพิ่มเติม 1",
    credit: "CREDIT_10",
    learningArea: "MATHEMATICS",
    category: "ADDITIONAL",
  },
  {
    code: "ค22201",
    name: "คณิตศาสตร์ เพิ่มเติม 2",
    credit: "CREDIT_10",
    learningArea: "MATHEMATICS",
    category: "ADDITIONAL",
  },
  {
    code: "ค23201",
    name: "คณิตศาสตร์ เพิ่มเติม 3",
    credit: "CREDIT_10",
    learningArea: "MATHEMATICS",
    category: "ADDITIONAL",
  },

  // วิทยาศาสตร์และเทคโนโลยี (Core)
  {
    code: "ว21101",
    name: "วิทยาศาสตร์ พื้นฐาน 1",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "CORE",
  },
  {
    code: "ว21102",
    name: "วิทยาศาสตร์ พื้นฐาน 2",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "CORE",
  },
  {
    code: "ว22101",
    name: "วิทยาศาสตร์ พื้นฐาน 3",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "CORE",
  },
  {
    code: "ว22102",
    name: "วิทยาศาสตร์ พื้นฐาน 4",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "CORE",
  },
  {
    code: "ว23101",
    name: "วิทยาศาสตร์ พื้นฐาน 5",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "CORE",
  },
  {
    code: "ว23102",
    name: "วิทยาศาสตร์ พื้นฐาน 6",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "CORE",
  },
  // วิทยาศาสตร์ (Additional)
  {
    code: "ว21201",
    name: "วิทยาศาสตร์ เพิ่มเติม 1",
    credit: "CREDIT_10",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว22201",
    name: "วิทยาศาสตร์ เพิ่มเติม 2",
    credit: "CREDIT_10",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว23201",
    name: "วิทยาศาสตร์ เพิ่มเติม 3",
    credit: "CREDIT_10",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },

  // สังคมศึกษา (Core)
  {
    code: "ส21101",
    name: "สังคมศึกษา พื้นฐาน 1",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส21102",
    name: "สังคมศึกษา พื้นฐาน 2",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส22101",
    name: "สังคมศึกษา พื้นฐาน 3",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส22102",
    name: "สังคมศึกษา พื้นฐาน 4",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส23101",
    name: "สังคมศึกษา พื้นฐาน 5",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส23102",
    name: "สังคมศึกษา พื้นฐาน 6",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },

  // สุขศึกษาและพลศึกษา (Core)
  {
    code: "พ21101",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 1",
    credit: "CREDIT_10",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ21102",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 2",
    credit: "CREDIT_10",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ22101",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 3",
    credit: "CREDIT_10",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ22102",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 4",
    credit: "CREDIT_10",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ23101",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 5",
    credit: "CREDIT_10",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ23102",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 6",
    credit: "CREDIT_10",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },

  // ศิลปะ (Core)
  {
    code: "ศ21101",
    name: "ศิลปะ พื้นฐาน 1",
    credit: "CREDIT_10",
    learningArea: "ARTS",
    category: "CORE",
  },
  {
    code: "ศ21102",
    name: "ศิลปะ พื้นฐาน 2",
    credit: "CREDIT_10",
    learningArea: "ARTS",
    category: "CORE",
  },
  {
    code: "ศ22101",
    name: "ศิลปะ พื้นฐาน 3",
    credit: "CREDIT_10",
    learningArea: "ARTS",
    category: "CORE",
  },
  {
    code: "ศ22102",
    name: "ศิลปะ พื้นฐาน 4",
    credit: "CREDIT_10",
    learningArea: "ARTS",
    category: "CORE",
  },
  {
    code: "ศ23101",
    name: "ศิลปะ พื้นฐาน 5",
    credit: "CREDIT_10",
    learningArea: "ARTS",
    category: "CORE",
  },
  {
    code: "ศ23102",
    name: "ศิลปะ พื้นฐาน 6",
    credit: "CREDIT_10",
    learningArea: "ARTS",
    category: "CORE",
  },

  // การงานอาชีพ (Core)
  {
    code: "ง21101",
    name: "การงานอาชีพ พื้นฐาน 1",
    credit: "CREDIT_10",
    learningArea: "CAREER",
    category: "CORE",
  },
  {
    code: "ง21102",
    name: "การงานอาชีพ พื้นฐาน 2",
    credit: "CREDIT_10",
    learningArea: "CAREER",
    category: "CORE",
  },
  {
    code: "ง22101",
    name: "การงานอาชีพ พื้นฐาน 3",
    credit: "CREDIT_10",
    learningArea: "CAREER",
    category: "CORE",
  },
  {
    code: "ง22102",
    name: "การงานอาชีพ พื้นฐาน 4",
    credit: "CREDIT_10",
    learningArea: "CAREER",
    category: "CORE",
  },
  {
    code: "ง23101",
    name: "การงานอาชีพ พื้นฐาน 5",
    credit: "CREDIT_10",
    learningArea: "CAREER",
    category: "CORE",
  },
  {
    code: "ง23102",
    name: "การงานอาชีพ พื้นฐาน 6",
    credit: "CREDIT_10",
    learningArea: "CAREER",
    category: "CORE",
  },

  // ภาษาอังกฤษ (Core)
  {
    code: "อ21101",
    name: "ภาษาอังกฤษ พื้นฐาน 1",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ21102",
    name: "ภาษาอังกฤษ พื้นฐาน 2",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ22101",
    name: "ภาษาอังกฤษ พื้นฐาน 3",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ22102",
    name: "ภาษาอังกฤษ พื้นฐาน 4",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ23101",
    name: "ภาษาอังกฤษ พื้นฐาน 5",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ23102",
    name: "ภาษาอังกฤษ พื้นฐาน 6",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  // ภาษาอังกฤษ (Additional)
  {
    code: "อ21201",
    name: "ภาษาอังกฤษ เพิ่มเติม 1",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "ADDITIONAL",
  },
  {
    code: "อ22201",
    name: "ภาษาอังกฤษ เพิ่มเติม 2",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "ADDITIONAL",
  },
  {
    code: "อ23201",
    name: "ภาษาอังกฤษ เพิ่มเติม 3",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "ADDITIONAL",
  },
];

// Upper Secondary Subjects (M.4-M.6) - Level 3
const UPPER_SECONDARY_SUBJECTS: SubjectDef[] = [
  // ภาษาไทย (Core)
  {
    code: "ท31101",
    name: "ภาษาไทย พื้นฐาน 1",
    credit: "CREDIT_10",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท31102",
    name: "ภาษาไทย พื้นฐาน 2",
    credit: "CREDIT_10",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท32101",
    name: "ภาษาไทย พื้นฐาน 3",
    credit: "CREDIT_10",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท32102",
    name: "ภาษาไทย พื้นฐาน 4",
    credit: "CREDIT_10",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท33101",
    name: "ภาษาไทย พื้นฐาน 5",
    credit: "CREDIT_10",
    learningArea: "THAI",
    category: "CORE",
  },
  {
    code: "ท33102",
    name: "ภาษาไทย พื้นฐาน 6",
    credit: "CREDIT_10",
    learningArea: "THAI",
    category: "CORE",
  },

  // คณิตศาสตร์ (Core)
  {
    code: "ค31101",
    name: "คณิตศาสตร์ พื้นฐาน 1",
    credit: "CREDIT_10",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค31102",
    name: "คณิตศาสตร์ พื้นฐาน 2",
    credit: "CREDIT_10",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค32101",
    name: "คณิตศาสตร์ พื้นฐาน 3",
    credit: "CREDIT_10",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค32102",
    name: "คณิตศาสตร์ พื้นฐาน 4",
    credit: "CREDIT_10",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค33101",
    name: "คณิตศาสตร์ พื้นฐาน 5",
    credit: "CREDIT_10",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  {
    code: "ค33102",
    name: "คณิตศาสตร์ พื้นฐาน 6",
    credit: "CREDIT_10",
    learningArea: "MATHEMATICS",
    category: "CORE",
  },
  // คณิตศาสตร์ (Additional - Science-Math track)
  {
    code: "ค31201",
    name: "คณิตศาสตร์ เพิ่มเติม 1",
    credit: "CREDIT_20",
    learningArea: "MATHEMATICS",
    category: "ADDITIONAL",
  },
  {
    code: "ค31202",
    name: "คณิตศาสตร์ เพิ่มเติม 2",
    credit: "CREDIT_20",
    learningArea: "MATHEMATICS",
    category: "ADDITIONAL",
  },
  {
    code: "ค32201",
    name: "คณิตศาสตร์ เพิ่มเติม 3",
    credit: "CREDIT_20",
    learningArea: "MATHEMATICS",
    category: "ADDITIONAL",
  },
  {
    code: "ค32202",
    name: "คณิตศาสตร์ เพิ่มเติม 4",
    credit: "CREDIT_20",
    learningArea: "MATHEMATICS",
    category: "ADDITIONAL",
  },
  {
    code: "ค33201",
    name: "คณิตศาสตร์ เพิ่มเติม 5",
    credit: "CREDIT_20",
    learningArea: "MATHEMATICS",
    category: "ADDITIONAL",
  },
  {
    code: "ค33202",
    name: "คณิตศาสตร์ เพิ่มเติม 6",
    credit: "CREDIT_20",
    learningArea: "MATHEMATICS",
    category: "ADDITIONAL",
  },

  // วิทยาศาสตร์ (Core)
  {
    code: "ว31101",
    name: "วิทยาศาสตร์ พื้นฐาน",
    credit: "CREDIT_10",
    learningArea: "SCIENCE",
    category: "CORE",
  },
  {
    code: "ว31102",
    name: "วิทยาศาสตร์โลกและอวกาศ",
    credit: "CREDIT_10",
    learningArea: "SCIENCE",
    category: "CORE",
  },
  // วิทยาศาสตร์ (Additional - Science-Math track)
  {
    code: "ว31201",
    name: "ฟิสิกส์ 1",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว31202",
    name: "ฟิสิกส์ 2",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว31221",
    name: "เคมี 1",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว31222",
    name: "เคมี 2",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว31241",
    name: "ชีววิทยา 1",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว31242",
    name: "ชีววิทยา 2",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว32201",
    name: "ฟิสิกส์ 3",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว32202",
    name: "ฟิสิกส์ 4",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว32221",
    name: "เคมี 3",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว32222",
    name: "เคมี 4",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว32241",
    name: "ชีววิทยา 3",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },
  {
    code: "ว32242",
    name: "ชีววิทยา 4",
    credit: "CREDIT_15",
    learningArea: "SCIENCE",
    category: "ADDITIONAL",
  },

  // สังคมศึกษา (Core)
  {
    code: "ส31101",
    name: "สังคมศึกษา พื้นฐาน 1",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส31102",
    name: "สังคมศึกษา พื้นฐาน 2",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส32101",
    name: "สังคมศึกษา พื้นฐาน 3",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส32102",
    name: "สังคมศึกษา พื้นฐาน 4",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส33101",
    name: "สังคมศึกษา พื้นฐาน 5",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },
  {
    code: "ส33102",
    name: "สังคมศึกษา พื้นฐาน 6",
    credit: "CREDIT_10",
    learningArea: "SOCIAL",
    category: "CORE",
  },

  // สุขศึกษาและพลศึกษา (Core)
  {
    code: "พ31101",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 1",
    credit: "CREDIT_05",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ31102",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 2",
    credit: "CREDIT_05",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ32101",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 3",
    credit: "CREDIT_05",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ32102",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 4",
    credit: "CREDIT_05",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ33101",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 5",
    credit: "CREDIT_05",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },
  {
    code: "พ33102",
    name: "สุขศึกษาและพลศึกษา พื้นฐาน 6",
    credit: "CREDIT_05",
    learningArea: "HEALTH_PE",
    category: "CORE",
  },

  // ภาษาอังกฤษ (Core)
  {
    code: "อ31101",
    name: "ภาษาอังกฤษ พื้นฐาน 1",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ31102",
    name: "ภาษาอังกฤษ พื้นฐาน 2",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ32101",
    name: "ภาษาอังกฤษ พื้นฐาน 3",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ32102",
    name: "ภาษาอังกฤษ พื้นฐาน 4",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ33101",
    name: "ภาษาอังกฤษ พื้นฐาน 5",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
  {
    code: "อ33102",
    name: "ภาษาอังกฤษ พื้นฐาน 6",
    credit: "CREDIT_10",
    learningArea: "FOREIGN_LANGUAGE",
    category: "CORE",
  },
];

// Activity Subjects
const ACTIVITY_SUBJECTS: SubjectDef[] = [
  {
    code: "ACT-CLUB",
    name: "ชุมนุม",
    credit: "CREDIT_10",
    learningArea: null,
    category: "ACTIVITY",
    activityType: "CLUB",
  },
  {
    code: "ACT-SCOUT",
    name: "ลูกเสือ-เนตรนารี",
    credit: "CREDIT_10",
    learningArea: null,
    category: "ACTIVITY",
    activityType: "SCOUT",
  },
  {
    code: "ACT-GUIDE",
    name: "แนะแนว",
    credit: "CREDIT_05",
    learningArea: null,
    category: "ACTIVITY",
    activityType: "GUIDANCE",
  },
  {
    code: "ACT-SERVICE",
    name: "กิจกรรมเพื่อสังคม",
    credit: "CREDIT_05",
    learningArea: null,
    category: "ACTIVITY",
    activityType: "SOCIAL_SERVICE",
  },
];

const ALL_SUBJECTS = [
  ...LOWER_SECONDARY_SUBJECTS,
  ...UPPER_SECONDARY_SUBJECTS,
  ...ACTIVITY_SUBJECTS,
];

// ===========================================================================
// TEACHER DATA
// ===========================================================================
interface TeacherDef {
  prefix: string;
  firstname: string;
  lastname: string;
  department: string;
  email: string;
}

const TEACHERS: TeacherDef[] = [
  // ภาษาไทย (5 teachers)
  {
    prefix: "ครู",
    firstname: "สมชาย",
    lastname: "ทองดี",
    department: "ภาษาไทย",
    email: "somchai.t@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "สมหญิง",
    lastname: "ใจงาม",
    department: "ภาษาไทย",
    email: "somying.j@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ประเสริฐ",
    lastname: "วรรณกุล",
    department: "ภาษาไทย",
    email: "prasert.w@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "นภา",
    lastname: "พงษ์ไพร",
    department: "ภาษาไทย",
    email: "napha.p@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "วิมล",
    lastname: "ศรีสุข",
    department: "ภาษาไทย",
    email: "wimon.s@school.ac.th",
  },

  // คณิตศาสตร์ (6 teachers)
  {
    prefix: "ครู",
    firstname: "สมศักดิ์",
    lastname: "คณิตเก่ง",
    department: "คณิตศาสตร์",
    email: "somsak.k@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "มาลี",
    lastname: "เลขดี",
    department: "คณิตศาสตร์",
    email: "malee.l@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "วิชัย",
    lastname: "จำนวนมาก",
    department: "คณิตศาสตร์",
    email: "wichai.j@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "สุดา",
    lastname: "พีชคณิต",
    department: "คณิตศาสตร์",
    email: "suda.p@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ประสิทธิ์",
    lastname: "สถิติศาสตร์",
    department: "คณิตศาสตร์",
    email: "prasit.s@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "นิรันดร์",
    lastname: "แคลคูลัส",
    department: "คณิตศาสตร์",
    email: "nirun.c@school.ac.th",
  },

  // วิทยาศาสตร์และเทคโนโลยี (8 teachers)
  {
    prefix: "ครู",
    firstname: "วิทยา",
    lastname: "ศาสตร์เลิศ",
    department: "วิทยาศาสตร์และเทคโนโลยี",
    email: "witthaya.s@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "พรรณี",
    lastname: "ฟิสิกส์",
    department: "วิทยาศาสตร์และเทคโนโลยี",
    email: "phanni.f@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "สมพร",
    lastname: "เคมี",
    department: "วิทยาศาสตร์และเทคโนโลยี",
    email: "somporn.k@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "อรุณ",
    lastname: "ชีวะ",
    department: "วิทยาศาสตร์และเทคโนโลยี",
    email: "arun.c@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ดวงใจ",
    lastname: "ทดลอง",
    department: "วิทยาศาสตร์และเทคโนโลยี",
    email: "duangjai.t@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "พิษณุ",
    lastname: "นิวเคลียร์",
    department: "วิทยาศาสตร์และเทคโนโลยี",
    email: "pitsanu.n@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "กมลา",
    lastname: "ดาราศาสตร์",
    department: "วิทยาศาสตร์และเทคโนโลยี",
    email: "kamala.d@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ธนา",
    lastname: "คอมพิวเตอร์",
    department: "วิทยาศาสตร์และเทคโนโลยี",
    email: "thana.c@school.ac.th",
  },

  // สังคมศึกษา (5 teachers)
  {
    prefix: "ครู",
    firstname: "ประวัติ",
    lastname: "ศาสตร์เด่น",
    department: "สังคมศึกษา",
    email: "prawat.s@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ภูมิ",
    lastname: "ศาสตร์ดี",
    department: "สังคมศึกษา",
    email: "phum.s@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ศรัทธา",
    lastname: "ธรรมะ",
    department: "สังคมศึกษา",
    email: "sattha.t@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "พลเมือง",
    lastname: "ดีเลิศ",
    department: "สังคมศึกษา",
    email: "ponlamueang.d@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "เศรษฐ์",
    lastname: "กิจดี",
    department: "สังคมศึกษา",
    email: "set.k@school.ac.th",
  },

  // สุขศึกษาและพลศึกษา (4 teachers)
  {
    prefix: "ครู",
    firstname: "กีฬา",
    lastname: "แข็งแรง",
    department: "สุขศึกษาและพลศึกษา",
    email: "keela.k@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "สุขภาพ",
    lastname: "ดีมาก",
    department: "สุขศึกษาและพลศึกษา",
    email: "sukkaphap.d@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "นักกีฬา",
    lastname: "เก่งมาก",
    department: "สุขศึกษาและพลศึกษา",
    email: "nakkeela.g@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "พละ",
    lastname: "ศึกษา",
    department: "สุขศึกษาและพลศึกษา",
    email: "pala.s@school.ac.th",
  },

  // ศิลปะ (4 teachers)
  {
    prefix: "ครู",
    firstname: "ศิลป์",
    lastname: "งามเลิศ",
    department: "ศิลปะ",
    email: "sin.n@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ดนตรี",
    lastname: "ไพเราะ",
    department: "ศิลปะ",
    email: "dontri.p@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "นาฏ",
    lastname: "ศิลป์งาม",
    department: "ศิลปะ",
    email: "nat.s@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "จิตร",
    lastname: "กรรม",
    department: "ศิลปะ",
    email: "jit.k@school.ac.th",
  },

  // การงานอาชีพ (4 teachers)
  {
    prefix: "ครู",
    firstname: "อาชีพ",
    lastname: "ดีเยี่ยม",
    department: "การงานอาชีพ",
    email: "acheep.d@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "เทคโน",
    lastname: "โลยี",
    department: "การงานอาชีพ",
    email: "techno.l@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ช่าง",
    lastname: "ฝีมือ",
    department: "การงานอาชีพ",
    email: "chang.f@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "คหกรรม",
    lastname: "ศาสตร์",
    department: "การงานอาชีพ",
    email: "kahakam.s@school.ac.th",
  },

  // ภาษาต่างประเทศ (6 teachers)
  {
    prefix: "Mr.",
    firstname: "John",
    lastname: "Smith",
    department: "ภาษาต่างประเทศ",
    email: "john.s@school.ac.th",
  },
  {
    prefix: "Ms.",
    firstname: "Sarah",
    lastname: "Johnson",
    department: "ภาษาต่างประเทศ",
    email: "sarah.j@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ภาษา",
    lastname: "อังกฤษ",
    department: "ภาษาต่างประเทศ",
    email: "phasa.a@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "จีน",
    lastname: "ภาษา",
    department: "ภาษาต่างประเทศ",
    email: "jeen.p@school.ac.th",
  },
  {
    prefix: "ครู",
    firstname: "ญี่ปุ่น",
    lastname: "ภาษา",
    department: "ภาษาต่างประเทศ",
    email: "yeepun.p@school.ac.th",
  },
  {
    prefix: "Mr.",
    firstname: "David",
    lastname: "Brown",
    department: "ภาษาต่างประเทศ",
    email: "david.b@school.ac.th",
  },
];

// ===========================================================================
// PROGRAM DATA
// ===========================================================================
interface ProgramDef {
  code: string;
  name: string;
  track: ProgramTrack;
  year: number;
  minCredits: number;
  description: string;
}

const PROGRAMS: ProgramDef[] = [
  // Lower Secondary Programs (Year 1-3)
  {
    code: "M1-GEN",
    name: "หลักสูตรทั่วไป ม.1",
    track: "GENERAL",
    year: 1,
    minCredits: 40,
    description: "หลักสูตรทั่วไปสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 1",
  },
  {
    code: "M2-GEN",
    name: "หลักสูตรทั่วไป ม.2",
    track: "GENERAL",
    year: 2,
    minCredits: 40,
    description: "หลักสูตรทั่วไปสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 2",
  },
  {
    code: "M3-GEN",
    name: "หลักสูตรทั่วไป ม.3",
    track: "GENERAL",
    year: 3,
    minCredits: 40,
    description: "หลักสูตรทั่วไปสำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 3",
  },

  // Upper Secondary Programs (Year 4-6)
  {
    code: "M4-SCI",
    name: "หลักสูตรวิทย์-คณิต ม.4",
    track: "SCIENCE_MATH",
    year: 4,
    minCredits: 45,
    description: "หลักสูตรเน้นวิทยาศาสตร์และคณิตศาสตร์สำหรับนักเรียนชั้น ม.4",
  },
  {
    code: "M5-SCI",
    name: "หลักสูตรวิทย์-คณิต ม.5",
    track: "SCIENCE_MATH",
    year: 5,
    minCredits: 45,
    description: "หลักสูตรเน้นวิทยาศาสตร์และคณิตศาสตร์สำหรับนักเรียนชั้น ม.5",
  },
  {
    code: "M6-SCI",
    name: "หลักสูตรวิทย์-คณิต ม.6",
    track: "SCIENCE_MATH",
    year: 6,
    minCredits: 45,
    description: "หลักสูตรเน้นวิทยาศาสตร์และคณิตศาสตร์สำหรับนักเรียนชั้น ม.6",
  },
  {
    code: "M4-ARTS",
    name: "หลักสูตรศิลป์-ภาษา ม.4",
    track: "LANGUAGE_ARTS",
    year: 4,
    minCredits: 42,
    description: "หลักสูตรเน้นศิลปศาสตร์และภาษาสำหรับนักเรียนชั้น ม.4",
  },
  {
    code: "M5-ARTS",
    name: "หลักสูตรศิลป์-ภาษา ม.5",
    track: "LANGUAGE_ARTS",
    year: 5,
    minCredits: 42,
    description: "หลักสูตรเน้นศิลปศาสตร์และภาษาสำหรับนักเรียนชั้น ม.5",
  },
  {
    code: "M6-ARTS",
    name: "หลักสูตรศิลป์-ภาษา ม.6",
    track: "LANGUAGE_ARTS",
    year: 6,
    minCredits: 42,
    description: "หลักสูตรเน้นศิลปศาสตร์และภาษาสำหรับนักเรียนชั้น ม.6",
  },
];

// ===========================================================================
// ROOM DATA
// ===========================================================================
interface RoomDef {
  name: string;
  building: string;
  floor: string;
}

const ROOMS: RoomDef[] = [
  // อาคารเรียน 1 (Lower Secondary)
  ...Array.from({ length: 12 }, (_, i) => ({
    name: `ห้อง 1${String(Math.floor(i / 4) + 1).padStart(1, "0")}${String((i % 4) + 1).padStart(1, "0")}`,
    building: "อาคาร 1",
    floor: `ชั้น ${Math.floor(i / 4) + 1}`,
  })),

  // อาคารเรียน 2 (Upper Secondary)
  ...Array.from({ length: 12 }, (_, i) => ({
    name: `ห้อง 2${String(Math.floor(i / 4) + 1).padStart(1, "0")}${String((i % 4) + 1).padStart(1, "0")}`,
    building: "อาคาร 2",
    floor: `ชั้น ${Math.floor(i / 4) + 1}`,
  })),

  // อาคารพิเศษ (Science Labs, Computer Rooms, etc.)
  {
    name: "ห้องปฏิบัติการฟิสิกส์",
    building: "อาคารวิทยาศาสตร์",
    floor: "ชั้น 1",
  },
  { name: "ห้องปฏิบัติการเคมี", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 1" },
  {
    name: "ห้องปฏิบัติการชีววิทยา",
    building: "อาคารวิทยาศาสตร์",
    floor: "ชั้น 2",
  },
  { name: "ห้องคอมพิวเตอร์ 1", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 2" },
  { name: "ห้องคอมพิวเตอร์ 2", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 2" },
  { name: "ห้องดนตรี", building: "อาคารศิลปะ", floor: "ชั้น 1" },
  { name: "ห้องนาฏศิลป์", building: "อาคารศิลปะ", floor: "ชั้น 1" },
  { name: "ห้องศิลปะ", building: "อาคารศิลปะ", floor: "ชั้น 2" },
  { name: "ห้องคหกรรม", building: "อาคารปฏิบัติการ", floor: "ชั้น 1" },
  { name: "ห้องช่าง", building: "อาคารปฏิบัติการ", floor: "ชั้น 1" },
  { name: "โรงยิม", building: "อาคารพลศึกษา", floor: "ชั้น 1" },
  { name: "สนามกีฬา", building: "สนาม", floor: "-" },
  { name: "ห้องสมุด", building: "อาคารสารสนเทศ", floor: "ชั้น 1-2" },
  { name: "หอประชุม", building: "อาคารหอประชุม", floor: "ชั้น 1" },
  { name: "ห้องแนะแนว", building: "อาคารบริหาร", floor: "ชั้น 1" },
];

// ===========================================================================
// GRADE LEVELS
// ===========================================================================
interface GradeDef {
  id: string;
  year: number;
  number: number;
  programCode: string;
}

const GRADES: GradeDef[] = [
  // M.1 (3 sections)
  { id: "M1-1", year: 1, number: 1, programCode: "M1-GEN" },
  { id: "M1-2", year: 1, number: 2, programCode: "M1-GEN" },
  { id: "M1-3", year: 1, number: 3, programCode: "M1-GEN" },
  // M.2 (3 sections)
  { id: "M2-1", year: 2, number: 1, programCode: "M2-GEN" },
  { id: "M2-2", year: 2, number: 2, programCode: "M2-GEN" },
  { id: "M2-3", year: 2, number: 3, programCode: "M2-GEN" },
  // M.3 (3 sections)
  { id: "M3-1", year: 3, number: 1, programCode: "M3-GEN" },
  { id: "M3-2", year: 3, number: 2, programCode: "M3-GEN" },
  { id: "M3-3", year: 3, number: 3, programCode: "M3-GEN" },
  // M.4 (3 sections - Science-Math)
  { id: "M4-1", year: 4, number: 1, programCode: "M4-SCI" },
  { id: "M4-2", year: 4, number: 2, programCode: "M4-SCI" },
  { id: "M4-3", year: 4, number: 3, programCode: "M4-ARTS" },
  // M.5 (3 sections - Science-Math)
  { id: "M5-1", year: 5, number: 1, programCode: "M5-SCI" },
  { id: "M5-2", year: 5, number: 2, programCode: "M5-SCI" },
  { id: "M5-3", year: 5, number: 3, programCode: "M5-ARTS" },
  // M.6 (3 sections)
  { id: "M6-1", year: 6, number: 1, programCode: "M6-SCI" },
  { id: "M6-2", year: 6, number: 2, programCode: "M6-SCI" },
  { id: "M6-3", year: 6, number: 3, programCode: "M6-ARTS" },
];

// ===========================================================================
// SEEDING FUNCTIONS
// ===========================================================================

async function seedSubjects() {
  console.log("📚 Seeding subjects...");
  let count = 0;
  for (const subject of ALL_SUBJECTS) {
    await prisma.subject.upsert({
      where: { SubjectCode: subject.code },
      update: {},
      create: {
        SubjectCode: subject.code,
        SubjectName: subject.name,
        Credit: subject.credit,
        Category: subject.category,
        LearningArea: subject.learningArea,
        ActivityType: subject.activityType,
        IsGraded: subject.category !== "ACTIVITY",
      },
    });
    count++;
  }
  console.log(`✅ Seeded ${count} subjects`);
}

async function seedTeachers() {
  console.log("👨‍🏫 Seeding teachers...");
  const createdTeachers = [];
  for (const teacher of TEACHERS) {
    const created = await prisma.teacher.upsert({
      where: { Email: teacher.email },
      update: {},
      create: {
        Prefix: teacher.prefix,
        Firstname: teacher.firstname,
        Lastname: teacher.lastname,
        Department: teacher.department,
        Email: teacher.email,
        Role: "teacher",
      },
    });
    createdTeachers.push(created);
  }
  console.log(`✅ Seeded ${createdTeachers.length} teachers`);
  return createdTeachers;
}

async function seedRooms() {
  console.log("🚪 Seeding rooms...");
  const createdRooms = [];
  for (const room of ROOMS) {
    const created = await prisma.room.upsert({
      where: { RoomName: room.name },
      update: {},
      create: {
        RoomName: room.name,
        Building: room.building,
        Floor: room.floor,
      },
    });
    createdRooms.push(created);
  }
  console.log(`✅ Seeded ${createdRooms.length} rooms`);
  return createdRooms;
}

async function seedPrograms() {
  console.log("🎓 Seeding programs...");
  const programMap: Record<string, number> = {};
  for (const program of PROGRAMS) {
    const created = await prisma.program.upsert({
      where: { ProgramCode: program.code },
      update: {},
      create: {
        ProgramCode: program.code,
        ProgramName: program.name,
        Track: program.track,
        Year: program.year,
        MinTotalCredits: program.minCredits,
        Description: program.description,
      },
    });
    programMap[program.code] = created.ProgramID;
  }
  console.log(`✅ Seeded ${Object.keys(programMap).length} programs`);
  return programMap;
}

async function seedGrades(programMap: Record<string, number>) {
  console.log("🏫 Seeding grade levels...");
  const createdGrades = [];
  for (const grade of GRADES) {
    const programId = programMap[grade.programCode];
    const created = await prisma.gradelevel.upsert({
      where: { GradeID: grade.id },
      update: {},
      create: {
        GradeID: grade.id,
        Year: grade.year,
        Number: grade.number,
        StudentCount: 35 + Math.floor(Math.random() * 10), // 35-44 students
        ProgramID: programId,
      },
    });
    createdGrades.push(created);
  }
  console.log(`✅ Seeded ${createdGrades.length} grade levels`);
  return createdGrades;
}

async function seedTimeslots() {
  console.log("⏰ Seeding timeslots...");
  let count = 0;
  for (const sem of SEMESTERS) {
    for (const day of DAYS) {
      for (const period of PERIODS) {
        const timeslotId = `${sem.number}-${ACADEMIC_YEAR}-${day}${period.num}`;
        await prisma.timeslot.upsert({
          where: { TimeslotID: timeslotId },
          update: {},
          create: {
            TimeslotID: timeslotId,
            AcademicYear: ACADEMIC_YEAR,
            Semester: sem.semester,
            StartTime: new Date(`2024-01-01T${period.start}:00`),
            EndTime: new Date(`2024-01-01T${period.end}:00`),
            Breaktime: period.break,
            DayOfWeek: day,
          },
        });
        count++;
      }
    }
  }
  console.log(`✅ Seeded ${count} timeslots`);
}

async function seedTableConfigs() {
  console.log("⚙️ Seeding table configurations...");
  const configTemplate = {
    periodsPerDay: 8,
    startTime: "08:30",
    periodDuration: 50,
    schoolDays: ["MON", "TUE", "WED", "THU", "FRI"],
    lunchBreak: { after: 4, duration: 60 },
    breakTimes: { junior: { after: 4 }, senior: { after: 5 } },
  };

  for (const sem of SEMESTERS) {
    const configId = `${sem.number}-${ACADEMIC_YEAR}`;
    await prisma.table_config.upsert({
      where: { ConfigID: configId },
      update: {},
      create: {
        ConfigID: configId,
        AcademicYear: ACADEMIC_YEAR,
        Semester: sem.semester,
        Config: configTemplate,
        status: sem.number === 1 ? "DRAFT" : "DRAFT",
      },
    });
  }
  console.log(`✅ Seeded ${SEMESTERS.length} table configurations`);
}

// ===========================================================================
// MAIN FUNCTION
// ===========================================================================

async function main() {
  console.log("🚀 Starting full semester seed...");
  console.log(`📅 Academic Year: ${ACADEMIC_YEAR}`);
  console.log("============================================");

  // Initialize Prisma client
  prisma = await initPrisma();

  try {
    // Seed all data
    await seedSubjects();
    const teachers = await seedTeachers();
    const rooms = await seedRooms();
    const programMap = await seedPrograms();
    const grades = await seedGrades(programMap);
    await seedTimeslots();
    await seedTableConfigs();

    console.log("============================================");
    console.log("✅ Full semester seed completed successfully!");
    console.log(`   📚 ${ALL_SUBJECTS.length} subjects`);
    console.log(`   👨‍🏫 ${teachers.length} teachers`);
    console.log(`   🚪 ${rooms.length} rooms`);
    console.log(`   🎓 ${Object.keys(programMap).length} programs`);
    console.log(`   🏫 ${grades.length} grade levels`);
    console.log(
      `   ⏰ ${SEMESTERS.length * DAYS.length * PERIODS.length} timeslots`,
    );
    console.log("============================================");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
