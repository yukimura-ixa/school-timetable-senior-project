// @vitest-environment happy-dom
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimeslotGrid, type ScheduleCell } from "./TimeslotGrid";
import type { timeslot } from "@/prisma/generated/client";

const t = (day: timeslot["DayOfWeek"], slot: number, breaktime: timeslot["Breaktime"] = "NOT_BREAK"): timeslot => ({
  TimeslotID: `1-2568-${day}${slot}`,
  AcademicYear: 2568,
  Semester: "SEMESTER_1",
  DayOfWeek: day,
  StartTime: new Date(`1970-01-01T0${slot}:00:00.000Z`),
  EndTime: new Date(`1970-01-01T0${slot}:50:00.000Z`),
  Breaktime: breaktime,
});

const slots = [{ duration: 50 }, { duration: 50, breakGroups: ["junior"] }, { duration: 50 }];
const breakGroups = [{ name: "junior", label: "พักกลางวัน ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1"] }];
const timeslots: timeslot[] = ["MON", "TUE"].flatMap((d) =>
  [1, 2, 3].map((s) => t(d as timeslot["DayOfWeek"], s, s === 2 ? "BREAK_JUNIOR" : "NOT_BREAK")),
);

const club: ScheduleCell = {
  timeslotId: "1-2568-TUE2",
  subjectCode: "ACT-CLUB",
  subjectName: "ชุมนุม",
  isLocked: true,
};

describe("TimeslotGrid break cells", () => {
  it("renders a class that sits in the grade's own break slot instead of an empty striped cell", () => {
    render(
      <TimeslotGrid
        timeslots={timeslots}
        slots={slots}
        breakGroups={breakGroups}
        view={{ mode: "class", gradeId: "M1-1", groupNames: ["junior"] }}
        cellsByTimeslotId={new Map([[club.timeslotId, club]])}
      />,
    );

    const rows = screen.getAllByRole("row");
    const tueRow = rows.find((r) => within(r).queryByText("อังคาร"))!;
    const monRow = rows.find((r) => within(r).queryByText("จันทร์"))!;

    expect(within(tueRow).getByText("ชุมนุม")).toBeTruthy();
    expect(within(tueRow).getByText("ACT-CLUB")).toBeTruthy();
    expect(within(tueRow).getByLabelText("ล็อกแล้ว")).toBeTruthy();
    // The occupied cell keeps its break-column identity but drops the stripes.
    const occupied = within(tueRow).getByText("ชุมนุม").closest("td")!;
    expect(occupied.getAttribute("data-testid")).toBe("break-cell");
    expect(occupied.className).not.toContain("timeslot-break-cell");

    const monBreak = within(monRow).getAllByTestId("break-cell")[0]!;
    expect(monBreak.textContent).toBe("");
    expect(monBreak.className).toContain("timeslot-break-cell");
  });
});
