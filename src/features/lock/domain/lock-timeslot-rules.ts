/**
 * Lock timeslot selection rules.
 *
 * A lock schedule occupies a single period, or exactly two CONSECUTIVE
 * (adjacent, same-day) periods stuck together — never more, and never a
 * scatter of separate periods. See jfs.
 */

/** Parse the trailing day + period from a TimeslotID like "1-2568-MON1". */
export function parseTimeslotDayPeriod(
  timeslotId: string,
): { day: string; period: number } | null {
  const match = timeslotId.match(/([A-Z]{3})(\d+)$/);
  if (!match) return null;
  return { day: match[1]!, period: parseInt(match[2]!, 10) };
}

/**
 * Returns true when the selected timeslots form a valid lock:
 * exactly one period, or exactly two consecutive periods on the same day.
 */
export function isValidLockTimeslotSelection(timeslotIds: string[]): boolean {
  if (timeslotIds.length === 1) return true;
  if (timeslotIds.length !== 2) return false;

  const a = parseTimeslotDayPeriod(timeslotIds[0]!);
  const b = parseTimeslotDayPeriod(timeslotIds[1]!);
  if (!a || !b) return false;

  return a.day === b.day && Math.abs(a.period - b.period) === 1;
}
