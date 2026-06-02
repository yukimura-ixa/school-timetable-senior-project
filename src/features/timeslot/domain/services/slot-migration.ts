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
  // Sort breaks by slotNumber so we can consume them in order.
  const pending = [...(old.breakDefinitions ?? [])].sort(
    (a, b) => a.slotNumber - b.slotNumber,
  );
  const slots: SlotConfig[] = [];
  let breakOffset = 0; // how many break slots have been emitted so far

  for (let period = 1; period <= old.TimeslotPerDay; period++) {
    // The merged-sequence position where this teaching period will land
    // (accounting for breaks already emitted).
    const teachingPos = period + breakOffset;
    // Flush every pending break whose absolute merged position <= teachingPos.
    while (pending.length > 0 && pending[0]!.slotNumber <= teachingPos) {
      const brk = pending.shift()!;
      slots.push({ duration: brk.duration, breakGroups: brk.groups });
      breakOffset++;
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
