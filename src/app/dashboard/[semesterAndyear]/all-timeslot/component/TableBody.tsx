import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { teacher } from "@prisma/client";
import React from "react";

type Props = {
  teachers: teacher[];
  slotAmount: number[];
  classData: object[];
  days: object[];
};

const TableBody = (props: Props) => {
  function getClassDataByTeacherID (TeacherID:number, Day:string, SlotNumber:number):string {
    let filterClass = props.classData.filter(
      (item) =>
        item.subject.teachers_responsibility
          .map((tid) => tid.TeacherID)
          .includes(TeacherID) &&
        dayOfWeekThai[item.timeslot.DayOfWeek] == Day &&
        parseInt(item.timeslot.TimeslotID.substring(10)) == SlotNumber,
    );
    let res = filterClass.length == 0 ? "" : `${convertClass(filterClass[0].GradeID)}\n${filterClass[0].SubjectCode}`
    return res;
  }
  const convertClass = (GradeID: string) => {
    return `${GradeID[0]}/${GradeID.substring(2)}`;
  };
  return (
    <tbody>
      {props.teachers.map((tch, index) => (
        <tr className="flex items-center gap-2 mt-[2px] h-fit select-none">
          {props.days.map((day) => (
                <td>
                    <div className="flex flex-col items-center">
                        <div className="flex gap-2 w-fit">
                        {props.slotAmount.map((item, index) => (
                            <div style={{borderColor : day.BgColor}} className={`relative w-14 h-[60px] border-2 flex items-center justify-center rounded`}>
                                <p className="text-xs absolute left-0 top-[-2px] text-gray-300">{index+1}</p>
                                <p className="text-xs text-center">{getClassDataByTeacherID(tch.TeacherID, day.Day, item)}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                </td>
            ))}        
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
