import type { UnplacedSubject } from "./types";

/**
 * Minimal shape of a teachers_responsibility (with subject + gradelevel
 * relations) needed to build a solver UnplacedSubject. Kept structural so the
 * domain stays decoupled from the Prisma client type.
 */
export interface ResponsibilityForPlacement {
  RespID: number;
  SubjectCode: string;
  GradeID: string;
  /** Periods/week assigned during the assign step (credit × 2). */
  TeachHour: number;
  subject?: { SubjectName: string | null } | null;
  gradelevel?: { Year: number; Number: number } | null;
}

/**
 * Build a solver UnplacedSubject from a responsibility.
 *
 * Required periods come from the assigned `TeachHour`, NOT the subject credit.
 * Both the per-teacher and whole-school auto-arrange paths must use this so
 * they cannot diverge again (the whole-school route previously used
 * Math.ceil(credit), undercounting multi-period subjects — c6r / task 6ri).
 */
export function toUnplacedSubject(
  resp: ResponsibilityForPlacement,
  periodsAlreadyPlaced: number,
): UnplacedSubject {
  return {
    respId: resp.RespID,
    subjectCode: resp.SubjectCode,
    subjectName: resp.subject?.SubjectName ?? "ไม่ระบุ",
    gradeId: resp.GradeID,
    gradeName: resp.gradelevel
      ? `${resp.gradelevel.Year}/${resp.gradelevel.Number}`
      : resp.GradeID,
    periodsPerWeek: resp.TeachHour,
    periodsAlreadyPlaced,
  };
}
