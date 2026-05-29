import { describe, expect, it } from "vitest";
import { buildGridRows } from "./break-rows";
import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
import type { timeslot } from "@/prisma/generated/client";

function ts(period: number, day: "MON" | "TUE", brk: string = "NOT_BREAK"): timeslot {
  return {
    TimeslotID: `1-2567-${day}-${period}`,
    AcademicYear: 2567,
    Semester: "SEMESTER_1",
    StartTime: new Date(`1970-01-01T0${7 + period}:00:00Z`),
    EndTime: new Date(`1970-01-01T0${8 + period}:00:00Z`),
    Breaktime: brk as any,
    DayOfWeek: day,
  };
}

const junior: BreakDefinition = {
  id: "lunch-junior",
  label: "พักเที่ยง ม.ต้น",
  slotNumber: 4,
  duration: 50,
  color: "#4CAF50",
  groups: ["junior"],
};

const senior: BreakDefinition = {
  id: "lunch-senior",
  label: "พักเที่ยง ม.ปลาย",
  slotNumber: 5,
  duration: 50,
  color: "#2196F3",
  groups: ["senior"],
};

const morning: BreakDefinition = {
  id: "morning",
  label: "พักเช้า",
  slotNumber: 3,
  duration: 10,
  color: "#FF9800",
  groups: ["*"],
};

describe("buildGridRows", () => {
  const slots = [1, 2, 3, 4, 5, 6].flatMap((p) => [ts(p, "MON"), ts(p, "TUE")]);

  it("teaching view: renumbers periods skipping universal break", () => {
    const rows = buildGridRows(slots, [morning], { mode: "teacher" });
    const periods = rows.filter((r) => r.kind === "teaching").map((r) => (r as any).period);
    expect(periods).toEqual([1, 2, 3, 4, 5, 6]);
    const breakIndices = rows.map((r, i) => (r.kind === "break" ? i : -1)).filter((i) => i >= 0);
    expect(breakIndices).toHaveLength(1);
    // Break sits before what becomes period 3 (slotNumber 3)
    expect(rows[breakIndices[0]! - 1]?.kind).toBe("teaching");
  });

  it("class view ม.1: shows junior break, hides senior break", () => {
    const rows = buildGridRows(slots, [junior, senior], {
      mode: "class",
      gradeId: "M1-1",
      gradeLevel: 1,
    });
    const labels = rows
      .filter((r) => r.kind === "break")
      .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
    expect(labels).toEqual(["lunch-junior"]);
  });

  it("class view ม.5: shows senior break, hides junior break", () => {
    const rows = buildGridRows(slots, [junior, senior], {
      mode: "class",
      gradeId: "M5-1",
      gradeLevel: 5,
    });
    const labels = rows
      .filter((r) => r.kind === "break")
      .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
    expect(labels).toEqual(["lunch-senior"]);
  });

  it("teacher view: hides grade-specific breaks, shows universal", () => {
    const rows = buildGridRows(slots, [junior, senior, morning], { mode: "teacher" });
    const ids = rows
      .filter((r) => r.kind === "break")
      .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
    expect(ids).toEqual(["morning"]);
  });

  it("all view: shows every distinct definition in slotNumber order", () => {
    const rows = buildGridRows(slots, [senior, junior, morning], { mode: "all" });
    const order = rows
      .filter((r) => r.kind === "break")
      .flatMap((r) => (r as any).defs.map((d: BreakDefinition) => d.id));
    expect(order).toEqual(["morning", "lunch-junior", "lunch-senior"]);
  });

  it("all view: merges definitions that share the same slotNumber", () => {
    const overlap: BreakDefinition = { ...senior, slotNumber: 4, id: "senior-merge" };
    const rows = buildGridRows(slots, [junior, overlap], { mode: "all" });
    const breakRows = rows.filter((r) => r.kind === "break") as any[];
    expect(breakRows).toHaveLength(1);
    expect(breakRows[0]!.defs.map((d: BreakDefinition) => d.id).sort()).toEqual([
      "lunch-junior",
      "senior-merge",
    ]);
  });

  it("legacy fallback: no breakDefinitions => generic break row from Breaktime enum", () => {
    const slotsWithLegacy = [
      ts(1, "MON"),
      ts(2, "MON"),
      ts(3, "MON", "BREAK_JUNIOR"),
      ts(4, "MON"),
      ts(1, "TUE"),
      ts(2, "TUE"),
      ts(3, "TUE", "BREAK_JUNIOR"),
      ts(4, "TUE"),
    ];
    const rows = buildGridRows(slotsWithLegacy, [], { mode: "class", gradeId: "M1-1", gradeLevel: 1 });
    const breakRows = rows.filter((r) => r.kind === "break") as any[];
    expect(breakRows).toHaveLength(1);
    expect(breakRows[0]!.defs[0]!.label).toBe("พัก");
    const periods = rows.filter((r) => r.kind === "teaching").map((r) => (r as any).period);
    expect(periods).toEqual([1, 2, 3]); // 3 teaching periods (slot 3 was break)
  });
});
