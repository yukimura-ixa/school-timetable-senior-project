/**
 * Auto-Arrange Algorithm Types
 *
 * Pure domain types for the greedy + local search scheduler.
 * No Prisma or DB types — keeps the solver testable and portable.
 */

// ─── Solver Input ────────────────────────────────────────────────

/** A subject-grade pair that needs to be placed into a timeslot */
export interface UnplacedSubject {
  /** teachers_responsibility PK */
  respId: number;
  subjectCode: string;
  subjectName: string;
  gradeId: string;
  gradeName: string;
  /**
   * How many periods this subject needs per week.
   * Derived from credit value (e.g. 1 credit ≈ 1 period, 1.5 credits ≈ 2 periods).
   */
  periodsPerWeek: number;
  /** How many periods are already placed (from existing schedules) */
  periodsAlreadyPlaced: number;
}

/** A timeslot that could receive a placement */
export interface AvailableTimeslot {
  timeslotId: string;
  day: string; // MON, TUE, WED, THU, FRI
  period: number;
  isBreak: boolean;
}

/**
 * An existing schedule entry (already placed) — solver-only shape.
 *
 * NOTE: A separate `ExistingSchedule` interface exists in
 * `schedule-arrangement/domain/models/conflict.model.ts` for the manual
 * arrangement conflict detector. That version includes display fields
 * (subjectName, teacherName, roomName) and has optional teacherId.
 * The two are NOT interchangeable.
 */
export interface ExistingSchedule {
  classId: number;
  timeslotId: string;
  subjectCode: string;
  gradeId: string;
  teacherId: number;
  roomId: number | null;
  isLocked: boolean;
}

/** A room available for assignment */
export interface AvailableRoom {
  roomId: number;
  roomName: string;
}

/** Complete input to the solver — everything it needs, no DB access */
export interface SolverInput {
  teacherId: number;
  academicYear: number;
  semester: string;
  /** Subjects that still need placement */
  unplacedSubjects: UnplacedSubject[];
  /** All timeslots for this semester */
  timeslots: AvailableTimeslot[];
  /** All existing schedules across ALL teachers for this semester (for conflict checks) */
  existingSchedules: ExistingSchedule[];
  /** All rooms */
  rooms: AvailableRoom[];
}

// ─── Solver Output ───────────────────────────────────────────────

/** A single placement decision made by the solver */
export interface Placement {
  respId: number;
  subjectCode: string;
  gradeId: string;
  timeslotId: string;
  roomId: number;
}

/** Why a subject couldn't be placed */
export interface PlacementFailure {
  respId: number;
  subjectCode: string;
  gradeId: string;
  reason: string;
}

/** Result returned by the solver */
export interface SolverResult {
  success: boolean;
  placements: Placement[];
  failures: PlacementFailure[];
  stats: SolverStats;
}

/** Performance and quality metrics */
export interface SolverStats {
  totalSubjectsToPlace: number;
  successfullyPlaced: number;
  failed: number;
  /** Milliseconds taken */
  durationMs: number;
  /** Soft constraint score (higher = better) */
  qualityScore: number;
}

// ─── Constraint Types ────────────────────────────────────────────

export type ConstraintViolationType =
  | "TEACHER_CONFLICT"
  | "ROOM_CONFLICT"
  | "GRADE_CONFLICT"
  | "BREAK_SLOT"
  | "LOCKED_SLOT"
  | "ALREADY_OCCUPIED";

export interface ConstraintViolation {
  type: ConstraintViolationType;
  message: string;
}
