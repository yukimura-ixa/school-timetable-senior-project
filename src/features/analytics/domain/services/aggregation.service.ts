/**
 * Aggregation Service
 * Complex data transformations and aggregations for analytics
 *
 * This service provides higher-level data transformation functions that combine
 * multiple data sources or perform complex aggregations beyond simple calculations.
 */

import type {
  OverviewStats,
  TeacherWorkload,
  DepartmentWorkload,
  RoomOccupancy,
  SubjectDistribution,
  CompletionMetrics,
  ProgramCompliance,
} from "../types/analytics.types";
import type {
  PeriodDistribution,
  DayDistribution,
} from "../../infrastructure/repositories/time.repository";
import type { QualityMetrics } from "../../infrastructure/repositories/quality.repository";

/**
 * Dashboard summary aggregating all key metrics
 */
export type DashboardSummary = {
  overview: OverviewStats;
  quality: QualityMetrics;
  completion: CompletionMetrics;
  topTeachers: TeacherWorkload[];
  topRooms: RoomOccupancy[];
  subjectDistribution: SubjectDistribution[];
  peakHours: PeriodDistribution[];
  programCompliance: ProgramCompliance[];
};

/**
 * Workload insights with statistics
 */
export type WorkloadInsights = {
  departments: DepartmentWorkload[];
  overloadedTeachers: TeacherWorkload[];
  underutilizedTeachers: TeacherWorkload[];
  avgHoursPerTeacher: number;
  maxHours: number;
  minHours: number;
  totalTeachers: number;
};

/**
 * Room insights with statistics
 */
export type RoomInsights = {
  rooms: RoomOccupancy[];
  overUtilizedRooms: RoomOccupancy[];
  underUtilizedRooms: RoomOccupancy[];
  avgOccupancyRate: number;
  totalRooms: number;
};

/**
 * Time insights with peak analysis
 */
export type TimeInsights = {
  periodDistribution: PeriodDistribution[];
  dayDistribution: DayDistribution[];
  peakHours: PeriodDistribution[];
  leastUtilizedPeriods: PeriodDistribution[];
  avgUtilizationByDay: number;
  avgUtilizationByPeriod: number;
};

/**
 * Compliance insights with warnings
 */
export type ComplianceInsights = {
  programs: ProgramCompliance[];
  nonCompliantPrograms: ProgramCompliance[];
  programsWithMissingSubjects: ProgramCompliance[];
  avgComplianceRate: number;
  totalPrograms: number;
};

/**
 * Aggregate workload data into insights
 */
export function aggregateWorkloadInsights(
  teachers: TeacherWorkload[],
  departments: DepartmentWorkload[],
): WorkloadInsights {
  if (teachers.length === 0) {
    return {
      departments,
      overloadedTeachers: [],
      underutilizedTeachers: [],
      avgHoursPerTeacher: 0,
      maxHours: 0,
      minHours: 0,
      totalTeachers: 0,
    };
  }

  const totalHours = teachers.reduce((sum, t) => sum + t.totalHours, 0);
  const avgHoursPerTeacher = totalHours / teachers.length;
  const maxHours = Math.max(...teachers.map((t) => t.totalHours));
  const minHours = Math.min(...teachers.map((t) => t.totalHours));

  return {
    departments,
    overloadedTeachers: teachers.filter(
      (t) => t.workloadStatus === "overloaded",
    ),
    underutilizedTeachers: teachers.filter(
      (t) => t.workloadStatus === "underutilized",
    ),
    avgHoursPerTeacher: Math.round(avgHoursPerTeacher * 10) / 10,
    maxHours,
    minHours,
    totalTeachers: teachers.length,
  };
}

/**
 * Aggregate room data into insights
 */
export function aggregateRoomInsights(rooms: RoomOccupancy[]): RoomInsights {
  if (rooms.length === 0) {
    return {
      rooms,
      overUtilizedRooms: [],
      underUtilizedRooms: [],
      avgOccupancyRate: 0,
      totalRooms: 0,
    };
  }

  const totalOccupancy = rooms.reduce((sum, r) => sum + r.occupancyRate, 0);
  const avgOccupancyRate = totalOccupancy / rooms.length;

  return {
    rooms,
    overUtilizedRooms: rooms.filter(
      (r) => r.utilizationStatus === "over-utilized",
    ),
    underUtilizedRooms: rooms.filter(
      (r) =>
        r.utilizationStatus === "rarely-used" ||
        r.utilizationStatus === "light",
    ),
    avgOccupancyRate: Math.round(avgOccupancyRate * 10) / 10,
    totalRooms: rooms.length,
  };
}

