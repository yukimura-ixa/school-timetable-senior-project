"use client";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import React, { useState } from "react";
import StartIcon from "@mui/icons-material/Start";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex w-[1440px] h-screen flex-col justify-center pl-10 gap-5">
      <div className="flex gap-6 items-center">
        <div className="w-3 h-full bg-blue-600" />
        <h1 className="text-[64px]">ระบบจัดตารางเรียนตารางสอนโรงเรียน</h1>
      </div>
      <Link href={"/management/teacher"}>
        <PrimaryButton
          handleClick={() => {}}
          title={"เริ่มกันเลย"}
          color={""}
          Icon={<StartIcon />}
          reverseIcon={true}
        />
      </Link>
    </main>
  );
}
