import type { SlotConfig } from "../models/break.types";

type OldConfig = {
  Duration: number;
  TimeslotPerDay: number;
  breakDefinitions?: { slotNumber: number; duration: number; groups: string[] }[];
};

/** Convert legacy { Duration, TimeslotPerDay, breakDefinitions } to slots[].
 *  breakDefinition.slotNumber is the 1-based absolute position in the merged
 *  (teaching + break) output sequence where that break slot appears. Before
 *  emitting teaching period P, all breaks whose slotNumber falls at or before
 *  the current merged-sequence position are flushed first.
 */
export function configToSlots(old: OldConfig): SlotConfig[] {
  const breaksBySlot = new Map<number, { duration: number; groups: string[] }[]>();
  for (const b of old.breakDefinitions ?? []) {
    const arr = breaksBySlot.get(b.slotNumber) ?? [];
    arr.push({ duration: b.duration, groups: b.groups });
    breaksBySlot.set(b.slotNumber, arr);
  }
  const slots: SlotConfig[] = [];
  for (let period = 1; period <= old.TimeslotPerDay; period++) {
    for (const brk of breaksBySlot.get(period) ?? []) {
      slots.push({ duration: brk.duration, breakGroups: brk.groups });
    }
    slots.push({ duration: old.Duration });
  }
  return slots;
}

/** Remap an old teaching-period TimeslotID to its new slot index, given the old break slotNumbers. */
export function remapTimeslotId(oldId: string, breakSlotNumbers: number[]): string {
  const m = oldId.match(/^(.*?(?:MON|TUE|WED|THU|FRI|SAT|SUN))(\d+)$/);
  if (!m) return oldId;
  const period = Number(m[2]);
  const shift = breakSlotNumbers.filter((s) => s <= period).length;
  return `${m[1]}${period + shift}`;
}
