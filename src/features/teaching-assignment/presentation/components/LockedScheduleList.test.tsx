// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  LockedScheduleList,
  LockedScheduleListCompact,
  type LockedScheduleItem,
} from "./LockedScheduleList";
import "@testing-library/jest-dom/vitest";

const baseItem = (
  overrides: Partial<LockedScheduleItem> = {},
): LockedScheduleItem =>
  ({
    TimeslotID: "1-2567-MON-1",
    SubjectName: "คณิตศาสตร์",
    RoomName: "ห้อง 101",
    GradeID: "M1/1",
    DayOfWeek: "MON",
    TimePeriod: 1,
    IsLocked: true,
    ...overrides,
  } as unknown as LockedScheduleItem);

describe("LockedScheduleList", () => {
  it("renders empty state when items is empty", () => {
    render(<LockedScheduleList items={[]} />);
    expect(screen.getByText("ไม่มีตารางที่ถูกล็อก")).toBeInTheDocument();
  });

  it("renders item count, subject, grade, day/period, and room when items present", () => {
    render(<LockedScheduleList items={[baseItem()]} />);
    expect(screen.getByText("คณิตศาสตร์")).toBeInTheDocument();
    expect(screen.getByText("M1/1")).toBeInTheDocument();
    expect(screen.getByText(/MON คาบที่ 1/)).toBeInTheDocument();
    expect(screen.getByText(/ห้อง 101/)).toBeInTheDocument();
    expect(screen.getByText(/\(1 รายการ\)/)).toBeInTheDocument();
  });

  it("joins multiple GradeIDs with comma", () => {
    render(
      <LockedScheduleList
        items={[baseItem({ GradeID: ["M1/1", "M1/2"] })]}
      />,
    );
    expect(screen.getByText("M1/1, M1/2")).toBeInTheDocument();
  });

  it("fires onUnlock callback when unlock button clicked", async () => {
    const onUnlock = vi.fn();
    const user = userEvent.setup();
    const item = baseItem();
    render(<LockedScheduleList items={[item]} onUnlock={onUnlock} />);
    await user.click(screen.getByRole("button", { name: /ปลดล็อก/ }));
    expect(onUnlock).toHaveBeenCalledWith(item);
  });

  it("hides unlock button when onUnlock not provided", () => {
    render(<LockedScheduleList items={[baseItem()]} />);
    expect(screen.queryByRole("button", { name: /ปลดล็อก/ })).toBeNull();
  });
});

describe("LockedScheduleListCompact", () => {
  it("renders compact empty state", () => {
    render(<LockedScheduleListCompact items={[]} />);
    expect(screen.getByText("ไม่มีตารางที่ถูกล็อก")).toBeInTheDocument();
  });

  it("renders compact populated state with count and items", () => {
    render(<LockedScheduleListCompact items={[baseItem()]} />);
    expect(screen.getByText(/🔒 ตารางที่ถูกล็อก \(1\)/)).toBeInTheDocument();
    expect(screen.getByText("คณิตศาสตร์")).toBeInTheDocument();
  });
});
