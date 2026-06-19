/**
 * Auto-Arrange Module
 *
 * Barrel export for the scheduling solver.
 */

export { solve } from "./solver";
export { solveWholeSchool } from "./whole-school-solver";
export { toUnplacedSubject } from "./responsibility-mapping";
export type { ResponsibilityForPlacement } from "./responsibility-mapping";
export type {
  TeacherSolveTask,
  TeacherSolveOutcome,
  WholeSchoolSolverInput,
  WholeSchoolSolverResult,
} from "./whole-school-solver";
export {
  checkAllHardConstraints,
  checkBreakConstraint,
  checkGradeConflict,
  checkLockedSlot,
  checkRoomConflict,
  checkTeacherConflict,
  scoreSoftConstraints,
} from "./constraints";
export type {
  AvailableRoom,
  AvailableTimeslot,
  ConstraintViolation,
  ConstraintViolationType,
  ExistingSchedule,
  Placement,
  PlacementFailure,
  SolverInput,
  SolverResult,
  SolverStats,
  UnplacedSubject,
} from "./types";
