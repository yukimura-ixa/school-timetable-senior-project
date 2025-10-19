"use client";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type Props = {};

function TableConfig({}: Props) {
  const timeTableConfigList = [
    {
      Semester: 1,
      Year: 2565,
      Details: {
        ClassAmountPerDay: 10,
        ClassDuration: 50,
        StartTime: "8:30",
        LunchTime: { Junior: 4, Senior: 5 },
        DayOfWeek: "Mon - Fri",
      },
    },
    {
      Semester: 2,
      Year: 2565,
      Details: {
        ClassAmountPerDay: 10,
        ClassDuration: 50,
        StartTime: "8:30",
        LunchTime: { Junior: 4, Senior: 5 },
        DayOfWeek: "Mon - Fri",
      },
    },
    {
      Semester: 1,
      Year: 2566,
      Details: {
        ClassAmountPerDay: 10,
        ClassDuration: 50,
        StartTime: "8:30",
        LunchTime: { Junior: 4, Senior: 5 },
        DayOfWeek: "Mon - Fri",
      },
    },
    {
      Semester: 2,
      Year: 2566,
      Details: {
        ClassAmountPerDay: 10,
        ClassDuration: 50,
        StartTime: "8:30",
        LunchTime: { Junior: 4, Senior: 5 },
        DayOfWeek: "Mon - Fri",
      },
    },
    {
      Semester: 1,
      Year: 2567,
      Details: {
        ClassAmountPerDay: 10,
        ClassDuration: 50,
        StartTime: "8:30",
        LunchTime: { Junior: 4, Senior: 5 },
        DayOfWeek: "Mon - Fri",
      },
    },
  ];
  const [expandCardIndex, setExpandCardIndex] = useState<number>(null);
  return (
    <>
      <div className="flex py-4 border-b">
        <h1 className="text-md font-bold">ตั้งค่าตารางสอน</h1>
      </div>
      <div className="flex justify-end items-center py-4">
        <div className="flex gap-3">
          <div className="flex w-fit h-full items-center p-3 bg-cyan-100 rounded-lg text-center select-none">
            <p className="text-cyan-500 text-sm">
              ทั้งหมด {timeTableConfigList.length} รายการ
            </p>
          </div>
          {/* กดแล้วพาไปหน้าตั้งค่า */}
          <PrimaryButton
            handleClick={undefined}
            title={"เพิ่มเทอมใหม่"}
            color={"primary"}
            Icon={undefined}
            reverseIcon={false}
            isDisabled={false}
          />
        </div>
      </div>
      <div className={`flex flex-col-reverse gap-4`}>
        {timeTableConfigList.map((item, index) => (
          <React.Fragment key={`${item.Semester}/${item.Year}`}> 
            <div className={`flex flex-col cursor-pointer border bg-white`} onClick={() => setExpandCardIndex(() => expandCardIndex == index ? null : index)}>
              <div className="flex p-3 justify-between">
                <div className="flex gap-3 items-center">
                  <p className="text-sm select-none">
                    {item.Semester}/{item.Year}
                  </p>
                  <KeyboardArrowDownIcon className={`${index == expandCardIndex ? "rotate-180" : ""} transition-all duration-300`} />
                </div>
                <div className="flex gap-3">
                  {index == 3 ? (
                    <div className="flex w-fit h-full items-center p-3 bg-green-100 rounded-lg text-center select-none">
                      <p className="text-green-500 text-sm">กำลังใช้</p>
                    </div>
                  ) : null}
                  {/* พาไปหน้าปรับตั้งค่า พร้อมกับส่งเทอมและปีการศึกษาลงไป */}
                  <PrimaryButton
                    handleClick={undefined}
                    title={"แก้ไข"}
                    color={"warning"}
                    Icon={undefined}
                    reverseIcon={false}
                    isDisabled={false}
                  />
                </div>
              </div>
              {expandCardIndex == index ? (
                <div className="flex flex-col gap-3">
                  <div className="flex px-4 py-2 text-gray-500 text-sm justify-between">
                    <p>จำนวนคาบต่อวัน</p>
                    <p>{item.Details.ClassAmountPerDay} คาบ</p>
                  </div>
                  <div className="flex px-4 py-2 text-gray-500 text-sm justify-between">
                    <p>ระยะเวลาต่อคาบ</p>
                    <p>{item.Details.ClassDuration} นาที</p>
                  </div>
                  <div className="flex px-4 py-2 text-gray-500 text-sm justify-between">
                    <p>เวลาเริ่มคาบแรก</p>
                    <p>{item.Details.StartTime} นาฬิกา</p>
                  </div>
                  <div className="flex px-4 py-2 text-gray-500 text-sm justify-between">
                    <p>เวลาพักเที่ยง</p>
                    <p>
                      มัธยมต้น คาบที่ {item.Details.LunchTime.Junior} มัธยมปลาย
                      คาบที่ {item.Details.LunchTime.Senior}
                    </p>
                  </div>
                  <div className="flex px-4 py-2 mb-3 text-gray-500 text-sm justify-between">
                    <p>วันที่เรียน</p>
                    <p>{item.Details.DayOfWeek}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

export default TableConfig;
