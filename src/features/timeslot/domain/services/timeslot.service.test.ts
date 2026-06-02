import { vi, describe, it, expect } from "vitest";
import { breaktime as breaktimeEnum } from "@/prisma/generated/client";
import type { timeslot } from "@/prisma/generated/client";

vi.mock("../../infrastructure/repositories/timeslot.repository", () => ({
  timeslotRepository: { findFirst: vi.fn(), countByTerm: vi.fn() },
}));

import {
  generateTimeslotId,
  generateTimeslots,
  sortTimeslots,
} from "./timeslot.service";

describe("generateTimeslotId", () => {
  it("generates ID for SEMESTER_1", () => {
    expect(generateTimeslotId("SEMESTER_1", 2567, "MON", 1)).toBe(
      "1-2567-MON1",
    );
  });

  it("generates ID for SEMESTER_2", () => {
    expect(generateTimeslotId("SEMESTER_2", 2567, "FRI", 8)).toBe(
      "2-2567-FRI8",
    );
  });

  it("generates ID for different days", () => {
    expect(generateTimeslotId("SEMESTER_1", 2568, "WED", 3)).toBe(
      "1-2568-WED3",
    );
  });
});


describe("sortTimeslots", () => {
  const makeSlot = (
    day: string,
    slotNum: number,
  ): timeslot => ({
    TimeslotID: `1-2567-${day}${slotNum}`,
    DayOfWeek: day as timeslot["DayOfWeek"],
    AcademicYear: 2567,
    Semester: "SEMESTER_1",
    StartTime: new Date(),
    EndTime: new Date(),
    Breaktime: breaktimeEnum.NOT_BREAK,
  });

  it("sorts MON before TUE", () => {
    const slots = [makeSlot("TUE", 1), makeSlot("MON", 1)];
    const sorted = sortTimeslots(slots);
    expect(sorted[0]!.DayOfWeek).toBe("MON");
    expect(sorted[1]!.DayOfWeek).toBe("TUE");
  });

  it("sorts by slot number within same day", () => {
    const slots = [makeSlot("MON", 3), makeSlot("MON", 1), makeSlot("MON", 2)];
    const sorted = sortTimeslots(slots);
    expect(sorted.map((s) => s.TimeslotID)).toEqual([
      "1-2567-MON1",
      "1-2567-MON2",
      "1-2567-MON3",
    ]);
  });

  it("sorts across multiple days correctly", () => {
    const slots = [
      makeSlot("FRI", 2),
      makeSlot("MON", 1),
      makeSlot("WED", 1),
      makeSlot("FRI", 1),
    ];
    const sorted = sortTimeslots(slots);
    expect(sorted.map((s) => s.TimeslotID)).toEqual([
      "1-2567-MON1",
      "1-2567-WED1",
      "1-2567-FRI1",
      "1-2567-FRI2",
    ]);
  });
});

describe("generateTimeslots over slots", () => {
  const base = {
    AcademicYear: 2568,
    Semester: "SEMESTER_1" as const,
    Days: ["MON"] as const,
    StartTime: "08:30",
    slots: [
      { duration: 50 },                          // 08:30-09:20
      { duration: 10, breakGroups: ["*"] },      // 09:20-09:30 universal
      { duration: 50, breakGroups: ["junior"] }, // 09:30-10:20 junior break, teaching-capable
    ],
  };

  it("emits one real timeslot per slot with cumulative per-slot times", () => {
    const ts = generateTimeslots(base as any);
    expect(ts).toHaveLength(3);
    expect(ts[0]!.TimeslotID).toBe("1-2568-MON1");
    expect(ts[1]!.TimeslotID).toBe("1-2568-MON2");
    expect(ts[2]!.TimeslotID).toBe("1-2568-MON3");
    // slot 0: start 08:30, end 09:20
    expect(ts[0]!.StartTime.getHours()).toBe(8);
    expect(ts[0]!.StartTime.getMinutes()).toBe(30);
    expect(ts[0]!.EndTime.getHours()).toBe(9);
    expect(ts[0]!.EndTime.getMinutes()).toBe(20);
    // slot 1: start 09:20, end 09:30 (+10min)
    expect(ts[1]!.StartTime.getHours()).toBe(9);
    expect(ts[1]!.StartTime.getMinutes()).toBe(20);
    expect(ts[1]!.EndTime.getHours()).toBe(9);
    expect(ts[1]!.EndTime.getMinutes()).toBe(30);
    // slot 2: start 09:30, end 10:20 (+50min)
    expect(ts[2]!.StartTime.getHours()).toBe(9);
    expect(ts[2]!.StartTime.getMinutes()).toBe(30);
    expect(ts[2]!.EndTime.getHours()).toBe(10);
    expect(ts[2]!.EndTime.getMinutes()).toBe(20);
  });

  it("Breaktime=BREAK only for universal slots", () => {
    const ts = generateTimeslots(base as any);
    expect(ts[0]!.Breaktime).toBe("NOT_BREAK");
    expect(ts[1]!.Breaktime).toBe("BREAK");
    expect(ts[2]!.Breaktime).toBe("NOT_BREAK");
  });
});
