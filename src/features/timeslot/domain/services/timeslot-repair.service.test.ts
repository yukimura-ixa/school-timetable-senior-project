import { describe, expect, it } from "vitest";
import {
  planTimeslotRowRepair,
  planSlotNumberRemap,
  remapTimeslotIdWith,
  utcClock,
} from "./timeslot-repair.service";

const t = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00.000Z`);
const row = (id: string, start: string, end: string) => ({
  TimeslotID: id,
  StartTime: t(start),
  EndTime: t(end),
});

describe("utcClock", () => {
  it("formats the UTC wall-clock of a Time column value", () => {
    expect(utcClock(new Date("2024-01-01T08:30:00.000Z"))).toBe("08:30");
    expect(utcClock(new Date("1970-01-01T13:05:00.000Z"))).toBe("13:05");
  });
});

describe("planTimeslotRowRepair", () => {
  it("emits one update per row whose times differ and counts the rest as unchanged", () => {
    const existing = [
      row("1-2568-MON1", "08:00", "08:50"),
      row("1-2568-MON2", "08:50", "09:40"),
      row("1-2568-MON3", "09:50", "10:40"),
    ];
    const generated = [
      row("1-2568-MON1", "08:00", "08:50"),
      row("1-2568-MON2", "08:50", "09:40"),
      row("1-2568-MON3", "09:40", "10:30"),
    ];

    const plan = planTimeslotRowRepair(existing, generated);

    expect(plan.missingInDb).toEqual([]);
    expect(plan.extraInDb).toEqual([]);
    expect(plan.unchanged).toBe(2);
    expect(plan.updates).toEqual([
      {
        TimeslotID: "1-2568-MON3",
        from: { StartTime: "09:50", EndTime: "10:40" },
        to: { StartTime: "09:40", EndTime: "10:30" },
        data: { StartTime: t("09:40"), EndTime: t("10:30") },
      },
    ]);
  });

  it("ignores the date part of Time column values (seeds used 2024/2025 dates)", () => {
    const existing = [
      { TimeslotID: "1-2568-MON1", StartTime: new Date("2025-01-01T08:00:00.000Z"), EndTime: new Date("2025-01-01T08:50:00.000Z") },
    ];
    const generated = [
      { TimeslotID: "1-2568-MON1", StartTime: new Date("2024-01-01T08:00:00.000Z"), EndTime: new Date("2024-01-01T08:50:00.000Z") },
    ];

    const plan = planTimeslotRowRepair(existing, generated);

    expect(plan.updates).toEqual([]);
    expect(plan.unchanged).toBe(1);
  });

  it("flags a uniform whole-hour shift across every update (rows written under another TZ)", () => {
    const existing = [
      row("1-2568-MON1", "01:30", "02:20"),
      row("1-2568-MON2", "02:20", "03:10"),
    ];
    const generated = [
      row("1-2568-MON1", "08:30", "09:20"),
      row("1-2568-MON2", "09:20", "10:10"),
    ];

    expect(planTimeslotRowRepair(existing, generated).uniformShiftMinutes).toBe(420);
  });

  it("leaves uniformShiftMinutes null when updates differ in size or there are none", () => {
    const existing = [
      row("1-2568-MON1", "08:00", "08:50"),
      row("1-2568-MON2", "08:50", "09:40"),
      row("1-2568-MON3", "09:50", "10:40"),
    ];
    const generated = [
      row("1-2568-MON1", "08:30", "09:20"),
      row("1-2568-MON2", "09:20", "10:10"),
      row("1-2568-MON3", "10:10", "11:00"),
    ];

    expect(planTimeslotRowRepair(existing, generated).uniformShiftMinutes).toBeNull();
    expect(planTimeslotRowRepair(existing, existing).uniformShiftMinutes).toBeNull();
  });

  it("reports the largest move in minutes so multi-hour TZ artefacts can be caught even when bell times also changed", () => {
    const existing = [row("1-2568-MON1", "01:00", "01:50"), row("1-2568-MON2", "01:50", "02:40")];
    const generated = [row("1-2568-MON1", "08:30", "09:20"), row("1-2568-MON2", "09:20", "10:10")];

    const plan = planTimeslotRowRepair(existing, generated);

    expect(plan.uniformShiftMinutes).toBeNull();
    expect(plan.maxShiftMinutes).toBe(450);
  });

  it("measures a backward move by its real size, not the wrap-around", () => {
    const existing = [row("1-2568-MON1", "08:30", "09:20")];
    const generated = [row("1-2568-MON1", "08:00", "08:50")];

    expect(planTimeslotRowRepair(existing, generated).maxShiftMinutes).toBe(30);
  });

  it("reports ids that exist only on one side so the caller can abort", () => {
    const existing = [row("1-2568-MON1", "08:00", "08:50"), row("1-2568-MON9", "14:00", "14:50")];
    const generated = [row("1-2568-MON1", "08:00", "08:50"), row("1-2568-MON2", "08:50", "09:40")];

    const plan = planTimeslotRowRepair(existing, generated);

    expect(plan.missingInDb).toEqual(["1-2568-MON2"]);
    expect(plan.extraInDb).toEqual(["1-2568-MON9"]);
    expect(plan.updates).toEqual([]);
    expect(plan.unchanged).toBe(1);
  });
});

describe("planSlotNumberRemap", () => {
  it("shifts old periods past each inserted slot, keeping their order", () => {
    expect(planSlotNumberRemap(8, 9, [2])).toEqual(
      new Map([[1, 1], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]]),
    );
  });

  it("handles insertions at both ends", () => {
    expect(planSlotNumberRemap(3, 5, [1, 5])).toEqual(new Map([[1, 2], [2, 3], [3, 4]]));
  });

  it("is the identity when nothing is inserted", () => {
    expect(planSlotNumberRemap(3, 3, [])).toEqual(new Map([[1, 1], [2, 2], [3, 3]]));
  });

  it("rejects counts that do not add up or inserted slots out of range / duplicated", () => {
    expect(() => planSlotNumberRemap(8, 9, [])).toThrow(/8 old \+ 0 inserted ≠ 9 new/);
    expect(() => planSlotNumberRemap(8, 9, [10])).toThrow(/out of range/);
    expect(() => planSlotNumberRemap(8, 10, [2, 2])).toThrow(/duplicate/);
  });
});

describe("remapTimeslotIdWith", () => {
  const map = planSlotNumberRemap(8, 9, [2]);

  it("rewrites the trailing period number and keeps the term/day prefix", () => {
    expect(remapTimeslotIdWith("1-2568-MON1", map)).toBe("1-2568-MON1");
    expect(remapTimeslotIdWith("1-2568-TUE4", map)).toBe("1-2568-TUE5");
    expect(remapTimeslotIdWith("1-2568-FRI8", map)).toBe("1-2568-FRI9");
  });

  it("throws on ids that do not parse or periods outside the map", () => {
    expect(() => remapTimeslotIdWith("garbage", map)).toThrow(/not a TimeslotID/);
    expect(() => remapTimeslotIdWith("1-2568-MON9", map)).toThrow(/period 9/);
  });
});
