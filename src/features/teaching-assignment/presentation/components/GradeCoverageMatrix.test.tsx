// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const getGradeMatrixAction = vi.fn();
const syncGradeMatrixAction = vi.fn();
const previewCarryOverAction = vi.fn();
vi.mock(
  "@/features/teaching-assignment/application/actions/teaching-assignment.actions",
  () => ({
    getGradeMatrixAction: (...a: unknown[]) => getGradeMatrixAction(...a),
    syncGradeMatrixAction: (...a: unknown[]) => syncGradeMatrixAction(...a),
    previewCarryOverAction: (...a: unknown[]) => previewCarryOverAction(...a),
  }),
);

import { GradeCoverageMatrix } from "./GradeCoverageMatrix";

beforeEach(() => {
  vi.clearAllMocks();
  getGradeMatrixAction.mockResolvedValue({
    success: true,
    data: {
      sections: [
        { GradeID: "M1-1", number: 1, programId: 10, subjectCodes: ["ค21101"] },
        { GradeID: "M1-2", number: 2, programId: 10, subjectCodes: ["ค21101"] },
      ],
      subjects: [
        {
          SubjectCode: "ค21101",
          SubjectName: "คณิต",
          Credit: "1.0",
          LearningArea: "MATH",
        },
      ],
      assignments: [
        {
          RespID: 5,
          TeacherID: 4,
          GradeID: "M1-1",
          SubjectCode: "ค21101",
          Credit: "1.0",
        },
      ],
    },
  });
  syncGradeMatrixAction.mockResolvedValue({ success: true, data: { created: 1, deleted: 0 } });
});

describe("GradeCoverageMatrix", () => {
  it("renders coverage 1/2 from fetched data", async () => {
    render(
      <GradeCoverageMatrix
        gradeYear={1}
        academicYear={2568}
        semester="SEMESTER_1"
        teachers={[
          {
            id: 4,
            prefix: "อ.",
            firstname: "วิภา",
            lastname: "",
            department: "MATH",
          },
        ]}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText(/1\s*\/\s*2/)).toBeInTheDocument(),
    );
  });

  it("brush-fills a gap and Save sends the new desired cell", async () => {
    const user = userEvent.setup();
    render(
      <GradeCoverageMatrix
        gradeYear={1}
        academicYear={2568}
        semester="SEMESTER_1"
        teachers={[
          {
            id: 4,
            prefix: "อ.",
            firstname: "วิภา",
            lastname: "",
            department: "MATH",
          },
        ]}
      />,
    );
    await screen.findByText(/1\s*\/\s*2/);
    await user.click(screen.getByRole("button", { name: /brush/i })); // activate brush (aria-label="brush")
    await user.click(screen.getByRole("button", { name: "ค21101 M1-2" })); // gap cell
    await user.click(screen.getByRole("button", { name: /บันทึก/ }));
    await waitFor(() => expect(syncGradeMatrixAction).toHaveBeenCalledTimes(1));
    const arg = syncGradeMatrixAction.mock.calls[0]![0];
    expect(arg.desired).toContainEqual(
      expect.objectContaining({
        TeacherID: 4,
        GradeID: "M1-2",
        SubjectCode: "ค21101",
      }),
    );
    expect(arg.existing).toContainEqual(
      expect.objectContaining({ RespID: 5 }),
    );
  });
});
