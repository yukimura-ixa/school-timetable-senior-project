"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import PrimaryButton from "@/components/mui/PrimaryButton";
import HomeIcon from "@mui/icons-material/Home";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const match = pathname?.match(/\/(dashboard|schedule)\/(\d-\d{4})\//);
  const termLabel = match?.[2]?.replace("-", "/");

  useEffect(() => {
    console.error("Schedule route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-600">ผิดพลาด</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          เกิดข้อผิดพลาด
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          {termLabel
            ? `ไม่พบภาคเรียน ${termLabel} ในระบบ หรือยังไม่ได้ตั้งค่า`
            : error.message || "ไม่สามารถโหลดข้อมูลการตั้งค่าตารางเรียนได้"}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          กรุณาตรวจสอบว่าภาคเรียนและปีการศึกษามีอยู่ในระบบ
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <PrimaryButton
            startIcon={<RefreshIcon />}
            onClick={() => reset()}
          >
            ลองอีกครั้ง
          </PrimaryButton>

          <PrimaryButton
            startIcon={<HomeIcon />}
            onClick={() => router.push("/dashboard/select-semester")}
            variant="outlined"
          >
            กลับหน้าหลัก
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
