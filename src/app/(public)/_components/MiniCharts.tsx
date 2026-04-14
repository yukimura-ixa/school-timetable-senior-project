/**
 * Mini Visualizations - Server Component
 * Small, fast charts for glanceable insights
 */

import { getPeriodLoadPerDay, getRoomOccupancy } from "@/lib/public/stats";
import { getTopTeachersByUtilization } from "@/lib/public/teachers";
import {
  TeacherUtilizationChart,
  PeriodLoadChart,
  RoomOccupancyGrid,
} from "./Charts";

export async function MiniCharts() {
  const [periodLoad, roomOccupancy, topTeachers] = await Promise.all([
    getPeriodLoadPerDay(),
    getRoomOccupancy(),
    getTopTeachersByUtilization(5),
  ]);

  // Transform data for chart components
  const teacherChartData = topTeachers.map((t) => ({
    name: t.name.length > 15 ? t.name.substring(0, 15) + "..." : t.name,
    hours: t.weeklyHours,
    color:
      t.utilization > 80
        ? "#ef4444"
        : t.utilization > 60
          ? "#f97316"
          : "#22c55e",
  }));

  // periodLoad already has the correct shape: { day, periods }
  const periodChartData = periodLoad;

  // roomOccupancy already has the correct shape: { day, period, occupancyPercent }
  const roomGridData = roomOccupancy;

  const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์"];
  const hasTeacherData = teacherChartData.length > 0;
  const hasPeriodData = periodChartData.length > 0;
  const hasRoomData = roomGridData.length > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Teacher Utilization */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
          ครูที่มีภาระสอนสูงสุด (Top 5)
        </h3>
        <div className="w-full h-[180px] sm:h-[200px]">
          {hasTeacherData ? (
            <TeacherUtilizationChart data={teacherChartData} />
          ) : (
            <div
              role="status"
              className="h-full flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500"
            >
              ยังไม่มีข้อมูลครูสำหรับแสดงผล
            </div>
          )}
        </div>
      </div>

      {/* Period Load Sparkline */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
          จำนวนคาบเรียนต่อวัน
        </h3>
        <div className="w-full h-[70px] sm:h-[80px]">
          {hasPeriodData ? (
            <PeriodLoadChart data={periodChartData} />
          ) : (
            <div
              role="status"
              className="h-full flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500"
            >
              ยังไม่มีข้อมูลคาบเรียนสำหรับแสดงผล
            </div>
          )}
        </div>
      </div>

      {/* Room Occupancy Mini Heatmap */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 sm:col-span-2 lg:col-span-1">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
          อัตราการใช้ห้องเรียน (%)
        </h3>
        {hasRoomData ? (
          <RoomOccupancyGrid data={roomGridData} days={days} />
        ) : (
          <div
            role="status"
            className="h-[120px] flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500"
          >
            ยังไม่มีข้อมูลการใช้ห้องเรียนสำหรับแสดงผล
          </div>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>ต่ำ</span>
          <span>สูง</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for charts
 */
export function MiniChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse ${i === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
        >
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-32 sm:w-40 mb-3 sm:mb-4"></div>
          <div className="h-32 sm:h-40 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  );
}
