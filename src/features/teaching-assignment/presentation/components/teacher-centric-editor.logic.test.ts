import { describe, it, expect } from "vitest";
import {
  assignmentsToEditState,
  buildSyncResp,
  findEmptyRooms,
  type EditState,
} from "./teacher-centric-editor.logic";
import type { AssignmentWithRelations } from "./TeacherCentricEditor";
import { computeResponsibilitiesDiff } from "@/features/assign/domain/services/assign-validation.service";

function makeAssignment(over: {
  GradeID: string;
  Year: number;
  SubjectCode: string;
  SubjectName: string;
  Credit: string;
  RespID?: number;
}): AssignmentWithRelations {
  return {
    RespID: over.RespID ?? 1,
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
    expect(state["101"]!.map((s) => s.SubjectCode)).toEqual([
      "ค21101",
      "ว21101",
    ]);
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

// Regression: 70t — RespID must round-trip so syncAssignmentsAction's diff
// keeps unchanged assignments instead of re-creating them (unique-constraint rollback).
describe("teacher-centric-editor.logic RespID round-trip", () => {
  it("preserves RespID for existing assignments through edit-state and sync payload", () => {
    const resp = buildSyncResp(
      assignmentsToEditState([
        makeAssignment({
          RespID: 5,
          GradeID: "M1-1",
          Year: 1,
          SubjectCode: "พ21101",
          SubjectName: "สุขศึกษาและพลศึกษา ม.1",
          Credit: "CREDIT_10",
        }),
      ]),
    );
    expect(resp).toHaveLength(1);
    expect(resp[0]!.RespID).toBe(5);
  });

  it("omits RespID for newly added subjects while keeping it for existing ones", () => {
    const state = assignmentsToEditState([
      makeAssignment({
        RespID: 5,
        GradeID: "M1-1",
        Year: 1,
        SubjectCode: "พ21101",
        SubjectName: "สุขศึกษาและพลศึกษา ม.1",
        Credit: "CREDIT_10",
      }),
    ]);
    state["M5-4"] = [
      {
        SubjectCode: "พ32101",
        SubjectName: "สุขศึกษาและพลศึกษา ม.5",
        Credit: "CREDIT_10",
      },
    ];
    const resp = buildSyncResp(state);
    expect(resp.find((r) => r.SubjectCode === "พ21101")!.RespID).toBe(5);
    expect(resp.find((r) => r.SubjectCode === "พ32101")!.RespID).toBeUndefined();
  });

  it("adding one subject to a teacher with existing assignments creates only the new one", () => {
    const existing = [
      makeAssignment({
        RespID: 5,
        GradeID: "M1-1",
        Year: 1,
        SubjectCode: "พ21101",
        SubjectName: "สุขศึกษาและพลศึกษา ม.1",
        Credit: "CREDIT_10",
      }),
    ];
    const state = assignmentsToEditState(existing);
    state["M5-4"] = [
      {
        SubjectCode: "พ32101",
        SubjectName: "สุขศึกษาและพลศึกษา ม.5",
        Credit: "CREDIT_10",
      },
    ];
    const { toCreate, toDelete } = computeResponsibilitiesDiff(
      existing,
      buildSyncResp(state),
    );
    expect(toCreate.map((r) => r.SubjectCode)).toEqual(["พ32101"]);
    expect(toDelete).toHaveLength(0);
  });
});
