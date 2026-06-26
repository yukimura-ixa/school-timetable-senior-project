/**
 * E2E Test Data Fixtures
 *
 * Mirrors the data created by `pnpm db:seed:demo` (i.e. seedDemoData() with
 * KEEP_CONFIG_IDS = ["1-2568", "2-2568"]). Run that command before E2E tests.
 *
 * Usage:
 *   import { testSemester, testTeacher, testSubject } from './fixtures/seed-data.fixture';
 */

import { semester, day_of_week } from "../../prisma/generated/client";

/**
 * Test Semester Data
 * From seedDemoData(): 1-2568 (PUBLISHED, full timetable) and 2-2568 (DRAFT, conflict showcase)
 */
export const testSemesters = {
  semester1_2568: {
    SemesterAndyear: "1-2568" as const,
    Semester: 1,
    Year: 2568,
    DisplayName: "ภาคเรียนที่ 1/2568",
    IsActive: true,
  },
  semester2_2568: {
    SemesterAndyear: "2-2568" as const,
    Semester: 2,
    Year: 2568,
    DisplayName: "ภาคเรียนที่ 2/2568",
    IsActive: false,
  },
};

/**
 * Default semester for most tests
 */
export const testSemester = testSemesters.semester1_2568;

/**
 * Test Teacher Data
 *
 * TeacherID values depend on auto-increment order in the seed and are not stable.
 * Look up teachers by Email instead. e2eTeacher is pinned to ค21201 / M1-1 / S1-2568
 * via an explicit responsibility record in seedDemoData().
 */
export const testTeachers = {
  e2eTeacher: {
    Prefix: "ครู",
    Firstname: "E2E",
    Lastname: "ทดสอบ",
    Department: "คณิตศาสตร์",
    Email: "e2e.teacher@school.ac.th",
    SubjectCode: "ค21201",
    GradeID: "M1-1",
  },
  thaiTeacher: {
    Email: "teacher1@school.ac.th",
    Department: "ภาษาไทย",
  },
  mathTeacher: {
    Email: "teacher4@school.ac.th",
    Department: "คณิตศาสตร์",
  },
  scienceTeacher: {
    Email: "teacher7@school.ac.th",
    Department: "วิทยาศาสตร์และเทคโนโลยี",
  },
  englishTeacher: {
    Email: "teacher20@school.ac.th",
    Department: "ภาษาต่างประเทศ",
  },
};

/**
 * Default teacher for most tests
 */
export const testTeacher = testTeachers.e2eTeacher;

/**
 * Test Subject Data
 * From seedDemoData() ALL_SUBJECTS — Thai MOE curriculum subjects
 */
export const testSubjects = {
  // Core Math subject (M.1)
  math101: {
    SubjectCode: "ค21101",
    SubjectName: "คณิตศาสตร์ พื้นฐาน ม.1",
    SubjectGroup: "คณิตศาสตร์",
    Credit: 1.5,
    IsRequired: true,
  },
  // Core Science subject (M.1)
  science101: {
    SubjectCode: "ว21101",
    SubjectName: "วิทยาศาสตร์และเทคโนโลยี ม.1",
    SubjectGroup: "วิทยาศาสตร์",
    Credit: 1.5,
    IsRequired: true,
  },
  // Core Thai language (M.1)
  thai101: {
    SubjectCode: "ท21101",
    SubjectName: "ภาษาไทย พื้นฐาน ม.1",
    SubjectGroup: "ภาษาไทย",
    Credit: 1.5,
    IsRequired: true,
  },
  // English language (M.1)
  english101: {
    SubjectCode: "อ21101",
    SubjectName: "ภาษาอังกฤษ พื้นฐาน ม.1",
    SubjectGroup: "ภาษาต่างประเทศ",
    Credit: 1.0,
    IsRequired: true,
  },
  // Math additional (M.1) — pinned to E2E teacher
  mathAdditional: {
    SubjectCode: "ค21201",
    SubjectName: "คณิตศาสตร์เพิ่มเติม ม.1",
    SubjectGroup: "คณิตศาสตร์",
    Credit: 1.5,
    IsRequired: false,
  },
};

