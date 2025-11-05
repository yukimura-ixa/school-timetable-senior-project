"use client";

/**
 * ClassesTableClient - Client Component
 * Renders classes table with data passed from server
 */

import Link from "next/link";
import { ArrowForward } from "./Icons";
import type { PublicClass } from "@/lib/public/classes";

type Props = {
  data: PublicClass[];
  search?: string;
  sortBy?: "grade" | "hours" | "subjects";
  sortOrder?: "asc" | "desc";
};

export function ClassesTableClient({
  data,
  search,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {search ? `ไม่พบชั้นเรียนที่ค้นหา "${search}"` : "ไม่มีข้อมูลชั้นเรียน"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ชั้นเรียน
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ครูประจำชั้น
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                วิชาเรียน
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                ชั่วโมง/สัปดาห์
              </th>
              <th className="px-6 py-3 relative">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((cls) => (
              <tr key={cls.gradeId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {cls.gradeId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {cls.homeroomTeacher || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {cls.subjectCount} วิชา
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {cls.weeklyHours} ชม.
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/select-semester`}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    ดูตารางเรียน
                    <ArrowForward className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
