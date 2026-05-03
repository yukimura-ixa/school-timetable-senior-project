import { describe, it, expect } from "vitest";
import { generatePreviewSlotsV2 } from "./timeslot-config.service";

describe("generatePreviewSlotsV2", () => {
  const config = {
    StartTime: "08:30",
    Duration: 50,
    TimeslotPerDay: 4,
    breakDefinitions: [
      { id: "lunch", label: "พักเที่ยง", slotNumber: 3, duration: 50, color: "#4CAF50", groups: ["junior"] },
    ],
  };

  it("returns class and break slots", () => {
    const result = generatePreviewSlotsV2(config);
    const types = result.map(s => s.type);
    expect(types).toContain("class");
    expect(types).toContain("break");
  });

  it("break slot has correct label and color", () => {
    const result = generatePreviewSlotsV2(config);
    const breakSlot = result.find(s => s.type === "break");
    expect(breakSlot?.label).toBe("พักเที่ยง");
    expect(breakSlot?.color).toBe("#4CAF50");
  });

  it("calculates correct times with break gap", () => {
    const result = generatePreviewSlotsV2(config);
    const p3 = result.find(s => s.type === "class" && s.period === 3);
    // P2 ends 10:10, break 50min, P3 starts 11:00
    expect(p3?.startTime).toBe("11:00");
  });
});
