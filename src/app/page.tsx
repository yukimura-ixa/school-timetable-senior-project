"use client";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import React, { useState } from "react";
import StartIcon from "@mui/icons-material/Start";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <main className="flex w-[1440px] h-screen flex-col justify-center pl-10 gap-5">
      <div className="flex gap-6 items-center">
        <div className="w-3 h-full bg-blue-600" />
        <h1 className="text-[64px]">ระบบจัดตารางเรียนตารางสอนโรงเรียน</h1>
      </div>

      <PrimaryButton
        handleClick={() =>
          signIn("google", { callbackUrl: "/dashboard/select-semester" })
        }
        title={"เข้าสู่ระบบ"}
        color={""}
        Icon={<StartIcon />}
        reverseIcon={true}
      />

      <Link href={"/dashboard/select-semester"}>
        <PrimaryButton
          handleClick={() => {}}
          title={"ดูตารางเรียนตารางสอน"}
          color={""}
          Icon={<StartIcon />}
          reverseIcon={true}
        />
      </Link>
    </main>
  );
}
