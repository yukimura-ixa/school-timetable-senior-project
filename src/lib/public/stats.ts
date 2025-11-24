/**
 * Public data access for system statistics and visualizations
 *
 * MIGRATED: Now uses publicDataRepository instead of direct Prisma queries
 * @see src/lib/infrastructure/repositories/public-data.repository.ts
 */

import { semester } from "@/prisma/generated/client";
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import type {
  QuickStats,
  PeriodLoad,
  RoomOccupancy,
} from "@/lib/infrastructure/repositories/public-data.repository";

// Re-export types for backward compatibility
export type { QuickStats, PeriodLoad, RoomOccupancy };

/**
 * Get quick stats for homepage
 * Uses Next.js fetch cache with 60s revalidation
 *
 * MIGRATED: Now uses repository pattern
 */
export async function getQuickStats(): Promise<QuickStats> {
  try {
    return await publicDataRepository.getQuickStats();
  } catch (err) {
    console.warn("[PublicStats] getQuickStats error:", (err as Error).message);
    return {
      totalTeachers: 0,
      totalClasses: 0,
      totalRooms: 0,
      totalSubjects: 0,
      totalPrograms: 0,
      periodsPerDay: 0,
      currentTerm: "N/A",
      lastUpdated: new Date().toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  }
}

/**
 * Get period load per day for sparkline visualization
 * Uses Next.js fetch cache with 60s revalidation
 *
 * MIGRATED: Now uses repository pattern
 */
export async function getPeriodLoadPerDay(): Promise<PeriodLoad[]> {
  try {
    // Get current term info from quick stats
    const stats = await publicDataRepository.getQuickStats();

    if (stats.currentTerm === "N/A") {
      return [];
    }

    // Extract academic year and semester from current term
    const termMatch = stats.currentTerm.match(/ปีการศึกษา (\d+)/);
    const semesterMatch = stats.currentTerm.match(/ภาคเรียนที่ (\d+)/);

    if (!termMatch?.[1] || !semesterMatch?.[1]) {
      return [];
    }

    const academicYear = parseInt(termMatch[1], 10);
    const semesterValue =
      semesterMatch[1] === "1" ? semester.SEMESTER_1 : semester.SEMESTER_2;

    return await publicDataRepository.getPeriodLoad(
      academicYear,
      semesterValue,
    );
  } catch (err) {
    console.warn(
      "[PublicStats] getPeriodLoadPerDay error:",
      (err as Error).message,
    );
    return [];
  }
}

/**
 * Get room occupancy data for heatmap
 * Uses Next.js fetch cache with 60s revalidation
 *
 * MIGRATED: Now uses repository pattern
 */
export async function getRoomOccupancy(): Promise<RoomOccupancy[]> {
  try {
    // Get current term info from quick stats
    const stats = await publicDataRepository.getQuickStats();

    if (stats.currentTerm === "N/A") {
      return [];
    }

    // Extract academic year and semester from current term
    const termMatch = stats.currentTerm.match(/ปีการศึกษา (\d+)/);
    const semesterMatch = stats.currentTerm.match(/ภาคเรียนที่ (\d+)/);

    if (!termMatch?.[1] || !semesterMatch?.[1]) {
      return [];
    }

    const academicYear = parseInt(termMatch[1], 10);
    const semesterValue =
      semesterMatch[1] === "1" ? semester.SEMESTER_1 : semester.SEMESTER_2;

    return await publicDataRepository.getRoomOccupancy(
      academicYear,
      semesterValue,
    );
  } catch (err) {
    console.warn(
      "[PublicStats] getRoomOccupancy error:",
      (err as Error).message,
    );
    return [];
  }
}
