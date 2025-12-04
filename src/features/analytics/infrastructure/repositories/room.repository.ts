/**
 * Room Repository
 * Section 3: Room Utilization
 *
 * Provides data fetching methods for room occupancy and utilization metrics.
 */

import prisma from "@/lib/prisma";
import type {
  RoomOccupancy,
  DayOccupancy,
  PeriodOccupancy,
} from "../../domain/types/analytics.types";
import {
  parseConfigId,
  getRoomUtilizationStatus,
  extractDayFromTimeslotId,
  extractPeriodFromTimeslotId,
  getThaiDayLabel,
  formatPeriodTime,
} from "../../domain/services/calculation.service";
import { DAYS_OF_WEEK } from "../../domain/types/analytics.types";
import type { day_of_week, room, timeslot } from "@/prisma/generated/client";

// Prisma payload types for room queries
type TimeslotWithDay = { TimeslotID: number; DayOfWeek: day_of_week };
type ScheduleRoomTimeslot = { RoomID: number | null; TimeslotID: number };
type RoomSelect = Pick<room, "RoomID" | "RoomName" | "Building">;

/**
 * Get room occupancy data for all rooms
 */
async function getRoomOccupancy(configId: string): Promise<RoomOccupancy[]> {
  const config = parseConfigId(configId);

  // Get timeslot IDs for this semester
  const timeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: config.academicYear,
      Semester: config.semester,
    },
    select: {
      TimeslotID: true,
      DayOfWeek: true,
    },
  });

  const timeslotIds = timeslots.map((t: TimeslotWithDay) => t.TimeslotID);
  const totalAvailableSlots = timeslotIds.length;

  // Get all rooms
  const rooms = await prisma.room.findMany({
    select: {
      RoomID: true,
      RoomName: true,
      Building: true,
    },
    orderBy: {
      RoomName: "asc",
    },
  });

  // Get all schedules for this semester
  const schedules = await prisma.class_schedule.findMany({
    where: {
      TimeslotID: {
        in: timeslotIds,
      },
    },
    select: {
      RoomID: true,
      TimeslotID: true,
    },
  });

  // Build room occupancy map
  const roomOccupancyMap = new Map<number, Set<number>>();
  const roomDayOccupancy = new Map<number, Map<string, number>>();

  schedules.forEach((schedule: ScheduleRoomTimeslot) => {
    if (!schedule.RoomID) return;

    // Track total occupancy
    if (!roomOccupancyMap.has(schedule.RoomID)) {
      roomOccupancyMap.set(schedule.RoomID, new Set());
    }
    roomOccupancyMap.get(schedule.RoomID)?.add(schedule.TimeslotID);

    // Track day-by-day occupancy
    const day = extractDayFromTimeslotId(schedule.TimeslotID);
    if (!day) return; // Skip invalid timeslots
    if (!roomDayOccupancy.has(schedule.RoomID)) {
      roomDayOccupancy.set(schedule.RoomID, new Map());
    }
    const dayMap = roomDayOccupancy.get(schedule.RoomID);
    if (dayMap) {
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }
  });

  // Build day occupancy with period details
  const dayOccupancyDetails = new Map<
    number,
    Map<
      day_of_week,
      Map<number, { classId: string; subjectCode?: string; gradeId?: string }>
    >
  >();

  // First, get detailed schedule info
  const detailedSchedules = await prisma.class_schedule.findMany({
    where: {
      TimeslotID: {
        in: timeslotIds,
      },
    },
    select: {
      RoomID: true,
      ClassID: true,
      GradeID: true,
      TimeslotID: true,
      subject: {
        select: {
          SubjectCode: true,
        },
      },
    },
  });

  // Build detailed occupancy map
  detailedSchedules.forEach((schedule: ScheduleRoomTimeslot) => {
    if (!schedule.RoomID) return;

    const day = extractDayFromTimeslotId(schedule.TimeslotID);
    const period = extractPeriodFromTimeslotId(schedule.TimeslotID);

    if (!day || period === null) return; // Skip invalid timeslots

    if (!dayOccupancyDetails.has(schedule.RoomID)) {
      dayOccupancyDetails.set(schedule.RoomID, new Map());
    }
    const roomMap = dayOccupancyDetails.get(schedule.RoomID);
    if (!roomMap) return;

    if (!roomMap.has(day as day_of_week)) {
      roomMap.set(day as day_of_week, new Map());
    }
    const dayMap = roomMap.get(day as day_of_week);
    if (!dayMap) return;
    dayMap.set(period, {
      classId: schedule.ClassID,
      subjectCode: schedule.subject?.SubjectCode,
      gradeId: schedule.GradeID || undefined,
    });
  });

  // Calculate periods per day for this semester
  const periodsPerDayMap = new Map<day_of_week, number>();
  timeslots.forEach((ts: TimeslotWithDay) => {
    periodsPerDayMap.set(
      ts.DayOfWeek,
      (periodsPerDayMap.get(ts.DayOfWeek) || 0) + 1,
    );
  });
  const periodsPerDay = Math.max(...Array.from(periodsPerDayMap.values()));

  // Transform to RoomOccupancy data
  return rooms.map((room: RoomSelect) => {
    const occupiedSlots = roomOccupancyMap.get(room.RoomID)?.size || 0;
    const totalSlots = totalAvailableSlots;
    const emptySlots = totalSlots - occupiedSlots;
    const occupancyRate =
      totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

    // Build day occupancy array with period details
    const roomDayMap = dayOccupancyDetails.get(room.RoomID);
    const dayOccupancy: DayOccupancy[] = DAYS_OF_WEEK.map((dayInfo) => {
      const day = dayInfo.value;
      const periods: PeriodOccupancy[] = [];

      for (let p = 1; p <= periodsPerDay; p++) {
        const periodData = roomDayMap?.get(day)?.get(p);
        periods.push({
          period: p,
          periodLabel: formatPeriodTime(p),
          isOccupied: !!periodData,
          classId: periodData?.classId,
          subjectCode: periodData?.subjectCode,
          gradeId: periodData?.gradeId,
        });
      }

      return {
        day,
        dayLabel: getThaiDayLabel(day),
        periods,
      };
    });

    return {
      roomId: room.RoomID,
      roomName: room.RoomName,
      building: room.Building || "",
      floor: "", // Not available in current schema
      dayOccupancy,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      totalSlots,
      occupiedSlots,
      emptySlots,
      utilizationStatus: getRoomUtilizationStatus(occupancyRate),
    };
  });
}

