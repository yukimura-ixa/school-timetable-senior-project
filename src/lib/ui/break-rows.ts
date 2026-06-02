import type { BreakGroup, SlotConfig } from "@/features/timeslot/domain/models/break.types";
import type { timeslot } from "@/prisma/generated/client";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";
import { isBreakForGrade, isBreakForTeacher, isBreakSlot } from "@/utils/break-utils";

export type RenderedRow =
  | { kind: "teaching"; period: number; slotNumber: number; slots: timeslot[] }
  | { kind: "break"; slotNumber: number; defs: { label: string; color: string }[] };

export type ViewMode =
  | { mode: "teacher" }
  | { mode: "class"; gradeId: string; groupNames: string[] }
  | { mode: "all" };

/**
 * Merges sorted teaching timeslots with break slot config into ordered rows
 * for grid rendering. Period numbers count teaching slots only — break rows
 * get no period number.
 *
 * View modes:
 * - teacher: only universal ("*") breaks are shown as labeled rows
 * - class:   only breaks applicable to the grade are shown (universal + matching group)
 * - all:     every break slot is shown
 *
 * Break row labels/colors are resolved from the BreakGroup registry by name.
 * Universal ("*") breaks have no BreakGroup entry and use generic label "พัก".
 */
export function buildGridRows(
  timeslots: timeslot[],
  slots: SlotConfig[],
  breakGroups: BreakGroup[],
  view: ViewMode,
): RenderedRow[] {
  // Build a lookup map: group name → BreakGroup for label/color resolution
  const groupByName = new Map<string, BreakGroup>();
  for (const g of breakGroups) {
    groupByName.set(g.name, g);
  }

  // For class view, build the single-grade index inline from view.groupNames
  const gradeIndex =
    view.mode === "class"
      ? new Map<string, Set<string>>([[view.gradeId, new Set(view.groupNames)]])
      : new Map<string, Set<string>>();

  // Determine which slot numbers are break rows for this view, and resolve label/color.
  // Only slots visible as breaks for this view are excluded from teaching rows.
  const breaksBySlot = new Map<number, { label: string; color: string }[]>();
  for (let i = 0; i < slots.length; i++) {
    const slotNum = i + 1; // 1-based
    const slotCfg = slots[i]!;
    const bg = slotCfg.breakGroups;
    if (!bg || bg.length === 0) continue; // teaching slot — no breakGroups defined

    // Determine if this break is visible in the current view
    let visible = false;
    if (view.mode === "all") {
      visible = isBreakSlot(slotNum, slots);
    } else if (view.mode === "teacher") {
      visible = isBreakForTeacher(slotNum, slots);
    } else {
      visible = isBreakForGrade(slotNum, view.gradeId, slots, gradeIndex);
    }
    if (!visible) continue;

    // Resolve label/color for each group name in this slot
    const defs: { label: string; color: string }[] = bg.map((groupName) => {
      if (groupName === "*") {
        return { label: "พัก", color: "#9E9E9E" };
      }
      const g = groupByName.get(groupName);
      return g
        ? { label: g.label, color: g.color }
        : { label: "พัก", color: "#9E9E9E" };
    });

    breaksBySlot.set(slotNum, defs);
  }

  // Group teaching slots by slotNumber — a slot is a teaching row if it has
  // timeslots from DB and is NOT a break row for this view.
  const teachingBySlot = new Map<number, timeslot[]>();
  for (const t of timeslots) {
    const slotNum = extractPeriodFromTimeslotId(t.TimeslotID);
    if (t.Breaktime === "NOT_BREAK" && !breaksBySlot.has(slotNum)) {
      const arr = teachingBySlot.get(slotNum) ?? [];
      arr.push(t);
      teachingBySlot.set(slotNum, arr);
    }
  }

  // Build a sorted union of all slot numbers and walk them in order
  const allSlotNumbers = new Set<number>();
  for (const n of teachingBySlot.keys()) allSlotNumbers.add(n);
  for (const n of breaksBySlot.keys()) allSlotNumbers.add(n);
  const sorted = [...allSlotNumbers].sort((a, b) => a - b);

  const rows: RenderedRow[] = [];
  let teachingPeriod = 0;
  for (const slotNum of sorted) {
    const brks = breaksBySlot.get(slotNum);
    if (brks && brks.length > 0) {
      rows.push({ kind: "break", slotNumber: slotNum, defs: brks });
    }
    const teaching = teachingBySlot.get(slotNum);
    if (teaching && teaching.length > 0) {
      teachingPeriod += 1;
      rows.push({ kind: "teaching", period: teachingPeriod, slotNumber: slotNum, slots: teaching });
    }
  }
  return rows;
}
