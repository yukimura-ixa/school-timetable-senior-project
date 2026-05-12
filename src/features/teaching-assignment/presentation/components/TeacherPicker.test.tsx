// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeacherPicker, type TeacherPickerOption } from "./TeacherPicker";
import "@testing-library/jest-dom/vitest";

const teachers: TeacherPickerOption[] = [
  { id: 1, prefix: "นาย", firstname: "สมชาย", lastname: "ใจดี", department: "คณิตศาสตร์" },
  { id: 2, prefix: "นาง", firstname: "อรทัย", lastname: "สุขใจ", department: "ภาษาไทย" },
];

describe("TeacherPicker", () => {
  it("renders placeholder when no value selected", () => {
    render(
      <TeacherPicker teachers={teachers} value={null} onChange={vi.fn()} />,
    );
    expect(
      screen.getByPlaceholderText("ค้นหาครูผู้สอน"),
    ).toBeInTheDocument();
  });

  it("displays selected teacher's full name", () => {
    render(
      <TeacherPicker
        teachers={teachers}
        value={teachers[0]!}
        onChange={vi.fn()}
      />,
    );
    expect(
      screen.getByDisplayValue("นายสมชาย ใจดี"),
    ).toBeInTheDocument();
  });

  it("fires onChange with selected teacher when option clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TeacherPicker teachers={teachers} value={null} onChange={onChange} />,
    );
    await user.click(screen.getByPlaceholderText("ค้นหาครูผู้สอน"));
    await user.click(screen.getByText(/อรทัย/));
    expect(onChange).toHaveBeenCalledWith(teachers[1]);
  });

  it("fires onChange with null when cleared", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TeacherPicker
        teachers={teachers}
        value={teachers[0]!}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByLabelText("Clear"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("shows no-options text when teachers list empty", async () => {
    const user = userEvent.setup();
    render(<TeacherPicker teachers={[]} value={null} onChange={vi.fn()} />);
    await user.click(screen.getByPlaceholderText("ค้นหาครูผู้สอน"));
    expect(screen.getByText("ไม่พบครูผู้สอน")).toBeInTheDocument();
  });
});
