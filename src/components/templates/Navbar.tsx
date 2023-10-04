import Image from "next/image";
import Link from "next/link";
import React from "react";

import profilepic from "@/svg/profilepic.svg";

function Navbar() {
  return (
    <>
      <nav className="flex w-[1280px] xl:w-full justify-center">
        <div className="flex w-full xl:w-[1440px] h-full justify-between bg-white px-3 py-3">
          {/* Leftside */}
          <span className="flex w-fit justify-between items-center gap-10">
            <h1 className=" text-lg font-bold cursor-pointer">
              ระบบจัดตารางเรียนตารางสอน
            </h1>
            <ul className="flex w-fit justify-between gap-5">
              <li className="hover:bg-slate-100 p-2 rounded-xl duration-300">
                <Link href={'/'}>
                  <p className="text-md cursor-pointer">เมนูทั้งหมด</p>
                </Link>
              </li>
              <li className="hover:bg-slate-100 p-2 rounded-xl duration-300">
                <Link href={'/'}>
                  <p className="text-md cursor-pointer">แดชบอร์ด</p>
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
    </>
  );
}

export default Navbar;