/**
 * Get rooms filtered by utilization status
 */
async function getRoomsByUtilizationStatus(
  configId: string,
  status: RoomOccupancy["utilizationStatus"],
): Promise<RoomOccupancy[]> {
  const occupancy = await getRoomOccupancy(configId);
  return occupancy.filter((r) => r.utilizationStatus === status);
}

/**
 * Get room occupancy for a specific room
 */
async function getRoomOccupancyById(
  configId: string,
  roomId: number,
): Promise<RoomOccupancy | null> {
  const occupancy = await getRoomOccupancy(configId);
  return occupancy.find((r) => r.roomId === roomId) || null;
}

/**
 * Get top N rooms by occupancy rate
 */
async function getTopRoomsByOccupancy(
  configId: string,
  limit = 10,
): Promise<RoomOccupancy[]> {
  const occupancy = await getRoomOccupancy(configId);
  return occupancy
    .sort((a, b) => b.occupancyRate - a.occupancyRate)
    .slice(0, limit);
}

/**
 * Get rooms with low utilization (rarely-used and light)
 */
async function getLowUtilizationRooms(
  configId: string,
): Promise<RoomOccupancy[]> {
  const occupancy = await getRoomOccupancy(configId);
  return occupancy.filter(
    (r) =>
      r.utilizationStatus === "rarely-used" || r.utilizationStatus === "light",
  );
}

export const roomRepository = {
  getRoomOccupancy,
  getRoomsByUtilizationStatus,
  getRoomOccupancyById,
  getTopRoomsByOccupancy,
  getLowUtilizationRooms,
};
