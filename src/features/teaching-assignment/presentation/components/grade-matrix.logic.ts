import type { CarryOverSuggestion } from "../../domain/utils/carry-over";
import type { MatrixAssignment } from "../../domain/utils/matrix-diff";

export type CellStatus = "assigned" | "gap" | "na" | "suggested";
export interface Cell { gradeId: string; subjectCode: string; teacherId: number | null; respId?: number; status: CellStatus; }
export interface GradeMatrixData {
  sections: { GradeID: string; number: number; programId: number | null; subjectCodes: string[] }[];
  subjects: { SubjectCode: string; SubjectName: string; Credit: string; LearningArea: string | null }[];
  assignments: { RespID: number; TeacherID: number; GradeID: string; SubjectCode: string; Credit: string }[];
}
export type { MatrixAssignment };

export function buildCells(m: GradeMatrixData): Cell[][] {
  const byKey = new Map(m.assignments.map((a) => [`${a.GradeID}|${a.SubjectCode}`, a]));
  return m.subjects.map((subj) =>
    m.sections.map((sec): Cell => {
      const inProgram = sec.subjectCodes.includes(subj.SubjectCode);
      if (!inProgram) return { gradeId: sec.GradeID, subjectCode: subj.SubjectCode, teacherId: null, status: "na" };
      const a = byKey.get(`${sec.GradeID}|${subj.SubjectCode}`);
      return a
        ? { gradeId: sec.GradeID, subjectCode: subj.SubjectCode, teacherId: a.TeacherID, respId: a.RespID, status: "assigned" }
        : { gradeId: sec.GradeID, subjectCode: subj.SubjectCode, teacherId: null, status: "gap" };
    }),
  );
}

export function applySuggestions(cells: Cell[][], mapped: CarryOverSuggestion[]): Cell[][] {
  const sug = new Map(mapped.map((s) => [`${s.GradeID}|${s.SubjectCode}`, s.TeacherID]));
  return cells.map((row) =>
    row.map((c) => {
      if (c.status !== "gap") return c;
      const t = sug.get(`${c.gradeId}|${c.subjectCode}`);
      return t === undefined ? c : { ...c, teacherId: t, status: "suggested" };
    }),
  );
}

export function cellsToDesired(cells: Cell[][], credit: Record<string, string>): MatrixAssignment[] {
  const out: MatrixAssignment[] = [];
  for (const row of cells) {
    for (const c of row) {
      if ((c.status === "assigned" || c.status === "suggested") && c.teacherId !== null) {
        out.push({
          ...(c.respId !== undefined ? { RespID: c.respId } : {}),
          TeacherID: c.teacherId,
          GradeID: c.gradeId,
          SubjectCode: c.subjectCode,
          Credit: credit[c.subjectCode] ?? "1.0",
        });
      }
    }
  }
  return out;
}
