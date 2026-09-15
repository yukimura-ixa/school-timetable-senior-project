import type { Timeslot, ScheduleEntry } from "./teacher-schedule";
import { formatBangkokTime } from "@/utils/datetime";

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

// Timeslot times are stored as the UTC instant of the Thai wall-clock (see
// bangkokClockToTimeslotDate); format in Asia/Bangkok, never with local
// getters, so the label is the same in a +07 browser and a UTC headless run.
export function formatPeriodTime(time: string | Date | undefined): string {
  if (!time) return "";
  return formatBangkokTime(time);
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
