import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import type { timeslot } from "@/prisma/generated/client";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";

const BREAK_TYPES = new Set(["BREAK", "BREAK_BOTH", "BREAK_JUNIOR", "BREAK_SENIOR"]);
const DAY_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const getDayIndex = (dayCode: string) => {
  const index = DAY_ORDER.indexOf(dayCode as (typeof DAY_ORDER)[number]);
  return index === -1 ? DAY_ORDER.length : index;
};

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

export type SubjectSummary = {
  SubjectCode?: string;
  SubjectName?: string;
  Credit?: number | string;
  TotalHours?: number | string;
};

export type TeacherSummary = {
  Prefix?: string;
  Firstname?: string;
  Lastname?: string;
};

export type RoomSummary = {
  RoomName?: string;
};

export type ScheduleEntry = {
  TimeslotID: string;
  SubjectCode?: string;
  SubjectName?: string;
  GradeID?: string;
  IsLocked?: boolean;
  subject?: SubjectSummary | null;
  teacher?: TeacherSummary | null;
  teachers?: TeacherSummary[] | null;
  room?: RoomSummary | null;
  [key: string]: unknown;
};

export type TimeslotWithSubject = timeslot & {
  subject: ScheduleEntry | null;
};

export type TimetableColumn = {
  kind: "teaching" | "break";
  TimeslotID: string;
  Breaktime: string;
  slotIndex: number;
  periodNumber?: number;
  // Synthetic columns represent visual gaps where no DB timeslot exists
  // (e.g. the 09:40-09:50 mini break that the seed leaves unrepresented).
  // Renderers must skip data lookups when synthetic === true.
  synthetic?: boolean;
};

export type TimeSlotTableData = {
  AllData: TimeslotWithSubject[];
  SlotAmount: number[];
  DayOfWeek: DayStyle[];
  BreakSlot: BreakSlot[];
  Columns: TimetableColumn[];
};

export const emptyTimeSlotTableData: TimeSlotTableData = {
  AllData: [],
  SlotAmount: [],
  DayOfWeek: [],
  BreakSlot: [],
  Columns: [],
};

const parseSlotNumber = extractPeriodFromTimeslotId;

export const createTimeSlotTableData = (
  timeslots: timeslot[] | undefined,
  scheduleEntries: ScheduleEntry[] | undefined,
): TimeSlotTableData => {
  if (!timeslots || timeslots.length === 0) {
    return emptyTimeSlotTableData;
  }

  const scheduleMap = new Map<string, ScheduleEntry>();
  (scheduleEntries ?? [])
    .filter((entry): entry is ScheduleEntry => !!(entry && entry.TimeslotID))
    .forEach((entry) => {
      scheduleMap.set(entry.TimeslotID, entry);
    });

  const sortedTimeslots = [...timeslots].sort((slotA, slotB) => {
    const dayDiff = getDayIndex(slotA.DayOfWeek) - getDayIndex(slotB.DayOfWeek);
    if (dayDiff !== 0) {
      return dayDiff;
    }

    return (
      parseSlotNumber(slotA.TimeslotID) - parseSlotNumber(slotB.TimeslotID)
    );
  });

  const dayOfWeek = Array.from(
    new Set(sortedTimeslots.map((slot) => slot.DayOfWeek)),
  ).map((dayCode) => ({
    Day: dayOfWeekThai[dayCode] ?? dayCode,
    TextColor: dayOfWeekTextColor[dayCode] ?? "",
    BgColor: dayOfWeekColor[dayCode] ?? "",
  }));

  const breakSlots = sortedTimeslots
    .filter(
      (slot) => BREAK_TYPES.has(slot.Breaktime) && slot.DayOfWeek === "MON",
    )
    .map((slot) => ({
      TimeslotID: slot.TimeslotID,
      Breaktime: slot.Breaktime,
      SlotNumber: parseSlotNumber(slot.TimeslotID),
    }));

  const mondaySlots = sortedTimeslots.filter(
    (slot) => slot.DayOfWeek === "MON",
  );
  const slotAmount = mondaySlots.map((_, index) => index + 1);

  // Columns drive header/body rendering. Period numbers attach to teaching
  // slots only — breaks render as narrow unnumbered columns. Day rows are
  // sorted in the same order as Monday, so a real column's `slotIndex`
  // points at each day's `slotIndex`-th slot. Synthetic break columns are
  // injected wherever consecutive Monday timeslots have a time gap (e.g.
  // 09:40-09:50 mini break) so the visual cadence matches wall-clock time.
  let teachingCount = 0;
  const columns: TimetableColumn[] = [];
  for (let i = 0; i < mondaySlots.length; i++) {
    const slot = mondaySlots[i]!;
    if (BREAK_TYPES.has(slot.Breaktime)) {
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

    const next = mondaySlots[i + 1];
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

  const allData = sortedTimeslots.map((slot) => ({
    ...slot,
    subject: scheduleMap.get(slot.TimeslotID) ?? null,
  }));

  return {
    AllData: allData,
    SlotAmount: slotAmount,
    DayOfWeek: dayOfWeek,
    BreakSlot: breakSlots,
    Columns: columns,
  };
};
