/**
 * Timetable Configuration Utility
 * 
 * Provides typed access to timetable configuration stored in table_config.
 * Replaces hardcoded values throughout the application.
 */

import prisma from "@/libs/prisma";
import type { semester } from "@/prisma/generated";

/**
 * Timetable configuration structure
 */
export interface TimetableConfig {
  periodsPerDay: number;
  totalPeriodsPerWeek: number;
  breakSlots: {
    junior: number;     // e.g., period 4 (lunch for junior high)
    senior: number;     // e.g., period 4 (lunch for senior high)
  };
  schoolDays: number;   // typically 5 (Mon-Fri)
  periodDuration: number; // minutes per period
}

/**
 * Default configuration (fallback if DB config not found)
 */
export const DEFAULT_TIMETABLE_CONFIG: TimetableConfig = {
  periodsPerDay: 8,
  totalPeriodsPerWeek: 40, // 8 periods × 5 days
  breakSlots: {
    junior: 4,
    senior: 4,
  },
  schoolDays: 5,
  periodDuration: 50,
};

/**
 * Get timetable configuration for a specific semester
 * 
 * @param academicYear - Academic year (e.g., 2567)
 * @param semester - Semester (FIRST or SECOND)
 * @returns Timetable configuration with defaults if not found
 */
export async function getTimetableConfig(
  academicYear: number,
  semester: semester
): Promise<TimetableConfig> {
  try {
    const config = await prisma.table_config.findFirst({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
      select: {
        Config: true,
      },
    });

    if (!config || !config.Config) {
      console.warn(
        `No timetable config found for ${academicYear}/${semester}, using defaults`
      );
      return DEFAULT_TIMETABLE_CONFIG;
    }

    // Parse and validate the JSON config
    const jsonConfig = config.Config as Partial<TimetableConfig> & {
      breakSlots?: Partial<TimetableConfig['breakSlots']>;
    };
    
    return {
      periodsPerDay: jsonConfig.periodsPerDay ?? DEFAULT_TIMETABLE_CONFIG.periodsPerDay,
      totalPeriodsPerWeek: jsonConfig.totalPeriodsPerWeek ?? DEFAULT_TIMETABLE_CONFIG.totalPeriodsPerWeek,
      breakSlots: {
        junior: jsonConfig.breakSlots?.junior ?? DEFAULT_TIMETABLE_CONFIG.breakSlots.junior,
        senior: jsonConfig.breakSlots?.senior ?? DEFAULT_TIMETABLE_CONFIG.breakSlots.senior,
      },
      schoolDays: jsonConfig.schoolDays ?? DEFAULT_TIMETABLE_CONFIG.schoolDays,
      periodDuration: jsonConfig.periodDuration ?? DEFAULT_TIMETABLE_CONFIG.periodDuration,
    };
  } catch (error) {
    console.error("Error fetching timetable config:", error);
    return DEFAULT_TIMETABLE_CONFIG;
  }
}

/**
 * Get default configuration (synchronous, no DB call)
 * Use this for client components or when DB access is not available
 */
export function getDefaultTimetableConfig(): TimetableConfig {
  return DEFAULT_TIMETABLE_CONFIG;
}

/**
 * Calculate total periods based on days and periods per day
 */
export function calculateTotalPeriods(periodsPerDay: number, schoolDays: number): number {
  return periodsPerDay * schoolDays;
}

/**
 * Check if a period number is a break period
 */
export function isBreakPeriod(
  periodNumber: number,
  breakSlots: TimetableConfig['breakSlots'],
  gradeLevel: number
): boolean {
  const breakSlot = gradeLevel <= 3 ? breakSlots.junior : breakSlots.senior;
  return periodNumber === breakSlot;
}
