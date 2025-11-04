/**
 * Calculation Service
 * Pure business logic functions for analytics calculations
 * 
 * NO external dependencies (Prisma, fetch, etc.)
 * All functions are pure and testable
 */

import type { 
  ParsedConfig,
  TeacherWorkload,
  DepartmentWorkload,
  CompletionMetrics,
  CategoryCredits
} from "../types/analytics.types";
import { 
  WORKLOAD_THRESHOLDS,
  ROOM_UTILIZATION_THRESHOLDS,
  COMPLETION_THRESHOLDS
} from "../types/analytics.types";
import type { semester } from "@/prisma/generated";

/**
 * Parse config ID string into structured format
 * @param configId - Format: "SEMESTER-YEAR" (e.g., "1-2567", "2-2568")
 * @returns Parsed configuration
 * @throws Error if format is invalid
 */
export function parseConfigId(configId: string): ParsedConfig {
  const parts = configId.split("-");
  
  if (parts.length !== 2) {
    throw new Error(`Invalid configId format: ${configId}. Expected "SEMESTER-YEAR"`);
  }
  
  const [semesterStr, yearStr] = parts;
  const academicYear = parseInt(yearStr || '0', 10);
  
  if (isNaN(academicYear)) {
    throw new Error(`Invalid academic year: ${yearStr}`);
  }
  
  // Map semester string to enum
  let semester: semester;
  if (semesterStr === "1") {
    semester = "SEMESTER_1";
  } else if (semesterStr === "2") {
    semester = "SEMESTER_2";
  } else {
    throw new Error(`Invalid semester: ${semesterStr}. Expected "1" or "2"`);
  }
  
  return {
    semester,
    academicYear,
    configId,
  };
}

/**
 * Calculate completion rate percentage
 * @param scheduled - Number of scheduled slots
 * @param required - Number of required slots
 * @returns Percentage (0-100) rounded to 1 decimal
 */
export function calculateCompletionRate(scheduled: number, required: number): number {
  if (required === 0) return 0;
  const rate = (scheduled / required) * 100;
  return Math.round(rate * 10) / 10;
}

/**
 * Determine workload status based on hours
 * @param hours - Number of teaching hours
 * @returns Workload status classification
 */
export function getWorkloadStatus(hours: number): TeacherWorkload['workloadStatus'] {
  if (hours <= WORKLOAD_THRESHOLDS.UNDERUTILIZED_MAX) {
    return 'underutilized';
  } else if (hours >= WORKLOAD_THRESHOLDS.OPTIMAL_MIN && hours <= WORKLOAD_THRESHOLDS.OPTIMAL_MAX) {
    return 'optimal';
  } else if (hours >= WORKLOAD_THRESHOLDS.HIGH_MIN && hours <= WORKLOAD_THRESHOLDS.HIGH_MAX) {
    return 'high';
  } else {
    return 'overloaded';
  }
}

/**
 * Get color for workload status
 * @param hours - Number of teaching hours
 * @returns Hex color code
 */
export function getWorkloadColor(hours: number): string {
  const status = getWorkloadStatus(hours);
  switch (status) {
    case 'underutilized': return '#10b981'; // Green
    case 'optimal': return '#f59e0b'; // Yellow
    case 'high': return '#f97316'; // Orange
    case 'overloaded': return '#ef4444'; // Red
  }
}

/**
 * Determine room utilization status based on percentage
 * @param utilizationRate - Percentage (0-100)
 * @returns Utilization status classification
 */
export function getRoomUtilizationStatus(
  utilizationRate: number
): 'rarely-used' | 'light' | 'moderate' | 'well-used' | 'over-utilized' {
  if (utilizationRate < ROOM_UTILIZATION_THRESHOLDS.RARELY_USED_MAX) {
    return 'rarely-used';
  } else if (utilizationRate < ROOM_UTILIZATION_THRESHOLDS.LIGHT_MAX) {
    return 'light';
  } else if (utilizationRate < ROOM_UTILIZATION_THRESHOLDS.MODERATE_MAX) {
    return 'moderate';
  } else if (utilizationRate < ROOM_UTILIZATION_THRESHOLDS.WELL_USED_MAX) {
    return 'well-used';
  } else {
    return 'over-utilized';
  }
}

/**
 * Get color for room utilization status
 * @param utilizationRate - Percentage (0-100)
 * @returns Hex color code
 */
export function getRoomUtilizationColor(utilizationRate: number): string {
  const status = getRoomUtilizationStatus(utilizationRate);
  switch (status) {
    case 'rarely-used': return '#9ca3af'; // Gray
    case 'light': return '#10b981'; // Green
    case 'moderate': return '#f59e0b'; // Yellow
    case 'well-used': return '#f97316'; // Orange
    case 'over-utilized': return '#ef4444'; // Red
  }
}

