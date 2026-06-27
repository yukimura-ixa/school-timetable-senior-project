import { describe, it, expect } from "vitest";
import { buildCells, applySuggestions, cellsToDesired } from "./grade-matrix.logic";

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
