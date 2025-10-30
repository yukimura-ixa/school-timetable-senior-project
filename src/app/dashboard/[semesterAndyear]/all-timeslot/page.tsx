"use client";
import { useTeachers } from "@/hooks";
import { fetcher } from "@/libs/axios";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import TableHead from "./component/TableHead";
import TableBody from "./component/TableBody";
import TeacherList from "./component/TeacherList";
import HeightIcon from "@mui/icons-material/Height";
import PrimaryButton from "@/components/mui/PrimaryButton";
import TableResult from "./component/TableResult";
import { ExportTeacherTable } from "./functions/ExportTeacherTable";
import { ExportTeacherSummary } from "./functions/ExportTeacherSummary";
const AllTimeslot = () => {
  // TODO: คาบล็อกแสดงเป็นตัวอักษรสีแดง
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const allTeacher = useTeachers();
  const [timeSlotData, setTimeSlotData] = useState({
    AllData: [], //ใช้กับตารางด้านล่าง
    SlotAmount: [],
    DayOfWeek: [],
  });
  const [classData, setClassData] = useState([]);
  const fetchTimeSlot = useSWR(
    () =>
      `/timeslot?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher,
    { revalidateOnFocus: false },
  );
  const fetchAllClassData = useSWR(
    () =>
      `/class/summary?AcademicYear=` +
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
        DayOfWeek: dayofweek,
        StartTime: startTime,
        Duration: duration,
        BreakSlot: breakTime,
      }));
    }
  }
  const getMinutes = (milliseconds: number) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    return minutes;
  };
  function fetchClassData() {
    if (!fetchAllClassData.isValidating) {
      const data = fetchAllClassData.data;
      setClassData(data);
    }
  }
  useEffect(() => {
    if (!fetchTimeSlot.isLoading) {
      fetchTimeslotData();
    }
    if (!fetchAllClassData.isLoading) {
      fetchClassData();
    }
  }, [fetchTimeSlot.isLoading, fetchAllClassData.data]);
  return (
    <>
      <div className="relative w-full h-[650px] overflow-x-hidden overflow-y-scroll border rounded p-2">
        {!fetchTimeSlot.isLoading && (
          <div className="flex">
            <TeacherList teachers={allTeacher.data} />
            <div className="w-full h-full cursor-move  overflow-x-scroll">
              <table>
                <TableHead
                  days={timeSlotData.DayOfWeek}
                  slotAmount={timeSlotData.SlotAmount}
                />
                <TableBody
                  teachers={allTeacher.data}
                  classData={classData}
                  slotAmount={timeSlotData.SlotAmount}
                  days={timeSlotData.DayOfWeek}
                />
              </table>
            </div>
            <TableResult teachers={allTeacher.data} classData={classData} />
          </div>
        )}
      </div>
      <div className="w-full h-10 flex justify-between mt-3">
        <div className="flex gap-3">
          <PrimaryButton
            handleClick={() =>
              ExportTeacherSummary(
                timeSlotData,
                allTeacher,
                classData,
                semester,
                academicYear,
              )
            }
            title={"นำสรุปข้อมูลออกเป็น Excel"}
            color={"secondary"}
            Icon={undefined}
            reverseIcon={false}
            isDisabled={fetchAllClassData.isLoading}
          />
          <PrimaryButton
            handleClick={() =>
              ExportTeacherTable(
                timeSlotData,
                allTeacher.data,
                classData,
                semester,
                academicYear,
              )
            }
            title={"นำตารางสอนครูทั้งหมดออกเป็น Excel"}
            color={"secondary"}
            Icon={undefined}
            reverseIcon={false}
            isDisabled={fetchAllClassData.isLoading}
          />
        </div>
        <div className="w-full flex justify-end items-center gap-3 mt-3 cursor-default">
          <div
            onClick={() => console.log(timeSlotData)}
            className="w-[75px] h-[35px] border rounded p-2 flex gap-1 items-center justify-start"
          >
            <p className="text-xs text-gray-400">Left Shift</p>
          </div>
          <p className="text-sm text-gray-400">+</p>
          <div className="w-[75px] h-[35px] border rounded p-2 flex gap-1 items-center justify-start">
            <p className="text-xs text-gray-400">Scroll</p>
            <HeightIcon color="action" />
          </div>
          <p className="text-sm text-gray-400">=</p>
          <p className="text-sm text-gray-400">
            เลื่อนดูเนื้อหาแนวนอน (สำหรับคอม)
          </p>
        </div>
      </div>
    </>
  );
};

export default AllTimeslot;
