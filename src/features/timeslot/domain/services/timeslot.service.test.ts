import { vi, describe, it, expect } from "vitest";
import { breaktime as breaktimeEnum } from "@/prisma/generated/client";
import type { timeslot } from "@/prisma/generated/client";

vi.mock("../../infrastructure/repositories/timeslot.repository", () => ({
  timeslotRepository: { findFirst: vi.fn(), countByTerm: vi.fn() },
}));

import {
  generateTimeslotId,
  calculateBreaktime,
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

describe("calculateBreaktime", () => {
  it("returns NOT_BREAK when slot matches neither", () => {
    expect(calculateBreaktime(1, { Junior: 4, Senior: 5 })).toBe(
      breaktimeEnum.NOT_BREAK,
    );
  });

  it("returns BREAK_JUNIOR when only junior matches", () => {
    expect(calculateBreaktime(4, { Junior: 4, Senior: 5 })).toBe(
      breaktimeEnum.BREAK_JUNIOR,
    );
  });

  it("returns BREAK_SENIOR when only senior matches", () => {
    expect(calculateBreaktime(5, { Junior: 4, Senior: 5 })).toBe(
      breaktimeEnum.BREAK_SENIOR,
    );
  });

  it("returns BREAK_BOTH when both match same slot", () => {
    expect(calculateBreaktime(4, { Junior: 4, Senior: 4 })).toBe(
      breaktimeEnum.BREAK_BOTH,
    );
  });
});

describe("generateTimeslots", () => {
  const baseConfig = {
    AcademicYear: 2567,
    Semester: "SEMESTER_1" as const,
    TimeslotPerDay: 3,
    Duration: 50,
    BreakDuration: 60,
    StartTime: "08:30",
    Days: ["MON" as const],
    BreakTimeslots: { Junior: 2, Senior: 2 },
    HasMinibreak: false,
    MiniBreak: { SlotNumber: 0, Duration: 0 },
  };

  it("generates correct number of timeslots", () => {
    const result = generateTimeslots(baseConfig);
    expect(result).toHaveLength(3);
  });

  it("generates correct TimeslotIDs", () => {
    const result = generateTimeslots(baseConfig);
    expect(result[0]!.TimeslotID).toBe("1-2567-MON1");
    expect(result[1]!.TimeslotID).toBe("1-2567-MON2");
    expect(result[2]!.TimeslotID).toBe("1-2567-MON3");
  });

  it("calculates times for normal slots", () => {
    const result = generateTimeslots(baseConfig);
    expect(result[0]!.StartTime.getHours()).toBe(8);
    expect(result[0]!.StartTime.getMinutes()).toBe(30);
    expect(result[0]!.EndTime.getHours()).toBe(9);
    expect(result[0]!.EndTime.getMinutes()).toBe(20);
  });

  it("uses BreakDuration for break slots", () => {
    const result = generateTimeslots(baseConfig);
    const breakSlot = result[1]!;
    expect(breakSlot.Breaktime).toBe(breaktimeEnum.BREAK_BOTH);
    expect(breakSlot.StartTime.getHours()).toBe(9);
    expect(breakSlot.StartTime.getMinutes()).toBe(20);
    expect(breakSlot.EndTime.getHours()).toBe(10);
    expect(breakSlot.EndTime.getMinutes()).toBe(20);
  });

  it("chains slot times correctly (next starts where previous ends)", () => {
    const result = generateTimeslots(baseConfig);
    expect(result[2]!.StartTime.getTime()).toBe(result[1]!.EndTime.getTime());
  });

  it("applies mini break before the specified slot", () => {
    const config = {
      ...baseConfig,
      HasMinibreak: true,
      MiniBreak: { SlotNumber: 2, Duration: 10 },
    };
    const result = generateTimeslots(config);
    expect(result[1]!.StartTime.getHours()).toBe(9);
    expect(result[1]!.StartTime.getMinutes()).toBe(30);
  });

  it("generates timeslots for multiple days", () => {
    const config = {
      ...baseConfig,
      Days: ["MON" as const, "TUE" as const],
    };
    const result = generateTimeslots(config);
    expect(result).toHaveLength(6);
    expect(result[0]!.DayOfWeek).toBe("MON");
    expect(result[3]!.DayOfWeek).toBe("TUE");
  });

  it("sets correct AcademicYear and Semester on all slots", () => {
    const result = generateTimeslots(baseConfig);
    result.forEach((slot) => {
      expect(slot.AcademicYear).toBe(2567);
      expect(slot.Semester).toBe("SEMESTER_1");
    });
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
