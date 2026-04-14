import {
  calculateSchoolDayEndTime,
  calculateSchoolDayMinutes,
  generatePreviewSlots,
} from "@/features/timeslot/domain/services/timeslot-config.service";
import type { ConfigData } from "@/features/config/domain/constants/config.constants";

const baseConfig: ConfigData = {
  AcademicYear: 2568,
  Semester: "SEMESTER_1",
  Days: ["MON", "TUE", "WED", "THU", "FRI"],
  StartTime: "08:30",
  BreakDuration: 50,
  BreakTimeslots: {
    Junior: 4,
    Senior: 5,
  },
  Duration: 50,
  TimeslotPerDay: 8,
  MiniBreak: {
    Duration: 10,
    SlotNumber: 2,
  },
  HasMinibreak: false,
};

describe("timeslot-config.service", () => {
  it("generates class and lunch slots for separate junior/senior lunch", () => {
    const slots = generatePreviewSlots(baseConfig);

    expect(slots).toHaveLength(10);
    expect(slots.filter((slot) => slot.type === "lunch-junior")).toHaveLength(1);
    expect(slots.filter((slot) => slot.type === "lunch-senior")).toHaveLength(1);
    expect(slots.filter((slot) => slot.type === "class")).toHaveLength(8);
  });

  it("generates shared lunch slot when junior and senior lunch period are equal", () => {
    const slots = generatePreviewSlots({
      ...baseConfig,
      BreakTimeslots: { Junior: 4, Senior: 4 },
    });

    expect(slots.filter((slot) => slot.type === "lunch-both")).toHaveLength(1);
    expect(slots.filter((slot) => slot.type === "lunch-junior")).toHaveLength(0);
    expect(slots.filter((slot) => slot.type === "lunch-senior")).toHaveLength(0);
  });

  it("inserts mini break after the configured slot", () => {
    const slots = generatePreviewSlots({
      ...baseConfig,
      HasMinibreak: true,
      MiniBreak: { SlotNumber: 2, Duration: 10 },
    });

    const slot2Index = slots.findIndex(
      (slot) => slot.type === "class" && slot.period === 2,
    );
    expect(slot2Index).toBeGreaterThan(-1);
    expect(slots[slot2Index + 1]?.type).toBe("mini-break");
  });

  it("calculates school day minutes and end time", () => {
    const slots = generatePreviewSlots(baseConfig);

    expect(calculateSchoolDayMinutes(slots)).toBe(500);
    expect(calculateSchoolDayEndTime(slots)).toBe("16:50");
  });
});
