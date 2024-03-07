"use client";
import React, { Fragment, useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import { subjectInSlot } from "@/raw-data/subjectslot";
import { useTeacherData } from "@/app/_hooks/teacherData";
import { fetcher } from "@/libs/axios";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Loading from "@/app/loading";

type Props = {};

function TimeSlot(props: Props) {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const allTeacher = useTeacherData();
  const [timeSlotData, setTimeSlotData] = useState({
    AllData: [], //ใช้กับตารางด้านล่าง
    SlotAmount: [],
    StartTime: { Hours: 8, Minutes: 30 },
    Duration: 50,
    DayOfWeek: [],
    BreakSlot: [],
  });
  const fetchTimeSlot = useSWR(
    () =>
      `/timeslot?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher,
    { revalidateOnFocus: false },
  );
  function fetchTimeslotData() {
    if (!fetchTimeSlot.isValidating) {
      let data = fetchTimeSlot.data;
      let dayofweek = data
        .map((day) => day.DayOfWeek)
        .filter(
          (item, index) =>
            data.map((day) => day.DayOfWeek).indexOf(item) === index,
        )
        .map((item) => ({
          Day: dayOfWeekThai[item],
          TextColor: dayOfWeekTextColor[item],
          BgColor: dayOfWeekColor[item],
        })); //filter เอาตัวซ้ำออก ['MON', 'MON', 'TUE', 'TUE'] => ['MON', 'TUE'] แล้วก็ map เป็นชุดข้อมูล object
      let slotAmount = data
        .filter((item) => item.DayOfWeek == "MON") //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        .map((item, index) => index + 1); //ใช้สำหรับ map หัวตารางในเว็บ จะ map จาก data เป็น number of array => [1, 2, 3, 4, 5, 6, 7]
      let breakTime = data
        .filter(
          (item) =>
            (item.Breaktime == "BREAK_BOTH" ||
              item.Breaktime == "BREAK_JUNIOR" ||
              item.Breaktime == "BREAK_SENIOR") &&
            item.DayOfWeek == "MON", //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        )
        .map((item) => ({
          TimeslotID: item.TimeslotID,
          Breaktime: item.Breaktime,
          SlotNumber: parseInt(item.TimeslotID.substring(10)),
        })); //เงื่อนไขที่ใส่คือเอาคาบพักออกมา
      let startTime = {
        Hours: new Date(data[0].StartTime).getHours() - 7, //พอแปลงมันเอาเวลาของ indo เลย -7 กลับไป
        Minutes: new Date(data[0].StartTime).getMinutes(),
      };
      let duration = getMinutes(
        new Date(data[0].EndTime).getTime() -
          new Date(data[0].StartTime).getTime(),
      ); //เอาเวลาจบลบเริ่มจะได้ duration
      setTimeSlotData(() => ({
        AllData: data.map((data) => ({ ...data, subject: {} })),
        SlotAmount: slotAmount,
        StartTime: startTime,
        Duration: duration,
        DayOfWeek: dayofweek,
        BreakSlot: breakTime,
      }));
    }
  }
  useEffect(() => {
    if (!fetchTimeSlot.isLoading) {
      fetchTimeslotData();
    }
  }, [fetchTimeSlot.isLoading]);
  //convert millisec to min
  const getMinutes = (milliseconds: number) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    return minutes;
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
        let timeFormat = `0${timeSlotData.StartTime.Hours}:${
          timeSlotData.StartTime.Minutes == 0
            ? "00"
            : timeSlotData.StartTime.Minutes
        }`;
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
      {fetchTimeSlot.isLoading ? <Loading /> : (
        <table className="table-auto w-full flex flex-col gap-3">
          <thead>
            <tr className="flex gap-4">
              <th className="flex items-center bg-gray-100 justify-center p-[10px] h-[53px] rounded select-none">
                <span
                  onClick={() => {
                    console.log(
                      subjectInSlot.filter(
                        (slot) => slot.DayOfWeek == "จันทร์",
                      ),
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
              <td className="flex items-center bg-gray-100 justify-center p-[10px] h-full rounded">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">เวลา</p>
                </span>
              </td>
              {mapTime().map((item) => (
                <Fragment key={`time-${item.Start}${item.End}`}>
                  <td
                    style={{
                      width: `${1062 / timeSlotData.SlotAmount.length - 10}px`,
                    }}
                    className="flex flex-col min-[1440px]:flex-row grow items-center justify-center py-[10px] rounded bg-gray-100 select-none"
                  >
                    <p className="flex text-xs w-full items-center justify-center text-gray-600">
                      {item.Start}
                    </p>
                    <p className="flex text-xs items-center justify-center text-gray-600">
                      -
                    </p>
                    <p className="flex text-xs w-full items-center justify-center text-gray-600">
                      {item.End}
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
                      <Fragment key={`day-${item.DayOfWeek}`}>
                        {timeSlotData.SlotAmount.map((data) => (
                          <Fragment
                            key={`slot-no${data}`}
                          >
                            <td
                              style={{
                                width: `${
                                  1062 / timeSlotData.SlotAmount.length - 10
                                }px`,
                              }}
                              className="grid font-light items-center justify-center h-[76px] rounded border border-[#ABBAC1] cursor-default"
                            >
                              <span className="flex flex-col items-center text-xs duration-300">
                                {/* <MdAdd size={20} className="fill-gray-300" /> */}
                                <>
                                  {/* <p>{data.SubjectCode}</p>
                                  <p>
                                    ม.{data.GradeID.toString().slice(0, 1)}/
                                    {data.GradeID.toString().slice(2)}
                                  </p>
                                  <p>{data.RoomID}</p> */}
                                </>
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
      )}
    </>
  );
}

export default TimeSlot;
