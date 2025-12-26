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
  "data-testid"?: string;
  configId?: string; // e.g. "1-2567" for building term-specific public schedule links
};

// Normalize grade identifier for URL usage.
// - If already numeric (e.g. "303"), return as-is.
// - If formatted label (e.g. "ม.3/3"), derive numeric code (e.g. "303").
const toNumericGradeId = (gradeId: string): string => {
  if (!gradeId) return gradeId;

  // Already numeric (e.g. "101", "303")
  if (/^\d+$/.test(gradeId)) {
    return gradeId;
  }

  // Extract year and section from patterns like "ม.3/3"
  const match = gradeId.match(/(\d+)[^\d]+(\d+)/) ?? [];
  if (!match) {
    return gradeId;
  }

  const year = Number.parseInt(match[1] ?? "", 10);
  const section = Number.parseInt(match[2] ?? "", 10);
  if (Number.isNaN(year) || Number.isNaN(section)) {
    return gradeId;
  }

  return `${year}${section.toString().padStart(2, "0")}`;
};

const parseConfigId = (
  configId?: string,
): { academicYear: string; semester: string } | null => {
  if (!configId) return null;
  const match = /^(1|2)-(\d{4})$/.exec(configId);
  if (!match) return null;
  const [, semester, academicYear] = match;
  return { academicYear, semester };
};

export function ClassesTableClient({
  data,
  search,
  "data-testid": testId,
  configId,
}: Props) {
  const term = parseConfigId(configId);
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {search
            ? `ไม่พบชั้นเรียนที่ค้นหา "${search}"`
            : "ไม่มีข้อมูลชั้นเรียน"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      data-testid={testId}
    >
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
                    href={
                      term
                        ? `/classes/${toNumericGradeId(cls.gradeId)}/${term.academicYear}/${term.semester}`
                        : `/dashboard`
                    }
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
