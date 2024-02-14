"use client";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsTable, BsCalendar2Day } from "react-icons/bs";
import { LuClock10 } from "react-icons/lu";
import { MdSchool, MdLunchDining } from "react-icons/md";
import { TbTimeDuration45 } from "react-icons/tb";
import CheckBox from "@/components/elements/input/selected_input/CheckBox";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import { Snackbar, Alert } from "@mui/material";
import Counter from "./component/Counter";
import api from "@/libs/axios";

// ! กดคืนค่าเริ่มต้นไม่ได้
// TODO: ทำปุ่มติ๊กเบรก 10 นาที (Minibreak)
type Props = {};

function TimetableConfigValue({}: Props) {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-"
  ); //from "1-2566" to ["1", "2566"]
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [configData, setConfigData] = useState({
    Days: ["MON", "TUE", "WED", "THU", "FRI"],
    AcademicYear: parseInt(academicYear),
    Semester: `SEMESTER_${semester}`,
    StartTime: "08:00",
    BreakDuration: 50,
    BreakTimeslots: {
      Junior: 4,
      Senior: 5,
    },
    Duration: 50,
    TimeslotPerDay: 10,
    MiniBreakDuration: 10,
    MiniBreakTimeslot: 1,
  });
  const handleChangeStartTime = (e: any) => {
    let value = e.target.value;
    setConfigData(() => ({ ...configData, StartTime: value }));
  };
  const [breakSlotMap, setBreakSlotMap] = useState([]); //เอาไว้แมพเพื่อใช้กับ กำหนดคาบพักเที่ยง ข้อมูลตัวอย่าง => [1, 2, 3, 4, 5]
  useEffect(() => {
    let breakSlot = []; //ก่อน render เสร็จจะให้ set ค่า default หรือค่าที่ได้มาก่อน
    for (let i = 0; i < configData.TimeslotPerDay; i++) {
      breakSlot.push(i + 1);
    }
    setBreakSlotMap(breakSlot);
    let currentValue = configData.TimeslotPerDay;
    let breakJVal = configData.BreakTimeslots.Junior;
    let breakSVal = configData.BreakTimeslots.Senior;
    if (breakJVal > currentValue || breakSVal > currentValue) {
      let jVal = breakJVal > currentValue ? currentValue : breakJVal; //ถ้า range เกินจะเซ็ทเป็นค่าสูงสุดของ TimeSlotPerDay
      let sVal = breakSVal > currentValue ? currentValue : breakSVal;
      setConfigData(() => ({
        ...configData,
        BreakTimeslots: { Junior: jVal, Senior: sVal },
      }));
    } //เช็คว่าถ้าคาบพักเที่ยงมี range ที่เกินจำนวนคาบต่อวัน จะให้ set เป็นค่าสูงสุดของจำนวนคาบโดยอัตโนมัติ
  }, [configData.TimeslotPerDay]);
  const handleChangeTimeSlotPerDay = (currentValue: number) => {
    setConfigData(() => ({ ...configData, TimeslotPerDay: currentValue }));
  };
  const handleChangeDuration = (currentValue: number) => {
    setConfigData(() => ({ ...configData, Duration: currentValue }));
  };
  const handleChangeBreakDuration = (currentValue: number) => {
    setConfigData(() => ({ ...configData, BreakDuration: currentValue }));
  };
  const handleChangeBreakTimeJ = (currentValue: number) => {
    setConfigData(() => ({
      ...configData,
      BreakTimeslots: {
        Junior: currentValue,
        Senior: configData.BreakTimeslots.Senior,
      },
    }));
  };
  const handleChangeBreakTimeS = (currentValue: number) => {
    setConfigData(() => ({
      ...configData,
      BreakTimeslots: {
        Senior: currentValue,
        Junior: configData.BreakTimeslots.Junior,
      },
    }));
  };
  const handleChangeMiniBreak = (currentValue: number) => {
    setConfigData(() => ({ ...configData, MiniBreakDuration: currentValue }));
  };
  const handleChangeMiniBreakTime = (currentValue: number) => {
    setConfigData(() => ({ ...configData, MiniBreakTimeslot: currentValue }));
  };
  const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);
  const [snackBarMsg, setSnackBarMsg] = useState<string>("");
  const saved = async () => {
    try {
      const response = await api.post("/timeslot", configData);
      console.log(response);
      if (response.status === 200) {
        snackBarHandle("SAVED");
      }
    } catch (error) {
      console.log(error);
      snackBarHandle("ERROR");
    }
  };
  const snackBarHandle = (commitMsg: string): void => {
    setIsSnackBarOpen(true);
    let message: string;
    if (commitMsg == "SAVED") {
      message = "บันทึกการตั้งค่าสำเร็จ!";
    } else if (commitMsg == "RESET") {
      message = "รีเซ็ทข้อมูลสำเร็จ!";
    } else if (commitMsg == "ERROR") {
      message = "บันทึกไม่สำเร็จ!";
    }

    setSnackBarMsg(message);
  };
  return (
    <>
      {/* <div className="flex w-full h-[80px] justify-between items-center border-b border-[#EDEEF3] mb-7">
        <h1 className="text-lg">
          ตั้งค่าตารางสอน{" "}
          <b>
            เทอม {params.semester} ปีการศึกษา {params.year}
          </b>
        </h1>
        <p className="text-[#3B8FEE] text-sm cursor-pointer">
          <u>รีเซ็ทเป็นค่าเริ่มต้น</u>
        </p>
      </div> */}
      <span className="flex flex-col gap-3 my-5 px-3">
        {/* Year */}
        {/* <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <p className="text-md">ปีการศึกษา</p>
          <Dropdown
            width="100%"
            height="40px"
            data={[2566, 2567, 2568, 2569]}
            currentValue={2566} //current year
            renderItem={({ data }): JSX.Element => (
              <li className="w-[70px]">{data}</li>
            )}
            handleChange={undefined}
            searchFunciton={undefined}
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
            renderItem={({ data }): JSX.Element => (
              <li className="w-[70px]">{data}</li>
            )}
            handleChange={undefined}
            searchFunciton={undefined}
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
          <Counter
            classifier="คาบ"
            currentValue={configData.TimeslotPerDay}
            onChange={handleChangeTimeSlotPerDay}
          />
        </div>
        {/* Config duration */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <TbTimeDuration45 size={25} className="stroke-gray-500" />
            <p className="text-md">กำหนดระยะเวลาต่อคาบ</p>
          </div>
          <Counter
            classifier="นาที"
            currentValue={configData.Duration}
            onChange={handleChangeDuration}
          />
        </div>
        {/* Config time for start class */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <LuClock10 size={25} className="stroke-gray-500" />
            <p className="text-md">กำหนดเวลาเริ่มคาบแรก</p>
          </div>
          <input
            type="time"
            value={configData.StartTime}
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
                data={breakSlotMap}
                currentValue={configData.BreakTimeslots.Senior}
                placeHolder="เลือกคาบ"
                renderItem={({ data }): JSX.Element => (
                  <li className="w-[70px]">{data}</li>
                )}
                handleChange={handleChangeBreakTimeS}
                searchFunciton={undefined}
              />
            </div>
            <div className="flex justify-between items-center gap-3">
              <p className="text-md text-gray-500">มัธยมต้น</p>
              <Dropdown
                width="100%"
                height="40px"
                data={breakSlotMap}
                currentValue={configData.BreakTimeslots.Junior}
                placeHolder="เลือกคาบ"
                renderItem={({ data }): JSX.Element => (
                  <li className="w-[70px]">{data}</li>
                )}
                handleChange={handleChangeBreakTimeJ}
                searchFunciton={undefined}
              />
            </div>
          </div>
        </div>
        {/* Config lunchtime duration */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <TbTimeDuration45 size={25} className="stroke-gray-500" />
            <p className="text-md">กำหนดระยะเวลาพักเที่ยง</p>
          </div>
          <Counter
            classifier="นาที"
            currentValue={configData.BreakDuration}
            onChange={handleChangeBreakDuration}
          />
        </div>
        {/* Config day of week */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <BsCalendar2Day size={25} className="fill-gray-500" />
            <p className="text-md">กำหนดวันในตารางสอน</p>
          </div>
          <div className="flex gap-3">
            <CheckBox
              label="วันจันทร์ - ศุกร์ (ค่าเริ่มต้น)"
              checked={true}
              value={""}
              name={""}
              handleClick={undefined}
            />
            {/* <CheckBox
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
            /> */}
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
              />
              <PrimaryButton
                handleClick={undefined}
                title={"คืนค่าเริ่มต้น"}
                color={""}
                Icon={undefined}
                reverseIcon={false}
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
