import { describe, expect, it } from "vitest";
import { buildGridRows } from "./break-rows";
import type { SlotConfig, BreakGroup } from "@/features/timeslot/domain/models/break.types";
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

// SlotConfig array: slots 1–6, breaks at slot 3 (universal), slot 4 (junior), slot 5 (senior)
const slots: SlotConfig[] = [
  { duration: 50 },                          // slot 1 — teaching
  { duration: 50 },                          // slot 2 — teaching
  { duration: 10, breakGroups: ["*"] },      // slot 3 — universal break (morning)
  { duration: 50, breakGroups: ["junior"] }, // slot 4 — junior break
  { duration: 50, breakGroups: ["senior"] }, // slot 5 — senior break
  { duration: 50 },                          // slot 6 — teaching
];

const breakGroups: BreakGroup[] = [
  { name: "junior", label: "พักเที่ยง ม.ต้น", color: "#4CAF50", gradeIds: ["M1-1", "M2-1"] },
  { name: "senior", label: "พักเที่ยง ม.ปลาย", color: "#2196F3", gradeIds: ["M5-1", "M6-1"] },
];

describe("buildGridRows", () => {
  const timeslots = [1, 2, 3, 4, 5, 6].flatMap((p) => [ts(p, "MON"), ts(p, "TUE")]);

  it("teaching view: renumbers periods skipping universal break", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, { mode: "teacher" });
    const periods = rows.filter((r) => r.kind === "teaching").map((r) => (r as any).period);
    // Only universal break (slot 3) shows; teaching slots are 1,2,4,5,6 → periods 1–5
    // Wait — teacher view: slot 3 is break, slots 1,2,4,5,6 are teaching
    // But slots 4 and 5 are grade-specific breaks — teacher sees them as teaching slots
    expect(periods).toEqual([1, 2, 3, 4, 5]);
    const breakRows = rows.filter((r) => r.kind === "break");
    expect(breakRows).toHaveLength(1);
    // The universal break is slot 3
    expect((breakRows[0] as any).slotNumber).toBe(3);
  });

  it("class view junior grade: shows junior break + universal break, hides senior break", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, {
      mode: "class",
      gradeId: "M1-1",
      groupNames: ["junior"],
    });
    const breakSlots = rows
      .filter((r) => r.kind === "break")
      .map((r) => (r as any).slotNumber);
    expect(breakSlots).toEqual([3, 4]); // slot 3 = universal (*), slot 4 = junior
    // slot 5 (senior) NOT shown
  });

  it("class view junior grade: break row defs carry resolved label and color", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, {
      mode: "class",
      gradeId: "M1-1",
      groupNames: ["junior"],
    });
    const juniorBreak = rows.find(
      (r) => r.kind === "break" && (r as any).slotNumber === 4,
    ) as any;
    expect(juniorBreak).toBeDefined();
    expect(juniorBreak.defs[0].label).toBe("พักเที่ยง ม.ต้น");
    expect(juniorBreak.defs[0].color).toBe("#4CAF50");
  });

  it("class view junior grade: universal break row uses generic label and color", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, {
      mode: "class",
      gradeId: "M1-1",
      groupNames: ["junior"],
    });
    const universalBreak = rows.find(
      (r) => r.kind === "break" && (r as any).slotNumber === 3,
    ) as any;
    expect(universalBreak).toBeDefined();
    expect(universalBreak.defs[0].label).toBe("พัก");
    expect(universalBreak.defs[0].color).toBe("#9E9E9E");
  });

  it("class view senior grade: shows senior break + universal, hides junior break", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, {
      mode: "class",
      gradeId: "M5-1",
      groupNames: ["senior"],
    });
    const breakSlots = rows
      .filter((r) => r.kind === "break")
      .map((r) => (r as any).slotNumber);
    expect(breakSlots).toEqual([3, 5]); // slot 3 universal, slot 5 senior
    // slot 4 (junior) NOT shown
  });

  it("class view senior grade: break row label/color resolved from BreakGroup", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, {
      mode: "class",
      gradeId: "M5-1",
      groupNames: ["senior"],
    });
    const seniorBreak = rows.find(
      (r) => r.kind === "break" && (r as any).slotNumber === 5,
    ) as any;
    expect(seniorBreak.defs[0].label).toBe("พักเที่ยง ม.ปลาย");
    expect(seniorBreak.defs[0].color).toBe("#2196F3");
  });

  it("teacher view: only universal break shown, grade-specific breaks hidden", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, { mode: "teacher" });
    const breakSlots = rows
      .filter((r) => r.kind === "break")
      .map((r) => (r as any).slotNumber);
    expect(breakSlots).toEqual([3]); // only universal break at slot 3
  });

  it("teacher view: universal break row carries generic label and neutral color", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, { mode: "teacher" });
    const breakRow = rows.find((r) => r.kind === "break") as any;
    expect(breakRow.defs[0].label).toBe("พัก");
    expect(breakRow.defs[0].color).toBe("#9E9E9E");
  });

  it("all view: every break slot shown in slotNumber order", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, { mode: "all" });
    const breakSlots = rows
      .filter((r) => r.kind === "break")
      .map((r) => (r as any).slotNumber);
    expect(breakSlots).toEqual([3, 4, 5]);
  });

  it("all view: grade-specific break rows carry correct label/color from BreakGroup", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, { mode: "all" });
    const breakRows = rows.filter((r) => r.kind === "break") as any[];
    // slot 4 = junior
    expect(breakRows[1]!.defs[0].label).toBe("พักเที่ยง ม.ต้น");
    expect(breakRows[1]!.defs[0].color).toBe("#4CAF50");
    // slot 5 = senior
    expect(breakRows[2]!.defs[0].label).toBe("พักเที่ยง ม.ปลาย");
    expect(breakRows[2]!.defs[0].color).toBe("#2196F3");
  });

  it("break rows carry the slot's timeslots so the header can show its time", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, {
      mode: "class",
      gradeId: "M1-1",
      groupNames: ["junior"],
    });
    const universalBreak = rows.find(
      (r) => r.kind === "break" && (r as any).slotNumber === 3,
    ) as any;
    expect(universalBreak.slots).toHaveLength(2); // MON + TUE
    expect(
      universalBreak.slots.every((t: any) => t.TimeslotID.endsWith("-3")),
    ).toBe(true);
  });

  it("teaching period count excludes break slots", () => {
    // slots 1,2 teaching | slot 3 break | slots 4,5 break | slot 6 teaching
    // class view junior: breaks at 3,4 → teaching slots 1,2,5,6 → periods 1,2,3,4
    const rows = buildGridRows(timeslots, slots, breakGroups, {
      mode: "class",
      gradeId: "M1-1",
      groupNames: ["junior"],
    });
    const periods = rows
      .filter((r) => r.kind === "teaching")
      .map((r) => (r as any).period);
    expect(periods).toEqual([1, 2, 3, 4]);
  });
});

