import { describe, it, expect } from "vitest";
import { getCellState, formatPeriodTime, DAY_FULL_LABEL } from "../grid-format";
import type { Timeslot, ScheduleEntry } from "../teacher-schedule";

const slot = (over: Partial<Timeslot> = {}): Timeslot => ({
  TimeslotID: "1-2568-MON-1",
  DayOfWeek: "MON",
  Period: 1,
  StartTime: "1970-01-01T08:30:00.000Z",
  EndTime: "1970-01-01T09:20:00.000Z",
  Breaktime: "NOT_BREAK",
  ...over,
});

describe("getCellState", () => {
  it("returns break when timeslot is a break", () => {
    expect(getCellState(slot({ Breaktime: "BREAK_JUNIOR" }), undefined, false).kind).toBe("break");
  });
  it("returns drop-target when isOver and not a break", () => {
    expect(getCellState(slot(), undefined, true).kind).toBe("drop-target");
  });
  it("returns placed when an entry exists", () => {
    const entry = { SubjectCode: "ค21101" } as ScheduleEntry;
    expect(getCellState(slot(), entry, false).kind).toBe("placed");
  });
  it("returns empty otherwise", () => {
    expect(getCellState(slot(), undefined, false).kind).toBe("empty");
  });
  it("break takes precedence over isOver", () => {
    expect(getCellState(slot({ Breaktime: "BREAK_JUNIOR" }), undefined, true).kind).toBe("break");
  });
});

describe("formatPeriodTime", () => {
  it("formats a local (no-Z) DateTime to HH:mm — matches how timeslots are seeded, timezone-independent", () => {
    expect(formatPeriodTime("2024-01-01T08:30:00")).toBe("08:30");
  });
  it("returns empty string for missing input", () => {
    expect(formatPeriodTime(undefined)).toBe("");
  });
});

describe("DAY_FULL_LABEL", () => {
  it("maps MON to จันทร์", () => {
    expect(DAY_FULL_LABEL.MON).toBe("จันทร์");
  });
});
