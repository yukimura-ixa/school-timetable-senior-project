"use client";

import type { SubjectDistribution } from "@/features/dashboard/domain/services/dashboard-stats.service";

export default function SubjectDistributionChart({
  distribution,
}: {
  distribution: SubjectDistribution[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        การกระจายวิชา (Top 10 วิชา)
      </h2>
      <div className="space-y-3">
        {distribution.map((item) => (
          <div key={item.subjectCode} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {item.subjectName}
              </p>
              <p className="text-xs text-gray-500">
                {item.subjectCode} • {item.classCount} ชั้นเรียน
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {item.totalHours}
                </p>
                <p className="text-xs text-gray-500">{item.percentage}%</p>
              </div>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {distribution.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          ยังไม่มีข้อมูลตารางเรียน
        </p>
      )}
    </div>
  );
}
