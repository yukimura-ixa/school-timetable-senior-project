import { describe, it, expect } from "vitest";
import { groupMatrixDiffByTeacher } from "./matrix-diff";

describe("groupMatrixDiffByTeacher", () => {
  it("keeps unchanged existing cells (RespID echoed) and creates only new ones", () => {
    const existing = [
      { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" },
    ];
    const desired = [
      { RespID: 5, TeacherID: 4, GradeID: "M1-1", SubjectCode: "ค21101", Credit: "1.0" },
      { TeacherID: 4, GradeID: "M1-2", SubjectCode: "ค21101", Credit: "1.0" },
    ];
    const diffs = groupMatrixDiffByTeacher(existing, desired);
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ TeacherID: 4, toDeleteRespIds: [] });
    expect(diffs[0]!.toCreate).toEqual([{ GradeID: "M1-2", SubjectCode: "ค21101", Credit: "1.0" }]);
  });

  it("deletes an existing cell removed from desired", () => {
    const existing = [
      { RespID: 9, TeacherID: 7, GradeID: "M1-1", SubjectCode: "ว21101", Credit: "1.5" },
    ];
    const diffs = groupMatrixDiffByTeacher(existing, []);
    expect(diffs[0]).toMatchObject({ TeacherID: 7, toCreate: [], toDeleteRespIds: [9] });
  });
});
