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

const TWO_TEACHERS = [
  { id: 7, prefix: "อ.", firstname: "สมชาย", lastname: "", department: "MATH" },
  { id: 4, prefix: "อ.", firstname: "วิภา", lastname: "", department: "MATH" },
];

function renderMatrix(teachers = TWO_TEACHERS) {
  return render(
    <GradeCoverageMatrix
      gradeYear={1}
      academicYear={2568}
      semester="SEMESTER_1"
      teachers={teachers}
    />,
  );
}

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
  syncGradeMatrixAction.mockResolvedValue({
    success: true,
    data: { created: 1, deleted: 0 },
  });
});

async function pickTeacherInPopover(user: ReturnType<typeof userEvent.setup>, filter: string) {
  const combo = await screen.findByRole("combobox", { name: /ค้นหาครูผู้สอน/ });
  await user.click(combo);
  await user.clear(combo); // the cell's current teacher may pre-fill the input
  await user.type(combo, filter);
  // autoHighlight selects the top match on Enter — deterministic, no listbox race.
  await user.keyboard("{Enter}");
}

describe("GradeCoverageMatrix", () => {
  it("renders coverage 1/2 from fetched data", async () => {
    renderMatrix();
    await waitFor(() =>
      expect(screen.getByText(/^1\s*\/\s*2$/)).toBeInTheDocument(),
    );
  });

  it("assigns a teacher to a gap via the cell popover and saves it", async () => {
    const user = userEvent.setup();
    renderMatrix();
    await screen.findByText(/^1\s*\/\s*2$/);
    await user.click(screen.getByLabelText("ค21101 M1-2")); // gap cell → popover
    await pickTeacherInPopover(user, "วิภา"); // teacher id:4
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
    expect(arg.existing).toContainEqual(expect.objectContaining({ RespID: 5 }));
  });

  it("replacing a cell's teacher drops RespID so the old row deletes and the new creates", async () => {
    const user = userEvent.setup();
    renderMatrix();
    await screen.findByText(/^1\s*\/\s*2$/);
    await user.click(screen.getByLabelText("ค21101 M1-1")); // assigned to id:4
    await pickTeacherInPopover(user, "สมชาย"); // replace with id:7
    await user.click(screen.getByRole("button", { name: /บันทึก/ }));
    await waitFor(() => expect(syncGradeMatrixAction).toHaveBeenCalledTimes(1));
    const arg = syncGradeMatrixAction.mock.calls[0]![0];
    const m11 = (
      arg.desired as {
        GradeID: string;
        SubjectCode: string;
        TeacherID: number;
        RespID?: number;
      }[]
    ).find((e) => e.GradeID === "M1-1" && e.SubjectCode === "ค21101");
    expect(m11?.TeacherID).toBe(7);
    expect(m11).not.toHaveProperty("RespID");
    expect(arg.existing).toContainEqual(expect.objectContaining({ RespID: 5 }));
  });

  it("clears a cell via the popover ลบครู action", async () => {
    const user = userEvent.setup();
    renderMatrix();
    await screen.findByText(/^1\s*\/\s*2$/);
    await user.click(screen.getByLabelText("ค21101 M1-1")); // assigned → popover
    await user.click(await screen.findByRole("button", { name: "ลบครู" }));
    await user.click(screen.getByRole("button", { name: /บันทึก/ }));
    await waitFor(() => expect(syncGradeMatrixAction).toHaveBeenCalledTimes(1));
    const arg = syncGradeMatrixAction.mock.calls[0]![0];
    expect(arg.desired).not.toContainEqual(
      expect.objectContaining({ GradeID: "M1-1", SubjectCode: "ค21101" }),
    );
    expect(arg.existing).toContainEqual(expect.objectContaining({ RespID: 5 }));
  });
});
