/**
 * E2E Test Data Fixtures
 *
 * This file provides test data constants that match the seeded database.
 * All data comes from prisma/seed.ts to ensure consistency.
 *
 * Usage:
 *   import { testSemester, testTeacher, testSubject } from './fixtures/seed-data.fixture';
 */

import { semester, day_of_week } from "@/prisma/generated/client";

/**
 * Test Semester Data
 * From seed.ts - Multiple semesters created for testing
 */
export const testSemesters = {
  // Semester 1/2567 (first semester, academic year 2024)
  semester1_2567: {
    SemesterAndyear: "1-2567" as const,
    Semester: 1 as semester,
    Year: 2567,
    DisplayName: "ภาคเรียนที่ 1/2567",
    IsActive: true,
  },
  // Semester 2/2567 (second semester, academic year 2024)
  semester2_2567: {
    SemesterAndyear: "2-2567" as const,
    Semester: 2 as semester,
    Year: 2567,
    DisplayName: "ภาคเรียนที่ 2/2567",
    IsActive: true,
  },
  // Semester 1/2568 (first semester, academic year 2025)
  semester1_2568: {
    SemesterAndyear: "1-2568" as const,
    Semester: 1 as semester,
    Year: 2568,
    DisplayName: "ภาคเรียนที่ 1/2568",
    IsActive: false, // Not active yet
  },
};

/**
 * Default semester for most tests
 */
export const testSemester = testSemesters.semester1_2567;

/**
 * Test Teacher Data
 * From seed.ts - Real teachers created during seeding
 */
export const testTeachers = {
  // Math teacher - likely to have multiple sections
  mathTeacher: {
    TeacherID: 1, // First teacher in seed
    Prefix: "นาย",
    Firstname: "สมชาย",
    Lastname: "สมบูรณ์",
    Department: "คณิตศาสตร์",
    SubjectGroup: "คณิตศาสตร์",
  },
  // Science teacher
  scienceTeacher: {
    TeacherID: 11, // Typically 11th teacher (after ~10 math teachers)
    Prefix: "นางสาว",
    Firstname: "สุดารัตน์",
    Lastname: "เลิศล้ำ",
    Department: "วิทยาศาสตร์",
    SubjectGroup: "วิทยาศาสตร์",
  },
  // English teacher
  englishTeacher: {
    TeacherID: 31, // Typically 31st teacher (after math, science, thai depts)
    Prefix: "นางสาว",
    Firstname: "กนกวรรณ",
    Lastname: "วรวัฒน์",
    Department: "ภาษาอังกฤษ",
    SubjectGroup: "ภาษาต่างประเทศ",
  },
};

/**
 * Default teacher for most tests
 */
export const testTeacher = testTeachers.mathTeacher;

/**
 * Test Subject Data
 * From seed.ts - Thai curriculum subjects
 */
export const testSubjects = {
  // Core Math subject
  math101: {
    SubjectCode: "TH21101",
    SubjectName: "คณิตศาสตร์ 1",
    SubjectGroup: "คณิตศาสตร์",
    Credit: 1.0,
    IsRequired: true,
  },
  // Core Science subject
  science101: {
    SubjectCode: "TH22101",
    SubjectName: "วิทยาศาสตร์ 1",
    SubjectGroup: "วิทยาศาสตร์",
    Credit: 1.5,
    IsRequired: true,
  },
  // Core Thai language
  thai101: {
    SubjectCode: "TH20101",
    SubjectName: "ภาษาไทย 1",
    SubjectGroup: "ภาษาไทย",
    Credit: 1.5,
    IsRequired: true,
  },
  // English language
  english101: {
    SubjectCode: "TH23101",
    SubjectName: "ภาษาอังกฤษ 1",
    SubjectGroup: "ภาษาต่างประเทศ",
    Credit: 1.0,
    IsRequired: true,
  },
  // Elective subject (lower credit)
  artElective: {
    SubjectCode: "TH26201",
    SubjectName: "ทัศนศิลป์",
    SubjectGroup: "ศิลปะ",
    Credit: 0.5,
    IsRequired: false,
  },
};

/**
 * Default subject for most tests
 */
export const testSubject = testSubjects.math101;

/**
 * Test Grade Level Data
 * From seed.ts - M.1 to M.6 with sections
 */
export const testGradeLevels = {
  // M.1/1 (Grade 7, Section 1)
  m1_1: {
    GradeID: 1,
    GradeLevel: 1, // M.1
    Section: 1,
    DisplayName: "ม.1/1",
    Program: "GENERAL-M1-2567",
  },
  // M.1/2 (Grade 7, Section 2)
  m1_2: {
    GradeID: 2,
    GradeLevel: 1, // M.1
    Section: 2,
    DisplayName: "ม.1/2",
    Program: "GENERAL-M1-2567",
  },
  // M.4/1 (Grade 10, Section 1) - Science-Math track
  m4_1: {
    GradeID: 10,
    GradeLevel: 4, // M.4
    Section: 1,
    DisplayName: "ม.4/1",
    Program: "SCI_MATH-M4-2567",
  },
};

/**
 * Default grade level for most tests
 */
export const testGradeLevel = testGradeLevels.m1_1;

/**
 * Test Classroom Data
 * From seed.ts - Buildings and room numbers
 */
export const testClassrooms = {
  // Building 1, Room 101
  room101: {
    RoomID: 1,
    RoomNo: "101",
    Building: "ตึกเรียน",
    BuildingShort: "1",
    Capacity: 40,
  },
  // Building 1, Room 102
  room102: {
    RoomID: 2,
    RoomNo: "102",
    Building: "ตึกเรียน",
    BuildingShort: "1",
    Capacity: 40,
  },
  // Science Building, Room 201
  scienceRoom: {
    RoomID: 41,
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
 * Period numbers (1-8 for standard Thai school)
 */
export const testPeriods = {
  period1: 1,
  period2: 2,
  period3: 3,
  period4: 4, // Often lunch break
  period5: 5,
  period6: 6,
  period7: 7,
  period8: 8,
};

/**
 * Admin user credentials from seed.ts
 */
export const testAdmin = {
  email: "admin@school.local",
  password: "admin123",
  name: "System Administrator",
  role: "admin" as const,
};

/**
 * Helper function to construct timeslot identifier
 */
export function getTimeslotId(
  semester: string,
  gradeId: number,
  day: day_of_week,
  period: number,
): string {
  return `${semester}-${gradeId}-${day}-${period}`;
}

/**
 * Helper function to construct table config ID
 */
export function getTableConfigId(semester: string, gradeId: number): string {
  return `${semester}-${gradeId}`;
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
