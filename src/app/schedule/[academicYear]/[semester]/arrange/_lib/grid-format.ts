import type { Timeslot, ScheduleEntry } from "./teacher-schedule";

export const DAY_FULL_LABEL: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
};

export type CellKind = "break" | "drop-target" | "placed" | "empty";

export type CellState = {
  kind: CellKind;
  /** non-color cue text for empty/break/drop-target */
  label: string;
};

const LABELS: Record<CellKind, string> = {
  break: "พัก",
  "drop-target": "วางที่นี่",
  placed: "",
  empty: "คาบว่าง",
};

export function getCellState(
  timeslot: Timeslot,
  entry: ScheduleEntry | undefined,
  isOver: boolean,
): CellState {
  let kind: CellKind;
  if (timeslot.Breaktime !== "NOT_BREAK") kind = "break";
  else if (isOver) kind = "drop-target";
  else if (entry) kind = "placed";
  else kind = "empty";
  return { kind, label: LABELS[kind] };
}

export function formatPeriodTime(time: string | Date | undefined): string {
  if (!time) return "";
  const d = typeof time === "string" ? new Date(time) : time;
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
