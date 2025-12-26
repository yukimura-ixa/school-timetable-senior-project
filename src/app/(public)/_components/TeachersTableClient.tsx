"use client";

/**
 * TeachersTableClient - Client Component
 * Renders teachers table with data passed from server
 */

import Link from "next/link";
import { ArrowForward } from "./Icons";
import type { PublicTeacher } from "@/lib/public/teachers";

type Props = {
  data: PublicTeacher[];
  search?: string;
  sortBy?: "name" | "hours" | "utilization";
  sortOrder?: "asc" | "desc";
  "data-testid"?: string;
  configId?: string; // e.g. "1-2567" for building term-specific public schedule links
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

export function TeachersTableClient({
  data,
  search,
  sortBy = "name",
  sortOrder = "asc",
  "data-testid": testId,
  configId,
}: Props) {
  const term = parseConfigId(configId);
  // Map sortOrder to aria-sort values
  const getAriaSort = (column: string): "ascending" | "descending" | "none" => {
    if (sortBy !== column) return "none";
    return sortOrder === "asc" ? "ascending" : "descending";
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {search ? `ไม่พบครูที่ค้นหา "${search}"` : "ไม่มีข้อมูลครู"}
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
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                aria-sort={getAriaSort("name")}
              >
                ชื่อ-นามสกุล
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ภาควิชา
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                วิชาที่สอน
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                aria-sort={getAriaSort("hours")}
              >
                ชั่วโมง/สัปดาห์
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                aria-sort={getAriaSort("utilization")}
              >
                อัตราการใช้งาน
              </th>
              <th scope="col" className="px-6 py-3 relative">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((teacher) => (
              <tr
                key={teacher.teacherId}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {teacher.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {teacher.department}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {teacher.subjectCount} วิชา
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {teacher.weeklyHours} ชม.
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        teacher.utilization > 80
                          ? "bg-red-100 text-red-800"
                          : teacher.utilization > 60
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {teacher.utilization}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={
                      term
                        ? `/teachers/${teacher.teacherId}/${term.academicYear}/${term.semester}`
                        : `/teachers/${teacher.teacherId}`
                    }
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    ดูตาราง
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
