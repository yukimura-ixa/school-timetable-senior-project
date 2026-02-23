/**
 * Auto-Arrange Module
 *
 * Barrel export for the scheduling solver.
 */

export { solve } from "./solver";
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
