/**
 * Minimal MOE-compliant seed for the "clean publish" happy-path E2E (task kjm).
 *
 * Why this exists, separate from prisma/seed.ts:
 *   checkPublishReadiness + findFullConfigData query programs/gradelevels
 *   UNFILTERED, so MOE readiness is a GLOBAL property of the whole school. The
 *   demo seed's 18 programs all fail MOE (missing learning areas, under-credited
 *   juniors) and not every grade is 100% scheduled — so a "ready" state is
 *   impossible there. This seeds a tiny TRUNCATED world that is globally ready:
 *     - 1 admin (better-auth, role=admin)
 *     - 1 program: Year 4 / GENERAL  (GENERAL skips validateTrackElectives)
 *     - 8 subjects, one per MOE learning area, mandatory, at the senior minimums
 *       (THAI3 MATH3 SCI3 SOCIAL2 HEALTH2 ARTS1 CAREER1 FOREIGN2 = 17 credits)
 *     - 1 gradelevel bound to that program
 *     - 5 non-break timeslots in 1-2568  (no breaks → row count == slot count)
 *     - teacher + responsibilities + 5 class_schedule rows filling the grade 100%
 *     - 1 DRAFT table_config (1-2568) for the gate to flip to PUBLISHED
 *
 * Run via:  dotenv -e .env.test.local -- tsx prisma/seed-publish-happy.ts
 * (see the publish-happy Playwright config). DATABASE_URL must point at the
 * local docker postgres; we refuse to TRUNCATE anything else.
 */

import {
  PrismaClient,
  semester,
  subject_credit,
  breaktime,
  day_of_week,
  ProgramTrack,
  SubjectCategory,
  LearningArea,
} from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const ACADEMIC_YEAR = 2568;
const SEMESTER_NUMBER = 1;
const SEMESTER: semester = "SEMESTER_1";
const CONFIG_ID = `${SEMESTER_NUMBER}-${ACADEMIC_YEAR}`;
const GRADE_ID = "M4-HAPPY-1";
const PROGRAM_CODE = "M4-GEN-PUBLISH-HAPPY";

const connectionString = process.env.DATABASE_URL ?? "";

// Hard guard: this seed TRUNCATEs. Never let it touch a remote / Accelerate DB.
// (.env's PRISMA_DATABASE_URL/ACCELERATE_URL leak is overridden by .env.test.local,
//  but assert on DATABASE_URL itself so a misconfigured run fails loud, not destructive.)
if (
  connectionString.startsWith("prisma+") ||
  !/localhost|127\.0\.0\.1/.test(connectionString)
) {
  throw new Error(
    `[seed-publish-happy] Refusing to run: DATABASE_URL must be a local postgres, got "${connectionString.slice(0, 32)}…". This seed TRUNCATEs.`,
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
  log: ["error", "warn"],
  errorFormat: "minimal",
  adapter,
});

/** SubjectCode, name, learning area, and the program_subject MinCredits = senior minimum. */
const SUBJECTS: Array<{
  code: string;
  name: string;
  area: LearningArea;
  minCredits: number;
}> = [
  { code: "ท31101", name: "ภาษาไทย", area: "THAI", minCredits: 3 },
  { code: "ค31101", name: "คณิตศาสตร์", area: "MATHEMATICS", minCredits: 3 },
  { code: "ว31101", name: "วิทยาศาสตร์", area: "SCIENCE", minCredits: 3 },
  { code: "ส31101", name: "สังคมศึกษา", area: "SOCIAL", minCredits: 2 },
  { code: "พ31101", name: "สุขศึกษาและพลศึกษา", area: "HEALTH_PE", minCredits: 2 },
  { code: "ศ31101", name: "ศิลปะ", area: "ARTS", minCredits: 1 },
  { code: "ง31101", name: "การงานอาชีพ", area: "CAREER", minCredits: 1 },
  { code: "อ31101", name: "ภาษาอังกฤษ", area: "FOREIGN_LANGUAGE", minCredits: 2 },
];

// 5 non-break slots → 5 class_schedule rows fills the single grade to 100%.
const SLOTS = [1, 2, 3, 4, 5];

async function createAdmin() {
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const email = process.env.ADMIN_EMAIL ?? "admin@school.local";

  // Fresh credentials each run (correct password hash for the auth.setup login).
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.account.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const { auth } = await import("../src/lib/auth.js");
  const result = await auth.api.signUpEmail({
    body: { email, password, name: "System Administrator" },
  });
  if (!result?.user) {
    throw new Error("Failed to create admin user via better-auth API");
  }
  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: "admin", emailVerified: true },
  });
  console.log(`✅ Admin ready (${email})`);
}

