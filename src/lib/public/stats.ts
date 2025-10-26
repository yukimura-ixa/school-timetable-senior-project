/**
 * Public data access for system statistics and visualizations
 */

import prisma from "@/libs/prisma";
import { day_of_week } from "@prisma/client";

export type QuickStats = {
  totalTeachers: number;
  totalClasses: number;
  totalRooms: number;
  periodsPerDay: number;
  currentTerm: string;
};

export type PeriodLoad = {
  day: string;
  periods: number;
};

export type RoomOccupancy = {
  day: string;
  period: number;
  occupancyPercent: number;
};

/**
 * Get quick stats for homepage
 * Uses Next.js fetch cache with 60s revalidation
 */
export async function getQuickStats(): Promise<QuickStats> {
  try {
    const [teacherCount, classCount, roomCount, config] = await Promise.all([
      prisma.teacher.count(),
      prisma.gradelevel.count(),
      prisma.room.count(),
      prisma.table_config.findFirst({
        orderBy: { AcademicYear: "desc" },
        select: { AcademicYear: true, Semester: true, Config: true },
      }),
    ]);

    // Get periods per day from timeslots
    const periodsPerDay = await prisma.timeslot.count({
      where: {
        DayOfWeek: "MON",
        AcademicYear: config?.AcademicYear,
        Semester: config?.Semester,
      },
    });

    const semesterLabel =
      config?.Semester === "SEMESTER_1" ? "ภาคเรียนที่ 1" : "ภาคเรียนที่ 2";

    return {
      totalTeachers: teacherCount,
      totalClasses: classCount,
      totalRooms: roomCount,
      periodsPerDay,
      currentTerm: `${config?.AcademicYear} ${semesterLabel}`,
    };
  } catch (err) {
    console.warn("[PublicStats] getQuickStats fallback to defaults:", (err as Error).message);
    return {
      totalTeachers: 0,
      totalClasses: 0,
      totalRooms: 0,
      periodsPerDay: 0,
      currentTerm: "ไม่มีข้อมูล",
    };
  }
}

/**
 * Get period load per day for sparkline visualization
 * Uses Next.js fetch cache with 60s revalidation
 */
export async function getPeriodLoadPerDay(): Promise<PeriodLoad[]> {
  try {
    const config = await prisma.table_config.findFirst({
      orderBy: { AcademicYear: "desc" },
      select: { AcademicYear: true, Semester: true },
    });

    if (!config) return [];

    const days: day_of_week[] = ["MON", "TUE", "WED", "THU", "FRI"];

    const loadData = await Promise.all(
      days.map(async (day) => {
        const count = await prisma.class_schedule.count({
          where: {
            timeslot: {
              DayOfWeek: day,
              AcademicYear: config.AcademicYear,
              Semester: config.Semester,
            },
          },
        });

        return {
          day: day.slice(0, 3), // MON, TUE, etc.
          periods: count,
        };
      }),
    );

    return loadData;
  } catch (err) {
    console.warn("[PublicStats] getPeriodLoadPerDay fallback to empty:", (err as Error).message);
    return [];
  }
}

/**
 * Get room occupancy data for heatmap
 * Uses Next.js fetch cache with 60s revalidation
 */
export async function getRoomOccupancy(): Promise<RoomOccupancy[]> {
  try {
    const config = await prisma.table_config.findFirst({
      orderBy: { AcademicYear: "desc" },
      select: { AcademicYear: true, Semester: true },
    });

    if (!config) return [];

    const [totalRooms, timeslots] = await Promise.all([
      prisma.room.count(),
      prisma.timeslot.findMany({
        where: {
          AcademicYear: config.AcademicYear,
          Semester: config.Semester,
        },
        select: {
          TimeslotID: true,
          DayOfWeek: true,
        },
        orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
      }),
    ]);

    // Group by day and calculate occupancy percentage
    const occupancyData: RoomOccupancy[] = [];
    let periodCounter: Record<string, number> = {};

    for (const slot of timeslots) {
      const dayKey = slot.DayOfWeek;
      if (!periodCounter[dayKey]) {
        periodCounter[dayKey] = 1;
      }

      // Count schedules for this timeslot
      const scheduleCount = await prisma.class_schedule.count({
        where: {
          TimeslotID: slot.TimeslotID,
        },
      });

      const occupancyPercent =
        totalRooms > 0
          ? Math.round((scheduleCount / totalRooms) * 100)
          : 0;

      occupancyData.push({
        day: dayKey.slice(0, 3),
        period: periodCounter[dayKey],
        occupancyPercent,
      });

      periodCounter[dayKey]++;
    }

    return occupancyData;
  } catch (err) {
    console.warn("[PublicStats] getRoomOccupancy fallback to empty:", (err as Error).message);
    return [];
  }
}
