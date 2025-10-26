/**
 * Class Feature - Validation Service (Domain Layer)
 * 
 * Pure functions for class schedule business logic and validation.
 * No side effects, no database access - only business rules.
 */

import { teacher } from '@prisma/client';

/**
 * Validate schedule query parameters
 * 
 * @param params - Query parameters to validate
 * @returns Validation result with error messages
 */
export function validateScheduleParams(params: {
  AcademicYear?: number | null;
  Semester?: string | null;
  TeacherID?: number | null;
  GradeID?: string | null;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate AcademicYear
  if (params.AcademicYear === null || params.AcademicYear === undefined) {
    errors.push('AcademicYear is required');
  } else if (params.AcademicYear < 2500) {
    errors.push('AcademicYear must be at least 2500');
  }

  // Validate Semester
  if (!params.Semester) {
    errors.push('Semester is required');
  } else if (params.Semester !== 'SEMESTER_1' && params.Semester !== 'SEMESTER_2') {
    errors.push('Semester must be SEMESTER_1 or SEMESTER_2');
  }

  // Validate TeacherID if provided
  if (params.TeacherID !== undefined && params.TeacherID !== null && params.TeacherID < 1) {
    errors.push('TeacherID must be a positive integer');
  }

  // Validate GradeID format if provided
  if (params.GradeID) {
    const gradeIdPattern = /^\d{1,2}\/\d{4}$/;
    if (!gradeIdPattern.test(params.GradeID)) {
      errors.push('GradeID must be in format "Grade/Year" (e.g., "10/2566")');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if teacher has schedule conflict at a specific timeslot
 * 
 * @param schedules - Existing schedules
 * @param teacherId - Teacher to check
 * @param timeslotId - Timeslot to check
 * @returns True if conflict exists, false otherwise
 */
export function hasTeacherConflict(
  schedules: Array<{
    TimeslotID: string;
    teachers_responsibility: Array<{ TeacherID: number }>;
  }>,
  teacherId: number,
  timeslotId: string
): boolean {
  return schedules.some(
    (schedule) =>
      schedule.TimeslotID === timeslotId &&
      schedule.teachers_responsibility.some((resp) => resp.TeacherID === teacherId)
  );
}

/**
 * Check if room is occupied at a specific timeslot
 * 
 * @param schedules - Existing schedules
 * @param roomId - Room to check
 * @param timeslotId - Timeslot to check
 * @returns True if conflict exists, false otherwise
 */
export function hasRoomConflict(
  schedules: Array<{
    TimeslotID: string;
    RoomID: number | null;
  }>,
  roomId: number,
  timeslotId: string
): boolean {
  return schedules.some(
    (schedule) =>
      schedule.TimeslotID === timeslotId &&
      schedule.RoomID === roomId
  );
}

/**
 * Check if grade already has a class at a specific timeslot
 * 
 * @param schedules - Existing schedules
 * @param gradeId - Grade to check
 * @param timeslotId - Timeslot to check
 * @returns True if conflict exists, false otherwise
 */
export function hasGradeConflict(
  schedules: Array<{
    TimeslotID: string;
    GradeID: string;
  }>,
  gradeId: string,
  timeslotId: string
): boolean {
  return schedules.some(
    (schedule) =>
      schedule.TimeslotID === timeslotId &&
      schedule.GradeID === gradeId
  );
}

/**
 * Extract unique teachers list from schedule responsibilities
 * 
 * @param schedule - Schedule with teachers_responsibility relation
 * @returns Array of unique teachers
 */
export function extractTeachersList<
  T extends {
    teachers_responsibility: Array<{ teacher: teacher }>;
  }
>(schedule: T): teacher[] {
  // Use Map to deduplicate by TeacherID
  const teachersMap = new Map<number, teacher>();

  for (const resp of schedule.teachers_responsibility) {
    teachersMap.set(resp.teacher.TeacherID, resp.teacher);
  }

  return Array.from(teachersMap.values());
}

/**
 * Add teachers list to schedules
 * Transforms schedules by adding a computed 'teachers' field
 * 
 * @param schedules - Schedules with teachers_responsibility
 * @returns Schedules with teachers field added
 */
export function addTeachersToSchedules<
  T extends {
    teachers_responsibility: Array<{ teacher: teacher }>;
  }
>(schedules: T[]): Array<T & { teachers: teacher[] }> {
  return schedules.map((schedule) => ({
    ...schedule,
    teachers: extractTeachersList(schedule),
  }));
}

/**
 * Validate ClassID format
 * ClassID format: "TimeslotID-GradeID" or custom format
 * 
 * @param classId - ClassID to validate
 * @returns True if valid, false otherwise
 */
export function validateClassId(classId: string): boolean {
  if (!classId || classId.trim().length === 0) {
    return false;
  }

  // ClassID should not be empty and should be a valid string
  return classId.length > 0 && classId.length <= 100;
}

/**
 * Check if schedule is locked
 * 
 * @param schedule - Schedule to check
 * @returns True if locked, false otherwise
 */
export function isScheduleLocked(schedule: { IsLocked: boolean }): boolean {
  return schedule.IsLocked === true;
}

/**
 * Count schedules by timeslot
 * Groups schedules and counts them by TimeslotID
 * 
 * @param schedules - Schedules to count
 * @returns Map of TimeslotID to count
 */
export function countSchedulesByTimeslot(
  schedules: Array<{ TimeslotID: string }>
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const schedule of schedules) {
    const current = counts.get(schedule.TimeslotID) || 0;
    counts.set(schedule.TimeslotID, current + 1);
  }

  return counts;
}

/**
 * Filter schedules by locked status
 * 
 * @param schedules - Schedules to filter
 * @param locked - True to get locked schedules, false for unlocked
 * @returns Filtered schedules
 */
export function filterByLockedStatus<T extends { IsLocked: boolean }>(
  schedules: T[],
  locked: boolean
): T[] {
  return schedules.filter((schedule) => schedule.IsLocked === locked);
}

/**
 * Group schedules by grade
 * 
 * @param schedules - Schedules to group
 * @returns Map of GradeID to schedules
 */
export function groupSchedulesByGrade<T extends { GradeID: string }>(
  schedules: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const schedule of schedules) {
    const existing = groups.get(schedule.GradeID) || [];
    existing.push(schedule);
    groups.set(schedule.GradeID, existing);
  }

  return groups;
}
