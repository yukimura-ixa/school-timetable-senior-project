/**
 * Timetable Configuration Utility
 * 
 * Provides typed access to timetable configuration stored in table_config.
 * Replaces hardcoded values throughout the application.
 * 
 * MIGRATED: Now uses configRepository instead of direct Prisma queries
 * @see src/features/config/infrastructure/repositories/config.repository.ts
 */

import * as configRepository from "@/features/config/infrastructure/repositories/config.repository";
import type { semester } from '@/prisma/generated/client';;

// Import and re-export types and constants from the constants file (safe for client components)
// This allows backward compatibility while preventing Prisma from being bundled in browser
import type { TimetableConfig } from "./timetable-config.constants";
import { DEFAULT_TIMETABLE_CONFIG } from "./timetable-config.constants";
export type { TimetableConfig } from "./timetable-config.constants";
export { DEFAULT_TIMETABLE_CONFIG } from "./timetable-config.constants";

/**
 * Get timetable configuration for a specific semester
 * 
 * MIGRATED: Now uses repository pattern
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
    const configJson = await configRepository.getTimetableConfig(
      academicYear,
      semester
    );

    if (!configJson) {
      console.warn(
        `No timetable config found for ${academicYear}/${semester}, using defaults`
      );
      return DEFAULT_TIMETABLE_CONFIG;
    }

    // Parse and validate the JSON config
    const jsonConfig = configJson as Partial<TimetableConfig> & {
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

export interface TimetableConfigMetadata {
  academicYear: number;
  semester: semester;
  totalTimeslots: number;
}

/**
 * Resolve term metadata for a config by its ID.
 * Returns the academic year, semester, and total timeslots to keep the client code
 * decoupled from Prisma.
 */
export async function getTimetableConfigMetadata(
  configId: string
): Promise<TimetableConfigMetadata | null> {
  const config = await configRepository.findByConfigId(configId);

  if (!config) {
    console.warn(`Config ${configId} not found, unable to derive metadata`);
    return null;
  }

  const totalTimeslots = await configRepository.countTimeslotsForTerm(
    config.AcademicYear,
    config.Semester
  );

  return {
    academicYear: config.AcademicYear,
    semester: config.Semester,
    totalTimeslots,
  };
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