async function truncateTimetable() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "class_schedule", "teachers_responsibility", "program_subject", "timeslot", "table_config", "gradelevel", "subject", "program", "teacher", "room" RESTART IDENTITY CASCADE;',
  );
  console.log("🧹 Truncated timetable tables");
}

async function main() {
  console.log("\n🌱 Seeding minimal publish-happy world (1-2568)...\n");

  await createAdmin();
  await truncateTimetable();

  const program = await prisma.program.create({
    data: {
      ProgramCode: PROGRAM_CODE,
      ProgramName: "หลักสูตรทั่วไป ม.4 (Publish Happy E2E)",
      Year: 4,
      Track: "GENERAL" as ProgramTrack,
      MinTotalCredits: 17,
      IsActive: true,
    },
  });

  for (const s of SUBJECTS) {
    await prisma.subject.create({
      data: {
        SubjectCode: s.code,
        SubjectName: s.name,
        Credit: "CREDIT_15" as subject_credit,
        LearningArea: s.area,
        Category: "CORE" as SubjectCategory,
      },
    });
    await prisma.program_subject.create({
      data: {
        ProgramID: program.ProgramID,
        SubjectCode: s.code,
        Category: "CORE" as SubjectCategory,
        IsMandatory: true,
        MinCredits: s.minCredits,
      },
    });
  }
  console.log(`✅ Program + ${SUBJECTS.length} subjects (17 credits, all 8 areas)`);

  await prisma.gradelevel.create({
    data: {
      GradeID: GRADE_ID,
      Year: 4,
      Number: 1,
      StudentCount: 30,
      ProgramID: program.ProgramID,
    },
  });

  const room = await prisma.room.create({
    data: { RoomName: "ห้อง HAPPY-1", Building: "อาคารทดสอบ", Floor: "ชั้น 1" },
  });

  const teacher = await prisma.teacher.create({
    data: {
      Prefix: "นาย",
      Firstname: "ทดสอบ",
      Lastname: "เผยแพร่",
      Department: "-",
      Email: "teacher.happy@school.ac.th",
      Role: "teacher",
    },
  });

  for (const n of SLOTS) {
    const hour = String(7 + n).padStart(2, "0");
    await prisma.timeslot.create({
      data: {
        TimeslotID: `${SEMESTER_NUMBER}-${ACADEMIC_YEAR}-MON${n}`,
        AcademicYear: ACADEMIC_YEAR,
        Semester: SEMESTER,
        StartTime: new Date(`2024-01-01T${hour}:00:00`),
        EndTime: new Date(`2024-01-01T${hour}:50:00`),
        Breaktime: "NOT_BREAK" as breaktime,
        DayOfWeek: "MON" as day_of_week,
      },
    });
  }
  console.log(`✅ ${SLOTS.length} non-break timeslots for ${CONFIG_ID}`);

  // One responsibility + one class_schedule per slot, filling the grade 100%.
  for (let i = 0; i < SLOTS.length; i++) {
    const s = SUBJECTS[i];
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacher.TeacherID,
        GradeID: GRADE_ID,
        SubjectCode: s.code,
        AcademicYear: ACADEMIC_YEAR,
        Semester: SEMESTER,
        TeachHour: 1,
      },
    });
    await prisma.class_schedule.create({
      data: {
        TimeslotID: `${SEMESTER_NUMBER}-${ACADEMIC_YEAR}-MON${SLOTS[i]}`,
        SubjectCode: s.code,
        GradeID: GRADE_ID,
        RoomID: room.RoomID,
        teachers_responsibility: { connect: [{ RespID: resp.RespID }] },
      },
    });
  }
  console.log(`✅ Grade ${GRADE_ID} scheduled 100% (${SLOTS.length}/${SLOTS.length})`);

  await prisma.table_config.create({
    data: {
      ConfigID: CONFIG_ID,
      AcademicYear: ACADEMIC_YEAR,
      Semester: SEMESTER,
      status: "DRAFT",
      // canTransitionStatus gates DRAFT->PUBLISHED on completeness >= 30%.
      configCompleteness: 100,
      Config: {
        TimeslotPerDay: SLOTS.length,
        StartTime: "08:00",
        Duration: 50,
        Days: ["MON"],
        breakDefinitions: [],
      },
    },
  });
  console.log(`✅ DRAFT config ${CONFIG_ID}\n`);
  console.log("🎉 Publish-happy seed complete — global readiness = ready\n");
}

main()
  .catch((e) => {
    console.error("❌ seed-publish-happy failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
