"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import profilepic from "@/svg/profilepic.svg";
import { usePathname } from "next/navigation";
import LogoutIcon from '@mui/icons-material/Logout';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

function Navbar() {
  const pathName = usePathname();
  const [isHoverPhoto, setIsHoverPhoto] = useState<boolean>(false);
  return (
    <>
      {pathName == "/signin" || pathName == "/" ? null : (
        <nav className="flex w-[1280px] xl:w-full justify-center border-b">
          <div className="flex w-full xl:w-[1440px] h-full justify-between bg-white px-3 py-3">
            {/* Leftside */}
            <span className="flex w-fit justify-between items-center gap-10">
              <Link href={"/"}>
                <h1 className=" text-lg font-bold cursor-pointer">
                  ระบบจัดตารางเรียนตารางสอน
                </h1>
              </Link>
              <ul className="flex w-fit justify-between gap-5">
                <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                  <Link href={"/management/teacher"}>
                    <p className="text-md">เมนูทั้งหมด</p>
                  </Link>
                </li>
                <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                  <Link href={"/dashboard/select-semester"}>
                    <p className="text-md">แดชบอร์ด</p>
                  </Link>
                </li>
                <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                  <Link href={"/management/teacher"}>
                    <p className="text-md">พิมพ์เอกสาร</p>
                  </Link>
                </li>
                <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                  <Link href={"/dashboard/teacher"}>
                    <p className="text-md">คู่มือการใช้งาน</p>
                  </Link>
                </li>
              </ul>
            </span>
            {/* Rightside */}
            <div className="flex w-fit justify-between gap-3 items-center mr-10">
              {/* Leftside */}
              <div className={`flex justify-between gap-3 items-center`}>
                <div className={`${isHoverPhoto ? "bg-black" : null} rounded-full relative cursor-pointer border`} onMouseEnter={() => setIsHoverPhoto(true)} onMouseLeave={() => setIsHoverPhoto(false)}>
                  {isHoverPhoto ? <AddPhotoAlternateIcon className="fill-white absolute z-50 top-2 left-2" /> : null}
                  <Image className={`${isHoverPhoto ? "opacity-50" : null} rounded-full`} width={40} height={40} src={'data:image/png;base64,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'} alt="profile_pic" />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-sm">โรงเรียนศึกษาไอทีวิทยา</p>
                  {/* <p className="text-md text-slate-400">คุณครู</p> */}
                </div>
              </div>
              {/* Rightside */}
              <Link href={"/signin"}>
                <LogoutIcon className="cursor-pointer fill-gray-700" />
              </Link>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

export default Navbar;
