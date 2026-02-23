/**
 * Auto-Arrange Constraint Engine
 *
 * Pure functions to validate hard constraints and score soft constraints.
 * No database access — fully unit-testable.
 */

import type {
  AvailableTimeslot,
  ConstraintViolation,
  ExistingSchedule,
  Placement,
} from "./types";

// ─── Hard Constraints (must pass 100%) ───────────────────────────

/**
 * Check if a timeslot has a locked schedule that cannot be overwritten.
 * Locked timeslots are protected from auto-arrange.
 */
export function checkLockedSlot(
  timeslotId: string,
  existingSchedules: ExistingSchedule[],
): ConstraintViolation | null {
  const locked = existingSchedules.find(
    (s) => s.timeslotId === timeslotId && s.isLocked,
  );
  if (locked) {
    return {
      type: "LOCKED_SLOT",
      message: `ช่วงเวลานี้ถูกล็อกไว้ (วิชา ${locked.subjectCode})`,
    };
  }
  return null;
}

/**
 * Check if a timeslot is a break period.
 * Break slots cannot receive any placements.
 */
export function checkBreakConstraint(
  timeslot: AvailableTimeslot,
): ConstraintViolation | null {
  if (timeslot.isBreak) {
    return {
      type: "BREAK_SLOT",
      message: `คาบ ${timeslot.period} วัน${timeslot.day} เป็นคาบพัก`,
    };
  }
  return null;
}

/**
 * Check if the teacher already has a class at this timeslot.
 */
export function checkTeacherConflict(
  teacherId: number,
  timeslotId: string,
  existingSchedules: ExistingSchedule[],
  pendingPlacements: Placement[],
): ConstraintViolation | null {
  // Check against existing DB schedules
  const dbConflict = existingSchedules.find(
    (s) => s.timeslotId === timeslotId && s.teacherId === teacherId,
  );
  if (dbConflict) {
    return {
      type: "TEACHER_CONFLICT",
      message: `ครูมีคาบสอนวิชา ${dbConflict.subjectCode} ในช่วงเวลานี้แล้ว`,
    };
  }

  // Check against placements made during this solver run
  const pendingConflict = pendingPlacements.find(
    (p) => p.timeslotId === timeslotId,
  );
  if (pendingConflict) {
    return {
      type: "TEACHER_CONFLICT",
      message: `ครูถูกจัดสอนวิชา ${pendingConflict.subjectCode} ในช่วงเวลานี้แล้ว (รอบนี้)`,
    };
  }

  return null;
}

/**
 * Check if the grade/class already has a subject at this timeslot.
 */
export function checkGradeConflict(
  gradeId: string,
  timeslotId: string,
  existingSchedules: ExistingSchedule[],
  pendingPlacements: Placement[],
): ConstraintViolation | null {
  const dbConflict = existingSchedules.find(
    (s) => s.timeslotId === timeslotId && s.gradeId === gradeId,
  );
  if (dbConflict) {
    return {
      type: "GRADE_CONFLICT",
      message: `ชั้น ${gradeId} มีวิชา ${dbConflict.subjectCode} ในช่วงเวลานี้แล้ว`,
    };
  }

  const pendingConflict = pendingPlacements.find(
    (p) => p.timeslotId === timeslotId && p.gradeId === gradeId,
  );
  if (pendingConflict) {
    return {
      type: "GRADE_CONFLICT",
      message: `ชั้น ${gradeId} ถูกจัดวิชา ${pendingConflict.subjectCode} ในช่วงเวลานี้แล้ว (รอบนี้)`,
    };
  }

  return null;
}

/**
 * Check if a room is already occupied at this timeslot.
 */
export function checkRoomConflict(
  roomId: number,
  timeslotId: string,
  existingSchedules: ExistingSchedule[],
  pendingPlacements: Placement[],
): ConstraintViolation | null {
  const dbConflict = existingSchedules.find(
    (s) => s.timeslotId === timeslotId && s.roomId === roomId,
  );
  if (dbConflict) {
    return {
      type: "ROOM_CONFLICT",
      message: `ห้อง ${roomId} ถูกใช้สอนวิชา ${dbConflict.subjectCode} ในช่วงเวลานี้แล้ว`,
    };
  }

  const pendingConflict = pendingPlacements.find(
    (p) => p.timeslotId === timeslotId && p.roomId === roomId,
  );
  if (pendingConflict) {
    return {
      type: "ROOM_CONFLICT",
      message: `ห้อง ${roomId} ถูกจัดวิชา ${pendingConflict.subjectCode} ในช่วงเวลานี้แล้ว (รอบนี้)`,
    };
  }

  return null;
}

/**
 * Run all hard constraints against a proposed placement.
 * Returns the first violation found, or null if all constraints pass.
 */
export function checkAllHardConstraints(
  teacherId: number,
  gradeId: string,
  roomId: number,
  timeslot: AvailableTimeslot,
  existingSchedules: ExistingSchedule[],
  pendingPlacements: Placement[],
): ConstraintViolation | null {
  return (
    checkBreakConstraint(timeslot) ??
    checkLockedSlot(timeslot.timeslotId, existingSchedules) ??
    checkTeacherConflict(
      teacherId,
      timeslot.timeslotId,
      existingSchedules,
      pendingPlacements,
    ) ??
    checkGradeConflict(
      gradeId,
      timeslot.timeslotId,
      existingSchedules,
      pendingPlacements,
    ) ??
    checkRoomConflict(
      roomId,
      timeslot.timeslotId,
      existingSchedules,
      pendingPlacements,
    )
  );
}

// ─── Soft Constraints (optimize quality) ─────────────────────────

/**
 * Score a placement on soft constraint quality (higher = better).
 * Maximum score: 100. Minimum: 0.
 */
export function scoreSoftConstraints(
  timeslot: AvailableTimeslot,
  subjectCode: string,
  gradeId: string,
  pendingPlacements: Placement[],
  existingSchedules: ExistingSchedule[],
): number {
  let score = 50; // Base score

  // Prefer spreading subjects across different days
  const sameSubjectSameDay = [
    ...existingSchedules.filter(
      (s) =>
        s.subjectCode === subjectCode &&
        s.gradeId === gradeId &&
        extractDay(s.timeslotId) === timeslot.day,
    ),
    ...pendingPlacements.filter(
      (p) =>
        p.subjectCode === subjectCode &&
        p.gradeId === gradeId &&
        extractDay(p.timeslotId) === timeslot.day,
    ),
  ];
  // Penalty for same subject on same day (students don't want double math)
  score -= sameSubjectSameDay.length * 20;

  // Prefer earlier periods (less fatigue for core subjects)
  if (timeslot.period <= 3) {
    score += 10;
  } else if (timeslot.period >= 7) {
    score -= 10;
  }

  // Prefer balanced distribution across days
  const day = timeslot.day;
  const placementsOnDay = [
    ...existingSchedules.filter(
      (s) => s.gradeId === gradeId && extractDay(s.timeslotId) === day,
    ),
    ...pendingPlacements.filter(
      (p) => p.gradeId === gradeId && extractDay(p.timeslotId) === day,
    ),
  ];
  // Penalty for overloaded days
  if (placementsOnDay.length >= 6) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Extract day code from a TimeslotID (e.g., "1-2567-MON1" → "MON").
 * Uses simple regex to avoid importing the full timeslot-id utils
 * (keeping this module dependency-free for testing).
 */
function extractDay(timeslotId: string): string {
  const match = timeslotId.match(/([A-Z]{3})\d+$/);
  return match?.[1] ?? "";
}
