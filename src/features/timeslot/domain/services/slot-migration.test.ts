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
      { duration: 50, breakGroups: ["senior"] },
      { duration: 50 }, { duration: 50 }, { duration: 50 },
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
