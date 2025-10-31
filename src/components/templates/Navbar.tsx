"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { usePathname } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut, useSession } from "next-auth/react";

import userIcon from "../../../public/svg/user/usericon.svg";
import { SemesterSelector } from "./SemesterSelector";

function Navbar() {
  const session = useSession();
  console.log("session", session);
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
                {session.data?.user?.role === "admin" ? (
                  <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                    <Link href={"/management/teacher"}>
                      <p className="text-md">จัดการ</p>
                    </Link>
                  </li>
                ) : null}
                <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                  <Link href={"/dashboard/select-semester"}>
                    <p className="text-md">สรุปข้อมูล</p>
                  </Link>
                </li>
                {/* <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                  <Link href={"/management/teacher"}>
                    <p className="text-md">พิมพ์เอกสาร</p>
                  </Link>
                </li> */}
                {/* <li className="py-2 px-1 hover:border-b-4 hover:border-cyan-500 transition-all cursor-pointer">
                  <Link href={"/dashboard/teacher"}>
                    <p className="text-md">คู่มือการใช้งาน</p>
                  </Link>
                </li> */}
              </ul>
            </span>
            {/* Rightside */}
            <div className="flex w-fit justify-between gap-3 items-center mr-10">
              {/* Semester Selector */}
              {session.status === "authenticated" && <SemesterSelector />}
              
              {/* Leftside */}
              <div className={`flex justify-between gap-3 items-center`}>
                <div
                  className={` rounded-full relative cursor-pointer border`}
                  onMouseEnter={() => setIsHoverPhoto(true)}
                  onMouseLeave={() => setIsHoverPhoto(false)}
                >
                  {/* {isHoverPhoto ? (
                    <AddPhotoAlternateIcon className="fill-white absolute z-50 top-2 left-2" />
                  ) : null} */}
                  <Image
                    className={`${
                      isHoverPhoto ? "opacity-50" : null
                    } rounded-full`}
                    width={40}
                    height={40}
                    src={
                      session.data?.user?.image
                        ? session.data?.user?.image
                        : userIcon
                    }
                    alt="profile_pic"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-sm">
                    {session.status !== "authenticated"
                      ? "นักเรียน"
                      : session.data?.user?.name}
                  </p>
                  {/* <p className="text-md text-slate-400">คุณครู</p> */}
                </div>
              </div>
              {/* Rightside */}
              {session.status === "authenticated" ? (
                <LogoutIcon
                  onClick={() => void signOut()}
                  className="cursor-pointer fill-gray-700"
                />
              ) : null}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

export default Navbar;
