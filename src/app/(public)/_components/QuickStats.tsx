/**
 * Quick Stats Cards - Server Component
 * Displays key metrics at a glance
 */

import { getQuickStats } from "@/lib/public/stats";
import { People, School, MeetingRoom, AccessTime } from "./Icons";

export async function QuickStatsCards() {
  const stats = await getQuickStats();

  const statItems = [
    {
      label: "ครูทั้งหมด",
      value: stats.totalTeachers,
      icon: <People />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "ห้องเรียน",
      value: stats.totalClasses,
      icon: <School />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "ห้องพัก",
      value: stats.totalRooms,
      icon: <MeetingRoom />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "คาบ/วัน",
      value: stats.periodsPerDay,
      icon: <AccessTime />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{item.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {item.value.toLocaleString()}
              </p>
            </div>
            <div className={`${item.bgColor} ${item.color} p-3 rounded-lg`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}

      {/* Current Term Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 text-white md:col-span-2 lg:col-span-4">
        <p className="text-sm font-medium opacity-90">ภาคเรียนปัจจุบัน</p>
        <p className="text-2xl font-bold mt-2">{stats.currentTerm}</p>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for stats cards
 */
export function QuickStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
      <div className="bg-gray-200 rounded-lg p-6 md:col-span-2 lg:col-span-4 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-32 mb-3"></div>
        <div className="h-6 bg-gray-400 rounded w-48"></div>
      </div>
    </div>
  );
}
