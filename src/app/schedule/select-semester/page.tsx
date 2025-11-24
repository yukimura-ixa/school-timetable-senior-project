"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy redirect page for schedule/select-semester
 *
 * This page has been replaced with the modern semester selection interface
 * at /dashboard/select-semester which includes:
 * - Card-based semester display
 * - Advanced filtering and search
 * - Analytics dashboard
 * - Semester creation wizard
 * - Integration with global semester selector in navbar
 *
 * Users are automatically redirected to the modern interface.
 */
export default function SelectYearAndSemester() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect to modern semester selection page
    router.replace("/dashboard/select-semester");
  }, [router]);

  // Fallback UI in case redirect takes time
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <h2 className="text-lg font-semibold text-gray-800">
          กำลังเปลี่ยนหน้า...
        </h2>
        <p className="text-sm text-gray-600">กรุณารอสักครู่</p>
      </div>
    </div>
  );
}
