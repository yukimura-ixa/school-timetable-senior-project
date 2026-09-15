/**
 * Plans an in-place repair of timeslot rows whose StartTime/EndTime drifted
 * from what table_config.Config would generate. TimeslotIDs are preserved so
 * class_schedule / teachers_responsibility rows keep pointing at the same
 * slots. Breaktime is deliberately NOT part of the plan — several consumers
 * still read the legacy BREAK_JUNIOR / BREAK_SENIOR enums off the rows.
 */

export type TimeslotTimeRow = {
  TimeslotID: string;
  StartTime: Date;
  EndTime: Date;
};

export type TimeslotRowUpdate = {
  TimeslotID: string;
  from: { StartTime: string; EndTime: string };
  to: { StartTime: string; EndTime: string };
  data: { StartTime: Date; EndTime: Date };
};

export type TimeslotRepairPlan = {
  updates: TimeslotRowUpdate[];
  unchanged: number;
  /** generated ids with no DB row — the config has more slots than the term */
  missingInDb: string[];
  /** DB ids the config does not generate — the term has more slots than the config */
  extraInDb: string[];
  /**
   * Set when every update moves both ends by the same whole number of hours.
   * That pattern means the rows were written under a different process TZ
   * (e.g. seeded from a Bangkok machine) rather than a real bell-time change.
   */
  uniformShiftMinutes: number | null;
  /** Largest move of either end, measured as the shortest distance on the 24h clock; 0 when none. */
  maxShiftMinutes: number;
};

const MINUTES_IN_DAY = 24 * 60;

function clockMinutes(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function shiftMinutes(from: string, to: string): number {
  return (clockMinutes(to) - clockMinutes(from) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
}

/** Shortest distance between two clocks on the 24h circle (direction-agnostic). */
export function clockDistance(from: string, to: string): number {
  const forward = shiftMinutes(from, to);
  return Math.min(forward, MINUTES_IN_DAY - forward);
}

function detectUniformShift(updates: TimeslotRowUpdate[]): number | null {
  const first = updates[0];
  if (!first) return null;
  const shift = shiftMinutes(first.from.StartTime, first.to.StartTime);
  if (shift === 0 || shift % 60 !== 0) return null;
  const uniform = updates.every(
    (u) =>
      shiftMinutes(u.from.StartTime, u.to.StartTime) === shift &&
      shiftMinutes(u.from.EndTime, u.to.EndTime) === shift,
  );
  return uniform ? shift : null;
}

/** `@db.Time(0)` values come back as 1970-01-01THH:MM:SSZ; only the UTC clock matters. */
export function utcClock(value: Date): string {
  return value.toISOString().slice(11, 16);
}

export function planTimeslotRowRepair(
  existing: TimeslotTimeRow[],
  generated: TimeslotTimeRow[],
): TimeslotRepairPlan {
  const existingById = new Map(existing.map((r) => [r.TimeslotID, r]));
  const generatedIds = new Set(generated.map((r) => r.TimeslotID));

  const updates: TimeslotRowUpdate[] = [];
  const missingInDb: string[] = [];
  let unchanged = 0;

  for (const next of generated) {
    const current = existingById.get(next.TimeslotID);
    if (!current) {
      missingInDb.push(next.TimeslotID);
      continue;
    }
    const from = { StartTime: utcClock(current.StartTime), EndTime: utcClock(current.EndTime) };
    const to = { StartTime: utcClock(next.StartTime), EndTime: utcClock(next.EndTime) };
    if (from.StartTime === to.StartTime && from.EndTime === to.EndTime) {
      unchanged++;
      continue;
    }
    updates.push({
      TimeslotID: next.TimeslotID,
      from,
      to,
      data: { StartTime: next.StartTime, EndTime: next.EndTime },
    });
  }

  const extraInDb = existing
    .map((r) => r.TimeslotID)
    .filter((id) => !generatedIds.has(id));

  return {
    updates,
    unchanged,
    missingInDb,
    extraInDb,
    uniformShiftMinutes: detectUniformShift(updates),
    maxShiftMinutes: updates.reduce(
      (max, u) =>
        Math.max(
          max,
          clockDistance(u.from.StartTime, u.to.StartTime),
          clockDistance(u.from.EndTime, u.to.EndTime),
        ),
      0,
    ),
  };
}

/**
 * Old period number → new period number when `insertedSlots` (1-based, in the
 * NEW numbering) are added to a term's slot list. Old periods keep their order
 * and fill the non-inserted new positions, so every existing class_schedule
 * row has exactly one destination and inserted slots receive nothing.
 */
export function planSlotNumberRemap(
  oldSlotCount: number,
  newSlotCount: number,
  insertedSlots: number[],
): Map<number, number> {
  if (oldSlotCount + insertedSlots.length !== newSlotCount) {
    throw new Error(
      `${oldSlotCount} old + ${insertedSlots.length} inserted ≠ ${newSlotCount} new slots`,
    );
  }
  const inserted = new Set<number>();
  for (const n of insertedSlots) {
    if (!Number.isInteger(n) || n < 1 || n > newSlotCount) {
      throw new Error(`inserted slot ${n} out of range 1..${newSlotCount}`);
    }
    if (inserted.has(n)) throw new Error(`duplicate inserted slot ${n}`);
    inserted.add(n);
  }
  const map = new Map<number, number>();
  let oldPeriod = 1;
  for (let newPeriod = 1; newPeriod <= newSlotCount; newPeriod++) {
    if (inserted.has(newPeriod)) continue;
    map.set(oldPeriod++, newPeriod);
  }
  return map;
}

const TIMESLOT_ID_RE = /^(.*?(?:MON|TUE|WED|THU|FRI|SAT|SUN))(\d+)$/;

export function remapTimeslotIdWith(id: string, map: Map<number, number>): string {
  const m = id.match(TIMESLOT_ID_RE);
  if (!m) throw new Error(`"${id}" is not a TimeslotID`);
  const period = Number(m[2]);
  const next = map.get(period);
  if (next === undefined) throw new Error(`"${id}": period ${period} has no mapping`);
  return `${m[1]}${next}`;
}
