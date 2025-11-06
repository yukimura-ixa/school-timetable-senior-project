/**
 * Timetable Configuration Constants
 * 
 * Separated from timetable-config.ts to avoid bundling Prisma/repositories in client components.
 * This file contains only constants and types, no database logic.
 */

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
