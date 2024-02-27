import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { timeslot } from "@prisma/client";
import { Fragment } from "react"

interface ITimetableRowProps {
  timeslot: timeslot[];
  day: string;
}
function TimetableRow({ timeslot, day }: ITimetableRowProps) {
  return (
    <Fragment key={day}>
      <td
        className={`flex items-center justify-center p-[10px] h-[76px] rounded select-none`}
        style={{ backgroundColor: dayOfWeekColor[day] }}
      >
        <span className={`flex w-[50px] h-[24px] justify-center`}>
          <p style={{ color: dayOfWeekTextColor[day] }}>{dayOfWeekThai[day]}</p>
        </span>
      </td>
    </Fragment>
  );
}

export default TimetableRow;
