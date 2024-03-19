import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { timeslot } from "@prisma/client";
import { Fragment } from "react";
interface ITimetableHeaderProps {
  timeslot: timeslot[];
}

function TimetableHeader({ timeslot }: ITimetableHeaderProps) {
  const slotAmount = timeslot.SlotAmount.length;
  const mapSlot = Array.from({ length: slotAmount }, (_, i) => i + 1);

  function formatTime(time) {
    const date = new Date(time)
    const hours = date.getHours() - 7 < 10 ? `0${date.getHours() - 7}` : date.getHours() - 7
    const minutes = date.getMinutes() == 0 ? `0${date.getMinutes()}` : date.getMinutes();
    return `${hours}:${minutes}`
  }
  return (
    <>
      <tr className="flex gap-4">
        {/* Column for time labels */}
        <td className="flex items-center bg-gray-100 justify-center p-[10px] h-full rounded">
            <span className="flex w-[50px] justify-center">
              <p className="text-gray-600" onClick={() => console.log(timeslot)}>คาบที่</p>
            </span>
        </td>

        {/* Header cells for each day */}
        {mapSlot.map((item) => (
          <Fragment key={`slot-${item}`}>
            <th className="flex font-light bg-gray-100 grow items-center justify-center p-[10px] h-[53px] rounded select-none">
              <p className="text-gray-600">{item < 10 ? `0${item}` : item}</p>
            </th>
          </Fragment>
        ))}
      </tr>
      <tr className="flex gap-4">
        <td className="flex items-center bg-gray-100 justify-center p-[10px] h-full rounded">
          <span className="flex w-[50px] justify-center">
            <p className="text-gray-600">เวลา</p>
          </span>
        </td>
        {timeslot.AllData.filter(item => item.DayOfWeek == "MON").map((item) => (
          <Fragment key={`Time${item.StartTime}${item.EndTime}`}>
            <td className="flex flex-col min-[1440px]:flex-row grow items-center justify-center py-[10px] rounded bg-gray-100 select-none">
              <p className="flex text-xs w-full items-center justify-center text-gray-600">
                {formatTime(item.StartTime)}
              </p>
              <p className="flex text-xs items-center justify-center text-gray-600">
                -
              </p>
              <p className="flex text-xs w-full items-center justify-center text-gray-600">
                {formatTime(item.EndTime)}
              </p>
            </td>
          </Fragment>
        ))}
      </tr>
    </>
  );
}

export default TimetableHeader;
