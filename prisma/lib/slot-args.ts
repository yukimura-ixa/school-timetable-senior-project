/**
 * Shared CLI helpers for the timeslot maintenance scripts
 * (repair-timeslot-rows.ts, remap-timeslot-slots.ts).
 *
 * Slot tokens: <minutes> (teaching) or <minutes>:<group>[+<group>] where group
 * is a break_group.Name for the config, or * for a universal break.
 * Shorthands: j = junior, s = senior.
 */

import type { SlotConfig } from "../../src/features/timeslot/domain/models/break.types";

const GROUP_SHORTHAND: Record<string, string> = { j: "junior", s: "senior" };

export function parseSlots(raw: string): SlotConfig[] {
  return raw.split(",").map((token) => {
    const [minutes, groups] = token.trim().split(":");
    const duration = Number(minutes);
    if (!Number.isInteger(duration) || duration <= 0) {
      throw new Error(`Bad slot token "${token}": minutes must be a positive integer`);
    }
    if (!groups) return { duration };
    const breakGroups = groups.split("+").map((g) => GROUP_SHORTHAND[g] ?? g);
    return { duration, breakGroups };
  });
}

export function parseIntList(raw: string, flag: string): number[] {
  return raw.split(",").map((t) => {
    const n = Number(t.trim());
    if (!Number.isInteger(n) || n < 1) throw new Error(`${flag}: "${t}" is not a positive integer`);
    return n;
  });
}

export function assertClock(value: string | undefined, flag: string): void {
  if (value !== undefined && !/^\d{2}:\d{2}$/.test(value)) {
    throw new Error(`${flag} must be HH:MM, got "${value}"`);
  }
}

export function describeSlots(slots: SlotConfig[]): string {
  return slots
    .map((s, i) => {
      const bg = s.breakGroups?.length ? `:${s.breakGroups.join("+")}` : "";
      return `${i + 1}=${s.duration}${bg}`;
    })
    .join("  ");
}
