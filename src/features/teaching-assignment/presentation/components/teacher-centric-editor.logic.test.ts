import { describe, it, expect } from "vitest";
import {
  assignmentsToEditState,
  buildSyncResp,
  findEmptyRooms,
  type EditState,
} from "./teacher-centric-editor.logic";
import type { AssignmentWithRelations } from "./TeacherCentricEditor";

function makeAssignment(over: {
  GradeID: string;
  Year: number;
  SubjectCode: string;
  SubjectName: string;
  Credit: string;
}): AssignmentWithRelations {
  return {
    RespID: 1,
    TeacherID: 7,
    GradeID: over.GradeID,
    SubjectCode: over.SubjectCode,
    AcademicYear: 2567,
    Semester: "SEMESTER_1",
    SubjectName: over.SubjectName,
    Credit: over.Credit,
    subject: {},
    gradelevel: { GradeID: over.GradeID, Year: over.Year },
    teacher: {},
  } as unknown as AssignmentWithRelations;
}

describe("teacher-centric-editor.logic", () => {
  it("groups assignments into edit state keyed by GradeID", () => {
    const state = assignmentsToEditState([
      makeAssignment({
        GradeID: "101",
        Year: 1,
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์",
        Credit: "CREDIT_10",
      }),
      makeAssignment({
        GradeID: "101",
        Year: 1,
        SubjectCode: "ว21101",
        SubjectName: "วิทยาศาสตร์",
        Credit: "CREDIT_15",
      }),
      makeAssignment({
        GradeID: "201",
        Year: 2,
        SubjectCode: "อ22101",
        SubjectName: "ภาษาอังกฤษ",
        Credit: "CREDIT_10",
      }),
    ]);
    expect(Object.keys(state).sort()).toEqual(["101", "201"]);
    expect(state["101"].map((s) => s.SubjectCode)).toEqual(["ค21101", "ว21101"]);
  });

  it("builds sync payload converting the credit enum to the schema's numeric string", () => {
    const state: EditState = {
      "101": [
        { SubjectCode: "ค21101", SubjectName: "คณิตศาสตร์", Credit: "CREDIT_10" },
        { SubjectCode: "ว21101", SubjectName: "วิทยาศาสตร์", Credit: "CREDIT_15" },
      ],
    };
    expect(buildSyncResp(state)).toEqual([
      { GradeID: "101", SubjectCode: "ค21101", Credit: "1.0" },
      { GradeID: "101", SubjectCode: "ว21101", Credit: "1.5" },
    ]);
  });

  it("flags rooms that have no subjects", () => {
    const state: EditState = {
      "101": [{ SubjectCode: "ค21101", SubjectName: "คณิตศาสตร์", Credit: "CREDIT_10" }],
      "102": [],
    };
    expect(findEmptyRooms(state)).toEqual(["102"]);
  });
});
