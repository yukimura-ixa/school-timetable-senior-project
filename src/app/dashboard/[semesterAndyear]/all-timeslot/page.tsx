"use client";
import { useTeacherData } from "@/app/_hooks/teacherData";
import { fetcher } from "@/libs/axios";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import useSWR from "swr";
import TableHead from "./component/TableHead";
import TableBody from "./component/TableBody";
import TeacherList from "./component/TeacherList";
import { DragDealer } from "./horizontalDrag/DragDealer";
import MouseIcon from '@mui/icons-material/Mouse';
import HeightIcon from '@mui/icons-material/Height';
type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>;
const AllTimeslot = () => {
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

  const dragState = useRef(new DragDealer());
  const handleDrag =
    ({ scrollContainer }: scrollVisibilityApiType) =>
    (ev: React.MouseEvent) =>
      dragState.current.dragMove(ev, (posDiff: number) => {
        if (scrollContainer.current) {
          scrollContainer.current.scrollLeft += posDiff;
        }
    });
  return (
    <>
      <div className="relative w-full h-[650px] overflow-x-hidden overflow-y-scroll border rounded p-2">
        {!fetchTimeSlot.isLoading && (
          <div className="flex">
            <TeacherList teachers={allTeacher.data} />
            <div className="w-full h-full cursor-move  overflow-x-scroll" onMouseLeave={dragState.current.dragStop}>
                <table>
                  <TableHead
                    days={timeSlotData.DayOfWeek}
                    slotAmount={timeSlotData.SlotAmount}
                  />
                  <TableBody
                    teachers={allTeacher.data}
                    slotAmount={timeSlotData.SlotAmount}
                    days={timeSlotData.DayOfWeek}
                  />
                </table>
              {/* <ScrollMenu
                onMouseDown={() => dragState.current.dragStart}
                onMouseUp={() => dragState.current.dragStop}
                onMouseMove={handleDrag}
              >
                <table>
                  <TableHead
                    days={timeSlotData.DayOfWeek}
                    slotAmount={timeSlotData.SlotAmount}
                  />
                  <TableBody
                    teachers={allTeacher.data}
                    slotAmount={timeSlotData.SlotAmount}
                    days={timeSlotData.DayOfWeek}
                  />
                </table>
              </ScrollMenu> */}
            </div>
          </div>
        )}
      </div>
      <div className="w-full flex justify-end items-center gap-3 mt-3 cursor-default">
        <div className="w-[75px] h-[35px] border rounded p-2 flex gap-1 items-center justify-start">
          <p className="text-xs text-gray-400">Left Shift</p>
        </div>
        <p className="text-sm text-gray-400">+</p>
        <div className="w-[75px] h-[35px] border rounded p-2 flex gap-1 items-center justify-start">
          <p className="text-xs text-gray-400">Scroll</p>
          <HeightIcon color="action"/>
        </div>
        <p className="text-sm text-gray-400">=</p>
        <p className="text-sm text-gray-400">เลื่อนดูเนื่้อหาแนวนอน</p>
      </div>
    </>
  );
};

export default AllTimeslot;
