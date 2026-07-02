import { describe, expect, it } from "vitest";
import { deriveTimeslotSummary } from "./derive-timeslot-summary";

// Mirrors SLOTS_2568: 10 periods/day, recess (10min) at slot 3, single lunch.
const DURATIONS = [50, 50, 10, 50, 50, 50, 50, 50, 50, 50];

/** Build timeslot rows for one day, starting 08:30, using DURATIONS. */
function dayRows(day: string): {
  DayOfWeek: string;
  StartTime: string;
  EndTime: string;
}[] {
  const rows: { DayOfWeek: string; StartTime: string; EndTime: string }[] = [];
  let start = new Date("2024-01-01T08:30:00");
  for (const duration of DURATIONS) {
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + duration);
    rows.push({
      DayOfWeek: day,
      StartTime: start.toISOString(),
      EndTime: end.toISOString(),
    });
    start = new Date(end);
  }
  return rows;
}

describe("deriveTimeslotSummary", () => {
  it("returns null for no timeslots", () => {
    expect(deriveTimeslotSummary([])).toBeNull();
  });

  it("derives period count, durations, start time, and days", () => {
    const rows = ["MON", "TUE", "WED", "THU", "FRI"].flatMap(dayRows);
    const result = deriveTimeslotSummary(rows);
    expect(result).toEqual({
      periodCount: 10,
      durations: DURATIONS,
      startTime: "08:30",
      days: ["MON", "TUE", "WED", "THU", "FRI"],
    });
  });

  it("orders days chronologically regardless of input order", () => {
    // API returns rows sorted by DayOfWeek ASC (alphabetical: FRI, MON, THU...).
    const rows = ["FRI", "MON", "THU", "TUE", "WED"].flatMap(dayRows);
    const result = deriveTimeslotSummary(rows);
    expect(result?.days).toEqual(["MON", "TUE", "WED", "THU", "FRI"]);
    expect(result?.periodCount).toBe(10);
    expect(result?.durations).toEqual(DURATIONS);
  });

  it("sorts a day's periods by start time before computing durations", () => {
    const rows = dayRows("MON");
    const shuffled = [rows[2]!, rows[0]!, rows[4]!, rows[1]!, rows[3]!, ...rows.slice(5)];
    const result = deriveTimeslotSummary(shuffled);
    expect(result?.durations).toEqual(DURATIONS);
    expect(result?.startTime).toBe("08:30");
  });
});
