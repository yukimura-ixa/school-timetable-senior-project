import React, { Fragment } from "react";

type Props = {};

function TimeSlot(props: Props) {
  const timsSlotData = {
    SlotAmount: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    StartTime: "",
    Duration: 50,
    DayOfWeek: ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"],
    BreakSlot: [4, 5],
  };
  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        {/* top row */}
        <div className="flex grow gap-4 items-center">
          <div className="flex items-center w-[85px] justify-center p-[10px] h-[53px] rounded border border-[#ABBAC1]">
            <div className="flex w-[50px] h-[24px] justify-center">คาบที่</div>
          </div>
          {timsSlotData.SlotAmount.map((item) => (
            <Fragment key={`woohoo${item}`}>
              <div className="flex grow items-center justify-center p-[10px] h-[53px] rounded border border-[#ABBAC1]">
                <p className="">{item}</p>
              </div>
            </Fragment>
          ))}
        </div>
        {/* time row */}
        <div className="flex grow gap-4 items-center">
          <div className="flex items-center w-[85px] justify-center p-[10px] h-[40px] rounded border border-[#ABBAC1]">
            <div className="flex w-[50px] h-[24px] justify-center">เวลา</div>
          </div>
          {[
            "08.30-09.20",
            "09.20-10.10",
            "10.10-11.00",
            "11.00-11.50",
            "11.50-12.40",
            "12.40-13.30",
            "13.30-14.20",
            "14.20-15.10",
            "15.10-16.00",
            "16.00-16.50",
          ].map((item) => (
            <Fragment key={`woohoo${item}`}>
              <div className="flex grow items-center justify-center py-[10px] h-[40px] rounded border border-[#ABBAC1]">
                <p className="flex text-xs w-full items-center justify-center h-[24px]">
                  {item}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
        {/* day */}
        {timsSlotData.DayOfWeek.map((day) => (
          <Fragment key={`asdasda${day}`}>
            <div className="flex grow gap-4 items-center">
              <div className="flex items-center w-[85px] justify-center p-[10px] h-[76px] rounded border border-[#ABBAC1]">
                <div className="flex w-[50px] h-[24px] justify-center">
                  {day}
                </div>
              </div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                <Fragment key={`woohoo${item}`}>
                  <div className="flex grow items-center cursor-pointer justify-center p-[10px] h-[76px] rounded border border-[#ABBAC1]">
                    {timsSlotData.BreakSlot.includes(item) ? (
                      <div className="flex flex-col items-center w-14 "></div>
                    ) : (
                      <div className="flex flex-col items-center w-14 ">
                        <p className="text-xs">ท21102</p>
                        <p className="text-xs">2/1</p>
                        <p className="text-xs">ห้อง 325</p>
                      </div>
                    )}
                  </div>
                </Fragment>
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}

export default TimeSlot;