/**
 * Default subject for most tests
 */
export const testSubject = testSubjects.thai101;

/**
 * Test Grade Level Data
 * From seedDemoData() ALL_GRADES — M.1 to M.6 with 3 sections each (18 grades total)
 */
export const testGradeLevels = {
  m1_1: {
    GradeID: "M1-1",
    GradeLevel: 1,
    Section: 1,
    DisplayName: "ม.1/1",
    Program: "M1-GEN",
  },
  m1_2: {
    GradeID: "M1-2",
    GradeLevel: 1,
    Section: 2,
    DisplayName: "ม.1/2",
    Program: "M1-GEN",
  },
  m4_1: {
    GradeID: "M4-1",
    GradeLevel: 4,
    Section: 1,
    DisplayName: "ม.4/1",
    Program: "M4-SCI",
  },
};

/**
 * Default grade level for most tests
 */
export const testGradeLevel = testGradeLevels.m1_1;

/**
 * Test Classroom Data
 * From seedDemoData() ALL_ROOMS — 22 rooms across multiple buildings
 */
export const testClassrooms = {
  room101: {
    RoomNo: "101",
    Building: "ตึกเรียน",
    BuildingShort: "1",
    Capacity: 40,
  },
  room102: {
    RoomNo: "102",
    Building: "ตึกเรียน",
    BuildingShort: "1",
    Capacity: 40,
  },
  scienceRoom: {
    RoomNo: "201",
    Building: "ตึกวิทยาศาสตร์",
    BuildingShort: "2",
    Capacity: 35,
  },
};

/**
 * Default classroom for most tests
 */
export const testClassroom = testClassrooms.room101;

/**
 * Test Timeslot Data
 * Standard Thai school schedule: 8 periods, MON-FRI
 */
export const testTimeslots = {
  monday: {
    day: "MON" as day_of_week,
    displayName: "จันทร์",
  },
  tuesday: {
    day: "TUE" as day_of_week,
    displayName: "อังคาร",
  },
  wednesday: {
    day: "WED" as day_of_week,
    displayName: "พุธ",
  },
  thursday: {
    day: "THU" as day_of_week,
    displayName: "พฤหัสบดี",
  },
  friday: {
    day: "FRI" as day_of_week,
    displayName: "ศุกร์",
  },
};

/**
 * Period numbers (1-8 for standard Thai school).
 * P2 BREAK_BOTH (10-min mini-break follows), P4 BREAK_JUNIOR (junior lunch),
 * P5 BREAK_SENIOR (senior lunch).
 */
export const testPeriods = {
  period1: 1,
  period2: 2,
  period3: 3,
  period4: 4,
  period5: 5,
  period6: 6,
  period7: 7,
  period8: 8,
};

/**
 * Admin user credentials from seed.ts
 * Password comes from ADMIN_PASSWORD env var, defaulting to "admin123" for dev/CI
 */
export const testAdmin = {
  email: "admin@school.local",
  password: process.env.ADMIN_PASSWORD || "admin123",
  name: "System Administrator",
  role: "admin" as const,
};

/**
 * Helper function to construct timeslot identifier
 */
export function getTimeslotId(
  configId: string,
  day: day_of_week,
  period: number,
): string {
  return `${configId}-${day}${period}`;
}

/**
 * Helper function to construct table config ID
 */
export function getTableConfigId(configId: string): string {
  return configId;
}

/**
 * Export all for convenience
 */
export const testData = {
  semesters: testSemesters,
  teachers: testTeachers,
  subjects: testSubjects,
  gradeLevels: testGradeLevels,
  classrooms: testClassrooms,
  timeslots: testTimeslots,
  periods: testPeriods,
  admin: testAdmin,
  // Defaults
  semester: testSemester,
  teacher: testTeacher,
  subject: testSubject,
  gradeLevel: testGradeLevel,
  classroom: testClassroom,
};
