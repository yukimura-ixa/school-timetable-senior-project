"use client";

/**
 * Chart Components - Client Components for Recharts
 * Wraps recharts to avoid context issues in Server Components
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";

type TeacherUtilizationChartProps = {
  data: Array<{ name: string; hours: number; color: string }>;
};

export function TeacherUtilizationChart({ data }: TeacherUtilizationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip />
        <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

type PeriodLoadChartProps = {
  data: Array<{ day: string; periods: number }>;
};

export function PeriodLoadChart({ data }: PeriodLoadChartProps) {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorPeriods" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis hide />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="periods"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorPeriods)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

type RoomOccupancyData = Array<{
  day: string;
  period: number;
  occupancyPercent: number;
}>;

type RoomOccupancyGridProps = {
  data: RoomOccupancyData;
  days: string[];
};

export function RoomOccupancyGrid({ data, days }: RoomOccupancyGridProps) {
  const getColor = (percent: number) => {
    if (percent >= 80) return "bg-red-500";
    if (percent >= 60) return "bg-orange-500";
    if (percent >= 40) return "bg-yellow-500";
    if (percent >= 20) return "bg-green-500";
    return "bg-gray-300";
  };

  const maxPeriod = Math.max(...data.map((d) => d.period));

  return (
    <div className="space-y-1">
      {Array.from({ length: maxPeriod }, (_, periodIndex) => {
        const period = periodIndex + 1;
        return (
          <div key={period} className="flex gap-1">
            {days.map((day) => {
              const cell = data.find((d) => d.day === day && d.period === period);
              const occupancy = cell?.occupancyPercent || 0;
              return (
                <div
                  key={`${day}-${period}`}
                  className={`flex-1 h-6 rounded ${getColor(occupancy)}`}
                  title={`${day} คาบ ${period}: ${occupancy}%`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
