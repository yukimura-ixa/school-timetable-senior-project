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
  it("returns locked when timeslot is a break", () => {
    expect(getCellState(slot({ Breaktime: "BREAK_JUNIOR" }), undefined, false).kind).toBe("locked");
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
    expect(getCellState(slot({ Breaktime: "BREAK_JUNIOR" }), undefined, true).kind).toBe("locked");
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

const entry = (over: Partial<ScheduleEntry> = {}): ScheduleEntry => ({
  ClassID: 1, TimeslotID: "1-2568-MON1", SubjectCode: "ค21101", GradeID: "M1-1",
  RoomID: 1, subject: { SubjectName: "คณิต" }, gradelevel: { GradeName: "ม.1/1" },
  room: null, ...over,
});

describe("getCellState — unified locked model", () => {
  it("marks a break timeslot as locked (reason break)", () => {
    expect(getCellState(slot({ Breaktime: "BREAK" }), undefined, false))
      .toMatchObject({ kind: "locked", lockReason: "break" });
  });
  it("marks a locked entry as locked (reason locked-class)", () => {
    expect(getCellState(slot(), entry({ IsLocked: true }), false))
      .toMatchObject({ kind: "locked", lockReason: "locked-class" });
  });
  it("break takes precedence over an entry", () => {
    expect(getCellState(slot({ Breaktime: "BREAK" }), entry({ IsLocked: true }), false))
      .toMatchObject({ kind: "locked", lockReason: "break" });
  });
  it("unlocked entry is placed; empty is empty; isOver is drop-target", () => {
    expect(getCellState(slot(), entry(), false)).toMatchObject({ kind: "placed" });
    expect(getCellState(slot(), undefined, false)).toMatchObject({ kind: "empty" });
    expect(getCellState(slot(), undefined, true)).toMatchObject({ kind: "drop-target" });
  });
});
