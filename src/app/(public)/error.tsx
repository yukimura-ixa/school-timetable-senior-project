"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Error boundary for public routes
 * Catches errors in the (public) route group and shows a user-friendly Thai error page
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("[PublicError]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
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

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          เกิดข้อผิดพลาด
        </h1>
        <p className="text-gray-600 mb-6">
          ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด
          <br />
          กรุณาลองใหม่อีกครั้งหรือกลับไปหน้าแรก
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            กลับหน้าแรก
          </Link>
        </div>

        {/* Error Digest for debugging */}
        {error.digest && (
          <p className="mt-4 text-xs text-gray-400">
            รหัสข้อผิดพลาด: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
