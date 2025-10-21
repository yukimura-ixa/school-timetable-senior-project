"use client";
import PrimaryButton from "@/components/mui/PrimaryButton";
import React, { useState } from "react";
import StartIcon from "@mui/icons-material/Start";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function Home() {
  const [bypassEnabled, setBypassEnabled] = useState(false);

  // Check if dev bypass is enabled via server-side API
  // This prevents the flag from being embedded in the client bundle
  useState(() => {
    fetch("/api/auth/dev-bypass-enabled")
      .then((res) => res.json())
      .then((data) => setBypassEnabled(data.enabled))
      .catch(() => setBypassEnabled(false));
  });

  const handleBypassLogin = () => {
    // Using signIn with dev-bypass provider
    signIn("dev-bypass", { callbackUrl: "/dashboard/select-semester" });
  };

  return (
    <main className="flex w-[1440px] h-screen flex-col justify-center pl-10 gap-5">
      <div className="flex gap-6 items-center">
        <div className="w-3 h-full bg-blue-600" />
        <h1 className="text-[64px]">ระบบจัดตารางเรียนตารางสอนโรงเรียน</h1>
      </div>

      {bypassEnabled && (
        <PrimaryButton
          handleClick={handleBypassLogin}
          title={"เข้าสู่ระบบ (Dev Bypass)"}
          color={"secondary"}
          Icon={<StartIcon />}
          reverseIcon={true}
        />
      )}

      <PrimaryButton
        handleClick={() =>
          signIn("google", { callbackUrl: "/dashboard/select-semester" })
        }
        title={"เข้าสู่ระบบ"}
        color={"primary"}
        Icon={<StartIcon />}
        reverseIcon={true}
      />

      <Link href={"/dashboard/select-semester"}>
        <PrimaryButton
          handleClick={() => {}}
          title={"ดูตารางเรียนตารางสอน"}
          color={"primary"}
          Icon={<StartIcon />}
          reverseIcon={true}
        />
      </Link>
    </main>
  );
}
