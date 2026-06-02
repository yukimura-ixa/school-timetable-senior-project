import { describe, expect, it } from "vitest";
import { isBreakSlot, buildGradeGroupIndex, isBreakForGrade, isBreakForTeacher } from "./break-utils";
import type { BreakGroup, SlotConfig } from "@/features/timeslot/domain/models/break.types";

describe("isBreakSlot over slots", () => {
  const slots: SlotConfig[] = [
    { duration: 50 }, { duration: 10, breakGroups: ["*"] }, { duration: 50, breakGroups: ["junior"] },
  ];
  it("true for any slot with breakGroups (universal or group)", () => {
    expect(isBreakSlot(2, slots)).toBe(true);
    expect(isBreakSlot(3, slots)).toBe(true);
  });
  it("false for a pure teaching slot", () => {
    expect(isBreakSlot(1, slots)).toBe(false);
  });
});

describe("buildGradeGroupIndex", () => {
  const junior: BreakGroup = { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1", "M2-1"] };
  const senior: BreakGroup = { name: "senior", label: "ม.ปลาย", color: "#2196F3", gradeIds: ["M5-1"] };
  const custom: BreakGroup = { name: "band", label: "วงโยธวาทิต", color: "#9C27B0", gradeIds: ["M2-1"] };

  it("maps each grade to the set of groups it belongs to", () => {
    const index = buildGradeGroupIndex([junior, senior]);
    expect([...(index.get("M1-1") ?? [])]).toEqual(["junior"]);
    expect([...(index.get("M5-1") ?? [])]).toEqual(["senior"]);
  });

  it("allows a grade to belong to multiple groups", () => {
    const index = buildGradeGroupIndex([junior, custom]);
    expect(index.get("M2-1")).toEqual(new Set(["junior", "band"]));
  });

  it("returns undefined for a grade in no group", () => {
    const index = buildGradeGroupIndex([junior]);
    expect(index.get("M6-9")).toBeUndefined();
  });

  it("handles an empty group list", () => {
    expect(buildGradeGroupIndex([]).size).toBe(0);
  });
});

describe("isBreakForGrade over slots", () => {
  const slots: SlotConfig[] = [
    { duration: 50 },                              // slot 1 teaching
    { duration: 50 },                              // slot 2 teaching
    { duration: 10, breakGroups: ["*"] },          // slot 3 universal recess
    { duration: 50, breakGroups: ["junior"] },     // slot 4 junior lunch
    { duration: 50, breakGroups: ["senior"] },     // slot 5 senior lunch
    { duration: 50 },                              // slot 6 teaching
  ];
  const index = buildGradeGroupIndex([
    { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1"] },
    { name: "senior", label: "ม.ปลาย", color: "#2196F3", gradeIds: ["M5-1"] },
  ]);

  it("universal slot is a break for any grade", () => {
    expect(isBreakForGrade(3, "M1-1", slots, index)).toBe(true);
    expect(isBreakForGrade(3, "M5-1", slots, index)).toBe(true);
  });
  it("group slot only breaks for that group's grades", () => {
    expect(isBreakForGrade(4, "M1-1", slots, index)).toBe(true);
    expect(isBreakForGrade(4, "M5-1", slots, index)).toBe(false);
    expect(isBreakForGrade(5, "M5-1", slots, index)).toBe(true);
    expect(isBreakForGrade(5, "M1-1", slots, index)).toBe(false);
  });
  it("teaching slot is never a break", () => {
    expect(isBreakForGrade(1, "M1-1", slots, index)).toBe(false);
  });
  it("matches when the grade belongs to multiple groups", () => {
    const multiIndex = buildGradeGroupIndex([
      { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1"] },
      { name: "band", label: "วง", color: "#9C27B0", gradeIds: ["M1-1"] },
    ]);
    const s: SlotConfig[] = [{ duration: 50 }, { duration: 20, breakGroups: ["band"] }];
    expect(isBreakForGrade(2, "M1-1", s, multiIndex)).toBe(true);   // via band
    expect(isBreakForGrade(2, "M5-1", s, multiIndex)).toBe(false);  // not in band
  });
});

describe("isBreakForTeacher over slots", () => {
  const slots: SlotConfig[] = [
    { duration: 50 },                          // slot 1 teaching
    { duration: 10, breakGroups: ["*"] },      // slot 2 universal
    { duration: 50, breakGroups: ["junior"] }, // slot 3 group-only
  ];
  it("true only for universal slots", () => {
    expect(isBreakForTeacher(2, slots)).toBe(true);
  });
  it("false for a group-only break slot (staggered breaks are grade-only)", () => {
    expect(isBreakForTeacher(3, slots)).toBe(false);
  });
  it("false for a teaching slot and out-of-range", () => {
    expect(isBreakForTeacher(1, slots)).toBe(false);
    expect(isBreakForTeacher(99, slots)).toBe(false);
  });
});
