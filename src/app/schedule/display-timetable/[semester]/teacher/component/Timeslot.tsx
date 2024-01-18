"use client";
import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import {subjectInSlot} from "@/raw-data/subjectslot";

type Props = {};

function TimeSlot(props: Props) {
  const timeSlotData = {
    SlotAmount: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    StartTime: { Hours: 8, Minutes: 30 },
    Duration: 50,
    DayOfWeek: [
      { Day: "จันทร์", TextColor: "#b8a502", BgColor: "#fffacf" },
      { Day: "อังคาร", TextColor: "#d800db", BgColor: "#fedbff" },
      { Day: "พุธ", TextColor: "#1cba00", BgColor: "#e1ffdb" },
      { Day: "พฤหัสบดี", TextColor: "#ba4e00", BgColor: "#ffb996" },
      { Day: "ศุกร์", TextColor: "#0099d1", BgColor: "#bdedff" },
    ],
    BreakSlot: [4, 5],
  };
  const addHours = (time: Date, hours: number): Date => {
    //set เวลาด้วยการบวกตาม duration และคูณ hours ถ้าจะให้ skip ไปหลายชั่วโมง
    time.setMinutes(time.getMinutes() + timeSlotData.Duration * hours);
    return time;
  };
  const mapTime = () => {
    let map = [
      ...timeSlotData.SlotAmount.map((hour) => {
        //สร้าง format เวลา ตัวอย่าง => 2023-07-27T17:24:52.897Z
        let timeFormat = `0${timeSlotData.StartTime.Hours}:${timeSlotData.StartTime.Minutes}`;
        //แยก เวลาเริ่มกับเวลาจบไว้ตัวแปรละอัน
        const timeStart = new Date(`2024-03-14T${timeFormat}:00.000Z`);
        const timeEnd = new Date(`2024-03-14T${timeFormat}:00.000Z`);
        //นำไปใส่ใน function addHours เพื่อกำหนดเวลาเริ่ม-จบ
        let start = addHours(timeStart, hour - 1); //เวลาเริ่มใส่ hours-1 เพราะคาบแรกไม่ต้องการให้บวกเวลา
        let end = addHours(timeEnd, hour); //จะต้องมากกว่า start ตาม duration ที่กำหนดไว้
        //แปลงจาก 2023-07-27T17:24:52.897Z เป็น 17:24 โดยใช้ slice
        return {
          Start: start.toISOString().slice(11, 16),
          End: end.toISOString().slice(11, 16),
        };
      }),
    ];
    return map;
  };
  return (
    <>
      <table className="table-auto w-full flex flex-col gap-3">
        <thead>
          <tr className="flex gap-4">
            <th className="flex items-center bg-gray-100 justify-center p-[10px] h-[53px] rounded select-none">
              <span
                onClick={() => {
                  console.log(
                    subjectInSlot.filter((slot) => slot.DayOfWeek == "จันทร์")
                  );
                }}
                className="flex text-gray-600 font-light w-[50px] h-[24px] justify-center"
              >
                คาบที่
              </span>
            </th>
            {timeSlotData.SlotAmount.map((item) => (
              <Fragment key={`woohoo${item}`}>
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
            <td className="flex items-center bg-gray-100 justify-center p-[10px] h-[40px] rounded">
              <span className="flex w-[50px] h-[24px] justify-center">
                <p className="text-gray-600">เวลา</p>
              </span>
            </td>
            {mapTime().map((item) => (
              <Fragment key={`woohoo${item.Start}${item.End}`}>
                <td className="flex grow items-center justify-center py-[10px] h-[40px] rounded bg-gray-100 select-none">
                  <p className="flex text-xs w-full items-center justify-center h-[24px] text-gray-600">
                    {item.Start}-{item.End}
                  </p>
                </td>
              </Fragment>
            ))}
          </tr>
          {timeSlotData.DayOfWeek.map((day) => (
            <Fragment key={`asdasda${day.Day}`}>
              <tr className="flex gap-4">
                <td
                  className={`flex items-center justify-center p-[10px] h-[76px] rounded select-none`}
                  style={{ backgroundColor: day.BgColor }}
                >
                  <span className={`flex w-[50px] h-[24px] justify-center`}>
                    <p style={{ color: day.TextColor }}>{day.Day}</p>
                  </span>
                </td>
                {subjectInSlot
                  .filter((slot) => slot.DayOfWeek == day.Day)
                  .map((item) => (
                    <Fragment key={`woohoo${item.DayOfWeek}`}>
                      {item.SlotData.map((data) => (
                        <Fragment
                          key={`weehhe${data.SlotNumber}${data.SubjectCode}`}
                        >
                          <td className="flex font-light grow items-center justify-center p-[10px] h-[76px] rounded border border-[#ABBAC1] cursor-pointer">
                            <span className="flex w-[50px] flex-col items-center text-xs hover:w-[75px] hover:text-lg duration-300">
                              {/* <MdAdd size={20} className="fill-gray-300" /> */}
                              {data.GradeID != null ? 
                                <>
                                <p>{data.SubjectCode}</p>
                                <p>ม.{data.GradeID.toString().slice(0,1)}/{data.GradeID.toString().slice(2)}</p>
                                <p>{data.RoomID}</p>
                                </>
                               :
                               null
                               }
                            </span>
                          </td>
                        </Fragment>
                      ))}
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
