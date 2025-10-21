import { useTimeslotData } from "@/app/_hooks/timeslotData";
import { subjectCreditValues } from "@/models/credit-value";
import { subject, subject_credit } from "@prisma/client";
import { useParams } from "next/navigation";
import React, { Fragment, use, useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";

type Props = {
  subject?: subject;
  timeSlotHandleChange: any;
  checkedCondition: any;
  required: boolean;
  daySelected: string;
};

function SelectMultipleTimeSlot(props: Props) {
  // /timeslot?AcademicYear=2566&Semester=SEMESTER_2
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const timeSlotData = useTimeslotData(
    parseInt(academicYear),
    parseInt(semester),
  );
  const [timeSlot, setTimeSlot] = useState([]);
  useEffect(() => {
    if (!timeSlotData.isLoading) {
      setTimeSlot(() =>
        timeSlotData.data
          .filter((item) => item.DayOfWeek == props.daySelected)
          .map((item) => item.TimeslotID),
      );
    }
  }, [timeSlotData.isLoading, props.daySelected]);


  const checkTimeslotCond = (index) => {
    const timeslotCredit = subjectCreditValues[props.subject.Credit] * 2;
    const checkedIndex = props.checkedCondition.map((item) =>
      timeSlot.indexOf(item),
    );

    // ถ้าไม่มีการเลือก
    if (checkedIndex.length == 0 || checkedIndex.includes(index)) return true;
    // ถ้าเลือกมากกว่า 1 ตัว
    if (checkedIndex.length >= timeslotCredit) return false;
    const min = Math.min(...checkedIndex);
    const max = Math.max(...checkedIndex);
    return index == min - 1 || index == max + 1;
  };

  return (
    <>
      <div className="flex justify-between w-full">
        <div className="text-sm flex gap-1 items-center">
          <p>คาบที่</p>
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
            {timeSlot.length == 0 || !props.subject ? (
              <p className="text-sm text-red-500 absolute right-0">
                *กรุณาเลือกวันที่เรียนและวิชา
              </p>
            ) : (
              timeSlot.map((item, index) => (
                <Fragment key={`slot${item}`}>
                  <input
                    type="checkbox"
                    value={item}
                    name="checkboxTimeSlot"
                    onChange={props.timeSlotHandleChange}
                    checked={props.checkedCondition.includes(item)}
                    disabled={!checkTimeslotCond(index)}
                  />
                  <label>{index + 1}</label>
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
