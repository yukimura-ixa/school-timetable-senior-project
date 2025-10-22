/**
 * Domain Service: Conflict Detection
 * 
 * Pure functions for detecting conflicts in schedule arrangements.
 * These functions have NO side effects and are easily testable.
 * 
 * @module conflict-detector.service
 */

import {
  ConflictResult,
  ConflictType,
  ExistingSchedule,
  ScheduleArrangementInput,
  TeacherResponsibility,
} from '../models/conflict.model';

/**
 * Check if a teacher has a conflict at the proposed timeslot
 * 
 * @param input - The proposed schedule arrangement
 * @param existingSchedules - All existing schedules for this semester
 * @returns Conflict result
 * 
 * @example
 * ```ts
 * const result = checkTeacherConflict(
 *   { teacherId: 1, timeslotId: 'T1', ... },
 *   existingSchedules
 * );
 * if (result.hasConflict) {
 *   console.log(result.message); // "Teacher John Doe is already teaching Math 101 at this time"
 * }
 * ```
 */
export function checkTeacherConflict(
  input: ScheduleArrangementInput,
  existingSchedules: ExistingSchedule[]
): ConflictResult {
  // If no teacher specified, no teacher conflict
  if (!input.teacherId) {
    return {
      hasConflict: false,
      conflictType: ConflictType.NONE,
      message: 'No teacher assigned',
    };
  }

  // Find any schedule where the same teacher is scheduled at the same time
  // (excluding the current classId if we're updating an existing schedule)
  const conflict = existingSchedules.find(
    (schedule) =>
      schedule.teacherId === input.teacherId &&
      schedule.timeslotId === input.timeslotId &&
      schedule.classId !== input.classId // Allow updating same schedule
  );

  if (conflict) {
    return {
      hasConflict: true,
      conflictType: ConflictType.TEACHER_CONFLICT,
      message: `Teacher ${conflict.teacherName || `ID ${input.teacherId}`} is already teaching ${conflict.subjectName} (${conflict.subjectCode}) for class ${conflict.gradeId} at this time`,
      conflictingSchedule: {
        classId: conflict.classId,
        subjectCode: conflict.subjectCode,
        subjectName: conflict.subjectName,
        gradeId: conflict.gradeId,
        teacherId: conflict.teacherId,
        teacherName: conflict.teacherName,
        timeslotId: conflict.timeslotId,
      },
    };
  }

  return {
    hasConflict: false,
    conflictType: ConflictType.NONE,
    message: 'No teacher conflict',
  };
}

/**
 * Check if a class (grade) has a conflict at the proposed timeslot
 * 
 * @param input - The proposed schedule arrangement
 * @param existingSchedules - All existing schedules for this semester
 * @returns Conflict result
 * 
 * @example
 * ```ts
 * const result = checkClassConflict(
 *   { gradeId: 'M1-1', timeslotId: 'T1', ... },
 *   existingSchedules
 * );
 * ```
 */
export function checkClassConflict(
  input: ScheduleArrangementInput,
  existingSchedules: ExistingSchedule[]
): ConflictResult {
  // Find any schedule where the same class is scheduled at the same time
  const conflict = existingSchedules.find(
    (schedule) =>
      schedule.gradeId === input.gradeId &&
      schedule.timeslotId === input.timeslotId &&
      schedule.classId !== input.classId
  );

  if (conflict) {
    return {
      hasConflict: true,
      conflictType: ConflictType.CLASS_CONFLICT,
      message: `Class ${input.gradeId} already has ${conflict.subjectName} (${conflict.subjectCode}) scheduled at this time`,
      conflictingSchedule: {
        classId: conflict.classId,
        subjectCode: conflict.subjectCode,
        subjectName: conflict.subjectName,
        gradeId: conflict.gradeId,
        timeslotId: conflict.timeslotId,
      },
    };
  }

  return {
    hasConflict: false,
    conflictType: ConflictType.NONE,
    message: 'No class conflict',
  };
}

/**
 * Check if a room has a conflict at the proposed timeslot
 * 
 * @param input - The proposed schedule arrangement
 * @param existingSchedules - All existing schedules for this semester
 * @returns Conflict result
 * 
 * @example
 * ```ts
 * const result = checkRoomConflict(
 *   { roomId: 101, timeslotId: 'T1', ... },
 *   existingSchedules
 * );
 * ```
 */
export function checkRoomConflict(
  input: ScheduleArrangementInput,
  existingSchedules: ExistingSchedule[]
): ConflictResult {
  // If no room specified, no room conflict
  if (!input.roomId) {
    return {
      hasConflict: false,
      conflictType: ConflictType.NONE,
      message: 'No room assigned',
    };
  }

  // Find any schedule where the same room is used at the same time
  const conflict = existingSchedules.find(
    (schedule) =>
      schedule.roomId === input.roomId &&
      schedule.timeslotId === input.timeslotId &&
      schedule.classId !== input.classId
  );

  if (conflict) {
    return {
      hasConflict: true,
      conflictType: ConflictType.ROOM_CONFLICT,
      message: `Room ${conflict.roomName || `ID ${input.roomId}`} is already being used by class ${conflict.gradeId} for ${conflict.subjectName} at this time`,
      conflictingSchedule: {
        classId: conflict.classId,
        subjectCode: conflict.subjectCode,
        subjectName: conflict.subjectName,
        gradeId: conflict.gradeId,
        roomId: conflict.roomId,
        roomName: conflict.roomName,
        timeslotId: conflict.timeslotId,
      },
    };
  }

  return {
    hasConflict: false,
    conflictType: ConflictType.NONE,
    message: 'No room conflict',
  };
}

