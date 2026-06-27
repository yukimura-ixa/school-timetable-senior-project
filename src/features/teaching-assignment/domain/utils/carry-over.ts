import { mapSemesterCode } from "./semester-code-map";

export interface PrevAssignment { GradeID: string; SubjectCode: string; TeacherID: number; }
export interface CarryOverSuggestion { GradeID: string; SubjectCode: string; TeacherID: number; }
export interface CarryOverException extends CarryOverSuggestion { reason: "no-mapping" | "not-in-program"; }

export function computeCarryOver(
  prev: PrevAssignment[],
  sectionSubjects: Record<string, string[]>,
): { mapped: CarryOverSuggestion[]; exceptions: CarryOverException[] } {
  const mapped: CarryOverSuggestion[] = [];
  const exceptions: CarryOverException[] = [];

  for (const p of prev) {
    const target = mapSemesterCode(p.SubjectCode);
    if (target === null) {
      exceptions.push({ ...p, reason: "no-mapping" });
      continue;
    }
    if (!(sectionSubjects[p.GradeID] ?? []).includes(target)) {
      exceptions.push({ ...p, reason: "not-in-program" });
      continue;
    }
    mapped.push({ GradeID: p.GradeID, SubjectCode: target, TeacherID: p.TeacherID });
  }
  return { mapped, exceptions };
}
