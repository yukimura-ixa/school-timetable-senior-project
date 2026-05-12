import React from "react";
import type {
  class_schedule,
  subject,
  room,
  day_of_week,
} from "@/prisma/generated/client";

export type LockedScheduleItem = Omit<class_schedule, "GradeID"> & {
  subject: subject;
  room: room | null;
  SubjectName: string;
  RoomName: string;
  GradeID: string | string[];
  DayOfWeek: day_of_week;
  TimePeriod: number;
};

export interface LockedScheduleListProps {
  items: LockedScheduleItem[];
  onUnlock?: (item: LockedScheduleItem) => void;
  className?: string;
}

export function LockedScheduleList({
  items,
  onUnlock,
  className = "",
}: LockedScheduleListProps) {
  if (!items || items.length === 0) {
    return (
      <div className={`text-gray-500 text-sm italic p-4 ${className}`}>
        <p>ไม่มีตารางที่ถูกล็อก</p>
        <p className="text-xs mt-1">
          ตารางที่ถูกล็อกจะแสดงที่นี่ เช่น ชั่วโมงหน้าเสาธง การสอบ
          หรือกิจกรรมพิเศษ
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 p-4 ${className}`}>
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <span className="text-amber-600">🔒</span>
        ตารางที่ถูกล็อก
        <span className="text-sm text-gray-500 font-normal">
          ({items.length} รายการ)
        </span>
      </h3>

      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
        {items.map((item, index) => {
          const gradeDisplay = Array.isArray(item.GradeID)
            ? item.GradeID.join(", ")
            : item.GradeID;
          const dayPeriodText = `${item.DayOfWeek} คาบที่ ${item.TimePeriod}`;

          return (
            <div
              key={`${item.TimeslotID}-${index}`}
              className="py-3 px-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {item.SubjectName}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-gray-500">ชั้น:</span>
                    <span className="font-medium">{gradeDisplay}</span>
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                  <span>📅 {dayPeriodText}</span>
                  <span>•</span>
                  <span>🚪 {item.RoomName}</span>
                </div>
              </div>

              {onUnlock && (
                <button
                  onClick={() => onUnlock(item)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium transition-colors px-3 py-1 rounded hover:bg-red-50"
                  title="ปลดล็อกตารางนี้"
                >
                  ปลดล็อก
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 mt-2 p-2 bg-amber-50 rounded border border-amber-200">
        <span className="font-medium">หมายเหตุ:</span>{" "}
        ตารางที่ถูกล็อกไม่สามารถแก้ไขได้จนกว่าจะปลดล็อก
      </div>
    </div>
  );
}

export function LockedScheduleListCompact({
  items,
  className = "",
}: Pick<LockedScheduleListProps, "items" | "className">) {
  if (!items || items.length === 0) {
    return (
      <div className={`text-gray-500 text-xs italic ${className}`}>
        ไม่มีตารางที่ถูกล็อก
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-xs font-semibold text-gray-700 mb-2">
        🔒 ตารางที่ถูกล็อก ({items.length})
      </div>
      {items.map((item, index) => {
        const gradeDisplay = Array.isArray(item.GradeID)
          ? item.GradeID.join(", ")
          : item.GradeID;

        return (
          <div
            key={`${item.TimeslotID}-${index}`}
            className="text-xs p-2 bg-gray-50 rounded border border-gray-200"
          >
            <div className="font-medium text-gray-900 truncate">
              {item.SubjectName}
            </div>
            <div className="text-gray-600 mt-0.5">
              {gradeDisplay} • {item.DayOfWeek} คาบ{item.TimePeriod}
            </div>
          </div>
        );
      })}
    </div>
  );
}
