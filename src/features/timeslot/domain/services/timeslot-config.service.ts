import type { ConfigData } from "@/features/config/domain/constants/config.constants";
import type { BreakDefinition } from "../models/break.types";

export type PreviewSlotType =
  | "class"
  | "lunch-junior"
  | "lunch-senior"
  | "lunch-both"
  | "mini-break";

export interface PreviewSlot {
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  type: "class" | "break";
  duration: number;
  color?: string;
  breakId?: string;
  groups?: string[];
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}


export function generatePreviewSlots(config: {
  StartTime: string;
  Duration: number;
  TimeslotPerDay: number;
  breakDefinitions?: BreakDefinition[];
}): PreviewSlot[] {
  const [hours, minutes] = config.StartTime.split(":").map(Number);
  if (hours === undefined || minutes === undefined) return [];

  const slots: PreviewSlot[] = [];
  let currentTime = hours * 60 + minutes;
  const breaksBySlot = new Map<number, BreakDefinition[]>();
  for (const brk of config.breakDefinitions || []) {
    const existing = breaksBySlot.get(brk.slotNumber) ?? [];
    existing.push(brk);
    breaksBySlot.set(brk.slotNumber, existing);
  }

  for (let period = 1; period <= config.TimeslotPerDay; period++) {
    // Insert breaks before this period
    const breaksHere = breaksBySlot.get(period) ?? [];
    for (const brk of breaksHere) {
      const brkStart = formatTime(currentTime);
      currentTime += brk.duration;
      const brkEnd = formatTime(currentTime);
      slots.push({
        period: period - 1,
        label: brk.label,
        startTime: brkStart,
        endTime: brkEnd,
        type: "break",
        duration: brk.duration,
        color: brk.color,
        breakId: brk.id,
        groups: brk.groups,
      });
    }

    const classStart = formatTime(currentTime);
    currentTime += config.Duration;
    const classEnd = formatTime(currentTime);

    slots.push({
      period,
      label: `คาบที่ ${period}`,
      startTime: classStart,
      endTime: classEnd,
      type: "class",
      duration: config.Duration,
    });
  }

  return slots;
}

export function calculateSchoolDayEndTime(slots: PreviewSlot[]): string {
  if (slots.length === 0) {
    return "--:--";
  }
  return slots[slots.length - 1]?.endTime ?? "--:--";
}

export function calculateSchoolDayMinutes(slots: PreviewSlot[]): number {
  return slots.reduce((sum, slot) => sum + slot.duration, 0);
}
