import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import type { timeslot } from "@prisma/client";

const BREAK_TYPES = new Set(["BREAK_BOTH", "BREAK_JUNIOR", "BREAK_SENIOR"]);

export type DayStyle = {
  Day: string;
  TextColor: string;
  BgColor: string;
};

export type BreakSlot = {
  TimeslotID: string;
  Breaktime: string;
  SlotNumber: number;
};

export type TimeslotWithSubject = timeslot & {
  subject: Record<string, any>;
};

export type TimeSlotTableData = {
  AllData: TimeslotWithSubject[];
  SlotAmount: number[];
  DayOfWeek: DayStyle[];
  BreakSlot: BreakSlot[];
};

export const emptyTimeSlotTableData: TimeSlotTableData = {
  AllData: [],
  SlotAmount: [],
  DayOfWeek: [],
  BreakSlot: [],
};

export type ScheduleEntry = {
  TimeslotID: string;
  [key: string]: any;
};

const parseSlotNumber = (timeslotId: string): number => {
  const rawNumber = Number.parseInt(timeslotId.substring(10), 10);
  return Number.isNaN(rawNumber) ? 0 : rawNumber;
};

export const createTimeSlotTableData = (
  timeslots: timeslot[] | undefined,
  scheduleEntries: ScheduleEntry[] | undefined,
): TimeSlotTableData => {
  if (!timeslots || timeslots.length === 0) {
    return emptyTimeSlotTableData;
  }

  const scheduleMap = new Map<string, ScheduleEntry>();
  (scheduleEntries ?? [])
    .filter((entry): entry is ScheduleEntry => Boolean(entry?.TimeslotID))
    .forEach((entry) => {
      scheduleMap.set(entry.TimeslotID, entry);
    });

  const dayOfWeek = Array.from(new Set(timeslots.map((slot) => slot.DayOfWeek))).map(
    (dayCode) => ({
      Day: dayOfWeekThai[dayCode],
      TextColor: dayOfWeekTextColor[dayCode],
      BgColor: dayOfWeekColor[dayCode],
    }),
  );

  const breakSlots = timeslots
    .filter((slot) => BREAK_TYPES.has(slot.Breaktime) && slot.DayOfWeek === "MON")
    .map((slot) => ({
      TimeslotID: slot.TimeslotID,
      Breaktime: slot.Breaktime,
      SlotNumber: parseSlotNumber(slot.TimeslotID),
    }));

  const mondaySlots = timeslots.filter((slot) => slot.DayOfWeek === "MON");
  const slotAmount = mondaySlots.map((_, index) => index + 1);

  const allData = timeslots.map((slot) => ({
    ...slot,
    subject: scheduleMap.get(slot.TimeslotID) ?? {},
  }));

  return {
    AllData: allData,
    SlotAmount: slotAmount,
    DayOfWeek: dayOfWeek,
    BreakSlot: breakSlots,
  };
};
