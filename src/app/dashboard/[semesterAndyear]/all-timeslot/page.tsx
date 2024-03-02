"use client";
import { useTeacherData } from "@/app/_hooks/teacherData";
import { fetcher } from "@/libs/axios";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { semester } from "@prisma/client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import TableHead from "./component/TableHead";
import TableBody from "./component/TableBody";

type Props = {};

const AllTimeslot = (props: Props) => {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const allTeacher = useTeacherData();
  const [timeSlotData, setTimeSlotData] = useState({
    AllData: [], //ใช้กับตารางด้านล่าง
    SlotAmount: [],
    DayOfWeek: [],
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
      setTimeSlotData(() => ({
        AllData: data.map((data) => ({ ...data, subject: {} })),
        SlotAmount: slotAmount,
        DayOfWeek: dayofweek,
      }));
    }
  }
  useEffect(() => {
    if (!fetchTimeSlot.isLoading) {
      fetchTimeslotData();
    }
  }, [fetchTimeSlot.isLoading]);
  return (
    <>
        <div className="w-full h-[650px] overflow-x-scroll overflow-y-scroll border rounded p-2">
            {!fetchTimeSlot.isLoading ? (
            <table>
                <TableHead
                    days={timeSlotData.DayOfWeek}
                    slotAmount={timeSlotData.SlotAmount}
                />
                <TableBody teachers={allTeacher.data} slotAmount={timeSlotData.SlotAmount} days={timeSlotData.DayOfWeek} />
            </table>
        ) : null}
        </div>
    </>
  );
};

export default AllTimeslot;
