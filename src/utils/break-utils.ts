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

/** A slot is a teacher break only when it is a universal ("*") recess — staggered group breaks are grade-only. */
export function isBreakForTeacher(slotNumber: number, slots: SlotConfig[]): boolean {
  const bg = slots[slotNumber - 1]?.breakGroups;
  return !!bg && bg.includes("*");
}

/** Aggregate: true for any slot that has a breakGroups entry (universal or group-specific). */
export function isBreakSlot(slotNumber: number, slots: SlotConfig[]): boolean {
  const bg = slots[slotNumber - 1]?.breakGroups;
  return !!bg && bg.length > 0;
}
