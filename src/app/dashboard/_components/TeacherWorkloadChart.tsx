"use client";

import type { TeacherWorkload } from "@/features/dashboard/domain/services/dashboard-stats.service";

export default function TeacherWorkloadChart({
  workload,
}: {
  workload: TeacherWorkload[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        ภาระงานสอน (Top 10 ครู)
      </h2>
      <div className="space-y-3">
        {workload.map((item) => (
          <div key={item.teacherId} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {item.teacherName}
              </p>
              <p className="text-xs text-gray-500">{item.department}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {item.scheduledHours}
                </p>
                <p className="text-xs text-gray-500">คาบ</p>
              </div>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${Math.min(item.utilizationRate, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {workload.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          ยังไม่มีข้อมูลตารางสอน
        </p>
      )}
    </div>
  );
}
