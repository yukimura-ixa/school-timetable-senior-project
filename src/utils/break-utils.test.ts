import { describe, expect, it } from "vitest";
import { isBreakSlot, buildGradeGroupIndex, isBreakForGrade } from "./break-utils";
import type { BreakDefinition, BreakGroup } from "@/features/timeslot/domain/models/break.types";

const defs: BreakDefinition[] = [
  { id: "lunch", label: "พักเที่ยง", slotNumber: 4, duration: 50, color: "#4CAF50", groups: ["*"] },
];

describe("isBreakSlot", () => {
  it("treats NOT_BREAK as teaching", () => {
    expect(isBreakSlot("NOT_BREAK")).toBe(false);
    // slot 7 has no matching def -> falls back to enum (teaching)
    expect(isBreakSlot("NOT_BREAK", 7, defs)).toBe(false);
  });

  it("treats v2 BREAK and all legacy enum values as breaks (enum fallback)", () => {
    for (const bt of ["BREAK", "BREAK_BOTH", "BREAK_JUNIOR", "BREAK_SENIOR"]) {
      expect(isBreakSlot(bt)).toBe(true);
    }
  });

  it("returns false for an empty breaktime", () => {
    expect(isBreakSlot("")).toBe(false);
  });

  it("is config-aware: a break definition at the slot marks it a break even if the enum lags", () => {
    // def exists at slot 4 -> break, regardless of the (lagging) enum value
    expect(isBreakSlot("NOT_BREAK", 4, defs)).toBe(true);
  });

  it("with defs, a slot without a matching def falls back to the enum", () => {
    expect(isBreakSlot("BREAK", 5, defs)).toBe(true); // enum says break
    expect(isBreakSlot("NOT_BREAK", 5, defs)).toBe(false); // no def at 5, enum teaching
  });

  it("is a superset of the raw enum check (never drops an enum-marked break)", () => {
    // Even with defs that don't match the slot, an enum break stays a break.
    expect(isBreakSlot("BREAK_JUNIOR", 99, defs)).toBe(true);
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

describe("isBreakForGrade", () => {
  const defs: BreakDefinition[] = [
    { id: "lunch-junior", label: "พักเที่ยง ม.ต้น", slotNumber: 4, duration: 50, color: "#4CAF50", groups: ["junior"] },
    { id: "lunch-senior", label: "พักเที่ยง ม.ปลาย", slotNumber: 5, duration: 50, color: "#2196F3", groups: ["senior"] },
    { id: "morning", label: "พักเช้า", slotNumber: 3, duration: 10, color: "#FF9800", groups: ["*"] },
    { id: "band-break", label: "พักวง", slotNumber: 6, duration: 20, color: "#9C27B0", groups: ["band"] },
  ];
  const index = buildGradeGroupIndex([
    { name: "junior", label: "ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1"] },
    { name: "senior", label: "ม.ปลาย", color: "#2196F3", gradeIds: ["M5-1"] },
    { name: "band", label: "วง", color: "#9C27B0", gradeIds: ["M1-1"] }, // M1-1 is junior AND band
  ]);

  it("matches a group break for a grade in that group", () => {
    expect(isBreakForGrade(4, "M1-1", defs, index)).toBe(true);
    expect(isBreakForGrade(5, "M5-1", defs, index)).toBe(true);
  });

  it("does not match a group break for a grade outside the group", () => {
    expect(isBreakForGrade(4, "M5-1", defs, index)).toBe(false);
    expect(isBreakForGrade(5, "M1-1", defs, index)).toBe(false);
  });

  it("matches a universal (*) break for any grade", () => {
    expect(isBreakForGrade(3, "M1-1", defs, index)).toBe(true);
    expect(isBreakForGrade(3, "M5-1", defs, index)).toBe(true);
  });

  it("REGRESSION: resolves arbitrary custom groups, not just junior/senior", () => {
    expect(isBreakForGrade(6, "M1-1", defs, index)).toBe(true);
    expect(isBreakForGrade(6, "M5-1", defs, index)).toBe(false);
  });

  it("returns false for a grade in no group at a non-universal slot", () => {
    expect(isBreakForGrade(4, "M9-9", defs, index)).toBe(false);
    expect(isBreakForGrade(3, "M9-9", defs, index)).toBe(true);
  });
});
