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


// Set a single cell (by gradeId+subjectCode) to a teacher. Dropping respId when the
// teacher changes makes the old saved row delete and the new one create (no "update").
export function setCellTeacher(
  cells: Cell[][],
  gradeId: string,
  subjectCode: string,
  teacherId: number,
): Cell[][] {
  return cells.map((row) =>
    row.map((c) => {
      if (c.gradeId !== gradeId || c.subjectCode !== subjectCode || c.status === "na") return c;
      if (c.teacherId === teacherId) return c;
      return { ...c, teacherId, respId: undefined, status: "assigned" as const };
    }),
  );
}

// Clear a single cell back to a gap (the previously-saved row deletes on save).
export function clearCell(cells: Cell[][], gradeId: string, subjectCode: string): Cell[][] {
  return cells.map((row) =>
    row.map((c) => {
      if (c.gradeId !== gradeId || c.subjectCode !== subjectCode) return c;
      if (c.status === "na" || c.status === "gap") return c;
      return { ...c, teacherId: null, respId: undefined, status: "gap" as const };
    }),
  );
}

// Assign one teacher to every editable (non-na) section of a subject row.
export function fillSubjectRow(cells: Cell[][], subjectCode: string, teacherId: number): Cell[][] {
  return cells.map((row) =>
    row.map((c) => {
      if (c.subjectCode !== subjectCode || c.status === "na") return c;
      if (c.teacherId === teacherId) return c;
      return { ...c, teacherId, respId: undefined, status: "assigned" as const };
    }),
  );
}

// Count cells whose teacher differs from the baseline — the unsaved-change tally.
export function countChanges(original: Cell[][], current: Cell[][]): number {
  let n = 0;
  for (let r = 0; r < current.length; r++) {
    const row = current[r]!;
    for (let c = 0; c < row.length; c++) {
      const before = original[r]?.[c];
      if (!before) continue;
      if (before.teacherId !== row[c]!.teacherId) n++;
    }
  }
  return n;
}


// Term-wide overload: a teacher's 22h cap spans every grade. Their base load is
// all term hours OUTSIDE the grade being edited; the grade under edit contributes
// its LIVE matrix hours instead (so unsaved changes are reflected immediately).
export function computeOverloadedTeachers(
  termRows: { TeacherID: number; GradeID: string; TeachHour: number }[],
  currentGradeIds: string[],
  liveHoursByTeacher: Record<number, number>,
  cap = 22,
): { teacherId: number; hours: number }[] {
  const current = new Set(currentGradeIds);
  const base = new Map<number, number>();
  for (const r of termRows) {
    if (current.has(r.GradeID)) continue;
    base.set(r.TeacherID, (base.get(r.TeacherID) ?? 0) + r.TeachHour);
  }
  const teacherIds = new Set<number>([
    ...base.keys(),
    ...Object.keys(liveHoursByTeacher).map(Number),
  ]);
  const out: { teacherId: number; hours: number }[] = [];
  for (const t of teacherIds) {
    const hours = (base.get(t) ?? 0) + (liveHoursByTeacher[t] ?? 0);
    if (hours > cap) out.push({ teacherId: t, hours });
  }
  return out.sort((a, b) => b.hours - a.hours);
}
