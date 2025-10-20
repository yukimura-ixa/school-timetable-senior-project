import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { Fragment } from "react";

interface ITimetableRowProps {
  day: any;
}
function TimetableRow({ day }: ITimetableRowProps) {
  return (
    <td
      className={`flex items-center justify-center p-[10px] h-[76px] rounded select-none`}
      style={{ backgroundColor: day.BgColor }}
    >
      <span className={`flex w-[50px] h-[24px] justify-center`}>
        <p style={{ color: day.TextColor }}>{day.Day}</p>
      </span>
    </td>
  );
}

export default TimetableRow;
