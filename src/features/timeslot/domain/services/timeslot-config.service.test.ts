import { describe, it, expect } from "vitest"
import { generatePreviewSlots, type PreviewSlot } from "./timeslot-config.service"

describe("generatePreviewSlots", () => {
  const config = {
    StartTime: "08:30",
    Duration: 50,
    TimeslotPerDay: 4,
    breakDefinitions: [
      { id: "lunch", label: "พักเที่ยง", slotNumber: 3, duration: 50, color: "#4CAF50", groups: ["junior"] },
    ],
  }

  it("returns class and break slots", () => {
    const result = generatePreviewSlots(config)
    const types = result.map((s: PreviewSlot) => s.type)
    expect(types).toContain("class")
    expect(types).toContain("break")
  })

  it("break slot has correct label and color", () => {
    const result = generatePreviewSlots(config)
    const breakSlot = result.find((s: PreviewSlot) => s.type === "break")
    expect(breakSlot?.label).toBe("พักเที่ยง")
    expect(breakSlot?.color).toBe("#4CAF50")
  })

  it("calculates correct times with break gap", () => {
    const result = generatePreviewSlots(config)
    const p4 = result.find((s: PreviewSlot) => s.type === "class" && s.period === 4)
    // P1: 08:30-09:20, P2: 09:20-10:10, Break: 10:10-11:00, P3: 11:00-11:50, P4: 11:50-12:40
    expect(p4?.startTime).toBe("11:50")
  })
})
