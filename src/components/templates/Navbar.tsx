"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { usePathname } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut, useSession } from "next-auth/react";

const FALLBACK_USER_ICON = "/svg/user/usericon.svg";
import { SemesterSelector } from "./SemesterSelector";

function Navbar() {
  const session = useSession();
  const pathName = usePathname();
  const [isHoverPhoto, setIsHoverPhoto] = useState<boolean>(false);
  return (
    <>
      {pathName === "/signin" || pathName === "/" ? null : (
        <nav className="flex w-[1280px] xl:w-full justify-center border-b border-gray-200 shadow-sm bg-white">
          <div className="flex w-full xl:w-[1440px] h-full justify-between bg-white px-6 py-3">
            {/* Leftside */}
            <span className="flex w-fit justify-between items-center gap-10">
              <Link href={"/"} className="group">
                <h1 className="text-lg font-bold cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700 transition-all">
                  ระบบจัดตารางเรียนตารางสอน
                </h1>
              </Link>
              <ul className="flex w-fit justify-between gap-6">
                {session.data?.user?.role === "admin" ? (
                  <li className="relative py-2 px-3 group">
                    <Link href={"/management"}>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        จัดการ
                      </p>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ) : null}
                <li className="relative py-2 px-3 group">
                  <Link href={"/dashboard/select-semester"}>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      สรุปข้อมูล
                    </p>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              </ul>
            </span>
            {/* Rightside */}
            <div className="flex w-fit justify-between gap-4 items-center mr-10">
              {/* Semester Selector */}
              {session.status === "authenticated" && <SemesterSelector />}
              
              {/* User Info Card */}
              <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                <div
                  className="rounded-full relative cursor-pointer ring-2 ring-blue-200 hover:ring-blue-300 transition-all"
                  onMouseEnter={() => setIsHoverPhoto(true)}
                  onMouseLeave={() => setIsHoverPhoto(false)}
                >
                  <Image
                    className={`${
                      isHoverPhoto ? "opacity-75" : "opacity-100"
                    } rounded-full transition-opacity`}
                    width={44}
                    height={44}
                    src={session.data?.user?.image ?? FALLBACK_USER_ICON}
                    alt="profile_pic"
                    priority
                  />
                </div>
                <div className="flex flex-col min-w-[100px]">
                  <p className="font-semibold text-sm text-gray-800 truncate max-w-[150px]">
                    {session.status !== "authenticated"
                      ? "นักเรียน"
                      : session.data?.user?.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        session.data?.user?.role === "admin"
                          ? "bg-purple-500"
                          : session.data?.user?.role === "teacher"
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    />
                    <p className="text-xs font-medium text-slate-600">
                      {session.status === "authenticated" && session.data?.user?.role
                        ? session.data.user.role === "admin"
                          ? "ผู้ดูแลระบบ"
                          : session.data.user.role === "teacher"
                          ? "คุณครู"
                          : "นักเรียน"
                        : "ไม่ระบุบทบาท"}
                    </p>
                  </div>
                </div>
                {/* Logout Button */}
                {session.status === "authenticated" && (
                  <button
                    onClick={() => void signOut()}
                    className="ml-2 p-2 rounded-full hover:bg-red-50 transition-colors group"
                    aria-label="ออกจากระบบ"
                  >
                    <LogoutIcon className="w-5 h-5 fill-gray-600 group-hover:fill-red-600 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

export default Navbar;
