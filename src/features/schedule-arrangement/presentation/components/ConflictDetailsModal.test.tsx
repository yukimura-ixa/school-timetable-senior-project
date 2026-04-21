// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ConflictDetailsModal from "./ConflictDetailsModal";
import { ConflictType } from "../../domain/models/conflict.model";
import type {
  ConflictResult,
  ScheduleArrangementInput,
} from "../../domain/models/conflict.model";

const conflict: ConflictResult = {
  hasConflict: true,
  conflictType: ConflictType.TEACHER_CONFLICT,
  message: "ครูซ้ำ",
  conflictingSchedule: {
    classId: 42,
    subjectCode: "ENG101",
    subjectName: "English",
    roomName: "R-10",
    gradeId: "M1-2",
    teacherName: "ครู A",
    timeslotId: "1-2567-MON-1",
  },
};

const attempt: ScheduleArrangementInput = {
  timeslotId: "1-2567-MON-1",
  subjectCode: "MATH101",
  gradeId: "M1-1",
  teacherId: 1,
  roomId: 10,
  academicYear: 2567,
  semester: "SEMESTER_1",
};

describe("ConflictDetailsModal", () => {
  it("renders conflict context from conflictingSchedule", () => {
    render(
      <ConflictDetailsModal
        open
        conflict={conflict}
        attempt={attempt}
        suggestions={[]}
        isLoadingSuggestions={false}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId("conflict-modal")).toBeDefined();
    expect(screen.getByText(/ENG101/)).toBeDefined();
    expect(screen.getByText(/ครู A/)).toBeDefined();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(
      <ConflictDetailsModal
        open
        conflict={conflict}
        attempt={attempt}
        suggestions={[]}
        isLoadingSuggestions={false}
        onApply={vi.fn()}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText("ปิด"));
    expect(onClose).toHaveBeenCalled();
  });
});
