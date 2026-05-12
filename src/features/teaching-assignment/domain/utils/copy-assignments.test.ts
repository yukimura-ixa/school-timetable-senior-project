import { describe, it, expect } from "vitest";
import { mapAssignmentsForTarget } from "./copy-assignments";

describe("mapAssignmentsForTarget", () => {
  it("maps source rows to target year+semester preserving GradeID/SubjectCode/TeacherID/TeachHour", () => {
    const sourceRows = [
      {
        RespID: 10,
        GradeID: "M1/1",
        SubjectCode: "TH101",
        TeacherID: 5,
        TeachHour: 3,
        AcademicYear: 2567,
        Semester: "SEMESTER_1" as const,
      },
      {
        RespID: 11,
        GradeID: "M2/1",
        SubjectCode: "MA201",
        TeacherID: 7,
        TeachHour: 4,
        AcademicYear: 2567,
        Semester: "SEMESTER_1" as const,
      },
    ];

    const result = mapAssignmentsForTarget(sourceRows, {
      academicYear: 2568,
      semester: "SEMESTER_1",
    });

    expect(result).toEqual([
      {
        GradeID: "M1/1",
        SubjectCode: "TH101",
        TeacherID: 5,
        TeachHour: 3,
        AcademicYear: 2568,
        Semester: "SEMESTER_1",
      },
      {
        GradeID: "M2/1",
        SubjectCode: "MA201",
        TeacherID: 7,
        TeachHour: 4,
        AcademicYear: 2568,
        Semester: "SEMESTER_1",
      },
    ]);
  });

  it("drops RespID from source to let DB generate new ones", () => {
    const result = mapAssignmentsForTarget(
      [
        {
          RespID: 99,
          GradeID: "M1/1",
          SubjectCode: "TH101",
          TeacherID: 5,
          TeachHour: 3,
          AcademicYear: 2567,
          Semester: "SEMESTER_1",
        },
      ],
      { academicYear: 2568, semester: "SEMESTER_2" },
    );

    expect(result[0]).not.toHaveProperty("RespID");
  });

  it("returns empty array for empty source", () => {
    const result = mapAssignmentsForTarget([], {
      academicYear: 2568,
      semester: "SEMESTER_1",
    });
    expect(result).toEqual([]);
  });

  it("overrides Semester on every row regardless of source semester", () => {
    const result = mapAssignmentsForTarget(
      [
        {
          RespID: 1,
          GradeID: "M1/1",
          SubjectCode: "TH101",
          TeacherID: 5,
          TeachHour: 3,
          AcademicYear: 2567,
          Semester: "SEMESTER_2",
        },
      ],
      { academicYear: 2567, semester: "SEMESTER_1" },
    );

    expect(result[0]?.Semester).toBe("SEMESTER_1");
    expect(result[0]?.AcademicYear).toBe(2567);
  });
});
