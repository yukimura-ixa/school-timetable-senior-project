// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  TeacherCentricEditor,
  type AssignmentWithRelations,
} from "./TeacherCentricEditor";

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
    subject: {
      SubjectCode: over.SubjectCode,
      SubjectName: over.SubjectName,
      Credit: over.Credit,
    },
    gradelevel: { GradeID: over.GradeID, Year: over.Year },
    teacher: {},
  } as unknown as AssignmentWithRelations;
}

const baseProps = {
  teacherId: 7,
  teacherName: "สมชาย ใจดี",
  academicYear: 2567,
  semester: "SEMESTER_1" as const,
  onSaved: vi.fn(),
};

describe("TeacherCentricEditor", () => {
  it("renders a section for each grade level ม.1 through ม.6", () => {
    render(<TeacherCentricEditor {...baseProps} assignments={[]} />);
    for (const year of [1, 2, 3, 4, 5, 6]) {
      expect(screen.getByText(`ม.${year}`)).toBeInTheDocument();
    }
  });

  it("shows the assigned classroom and its subject under the right year", () => {
    const assignments = [
      makeAssignment({
        GradeID: "101",
        Year: 1,
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์",
        Credit: "CREDIT_10",
      }),
    ];
    render(<TeacherCentricEditor {...baseProps} assignments={assignments} />);
    expect(screen.getByText("ม.1/1")).toBeInTheDocument();
    expect(screen.getByText(/คณิตศาสตร์/)).toBeInTheDocument();
  });
});
