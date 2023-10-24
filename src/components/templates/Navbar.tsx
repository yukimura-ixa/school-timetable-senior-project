"use client"
import Image from "next/image";
import Link from "next/link";
import React from "react";

import profilepic from "@/svg/profilepic.svg";
import { usePathname } from "next/navigation";

function Navbar() {
  const pathName = usePathname()
  return (
    <>
      {pathName == '/signin'
      ?
      null
      :
      <nav className="flex w-[1280px] xl:w-full justify-center border-b">
        <div className="flex w-full xl:w-[1440px] h-full justify-between bg-white px-3 py-3">
          {/* Leftside */}
          <span className="flex w-fit justify-between items-center gap-10">
            <h1 className=" text-lg font-bold cursor-pointer">
              ระบบจัดตารางเรียนตารางสอน
            </h1>
            <ul className="flex w-fit justify-between gap-5">
              <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                <Link href={'/management/teacher'}>
                  <p className="text-md">เมนูทั้งหมด</p>
                </Link>
              </li>
              <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                <Link href={'/dashboard/teacher'}>
                  <p className="text-md">แดชบอร์ด</p>
                </Link>
              </li>
            </ul>
          </span>
          {/* Rightside */}
          <div className="flex w-fit justify-between gap-6 items-center">
            {/* Leftside */}
            <div className="flex justify-between gap-3 items-center cursor-pointer">
              <Image src={profilepic} alt="profile_pic" />
              <div className="flex flex-col">
                <p className="font-bold text-md">อัครเดช</p>
                <p className="text-md text-slate-400">คุณครู</p>
              </div>
            </div>
            {/* Rightside */}
            <p className="underline text-[#3B8FEE] text-md cursor-pointer">
              ออกจากระบบ
            </p>
          </div>
        </div>
      </nav>
      }
    </>
  );
}

export default Navbar;
