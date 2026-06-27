import { describe, it, expect } from "vitest";
import {
  buildCells,
  applySuggestions,
  cellsToDesired,
  setCellTeacher,
  clearCell,
  fillSubjectRow,
  countChanges,
} from "./grade-matrix.logic";

const matrix = {
  sections: [
    { GradeID: "M1-1", number: 1, programId: 10, subjectCodes: ["ค21101"] },
    { GradeID: "M1-2", number: 2, programId: 10, subjectCodes: ["ค21101"] },
  ],
  subjects: [{ SubjectCode: "ค21101", SubjectName: "คณิต", Credit: "1.0", LearningArea: "MATH" }],
  assignments: [{ RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" }],
};

describe("grade-matrix.logic", () => {
  it("builds a cell grid: assigned where there's an assignment, gap otherwise", () => {
    const cells = buildCells(matrix);
    expect(cells[0]![0]).toMatchObject({ gradeId: "M1-1", teacherId: 4, respId: 5, status: "assigned" });
    expect(cells[0]![1]).toMatchObject({ gradeId: "M1-2", teacherId: null, status: "gap" });
  });

  it("applies suggestions only into gaps, marked 'suggested'", () => {
    const cells = applySuggestions(buildCells(matrix), [{ GradeID: "M1-2", SubjectCode: "ค21101", TeacherID: 9 }]);
    expect(cells[0]![1]).toMatchObject({ teacherId: 9, status: "suggested" });
    expect(cells[0]![0]).toMatchObject({ teacherId: 4, status: "assigned" }); // unchanged
  });

  it("serializes assigned + suggested cells to desired assignments", () => {
    const cells = applySuggestions(buildCells(matrix), [{ GradeID: "M1-2", SubjectCode: "ค21101", TeacherID: 9 }]);
    const desired = cellsToDesired(cells, { "ค21101": "1.0" });
    expect(desired).toEqual([
      { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" },
      { TeacherID: 9, GradeID: "M1-2", SubjectCode: "ค21101", Credit: "1.0" },
    ]);
  });
});

describe("grade-matrix cell mutations", () => {
  it("setCellTeacher changes the teacher and drops respId (so old row deletes, new creates)", () => {
    const cells = setCellTeacher(buildCells(matrix), "M1-1", "ค21101", 9);
    expect(cells[0]![0]).toMatchObject({ teacherId: 9, status: "assigned" });
    expect(cells[0]![0]!.respId).toBeUndefined();
    expect(cells[0]![1]).toMatchObject({ teacherId: null, status: "gap" }); // other section untouched
  });

  it("setCellTeacher to the same teacher keeps the existing respId", () => {
    const cells = setCellTeacher(buildCells(matrix), "M1-1", "ค21101", 4);
    expect(cells[0]![0]).toMatchObject({ teacherId: 4, respId: 5, status: "assigned" });
  });

  it("clearCell resets an assigned cell to a gap and drops respId", () => {
    const cells = clearCell(buildCells(matrix), "M1-1", "ค21101");
    expect(cells[0]![0]).toMatchObject({ teacherId: null, status: "gap" });
    expect(cells[0]![0]!.respId).toBeUndefined();
  });

  it("fillSubjectRow assigns one teacher across every editable section of the row", () => {
    const cells = fillSubjectRow(buildCells(matrix), "ค21101", 7);
    expect(cells[0]!.map((c) => c.teacherId)).toEqual([7, 7]);
    expect(cells[0]!.every((c) => c.status === "assigned")).toBe(true);
  });

  it("countChanges tallies cells whose teacher differs from the baseline", () => {
    const base = buildCells(matrix);
    expect(countChanges(base, base)).toBe(0);
    expect(countChanges(base, setCellTeacher(base, "M1-1", "ค21101", 9))).toBe(1);
    expect(countChanges(base, fillSubjectRow(base, "ค21101", 7))).toBe(2);
  });
});
