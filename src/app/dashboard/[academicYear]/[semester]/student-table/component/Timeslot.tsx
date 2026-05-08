"use client";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import React, { Fragment, useMemo } from "react";
import type { TimeSlotTableData } from "../../shared/timeSlot";
import { formatTimeslotTimeUtc } from "@/utils/datetime";
import { isBreakForGrade } from "@/utils/break-utils";

type Props = {
  timeSlotData: TimeSlotTableData;
  searchGradeID: string | null;
  breakDefinitions?: any[];
  breakGroups?: any[];
};

const formatTime = formatTimeslotTimeUtc;

const getGradeLevel = (gradeId: string | null) => {
  if (!gradeId) {
    return undefined;
  }

  const level = Number.parseInt(gradeId[0] ?? "", 10);
  return Number.isNaN(level) ? undefined : level;
};

const teachingCellClass = "flex-1 min-w-[80px]";
const breakCellClass = "flex-none w-[32px]";

export default function TimeSlot({
  timeSlotData,
  searchGradeID,
  breakDefinitions,
}: Props) {
  const gradeLevel = useMemo(
    () => getGradeLevel(searchGradeID),
    [searchGradeID],
  );

  const columns = timeSlotData.Columns;
  const monSlots = timeSlotData.AllData.filter(
    (item) => item.DayOfWeek === "MON",
  );

  return (
    <table className="table-auto flex w-full flex-col gap-3">
      <thead>
        <tr className="flex gap-4">
          <th className="flex h-[53px] w-[90px] flex-none items-center justify-center rounded bg-gray-100 p-[10px] text-center text-gray-600">
            คาบที่
          </th>
          {columns.map((col) => {
            const isBreak = col.kind === "break";
            return (
              <Fragment key={`head-${col.TimeslotID}`}>
                <th
                  className={`flex h-[53px] items-center justify-center rounded p-[10px] text-gray-600 ${
                    isBreak
                      ? `${breakCellClass} bg-gray-50`
                      : `${teachingCellClass} bg-gray-100`
                  }`}
                >
                  {!isBreak && (
                    <p>
                      {(col.periodNumber ?? 0) < 10
                        ? `0${col.periodNumber}`
                        : col.periodNumber}
                    </p>
                  )}
                </th>
              </Fragment>
            );
          })}
        </tr>
      </thead>
      <tbody className="flex flex-col gap-3">
        <tr className="flex gap-4">
          <td className="flex h-full w-[90px] flex-none items-center justify-center rounded bg-gray-100 p-[10px]">
            <span className="flex h-[50px] items-center justify-center text-gray-600">
              เวลา
            </span>
          </td>
          {columns.map((col, idx) => {
            const isBreak = col.kind === "break";
            const slot = col.slotIndex >= 0 ? monSlots[col.slotIndex] : undefined;
            return (
              <Fragment key={`time-${col.TimeslotID || `syn-${idx}`}`}>
                <td
                  className={`flex flex-col items-center justify-center rounded py-[10px] text-xs text-gray-600 min-[1440px]:flex-row ${
                    isBreak
                      ? `${breakCellClass} bg-gray-50`
                      : `${teachingCellClass} bg-gray-100`
                  }`}
                >
                  {slot && !isBreak && (
                    <>
                      <p className="flex w-full items-center justify-center">
                        {formatTime(slot.StartTime)}
                      </p>
                      <p className="flex items-center justify-center">-</p>
                      <p className="flex w-full items-center justify-center">
                        {formatTime(slot.EndTime)}
                      </p>
                    </>
                  )}
                  {isBreak && (
                    <p className="text-[10px] text-gray-400">พัก</p>
                  )}
                </td>
              </Fragment>
            );
          })}
        </tr>
        {timeSlotData.DayOfWeek.map((day) => {
          const daySlots = timeSlotData.AllData.filter(
            (item) => dayOfWeekThai[item.DayOfWeek] === day.Day,
          );
          return (
            <Fragment key={`day${day.Day}`}>
              <tr className="flex gap-4">
                <td
                  className="flex h-[76px] w-[90px] flex-none items-center justify-center rounded p-[10px]"
                  style={{ backgroundColor: day.BgColor }}
                >
                  <span className="flex h-[24px] justify-center">
                    <p style={{ color: day.TextColor }}>{day.Day}</p>
                  </span>
                </td>
                {columns.map((col, idx) => {
                  const isBreak = col.kind === "break";
                  const data =
                    col.slotIndex >= 0 ? daySlots[col.slotIndex] : undefined;
                  const slotNumber = data?.TimeslotID
                    ? Number(
                        data.TimeslotID.replace(
                          /.*(?:MON|TUE|WED|THU|FRI|SAT|SUN)(\d+)/,
                          "$1",
                        ),
                      )
                    : 0;
                  const showBreak =
                    isBreak ||
                    (data
                      ? isBreakForGrade(
                          data.Breaktime,
                          gradeLevel,
                          slotNumber,
                          breakDefinitions,
                          searchGradeID || undefined,
                        )
                      : false);
                  const subject = data?.subject;
                  const subjectCode = subject?.SubjectCode ?? "";
                  const teacherName =
                    !subject?.IsLocked &&
                    Array.isArray(subject?.teachers) &&
                    subject.teachers.length > 0
                      ? (subject.teachers[0]?.Firstname ?? "")
                      : "";
                  const roomName = subject?.room?.RoomName ?? "";

                  return (
                    <Fragment key={`slot-no${col.TimeslotID || `syn-${idx}`}`}>
                      <td
                        style={{
                          backgroundColor: showBreak ? "#f3f4f6" : "white",
                        }}
                        className={`grid h-[76px] cursor-default items-center justify-center rounded border border-[#ABBAC1] text-center text-xs font-light ${
                          isBreak ? breakCellClass : teachingCellClass
                        }`}
                      >
                        {showBreak ? (
                          isBreak ? null : (
                            <p className="mt-4">พักกลางวัน</p>
                          )
                        ) : (
                          <span className="flex flex-col items-center gap-[2px] text-xs">
                            {subjectCode && (
                              <p
                                className="font-bold"
                                style={{
                                  fontSize: subjectCode.length > 8 ? 12 : 14,
                                }}
                              >
                                {subjectCode}
                              </p>
                            )}
                            {teacherName && (
                              <p className="text-sm">{teacherName}</p>
                            )}
                            {roomName && (
                              <p className="text-xs">
                                {roomName.length > 9
                                  ? `${roomName.substring(0, 9)}...`
                                  : roomName}
                              </p>
                            )}
                          </span>
                        )}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
