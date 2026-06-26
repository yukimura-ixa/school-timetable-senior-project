// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import {
  TeacherCentricEditor,
  type AssignmentWithRelations,
} from "./TeacherCentricEditor";
import { syncAssignmentsAction } from "@/features/assign/application/actions/assign.actions";

vi.mock("@/features/assign/application/actions/assign.actions", () => ({
  syncAssignmentsAction: vi.fn(),
}));
vi.mock("@/features/subject/application/actions/subject.actions", () => ({
  getSubjectsByGradeAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));
vi.mock("@/hooks/use-grade-levels", () => ({
  useGradeLevels: () => ({ data: [], isLoading: false }),
}));

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

beforeEach(() => {
  vi.mocked(syncAssignmentsAction).mockReset();
  vi.mocked(syncAssignmentsAction).mockResolvedValue({
    status: "success",
  } as never);
});

describe("TeacherCentricEditor", () => {
  it("renders a section for each grade level ม.1 through ม.6", () => {
    render(<TeacherCentricEditor {...baseProps} assignments={[]} />);
    for (const year of [1, 2, 3, 4, 5, 6]) {
      expect(screen.getByText(`ม.${year}`)).toBeInTheDocument();
    }
  });

  it("groups rooms by gradelevel year for canonical M-format GradeIDs", () => {
    const assignments = [
      makeAssignment({
        GradeID: "M1-1",
        Year: 1,
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์",
        Credit: "CREDIT_10",
      }),
    ];
    render(<TeacherCentricEditor {...baseProps} assignments={assignments} />);
    expect(screen.getByText("ม.1/1")).toBeInTheDocument();
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

  it("saves with the credit converted to the schema's numeric format", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const assignments = [
      makeAssignment({
        GradeID: "101",
        Year: 1,
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์",
        Credit: "CREDIT_10",
      }),
    ];
    render(
      <TeacherCentricEditor
        {...baseProps}
        assignments={assignments}
        onSaved={onSaved}
      />,
    );
    await user.click(screen.getByRole("button", { name: /บันทึก/ }));
    await waitFor(() =>
      expect(syncAssignmentsAction).toHaveBeenCalledTimes(1),
    );
    expect(syncAssignmentsAction).toHaveBeenCalledWith({
      TeacherID: 7,
      AcademicYear: 2567,
      Semester: "SEMESTER_1",
      Resp: [{ GradeID: "101", SubjectCode: "ค21101", Credit: "1.0" }],
    });
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });
});
