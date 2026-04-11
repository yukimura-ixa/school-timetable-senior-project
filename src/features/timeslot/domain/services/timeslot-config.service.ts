import type { ConfigData } from "@/features/config/domain/constants/config.constants";

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
  type: PreviewSlotType;
  duration: number;
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function generatePreviewSlots(config: ConfigData): PreviewSlot[] {
  const [hours, minutes] = config.StartTime.split(":").map(Number);
  if (hours === undefined || minutes === undefined) {
    return [];
  }

  const slots: PreviewSlot[] = [];
  let currentTime = hours * 60 + minutes;

  for (let period = 1; period <= config.TimeslotPerDay; period++) {
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

    const isJuniorLunch = period === config.BreakTimeslots.Junior;
    const isSeniorLunch = period === config.BreakTimeslots.Senior;

    if (isJuniorLunch || isSeniorLunch) {
      const lunchType: PreviewSlotType =
        isJuniorLunch && isSeniorLunch
          ? "lunch-both"
          : isJuniorLunch
            ? "lunch-junior"
            : "lunch-senior";

      const lunchLabel =
        lunchType === "lunch-both"
          ? "พักเที่ยง (ทุกระดับ)"
          : lunchType === "lunch-junior"
            ? "พักเที่ยง ม.ต้น"
            : "พักเที่ยง ม.ปลาย";

      const lunchStart = formatTime(currentTime);
      currentTime += config.BreakDuration;
      const lunchEnd = formatTime(currentTime);

      slots.push({
        period,
        label: lunchLabel,
        startTime: lunchStart,
        endTime: lunchEnd,
        type: lunchType,
        duration: config.BreakDuration,
      });
    }

    if (config.HasMinibreak && period === config.MiniBreak.SlotNumber) {
      const miniStart = formatTime(currentTime);
      currentTime += config.MiniBreak.Duration;
      const miniEnd = formatTime(currentTime);

      slots.push({
        period,
        label: `พักเบรก ${config.MiniBreak.Duration} นาที`,
        startTime: miniStart,
        endTime: miniEnd,
        type: "mini-break",
        duration: config.MiniBreak.Duration,
      });
    }
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
