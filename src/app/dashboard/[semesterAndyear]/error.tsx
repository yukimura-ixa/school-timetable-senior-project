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
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-12 w-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          เกิดข้อผิดพลาด
        </h1>

        <p className="mt-6 text-base leading-7 text-gray-600">
          {termLabel
            ? `ไม่พบภาคเรียน ${termLabel} ในระบบ หรือยังไม่ได้ตั้งค่า`
            : "ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้งหรือกลับหน้าแรก"}
        </p>

        {error.message && (
          <div className="mt-4 rounded-md bg-red-50 p-4 max-w-md mx-auto">
            <p className="text-sm text-red-800 font-mono">{error.message}</p>
          </div>
        )}

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
