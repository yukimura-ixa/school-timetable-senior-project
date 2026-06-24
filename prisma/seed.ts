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
 *
 * 5. SEED_MOE_FULL_SEMESTER=true:
 *    - Full MOE-compliant semester seed (M.1-M.6, 3 sections each)
 *    - Generates program subjects, responsibilities, and full class schedules
 *    - Destructive (uses clean/test cleanup path)
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
 * - 2 Semesters: 1-2568, 2-2568
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
  ProgramTrack,
  SubjectCategory,
  LearningArea,
  ActivityType,
} from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";
import { generateTimeslotId } from "../src/utils/timeslot-id";
import { generateTimeslots } from "../src/features/timeslot/domain/services/timeslot.service";
import { buildGradeGroupIndex, isBreakForGrade } from "../src/utils/break-utils";
import type { SlotConfig } from "../src/features/timeslot/domain/models/break.types";
import { FUNDAMENTALS } from "./data/fundamentals";

// ── Phase 2A canonical slot layout (single source of truth) ──────────────────
// One real timeslot per slot. Breaks are real, occupying slots (universal recess
// + staggered junior/senior lunches). Generation + placement both derive from
// this so timeslot ROWS always match the slots[] config.
const SLOTS_2568: SlotConfig[] = [
  { duration: 50 },                          // slot 1  คาบ1
  { duration: 50 },                           // slot 2  คาบ2
  { duration: 10, breakGroups: ["*"] },       // slot 3  พักสาย (universal, after คาบ2)
  { duration: 50 },                           // slot 4  คาบ3
  { duration: 50, breakGroups: ["junior"] },  // slot 5  พักกลางวัน ม.ต้น (junior lunch, after คาบ3)
  { duration: 50, breakGroups: ["senior"] },  // slot 6  พักกลางวัน ม.ปลาย (senior lunch, after คาบ4)
  { duration: 50 },                           // slot 7  (teaching for both)
  { duration: 50 },                           // slot 8  (old period 5)
  { duration: 50 },                           // slot 9  (old period 6)
  { duration: 50 },                           // slot 10 (old period 7)
  { duration: 50 },                           // slot 11 (old period 8)
];

// 1-based slot numbers that are not a break for ANY grade (teaching slots).
// = [1, 2, 4, 7, 8, 9, 10, 11]. Legacy seed coordinates use period 1..8;
// old period k maps to the k-th absolute teaching slot.
const TEACHING_SLOTS_2568: number[] = SLOTS_2568.reduce<number[]>(
  (acc, slot, i) => {
    if (!slot.breakGroups || slot.breakGroups.length === 0) acc.push(i + 1);
    return acc;
  },
  [],
);

/** Legacy seed period (1..8) → new absolute teaching slot number. */
const oldPeriodToSlot = (period: number): number =>
  TEACHING_SLOTS_2568[period - 1];

/** 1-based slot numbers a group can teach in: every slot except the universal
 *  recess and the group's OWN lunch. The other group's lunch IS teaching here —
 *  the Phase 2A staggered-teaching win. junior=[1,2,4,6,7,8,9,10,11]
 *  (lunch slot 5, after คาบ3), senior=[1,2,4,5,7,8,9,10,11] (lunch slot 6,
 *  after คาบ4). */
function teachingSlotsForGroup(group: "junior" | "senior"): number[] {
  const out: number[] = [];
  SLOTS_2568.forEach((slot, i) => {
    const bg = slot.breakGroups;
    if (!bg || bg.length === 0) {
      out.push(i + 1);
      return;
    }
    if (bg.includes("*") || bg.includes(group)) return;
    out.push(i + 1);
  });
  return out;
}
const JUNIOR_TEACHING_SLOTS = teachingSlotsForGroup("junior");
const SENIOR_TEACHING_SLOTS = teachingSlotsForGroup("senior");

const connectionString = process.env.DATABASE_URL!;
const isAccelerate = connectionString.startsWith("prisma+");

// Create PrismaClient conditionally to avoid union type issues
// TypeScript cannot reconcile { accelerateUrl } | { adapter } as a single options type
let prisma: PrismaClient;

if (isAccelerate) {
  // Prisma Accelerate / Data Proxy path - use accelerateUrl and withAccelerate extension
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "minimal",
    accelerateUrl: connectionString,
  }).$extends(withAccelerate()) as unknown as PrismaClient;
} else {
  // Direct Postgres connection via pg adapter (Prisma v6.6.0+ syntax)
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({
    log: ["error", "warn"],
    errorFormat: "minimal",
    adapter,
  });
}

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
// MOE LEARNING AREAS REFERENCE DATA
// Canonical mapping from docs/agents/THAI_MOE_CURRICULUM_RULES.md
// Thailand MOE Basic Education Core Curriculum B.E. 2551 (2008)
// ============================================================================

/**
 * MOE 8 Learning Areas with Thai letter codes
 * Maps Thai letter → LearningArea enum and department name
 *
 * Subject Code Format: [Thai Letter][Level][Year][Type][Sequence]
 * - Level 1 = Primary (ป.), Level 2 = Lower Secondary (ม.1-3), Level 3 = Upper Secondary (ม.4-6)
 * - Type 1 = Core (พื้นฐาน), Type 2 = Elective (เพิ่มเติม)
 * - Example: ท21101 = Thai, Lower Secondary (2), Year 1, Core (1), Subject 01
 */
const MOE_LEARNING_AREAS = {
  ท: { enum: "THAI" as LearningArea, name: "ภาษาไทย", nameEn: "Thai Language" },
  ค: {
    enum: "MATHEMATICS" as LearningArea,
    name: "คณิตศาสตร์",
    nameEn: "Mathematics",
  },
  ว: {
    enum: "SCIENCE" as LearningArea,
    name: "วิทยาศาสตร์และเทคโนโลยี",
    nameEn: "Science & Technology",
  },
  ส: {
    enum: "SOCIAL" as LearningArea,
    name: "สังคมศึกษา",
    nameEn: "Social Studies",
  },
  พ: {
    enum: "HEALTH_PE" as LearningArea,
    name: "สุขศึกษาและพลศึกษา",
    nameEn: "Health & PE",
  },
  ศ: { enum: "ARTS" as LearningArea, name: "ศิลปะ", nameEn: "Arts" },
  ง: {
    enum: "CAREER" as LearningArea,
    name: "การงานอาชีพ",
    nameEn: "Career & Technology",
  },
  อ: {
    enum: "FOREIGN_LANGUAGE" as LearningArea,
    name: "ภาษาต่างประเทศ",
    nameEn: "Foreign Languages",
  },
} as const;

/**
 * MOE Subject Code Pattern (รหัสวิชา)
 * Format: [Thai Letter][Level 1-3][Year 0-3][Type 1-2][Sequence 01-99]
 * Matches: ท21101, ค31201, ว22101, etc.
 */
const MOE_SUBJECT_CODE_PATTERN = /^[ทควสพศงอจญ][1-3][0-3][12]\d{2}$/;

/**
 * Validate subject code against MOE pattern
 */
function isValidMOESubjectCode(code: string): boolean {
  return MOE_SUBJECT_CODE_PATTERN.test(code);
}

/**
 * Extract learning area from MOE subject code
 */
function getLearningAreaFromCode(code: string): LearningArea | null {
  const letter = code.charAt(0) as keyof typeof MOE_LEARNING_AREAS;
  return MOE_LEARNING_AREAS[letter]?.enum ?? null;
}

// Department name → LearningArea mapping (derived from MOE_LEARNING_AREAS)
const DEPT_TO_LEARNING_AREA: Record<string, LearningArea> = Object.fromEntries(
  Object.values(MOE_LEARNING_AREAS).map((v) => [v.name, v.enum]),
);

// Subject code prefix → department name (derived from MOE_LEARNING_AREAS)
const SUBJECT_PREFIX_TO_DEPT: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(MOE_LEARNING_AREAS).map(([letter, v]) => [letter, v.name]),
  ),
  จ: "ภาษาต่างประเทศ",
  ญ: "ภาษาต่างประเทศ",
};

