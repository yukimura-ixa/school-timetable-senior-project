"use client";
import { useParams } from "next/navigation";
import SelectedValue from "@/app/schedule/tableconfig/component/SelectedValue";
import React, { useState } from "react";
import { MdSchool, MdLunchDining } from "react-icons/md";
import { BsTable } from "react-icons/bs";
import { TbTimeDuration45 } from "react-icons/tb";
import { LuClock10 } from "react-icons/lu";
import { BsCalendar2Day } from "react-icons/bs";
import Counter from "../../component/Counter";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import CheckBox from "@/components/elements/input/selected_input/CheckBox";
import Button from "@/components/elements/static/Button";
type Props = {};

function TableConfig({}: Props) {
  const params = useParams();
  const [startTime, setStartTime] = useState<string>("08:00");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const handleChangeStartTime = (e: any) => {
    setStartTime(() => e.target.value);
  };
  const saved = () => {
    setIsSaved(true);
    setInterval(() => {
      setIsSaved(false);      
    }, 5000);
  };
  return (
    <>
      <div className="flex w-full h-[80px] justify-between items-center border-b border-[#EDEEF3] mb-7">
        <h1 className="text-lg">
          ตั้งค่าตารางสอน <b>เทอม {params.semester}</b>
        </h1>
        <p className="text-[#3B8FEE] text-sm cursor-pointer">
          <u>รีเซ็ทเป็นค่าเริ่มต้น</u>
        </p>
      </div>
      <span className="flex flex-col gap-4">
        {/* Year */}
        <div className="flex w-full h-[65px] justify-between p-4 items-center border border-[#EDEEF3]">
          <p className="text-md">ปีการศึกษา</p>
          <SelectedValue />
        </div>
        {/* School */}
        <div className="flex w-full h-[65px] justify-between p-4 items-center border border-[#EDEEF3]">
          <div className="flex items-center gap-4">
            <MdSchool size={25} className="fill-gray-400" />
            <p className="text-md">ชื่อโรงเรียน</p>
          </div>
          <p className="text-md text-gray-500">โรงเรียนศึกษาไอทีวิทยา</p>
        </div>
        {/* Config timeslot per day */}
        <div className="flex w-full h-[65px] justify-between p-4 items-center border border-[#EDEEF3]">
          <div className="flex items-center gap-4">
            <BsTable size={25} className="fill-gray-500" />
            <p className="text-md">กำหนดคาบต่อวัน</p>
          </div>
          <Counter classifier="คาบ" initialValue={10} />
        </div>
        {/* Config duration */}
        <div className="flex w-full h-[65px] justify-between p-4 items-center border border-[#EDEEF3]">
          <div className="flex items-center gap-4">
            <TbTimeDuration45 size={25} className="stroke-gray-500" />
            <p className="text-md">กำหนดระยะเวลาต่อคาบ</p>
          </div>
          <Counter classifier="นาที" initialValue={50} />
        </div>
        {/* Config time for start class */}
        <div className="flex w-full h-[65px] justify-between p-4 items-center border border-[#EDEEF3]">
          <div className="flex items-center gap-4">
            <LuClock10 size={25} className="stroke-gray-500" />
            <p className="text-md">กำหนดเวลาเริ่มคาบแรก</p>
          </div>
          <input
            type="time"
            value={startTime}
            className="text-gray-500 outline-none h-[45px] border px-3 w-[140px]"
            onChange={handleChangeStartTime}
          />
        </div>
        {/* Config lunch time */}
        <div className="flex w-full h-auto justify-between p-4 items-center border border-[#EDEEF3]">
          <div className="flex items-center gap-4">
            <MdLunchDining size={25} className="fill-gray-500" />
            <p className="text-md">กำหนดคาบพักเที่ยง</p>
          </div>
          <div className="flex flex-col-reverse gap-4">
            <div className="flex justify-between items-center gap-3">
              <p className="text-md text-gray-500">มัธยมปลาย</p>
              <Dropdown
                width="100%"
                height="40px"
                data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                placeHolder="เลือกคาบ"
                renderItem={({ data }): JSX.Element => (
                  <li className="w-[70px]">{data}</li>
                )}
              />
            </div>
            <div className="flex justify-between items-center gap-3">
              <p className="text-md text-gray-500">มัธยมต้น</p>
              <Dropdown
                width="100%"
                height="40px"
                data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                placeHolder="เลือกคาบ"
                renderItem={({ data }): JSX.Element => (
                  <li className="w-[70px]">{data}</li>
                )}
              />
            </div>
          </div>
        </div>
        {/* Config day of week */}
        <div className="flex w-full h-[65px] justify-between p-4 items-center border border-[#EDEEF3]">
          <div className="flex items-center gap-4">
            <BsCalendar2Day size={25} className="fill-gray-500" />
            <p className="text-md">กำหนดวันในตารางสอน</p>
          </div>
          <div className="flex gap-3">
            <CheckBox label="วันธรรมดา (ค่าเริ่มต้น)" checked={true} />
            <CheckBox label="วันเสาร์" />
            <CheckBox label="วันอาทิตย์" />
          </div>
        </div>
        <div className="flex w-full h-[65px] justify-end items-center">
          {isSaved ? (
            <p className="text-green-400">บันทึกสำเร็จ !</p>
          ) : (
            <Button title="บันทึก" width={80} handleClick={saved} />
          )}
        </div>
      </span>
    </>
  );
}

export default TableConfig;
