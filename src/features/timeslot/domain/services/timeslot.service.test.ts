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

describe("generateTimeslots", () => {
  const baseConfig = {
    AcademicYear: 2568,
    Semester: "SEMESTER_1" as const,
    TimeslotPerDay: 4,
    Duration: 50,
    StartTime: "08:30",
    Days: ["MON" as const],
    breakDefinitions: [
      { id: "lunch", label: "พักเที่ยง", slotNumber: 3, duration: 50, color: "#4CAF50", groups: ["junior"] },
    ],
  };

  it("generates correct number of timeslots", () => {
    const result = generateTimeslots(baseConfig);
    expect(result).toHaveLength(4);
  });

  it("marks timeslot before break as BREAK", () => {
    const result = generateTimeslots(baseConfig);
    // Break at slot 3 means slot 2 should be BREAK (break follows it)
    expect(result[1]!.Breaktime).toBe("BREAK");
  });

  it("inserts time gap for break between periods", () => {
    const result = generateTimeslots(baseConfig);
    // P2 ends at 10:10, break is 50min, P3 starts at 11:00
    expect(result[2]!.StartTime.getHours()).toBe(11);
    expect(result[2]!.StartTime.getMinutes()).toBe(0);
  });

  it("handles multiple breaks", () => {
    const config = {
      ...baseConfig,
      breakDefinitions: [
        { id: "mini", label: "พักเช้า", slotNumber: 2, duration: 10, color: "#FF9800", groups: ["*"] },
        { id: "lunch", label: "พักเที่ยง", slotNumber: 3, duration: 50, color: "#4CAF50", groups: ["junior"] },
      ],
    };
    const result = generateTimeslots(config);
    // P1 ends 09:20, 10min gap, P2 starts 09:30
    expect(result[1]!.StartTime.getMinutes()).toBe(30);
  });

  it("all timeslots use simplified BREAK enum", () => {
    const result = generateTimeslots(baseConfig);
    result.forEach(slot => {
      expect(["BREAK", "NOT_BREAK"]).toContain(slot.Breaktime);
    });
  });
});
