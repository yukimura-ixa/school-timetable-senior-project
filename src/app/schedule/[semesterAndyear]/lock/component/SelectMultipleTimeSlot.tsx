import { useTimeslots, useSemesterSync } from "@/hooks";
import { subjectCreditValues } from "@/models/credit-value";
import type { subject_credit } from '@/prisma/generated/client';;
import { useParams } from "next/navigation";
import React, { Fragment, use, useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";

import type { subject, teacher } from '@/prisma/generated/client';;

type Props = {
  subject?: subject;
  timeSlotHandleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checkedCondition: string[];
  required: boolean;
  daySelected?: string;
};

function SelectMultipleTimeSlot(props: Props) {
  // /timeslot?AcademicYear=2566&Semester=SEMESTER_2
  const params = useParams();
  
  // Use useSemesterSync to extract and sync semester with global store
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  
  const timeSlotData = useTimeslots(
    parseInt(academicYear || '0'),
    parseInt(semester || '0'),
  );
  const [timeSlot, setTimeSlot] = useState<string[]>([]);
  useEffect(() => {
    if (!timeSlotData.isLoading) {
      setTimeSlot(() =>
        timeSlotData.data
          .filter((item) => item.DayOfWeek === props.daySelected)
          .map((item) => item.TimeslotID),
      );
    }
  }, [timeSlotData.isLoading, props.daySelected]);


  const checkTimeslotCond = (index: number) => {
    if (!props.subject?.Credit) return false;
    const creditValue = subjectCreditValues[props.subject.Credit];
    if (!creditValue) return false;
    const timeslotCredit = creditValue * 2;
    const checkedIndex = props.checkedCondition.map((item) =>
      timeSlot.indexOf(item),
    );

    // ถ้าไม่มีการเลือก
    if (checkedIndex.length === 0 || checkedIndex.includes(index)) return true;
    // ถ้าเลือกมากกว่า 1 ตัว
    if (checkedIndex.length >= timeslotCredit) return false;
    const min = Math.min(...checkedIndex);
    const max = Math.max(...checkedIndex);
    return index === min - 1 || index === max + 1;
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
