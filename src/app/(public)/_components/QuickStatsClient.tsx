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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="group relative bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/50 p-4 sm:p-6 md:p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-2 hover:border-blue-200/50 overflow-hidden"
        >
          {/* Subtle gradient background on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
          />

          {/* Decorative gradient orb */}
          <div
            className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${item.gradient} opacity-[0.05] blur-3xl group-hover:opacity-10 transition-opacity duration-500`}
          />

          <div className="relative flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-slate-400 tracking-wider uppercase truncate">
                {item.label}
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mt-1 sm:mt-2 tracking-tight tabular-nums">
                <AnimatedCounter
                  value={item.value}
                  duration={1500 + index * 100}
                />
              </p>
            </div>
            <div
              className={`${item.iconBg} ${item.iconColor} p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner flex-shrink-0`}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center">
                {item.icon}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Current Term & Last Updated Card - Premium styling */}
      <div className="relative bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white col-span-2 md:col-span-3 overflow-hidden shadow-2xl shadow-slate-200">
        {/* Animated accent gradient */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-gradient-to-br from-blue-500/30 via-violet-500/20 to-transparent rounded-full blur-[80px] sm:blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] bg-gradient-to-tr from-emerald-500/20 via-cyan-500/10 to-transparent rounded-full blur-[60px] sm:blur-[80px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 md:gap-8">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 text-xl sm:text-2xl md:text-3xl flex-shrink-0">
              🗓️
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-400 tracking-widest uppercase">
                ภาคเรียนปัจจุบัน
              </p>
              <p className="text-lg sm:text-2xl md:text-3xl font-black mt-0.5 sm:mt-1 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent italic truncate">
                {stats.currentTerm}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end">
            <p className="text-xs sm:text-sm font-bold text-slate-400 tracking-widest uppercase mb-0.5 sm:mb-1">
              อัปเดตล่าสุด
            </p>
            <div className="flex items-center gap-2 text-slate-200">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-base sm:text-lg md:text-xl font-bold">{stats.lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