/**
 * Determine completion progress status
 * @param completionRate - Percentage (0-100)
 * @returns Progress status classification
 */
export function getProgressStatus(
  completionRate: number
): CompletionMetrics['progressStatus'] {
  if (completionRate < COMPLETION_THRESHOLDS.NOT_STARTED_MAX) {
    return 'not-started';
  } else if (completionRate < COMPLETION_THRESHOLDS.IN_PROGRESS_MAX) {
    return 'in-progress';
  } else if (completionRate < COMPLETION_THRESHOLDS.NEAR_COMPLETE_MAX) {
    return 'near-complete';
  } else {
    return 'complete';
  }
}

/**
 * Calculate average from array of numbers
 * @param numbers - Array of numbers
 * @returns Average value, or 0 if empty array
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / numbers.length) * 10) / 10;
}

/**
 * Calculate department workload summary
 * @param teacherWorkloads - Array of teacher workloads
 * @param department - Department name
 * @returns Department workload summary
 */
export function calculateDepartmentWorkload(
  teacherWorkloads: TeacherWorkload[],
  department: string
): DepartmentWorkload {
  const deptTeachers = teacherWorkloads.filter(t => t.department === department);
  const hours = deptTeachers.map(t => t.totalHours);
  
  if (hours.length === 0) {
    return {
      department,
      teacherCount: 0,
      avgHoursPerTeacher: 0,
      totalHours: 0,
      minHours: 0,
      maxHours: 0,
      utilizationRate: 0,
    };
  }
  
  const totalHours = hours.reduce((sum, h) => sum + h, 0);
  const avgUtilization = deptTeachers.reduce((sum, t) => sum + t.utilizationRate, 0) / deptTeachers.length;
  
  return {
    department,
    teacherCount: hours.length,
    avgHoursPerTeacher: calculateAverage(hours),
    totalHours,
    minHours: Math.min(...hours),
    maxHours: Math.max(...hours),
    utilizationRate: Math.round(avgUtilization * 10) / 10,
  };
}

/**
 * Sum category credits
 * @param credits - Category credits object
 * @returns Total credits
 */
export function sumCategoryCredits(credits: CategoryCredits): number {
  return credits.core + credits.additional + credits.activity + credits.elective;
}

/**
 * Extract period number from TimeslotID
 * Format: "SEMESTER-YEAR-DAY-PERIOD" (e.g., "1-2567-MON-1")
 * @param timeslotId - Timeslot ID string
 * @returns Period number (1-8), or null if invalid format
 */
export function extractPeriodFromTimeslotId(timeslotId: string): number | null {
  const parts = timeslotId.split("-");
  if (parts.length < 4) return null;
  
  const period = parseInt(parts[3] || '0', 10);
  return isNaN(period) ? null : period;
}

/**
 * Extract day from TimeslotID
 * Format: "SEMESTER-YEAR-DAY-PERIOD" (e.g., "1-2567-MON-1")
 * @param timeslotId - Timeslot ID string
 * @returns Day string (MON, TUE, etc.), or null if invalid format
 */
export function extractDayFromTimeslotId(timeslotId: string): string | null {
  const parts = timeslotId.split("-");
  if (parts.length < 4) return null;
  return parts[2] || null;
}

/**
 * Format period time range
 * @param period - Period number (1-8)
 * @returns Time range string (e.g., "08:00-09:00")
 */
export function formatPeriodTime(period: number): string {
  // Typical secondary school schedule
  const timeRanges: Record<number, string> = {
    1: "08:00-09:00",
    2: "09:00-10:00",
    3: "10:00-11:00",
    4: "11:00-12:00",
    5: "13:00-14:00",
    6: "14:00-15:00",
    7: "15:00-16:00",
    8: "16:00-17:00",
  };
  
  return timeRanges[period] || `Period ${period}`;
}

/**
 * Get Thai day label
 * @param day - Day enum value (MON, TUE, etc.)
 * @returns Thai day label
 */
export function getThaiDayLabel(day: string): string {
  const dayLabels: Record<string, string> = {
    MON: 'จันทร์',
    TUE: 'อังคาร',
    WED: 'พุธ',
    THU: 'พฤหัสบดี',
    FRI: 'ศุกร์',
    SAT: 'เสาร์',
    SUN: 'อาทิตย์',
  };
  
  return dayLabels[day] || day;
}

/**
 * Round number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 1)
 * @returns Rounded number
 */
export function roundToDecimals(value: number, decimals: number = 1): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