// Pre-Phase-2A terms (prod 1-2568) still carry the legacy per-group enums on
// the DB rows themselves: every slot-4 row is BREAK_JUNIOR, every slot-5 row
// is BREAK_SENIOR, slot-3 rows are BREAK. Only universal breaks may remove a
// slot from the teaching rows — the non-owning group is taught during a
// staggered break and has real classes scheduled there.
describe("buildGridRows with legacy Breaktime enums on rows", () => {
  const legacyBreak = (p: number) =>
    p === 3 ? "BREAK" : p === 4 ? "BREAK_JUNIOR" : p === 5 ? "BREAK_SENIOR" : "NOT_BREAK";
  const timeslots = [1, 2, 3, 4, 5, 6].flatMap((p) => [
    ts(p, "MON", legacyBreak(p)),
    ts(p, "TUE", legacyBreak(p)),
  ]);
  const teachingSlots = (rows: ReturnType<typeof buildGridRows>) =>
    rows.filter((r) => r.kind === "teaching").map((r) => (r as any).slotNumber);
  const breakSlots = (rows: ReturnType<typeof buildGridRows>) =>
    rows.filter((r) => r.kind === "break").map((r) => (r as any).slotNumber);

  it("junior class view keeps the senior-break slot as a teaching row", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, {
      mode: "class",
      gradeId: "M1-1",
      groupNames: ["junior"],
    });
    expect(breakSlots(rows)).toEqual([3, 4]);
    expect(teachingSlots(rows)).toEqual([1, 2, 5, 6]);
    const slot5 = rows.find((r) => r.kind === "teaching" && (r as any).slotNumber === 5) as any;
    expect(slot5.slots.map((t: timeslot) => t.Breaktime)).toEqual(["BREAK_SENIOR", "BREAK_SENIOR"]);
  });

  it("senior class view keeps the junior-break slot as a teaching row", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, {
      mode: "class",
      gradeId: "M5-1",
      groupNames: ["senior"],
    });
    expect(breakSlots(rows)).toEqual([3, 5]);
    expect(teachingSlots(rows)).toEqual([1, 2, 4, 6]);
  });

  it("teacher view treats both staggered slots as teaching", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, { mode: "teacher" });
    expect(breakSlots(rows)).toEqual([3]);
    expect(teachingSlots(rows)).toEqual([1, 2, 4, 5, 6]);
  });

  it("all view shows every break and no extra teaching rows", () => {
    const rows = buildGridRows(timeslots, slots, breakGroups, { mode: "all" });
    expect(breakSlots(rows)).toEqual([3, 4, 5]);
    expect(teachingSlots(rows)).toEqual([1, 2, 6]);
  });

  it("universal BREAK / BREAK_BOTH rows never become teaching rows", () => {
    const universal = [1, 2, 3].flatMap((p) => [
      ts(p, "MON", p === 1 ? "NOT_BREAK" : p === 2 ? "BREAK" : "BREAK_BOTH"),
    ]);
    const rows = buildGridRows(universal, [{ duration: 50 }, { duration: 50 }, { duration: 50 }], [], {
      mode: "teacher",
    });
    expect(teachingSlots(rows)).toEqual([1]);
    expect(breakSlots(rows)).toEqual([]);
  });
});
