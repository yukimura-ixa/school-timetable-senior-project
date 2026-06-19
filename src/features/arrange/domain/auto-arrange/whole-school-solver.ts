/**
 * Whole-School Auto-Solve Orchestration
 *
 * Runs the per-teacher greedy `solve()` across every teacher in one pass to
 * generate a full school timetable. Each teacher is solved against the
 * accumulated placements of all teachers solved before them, so no two
 * teachers double-book the same room or grade slot.
 *
 * Pure domain logic — no DB access. The caller loads data and persists the
 * returned placements (see the whole-school auto-arrange server action / API).
 */

import { solve } from "./solver";
import type {
  AvailableRoom,
  AvailableTimeslot,
  ExistingSchedule,
  Placement,
  PlacementFailure,
  SolverInput,
  SolverStats,
  UnplacedSubject,
} from "./types";

/** One teacher's slice of work: who they are + what they still need placed. */
export interface TeacherSolveTask {
  teacherId: number;
  unplacedSubjects: UnplacedSubject[];
}

/** Complete input for a whole-school run — everything needed, no DB access. */
export interface WholeSchoolSolverInput {
  academicYear: number;
  semester: string;
  teachers: TeacherSolveTask[];
  /** All timeslots for this semester */
  timeslots: AvailableTimeslot[];
  /** Pre-existing schedules (locks, already-placed classes) before this run */
  existingSchedules: ExistingSchedule[];
  /** All rooms */
  rooms: AvailableRoom[];
  /** Per-grade staggered-break guard, forwarded to each per-teacher solve. */
  breakGuard?: SolverInput["breakGuard"];
}

/** Per-teacher summary of how the run went. */
export interface TeacherSolveOutcome {
  teacherId: number;
  placed: number;
  failed: number;
  totalToPlace: number;
}

/** Aggregate result across all teachers. */
export interface WholeSchoolSolverResult {
  success: boolean;
  placements: Placement[];
  failures: PlacementFailure[];
  perTeacher: TeacherSolveOutcome[];
  stats: SolverStats;
}

/** Synthetic classId for placements not yet persisted (classId is unused by
 * any conflict check, so the value only needs to be distinct/non-colliding). */
const PENDING_CLASS_ID = -1;

/** Remaining periods a teacher still needs placed across all their subjects. */
function remainingPeriods(task: TeacherSolveTask): number {
  return task.unplacedSubjects.reduce(
    (sum, s) => sum + Math.max(0, s.periodsPerWeek - s.periodsAlreadyPlaced),
    0,
  );
}

/** Convert a fresh placement into an existing-schedule row so the next
 * teacher's solve sees it for conflict checks. */
function placementToExisting(
  placement: Placement,
  teacherId: number,
): ExistingSchedule {
  return {
    classId: PENDING_CLASS_ID,
    timeslotId: placement.timeslotId,
    subjectCode: placement.subjectCode,
    gradeId: placement.gradeId,
    teacherId,
    roomId: placement.roomId,
    isLocked: false,
  };
}

export function solveWholeSchool(
  input: WholeSchoolSolverInput,
): WholeSchoolSolverResult {
  const startTime = Date.now();

  // Most-constrained-first: heaviest teaching load placed while the grid is
  // emptiest, leaving lighter loads to fill the gaps around them.
  const orderedTeachers = [...input.teachers].sort(
    (a, b) => remainingPeriods(b) - remainingPeriods(a),
  );

  const accumulatedExisting: ExistingSchedule[] = [...input.existingSchedules];
  const placements: Placement[] = [];
  const failures: PlacementFailure[] = [];
  const perTeacher: TeacherSolveOutcome[] = [];

  let totalSubjectsToPlace = 0;
  let weightedQualitySum = 0;

  for (const task of orderedTeachers) {
    const result = solve({
      teacherId: task.teacherId,
      academicYear: input.academicYear,
      semester: input.semester,
      unplacedSubjects: task.unplacedSubjects,
      timeslots: input.timeslots,
      existingSchedules: accumulatedExisting,
      rooms: input.rooms,
      breakGuard: input.breakGuard,
    });

    placements.push(...result.placements);
    failures.push(...result.failures);

    for (const placement of result.placements) {
      accumulatedExisting.push(placementToExisting(placement, task.teacherId));
    }

    totalSubjectsToPlace += result.stats.totalSubjectsToPlace;
    weightedQualitySum += result.stats.qualityScore * result.placements.length;

    perTeacher.push({
      teacherId: task.teacherId,
      placed: result.stats.successfullyPlaced,
      failed: result.stats.failed,
      totalToPlace: result.stats.totalSubjectsToPlace,
    });
  }

  const qualityScore =
    placements.length > 0 ? weightedQualitySum / placements.length : 100;

  return {
    success: failures.length === 0,
    placements,
    failures,
    perTeacher,
    stats: {
      totalSubjectsToPlace,
      successfullyPlaced: placements.length,
      failed: failures.length,
      durationMs: Date.now() - startTime,
      qualityScore,
    },
  };
}
