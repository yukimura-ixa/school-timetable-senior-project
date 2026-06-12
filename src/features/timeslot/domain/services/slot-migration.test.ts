import { describe, expect, it } from "vitest";
import { configToSlots, remapTimeslotId } from "./slot-migration";

describe("configToSlots", () => {
  it("interleaves teaching periods (global Duration) with break slots from breakDefinitions", () => {
    const old = {
      Duration: 50,
      TimeslotPerDay: 6,
      breakDefinitions: [
        { id: "m", label: "พักสาย", slotNumber: 3, duration: 10, color: "#x", groups: ["*"] },
        { id: "j", label: "lunch jr", slotNumber: 4, duration: 50, color: "#y", groups: ["junior"] },
        { id: "s", label: "lunch sr", slotNumber: 5, duration: 50, color: "#z", groups: ["senior"] },
      ],
    };
    expect(configToSlots(old as any)).toEqual([
      { duration: 50 }, { duration: 50 },
      { duration: 10, breakGroups: ["*"] },
      { duration: 50 },
      { duration: 50, breakGroups: ["junior"] },
      { duration: 50 },
      { duration: 50, breakGroups: ["senior"] },
      { duration: 50 }, { duration: 50 },
    ]);
  });
  it("handles a config with no breakDefinitions", () => {
    expect(configToSlots({ Duration: 50, TimeslotPerDay: 3 } as any)).toEqual([
      { duration: 50 }, { duration: 50 }, { duration: 50 },
    ]);
  });
});

describe("remapTimeslotId", () => {
  const breakSlotNumbers = [3, 4, 5];
  it("shifts teaching period by the number of breaks at/before it", () => {
    expect(remapTimeslotId("1-2568-MON1", breakSlotNumbers)).toBe("1-2568-MON1"); // 0 breaks <=1
    expect(remapTimeslotId("1-2568-MON3", breakSlotNumbers)).toBe("1-2568-MON4"); // 1 break <=3
    expect(remapTimeslotId("1-2568-MON5", breakSlotNumbers)).toBe("1-2568-MON8"); // 3 breaks <=5
  });
  it("works for other days and is a no-op with no breaks", () => {
    expect(remapTimeslotId("2-2567-FRI2", [])).toBe("2-2567-FRI2");
    expect(remapTimeslotId("1-2568-TUE6", [3,4,5])).toBe("1-2568-TUE9");
  });
});

describe("configToSlots <-> remapTimeslotId consistency", () => {
  it("each old teaching period lands at the new index remapTimeslotId predicts", () => {
    const old = {
      Duration: 50, TimeslotPerDay: 6,
      breakDefinitions: [
        { slotNumber: 3, duration: 10, groups: ["*"] },
        { slotNumber: 4, duration: 50, groups: ["junior"] },
        { slotNumber: 5, duration: 50, groups: ["senior"] },
      ],
    };
    const slots = configToSlots(old);
    const breakSlotNumbers = old.breakDefinitions.map((b) => b.slotNumber);
    // walk slots; the k-th teaching slot (no breakGroups) is old period k -> its 1-based new index
    let teaching = 0;
    slots.forEach((s, i) => {
      if (!s.breakGroups) {
        teaching += 1;
        const newIndex = i + 1; // 1-based
        const predicted = Number(remapTimeslotId(`1-2568-MON${teaching}`, breakSlotNumbers).match(/MON(\d+)$/)![1]);
        expect(predicted).toBe(newIndex);
      }
    });
  });
});
