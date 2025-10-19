"use client";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { BsTable, BsCalendar2Day } from "react-icons/bs";
import { LuClock10 } from "react-icons/lu";
import { MdSchool, MdLunchDining } from "react-icons/md";
import { TbTimeDuration45 } from "react-icons/tb";
import Counter from "../../component/Counter";
import CheckBox from "@/components/elements/input/selected_input/CheckBox";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import { Snackbar, Alert } from "@mui/material";

type Props = {};

function TimetableConfigValue({}: Props) {
  const params = useParams();
  const [startTime, setStartTime] = useState<string>("08:00");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const handleChangeStartTime = (e: any) => {
    setStartTime(() => e.target.value);
  };
  const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);
  const [snackBarMsg, setSnackBarMsg] = useState<string>("");
  const saved = () => {
    snackBarHandle("SAVED");
  };
  const snackBarHandle = (commitMsg: string): void => {
    setIsSnackBarOpen(true);
    setSnackBarMsg(
      commitMsg == "SAVED" ? "บันทึกการตั้งค่าสำเร็จ!" : "รีเซ็ทข้อมูลสำเร็จ!"
    );
  };
  return (
    <>
      <div className="flex w-full h-[80px] justify-between items-center border-b border-[#EDEEF3] mb-7">
        <h1 className="text-lg">
          ตั้งค่าตารางสอน{" "}
          <b>
            เทอม {params.semester} ปีการศึกษา {params.year}
          </b>
        </h1>
        <p className="text-[#3B8FEE] text-sm cursor-pointer">
          <u>รีเซ็ทเป็นค่าเริ่มต้น</u>
        </p>
      </div>
      <span className="flex flex-col gap-4">
        {/* Year */}
        {/* <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <p className="text-md">ปีการศึกษา</p>
          <Dropdown
            width="100%"
            height="40px"
            data={[2566, 2567, 2568, 2569]}
            currentValue={2566} //current year
            renderItem={({ data }: { data: any }): JSX.Element => (
              <li className="w-[70px]">{data}</li>
            )}
            handleChange={undefined}
            searchFunction={undefined}
          />
        </div> */}
        {/* Semester */}
        {/* <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <p className="text-md">เทอม</p>
          <Dropdown
            width="100%"
            height="40px"
            data={[1, 2]}
            currentValue={1}
            renderItem={({ data }: { data: any }): JSX.Element => (
              <li className="w-[70px]">{data}</li>
            )}
            handleChange={undefined}
            searchFunction={undefined}
          />
        </div> */}
        {/* School */}
        {/* <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <MdSchool size={25} className="fill-gray-400" />
            <p className="text-md">ชื่อโรงเรียน</p>
          </div>
          <p className="text-md text-gray-500">โรงเรียนศึกษาไอทีวิทยา</p>
        </div> */}
        {/* Config timeslot per day */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <BsTable size={25} className="fill-gray-500" />
            <p className="text-md">กำหนดคาบต่อวัน</p>
          </div>
          <Counter classifier="คาบ" initialValue={10} />
        </div>
        {/* Config duration */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <TbTimeDuration45 size={25} className="stroke-gray-500" />
            <p className="text-md">กำหนดระยะเวลาต่อคาบ</p>
          </div>
          <Counter classifier="นาที" initialValue={50} />
        </div>
        {/* Config time for start class */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
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
        <div className="flex w-full h-auto justify-between py-4 items-center">
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
                currentValue="5"
                placeHolder="เลือกคาบ"
                renderItem={({ data }: { data: any }): JSX.Element => (
                  <li className="w-[70px]">{data}</li>
                )}
                handleChange={undefined}
                searchFunction={undefined}
              />
            </div>
            <div className="flex justify-between items-center gap-3">
              <p className="text-md text-gray-500">มัธยมต้น</p>
              <Dropdown
                width="100%"
                height="40px"
                data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                currentValue="4"
                placeHolder="เลือกคาบ"
                renderItem={({ data }: { data: any }): JSX.Element => (
                  <li className="w-[70px]">{data}</li>
                )}
                handleChange={undefined}
                searchFunction={undefined}
              />
            </div>
          </div>
        </div>
        {/* Config day of week */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <BsCalendar2Day size={25} className="fill-gray-500" />
            <p className="text-md">กำหนดวันในตารางสอน</p>
          </div>
          <div className="flex gap-3">
            <CheckBox
              label="วันธรรมดา (ค่าเริ่มต้น)"
              checked={true}
              value={""}
              name={""}
              handleClick={undefined}
            />
            <CheckBox
              label="วันเสาร์"
              value={""}
              name={""}
              handleClick={undefined}
              checked={false}
            />
            <CheckBox
              label="วันอาทิตย์"
              value={""}
              name={""}
              handleClick={undefined}
              checked={false}
            />
          </div>
        </div>
        <div className="flex w-full h-[65px] justify-end items-center">
          {isSaved ? (
            <p className="text-green-400">บันทึกสำเร็จ !</p>
          ) : (
            // <button
            //   onClick={saved}
            //   className="bg-blue-100 hover:bg-blue-200 text-blue-500 duration-300 px-6 py-2 rounded"
            // >
            //   บันทึก
            // </button>
            <div className="flex gap-3">
              <PrimaryButton
                handleClick={saved}
                title={"บันทึก"}
                color={""}
                Icon={undefined}
                reverseIcon={false}
                isDisabled={false}
              />
              <PrimaryButton
                handleClick={undefined}
                title={"คืนค่าเริ่มต้น"}
                color={""}
                Icon={undefined}
                reverseIcon={false}
                isDisabled={false}
              />
            </div>
          )}
        </div>
        <Snackbar
          open={isSnackBarOpen}
          autoHideDuration={6000}
          onClose={() => setIsSnackBarOpen(false)}
        >
          <Alert
            onClose={() => setIsSnackBarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackBarMsg}
          </Alert>
        </Snackbar>
      </span>
    </>
  );
}

export default TimetableConfigValue;
