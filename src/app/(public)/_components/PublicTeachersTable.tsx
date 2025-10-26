/**
 * Public Teachers Table - Server Component
 * Displays teacher list with public-safe data
 */

import { getPaginatedTeachers } from "@/lib/public/teachers";
import Link from "next/link";
import { ArrowForward } from "./Icons";
import { TablePagination } from "./TablePagination";
import { TableSearch } from "./TableSearch";

type Props = {
  searchParams: {
    page?: string;
    search?: string;
    sortBy?: "name" | "hours" | "utilization";
    sortOrder?: "asc" | "desc";
  };
};

export async function PublicTeachersTable({ searchParams }: Props) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const sortBy = searchParams.sortBy || "name";
  const sortOrder = searchParams.sortOrder || "asc";

  const result = await getPaginatedTeachers({
    page,
    search,
    sortBy,
    sortOrder,
    perPage: 25,
  });

  // Map sortOrder to aria-sort values
  const getAriaSort = (column: string): "ascending" | "descending" | "none" => {
    if (sortBy !== column) return "none";
    return sortOrder === "asc" ? "ascending" : "descending";
  };

  if (result.data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {search ? `ไม่พบครูที่ค้นหา "${search}"` : "ไม่มีข้อมูลครู"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
              {result.data.map((teacher) => (
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
                      href={`/dashboard/select-semester`}
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

      {/* Pagination */}
      <TablePagination
        currentPage={result.page}
        totalPages={result.totalPages}
        totalItems={result.total}
      />
    </div>
  );
}

/**
 * Loading skeleton for teachers table
 */
export function PublicTeachersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-gray-50 px-6 py-3 flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
