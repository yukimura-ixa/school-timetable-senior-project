/**
 * Lock Feature - Domain Service Layer
 *
 * Contains business logic and validation rules for locked schedules.
 * Pure functions for ClassID generation and schedule grouping.
 */

import type { RawLockedSchedule } from "../../infrastructure/repositories/lock.repository";

/**
 * Type for grouped locked schedule output
 */
export type GroupedLockedSchedule = {
  SubjectCode: string;
  SubjectName: string | null;
  teachers: Array<{
    TeacherID: number;
    Firstname: string;
    Lastname: string;
    Department: string | null;
    Email: string | null;
    Role: string | null;
  }>;
  room: {
    RoomID: number;
    RoomName: string;
    Building: string | null;
    Floor: number | null;
  } | null;
  GradeIDs: string[];
  timeslots: Array<{
    TimeslotID: string;
    DayOfWeek: string;
    AcademicYear: number;
    Semester: string;
    StartTime: Date;
    EndTime: Date;
    BreakTime: string;
  }>;
  ClassIDs: number[];
};

/**
 * Group raw locked schedules by SubjectCode
 * Pure function for complex data transformation
 *
 * Groups schedules with same SubjectCode together, collecting:
 * - Unique GradeIDs
 * - Unique Timeslots
 * - All ClassIDs
 * - Teachers and room info
 */
export function groupSchedulesBySubject(
  schedules: RawLockedSchedule[],
): GroupedLockedSchedule[] {
  // Group by SubjectCode using reduce
  const grouped = schedules.reduce(
    (acc, item) => {
      const { SubjectCode, subject, room, timeslot, GradeID, ClassID } = item;

      // Initialize group if not exists
      if (!acc[SubjectCode]) {
        acc[SubjectCode] = {
          SubjectCode,
          SubjectName: subject?.SubjectName || null,
          teachers:
            subject?.teachers_responsibility.map(({ teacher }) => teacher) ||
            [],
          room,
          GradeIDs: [],
          timeslots: [],
          ClassIDs: [],
        };
      }

      // Add GradeID if not already present
      const existingGradeID = acc[SubjectCode].GradeIDs.find(
        (gradeId) => gradeId === GradeID,
      );
      if (!existingGradeID) {
        acc[SubjectCode].GradeIDs.push(GradeID);
      }

      // Add timeslot if not already present
      const existingTimeslot = acc[SubjectCode].timeslots.find(
        (ts) => ts.TimeslotID === timeslot.TimeslotID,
      );
      if (!existingTimeslot) {
        acc[SubjectCode].timeslots.push({ ...timeslot });
      }

      // Always add ClassID
      acc[SubjectCode].ClassIDs.push(ClassID);

      return acc;
    },
    {} as Record<string, GroupedLockedSchedule>,
  );

  // Convert to array
  return Object.values(grouped);
}

/**
 * Validate lock creation input
 * Business rules:
 * - Must have at least 1 timeslot
 * - Must have at least 1 grade
 * - Must have at least 1 teacher responsibility
 */
export function validateLockInput(input: {
  timeslots: string[];
  GradeIDs: string[];
  RespIDs: number[];
}): string | null {
  if (input.timeslots.length === 0) {
    return "ต้องระบุคาบเรียนอย่างน้อย 1 คาบ";
  }

  if (input.GradeIDs.length === 0) {
    return "ต้องระบุระดับชั้นอย่างน้อย 1 ระดับ";
  }

  if (input.RespIDs.length === 0) {
    return "ต้องระบุความรับผิดชอบอย่างน้อย 1 รายการ";
  }

  return null;
}

/**
 * Calculate total number of class schedules to be created
 * Cartesian product: timeslots.length × grades.length
 */
export function calculateTotalSchedules(
  timeslotsCount: number,
  gradesCount: number,
): number {
  return timeslotsCount * gradesCount;
}
