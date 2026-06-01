import type { SlotConfig, BreakGroup } from "@/features/timeslot/domain/models/break.types";

export function buildGradeGroupIndex(groups: BreakGroup[]): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const g of groups) {
    for (const gradeId of g.gradeIds) {
      const set = index.get(gradeId) ?? new Set<string>();
      set.add(g.name);
      index.set(gradeId, set);
    }
  }
  return index;
}

/**
 * Whether a break definition applies to a specific grade at a slot.
 * Membership comes from the resolved grade→group index (built from the
 * break_group_grade DB assignments), NOT hardcoded grade-level tiers.
 * A definition applies when its groups include "*" or intersect the grade's groups.
 */
export function isBreakForGrade(
  slotNumber: number,
  gradeId: string,
  slots: SlotConfig[],
  index: Map<string, Set<string>>,
): boolean {
  const bg = slots[slotNumber - 1]?.breakGroups;
  if (!bg || bg.length === 0) return false;
  if (bg.includes("*")) return true;
  const groups = index.get(gradeId);
  return !!groups && bg.some((name) => groups.has(name));
}

/**
 * Checks if a slot is a break for a teacher. 
 * Teachers have a break if all groups they teach or all students have a break, or typically 
 * for teachers, we check if they have a scheduled class. If not, it's their free time, but 
 * the "break slot" UI highlighting is usually shown if it's BREAK_BOTH or if they don't have a class.
 */
export function isBreakForTeacher(slotNumber: number, slots: SlotConfig[]): boolean {
  const bg = slots[slotNumber - 1]?.breakGroups;
  return !!bg && bg.includes("*");
}

/**
 * Whether a timeslot is a break slot of ANY kind, without grade/teacher
 * scoping. For aggregate views (e.g. the all-teacher summary matrix) that only
 * need "is this a break column?" rather than "is it a break for this grade?".
 *
 * V2-aware: a break definition at this slotNumber marks it a break. Falls back
 * to the Breaktime enum (legacy BREAK_JUNIOR/SENIOR/BOTH and v2 BREAK all count;
 * only NOT_BREAK is teaching). Returns a superset of the raw-enum check, so it
 * never drops a break that the enum already marks.
 */
export function isBreakSlot(slotNumber: number, slots: SlotConfig[]): boolean {
  const bg = slots[slotNumber - 1]?.breakGroups;
  return !!bg && bg.length > 0;
}
