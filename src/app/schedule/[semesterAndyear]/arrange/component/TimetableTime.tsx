import { Fragment } from "react";

function TimetableTime({timeSlotData}) {
  function mapTime() {
    let map = [
      ...timeSlotData.SlotAmount.map((hour) => {
        //สร้าง format เวลา ตัวอย่าง => 2023-07-27T17:24:52.897Z
        let timeFormat = `0${timeSlotData.StartTime.Hours}:${
          timeSlotData.StartTime.Minutes == 0
            ? "00"
            : timeSlotData.StartTime.Minutes
        }`;
        //แยก เวลาเริ่มกับเวลาจบไว้ตัวแปรละอัน
        const timeStart = new Date(`2024-03-14T${timeFormat}:00.000Z`);
        const timeEnd = new Date(`2024-03-14T${timeFormat}:00.000Z`);
        //นำไปใส่ใน function addHours เพื่อกำหนดเวลาเริ่ม-จบ
        let start = addHours(timeStart, hour - 1); //เวลาเริ่มใส่ hours-1 เพราะคาบแรกไม่ต้องการให้บวกเวลา
        let end = addHours(timeEnd, hour); //จะต้องมากกว่า start ตาม duration ที่กำหนดไว้
        //แปลงจาก 2023-07-27T17:24:52.897Z เป็น 17:24 โดยใช้ slice
        return {
          Start: start.toISOString().slice(11, 16),
          End: end.toISOString().slice(11, 16),
        };
      }),
    ];
    return map;
  }
  return (
    <>
      <td className="flex items-center bg-gray-100 justify-center p-[10px] h-[40px] rounded">
        <span className="flex w-[50px] h-[24px] justify-center">
          <p className="text-gray-600">เวลา</p>
        </span>
      </td>
      {/* Map duration ของคาบเรียน */}
      {mapTime().map((item) => (
        <Fragment key={`woohoo${item.Start}${item.End}`}>
          <td className="flex grow items-center justify-center py-[10px] h-[40px] rounded bg-gray-100 select-none">
            <p className="flex text-xs w-full items-center justify-center h-[24px] text-gray-600">
              {item.Start}-{item.End}
            </p>
          </td>
        </Fragment>
      ))}
    </>
  );
}

export default TimetableTime;
