"use client";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import React, { Fragment, useState } from "react";

type Props = {
  timeSlotData: any;
  searchGradeID: any;
};

function TimeSlot({ timeSlotData, searchGradeID }: Props) {
  const [gradeID, setGradeID] = useState(searchGradeID || 0);
  console.log(gradeID);
  function formatTime(time) {
    const date = new Date(time);
    const hours =
      date.getHours() - 7 < 10
        ? `0${date.getHours() - 7}`
        : date.getHours() - 7;
    const minutes =
      date.getMinutes() == 0 ? `0${date.getMinutes()}` : date.getMinutes();
    return `${hours}:${minutes}`;
  }
  return (
    <>
      <table className="table-auto w-full flex flex-col gap-3">
        <thead>
          <tr className="flex gap-4">
            <th className="flex items-center bg-gray-100 justify-center p-[10px] h-[53px] rounded select-none">
              <span
                onClick={() => {
                  console.log(timeSlotData);
                }}
                className="flex text-gray-600 font-light w-[50px] h-[24px] justify-center"
              >
                คาบที่
              </span>
            </th>
            {timeSlotData.SlotAmount.map((item) => (
              <Fragment key={`slot-${item}`}>
                <th className="flex font-light bg-gray-100 grow items-center justify-center p-[10px] h-[53px] rounded select-none">
                  <p className="text-gray-600">
                    {item < 10 ? `0${item}` : item}
                  </p>
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="flex flex-col gap-3">
          <tr className="flex gap-4">
            <td className="flex items-center bg-gray-100 justify-center p-[10px] h-full rounded">
              <span className="flex w-[50px] h-[50px] min-[1440px]:h-[24px] items-center justify-center">
                <p className="text-gray-600">เวลา</p>
              </span>
            </td>
            {timeSlotData.AllData.filter((item) => item.DayOfWeek == "MON").map(
              (item) => (
                <Fragment key={`time-${item.StartTime}${item.EndTime}`}>
                  <td
                    style={{
                      width: `${1062 / timeSlotData.SlotAmount.length - 10}px`,
                    }}
                    className="flex flex-col min-[1440px]:flex-row grow items-center justify-center py-[10px] rounded bg-gray-100 select-none"
                  >
                    <p className="flex text-xs w-full items-center justify-center text-gray-600">
                      {formatTime(item.StartTime)}
                    </p>
                    <p className="flex text-xs items-center justify-center text-gray-600">
                      -
                    </p>
                    <p className="flex text-xs w-full items-center justify-center text-gray-600">
                      {formatTime(item.EndTime)}
                    </p>
                  </td>
                </Fragment>
              ),
            )}
          </tr>
          {timeSlotData.DayOfWeek.map((day) => (
            <Fragment key={`day${day.Day}`}>
              <tr className="flex gap-4">
                <td
                  className={`flex items-center justify-center p-[10px] h-[76px] rounded select-none`}
                  style={{ backgroundColor: day.BgColor }}
                >
                  <span className={`flex w-[50px] h-[24px] justify-center`}>
                    <p style={{ color: day.TextColor }}>{day.Day}</p>
                  </span>
                </td>
                {timeSlotData.AllData.filter(
                  (item) => dayOfWeekThai[item.DayOfWeek] == day.Day,
                ).map((data) => (
                  <Fragment key={`slot-no${data.TimeslotID}`}>
                    <td
                      style={{
                        width: `${
                          1062 / timeSlotData.SlotAmount.length - 10
                        }px`,
                        backgroundColor:
                          timeSlotData.BreakSlot.length == 1 &&
                          timeSlotData.BreakSlot[0].SlotNumber == data
                            ? "lightgray"
                            : "white",
                      }}
                      className="grid font-light items-center justify-center h-[76px] rounded border border-[#ABBAC1] cursor-default"
                    >
                      {data.Breaktime == "BREAK_JUNIOR" && gradeID[0] < 4 ? (
                        <p className="mt-4">พักกลางวัน</p>
                      ) : data.Breaktime == "BREAK_SENIOR" &&
                        gradeID[0] >= 4 ? (
                        <p className="mt-4">พักกลางวัน</p>
                      ) : data.Breaktime == "BREAK_BOTH" ? (
                        <p className="mt-4">พักกลางวัน</p>
                      ) : null}
                      <span className="flex flex-col items-center text-xs duration-300">
                        {Object.keys(data.subject).length !== 0 && (
                          <>
                            <p className="text-sm">
                              {data.subject.SubjectCode}
                            </p>
                            <p
                              style={{
                                visibility:
                                  data.subject.teachers.length == 0
                                    ? "hidden"
                                    : "visible",
                              }}
                              className="text-sm"
                            >
                              {data.subject.teachers.length == 0
                                ? "NONE"
                                : data.subject.teachers[0].Firstname}
                            </p>
                            <p className="text-xs">
                              {data.subject.room.RoomName.length > 9
                                ? data.subject.room.RoomName.substring(0, 9) +
                                  "..."
                                : data.subject.room.RoomName}
                            </p>
                          </>
                        )}
                      </span>
                    </td>
                  </Fragment>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default TimeSlot;
