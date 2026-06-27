import type { Timeslot, ScheduleEntry } from "./teacher-schedule";

export const DAY_FULL_LABEL: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
};

export type CellKind = "locked" | "drop-target" | "placed" | "empty";

export type CellState = {
  kind: CellKind;
  /** non-color cue text for empty/break/drop-target */
  label: string;
  lockReason?: "break" | "locked-class";
};

const LABELS: Record<CellKind, string> = {
  locked: "", // label comes from lockReason at render time
  "drop-target": "วางที่นี่",
  placed: "",
  empty: "คาบว่าง",
};

export function getCellState(
  timeslot: Timeslot,
  entry: ScheduleEntry | undefined,
  isOver: boolean,
): CellState {
  if (timeslot.Breaktime !== "NOT_BREAK") {
    return { kind: "locked", label: "พัก", lockReason: "break" };
  }
  if (entry?.IsLocked) {
    return { kind: "locked", label: "", lockReason: "locked-class" };
  }
  if (isOver) return { kind: "drop-target", label: LABELS["drop-target"] };
  if (entry) return { kind: "placed", label: LABELS.placed };
  return { kind: "empty", label: LABELS.empty };
}

// Timeslots are seeded with `new Date("YYYY-MM-DDTHH:MM:00")` (no Z), i.e.
// parsed in the write server's local zone. Read back with local getters so the
// wall-clock HH:MM roundtrips in the same deployment (dev +07 and prod UTC
// both match) — using getUTC* here showed shifted times (e.g. 01:00 for 08:30).
export function formatPeriodTime(time: string | Date | undefined): string {
  if (!time) return "";
  const d = typeof time === "string" ? new Date(time) : time;
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function formatPeriodRange(
  start: string | Date | undefined,
  end: string | Date | undefined,
): string {
  const s = formatPeriodTime(start);
  const e = formatPeriodTime(end);
  if (s && e) return `${s}–${e}`;
  return s || e || "";
}
