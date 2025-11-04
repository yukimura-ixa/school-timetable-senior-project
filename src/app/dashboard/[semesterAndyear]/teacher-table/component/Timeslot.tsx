"use client";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import React, { Fragment } from "react";
import type { TimeSlotTableData } from "../../shared/timeSlot";

type Props = {
  timeSlotData: TimeSlotTableData;
};

const formatTime = (time: string | Date) => {
  const date = new Date(time);
  const hour = date.getHours() - 7;
  const minutes = date.getMinutes();

  const hoursText = hour < 10 ? `0${hour}` : hour.toString();
  const minutesText = minutes === 0 ? `0${minutes}` : minutes.toString();

  return `${hoursText}:${minutesText}`;
};

const isBreakSlot = (breaktime: string) => breaktime !== "NOT_BREAK";

const formatGrade = (gradeId?: string) => {
  if (!gradeId) {
    return "";
  }

  const roomNumber = Number.parseInt(gradeId.substring(1), 10);
  return `ม.${gradeId[0]}/${Number.isNaN(roomNumber) ? "" : roomNumber}`;
};

function TimeSlot({ timeSlotData }: Props) {
  return (
    <table className="table-auto flex w-full flex-col gap-3">
      <thead>
        <tr className="flex gap-4">
          <th className="flex h-[53px] w-[90px] items-center justify-center rounded bg-gray-100 p-[10px] text-center text-gray-600">
            คาบที่
          </th>
          {timeSlotData.SlotAmount.map((item) => (
            <Fragment key={`slot-${item}`}>
              <th className="flex h-[53px] grow items-center justify-center rounded bg-gray-100 p-[10px] text-gray-600">
                <p>{item < 10 ? `0${item}` : item}</p>
              </th>
            </Fragment>
          ))}
        </tr>
      </thead>
      <tbody className="flex flex-col gap-3">
        <tr className="flex gap-4">
          <td className="flex h-full items-center justify-center rounded bg-gray-100 p-[10px]">
            <span className="flex h-[50px] w-[50px] items-center justify-center text-gray-600">
              เวลา
            </span>
          </td>
          {timeSlotData.AllData.filter((item) => item.DayOfWeek === "MON").map((item) => (
            <Fragment key={`time-${item.StartTime}${item.EndTime}`}>
              <td
                style={{ width: `${1062 / timeSlotData.SlotAmount.length - 10}px` }}
                className="flex grow flex-col items-center justify-center rounded bg-gray-100 py-[10px] text-xs text-gray-600 min-[1440px]:flex-row"
              >
                <p className="flex w-full items-center justify-center">
                  {formatTime(item.StartTime)}
                </p>
                <p className="flex items-center justify-center">-</p>
                <p className="flex w-full items-center justify-center">
                  {formatTime(item.EndTime)}
                </p>
              </td>
            </Fragment>
          ))}
        </tr>
        {timeSlotData.DayOfWeek.map((day) => (
          <Fragment key={`day${day.Day}`}>
            <tr className="flex gap-4">
              <td
                className="flex h-[76px] items-center justify-center rounded p-[10px]"
                style={{ backgroundColor: day.BgColor }}
              >
                <span className="flex h-[24px] w-[50px] justify-center">
                  <p style={{ color: day.TextColor }}>{day.Day}</p>
                </span>
              </td>
              {timeSlotData.AllData.filter((item) => dayOfWeekThai[item.DayOfWeek] === day.Day).map(
                (data) => {
                  const breakSlot = isBreakSlot(data.Breaktime);
                  const subject = data.subject;
                  const subjectCode = subject?.SubjectCode ?? "";
                  const isLocked = Boolean(subject?.IsLocked);
                  const grade = formatGrade(subject?.GradeID);
                  const roomName = subject?.room?.RoomName ?? "";

                  return (
                    <Fragment key={`slot-no${data.TimeslotID}`}>
                      <td
                        style={{
                          width: `${1062 / timeSlotData.SlotAmount.length - 10}px`,
                          backgroundColor: breakSlot ? "#f3f4f6" : "white",
                        }}
                        className="grid h-[76px] cursor-default items-center justify-center rounded border border-[#ABBAC1] text-center text-xs font-light"
                      >
                        {breakSlot ? (
                          <p className="mt-4">พักกลางวัน</p>
                        ) : (
                          <span className="flex flex-col items-center gap-[2px] text-xs">
                            {subjectCode && (
                              <p
                                className="text-sm font-bold"
                                style={{ fontSize: subjectCode.length > 8 ? 12 : 14 }}
                              >
                                {subjectCode}
                              </p>
                            )}
                            {!isLocked && grade && <p className="text-sm">{grade}</p>}
                            {roomName && (
                              <p className="text-xs">
                                {roomName.length > 9 ? `${roomName.substring(0, 9)}...` : roomName}
                              </p>
                            )}
                          </span>
                        )}
                      </td>
                    </Fragment>
                  );
                },
              )}
            </tr>
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

export default TimeSlot;