/**
 * Check if the timeslot is locked
 * Locked timeslots cannot be modified (e.g., school assemblies)
 * 
 * @param input - The proposed schedule arrangement
 * @param existingSchedules - All existing schedules for this semester
 * @returns Conflict result
 * 
 * @example
 * ```ts
 * const result = checkLockedTimeslot(
 *   { gradeId: 'M1-1', timeslotId: 'T1', ... },
 *   existingSchedules
 * );
 * ```
 */
export function checkLockedTimeslot(
  input: ScheduleArrangementInput,
  existingSchedules: ExistingSchedule[]
): ConflictResult {
  // Find if there's a locked schedule for this grade at this timeslot
  const lockedSchedule = existingSchedules.find(
    (schedule) =>
      schedule.gradeId === input.gradeId &&
      schedule.timeslotId === input.timeslotId &&
      schedule.isLocked &&
      schedule.classId !== input.classId // Allow updating the same locked schedule
  );

  if (lockedSchedule) {
    return {
      hasConflict: true,
      conflictType: ConflictType.LOCKED_TIMESLOT,
      message: `This timeslot is locked for class ${input.gradeId} (${lockedSchedule.subjectName})`,
      conflictingSchedule: {
        classId: lockedSchedule.classId,
        subjectCode: lockedSchedule.subjectCode,
        subjectName: lockedSchedule.subjectName,
        gradeId: lockedSchedule.gradeId,
        timeslotId: lockedSchedule.timeslotId,
      },
    };
  }

  return {
    hasConflict: false,
    conflictType: ConflictType.NONE,
    message: 'Timeslot is not locked',
  };
}

/**
 * Check if the teacher is assigned to teach this subject for this grade
 * 
 * @param input - The proposed schedule arrangement
 * @param responsibilities - Teacher responsibilities for this semester
 * @returns Conflict result
 * 
 * @example
 * ```ts
 * const result = checkTeacherAssignment(
 *   { teacherId: 1, subjectCode: 'MATH101', gradeId: 'M1-1', ... },
 *   responsibilities
 * );
 * ```
 */
export function checkTeacherAssignment(
  input: ScheduleArrangementInput,
  responsibilities: TeacherResponsibility[]
): ConflictResult {
  // If no teacher specified, skip this check
  if (!input.teacherId) {
    return {
      hasConflict: false,
      conflictType: ConflictType.NONE,
      message: 'No teacher assigned',
    };
  }

  // Find if this teacher is assigned to teach this subject for this grade
  const assignment = responsibilities.find(
    (resp) =>
      resp.teacherId === input.teacherId &&
      resp.subjectCode === input.subjectCode &&
      resp.gradeId === input.gradeId &&
      resp.academicYear === input.academicYear &&
      resp.semester === input.semester
  );

  if (!assignment) {
    return {
      hasConflict: true,
      conflictType: ConflictType.TEACHER_NOT_ASSIGNED,
      message: `Teacher ID ${input.teacherId} is not assigned to teach ${input.subjectCode} for class ${input.gradeId}`,
    };
  }

  return {
    hasConflict: false,
    conflictType: ConflictType.NONE,
    message: 'Teacher is properly assigned',
  };
}

/**
 * Check all conflicts for a schedule arrangement
 * 
 * This is the main entry point for conflict checking.
 * Returns the FIRST conflict found, in priority order:
 * 1. Locked timeslot (highest priority)
 * 2. Teacher not assigned
 * 3. Class conflict
 * 4. Teacher conflict
 * 5. Room conflict (lowest priority)
 * 
 * @param input - The proposed schedule arrangement
 * @param existingSchedules - All existing schedules for this semester
 * @param responsibilities - Teacher responsibilities for this semester
 * @returns Conflict result (first conflict found, or NONE if no conflicts)
 * 
 * @example
 * ```ts
 * const result = checkAllConflicts(
 *   proposedSchedule,
 *   existingSchedules,
 *   responsibilities
 * );
 * 
 * if (result.hasConflict) {
 *   // Show error to user
 *   alert(result.message);
 * } else {
 *   // Save schedule
 *   await saveSchedule(proposedSchedule);
 * }
 * ```
 */
export function checkAllConflicts(
  input: ScheduleArrangementInput,
  existingSchedules: ExistingSchedule[],
  responsibilities: TeacherResponsibility[]
): ConflictResult {
  // Check in priority order - return first conflict found

  // 1. Locked timeslot (highest priority - can't modify)
  const lockedResult = checkLockedTimeslot(input, existingSchedules);
  if (lockedResult.hasConflict) {
    return lockedResult;
  }

  // 2. Teacher assignment (must be assigned before scheduling)
  const assignmentResult = checkTeacherAssignment(input, responsibilities);
  if (assignmentResult.hasConflict) {
    return assignmentResult;
  }

  // 3. Class conflict (class can't have two subjects at once)
  const classResult = checkClassConflict(input, existingSchedules);
  if (classResult.hasConflict) {
    return classResult;
  }

  // 4. Teacher conflict (teacher can't be in two places at once)
  const teacherResult = checkTeacherConflict(input, existingSchedules);
  if (teacherResult.hasConflict) {
    return teacherResult;
  }

  // 5. Room conflict (room can't have two classes at once)
  const roomResult = checkRoomConflict(input, existingSchedules);
  if (roomResult.hasConflict) {
    return roomResult;
  }

  // No conflicts found!
  return {
    hasConflict: false,
    conflictType: ConflictType.NONE,
    message: 'No conflicts detected - schedule can be arranged',
  };
}
