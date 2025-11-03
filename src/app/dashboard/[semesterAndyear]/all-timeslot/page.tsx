"use client";
import { useTeachers, useSemesterSync } from "@/hooks";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { getSummaryAction } from "@/features/class/application/actions/class.actions";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import type { timeslot } from "@/prisma/generated";
import type { ClassScheduleWithSummary } from "@/features/class/infrastructure/repositories/class.repository";
import TableHead from "./component/TableHead";
import TableBody from "./component/TableBody";
import TeacherList from "./component/TeacherList";
import HeightIcon from "@mui/icons-material/Height";
import PrimaryButton from "@/components/mui/PrimaryButton";
import TableResult from "./component/TableResult";
import { ExportTeacherTable } from "./functions/ExportTeacherTable";
import { ExportTeacherSummary } from "./functions/ExportTeacherSummary";
import type { ActionResult } from "@/shared/lib/action-wrapper";

interface TimeSlotData {
  AllData: (timeslot & { subject: Record<string, never> })[];
  SlotAmount: number[];
  DayOfWeek: { Day: string; TextColor: string; BgColor: string }[];
  StartTime?: { Hours: number; Minutes: number };
  Duration?: number;
  BreakSlot?: { TimeslotID: string; Breaktime: string; SlotNumber: number }[];
}

const AllTimeslot = () => {
  // TODO: คาบล็อกแสดงเป็นตัวอักษรสีแดง
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  const allTeacher = useTeachers();
  const [timeSlotData, setTimeSlotData] = useState<TimeSlotData>({
    AllData: [], //ใช้กับตารางด้านล่าง
    SlotAmount: [],
    DayOfWeek: [],
  });
  const [classData, setClassData] = useState<ClassScheduleWithSummary[]>([]);
  const fetchTimeSlot = useSWR(
    semester && academicYear
      ? ['timeslots-by-term', academicYear, semester]
      : null,
    async ([, year, sem]) => {
      return await getTimeslotsByTermAction({
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2',
      });
    },
    { revalidateOnFocus: false },
  );
  const fetchAllClassData = useSWR(
    semester && academicYear
      ? ['class-summary', academicYear, semester]
      : null,
    async ([, year, sem]) => {
      return await getSummaryAction({
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2',
      });
    },
    { revalidateOnFocus: false },
  );
  function fetchTimeslotData() {
    const result = fetchTimeSlot.data;
    if (!fetchTimeSlot.isValidating && result?.success && result.data) {
      const data: timeslot[] = result.data;
      const dayofweek = data
        .map((day) => day.DayOfWeek)
        .filter(
          (item, index) =>
            data.map((day) => day.DayOfWeek).indexOf(item) === index,
        )
        .map((item) => ({
          Day: dayOfWeekThai[item],
          TextColor: dayOfWeekTextColor[item],
          BgColor: dayOfWeekColor[item],
        }))
        .filter((item): item is { Day: string; TextColor: string; BgColor: string } => 
          item.Day !== undefined && item.TextColor !== undefined && item.BgColor !== undefined
        ); //filter เอาตัวซ้ำออก ['MON', 'MON', 'TUE', 'TUE'] => ['MON', 'TUE'] แล้วก็ map เป็นชุดข้อมูล object
      const slotAmount = data
        .filter((item) => item.DayOfWeek === "MON") //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        .map((item, index) => index + 1); //ใช้สำหรับ map หัวตารางในเว็บ จะ map จาก data เป็น number of array => [1, 2, 3, 4, 5, 6, 7]
      const breakTime = data
        .filter(
          (item) =>
            (item.Breaktime === "BREAK_BOTH" ||
              item.Breaktime === "BREAK_JUNIOR" ||
              item.Breaktime === "BREAK_SENIOR") &&
            item.DayOfWeek === "MON", //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        )
        .map((item) => ({
          TimeslotID: item.TimeslotID,
          Breaktime: item.Breaktime,
          SlotNumber: parseInt(item.TimeslotID.substring(10)),
        })); //เงื่อนไขที่ใส่คือเอาคาบพักออกมา
      const firstSlot = data[0];
      const startTime = firstSlot ? {
        Hours: new Date(firstSlot.StartTime).getHours() - 7, //พอแปลงมันเอาเวลาของ indo เลย -7 กลับไป
        Minutes: new Date(firstSlot.StartTime).getMinutes(),
      } : { Hours: 8, Minutes: 0 };
      const duration = firstSlot ? getMinutes(
        new Date(firstSlot.EndTime).getTime() -
          new Date(firstSlot.StartTime).getTime(),
      ) : 50; //เอาเวลาจบลบเริ่มจะได้ duration
      setTimeSlotData({
        AllData: data.map((data) => ({ ...data, subject: {} })),
        SlotAmount: slotAmount,
        DayOfWeek: dayofweek,
        StartTime: startTime,
        Duration: duration,
        BreakSlot: breakTime,
      });
    }
  }
  const getMinutes = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes;
  };
  function fetchClassData() {
    const result = fetchAllClassData.data as ActionResult<ClassScheduleWithSummary[]> | undefined;
    if (!fetchAllClassData.isValidating && result?.success && result.data) {
      setClassData(result.data);
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
