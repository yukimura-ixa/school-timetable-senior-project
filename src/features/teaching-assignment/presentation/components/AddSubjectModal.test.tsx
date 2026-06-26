// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { AddSubjectModal, type SubjectOption } from "./AddSubjectModal";

const math: SubjectOption = {
  SubjectCode: "ค21101",
  SubjectName: "คณิตศาสตร์",
  Credit: "CREDIT_10",
};
const sci: SubjectOption = {
  SubjectCode: "ว21101",
  SubjectName: "วิทยาศาสตร์",
  Credit: "CREDIT_15",
};

const baseProps = {
  open: true,
  roomLabel: "ม.1/1",
  availableSubjects: [math, sci],
  existingSubjects: [] as SubjectOption[],
  onConfirm: vi.fn(),
  onClose: vi.fn(),
};

describe("AddSubjectModal", () => {
  it("renders the subjects already assigned to the room", () => {
    render(<AddSubjectModal {...baseProps} existingSubjects={[math]} />);
    expect(screen.getByText(/ค21101/)).toBeInTheDocument();
    expect(screen.getByText(/คณิตศาสตร์/)).toBeInTheDocument();
  });

  it("removes an existing subject and confirms without it", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <AddSubjectModal
        {...baseProps}
        existingSubjects={[math, sci]}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: "ลบ ค21101" }));
    await user.click(screen.getByRole("button", { name: "ยืนยัน" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    const confirmed = onConfirm.mock.calls[0]![0] as SubjectOption[];
    expect(confirmed.map((s) => s.SubjectCode)).toEqual(["ว21101"]);
  });

  it("adds a subject picked from the available list and confirms with it", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <AddSubjectModal
        {...baseProps}
        existingSubjects={[]}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("combobox", { name: "เพิ่มวิชา" }));
    await user.click(screen.getByRole("option", { name: /ค21101/ }));
    await user.click(screen.getByRole("button", { name: "ยืนยัน" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    const confirmed = onConfirm.mock.calls[0]![0] as SubjectOption[];
    expect(confirmed.map((s) => s.SubjectCode)).toEqual(["ค21101"]);
  });
});
