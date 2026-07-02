import { formatPeriodTime } from "../../arrange/_lib/grid-format";

/** Minimal shape of a timeslot row needed to summarize the period layout. */
export type TimeslotRow = {
  DayOfWeek: string;
  StartTime: string | Date;
  EndTime: string | Date;
};

export type TimeslotSummary = {
  periodCount: number;
  durations: number[];
  startTime: string;
  days: string[];
};

// Chronological week order; timeslot rows arrive sorted by DayOfWeek ASC
// (alphabetical), so we re-sort distinct days into a human-facing order.
const WEEK_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function toMs(value: string | Date): number {
  return (typeof value === "string" ? new Date(value) : value).getTime();
}

/**
 * Derive the config summary (periods/day, durations, start time, days) from the
 * canonical timeslot rows — the same store the arrange grid renders — so the
 * summary can never disagree with the grid.
 */
export function deriveTimeslotSummary(
  timeslots: TimeslotRow[],
): TimeslotSummary | null {
  if (timeslots.length === 0) return null;

  const days = [...new Set(timeslots.map((t) => t.DayOfWeek))].sort((a, b) => {
    const ia = WEEK_ORDER.indexOf(a);
    const ib = WEEK_ORDER.indexOf(b);
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
  });

  const representativeDay = days[0];
  const dayRows = timeslots
    .filter((t) => t.DayOfWeek === representativeDay)
    .sort((a, b) => toMs(a.StartTime) - toMs(b.StartTime));

  return {
    periodCount: dayRows.length,
    durations: dayRows.map((t) => Math.round((toMs(t.EndTime) - toMs(t.StartTime)) / 60000)),
    startTime: formatPeriodTime(dayRows[0]?.StartTime),
    days,
  };
}
