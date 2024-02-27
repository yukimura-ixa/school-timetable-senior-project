import { timeslot } from "@prisma/client";
import { Fragment } from "react";

interface ITimetableHeaderProps {
  timeslot: timeslot[];
}

function TimetableHeader({ timeslot }: ITimetableHeaderProps) {
  const mondaySlots = timeslot.filter((item) => item.DayOfWeek === "MON");
  const slotAmount = mondaySlots.length;
  const mapSlot = Array.from({ length: slotAmount }, (_, i) => i + 1);

  function getTime(timeString: string | Date): string {
    const time = new Date(timeString);
    const hour = time.toISOString().slice(11, 13);
    const minutes = time.toISOString().slice(14, 16);
    return `${hour}:${minutes}`;
  }
  return (
    <>
      <tr className="flex gap-3">
        {/* Column for time labels */}
        <th className="flex items-center justify-center p-[10px] h-[53px] rounded select-none">
          <span className="flex text-gray-600 font-light w-[50px] h-[24px] justify-center">
            คาบที่
          </span>
        </th>

        {/* Header cells for each day */}
        {mapSlot.map((item) => (
          <Fragment key={`woohoo${item}`}>
            <th className="flex font-light bg-gray-100 grow items-center justify-center p-[10px] h-[53px] rounded select-none">
              <p className="text-gray-600">{item < 10 ? `0${item}` : item}</p>
            </th>
          </Fragment>
        ))}
      </tr>
      <tr className="flex gap-3 mt-1">
        <th className="flex items-center justify-center p-[10px] h-[53px] rounded select-none">
          <span className="flex text-gray-600 font-light w-[50px] h-[24px] justify-center">
            เวลา
          </span>
        </th>
        {/* Map duration ของคาบเรียน */}
        {mondaySlots.map((item) => (
          <th className="flex font-light bg-gray-100 grow items-center justify-center p-[10px] h-[53px] rounded select-none">
            <p className="flex text-xs w-full items-center justify-center h-[24px] text-gray-600">
              {getTime(item.StartTime)}-{getTime(item.EndTime)}
            </p>
          </th>
        ))}
      </tr>
    </>
  );
}

export default TimetableHeader;