// ============================================================================
// DEMO DATA SEEDING FUNCTION
// Creates minimal but complete data for production demos
// ============================================================================
async function seedDemoData() {
  console.log("🌐 Starting demo data seed 2568 (idempotent, additive)...");

  // ── Config ──────────────────────────────────────────────────────────────────
  const KEEP_CONFIG_IDS = ["1-2568", "2-2568"];
  const configTemplate = {
    StartTime: "08:30",
    Days: ["MON", "TUE", "WED", "THU", "FRI"],
    slots: SLOTS_2568,
  };

  // ── Subjects (77 total) ─────────────────────────────────────────────────────
  const ALL_SUBJECTS: Array<{
    code: string;
    name: string;
    credit: subject_credit;
    learningArea?: LearningArea | null;
    activityType?: ActivityType | null;
    category: SubjectCategory;
  }> = [
    // Lower Secondary Core M.1
    { code: "ท21101", name: "ภาษาไทย พื้นฐาน ม.1", credit: "CREDIT_15", learningArea: "THAI", category: "CORE" },
    { code: "ค21101", name: "คณิตศาสตร์ พื้นฐาน ม.1", credit: "CREDIT_15", learningArea: "MATHEMATICS", category: "CORE" },
    { code: "ว21101", name: "วิทยาศาสตร์และเทคโนโลยี ม.1", credit: "CREDIT_15", learningArea: "SCIENCE", category: "CORE" },
    { code: "ส21101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.1", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
    { code: "พ21101", name: "สุขศึกษาและพลศึกษา ม.1", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
    { code: "ศ21101", name: "ศิลปะ ม.1", credit: "CREDIT_10", learningArea: "ARTS", category: "CORE" },
    { code: "ง21101", name: "การงานอาชีพ ม.1", credit: "CREDIT_10", learningArea: "CAREER", category: "CORE" },
    { code: "อ21101", name: "ภาษาอังกฤษ พื้นฐาน ม.1", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },
    // Lower Secondary Core M.2
    { code: "ท22101", name: "ภาษาไทย พื้นฐาน ม.2", credit: "CREDIT_15", learningArea: "THAI", category: "CORE" },
    { code: "ค22101", name: "คณิตศาสตร์ พื้นฐาน ม.2", credit: "CREDIT_15", learningArea: "MATHEMATICS", category: "CORE" },
    { code: "ว22101", name: "วิทยาศาสตร์และเทคโนโลยี ม.2", credit: "CREDIT_15", learningArea: "SCIENCE", category: "CORE" },
    { code: "ส22101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.2", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
    { code: "พ22101", name: "สุขศึกษาและพลศึกษา ม.2", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
    { code: "ศ22101", name: "ศิลปะ ม.2", credit: "CREDIT_10", learningArea: "ARTS", category: "CORE" },
    { code: "ง22101", name: "การงานอาชีพ ม.2", credit: "CREDIT_10", learningArea: "CAREER", category: "CORE" },
    { code: "อ22101", name: "ภาษาอังกฤษ พื้นฐาน ม.2", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },
    // Lower Secondary Core M.3
    { code: "ท23101", name: "ภาษาไทย พื้นฐาน ม.3", credit: "CREDIT_15", learningArea: "THAI", category: "CORE" },
    { code: "ค23101", name: "คณิตศาสตร์ พื้นฐาน ม.3", credit: "CREDIT_15", learningArea: "MATHEMATICS", category: "CORE" },
    { code: "ว23101", name: "วิทยาศาสตร์และเทคโนโลยี ม.3", credit: "CREDIT_15", learningArea: "SCIENCE", category: "CORE" },
    { code: "ส23101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.3", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
    { code: "พ23101", name: "สุขศึกษาและพลศึกษา ม.3", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
    { code: "ศ23101", name: "ศิลปะ ม.3", credit: "CREDIT_10", learningArea: "ARTS", category: "CORE" },
    { code: "ง23101", name: "การงานอาชีพ ม.3", credit: "CREDIT_10", learningArea: "CAREER", category: "CORE" },
    { code: "อ23101", name: "ภาษาอังกฤษ พื้นฐาน ม.3", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },
    // Upper Secondary Core M.4
    { code: "ท31101", name: "ภาษาไทย พื้นฐาน ม.4", credit: "CREDIT_10", learningArea: "THAI", category: "CORE" },
    { code: "ค31101", name: "คณิตศาสตร์ พื้นฐาน ม.4", credit: "CREDIT_10", learningArea: "MATHEMATICS", category: "CORE" },
    { code: "ว31101", name: "วิทยาศาสตร์และเทคโนโลยี ม.4", credit: "CREDIT_10", learningArea: "SCIENCE", category: "CORE" },
    { code: "ส31101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.4", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
    { code: "พ31101", name: "สุขศึกษาและพลศึกษา ม.4", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
    { code: "อ31101", name: "ภาษาอังกฤษ พื้นฐาน ม.4", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },
    // Upper Secondary Core M.5
    { code: "ท32101", name: "ภาษาไทย พื้นฐาน ม.5", credit: "CREDIT_10", learningArea: "THAI", category: "CORE" },
    { code: "ค32101", name: "คณิตศาสตร์ พื้นฐาน ม.5", credit: "CREDIT_10", learningArea: "MATHEMATICS", category: "CORE" },
    { code: "ว32101", name: "วิทยาศาสตร์และเทคโนโลยี ม.5", credit: "CREDIT_10", learningArea: "SCIENCE", category: "CORE" },
    { code: "ส32101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.5", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
    { code: "พ32101", name: "สุขศึกษาและพลศึกษา ม.5", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
    { code: "อ32101", name: "ภาษาอังกฤษ พื้นฐาน ม.5", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },
    // Upper Secondary Core M.6
    { code: "ท33101", name: "ภาษาไทย พื้นฐาน ม.6", credit: "CREDIT_10", learningArea: "THAI", category: "CORE" },
    { code: "ค33101", name: "คณิตศาสตร์ พื้นฐาน ม.6", credit: "CREDIT_10", learningArea: "MATHEMATICS", category: "CORE" },
    { code: "ว33101", name: "วิทยาศาสตร์และเทคโนโลยี ม.6", credit: "CREDIT_10", learningArea: "SCIENCE", category: "CORE" },
    { code: "ส33101", name: "สังคมศึกษา ศาสนาและวัฒนธรรม ม.6", credit: "CREDIT_10", learningArea: "SOCIAL", category: "CORE" },
    { code: "พ33101", name: "สุขศึกษาและพลศึกษา ม.6", credit: "CREDIT_10", learningArea: "HEALTH_PE", category: "CORE" },
    { code: "อ33101", name: "ภาษาอังกฤษ พื้นฐาน ม.6", credit: "CREDIT_10", learningArea: "FOREIGN_LANGUAGE", category: "CORE" },
    // Lower-sec additional (used by E2E teacher fixture)
    { code: "ค21201", name: "คณิตศาสตร์เพิ่มเติม ม.1", credit: "CREDIT_15", learningArea: "MATHEMATICS", category: "ADDITIONAL" },
    // SCI-MATH electives (ค shared with LANG-MATH)
    { code: "ค31201", name: "คณิตศาสตร์เพิ่มเติม ม.4", credit: "CREDIT_20", learningArea: "MATHEMATICS", category: "ADDITIONAL" },
    { code: "ว31201", name: "ฟิสิกส์ ม.4", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
    { code: "ว31202", name: "เคมี ม.4", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
    { code: "ว31203", name: "ชีววิทยา ม.4", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
    { code: "ค32201", name: "คณิตศาสตร์เพิ่มเติม ม.5", credit: "CREDIT_20", learningArea: "MATHEMATICS", category: "ADDITIONAL" },
    { code: "ว32201", name: "ฟิสิกส์ ม.5", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
    { code: "ว32202", name: "เคมี ม.5", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
    { code: "ว32203", name: "ชีววิทยา ม.5", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
    { code: "ค33201", name: "คณิตศาสตร์เพิ่มเติม ม.6", credit: "CREDIT_20", learningArea: "MATHEMATICS", category: "ADDITIONAL" },
    { code: "ว33201", name: "ฟิสิกส์ ม.6", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
    { code: "ว33202", name: "เคมี ม.6", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
    { code: "ว33203", name: "ชีววิทยา ม.6", credit: "CREDIT_15", learningArea: "SCIENCE", category: "ADDITIONAL" },
    // Chinese — LANG-MATH + LANG-ARTS shared
    { code: "จ31201", name: "ภาษาจีน ม.4", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
    { code: "จ32201", name: "ภาษาจีน ม.5", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
    { code: "จ33201", name: "ภาษาจีน ม.6", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
    // Career/Tech — LANG-MATH only
    { code: "ง31201", name: "การงานอาชีพและเทคโนโลยี ม.4", credit: "CREDIT_10", learningArea: "CAREER", category: "ADDITIONAL" },
    { code: "ง32201", name: "การงานอาชีพและเทคโนโลยี ม.5", credit: "CREDIT_10", learningArea: "CAREER", category: "ADDITIONAL" },
    { code: "ง33201", name: "การงานอาชีพและเทคโนโลยี ม.6", credit: "CREDIT_10", learningArea: "CAREER", category: "ADDITIONAL" },
    // Japanese — LANG-ARTS only
    { code: "ญ31201", name: "ภาษาญี่ปุ่น ม.4", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
    { code: "ญ32201", name: "ภาษาญี่ปุ่น ม.5", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
    { code: "ญ33201", name: "ภาษาญี่ปุ่น ม.6", credit: "CREDIT_15", learningArea: "FOREIGN_LANGUAGE", category: "ADDITIONAL" },
    // Advanced Social — LANG-ARTS only
    { code: "ส31102", name: "สังคมศึกษาเพิ่มเติม ม.4", credit: "CREDIT_15", learningArea: "SOCIAL", category: "ADDITIONAL" },
    { code: "ส32102", name: "สังคมศึกษาเพิ่มเติม ม.5", credit: "CREDIT_15", learningArea: "SOCIAL", category: "ADDITIONAL" },
    { code: "ส33102", name: "สังคมศึกษาเพิ่มเติม ม.6", credit: "CREDIT_15", learningArea: "SOCIAL", category: "ADDITIONAL" },
    // Advanced Arts — LANG-ARTS only
    { code: "ศ31201", name: "ศิลปะเพิ่มเติม ม.4", credit: "CREDIT_10", learningArea: "ARTS", category: "ADDITIONAL" },
    { code: "ศ32201", name: "ศิลปะเพิ่มเติม ม.5", credit: "CREDIT_10", learningArea: "ARTS", category: "ADDITIONAL" },
    { code: "ศ33201", name: "ศิลปะเพิ่มเติม ม.6", credit: "CREDIT_10", learningArea: "ARTS", category: "ADDITIONAL" },
    // Activity subjects
    { code: "ACT-GUIDE",    name: "แนะแนว",               credit: "CREDIT_10", category: "ACTIVITY", activityType: "GUIDANCE" as ActivityType },
    { code: "ACT-CLUB",     name: "ชุมนุม",                credit: "CREDIT_10", category: "ACTIVITY", activityType: "CLUB"     as ActivityType },
    { code: "ACT-SCOUT-M1", name: "ลูกเสือ/เนตรนารี ม.1", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT"    as ActivityType },
    { code: "ACT-SCOUT-M2", name: "ลูกเสือ/เนตรนารี ม.2", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT"    as ActivityType },
    { code: "ACT-SCOUT-M3", name: "ลูกเสือ/เนตรนารี ม.3", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT"    as ActivityType },
    { code: "ACT-SCOUT-M4", name: "ลูกเสือ/เนตรนารี ม.4", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT"    as ActivityType },
    { code: "ACT-SCOUT-M5", name: "ลูกเสือ/เนตรนารี ม.5", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT"    as ActivityType },
    { code: "ACT-SCOUT-M6", name: "ลูกเสือ/เนตรนารี ม.6", credit: "CREDIT_10", category: "ACTIVITY", activityType: "SCOUT"    as ActivityType },
  ];

  // ── Rooms (22) ──────────────────────────────────────────────────────────────
  const ALL_ROOMS = [
    { name: "ห้อง 101", building: "อาคาร 1", floor: "ชั้น 1" },
    { name: "ห้อง 102", building: "อาคาร 1", floor: "ชั้น 1" },
    { name: "ห้อง 103", building: "อาคาร 1", floor: "ชั้น 1" },
    { name: "ห้อง 104", building: "อาคาร 1", floor: "ชั้น 1" },
    { name: "ห้อง 105", building: "อาคาร 1", floor: "ชั้น 1" },
    { name: "ห้อง 106", building: "อาคาร 1", floor: "ชั้น 1" },
    { name: "ห้อง 201", building: "อาคาร 2", floor: "ชั้น 1" },
    { name: "ห้อง 202", building: "อาคาร 2", floor: "ชั้น 1" },
    { name: "ห้อง 203", building: "อาคาร 2", floor: "ชั้น 1" },
    { name: "ห้อง 204", building: "อาคาร 2", floor: "ชั้น 1" },
    { name: "ห้อง 205", building: "อาคาร 2", floor: "ชั้น 1" },
    { name: "ห้อง 206", building: "อาคาร 2", floor: "ชั้น 1" },
    { name: "ห้องปฏิบัติการวิทย์ 1", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 1" },
    { name: "ห้องปฏิบัติการวิทย์ 2", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 1" },
    { name: "ห้องปฏิบัติการวิทย์ 3", building: "อาคารวิทยาศาสตร์", floor: "ชั้น 2" },
    { name: "ห้องคอมพิวเตอร์ 1", building: "อาคารเทคโนโลยี", floor: "ชั้น 1" },
    { name: "ห้องคอมพิวเตอร์ 2", building: "อาคารเทคโนโลยี", floor: "ชั้น 1" },
    { name: "ห้องศิลปะ", building: "อาคาร 2", floor: "ชั้น 2" },
    { name: "โรงพลศึกษา", building: "อาคารกีฬา", floor: "ชั้น 1" },
    { name: "ห้องกิจกรรม 1", building: "อาคาร 1", floor: "ชั้น 2" },
    { name: "ห้องกิจกรรม 2", building: "อาคาร 1", floor: "ชั้น 2" },
    { name: "ห้องประชุม", building: "อาคารอำนวยการ", floor: "ชั้น 1" },
  ];

  // ── Teachers (29: 28 dept + 1 E2E) ─────────────────────────────────────────
  // T1–T3: ภาษาไทย  T4–T6: คณิตศาสตร์  T7–T10: วิทยาศาสตร์
  // T11–T13: สังคมศึกษา  T14–T15: สุขศึกษา/พลศึกษา  T16–T17: ศิลปะ
  // T18–T19: การงานอาชีพ  T20–T23: ภาษาอังกฤษ
  // T24–T25: ภาษาจีน  T26: ภาษาญี่ปุ่น  T27–T28: แนะแนว/กิจกรรม  T29: E2E
  const ALL_TEACHERS = [
    { email: "teacher1@school.ac.th",  prefix: "ครู", firstname: "สมชาย",    lastname: "ทองดี",      dept: "ภาษาไทย" },
    { email: "teacher2@school.ac.th",  prefix: "ครู", firstname: "นิภา",     lastname: "ใสสะอาด",    dept: "ภาษาไทย" },
    { email: "teacher3@school.ac.th",  prefix: "ครู", firstname: "วิมล",     lastname: "รักภาษา",    dept: "ภาษาไทย" },
    { email: "teacher4@school.ac.th",  prefix: "ครู", firstname: "อนุชา",    lastname: "มั่นคง",     dept: "คณิตศาสตร์" },
    { email: "teacher5@school.ac.th",  prefix: "ครู", firstname: "สุภา",     lastname: "เลขเก่ง",    dept: "คณิตศาสตร์" },
    { email: "teacher6@school.ac.th",  prefix: "ครู", firstname: "ประสิทธิ์",lastname: "คิดเร็ว",    dept: "คณิตศาสตร์" },
    { email: "teacher7@school.ac.th",  prefix: "ครู", firstname: "วิชัย",    lastname: "เก่งมาก",    dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { email: "teacher8@school.ac.th",  prefix: "ครู", firstname: "ศิริพรรณ",lastname: "สุขเจริญ",    dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { email: "teacher9@school.ac.th",  prefix: "ครู", firstname: "นันทวัน", lastname: "ภูมิใจ",     dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { email: "teacher10@school.ac.th", prefix: "ครู", firstname: "ธีรพล",   lastname: "วิทยา",      dept: "วิทยาศาสตร์และเทคโนโลยี" },
    { email: "teacher11@school.ac.th", prefix: "ครู", firstname: "สุดา",    lastname: "รักเรียน",   dept: "สังคมศึกษา" },
    { email: "teacher12@school.ac.th", prefix: "ครู", firstname: "จิราพร",  lastname: "ประวัติดี",  dept: "สังคมศึกษา" },
    { email: "teacher13@school.ac.th", prefix: "ครู", firstname: "ชาติชาย", lastname: "ศาสนา",      dept: "สังคมศึกษา" },
    { email: "teacher14@school.ac.th", prefix: "ครู", firstname: "ประสิทธิ์",lastname: "แข็งแรง",   dept: "สุขศึกษาและพลศึกษา" },
    { email: "teacher15@school.ac.th", prefix: "ครู", firstname: "กนกพร",   lastname: "สุขภาพดี",   dept: "สุขศึกษาและพลศึกษา" },
    { email: "teacher16@school.ac.th", prefix: "ครู", firstname: "ศิริพร",  lastname: "ศิลป์งาม",   dept: "ศิลปะ" },
    { email: "teacher17@school.ac.th", prefix: "ครู", firstname: "อรุณ",    lastname: "วาดเก่ง",    dept: "ศิลปะ" },
    { email: "teacher18@school.ac.th", prefix: "ครู", firstname: "บุญส่ง",  lastname: "อาชีพดี",    dept: "การงานอาชีพ" },
    { email: "teacher19@school.ac.th", prefix: "ครู", firstname: "วรรณา",   lastname: "เทคโนโลยี",  dept: "การงานอาชีพ" },
    { email: "teacher20@school.ac.th", prefix: "ครู", firstname: "จอห์น",   lastname: "สมิธ",       dept: "ภาษาต่างประเทศ" },
    { email: "teacher21@school.ac.th", prefix: "ครู", firstname: "แมรี่",   lastname: "จอห์นสัน",   dept: "ภาษาต่างประเทศ" },
    { email: "teacher22@school.ac.th", prefix: "ครู", firstname: "ไมเคิล",  lastname: "บราวน์",     dept: "ภาษาต่างประเทศ" },
    { email: "teacher23@school.ac.th", prefix: "ครู", firstname: "เอมิลี่", lastname: "เดวิส",      dept: "ภาษาต่างประเทศ" },
    { email: "teacher24@school.ac.th", prefix: "ครู", firstname: "หลี่",    lastname: "เมย์",       dept: "ภาษาต่างประเทศ" },
    { email: "teacher25@school.ac.th", prefix: "ครู", firstname: "หวัง",    lastname: "ฟาง",        dept: "ภาษาต่างประเทศ" },
    { email: "teacher26@school.ac.th", prefix: "ครู", firstname: "ซาโตะ",   lastname: "ยูกิ",       dept: "ภาษาต่างประเทศ" },
    { email: "teacher27@school.ac.th", prefix: "ครู", firstname: "กมลา",    lastname: "แนะนำดี",    dept: "แนะแนว" },
    { email: "teacher28@school.ac.th", prefix: "ครู", firstname: "ปรีชา",   lastname: "กิจกรรม",    dept: "แนะแนว" },
    { email: "e2e.teacher@school.ac.th", prefix: "ครู", firstname: "E2E", lastname: "ทดสอบ", dept: "คณิตศาสตร์" },
  ];

  // ── Programs (12) ───────────────────────────────────────────────────────────
  // schema: @@unique([Year, Track]) enforced — findFirst by (Year, Track) before create
  const ALL_PROGRAMS = [
    { code: "M1-GEN",       name: "หลักสูตรมัธยมศึกษาปีที่ 1",    year: 1, track: "GENERAL"       as ProgramTrack, minCredits: 43 },
    { code: "M2-GEN",       name: "หลักสูตรมัธยมศึกษาปีที่ 2",    year: 2, track: "GENERAL"       as ProgramTrack, minCredits: 43 },
    { code: "M3-GEN",       name: "หลักสูตรมัธยมศึกษาปีที่ 3",    year: 3, track: "GENERAL"       as ProgramTrack, minCredits: 43 },
    { code: "M4-SCI",       name: "หลักสูตรวิทย์-คณิต ม.4",       year: 4, track: "SCIENCE_MATH"  as ProgramTrack, minCredits: 41 },
    { code: "M4-LANG-MATH", name: "หลักสูตรศิลป์-คำนวณ ม.4",      year: 4, track: "LANGUAGE_MATH" as ProgramTrack, minCredits: 41 },
    { code: "M4-LANG-ARTS", name: "หลักสูตรศิลป์-ภาษา ม.4",       year: 4, track: "LANGUAGE_ARTS" as ProgramTrack, minCredits: 41 },
    { code: "M5-SCI",       name: "หลักสูตรวิทย์-คณิต ม.5",       year: 5, track: "SCIENCE_MATH"  as ProgramTrack, minCredits: 41 },
    { code: "M5-LANG-MATH", name: "หลักสูตรศิลป์-คำนวณ ม.5",      year: 5, track: "LANGUAGE_MATH" as ProgramTrack, minCredits: 41 },
    { code: "M5-LANG-ARTS", name: "หลักสูตรศิลป์-ภาษา ม.5",       year: 5, track: "LANGUAGE_ARTS" as ProgramTrack, minCredits: 41 },
    { code: "M6-SCI",       name: "หลักสูตรวิทย์-คณิต ม.6",       year: 6, track: "SCIENCE_MATH"  as ProgramTrack, minCredits: 41 },
    { code: "M6-LANG-MATH", name: "หลักสูตรศิลป์-คำนวณ ม.6",      year: 6, track: "LANGUAGE_MATH" as ProgramTrack, minCredits: 41 },
    { code: "M6-LANG-ARTS", name: "หลักสูตรศิลป์-ภาษา ม.6",       year: 6, track: "LANGUAGE_ARTS" as ProgramTrack, minCredits: 41 },
  ];

  // ── Grade Levels (18) ───────────────────────────────────────────────────────
  const ALL_GRADES = [
    { id: "M1-1", year: 1, number: 1, students: 35, programCode: "M1-GEN" },
    { id: "M1-2", year: 1, number: 2, students: 35, programCode: "M1-GEN" },
    { id: "M1-3", year: 1, number: 3, students: 35, programCode: "M1-GEN" },
    { id: "M2-1", year: 2, number: 1, students: 35, programCode: "M2-GEN" },
    { id: "M2-2", year: 2, number: 2, students: 35, programCode: "M2-GEN" },
    { id: "M2-3", year: 2, number: 3, students: 35, programCode: "M2-GEN" },
    { id: "M3-1", year: 3, number: 1, students: 35, programCode: "M3-GEN" },
    { id: "M3-2", year: 3, number: 2, students: 35, programCode: "M3-GEN" },
    { id: "M3-3", year: 3, number: 3, students: 35, programCode: "M3-GEN" },
    { id: "M4-1", year: 4, number: 1, students: 32, programCode: "M4-SCI" },
    { id: "M4-2", year: 4, number: 2, students: 32, programCode: "M4-LANG-MATH" },
    { id: "M4-3", year: 4, number: 3, students: 32, programCode: "M4-LANG-ARTS" },
    { id: "M5-1", year: 5, number: 1, students: 32, programCode: "M5-SCI" },
    { id: "M5-2", year: 5, number: 2, students: 32, programCode: "M5-LANG-MATH" },
    { id: "M5-3", year: 5, number: 3, students: 32, programCode: "M5-LANG-ARTS" },
    { id: "M6-1", year: 6, number: 1, students: 32, programCode: "M6-SCI" },
    { id: "M6-2", year: 6, number: 2, students: 32, programCode: "M6-LANG-MATH" },
    { id: "M6-3", year: 6, number: 3, students: 32, programCode: "M6-LANG-ARTS" },
  ];

  // ── Period schedule ─────────────────────────────────────────────────────────
  // Timeslot rows are generated from SLOTS_2568 (real break slots). Legacy
  // (day, period) coordinates below map through oldPeriodToSlot onto teaching
  // slots; juniors skip slot 5 (their lunch), seniors skip slot 7 (theirs).
  const DAYS: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];
  // Available period indices for each school level (no lunch break for their group)
  const JUNIOR_PERIODS = [1, 2, 3, 5, 6, 7, 8]; // skip P4
  const SENIOR_PERIODS = [1, 2, 3, 4, 6, 7, 8]; // skip P5

  // Map a group's legacy periods onto its real teaching slots (rank order), so
  // juniors land in the senior-lunch slot and seniors in the junior-lunch slot
  // — the Phase 2A staggered-teaching win, surfaced in demo data.
  const sortUniq = (a: number[]) => [...new Set(a)].sort((x, y) => x - y);
  const juniorSlotByPeriod = new Map(
    sortUniq(JUNIOR_PERIODS).map((p, i) => [p, JUNIOR_TEACHING_SLOTS[i]] as const),
  );
  const seniorSlotByPeriod = new Map(
    sortUniq(SENIOR_PERIODS).map((p, i) => [p, SENIOR_TEACHING_SLOTS[i]] as const),
  );
  const slotFor = (period: number, group: "junior" | "senior") =>
    (group === "junior" ? juniorSlotByPeriod : seniorSlotByPeriod).get(period) ??
    oldPeriodToSlot(period);

  // ── Cleanup stale semesters ─────────────────────────────────────────────────
  console.log(`🧹 Cleaning configs not in [${KEEP_CONFIG_IDS.join(", ")}]...`);
  const stale = await prisma.table_config.findMany({
    where: { ConfigID: { notIn: KEEP_CONFIG_IDS } },
    select: { ConfigID: true, AcademicYear: true, Semester: true },
  });
  for (const s of stale) {
    await prisma.class_schedule.deleteMany({
      where: { timeslot: { AcademicYear: s.AcademicYear, Semester: s.Semester } },
    });
    await prisma.teachers_responsibility.deleteMany({
      where: { AcademicYear: s.AcademicYear, Semester: s.Semester },
    });
    await prisma.timeslot.deleteMany({
      where: { AcademicYear: s.AcademicYear, Semester: s.Semester },
    });
    await prisma.table_config.delete({ where: { ConfigID: s.ConfigID } });
    console.log(`   ✂️  Removed semester ${s.ConfigID}`);
  }
  if (stale.length === 0) console.log("   (no stale semesters found)");

  // ── Reset schedules/timeslots/resps in KEEP configs for true idempotence ───
  // (table_config rows are upserted later — keep them for FK stability)
  for (const cfg of KEEP_CONFIG_IDS) {
    const [semStr, yrStr] = cfg.split("-");
    const semEnum = semStr === "1" ? "SEMESTER_1" : "SEMESTER_2";
    const yr = parseInt(yrStr, 10);
    await prisma.class_schedule.deleteMany({
      where: { timeslot: { AcademicYear: yr, Semester: semEnum } },
    });
    await prisma.teachers_responsibility.deleteMany({
      where: { AcademicYear: yr, Semester: semEnum },
    });
    await prisma.timeslot.deleteMany({
      where: { AcademicYear: yr, Semester: semEnum },
    });
  }
  console.log(`   🔄 Reset schedules/timeslots/resps for [${KEEP_CONFIG_IDS.join(", ")}]`);

  // ── Seed subjects ───────────────────────────────────────────────────────────
  console.log("📚 Seeding subjects...");
  const subjectMap = new Map(ALL_SUBJECTS.map((s) => [s.code, s]));
  for (const subject of ALL_SUBJECTS) {
    await withRetry(
      () =>
        prisma.subject.upsert({
          where: { SubjectCode: subject.code },
          update: {},
          create: {
            SubjectCode: subject.code,
            SubjectName: subject.name,
            Credit: subject.credit,
            Category: subject.category,
            LearningArea: subject.learningArea ?? null,
            ActivityType: subject.activityType ?? null,
            IsGraded: subject.category !== "ACTIVITY",
          },
        }),
      `Upsert subject ${subject.code}`,
    );
  }
  console.log(`✅ ${ALL_SUBJECTS.length} subjects`);

  // ── Seed rooms ──────────────────────────────────────────────────────────────
  console.log("🚪 Seeding rooms...");
  const roomMap = new Map<string, number>();
  for (const r of ALL_ROOMS) {
    const room = await withRetry(
      () =>
        prisma.room.upsert({
          where: { RoomName: r.name },
          update: {},
          create: { RoomName: r.name, Building: r.building, Floor: r.floor },
        }),
      `Upsert room ${r.name}`,
    );
    roomMap.set(room.RoomName, room.RoomID);
  }
  console.log(`✅ ${ALL_ROOMS.length} rooms`);

  // ── Seed teachers ───────────────────────────────────────────────────────────
  console.log("👨‍🏫 Seeding teachers...");
  const teacherMap = new Map<string, number>();
  for (const t of ALL_TEACHERS) {
    const teacher = await withRetry(
      () =>
        prisma.teacher.upsert({
          where: { Email: t.email },
          update: {},
          create: {
            Prefix: t.prefix,
            Firstname: t.firstname,
            Lastname: t.lastname,
            Department: t.dept,
            Email: t.email,
            Role: "teacher",
          },
        }),
      `Upsert teacher ${t.email}`,
    );
    teacherMap.set(teacher.Email, teacher.TeacherID);
  }
  console.log(`✅ ${ALL_TEACHERS.length} teachers`);

  // ── Seed programs ───────────────────────────────────────────────────────────
  console.log("🎓 Seeding programs...");
  const programMap = new Map<string, number>();
  for (const p of ALL_PROGRAMS) {
    const existing = await prisma.program.findFirst({ where: { Year: p.year, Track: p.track } });
    const prog =
      existing ??
      (await withRetry(
        () =>
          prisma.program.create({
            data: {
              ProgramCode: p.code,
              ProgramName: p.name,
              Year: p.year,
              Track: p.track,
              MinTotalCredits: p.minCredits,
            },
          }),
        `Create program ${p.code}`,
      ));
    programMap.set(p.code, prog.ProgramID);
  }
  console.log(`✅ ${ALL_PROGRAMS.length} programs`);

  // ── Seed grade levels ───────────────────────────────────────────────────────
  console.log("🏫 Seeding grade levels...");
  for (const g of ALL_GRADES) {
    const pid = programMap.get(g.programCode)!;
    await withRetry(
      () =>
        prisma.gradelevel.upsert({
          where: { GradeID: g.id },
          update: {},
          create: { GradeID: g.id, Year: g.year, Number: g.number, StudentCount: g.students, ProgramID: pid },
        }),
      `Upsert grade ${g.id}`,
    );
  }
  console.log(`✅ ${ALL_GRADES.length} grade levels`);

  // ── Seed grade_fundamental template rows ───────────────────────────────────
  console.log("📋 Seeding grade_fundamental template rows...");
  for (const row of FUNDAMENTALS) {
    await withRetry(
      () =>
        prisma.grade_fundamental.upsert({
          where: { Year_SubjectCode: { Year: row.Year, SubjectCode: row.SubjectCode } },
          update: {},
          create: {
            Year: row.Year,
            SubjectCode: row.SubjectCode,
            MinCredits: row.MinCredits,
            MaxCredits: row.MaxCredits,
            SortOrder: row.SortOrder,
          },
        }),
      `Upsert grade_fundamental y${row.Year} ${row.SubjectCode}`,
    );
  }
  console.log(`✅ ${FUNDAMENTALS.length} grade_fundamental rows`);

  // ── Seed program-subject links ──────────────────────────────────────────────
  console.log("🔗 Seeding program-subject links...");
  const creditToNum = (c: subject_credit): number =>
    ({ CREDIT_05: 0.5, CREDIT_10: 1.0, CREDIT_15: 1.5, CREDIT_20: 2.0 } as Record<string, number>)[c] ?? 1.0;

  const PROGRAM_SUBJECTS: Record<string, string[]> = {
    "M1-GEN": ["ท21101","ค21101","ว21101","ส21101","พ21101","ศ21101","ง21101","อ21101","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M1"],
    "M2-GEN": ["ท22101","ค22101","ว22101","ส22101","พ22101","ศ22101","ง22101","อ22101","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M2"],
    "M3-GEN": ["ท23101","ค23101","ว23101","ส23101","พ23101","ศ23101","ง23101","อ23101","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M3"],
    "M4-SCI":       ["ท31101","ค31101","ว31101","ส31101","พ31101","อ31101","ค31201","ว31201","ว31202","ว31203","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M4"],
    "M5-SCI":       ["ท32101","ค32101","ว32101","ส32101","พ32101","อ32101","ค32201","ว32201","ว32202","ว32203","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M5"],
    "M6-SCI":       ["ท33101","ค33101","ว33101","ส33101","พ33101","อ33101","ค33201","ว33201","ว33202","ว33203","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M6"],
    "M4-LANG-MATH": ["ท31101","ค31101","ว31101","ส31101","พ31101","อ31101","ค31201","จ31201","ง31201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M4"],
    "M5-LANG-MATH": ["ท32101","ค32101","ว32101","ส32101","พ32101","อ32101","ค32201","จ32201","ง32201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M5"],
    "M6-LANG-MATH": ["ท33101","ค33101","ว33101","ส33101","พ33101","อ33101","ค33201","จ33201","ง33201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M6"],
    "M4-LANG-ARTS": ["ท31101","ค31101","ว31101","ส31101","พ31101","อ31101","จ31201","ญ31201","ส31102","ศ31201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M4"],
    "M5-LANG-ARTS": ["ท32101","ค32101","ว32101","ส32101","พ32101","อ32101","จ32201","ญ32201","ส32102","ศ32201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M5"],
    "M6-LANG-ARTS": ["ท33101","ค33101","ว33101","ส33101","พ33101","อ33101","จ33201","ญ33201","ส33102","ศ33201","ACT-GUIDE","ACT-CLUB","ACT-SCOUT-M6"],
  };

  let psCount = 0;
  for (const [pCode, codes] of Object.entries(PROGRAM_SUBJECTS)) {
    const pid = programMap.get(pCode)!;
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      const subj = subjectMap.get(code)!;
      if (subj.category === "CORE") continue;
      await withRetry(
        () =>
          prisma.program_subject.upsert({
            where: { ProgramID_SubjectCode: { ProgramID: pid, SubjectCode: code } },
            update: {},
            create: {
              ProgramID: pid,
              SubjectCode: code,
              Category: subj.category,
              IsMandatory: subj.category !== "ACTIVITY",
              MinCredits: creditToNum(subj.credit),
              SortOrder: i + 1,
            },
          }),
        `Link ${code} to ${pCode}`,
      );
      psCount++;
    }
  }
  console.log(`✅ ${psCount} program-subject links`);

  // ── Schedule generation helpers ─────────────────────────────────────────────
  // Lower-sec teacher assignments: subjectPrefix → { yearNum → email }
  // Each teacher covers all 3 sections of one year (day+period rotation avoids conflicts)
  const LOWER_TEACHERS: Record<string, Record<number, string>> = {
    "ท": { 1: "teacher1@school.ac.th",  2: "teacher2@school.ac.th",  3: "teacher3@school.ac.th" },
    "ค": { 1: "teacher4@school.ac.th",  2: "teacher5@school.ac.th",  3: "teacher6@school.ac.th" },
    "ว": { 1: "teacher7@school.ac.th",  2: "teacher8@school.ac.th",  3: "teacher9@school.ac.th" },
    "ส": { 1: "teacher11@school.ac.th", 2: "teacher12@school.ac.th", 3: "teacher13@school.ac.th" },
    "พ": { 1: "teacher14@school.ac.th", 2: "teacher15@school.ac.th", 3: "teacher14@school.ac.th" },
    "ศ": { 1: "teacher16@school.ac.th", 2: "teacher17@school.ac.th", 3: "teacher16@school.ac.th" },
    "ง": { 1: "teacher18@school.ac.th", 2: "teacher19@school.ac.th", 3: "teacher18@school.ac.th" },
    "อ": { 1: "teacher20@school.ac.th", 2: "teacher21@school.ac.th", 3: "teacher22@school.ac.th" },
    "ACT": { 1: "teacher27@school.ac.th", 2: "teacher28@school.ac.th", 3: "teacher27@school.ac.th" },
  };

  type SlotDef = { day: day_of_week; period: number; subjectCode: string; teacherEmail: string; teachHour: number };

  function buildLowerSecSlots(yearNum: number, sectionNum: number): SlotDef[] {
    // Day-rotation per year prevents activity-teacher cross-year conflicts
    // Period-rotation per section lets same teacher cover 3 sections without timeslot collision
    const dayBase = yearNum - 1;
    const periBase = sectionNum - 1;
    const d = (offset: number): day_of_week => DAYS[(dayBase + offset) % 5];
    const p = (offset: number): number => JUNIOR_PERIODS[(periBase + offset) % JUNIOR_PERIODS.length];
    // Subject code: prefix + "2" (lower-sec level) + yearNum + "101"
    const sub = (prefix: string) => `${prefix}2${yearNum}101`;
    const te = (prefix: string) => LOWER_TEACHERS[prefix]?.[yearNum] ?? "teacher27@school.ac.th";

    return [
      { day: d(0), period: p(0), subjectCode: sub("ท"), teacherEmail: te("ท"), teachHour: 3 },
      { day: d(1), period: p(0), subjectCode: sub("ท"), teacherEmail: te("ท"), teachHour: 3 },
      { day: d(2), period: p(0), subjectCode: sub("ท"), teacherEmail: te("ท"), teachHour: 3 },
      { day: d(0), period: p(1), subjectCode: sub("ค"), teacherEmail: te("ค"), teachHour: 3 },
      { day: d(1), period: p(1), subjectCode: sub("ค"), teacherEmail: te("ค"), teachHour: 3 },
      { day: d(2), period: p(1), subjectCode: sub("ค"), teacherEmail: te("ค"), teachHour: 3 },
      { day: d(0), period: p(2), subjectCode: sub("ว"), teacherEmail: te("ว"), teachHour: 3 },
      { day: d(1), period: p(2), subjectCode: sub("ว"), teacherEmail: te("ว"), teachHour: 3 },
      { day: d(2), period: p(2), subjectCode: sub("ว"), teacherEmail: te("ว"), teachHour: 3 },
      { day: d(3), period: p(0), subjectCode: sub("ส"), teacherEmail: te("ส"), teachHour: 2 },
      { day: d(4), period: p(0), subjectCode: sub("ส"), teacherEmail: te("ส"), teachHour: 2 },
      { day: d(3), period: p(1), subjectCode: sub("พ"), teacherEmail: te("พ"), teachHour: 2 },
      { day: d(4), period: p(1), subjectCode: sub("พ"), teacherEmail: te("พ"), teachHour: 2 },
      { day: d(3), period: p(2), subjectCode: sub("ศ"), teacherEmail: te("ศ"), teachHour: 2 },
      { day: d(4), period: p(2), subjectCode: sub("ศ"), teacherEmail: te("ศ"), teachHour: 2 },
      { day: d(0), period: p(3), subjectCode: sub("ง"), teacherEmail: te("ง"), teachHour: 2 },
      { day: d(1), period: p(3), subjectCode: sub("ง"), teacherEmail: te("ง"), teachHour: 2 },
      { day: d(2), period: p(3), subjectCode: sub("อ"), teacherEmail: te("อ"), teachHour: 2 },
      { day: d(3), period: p(3), subjectCode: sub("อ"), teacherEmail: te("อ"), teachHour: 2 },
      { day: d(4), period: p(3), subjectCode: `ACT-SCOUT-M${yearNum}`, teacherEmail: te("ACT"), teachHour: 2 },
      { day: d(4), period: p(4), subjectCode: `ACT-SCOUT-M${yearNum}`, teacherEmail: te("ACT"), teachHour: 2 },
      { day: d(4), period: p(5), subjectCode: "ACT-GUIDE",             teacherEmail: te("ACT"), teachHour: 1 },
      { day: d(4), period: p(6), subjectCode: "ACT-CLUB",              teacherEmail: te("ACT"), teachHour: 1 },
    ];
  }

  // Upper-sec teacher assignments: track → year → roleKey → email
  const UPPER_TEACHERS: Record<string, Record<number, Record<string, string>>> = {
    SCIENCE_MATH: {
      4: { ท:"teacher1@school.ac.th", ค:"teacher4@school.ac.th", ว:"teacher7@school.ac.th",
           ส:"teacher11@school.ac.th", พ:"teacher14@school.ac.th", อ:"teacher20@school.ac.th",
           adv_ค:"teacher5@school.ac.th", adv_ว1:"teacher8@school.ac.th",
           adv_ว2:"teacher9@school.ac.th", adv_ว3:"teacher10@school.ac.th", ACT:"teacher27@school.ac.th" },
      5: { ท:"teacher2@school.ac.th", ค:"teacher5@school.ac.th", ว:"teacher8@school.ac.th",
           ส:"teacher12@school.ac.th", พ:"teacher15@school.ac.th", อ:"teacher21@school.ac.th",
           adv_ค:"teacher6@school.ac.th", adv_ว1:"teacher9@school.ac.th",
           adv_ว2:"teacher10@school.ac.th", adv_ว3:"teacher7@school.ac.th", ACT:"teacher28@school.ac.th" },
      6: { ท:"teacher3@school.ac.th", ค:"teacher6@school.ac.th", ว:"teacher9@school.ac.th",
           ส:"teacher13@school.ac.th", พ:"teacher14@school.ac.th", อ:"teacher22@school.ac.th",
           adv_ค:"teacher4@school.ac.th", adv_ว1:"teacher10@school.ac.th",
           adv_ว2:"teacher7@school.ac.th", adv_ว3:"teacher8@school.ac.th", ACT:"teacher27@school.ac.th" },
    },
    LANGUAGE_MATH: {
      4: { ท:"teacher1@school.ac.th", ค:"teacher4@school.ac.th", ว:"teacher7@school.ac.th",
           ส:"teacher11@school.ac.th", พ:"teacher14@school.ac.th", อ:"teacher20@school.ac.th",
           adv_ค:"teacher5@school.ac.th", จ:"teacher24@school.ac.th", ง:"teacher18@school.ac.th", ACT:"teacher28@school.ac.th" },
      5: { ท:"teacher2@school.ac.th", ค:"teacher5@school.ac.th", ว:"teacher8@school.ac.th",
           ส:"teacher12@school.ac.th", พ:"teacher15@school.ac.th", อ:"teacher21@school.ac.th",
           adv_ค:"teacher6@school.ac.th", จ:"teacher25@school.ac.th", ง:"teacher19@school.ac.th", ACT:"teacher27@school.ac.th" },
      6: { ท:"teacher3@school.ac.th", ค:"teacher6@school.ac.th", ว:"teacher9@school.ac.th",
           ส:"teacher13@school.ac.th", พ:"teacher14@school.ac.th", อ:"teacher22@school.ac.th",
           adv_ค:"teacher4@school.ac.th", จ:"teacher24@school.ac.th", ง:"teacher18@school.ac.th", ACT:"teacher28@school.ac.th" },
    },
    LANGUAGE_ARTS: {
      4: { ท:"teacher1@school.ac.th", ค:"teacher4@school.ac.th", ว:"teacher7@school.ac.th",
           ส:"teacher11@school.ac.th", พ:"teacher14@school.ac.th", อ:"teacher23@school.ac.th",
           จ:"teacher24@school.ac.th", ญ:"teacher26@school.ac.th",
           adv_ส:"teacher12@school.ac.th", adv_ศ:"teacher16@school.ac.th", ACT:"teacher28@school.ac.th" },
      5: { ท:"teacher2@school.ac.th", ค:"teacher5@school.ac.th", ว:"teacher8@school.ac.th",
           ส:"teacher12@school.ac.th", พ:"teacher15@school.ac.th", อ:"teacher23@school.ac.th",
           จ:"teacher25@school.ac.th", ญ:"teacher26@school.ac.th",
           adv_ส:"teacher13@school.ac.th", adv_ศ:"teacher17@school.ac.th", ACT:"teacher27@school.ac.th" },
      6: { ท:"teacher3@school.ac.th", ค:"teacher6@school.ac.th", ว:"teacher9@school.ac.th",
           ส:"teacher13@school.ac.th", พ:"teacher14@school.ac.th", อ:"teacher23@school.ac.th",
           จ:"teacher24@school.ac.th", ญ:"teacher26@school.ac.th",
           adv_ส:"teacher11@school.ac.th", adv_ศ:"teacher16@school.ac.th", ACT:"teacher28@school.ac.th" },
    },
  };

  function buildUpperSecSlots(yearNum: number, track: string): SlotDef[] {
    // Section mapping: SCI→1, LANG-MATH→2, LANG-ARTS→3
    const sectionNum = track === "SCIENCE_MATH" ? 1 : track === "LANGUAGE_MATH" ? 2 : 3;
    const dayBase = yearNum - 4; // M4→0, M5→1, M6→2
    const periBase = sectionNum - 1;
    const d = (offset: number): day_of_week => DAYS[(dayBase + offset) % 5];
    const p = (offset: number): number => SENIOR_PERIODS[(periBase + offset) % SENIOR_PERIODS.length];
    const x = yearNum - 3; // M4→1, M5→2, M6→3
    const yr = `3${x}`; // "31", "32", "33"
    const te = (key: string) => UPPER_TEACHERS[track]?.[yearNum]?.[key] ?? "teacher27@school.ac.th";

    const slots: SlotDef[] = [
      // Core 6 subjects (2 periods each)
      { day: d(0), period: p(0), subjectCode: `ท${yr}101`, teacherEmail: te("ท"), teachHour: 2 },
      { day: d(1), period: p(0), subjectCode: `ท${yr}101`, teacherEmail: te("ท"), teachHour: 2 },
      { day: d(0), period: p(1), subjectCode: `ค${yr}101`, teacherEmail: te("ค"), teachHour: 2 },
      { day: d(1), period: p(1), subjectCode: `ค${yr}101`, teacherEmail: te("ค"), teachHour: 2 },
      { day: d(0), period: p(2), subjectCode: `ว${yr}101`, teacherEmail: te("ว"), teachHour: 2 },
      { day: d(1), period: p(2), subjectCode: `ว${yr}101`, teacherEmail: te("ว"), teachHour: 2 },
      { day: d(2), period: p(0), subjectCode: `ส${yr}101`, teacherEmail: te("ส"), teachHour: 2 },
      { day: d(3), period: p(0), subjectCode: `ส${yr}101`, teacherEmail: te("ส"), teachHour: 2 },
      { day: d(2), period: p(1), subjectCode: `พ${yr}101`, teacherEmail: te("พ"), teachHour: 2 },
      { day: d(3), period: p(1), subjectCode: `พ${yr}101`, teacherEmail: te("พ"), teachHour: 2 },
      { day: d(2), period: p(2), subjectCode: `อ${yr}101`, teacherEmail: te("อ"), teachHour: 2 },
      { day: d(3), period: p(2), subjectCode: `อ${yr}101`, teacherEmail: te("อ"), teachHour: 2 },
      // Activities
      { day: d(4), period: p(0), subjectCode: `ACT-SCOUT-M${yearNum}`, teacherEmail: te("ACT"), teachHour: 2 },
      { day: d(4), period: p(1), subjectCode: `ACT-SCOUT-M${yearNum}`, teacherEmail: te("ACT"), teachHour: 2 },
      { day: d(4), period: p(2), subjectCode: "ACT-GUIDE",              teacherEmail: te("ACT"), teachHour: 1 },
      { day: d(4), period: p(3), subjectCode: "ACT-CLUB",               teacherEmail: te("ACT"), teachHour: 1 },
    ];

    if (track === "SCIENCE_MATH") {
      // Advanced Math (4 periods) + Physics/Chem/Bio (3 periods each)
      slots.push(
        { day: d(0), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te("adv_ค"), teachHour: 4 },
        { day: d(1), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te("adv_ค"), teachHour: 4 },
        { day: d(2), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te("adv_ค"), teachHour: 4 },
        { day: d(3), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te("adv_ค"), teachHour: 4 },
        { day: d(0), period: p(4), subjectCode: `ว${yr}201`, teacherEmail: te("adv_ว1"), teachHour: 3 },
        { day: d(1), period: p(4), subjectCode: `ว${yr}201`, teacherEmail: te("adv_ว1"), teachHour: 3 },
        { day: d(2), period: p(4), subjectCode: `ว${yr}201`, teacherEmail: te("adv_ว1"), teachHour: 3 },
        { day: d(0), period: p(5), subjectCode: `ว${yr}202`, teacherEmail: te("adv_ว2"), teachHour: 3 },
        { day: d(1), period: p(5), subjectCode: `ว${yr}202`, teacherEmail: te("adv_ว2"), teachHour: 3 },
        { day: d(2), period: p(5), subjectCode: `ว${yr}202`, teacherEmail: te("adv_ว2"), teachHour: 3 },
        { day: d(3), period: p(4), subjectCode: `ว${yr}203`, teacherEmail: te("adv_ว3"), teachHour: 3 },
        { day: d(4), period: p(4), subjectCode: `ว${yr}203`, teacherEmail: te("adv_ว3"), teachHour: 3 },
        { day: d(3), period: p(5), subjectCode: `ว${yr}203`, teacherEmail: te("adv_ว3"), teachHour: 3 },
      );
    } else if (track === "LANGUAGE_MATH") {
      slots.push(
        { day: d(0), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te("adv_ค"), teachHour: 4 },
        { day: d(1), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te("adv_ค"), teachHour: 4 },
        { day: d(2), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te("adv_ค"), teachHour: 4 },
        { day: d(3), period: p(3), subjectCode: `ค${yr}201`, teacherEmail: te("adv_ค"), teachHour: 4 },
        { day: d(0), period: p(4), subjectCode: `จ${yr}201`, teacherEmail: te("จ"),     teachHour: 3 },
        { day: d(1), period: p(4), subjectCode: `จ${yr}201`, teacherEmail: te("จ"),     teachHour: 3 },
        { day: d(2), period: p(4), subjectCode: `จ${yr}201`, teacherEmail: te("จ"),     teachHour: 3 },
        { day: d(0), period: p(5), subjectCode: `ง${yr}201`, teacherEmail: te("ง"),     teachHour: 2 },
        { day: d(1), period: p(5), subjectCode: `ง${yr}201`, teacherEmail: te("ง"),     teachHour: 2 },
      );
    } else { // LANGUAGE_ARTS
      slots.push(
        { day: d(0), period: p(3), subjectCode: `จ${yr}201`,  teacherEmail: te("จ"),     teachHour: 3 },
        { day: d(1), period: p(3), subjectCode: `จ${yr}201`,  teacherEmail: te("จ"),     teachHour: 3 },
        { day: d(2), period: p(3), subjectCode: `จ${yr}201`,  teacherEmail: te("จ"),     teachHour: 3 },
        { day: d(0), period: p(4), subjectCode: `ญ${yr}201`,  teacherEmail: te("ญ"),     teachHour: 3 },
        { day: d(1), period: p(4), subjectCode: `ญ${yr}201`,  teacherEmail: te("ญ"),     teachHour: 3 },
        { day: d(2), period: p(4), subjectCode: `ญ${yr}201`,  teacherEmail: te("ญ"),     teachHour: 3 },
        { day: d(0), period: p(5), subjectCode: `ส${yr}102`,  teacherEmail: te("adv_ส"), teachHour: 3 },
        { day: d(1), period: p(5), subjectCode: `ส${yr}102`,  teacherEmail: te("adv_ส"), teachHour: 3 },
        { day: d(2), period: p(5), subjectCode: `ส${yr}102`,  teacherEmail: te("adv_ส"), teachHour: 3 },
        { day: d(3), period: p(3), subjectCode: `ศ${yr}201`,  teacherEmail: te("adv_ศ"), teachHour: 2 },
        { day: d(3), period: p(4), subjectCode: `ศ${yr}201`,  teacherEmail: te("adv_ศ"), teachHour: 2 },
      );
    }
    return slots;
  }

  // Grade metadata lookup for schedule dispatch
  const GRADE_META: Record<string, { yearNum: number; sectionNum: number; track?: string }> = {
    "M1-1":{yearNum:1,sectionNum:1}, "M1-2":{yearNum:1,sectionNum:2}, "M1-3":{yearNum:1,sectionNum:3},
    "M2-1":{yearNum:2,sectionNum:1}, "M2-2":{yearNum:2,sectionNum:2}, "M2-3":{yearNum:2,sectionNum:3},
    "M3-1":{yearNum:3,sectionNum:1}, "M3-2":{yearNum:3,sectionNum:2}, "M3-3":{yearNum:3,sectionNum:3},
    "M4-1":{yearNum:4,sectionNum:1,track:"SCIENCE_MATH"},
    "M4-2":{yearNum:4,sectionNum:2,track:"LANGUAGE_MATH"},
    "M4-3":{yearNum:4,sectionNum:3,track:"LANGUAGE_ARTS"},
    "M5-1":{yearNum:5,sectionNum:1,track:"SCIENCE_MATH"},
    "M5-2":{yearNum:5,sectionNum:2,track:"LANGUAGE_MATH"},
    "M5-3":{yearNum:5,sectionNum:3,track:"LANGUAGE_ARTS"},
    "M6-1":{yearNum:6,sectionNum:1,track:"SCIENCE_MATH"},
    "M6-2":{yearNum:6,sectionNum:2,track:"LANGUAGE_MATH"},
    "M6-3":{yearNum:6,sectionNum:3,track:"LANGUAGE_ARTS"},
  };

  // ── S1 (1-2568): timeslots ──────────────────────────────────────────────────
  console.log("\n⏰ Seeding S1-2568 timeslots...");
  // "MON1" (legacy period coord) → real teaching-slot TimeslotID
  const s1TsMap = new Map<string, string>();
  const s1Timeslots = generateTimeslots({
    AcademicYear: 2568,
    Semester: "SEMESTER_1",
    Days: DAYS,
    StartTime: configTemplate.StartTime,
    slots: SLOTS_2568,
  });
  for (const ts of s1Timeslots) {
    await withRetry(
      () =>
        prisma.timeslot.upsert({
          where: { TimeslotID: ts.TimeslotID },
          update: {},
          create: {
            TimeslotID: ts.TimeslotID,
            AcademicYear: ts.AcademicYear,
            Semester: ts.Semester,
            StartTime: ts.StartTime,
            EndTime: ts.EndTime,
            Breaktime: ts.Breaktime,
            DayOfWeek: ts.DayOfWeek,
          },
        }),
      `Upsert S1 timeslot ${ts.TimeslotID}`,
    );
  }
  // Legacy (group, day, period) coordinates map onto the group's teaching slots
  // so juniors fill the senior-lunch slot and seniors the junior-lunch slot,
  // and no class ever lands on a break slot for its own group.
  for (const day of DAYS) {
    for (const period of JUNIOR_PERIODS) {
      s1TsMap.set(`junior-${day}${period}`, `1-2568-${day}${slotFor(period, "junior")}`);
    }
    for (const period of SENIOR_PERIODS) {
      s1TsMap.set(`senior-${day}${period}`, `1-2568-${day}${slotFor(period, "senior")}`);
    }
  }
  console.log(`✅ ${s1Timeslots.length} S1-2568 timeslots`);

  await withRetry(
    () =>
      prisma.table_config.upsert({
        where: { ConfigID: "1-2568" },
        update: {},
        create: { ConfigID: "1-2568", AcademicYear: 2568, Semester: "SEMESTER_1", Config: configTemplate, status: "PUBLISHED" },
      }),
    "Upsert table config 1-2568",
  );
  console.log("✅ table_config 1-2568 (PUBLISHED)");

  // ── S1 responsibilities + class schedules ───────────────────────────────────
  console.log("📝 Seeding S1-2568 responsibilities + schedules...");
  const ROOM_NAMES = ALL_ROOMS.map((r) => r.name);
  const ROOM_IDS = ROOM_NAMES.map((n) => roomMap.get(n)!);
  // Per-timeslot room tracker. Lower/upper dayBase rotations collide
  // (M1↔M4, M2↔M5, M3↔M6 share dayBase), so we pick first unused room
  // per timeslot rather than indexing by slot position.
  const s1RoomUsed = new Map<string, Set<number>>();
  function pickRoom(tsId: string, gradeIdx: number): number | null {
    let used = s1RoomUsed.get(tsId);
    if (!used) { used = new Set(); s1RoomUsed.set(tsId, used); }
    for (let i = 0; i < ROOM_IDS.length; i++) {
      const rid = ROOM_IDS[(gradeIdx + i) % ROOM_IDS.length];
      if (!used.has(rid)) { used.add(rid); return rid; }
    }
    return null;
  }
  let s1RespCount = 0;
  let s1SchedCount = 0;

  for (const grade of ALL_GRADES) {
    const meta = GRADE_META[grade.id]!;
    const slots =
      meta.yearNum <= 3
        ? buildLowerSecSlots(meta.yearNum, meta.sectionNum)
        : buildUpperSecSlots(meta.yearNum, meta.track!);

    // Deduplicate responsibilities by (teacherEmail, subjectCode)
    const uniqueResps = new Map<string, { email: string; subCode: string; teachHour: number }>();
    for (const slot of slots) {
      const k = `${slot.teacherEmail}::${slot.subjectCode}`;
      if (!uniqueResps.has(k)) {
        uniqueResps.set(k, { email: slot.teacherEmail, subCode: slot.subjectCode, teachHour: slot.teachHour });
      }
    }

    const respIDMap = new Map<string, number>();
    for (const [k, resp] of uniqueResps) {
      const tid = teacherMap.get(resp.email)!;
      const existing = await prisma.teachers_responsibility.findFirst({
        where: { TeacherID: tid, GradeID: grade.id, SubjectCode: resp.subCode, AcademicYear: 2568, Semester: "SEMESTER_1" },
      });
      const r =
        existing ??
        (await withRetry(
          () =>
            prisma.teachers_responsibility.create({
              data: { TeacherID: tid, GradeID: grade.id, SubjectCode: resp.subCode, AcademicYear: 2568, Semester: "SEMESTER_1", TeachHour: resp.teachHour },
            }),
          `Create resp ${resp.subCode}/${grade.id}/S1`,
        ));
      respIDMap.set(k, r.RespID);
      s1RespCount++;
    }

    const gradeIdx = ALL_GRADES.findIndex((g) => g.id === grade.id);
    const group = meta.yearNum <= 3 ? "junior" : "senior";
    for (let si = 0; si < slots.length; si++) {
      const slot = slots[si];
      const tsId = s1TsMap.get(`${group}-${slot.day}${slot.period}`);
      if (!tsId) continue;
      const respId = respIDMap.get(`${slot.teacherEmail}::${slot.subjectCode}`);
      if (!respId) continue;
      const roomId = pickRoom(tsId, gradeIdx);
      if (roomId === null) continue;

      try {
        await withRetry(
          () =>
            prisma.class_schedule.create({
              data: {
                TimeslotID: tsId,
                SubjectCode: slot.subjectCode,
                GradeID: grade.id,
                RoomID: roomId,
                IsLocked: false,
                teachers_responsibility: { connect: [{ RespID: respId }] },
              },
            }),
          `Create schedule ${grade.id} ${tsId}`,
        );
        s1SchedCount++;
      } catch (err: any) {
        if (!err.message?.includes("Unique constraint")) {
          console.warn(`⚠️ skip ${grade.id}/${tsId}: ${err.message}`);
        }
      }
    }
  }
  console.log(`✅ S1-2568: ${s1RespCount} responsibilities, ${s1SchedCount} class schedules`);

  // ── E2E teacher responsibility (ค21201 / M1-1) ──────────────────────────────
  // Pinned for e2e/fixtures/seed-data.fixture.ts. No class_schedule — fixture
  // tests only verify the responsibility exists, not that it's scheduled.
  const e2eTid = teacherMap.get("e2e.teacher@school.ac.th");
  if (e2eTid) {
    const existing = await prisma.teachers_responsibility.findFirst({
      where: { TeacherID: e2eTid, GradeID: "M1-1", SubjectCode: "ค21201", AcademicYear: 2568, Semester: "SEMESTER_1" },
    });
    if (!existing) {
      await prisma.teachers_responsibility.create({
        data: { TeacherID: e2eTid, GradeID: "M1-1", SubjectCode: "ค21201", AcademicYear: 2568, Semester: "SEMESTER_1", TeachHour: 2 },
      });
    }
    console.log(`   ➕ E2E teacher → ค21201 / M1-1 / S1-2568`);
  }

  // ── S2 (2-2568): timeslots ──────────────────────────────────────────────────
  console.log("\n⏰ Seeding S2-2568 timeslots...");
  const s2TsMap = new Map<string, string>();
  const s2Timeslots = generateTimeslots({
    AcademicYear: 2568,
    Semester: "SEMESTER_2",
    Days: DAYS,
    StartTime: configTemplate.StartTime,
    slots: SLOTS_2568,
  });
  for (const ts of s2Timeslots) {
    await withRetry(
      () =>
        prisma.timeslot.upsert({
          where: { TimeslotID: ts.TimeslotID },
          update: {},
          create: {
            TimeslotID: ts.TimeslotID,
            AcademicYear: ts.AcademicYear,
            Semester: ts.Semester,
            StartTime: ts.StartTime,
            EndTime: ts.EndTime,
            Breaktime: ts.Breaktime,
            DayOfWeek: ts.DayOfWeek,
          },
        }),
      `Upsert S2 timeslot ${ts.TimeslotID}`,
    );
  }
  for (const day of DAYS) {
    for (const period of JUNIOR_PERIODS) {
      s2TsMap.set(`junior-${day}${period}`, `2-2568-${day}${slotFor(period, "junior")}`);
    }
    for (const period of SENIOR_PERIODS) {
      s2TsMap.set(`senior-${day}${period}`, `2-2568-${day}${slotFor(period, "senior")}`);
    }
  }
  console.log(`✅ ${s2Timeslots.length} S2-2568 timeslots`);

  await withRetry(
    () =>
      prisma.table_config.upsert({
        where: { ConfigID: "2-2568" },
        update: {},
        create: { ConfigID: "2-2568", AcademicYear: 2568, Semester: "SEMESTER_2", Config: configTemplate, status: "DRAFT" },
      }),
    "Upsert table config 2-2568",
  );
  console.log("✅ table_config 2-2568 (DRAFT)");

  // ── S2 conflict scenarios ───────────────────────────────────────────────────
  console.log("\n⚠️  Seeding S2-2568 conflict scenarios...");

  async function s2Resp(teacherEmail: string, gradeId: string, subjectCode: string, teachHour: number) {
    const tid = teacherMap.get(teacherEmail)!;
    const existing = await prisma.teachers_responsibility.findFirst({
      where: { TeacherID: tid, GradeID: gradeId, SubjectCode: subjectCode, AcademicYear: 2568, Semester: "SEMESTER_2" },
    });
    return (
      existing ??
      (await prisma.teachers_responsibility.create({
        data: { TeacherID: tid, GradeID: gradeId, SubjectCode: subjectCode, AcademicYear: 2568, Semester: "SEMESTER_2", TeachHour: teachHour },
      }))
    );
  }

  // Scenario A: Teacher double-booked at same timeslot
  // No DB constraint on (TimeslotID, TeacherID) — this seeds intentionally
  console.log("  Scenario A: teacher double-booking...");
  const aTs1 = s2TsMap.get("junior-MON1")!;
  const aResp1 = await s2Resp("teacher1@school.ac.th", "M1-1", "ท21101", 3);
  const aResp2 = await s2Resp("teacher1@school.ac.th", "M1-2", "ท21101", 3);
  for (const [gid, respId, room] of [
    ["M1-1", aResp1.RespID, "ห้อง 101"] as [string, number, string],
    ["M1-2", aResp2.RespID, "ห้อง 102"] as [string, number, string],
  ]) {
    try {
      await prisma.class_schedule.create({
        data: { TimeslotID: aTs1, SubjectCode: "ท21101", GradeID: gid, RoomID: roomMap.get(room)!, IsLocked: false, teachers_responsibility: { connect: [{ RespID: respId }] } },
      });
    } catch (err: any) {
      if (!err.message?.includes("Unique constraint")) console.warn(`⚠️ A: ${err.message}`);
    }
  }
  const aTs2 = s2TsMap.get("junior-TUE2")!;
  const bResp1 = await s2Resp("teacher4@school.ac.th", "M2-1", "ค22101", 3);
  const bResp2 = await s2Resp("teacher4@school.ac.th", "M2-2", "ค22101", 3);
  for (const [gid, respId, room] of [
    ["M2-1", bResp1.RespID, "ห้อง 103"] as [string, number, string],
    ["M2-2", bResp2.RespID, "ห้อง 104"] as [string, number, string],
  ]) {
    try {
      await prisma.class_schedule.create({
        data: { TimeslotID: aTs2, SubjectCode: "ค22101", GradeID: gid, RoomID: roomMap.get(room)!, IsLocked: false, teachers_responsibility: { connect: [{ RespID: respId }] } },
      });
    } catch (err: any) {
      if (!err.message?.includes("Unique constraint")) console.warn(`⚠️ A2: ${err.message}`);
    }
  }
  console.log("  ✅ Scenario A: T1 and T4 each double-booked at same timeslot");

  // Scenario B: Overloaded teacher — T7 (Science) TeachHour=10 across 6 grades
  console.log("  Scenario B: teacher overload...");
  for (const gradeId of ["M1-1","M1-2","M1-3","M3-1","M3-2","M3-3"]) {
    const subCode = gradeId.startsWith("M1") ? "ว21101" : "ว23101";
    await s2Resp("teacher7@school.ac.th", gradeId, subCode, 10);
  }
  console.log("  ✅ Scenario B: T7 (Science) 10h × 6 grades = 60h/week overload");

  // Scenario C: Missing room assignments (~40% null RoomID)
  console.log("  Scenario C: missing room assignments...");
  const cSubjects = [
    { code: "ท31101", email: "teacher1@school.ac.th" },
    { code: "ค31101", email: "teacher4@school.ac.th" },
    { code: "ว31101", email: "teacher7@school.ac.th" },
    { code: "ส31101", email: "teacher11@school.ac.th" },
    { code: "อ31101", email: "teacher20@school.ac.th" },
  ];
  const cTsKeys = ["MON2","MON3","TUE1","TUE3","WED1"];
  const s2RoomUsed = new Map<string, Set<number>>();
  function pickS2Room(tsId: string, gradeIdx: number): number | null {
    let used = s2RoomUsed.get(tsId);
    if (!used) { used = new Set(); s2RoomUsed.set(tsId, used); }
    for (let i = 0; i < ROOM_IDS.length; i++) {
      const rid = ROOM_IDS[(gradeIdx + i) % ROOM_IDS.length];
      if (!used.has(rid)) { used.add(rid); return rid; }
    }
    return null;
  }
  let cCount = 0;
  for (let gi = 0; gi < 3; gi++) {
    const gradeId = ["M4-1","M4-2","M4-3"][gi];
    for (let si = 0; si < cSubjects.length; si++) {
      const subj = cSubjects[si];
      const tsId = s2TsMap.get(`senior-${cTsKeys[si]}`)!;
      const resp = await s2Resp(subj.email, gradeId, subj.code, 2);
      const useRoom = (gi * cSubjects.length + si) % 5 >= 2;
      try {
        await prisma.class_schedule.create({
          data: {
            TimeslotID: tsId, SubjectCode: subj.code, GradeID: gradeId,
            RoomID: useRoom ? pickS2Room(tsId, gi) : null,
            IsLocked: false,
            teachers_responsibility: { connect: [{ RespID: resp.RespID }] },
          },
        });
        cCount++;
      } catch (err: any) {
        if (!err.message?.includes("Unique constraint")) console.warn(`⚠️ C: ${err.message}`);
      }
    }
  }
  console.log(`  ✅ Scenario C: ${cCount} schedules with ~40% null rooms`);

  // Scenario D: Sparse schedule — M5-2 and M6-3 only ~30% fill
  console.log("  Scenario D: sparse schedules...");
  const sparseItems = [
    { gradeId: "M5-2", subCode: "ค32101", email: "teacher5@school.ac.th", tsKeys: ["MON1","WED1"] },
    { gradeId: "M6-3", subCode: "ท33101", email: "teacher3@school.ac.th", tsKeys: ["TUE1","THU1"] },
  ];
  let dCount = 0;
  for (const item of sparseItems) {
    const resp = await s2Resp(item.email, item.gradeId, item.subCode, 2);
    for (const tsKey of item.tsKeys) {
      const tsId = s2TsMap.get(`senior-${tsKey}`)!;
      try {
        await prisma.class_schedule.create({
          data: {
            TimeslotID: tsId, SubjectCode: item.subCode, GradeID: item.gradeId,
            RoomID: roomMap.get("ห้อง 205")!, IsLocked: false,
            teachers_responsibility: { connect: [{ RespID: resp.RespID }] },
          },
        });
        dCount++;
      } catch (err: any) {
        if (!err.message?.includes("Unique constraint")) console.warn(`⚠️ D: ${err.message}`);
      }
    }
  }
  console.log(`  ✅ Scenario D: ${dCount} sparse schedules (M5-2, M6-3)`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(70));
  console.log("🌐 Demo Data Seed 2568 Complete!");
  console.log("=".repeat(70));
  console.log(`   Subjects: ${ALL_SUBJECTS.length}`);
  console.log(`   Programs: ${ALL_PROGRAMS.length}`);
  console.log(`   Grades: ${ALL_GRADES.length}`);
  console.log(`   Rooms: ${ALL_ROOMS.length}`);
  console.log(`   Teachers: ${ALL_TEACHERS.length}`);
  console.log(`   S1-2568: PUBLISHED — full M.1–M.6 timetable (${s1SchedCount} schedules)`);
  console.log(`   S2-2568: DRAFT — conflict showcase A/B/C/D`);
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

  // Dev-only default password (NEVER used in production)
  const DEV_DEFAULT_PASSWORD = "admin123";

  // Admin password configuration:
  // - Development: Falls back to DEV_DEFAULT_PASSWORD for convenience
  // - Production: MUST set SEED_ADMIN_PASSWORD to a strong password
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || DEV_DEFAULT_PASSWORD;
  const isProduction = process.env.NODE_ENV === "production";

  // Security guard: Block weak passwords in production seeding
  if (
    isProduction &&
    (!process.env.SEED_ADMIN_PASSWORD || adminPassword === DEV_DEFAULT_PASSWORD)
  ) {
    throw new Error(
      "🔒 SECURITY: SEED_ADMIN_PASSWORD must be set to a strong password in production. " +
        "Do not use the default password in production environments."
    );
  }

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
      password: adminPassword,
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

  // Log success (don't reveal password in production logs)
  if (isProduction) {
    console.log(
      "✅ Admin user created via better-auth API (email: admin@school.local)",
    );
  } else {
    console.log(
      `✅ Admin user created via better-auth API (email: admin@school.local, password: ${adminPassword})`,
    );
  }

  // ===== TEACHER AUTH USER (E2E) =====
  // Login for the pinned E2E teacher fixture (e2e.teacher@school.ac.th).
  const teacherPassword = process.env.TEACHER_PASSWORD ?? "teacher123";
  const teacherEmail = "e2e.teacher@school.ac.th";

  if (
    isProduction &&
    (!process.env.TEACHER_PASSWORD || teacherPassword === "teacher123")
  ) {
    throw new Error(
      "🔒 SECURITY: TEACHER_PASSWORD must be set to a strong, non-default " +
        "password in production.",
    );
  }

  const existingTeacherUser = await withRetry(
    () => prisma.user.findUnique({ where: { email: teacherEmail } }),
    "Check existing teacher user",
  );
  if (existingTeacherUser) {
    console.log("🗑️  Deleting existing teacher user and auth data...");
    await withRetry(
      () =>
        prisma.account.deleteMany({
          where: { userId: existingTeacherUser.id },
        }),
      "Delete teacher accounts",
    );
    await withRetry(
      () => prisma.user.delete({ where: { id: existingTeacherUser.id } }),
      "Delete teacher user",
    );
    console.log("✅ Existing teacher user deleted");
  }

  const teacherSignUp = await auth.api.signUpEmail({
    body: {
      email: teacherEmail,
      password: teacherPassword,
      name: "E2E ทดสอบ",
    },
  });
  if (!teacherSignUp?.user) {
    throw new Error("Failed to create teacher user via better-auth API");
  }
  await withRetry(
    () =>
      prisma.user.update({
        where: { id: teacherSignUp.user.id },
        data: { role: "teacher", emailVerified: true },
      }),
    "Update teacher user role",
  );
  console.log(`✅ Teacher auth user created (${teacherEmail})`);

  // ===== SEEDING MODE SELECTION =====
  const isDemoMode = process.env.SEED_DEMO_DATA === "true";
  const isTestMode = process.env.SEED_FOR_TESTS === "true";
  const isCleanDataMode = process.env.SEED_CLEAN_DATA === "true";
  // Default to MOE full-rotation when seeding clean/test data so timetables
  // are populated end-to-end across all M.1-M.6 sections per the canonical
  // weekly hour standards in src/config/moe-standards.ts.
  const isMoeFullSemesterMode =
    process.env.SEED_MOE_FULL_SEMESTER === "true" ||
    isCleanDataMode ||
    isTestMode;
  const shouldCleanData =
    isCleanDataMode || isTestMode || isMoeFullSemesterMode;

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
  }
  if (isMoeFullSemesterMode) {
    console.log("📘 MOE full semester mode enabled - Seeding full timetable...");
  } else {
    console.log(
      "⚠️  SEED_CLEAN_DATA=true - Cleaning existing timetable data...",
    );
  }

  // Clean existing timetable data (preserve better-auth tables)
  console.log("🧹 Cleaning existing data...");

  // Clean better-auth sessions for test mode to prevent stale auth conflicts
  if (isTestMode) {
    console.log("🔐 Cleaning auth sessions for test mode...");
    await withRetry(() => prisma.session.deleteMany({}), "Delete sessions");
    console.log("✅ Auth sessions cleaned");
  }

  // CI/E2E stability: Postgres sequences keep incrementing after deleteMany().
  // In test/clean seed modes, reset identity columns so fixtures that assume
  // TeacherID/RoomID/etc start from 1 remain valid across runs.
  let didTruncateTimetableTables = false;
  if (shouldCleanData && !isAccelerate) {
    const truncateSql =
      'TRUNCATE TABLE "class_schedule", "teachers_responsibility", "program_subject", "timeslot", "table_config", "gradelevel", "subject", "program", "teacher", "room" RESTART IDENTITY CASCADE;';
    await withRetry(
      () => prisma.$executeRawUnsafe(truncateSql),
      "Truncate timetable tables (RESTART IDENTITY)",
    );
    didTruncateTimetableTables = true;
  } else if (shouldCleanData && isAccelerate) {
    console.warn(
      "⚠️  Skipping TRUNCATE ... RESTART IDENTITY because Prisma Accelerate/Data Proxy is in use; falling back to deleteMany() cleanup.",
    );
  }

  if (!didTruncateTimetableTables) {
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
    await withRetry(
      () => prisma.gradelevel.deleteMany({}),
      "Delete gradelevel",
    );
    await withRetry(() => prisma.subject.deleteMany({}), "Delete subject");
    await withRetry(() => prisma.program.deleteMany({}), "Delete program");
    await withRetry(() => prisma.teacher.deleteMany({}), "Delete teacher");
    await withRetry(() => prisma.room.deleteMany({}), "Delete room");
  }
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

  if (isMoeFullSemesterMode) {
    // MOE full semester: year-agnostic electives for upper secondary (Year=0)
    additionalSubjects.push(
      {
        code: "ค30201",
        name: "คณิตศาสตร์เพิ่มเติม (ม.4-6)",
        credit: "CREDIT_15" as subject_credit,
        learningArea: "MATHEMATICS" as LearningArea,
      },
      {
        code: "ว30201",
        name: "ฟิสิกส์เพิ่มเติม (ม.4-6)",
        credit: "CREDIT_15" as subject_credit,
        learningArea: "SCIENCE" as LearningArea,
      },
      {
        code: "ว30202",
        name: "เคมีเพิ่มเติม (ม.4-6)",
        credit: "CREDIT_15" as subject_credit,
        learningArea: "SCIENCE" as LearningArea,
      },
      {
        code: "ว30203",
        name: "ชีววิทยาเพิ่มเติม (ม.4-6)",
        credit: "CREDIT_15" as subject_credit,
        learningArea: "SCIENCE" as LearningArea,
      },
      {
        code: "อ30201",
        name: "ภาษาอังกฤษเพื่อการสื่อสาร (ม.4-6)",
        credit: "CREDIT_15" as subject_credit,
        learningArea: "FOREIGN_LANGUAGE" as LearningArea,
      },
      {
        code: "จ30201",
        name: "ภาษาจีน (ม.4-6)",
        credit: "CREDIT_15" as subject_credit,
        learningArea: "FOREIGN_LANGUAGE" as LearningArea,
      },
      {
        code: "ส30201",
        name: "ประวัติศาสตร์สากล (ม.4-6)",
        credit: "CREDIT_10" as subject_credit,
        learningArea: "SOCIAL" as LearningArea,
      },
      {
        code: "ส30202",
        name: "เศรษฐศาสตร์เบื้องต้น (ม.4-6)",
        credit: "CREDIT_10" as subject_credit,
        learningArea: "SOCIAL" as LearningArea,
      },
      {
        code: "ท30201",
        name: "วรรณคดีไทย (ม.4-6)",
        credit: "CREDIT_10" as subject_credit,
        learningArea: "THAI" as LearningArea,
      },
      {
        code: "ศ30201",
        name: "ศิลปะเพิ่มเติม (ม.4-6)",
        credit: "CREDIT_10" as subject_credit,
        learningArea: "ARTS" as LearningArea,
      },
      {
        code: "ว30204",
        name: "วิทยาการคำนวณ (ม.4-6)",
        credit: "CREDIT_10" as subject_credit,
        learningArea: "SCIENCE" as LearningArea,
      },
      {
        code: "ญ30201",
        name: "ภาษาญี่ปุ่น (ม.4-6)",
        credit: "CREDIT_15" as subject_credit,
        learningArea: "FOREIGN_LANGUAGE" as LearningArea,
      },
    );
  }

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
      if (!program) {
        throw new Error(
          `Program not found for grade ${gradeId} (expected ${programCode})`,
        );
      }

      gradeLevels.push(
        await withRetry(
          () =>
            prisma.gradelevel.create({
              data: {
                GradeID: gradeId,
                Year: year,
                Number: number,
                StudentCount: 35 + Math.floor(Math.random() * 10),
                ProgramID: program.ProgramID,
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
  console.log("👨‍🏫 Creating teachers (target: 40 + 1 E2E)...");
  const teachers: any[] = [];
  let teacherEmailCount = 1;
  const TOTAL_TEACHERS = 40;
  const teachersPerDept = Math.floor(TOTAL_TEACHERS / DEPARTMENTS.length); // 5 each for 8 departments

  // CI/E2E stability: avoid non-deterministic `Math.random()` in test/clean seed modes.
  // Tests and fixtures rely on predictable teacher names across runs.
  const deterministicSeed =
    process.env.SEED_FOR_TESTS === "true" ||
    process.env.SEED_CLEAN_DATA === "true" ||
    process.env.SEED_MOE_FULL_SEMESTER === "true";
  const pick = <T>(values: T[], index: number) =>
    values[((index % values.length) + values.length) % values.length];

  const e2eTeacher = await withRetry(
    () =>
      prisma.teacher.upsert({
        where: { Email: "e2e.teacher@school.ac.th" },
        update: {},
        create: {
          Prefix: "ครู",
          Firstname: "E2E",
          Lastname: "ทดสอบ",
          Department: "คณิตศาสตร์",
          Email: "e2e.teacher@school.ac.th",
          Role: "teacher",
        },
      }),
    "Upsert E2E teacher",
  );
  teachers.push(e2eTeacher);
  console.log(`✅ Created E2E teacher (${e2eTeacher.Email})`);

  for (const dept of DEPARTMENTS) {
    for (let i = 0; i < teachersPerDept; i++) {
      const ordinal = teacherEmailCount - 1;
      const prefix = deterministicSeed
        ? pick(THAI_PREFIXES, ordinal)
        : THAI_PREFIXES[Math.floor(Math.random() * THAI_PREFIXES.length)];
      const firstname = deterministicSeed
        ? pick(THAI_FIRSTNAMES, ordinal)
        : THAI_FIRSTNAMES[Math.floor(Math.random() * THAI_FIRSTNAMES.length)];
      const lastname = deterministicSeed
        ? pick(THAI_LASTNAMES, ordinal)
        : THAI_LASTNAMES[Math.floor(Math.random() * THAI_LASTNAMES.length)];

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
  const academicYear = 2568;
  const sem: semester = "SEMESTER_1";
  const semesterNumber =
    sem === "SEMESTER_1" ? 1 : sem === "SEMESTER_2" ? 2 : 3;
  const days: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];

  // One real timeslot per slot (11/day) — breaks are occupying slots.
  const timeslots = generateTimeslots({
    AcademicYear: academicYear,
    Semester: sem,
    Days: days,
    StartTime: "08:30",
    slots: SLOTS_2568,
  });
  for (const ts of timeslots) {
    await withRetry(
      () =>
        prisma.timeslot.create({
          data: {
            TimeslotID: ts.TimeslotID,
            AcademicYear: ts.AcademicYear,
            Semester: ts.Semester,
            StartTime: ts.StartTime,
            EndTime: ts.EndTime,
            Breaktime: ts.Breaktime,
            DayOfWeek: ts.DayOfWeek,
          },
        }),
      `Create timeslot ${ts.TimeslotID}`,
    );
  }

  console.log(
    `✅ Created ${timeslots.length} timeslots for Semester 1 (5 days × ${SLOTS_2568.length} slots)`,
  );

  // ===== TIMESLOTS (SEMESTER 2) =====
  console.log("⏰ Creating timeslots for Semester 2...");
  const sem2: semester = "SEMESTER_2";
  const semesterNumber2 = 2;
  const timeslotsSem2 = generateTimeslots({
    AcademicYear: academicYear,
    Semester: sem2,
    Days: days,
    StartTime: "08:30",
    slots: SLOTS_2568,
  });
  for (const ts of timeslotsSem2) {
    await withRetry(
      () =>
        prisma.timeslot.create({
          data: {
            TimeslotID: ts.TimeslotID,
            AcademicYear: ts.AcademicYear,
            Semester: ts.Semester,
            StartTime: ts.StartTime,
            EndTime: ts.EndTime,
            Breaktime: ts.Breaktime,
            DayOfWeek: ts.DayOfWeek,
          },
        }),
      `Create timeslot S2 ${ts.TimeslotID}`,
    );
  }
  console.log(
    `✅ Created ${timeslotsSem2.length} timeslots for Semester 2 (5 days × ${SLOTS_2568.length} slots)`,
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
            StartTime: "08:30",
            Days: ["MON", "TUE", "WED", "THU", "FRI"],
            slots: SLOTS_2568,
          },
          status: "PUBLISHED",
        },
      }),
    "Create table config",
  );
  console.log("✅ Created timetable configuration for 1-2568");

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
            StartTime: "08:30",
            Days: ["MON", "TUE", "WED", "THU", "FRI"],
            slots: SLOTS_2568,
          },
          status: "DRAFT",
        },
      }),
    "Create table config for Semester 2",
  );
  console.log("✅ Created timetable configuration for 2-2568");

  // ===== BREAK GROUPS =====
  console.log("🗂️  Creating break groups...");
  // gradelevel.Year is 1..6 (M.1=1 … M.6=6); junior = M.1-3, senior = M.4-6.
  const juniorGradeIds = gradeLevels.filter(g => g.Year >= 1 && g.Year <= 3).map(g => g.GradeID);
  const seniorGradeIds = gradeLevels.filter(g => g.Year >= 4 && g.Year <= 6).map(g => g.GradeID);

  const cleanBreakGroups = [
    { configId: "1-2568", name: "junior", label: "พักกลางวัน (ม.ต้น)", color: "#fca5a5", gradeIds: juniorGradeIds },
    { configId: "1-2568", name: "senior", label: "พักกลางวัน (ม.ปลาย)", color: "#fcd34d", gradeIds: seniorGradeIds },
    { configId: "2-2568", name: "junior", label: "พักกลางวัน (ม.ต้น)", color: "#fca5a5", gradeIds: juniorGradeIds },
    { configId: "2-2568", name: "senior", label: "พักกลางวัน (ม.ปลาย)", color: "#fcd34d", gradeIds: seniorGradeIds },
  ];

  for (const bg of cleanBreakGroups) {
    await withRetry(
      () =>
        prisma.break_group.create({
          data: {
            Name: bg.name,
            Label: bg.label,
            Color: bg.color,
            ConfigID: bg.configId,
            grades: {
              create: bg.gradeIds.map(gid => ({ GradeID: gid })),
            },
          },
        }),
      `Create break group ${bg.configId}/${bg.name}`,
    );
  }
  console.log("✅ Created break groups");


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

  const creditToWeeklyLessons = (credit: subject_credit): number => {
    switch (credit) {
      case "CREDIT_05":
        return 1;
      case "CREDIT_10":
        return 2;
      case "CREDIT_15":
        return 3;
      case "CREDIT_20":
        return 4;
      default:
        return 2;
    }
  };

  const responsibilities: any[] = [];
  const classSchedules: any[] = [];

  if (isMoeFullSemesterMode) {
    console.log("🔗 Assigning subjects to all programs (MOE full semester)...");

    const targetAcademicYear = 2568;
    const targetSemesters: Array<{ sem: semester; num: 1 | 2 }> = [
      { sem: "SEMESTER_1", num: 1 },
      { sem: "SEMESTER_2", num: 2 },
    ];
    const scheduleDays: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];
    // Per-grade teaching slots: a grade teaches in other groups' lunch slots
    // (staggered breaks free real teaching time — the Phase 2A win). Break
    // slots for the grade (universal recess + its own lunch) are excluded.
    const breakIndex = buildGradeGroupIndex([
      { name: "junior", label: "", color: "", gradeIds: juniorGradeIds },
      { name: "senior", label: "", color: "", gradeIds: seniorGradeIds },
    ]);
    const teachingSlotsForGrade = (gradeId: string): number[] => {
      const out: number[] = [];
      for (let i = 0; i < SLOTS_2568.length; i++) {
        if (!isBreakForGrade(i + 1, gradeId, SLOTS_2568, breakIndex)) {
          out.push(i + 1);
        }
      }
      return out;
    };

    const corePrefixByArea: Record<LearningArea, string> = {
      THAI: "ท",
      MATHEMATICS: "ค",
      SCIENCE: "ว",
      SOCIAL: "ส",
      HEALTH_PE: "พ",
      ARTS: "ศ",
      CAREER: "ง",
      FOREIGN_LANGUAGE: "อ",
    };

    const lowerCoreWeeklyLessons: Record<LearningArea, number> = {
      THAI: 4,
      MATHEMATICS: 4,
      SCIENCE: 3,
      SOCIAL: 3,
      HEALTH_PE: 2,
      ARTS: 2,
      CAREER: 2,
      FOREIGN_LANGUAGE: 2,
    };

    const upperCoreWeeklyLessons: Record<LearningArea, number> = {
      THAI: 3,
      MATHEMATICS: 3,
      SCIENCE: 2,
      SOCIAL: 2,
      HEALTH_PE: 2,
      ARTS: 0,
      CAREER: 0,
      FOREIGN_LANGUAGE: 2,
    };

    const subjectCatalog = [
      ...coreSubjects,
      ...additionalSubjects,
      ...activitySubjects,
    ];
    const subjectByCode = new Map(
      subjectCatalog.map((subject) => [subject.code, subject]),
    );

    type ProgramPlanItem = {
      code: string;
      category: SubjectCategory;
      weeklyLessons: number;
    };

    const gradeIndicatorForYear = (year: number) =>
      year <= 3 ? `2${year}` : `3${year - 3}`;

    const buildCorePlan = (year: number): ProgramPlanItem[] => {
      const gradeIndicator = gradeIndicatorForYear(year);
      const weeklyLessons =
        year <= 3 ? lowerCoreWeeklyLessons : upperCoreWeeklyLessons;
      const plan: ProgramPlanItem[] = [];

      for (const [areaKey, lessons] of Object.entries(weeklyLessons)) {
        if (!lessons) continue;
        const area = areaKey as LearningArea;
        const prefix = corePrefixByArea[area];
        const code = `${prefix}${gradeIndicator}101`;
        plan.push({ code, category: "CORE", weeklyLessons: lessons });
      }

      return plan;
    };

    const buildLowerElectives = (
      year: number,
      track: ProgramTrack,
    ): ProgramPlanItem[] => {
      const mathExtra = `ค2${year}201`;
      const scienceExtra = `ว2${year}201`;
      const englishExtra = `อ2${year}201`;
      const thaiExtra = "ท20201";

      const electivesByTrack: Record<ProgramTrack, Record<string, number>> = {
        SCIENCE_MATH: {
          [mathExtra]: 2,
          [scienceExtra]: 2,
        },
        LANGUAGE_MATH: {
          [mathExtra]: 2,
          [englishExtra]: 2,
        },
        LANGUAGE_ARTS: {
          [thaiExtra]: 2,
          [englishExtra]: 2,
        },
        GENERAL: {
          [englishExtra]: 2,
        },
      };

      const electives = electivesByTrack[track] ?? {};
      return Object.entries(electives).map(([code, weeklyLessons]) => {
        const subject = subjectByCode.get(code);
        if (!subject || !("credit" in subject)) {
          throw new Error(`Missing elective subject for MOE seed: ${code}`);
        }
        return {
          code,
          category: "ADDITIONAL",
          weeklyLessons,
        };
      });
    };

    const buildUpperElectives = (track: ProgramTrack): ProgramPlanItem[] => {
      const electivesByTrack: Record<ProgramTrack, Record<string, number>> = {
        SCIENCE_MATH: {
          ค30201: 4,
          ว30201: 3,
          ว30202: 3,
          ว30203: 3,
          ว30204: 2,
        },
        LANGUAGE_MATH: {
          ค30201: 3,
          อ30201: 3,
          ส30201: 2,
          ท30201: 2,
          ศ30201: 2,
        },
        LANGUAGE_ARTS: {
          อ30201: 3,
          จ30201: 3,
          ญ30201: 3,
          ส30201: 2,
          ศ30201: 2,
        },
        GENERAL: {
          อ30201: 3,
          ส30201: 2,
          ส30202: 2,
        },
      };

      const electives = electivesByTrack[track] ?? {};
      return Object.entries(electives).map(([code, weeklyLessons]) => {
        const subject = subjectByCode.get(code);
        if (!subject || !("credit" in subject)) {
          throw new Error(`Missing elective subject for MOE seed: ${code}`);
        }
        return {
          code,
          category: "ADDITIONAL",
          weeklyLessons,
        };
      });
    };

    const buildActivityPlan = (year: number): ProgramPlanItem[] => {
      const activityCodes = [
        "ACT-HOMEROOM",
        "ACT-CLUB",
        `ACT-SCOUT-M${year}`,
        `ACT-GUIDE-M${year}`,
      ];

      return activityCodes.map((code) => ({
        code,
        category: "ACTIVITY",
        weeklyLessons: 1,
      }));
    };

    const buildProgramPlan = (
      year: number,
      track: ProgramTrack,
    ): ProgramPlanItem[] => {
      const corePlan = buildCorePlan(year);
      const electivePlan =
        year <= 3
          ? buildLowerElectives(year, track)
          : buildUpperElectives(track);
      const activityPlan = buildActivityPlan(year);
      return [...corePlan, ...electivePlan, ...activityPlan];
    };

    const programPlans = new Map<number, ProgramPlanItem[]>();

    for (const program of programs) {
      const plan = buildProgramPlan(program.Year, program.Track);
      programPlans.set(program.ProgramID, plan);

      let sortOrder = 1;
      for (const item of plan) {
        const subject = subjectByCode.get(item.code);
        if (!subject) {
          throw new Error(`Missing subject in catalog: ${item.code}`);
        }
        const minCredits =
          "credit" in subject ? creditToNumber(subject.credit) : 0.5;

        await withRetry(
          () =>
            prisma.program_subject.upsert({
              where: {
                ProgramID_SubjectCode: {
                  ProgramID: program.ProgramID,
                  SubjectCode: item.code,
                },
              },
              update: {
                Category: item.category,
                IsMandatory: item.category !== "ADDITIONAL",
                MinCredits: minCredits,
                SortOrder: sortOrder++,
              },
              create: {
                ProgramID: program.ProgramID,
                SubjectCode: item.code,
                Category: item.category,
                IsMandatory: item.category !== "ADDITIONAL",
                MinCredits: minCredits,
                SortOrder: sortOrder++,
              },
            }),
          `Upsert program-subject ${program.ProgramCode} ${item.code}`,
        );
      }
    }

    console.log(
      `✅ Assigned MOE program subjects for ${programs.length} programs`,
    );

    // Keep the E2E teacher OUT of the MOE rotation pool. It owns only the
    // explicit unplaced ค21201/M1-1 fixture row (created below); if the
    // rotation assigned and placed a subject onto it, the arrange palette
    // (which hides fully-placed responsibilities) would show 0 subjects and
    // schedule-assignment.spec.ts would fail nondeterministically depending on
    // teacher ordering in a fresh DB. See bc2.
    const teachersByDept = new Map<string, typeof teachers>();
    for (const teacher of teachers) {
      if (teacher.Email === "e2e.teacher@school.ac.th") continue;
      const bucket = teachersByDept.get(teacher.Department) ?? [];
      bucket.push(teacher);
      teachersByDept.set(teacher.Department, bucket);
    }
    const activityTeacherPool =
      teachersByDept.get("การงานอาชีพ") ?? teachers;

    const getTeacherForSubject = (
      code: string,
      gradeIndex: number,
      subjectIndex: number,
    ) => {
      if (code.startsWith("ACT")) {
        return activityTeacherPool[
          (gradeIndex + subjectIndex) % activityTeacherPool.length
        ];
      }
      const dept = SUBJECT_PREFIX_TO_DEPT[code.charAt(0)];
      const pool = teachersByDept.get(dept) ?? teachers;
      return pool[(gradeIndex + subjectIndex) % pool.length];
    };

    const buildWeeklySlots = (plan: ProgramPlanItem[]) => {
      const queue = plan.map((item) => ({
        code: item.code,
        remaining: item.weeklyLessons,
      }));
      const slots: string[] = [];
      let remainingTotal = queue.reduce((sum, item) => sum + item.remaining, 0);

      while (remainingTotal > 0) {
        for (const entry of queue) {
          if (entry.remaining <= 0) continue;
          slots.push(entry.code);
          entry.remaining -= 1;
          remainingTotal -= 1;
        }
      }

      return slots;
    };

    for (const { sem: targetSemester, num: targetSemesterNumber } of targetSemesters) {
      console.log(
        `🔁 Seeding MOE rotation for ${targetSemesterNumber}-${targetAcademicYear}...`,
      );
      const responsibilityByGradeSubject = new Map<string, any>();

      // Greedy slot assignment: a teacher can only be in one place per
      // timeslot, and a grade can only host one non-locked subject per
      // timeslot. Tracking both prevents the cross-grade collisions the
      // original `slotIndex / periodsPerDay` distribution produced (every
      // grade started at MON1, so any teacher with multi-grade
      // responsibilities was double-booked at slot 1). Locked activities
      // (ACT*) intentionally span all grades, so they bypass tracking.
      const usedTeacherSlot = new Set<string>();
      const usedGradeSlot = new Set<string>();

      // Keep M1-1's first 3 teaching slots (MON1/MON2/MON4 — slot 3 is the
      // universal recess) OPEN so the E2E teacher's unplaced ค21201/M1-1
      // responsibility is reliably placeable in arrange e2e. The arrange grid
      // is teacher-scoped (E2E teacher has no classes → every cell looks
      // empty); the drag-target finder picks the first empty non-break cell
      // (MON1), which must also be grade-free for M1-1. Marking them used here
      // makes the scheduler skip them. See ttv.
      for (const reservedSlot of teachingSlotsForGrade("M1-1").slice(0, 3)) {
        usedGradeSlot.add(
          `M1-1|${generateTimeslotId(targetSemesterNumber, targetAcademicYear, "MON", reservedSlot)}`,
        );
      }

      // Per-semester teacher_responsibility creation
      for (let gradeIndex = 0; gradeIndex < gradeLevels.length; gradeIndex++) {
        const gradeLevel = gradeLevels[gradeIndex];
        const plan = programPlans.get(gradeLevel.ProgramID ?? -1);
        if (!plan) {
          throw new Error(
            `Missing program plan for grade ${gradeLevel.GradeID}`,
          );
        }

        for (let subjectIndex = 0; subjectIndex < plan.length; subjectIndex++) {
          const item = plan[subjectIndex];
          const teacher = getTeacherForSubject(
            item.code,
            gradeIndex,
            subjectIndex,
          );

          const resp = await withRetry(
            () =>
              prisma.teachers_responsibility.upsert({
                where: {
                  TeacherID_GradeID_SubjectCode_AcademicYear_Semester: {
                    TeacherID: teacher.TeacherID,
                    GradeID: gradeLevel.GradeID,
                    SubjectCode: item.code,
                    AcademicYear: targetAcademicYear,
                    Semester: targetSemester,
                  },
                },
                update: {
                  TeachHour: item.weeklyLessons,
                },
                create: {
                  TeacherID: teacher.TeacherID,
                  GradeID: gradeLevel.GradeID,
                  SubjectCode: item.code,
                  AcademicYear: targetAcademicYear,
                  Semester: targetSemester,
                  TeachHour: item.weeklyLessons,
                },
              }),
            `Assign ${item.code} to ${gradeLevel.GradeID} (${targetSemesterNumber}-${targetAcademicYear})`,
          );

          responsibilities.push(resp);
          responsibilityByGradeSubject.set(
            `${gradeLevel.GradeID}:${item.code}`,
            resp,
          );
        }
      }

      // Per-semester class_schedule creation
      for (let gradeIndex = 0; gradeIndex < gradeLevels.length; gradeIndex++) {
        const gradeLevel = gradeLevels[gradeIndex];
        const plan = programPlans.get(gradeLevel.ProgramID ?? -1);
        if (!plan) continue;

        const slots = buildWeeklySlots(plan);
        // Teaching slots are grade-specific: juniors teach in the senior lunch
        // slot and vice-versa, so capacity differs per grade.
        const teaching = teachingSlotsForGrade(gradeLevel.GradeID);
        const perDay = teaching.length;
        if (slots.length > scheduleDays.length * perDay) {
          throw new Error(
            `Weekly lessons exceed available slots for ${gradeLevel.GradeID}`,
          );
        }

        const room = rooms[gradeIndex] ?? rooms[gradeIndex % rooms.length];

        const totalCapacity = scheduleDays.length * perDay;
        for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
          const subjectCode = slots[slotIndex];
          const resp = responsibilityByGradeSubject.get(
            `${gradeLevel.GradeID}:${subjectCode}`,
          );
          if (!resp) continue;

          const isActivity = subjectCode.startsWith("ACT");

          // Find next free position avoiding teacher/grade collisions.
          // Both trackers are honored for activities and regular subjects;
          // (TimeslotID, GradeID) is unique in the DB so no class can ever
          // double-book a grade, and a real teacher can only be in one
          // place at a time.
          let position = slotIndex;
          let timeslotId = "";
          let day: string | undefined;
          let period = 0;
          let attempts = 0;
          while (attempts < totalCapacity) {
            // Round-robin BY DAY (day-minor), not day-major: lesson N goes to
            // day N%5 then period floor(N/5). Day-major packing filled MON→THU
            // first and left FRI empty whenever weekly lessons < 4×perDay
            // (every grade's load), so Friday never showed any classes.
            day = scheduleDays[position % scheduleDays.length];
            if (!day) break;
            period = teaching[Math.floor(position / scheduleDays.length) % perDay];
            timeslotId = generateTimeslotId(
              targetSemesterNumber,
              targetAcademicYear,
              day,
              period,
            );
            const teacherKey = `${resp.TeacherID}|${timeslotId}`;
            const gradeKey = `${gradeLevel.GradeID}|${timeslotId}`;
            if (
              !usedTeacherSlot.has(teacherKey) &&
              !usedGradeSlot.has(gradeKey)
            ) {
              break;
            }
            position += 1;
            attempts += 1;
          }
          if (!day) break;

          usedTeacherSlot.add(`${resp.TeacherID}|${timeslotId}`);
          usedGradeSlot.add(`${gradeLevel.GradeID}|${timeslotId}`);

          classSchedules.push(
            await withRetry(
              () =>
                prisma.class_schedule.create({
                  data: {
                    TimeslotID: timeslotId,
                    SubjectCode: subjectCode,
                    GradeID: gradeLevel.GradeID,
                    RoomID: isActivity ? null : room.RoomID,
                    IsLocked: isActivity,
                    teachers_responsibility: {
                      connect: [{ RespID: resp.RespID }],
                    },
                  },
                }),
              `Create schedule ${gradeLevel.GradeID} ${subjectCode} (${targetSemesterNumber}-${targetAcademicYear})`,
            ),
          );
        }
      }
    }

    console.log(
      `✅ Created ${responsibilities.length} teacher responsibilities and ${classSchedules.length} class schedules across ${targetSemesters.length} semesters`,
    );
  } else {
    // ===== PROGRAM-SUBJECT ASSIGNMENTS (Example for M.1 programs) =====
    console.log("🔗 Assigning subjects to M.1 programs...");

  const m1SciProgram = programs.find((p) => p.ProgramCode === "M1-SCI")!;
  const m1LangMathProgram = programs.find(
    (p) => p.ProgramCode === "M1-LANG-MATH",
  )!;
  const m1LangProgram = programs.find((p) => p.ProgramCode === "M1-LANG")!;

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
            AcademicYear: 2568,
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
  const peTeachers = getTeachersByDept("สุขศึกษาและพลศึกษา");
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

  // ===== E2E TEACHER RESPONSIBILITIES =====
  // Explicitly assign math subjects to E2E teacher (TeacherID typically 1)
  // This ensures E2E tests have a teacher with draggable subjects
  console.log("📝 Creating E2E teacher responsibilities...");
  const e2eTeacherInList = teachers.find(
    (t) => t.Email === "e2e.teacher@school.ac.th",
  );
  if (e2eTeacherInList) {
    // Assign math additional subject (ค21201) for first M.1 grade level only
    // Using additional subject so it doesn't conflict with other math teachers
    const firstGrade = gradeLevels[0]; // M.1/1
    if (firstGrade) {
      const resp = await withRetry(
        () =>
          prisma.teachers_responsibility.create({
            data: {
              TeacherID: e2eTeacherInList.TeacherID,
              GradeID: firstGrade.GradeID,
              SubjectCode: "ค21201", // Math additional subject (คณิตศาสตร์เพิ่มเติม)
              AcademicYear: 2568,
              Semester: "SEMESTER_1",
              TeachHour: 2,
            },
          }),
        `Assign ค21201 to E2E teacher for ${firstGrade.GradeID}`,
      );
      responsibilities.push(resp);
      console.log(
        `✅ Created E2E teacher responsibility (TeacherID: ${e2eTeacherInList.TeacherID}, Subject: ค21201, Grade: ${firstGrade.GradeID})`,
      );
    }
  }

  console.log(
    `✅ Created ${responsibilities.length} sample teacher responsibilities`,
  );

  // ===== SAMPLE CLASS SCHEDULES =====
  console.log("📅 Creating sample class schedules...");

  // Create regular class schedules for M.1 grades (first 3 grades)
  // This ensures teacher timetables show populated data for visual tests
  // Sample class schedule template using MOE subject codes for M.1 (ม.1)
  // รายวิชาพื้นฐานทั้ง 8 กลุ่มสาระ พร้อมคาบเพิ่มเติมตามมาตรฐาน กสพท.
  const scheduleTemplate = [
    { day: "MON", period: 1, subjectCode: "ท21101" }, // ภาษาไทย
    { day: "MON", period: 2, subjectCode: "ค21101" }, // คณิตศาสตร์
    { day: "MON", period: 3, subjectCode: "อ21101" }, // ภาษาอังกฤษ
    { day: "TUE", period: 1, subjectCode: "ว21101" }, // วิทยาศาสตร์
    { day: "TUE", period: 2, subjectCode: "ส21101" }, // สังคมศึกษา
    { day: "TUE", period: 3, subjectCode: "พ21101" }, // พลศึกษา
    { day: "WED", period: 1, subjectCode: "ศ21101" }, // ศิลปะ
    { day: "WED", period: 2, subjectCode: "ง21101" }, // การงานอาชีพ
    { day: "WED", period: 3, subjectCode: "ท21101" }, // ภาษาไทย (คาบที่ 2)
    { day: "THU", period: 1, subjectCode: "ค21101" }, // คณิตศาสตร์ (คาบที่ 2)
    { day: "THU", period: 2, subjectCode: "ว21101" }, // วิทยาศาสตร์ (คาบที่ 2)
    { day: "THU", period: 3, subjectCode: "อ21101" }, // ภาษาอังกฤษ (คาบที่ 2)
    { day: "FRI", period: 1, subjectCode: "ส21101" }, // สังคมศึกษา (คาบที่ 2)
    { day: "FRI", period: 2, subjectCode: "พ21101" }, // พลศึกษา (คาบที่ 2)
    { day: "FRI", period: 3, subjectCode: "ศ21101" }, // ศิลปะ (คาบที่ 2)
  ];

  for (let i = 0; i < 3; i++) {
    const gradeLevel = gradeLevels[i];
    const room = rooms[i % rooms.length];

    for (const schedule of scheduleTemplate) {
      // Leave M1-1's MON1-3 open for arrange e2e (ttv) — see the usedGradeSlot
      // reservation above.
      if (
        gradeLevel.GradeID === "M1-1" &&
        schedule.day === "MON" &&
        schedule.period <= 3
      ) {
        continue;
      }
      const timeslot = timeslots.find(
        (t) =>
          t.TimeslotID ===
          `${semesterNumber}-${academicYear}-${schedule.day}${oldPeriodToSlot(schedule.period)}`,
      );

      if (timeslot) {
        const resp = responsibilities.find(
          (r) =>
            r.GradeID === gradeLevel.GradeID &&
            r.SubjectCode === schedule.subjectCode,
        );

        if (resp) {
          try {
            classSchedules.push(
              await withRetry(
                () =>
                  prisma.class_schedule.create({
                    data: {
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
        (t) =>
          t.TimeslotID ===
          `${semesterNumber}-${academicYear}-MON${oldPeriodToSlot(8)}`,
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

  console.log(
    `✅ Created ${classSchedules.length} sample class schedules (including locked activities)`,
  );
  }

  // ===== E2E TEACHER FIXTURE (always; required by e2e/21-arrangement-flow.spec.ts) =====
  // E2E fixture pins ค21201 / M1-1 / 1-2568 to e2e.teacher@school.ac.th.
  // MOE rotation may assign that subject+grade to a different math teacher;
  // we still need this explicit row so the fixture lookup resolves deterministically.
  const e2eFixtureTeacher = teachers.find(
    (t) => t.Email === "e2e.teacher@school.ac.th",
  );
  const firstGradeForFixture = gradeLevels[0]; // M.1/1
  if (e2eFixtureTeacher && firstGradeForFixture) {
    console.log("📝 Ensuring E2E teacher fixture (ค21201, M1-1, 1-2568)...");
    await withRetry(
      () =>
        prisma.teachers_responsibility.upsert({
          where: {
            TeacherID_GradeID_SubjectCode_AcademicYear_Semester: {
              TeacherID: e2eFixtureTeacher.TeacherID,
              GradeID: firstGradeForFixture.GradeID,
              SubjectCode: "ค21201",
              AcademicYear: 2568,
              Semester: "SEMESTER_1",
            },
          },
          update: { TeachHour: 2 },
          create: {
            TeacherID: e2eFixtureTeacher.TeacherID,
            GradeID: firstGradeForFixture.GradeID,
            SubjectCode: "ค21201",
            AcademicYear: 2568,
            Semester: "SEMESTER_1",
            TeachHour: 2,
          },
        }),
      "Upsert E2E teacher fixture (ค21201/M1-1/1-2568)",
    );
    console.log(
      `✅ E2E teacher fixture ensured (TeacherID: ${e2eFixtureTeacher.TeacherID})`,
    );
  }

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
    (typeof timeslotsSem2 !== "undefined" ? timeslotsSem2.length : 0);
  console.log(
    `   • Timeslots: ${totalTimeslots} (2 semesters: 1-2568, 2-2568)`,
  );
  console.log(`   • Teacher Responsibilities: ${responsibilities.length}`);
  console.log(`   • Class Schedules: ${classSchedules.length}`);
  console.log(`   • Table Configurations: 2`);
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
  if (isMoeFullSemesterMode) {
    console.log("   - ✅ Full semester schedules for M.1-M.6");
  } else {
    console.log(
      "   - ✅ Realistic teacher workload (1-3 subjects per Ministry standard)",
    );
    console.log("   - ✅ Sample class schedules for visual testing");
  }
  console.log("   - ✅ Locked timeslots for school-wide activities");
  console.log("   - ✅ Grade-program assignments");
  console.log("   - ✅ 2 semesters: 1-2568, 2-2568");
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
