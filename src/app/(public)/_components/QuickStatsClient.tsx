"use client";

/**
 * QuickStatsCardsClient - Client Component
 * Wraps QuickStats data with animated counters and glassmorphism styling
 */

import { AnimatedCounter } from "./AnimatedCounter";
import { People, School, MeetingRoom, AccessTime } from "./Icons";

interface QuickStatsData {
  totalTeachers: number;
  totalClasses: number;
  totalRooms: number;
  totalSubjects: number;
  totalPrograms: number;
  periodsPerDay: number;
  currentTerm: string;
  lastUpdated: string;
}

interface QuickStatsCardsClientProps {
  stats: QuickStatsData;
}

export function QuickStatsCardsClient({ stats }: QuickStatsCardsClientProps) {
  const statItems = [
    {
      label: "ครูทั้งหมด",
      value: stats.totalTeachers,
      icon: <People />,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      label: "ห้องเรียน",
      value: stats.totalClasses,
      icon: <School />,
      gradient: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      label: "ห้องพัก",
      value: stats.totalRooms,
      icon: <MeetingRoom />,
      gradient: "from-violet-500 to-violet-600",
      iconBg: "bg-violet-500/20",
      iconColor: "text-violet-400",
    },
    {
      label: "วิชาทั้งหมด",
      value: stats.totalSubjects,
      icon: <School />,
      gradient: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-500/20",
      iconColor: "text-indigo-400",
    },
    {
      label: "โปรแกรม",
      value: stats.totalPrograms,
      icon: <School />,
      gradient: "from-pink-500 to-pink-600",
      iconBg: "bg-pink-500/20",
      iconColor: "text-pink-400",
    },
    {
      label: "คาบ/วัน",
      value: stats.periodsPerDay,
      icon: <AccessTime />,
      gradient: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-300/80 overflow-hidden"
        >
          {/* Decorative gradient orb */}
          <div
            className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${item.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
          />

          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-2 tabular-nums">
                <AnimatedCounter
                  value={item.value}
                  duration={1200 + index * 100}
                />
              </p>
            </div>
            <div
              className={`${item.iconBg} ${item.iconColor} p-3.5 rounded-xl transition-transform duration-300 group-hover:scale-110`}
            >
              {item.icon}
            </div>
          </div>
        </div>
      ))}

      {/* Current Term & Last Updated Card - Special styling */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white md:col-span-2 lg:col-span-3 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-400">
              ภาคเรียนปัจจุบัน
            </p>
            <p className="text-2xl font-bold mt-1">{stats.currentTerm}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-medium text-slate-400">อัปเดตล่าสุด</p>
            <p className="text-lg font-semibold mt-1 text-slate-200">
              {stats.lastUpdated}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
