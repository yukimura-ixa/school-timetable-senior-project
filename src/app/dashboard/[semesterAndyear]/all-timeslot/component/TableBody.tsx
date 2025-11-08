import { dayOfWeekThai } from "@/models/dayofweek-thai";
import type { teacher } from "@/prisma/generated";
import LockIcon from "@mui/icons-material/Lock";

type ClassData = {
  teachers_responsibility: Array<{ TeacherID: number }>;
  timeslot: { DayOfWeek: string; TimeslotID: string };
  GradeID: string;
  [key: string]: any;
};

type DayData = {
  Day: string;
  BgColor: string;
  [key: string]: any;
};

type Props = {
  teachers: teacher[];
  slotAmount: number[];
  classData: ClassData[];
  days: DayData[];
};

const TableBody = (props: Props) => {
  function getClassDataByTeacherID(
    TeacherID: number,
    Day: string,
    SlotNumber: number,
  ) {
    const filterClass = props.classData.filter(
      (item) =>
        item.teachers_responsibility
          .map((tid) => tid.TeacherID)
          .includes(TeacherID) &&
        dayOfWeekThai[item.timeslot.DayOfWeek] == Day &&
        parseInt(item.timeslot.TimeslotID.substring(10)) == SlotNumber,
    );
    const convertClass = filterClass
      .map((item) => `${item.GradeID[0]}/${item.GradeID[2]}`)
      .join(",");
    // let convertClass = ["101", "102", "301", "302", "303", "304", "305", "306", "307", "308", "309", "310"].map(item => `${item[0]}/${item[2]}`).join(",")
    
      if (filterClass.length === 0) {
        return null;
      }
    
      const firstClass = filterClass[0];
      if (!firstClass) {
        return null;
      }
    
      const res = firstClass.IsLocked
        ? `${firstClass.SubjectCode}`
        : `${convertClass}\n${firstClass.SubjectCode}`;
      
      return (
        <div
          style={{ 
            color: firstClass.IsLocked ? "red" : "black",
            fontWeight: firstClass.IsLocked ? 600 : 400,
          }}
          className="text-xs text-center flex flex-col items-center gap-1"
        >
          {firstClass.IsLocked && <LockIcon sx={{ fontSize: 14 }} />}
          <p className="whitespace-pre-line">{res}</p>
        </div>
      );
  }
  return (
    <tbody>
      {props.teachers.map((tch, index) => (
        <tr
          key={`body-${index}`}
          className="flex items-center gap-2 mt-[2px] h-fit select-none"
        >
          {props.days.map((day) => (
            <td key={`day-${day.Day}`}>
              <div className="flex flex-col items-center">
                <div className="flex gap-2 w-fit">
                  {props.slotAmount.map((item, index) => (
                    <div
                      key={`slot-${index}`}
                      style={{ borderColor: day.BgColor }}
                      className={`relative w-14 h-[60px] border-2 flex items-center justify-center rounded overflow-hidden`}
                    >
                      <p className="text-xs absolute left-0 top-[-2px] text-gray-300">
                        {index + 1}
                      </p>
                      {getClassDataByTeacherID(tch.TeacherID, day.Day, item)}
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
