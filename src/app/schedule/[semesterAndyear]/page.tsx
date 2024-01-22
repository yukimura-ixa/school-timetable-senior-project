"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Snackbar, Alert, Link } from "@mui/material";
import { HiLockClosed } from "react-icons/hi2";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import ShowTeacherData from "./assign/component/ShowTeacherData";
type Props = {};

function Schedule({}: Props) {
  const pathName = usePathname();
  const router = useRouter();
  const params = useParams();
  const semesterSplit = (params.semesterAndyear as string).split('-'); //from "1-2566" to ["1", "2566"]
  const path = pathName.substring(0, 16);
  const [tabSelect, setTabSelect] = useState("");
  return (
    <>
      <div className='w-full flex justify-between items-center py-6'>
        <h1 className='text-xl font-bold'>ตารางสอน เทอม {semesterSplit[0]} ปีการศึกษา {semesterSplit[1]}</h1>
        <Link className='flex gap-3 items-center justify-between cursor-pointer' href={'/schedule/select-semester'}>
          <KeyboardBackspaceIcon className='fill-gray-500' />
          <p className='select-none text-gray-500 text-sm'>เปลี่ยนเทอม</p>
        </Link>
      </div>  
      <div className='flex flex-col gap-3'>
        <div className='flex pt-5 w-full h-fit border-b'>
          <button onClick={() => {router.replace(`${path}/config`), setTabSelect(() => "config")}} className={`flex w-fit h-[60px] ${tabSelect == "config" ? "bg-gray-100" : "bg-white"} items-center px-3 cursor-pointer focus:outline-none`}>
            <p>ตั้งค่าตารางสอน</p>
          </button>
          <button onClick={() => {router.replace(`${path}/assign`), setTabSelect(() => "assign")}} className={`flex w-fit h-[60px] ${tabSelect == "assign" ? "bg-gray-100" : "bg-white"} items-center px-3 cursor-pointer focus:outline-none`}>
            <p>มอบหมายวิชาเรียน</p>
          </button>
          <button onClick={() => {router.replace(`${path}/lock`), setTabSelect(() => "lock")}} className={`flex gap-3 w-fit h-[60px] ${tabSelect == "lock" ? "bg-gray-100" : "bg-white"} items-center px-3 cursor-pointer focus:outline-none`}>
            <HiLockClosed className="fill-gray-700" />
            <p>ล็อกคาบสอน</p>
          </button>
          <button onClick={() => {router.replace(`${path}/arrange`), setTabSelect(() => "arrange")}} className={`flex w-fit h-[60px] ${tabSelect == "arrange" ? "bg-gray-100" : "bg-white"} items-center px-3 cursor-pointer focus:outline-none`}>
            <p>จัดตารางสอน</p>
          </button>
        </div>
      </div>
    </>
  );
}

export default Schedule;
