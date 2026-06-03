import { describe, it, expect } from "vitest";
import {
  parseTimeslotDayPeriod,
  isValidLockTimeslotSelection,
} from "./lock-timeslot-rules";

describe("parseTimeslotDayPeriod", () => {
  it("extracts day and period from a TimeslotID", () => {
    expect(parseTimeslotDayPeriod("1-2568-MON1")).toEqual({
      day: "MON",
      period: 1,
    });
    expect(parseTimeslotDayPeriod("2-2568-FRI10")).toEqual({
      day: "FRI",
      period: 10,
    });
  });

  it("returns null for malformed ids", () => {
    expect(parseTimeslotDayPeriod("garbage")).toBeNull();
    expect(parseTimeslotDayPeriod("")).toBeNull();
  });
});

describe("isValidLockTimeslotSelection", () => {
  it("accepts a single period", () => {
    expect(isValidLockTimeslotSelection(["1-2568-MON3"])).toBe(true);
  });

  it("accepts two consecutive same-day periods", () => {
    expect(isValidLockTimeslotSelection(["1-2568-MON1", "1-2568-MON2"])).toBe(
      true,
    );
    // order-independent
    expect(isValidLockTimeslotSelection(["1-2568-MON4", "1-2568-MON3"])).toBe(
      true,
    );
  });

  it("rejects an empty selection", () => {
    expect(isValidLockTimeslotSelection([])).toBe(false);
  });

  it("rejects more than two periods", () => {
    expect(
      isValidLockTimeslotSelection([
        "1-2568-MON1",
        "1-2568-MON2",
        "1-2568-MON3",
      ]),
    ).toBe(false);
  });

  it("rejects two non-adjacent periods on the same day", () => {
    expect(isValidLockTimeslotSelection(["1-2568-MON1", "1-2568-MON3"])).toBe(
      false,
    );
  });

  it("rejects two periods on different days", () => {
    expect(isValidLockTimeslotSelection(["1-2568-MON1", "1-2568-TUE2"])).toBe(
      false,
    );
  });
});
