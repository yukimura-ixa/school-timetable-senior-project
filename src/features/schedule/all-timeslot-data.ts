import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";
import { isBreakSlot } from "@/utils/break-utils";
import type { timeslot } from "@/prisma/generated/client";
import type { SlotConfig } from "@/features/timeslot/domain/models/break.types";
import type { TimeslotWithSubject, TimetableColumn } from "@/app/dashboard/[academicYear]/[semester]/shared/timeSlot";

export type TimeSlotData = {
  AllData: TimeslotWithSubject[];
  SlotAmount: number[];
  DayOfWeek: { Day: string; TextColor: string; BgColor: string }[];
  StartTime?: { Hours: number; Minutes: number };
  Duration?: number;
  BreakSlot?: { TimeslotID: string; Breaktime: string; SlotNumber: number }[];
  Columns: TimetableColumn[];
};

const getMinutes = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes;
};

export const buildTimeSlotData = (
  data: timeslot[],
  slots: SlotConfig[],
): TimeSlotData => {
  if (!data.length) {
    return { AllData: [], SlotAmount: [], DayOfWeek: [], Columns: [] };
  }

  const dayofweek = data
    .map((day) => day.DayOfWeek)
    .filter(
      (item, index) => data.map((day) => day.DayOfWeek).indexOf(item) === index,
    )
    .map((item) => ({
      Day: dayOfWeekThai[item],
      TextColor: dayOfWeekTextColor[item],
      BgColor: dayOfWeekColor[item],
    }))
    .filter(
      (item): item is { Day: string; TextColor: string; BgColor: string } =>
        item.Day !== undefined &&
        item.TextColor !== undefined &&
        item.BgColor !== undefined,
    );

  const slotAmount = data
    .filter((item) => item.DayOfWeek === "MON")
    .map((_, index) => index + 1);

  const breakTime = data
    .filter(
      (item) =>
        (item.Breaktime === "BREAK_BOTH" ||
          item.Breaktime === "BREAK_JUNIOR" ||
          item.Breaktime === "BREAK_SENIOR") &&
        item.DayOfWeek === "MON",
    )
    .map((item) => ({
      TimeslotID: item.TimeslotID,
      Breaktime: item.Breaktime,
      SlotNumber: extractPeriodFromTimeslotId(item.TimeslotID),
    }));

  const firstSlot = data[0];
  const firstSlotDate = firstSlot ? new Date(firstSlot.StartTime) : null;

  const startTime =
    firstSlotDate && !Number.isNaN(firstSlotDate.getTime())
      ? {
          Hours: firstSlotDate.getUTCHours(),
          Minutes: firstSlotDate.getUTCMinutes(),
        }
      : { Hours: 8, Minutes: 0 };

  const duration = firstSlot
    ? getMinutes(
        new Date(firstSlot.EndTime).getTime() -
          new Date(firstSlot.StartTime).getTime(),
      )
    : 50;

  // Period numbers attach to teaching slots only; breaks render as narrow
  // unnumbered columns. Synthetic break columns are inserted wherever
  // consecutive Monday timeslots have a wall-clock gap (e.g. 09:40-09:50)
  // so the visual cadence matches reality even when the seed didn't store
  // the gap as its own slot.
  const monSlotsForCols = data
    .filter((item) => item.DayOfWeek === "MON")
    .slice()
    .sort(
      (a, b) =>
        extractPeriodFromTimeslotId(a.TimeslotID) -
        extractPeriodFromTimeslotId(b.TimeslotID),
    );
  let teachingCount = 0;
  const columns: TimetableColumn[] = [];
  for (let i = 0; i < monSlotsForCols.length; i++) {
    const slot = monSlotsForCols[i]!;
    const slotNumber = extractPeriodFromTimeslotId(slot.TimeslotID);
    if (isBreakSlot(slotNumber, slots)) {
      columns.push({
        kind: "break",
        TimeslotID: slot.TimeslotID,
        Breaktime: slot.Breaktime,
        slotIndex: i,
      });
    } else {
      teachingCount += 1;
      columns.push({
        kind: "teaching",
        TimeslotID: slot.TimeslotID,
        Breaktime: slot.Breaktime,
        slotIndex: i,
        periodNumber: teachingCount,
      });
    }

    const next = monSlotsForCols[i + 1];
    if (next) {
      const gapMs =
        new Date(next.StartTime).getTime() - new Date(slot.EndTime).getTime();
      if (gapMs > 0) {
        columns.push({
          kind: "break",
          TimeslotID: "",
          Breaktime: "GAP",
          slotIndex: -1,
          synthetic: true,
        });
      }
    }
  }

  return {
    AllData: data.map((item) => ({ ...item, subject: null })),
    SlotAmount: slotAmount,
    DayOfWeek: dayofweek,
    StartTime: startTime,
    Duration: duration,
    BreakSlot: breakTime,
    Columns: columns,
  };
};
