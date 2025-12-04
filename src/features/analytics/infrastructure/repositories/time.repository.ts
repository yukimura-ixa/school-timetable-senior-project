/**
 * Time Repository
 * Section 6: Time Analysis
 *
 * Provides data fetching methods for time-based analysis including peak hours and distribution by period/day.
 */

import prisma from "@/lib/prisma";
import {
  parseConfigId,
  extractDayFromTimeslotId,
  extractPeriodFromTimeslotId,
  getThaiDayLabel,
  formatPeriodTime,
} from "../../domain/services/calculation.service";
import { DAYS_OF_WEEK } from "../../domain/types/analytics.types";
import type { day_of_week } from "@/prisma/generated/client";

// Prisma payload types for time queries
type TimeslotId = { TimeslotID: number };
type ScheduleTimeslot = { TimeslotID: number };

/**
 * Period distribution type
 */
export type PeriodDistribution = {
  period: number;
  periodLabel: string;
  totalSchedules: number;
  utilizationRate: number;
};

/**
 * Day distribution type
 */
export type DayDistribution = {
  day: day_of_week;
  dayLabel: string;
  totalSchedules: number;
  utilizationRate: number;
};

/**
 * Get schedule distribution by period
 */
async function getPeriodDistribution(
  configId: string,
): Promise<PeriodDistribution[]> {
  const config = parseConfigId(configId);

  // Get timeslot IDs for this semester
  const timeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: config.academicYear,
      Semester: config.semester,
    },
    select: {
      TimeslotID: true,
    },
  });

  const timeslotIds = timeslots.map((t: TimeslotId) => t.TimeslotID);

  // Get all schedules
  const schedules = await prisma.class_schedule.findMany({
    where: {
      TimeslotID: {
        in: timeslotIds,
      },
    },
    select: {
      TimeslotID: true,
    },
  });

  // Count by period
  const periodCounts = new Map<number, number>();
  schedules.forEach((schedule: ScheduleTimeslot) => {
    const period = extractPeriodFromTimeslotId(String(schedule.TimeslotID));
    if (period !== null) {
      periodCounts.set(period, (periodCounts.get(period) || 0) + 1);
    }
  });

  // Find max period
  const maxPeriod = Math.max(...Array.from(periodCounts.keys()), 8);

  // Calculate total available slots per period (days * rooms)
  const totalDays = DAYS_OF_WEEK.length;
  const totalRooms = await prisma.room.count();
  const maxSlotsPerPeriod = totalDays * totalRooms;

  // Transform to distribution
  const distribution: PeriodDistribution[] = [];
  for (let p = 1; p <= maxPeriod; p++) {
    const count = periodCounts.get(p) || 0;
    const utilizationRate =
      maxSlotsPerPeriod > 0 ? (count / maxSlotsPerPeriod) * 100 : 0;

    distribution.push({
      period: p,
      periodLabel: formatPeriodTime(p),
      totalSchedules: count,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
    });
  }

  return distribution;
}

/**
 * Get schedule distribution by day
 */
async function getDayDistribution(
  configId: string,
): Promise<DayDistribution[]> {
  const config = parseConfigId(configId);

  // Get timeslot IDs for this semester
  const timeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: config.academicYear,
      Semester: config.semester,
    },
    select: {
      TimeslotID: true,
    },
  });

  const timeslotIds = timeslots.map((t: TimeslotId) => t.TimeslotID);

  // Get all schedules
  const schedules = await prisma.class_schedule.findMany({
    where: {
      TimeslotID: {
        in: timeslotIds,
      },
    },
    select: {
      TimeslotID: true,
    },
  });

  // Count by day
  const dayCounts = new Map<string, number>();
  schedules.forEach((schedule: ScheduleTimeslot) => {
    const day = extractDayFromTimeslotId(String(schedule.TimeslotID));
    if (day !== null) {
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }
  });

  // Calculate total available slots per day (periods * rooms)
  const totalRooms = await prisma.room.count();
  const maxPeriodsPerDay = 8; // Assume 8 periods max
  const maxSlotsPerDay = maxPeriodsPerDay * totalRooms;

  // Transform to distribution
  return DAYS_OF_WEEK.map((dayInfo) => {
    const count = dayCounts.get(dayInfo.value) || 0;
    const utilizationRate =
      maxSlotsPerDay > 0 ? (count / maxSlotsPerDay) * 100 : 0;

    return {
      day: dayInfo.value,
      dayLabel: getThaiDayLabel(dayInfo.value),
      totalSchedules: count,
      utilizationRate: Math.round(utilizationRate * 10) / 10,
    };
  });
}

/**
 * Get peak hours (periods with highest utilization)
 */
async function getPeakHours(
  configId: string,
  limit = 3,
): Promise<PeriodDistribution[]> {
  const distribution = await getPeriodDistribution(configId);
  return distribution
    .sort((a, b) => b.totalSchedules - a.totalSchedules)
    .slice(0, limit);
}

/**
 * Get least utilized periods
 */
async function getLeastUtilizedPeriods(
  configId: string,
  limit = 3,
): Promise<PeriodDistribution[]> {
  const distribution = await getPeriodDistribution(configId);
  return distribution
    .sort((a, b) => a.totalSchedules - b.totalSchedules)
    .slice(0, limit);
}

export const timeRepository = {
  getPeriodDistribution,
  getDayDistribution,
  getPeakHours,
  getLeastUtilizedPeriods,
};
