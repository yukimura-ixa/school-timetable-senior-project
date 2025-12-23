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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Teacher Utilization */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          ครูที่มีภาระสอนสูงสุด (Top 5)
        </h3>
        <div className="w-full h-[200px]">
          <TeacherUtilizationChart data={teacherChartData} />
        </div>
      </div>

      {/* Period Load Sparkline */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          จำนวนคาบเรียนต่อวัน
        </h3>
        <div className="w-full h-[80px]">
          <PeriodLoadChart data={periodChartData} />
        </div>
      </div>

      {/* Room Occupancy Mini Heatmap */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          อัตราการใช้ห้องเรียน (%)
        </h3>
        <RoomOccupancyGrid data={roomGridData} days={days} />
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="h-40 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  );
}
