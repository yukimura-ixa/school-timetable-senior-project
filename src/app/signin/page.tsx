"use client";
import Button from "@/components/elements/static/Button";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import React, { useState } from "react";
import { BiKey, BiUser } from "react-icons/bi";
import CheckIcon from '@mui/icons-material/Check';
import LoginIcon from '@mui/icons-material/Login';
import Link from "next/link";

type Props = {};

function page({}: Props) {
  const [showPassword, setShowPassWord] = useState<boolean>(false);
  const [user, setUser] = useState({ Username: "", Password: "" });
  const [password, setPassword] = useState<string>("");
  return (
    <>
      <div className="w-full flex justify-between">
        <div className="flex flex-col w-1/2 h-screen bg-gray-300 justify-center pl-16 gap-2">
          <p className="text-2xl font-bold">School</p>
          <p className="text-2xl font-bold">Timetable</p>
          <p className="text-2xl font-bold">Management System</p>
          <p className="text-lg">
            ระบบจัดตารางเรียนตารางสอนสำหรับโรงเรียน (มัธยม)
          </p>
        </div>
        <div className="w-[960px] h-screen bg-white flex justify-center items-center">
          <div className="flex flex-col gap-5 w-[500px] h-[500px] drop-shadow rounded-md bg-white py-16 px-10">
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl">เข้าสู่ระบบ</h1>
              <p className="text-sm text-gray-400">
                ระบบจัดตารางเรียนตารางสอนสำหรับโรงเรียน
              </p>
            </div>
            <div className="flex flex-col gap-5">
              {/* input username */}
              <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-600">ชื่อผู้ใช้</label>
                <span className="relative flex">
                  <BiUser className="absolute left-2 top-1/3" />
                  <input
                    type="text"
                    value={user.Username}
                    onChange={(e: any) =>
                      setUser(() => ({ ...user, Username: e.target.value }))
                    }
                    className="w-full h-[40px] border pl-8 border-gray-200 rounded outline-none"
                  />
                </span>
              </div>
              {/* input password */}
              <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-600">รหัสผ่าน</label>
                <span className="relative flex">
                  <BiKey className="absolute left-2 top-1/3" />
                  <input
                    type="password"
                    value={user.Password}
                    onChange={(e: any) =>
                      setUser(() => ({ ...user, Password: e.target.value }))
                    }
                    className="w-full h-[40px] border pl-8 pr-2 border-gray-200 rounded outline-none"
                  />
                </span>
              </div>
              <Link href={"/management/teacher"}>
                <PrimaryButton handleClick={undefined} title={"ยืนยัน"} color={"primary"} Icon={<LoginIcon />} reverseIcon={false} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default page;
