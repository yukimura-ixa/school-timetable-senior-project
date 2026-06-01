import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";
import type { timeslot } from "@/prisma/generated/client";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";
import { isBreakForGrade, isBreakForTeacher } from "@/utils/break-utils";

export type RenderedRow =
  | { kind: "teaching"; period: number; slotNumber: number; slots: timeslot[] }
  | { kind: "break"; slotNumber: number; defs: BreakDefinition[] };

export type ViewMode =
  | { mode: "teacher" }
  | { mode: "class"; gradeId: string; groupNames: string[] }
  | { mode: "all" };

/**
 * Merges sorted teaching timeslots with break definitions into ordered rows
 * for grid rendering. Period numbers count teaching slots only — break rows
 * get no period number.
 *
 * View modes:
 * - teacher: only universal ("*") breaks are shown as labeled rows
 * - class:   only breaks whose group matches the grade tier are shown
 * - all:     every distinct definition is shown, merged when slotNumber overlaps
 *
 * Legacy fallback: when breakDefinitions is empty, any timeslot with
 * Breaktime != NOT_BREAK collapses into a single generic "พัก" row at
 * its slotNumber.
 */
export function buildGridRows(
  timeslots: timeslot[],
  breakDefs: BreakDefinition[],
  view: ViewMode,
): RenderedRow[] {
  // Group teaching slots by slotNumber (one row per slot, one cell per day)
  const teachingBySlot = new Map<number, timeslot[]>();
  // Legacy-fallback break slot numbers
  const legacyBreakSlotNumbers = new Set<number>();

  for (const t of timeslots) {
    const slotNum = extractPeriodFromTimeslotId(t.TimeslotID);
    if (t.Breaktime === "NOT_BREAK") {
      const arr = teachingBySlot.get(slotNum) ?? [];
      arr.push(t);
      teachingBySlot.set(slotNum, arr);
    } else if (breakDefs.length === 0) {
      legacyBreakSlotNumbers.add(slotNum);
    }
  }

  // Pick applicable break definitions for this view
  const applicable = pickApplicable(breakDefs, view);
  const breaksBySlot = new Map<number, BreakDefinition[]>();
  for (const def of applicable) {
    const arr = breaksBySlot.get(def.slotNumber) ?? [];
    arr.push(def);
    breaksBySlot.set(def.slotNumber, arr);
  }

  // Legacy fallback: synthesize a "พัก" definition per legacy slot
  if (breakDefs.length === 0) {
    for (const slotNum of legacyBreakSlotNumbers) {
      breaksBySlot.set(slotNum, [
        {
          id: `legacy-${slotNum}`,
          label: "พัก",
          slotNumber: slotNum,
          duration: 0,
          color: "#9E9E9E",
          groups: ["*"],
        },
      ]);
    }
  }

  // Build a sorted union of slot numbers and walk them in order
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

/**
 * Filters break definitions to those applicable to the view, delegating
 * the per-def applicability check to the canonical helpers in
 * `src/utils/break-utils.ts` (spec §4.3: single source of truth — do not
 * write parallel break-detection logic). Each helper is called with a
 * synthetic `"BREAK"` breaktime and a singleton `[def]` so the helper
 * answers "is this one definition applicable here?".
 */
function pickApplicable(defs: BreakDefinition[], view: ViewMode): BreakDefinition[] {
  if (view.mode === "all") return defs;
  if (view.mode === "teacher") {
    return defs.filter((d) => isBreakForTeacher("BREAK", d.slotNumber, [d]));
  }
  const index = new Map<string, Set<string>>([[view.gradeId, new Set(view.groupNames)]]);
  return defs.filter((d) => isBreakForGrade(d.slotNumber, view.gradeId, [d], index));
}
