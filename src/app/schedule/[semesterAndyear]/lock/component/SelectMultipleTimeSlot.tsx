import { useTimeslotData } from "@/app/_hooks/timeslotData";
import { fetcher } from "@/libs/axios";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { useParams } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";
import useSWR from "swr";

type Props = {
  timeSlotHandleChange: any;
  checkedCondition: any;
  required: boolean;
  daySelected: string;
};

function SelectMultipleTimeSlot(props: Props) {
  // /timeslot?AcademicYear=2566&Semester=SEMESTER_2
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-"
  ); //from "1-2566" to ["1", "2566"]
  const timeSlotData = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () =>
      `/timeslot?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}`,
    fetcher
  );
  const [timeSlot, setTimeSlot] = useState([]);
  useEffect(() => {
    if (!timeSlotData.isLoading) {
      setTimeSlot(() =>
        timeSlotData.data
          .filter((item) => dayOfWeekThai[item.DayOfWeek] == props.daySelected)
          .map((item) => parseInt(item.TimeslotID.substring(item.TimeslotID.length - 1)))
      );
    }
  }, [timeSlotData.isLoading, props.daySelected]);
  return (
    <>
      <div className="flex justify-between w-full">
        <div className="text-sm flex gap-1 items-center">
          <p onClick={() => console.log(timeSlot)}>คาบที่</p>
          <p className="text-red-500">*</p>
          {props.required ? (
            <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
              <BsInfo className="bg-red-500 rounded-full fill-white" />
              <p className="text-red-500 text-sm">ต้องการ</p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3 w-[230px] relative">
            {timeSlot.length == 0 ? (
              <p className="text-sm text-red-500 absolute right-0">*กรุณาเลือกวันที่เรียน</p>
            ) : (
              timeSlot.map((item) => (
                <Fragment key={`slot${item}`}>
                  <input
                    type="checkbox"
                    value={item}
                    name={`checkboxTimeSlot`}
                    onChange={props.timeSlotHandleChange}
                    checked={props.checkedCondition.includes(item)}
                  />
                  <label>{item}</label>
                </Fragment>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectMultipleTimeSlot;
