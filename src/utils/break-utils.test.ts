import { describe, expect, it } from "vitest";
import { isBreakSlot } from "./break-utils";
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";

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
