"use client";

import ExcelJS from "exceljs";
import type { teacher } from "@/prisma/generated/client";
import type { ClassScheduleWithSummary } from "@/features/class/infrastructure/repositories/class.repository";
import type { TimeSlotTableData } from "@/app/dashboard/[semesterAndyear]/shared/timeSlot";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";

export type ExportTimeslotData = {
  AllData: TimeSlotTableData["AllData"];
  SlotAmount: number[];
  DayOfWeek: Array<{ Day: string; TextColor: string; BgColor: string }>;
  BreakSlot?: Array<{
    TimeslotID: string;
    Breaktime: string;
    SlotNumber: number;
  }>;
};

const DAY_ORDER = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const findTimeslotId = (
  data: ExportTimeslotData,
  dayCode: string,
  slotNumber: number,
): string | undefined => {
  return data.AllData.find((t) => {
    const num = extractPeriodFromTimeslotId(t.TimeslotID);
    return t.DayOfWeek === dayCode && num === slotNumber;
  })?.TimeslotID;
};

const describeSchedule = (schedule: ClassScheduleWithSummary): string => {
  const grade = schedule.gradelevel?.GradeID ?? schedule.GradeID ?? "";
  const subject =
    (schedule as any).subject?.SubjectName ??
    (schedule as any).subject?.SubjectCode ??
    (schedule as any).SubjectCode ??
    "";
  const room = schedule.room?.RoomName ?? "";
  const base = `${grade} ${subject}`.trim();
  return room ? `${base} (${room})` : base;
};

/**
 * Export teacher timetables to Excel (one sheet per teacher).
 * Designed for client-side use (ExcelJS).
 */
export async function ExportTeacherTable(
  timeSlotData: ExportTimeslotData,
  teachers: teacher[],
  classData: ClassScheduleWithSummary[],
  semester: number | string,
  academicYear: number | string,
) {
  const workbook = new ExcelJS.Workbook();

  const dayCodes = Array.from(
    new Set(timeSlotData.AllData.map((t) => t.DayOfWeek)),
  ).sort((a, b) => DAY_ORDER.indexOf(a as any) - DAY_ORDER.indexOf(b as any));
  const days = dayCodes.map((code) => dayOfWeekThai[code] ?? code);
  const slots = timeSlotData.SlotAmount;

  teachers.forEach((t) => {
    const sheet = workbook.addWorksheet(
      `${t.Firstname ?? ""} ${t.Lastname ?? ""}`.trim() || `ครู-${t.TeacherID}`,
      {
        pageSetup: { paperSize: 9, orientation: "landscape" },
      },
    );

    // Header
    sheet.addRow([
      `ตารางสอน: ${t.Prefix ?? ""}${t.Firstname ?? ""} ${t.Lastname ?? ""}`.trim(),
    ]);
    sheet.addRow([`ภาคเรียนที่ ${semester}/${academicYear}`]);
    sheet.addRow([]); // spacer

    const columns = [
      { header: "คาบ", key: "slot", width: 6 },
      ...days.map((d, idx) => ({ header: d, key: dayCodes[idx], width: 22 })),
    ];
    sheet.columns = columns;

    // Build a quick lookup of schedules per timeslot for this teacher
    const schedulesByTimeslot = new Map<string, ClassScheduleWithSummary[]>();
    classData
      .filter((c) =>
        c.teachers_responsibility.some((r) => r.TeacherID === t.TeacherID),
      )
      .forEach((c) => {
        const arr = schedulesByTimeslot.get(c.TimeslotID) ?? [];
        arr.push(c);
        schedulesByTimeslot.set(c.TimeslotID, arr);
      });

    slots.forEach((slotNumber) => {
      const row: Record<string, string | number> = { slot: slotNumber };
      dayCodes.forEach((dayCode) => {
        const timeslotId = findTimeslotId(timeSlotData, dayCode, slotNumber);
        if (!timeslotId) {
          row[dayCode] = "";
          return;
        }
        const matches = schedulesByTimeslot.get(timeslotId) ?? [];
        row[dayCode] = matches.map(describeSchedule).join(", ");
      });
      sheet.addRow(row);
    });

    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.getRow(2).font = { size: 12 };
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        if (rowNumber > 3) {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ตารางสอน-${semester}-${academicYear}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