/**
 * Aggregate time distribution into insights
 */
export function aggregateTimeInsights(
  periodDistribution: PeriodDistribution[],
  dayDistribution: DayDistribution[],
  peakHours: PeriodDistribution[],
  leastUtilized: PeriodDistribution[],
): TimeInsights {
  const avgUtilizationByPeriod =
    periodDistribution.length > 0
      ? periodDistribution.reduce((sum, p) => sum + p.utilizationRate, 0) /
        periodDistribution.length
      : 0;

  const avgUtilizationByDay =
    dayDistribution.length > 0
      ? dayDistribution.reduce((sum, d) => sum + d.utilizationRate, 0) /
        dayDistribution.length
      : 0;

  return {
    periodDistribution,
    dayDistribution,
    peakHours,
    leastUtilizedPeriods: leastUtilized,
    avgUtilizationByDay: Math.round(avgUtilizationByDay * 10) / 10,
    avgUtilizationByPeriod: Math.round(avgUtilizationByPeriod * 10) / 10,
  };
}

/**
 * Aggregate program compliance into insights
 */
export function aggregateComplianceInsights(
  programs: ProgramCompliance[],
): ComplianceInsights {
  if (programs.length === 0) {
    return {
      programs,
      nonCompliantPrograms: [],
      programsWithMissingSubjects: [],
      avgComplianceRate: 0,
      totalPrograms: 0,
    };
  }

  const totalCompliance = programs.reduce(
    (sum, p) => sum + p.complianceRate,
    0,
  );
  const avgComplianceRate = totalCompliance / programs.length;

  return {
    programs,
    nonCompliantPrograms: programs.filter(
      (p) =>
        p.complianceStatus === "non-compliant" ||
        p.complianceStatus === "partial",
    ),
    programsWithMissingSubjects: programs.filter(
      (p) => p.missingMandatorySubjects.length > 0,
    ),
    avgComplianceRate: Math.round(avgComplianceRate * 10) / 10,
    totalPrograms: programs.length,
  };
}

/**
 * Calculate trend data (for future comparison with historical data)
 */
export type TrendData = {
  current: number;
  previous?: number;
  change?: number;
  changePercentage?: number;
  trend?: "up" | "down" | "stable";
};

/**
 * Calculate trend between current and previous values
 */
export function calculateTrend(current: number, previous?: number): TrendData {
  if (previous === undefined || previous === 0) {
    return {
      current,
      previous,
      trend: "stable",
    };
  }

  const change = current - previous;
  const changePercentage = (change / previous) * 100;

  let trend: "up" | "down" | "stable";
  if (Math.abs(changePercentage) < 5) {
    trend = "stable";
  } else if (changePercentage > 0) {
    trend = "up";
  } else {
    trend = "down";
  }

  return {
    current,
    previous,
    change: Math.round(change * 10) / 10,
    changePercentage: Math.round(changePercentage * 10) / 10,
    trend,
  };
}

/**
 * Group data by a key function
 */
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
): Map<K, T[]> {
  const grouped = new Map<K, T[]>();

  items.forEach((item) => {
    const key = keyFn(item);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)?.push(item);
  });

  return grouped;
}

/**
 * Calculate percentile value from sorted array
 */
export function calculatePercentile(
  values: number[],
  percentile: number,
): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)] || 0;
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Find outliers using IQR method
 */
export function findOutliers(values: number[]): {
  lower: number[];
  upper: number[];
} {
  if (values.length < 4) {
    return { lower: [], upper: [] };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const q1 = calculatePercentile(sorted, 25);
  const q3 = calculatePercentile(sorted, 75);
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return {
    lower: values.filter((v) => v < lowerBound),
    upper: values.filter((v) => v > upperBound),
  };
}
