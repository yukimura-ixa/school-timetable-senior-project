/**
 * Timetable Configuration Server Actions
 * 
 * Provides client-accessible actions for fetching timetable configuration.
 */

'use server';

import { getTimetableConfig, getDefaultTimetableConfig, type TimetableConfig } from '@/lib/timetable-config';
import type { semester } from '@/prisma/generated/client';
import { ActionResult } from '@/shared/lib/action-wrapper';

/**
 * Get timetable configuration for a specific semester (Server Action)
 * 
 * @param academicYear - Academic year
 * @param semester - Semester
 * @returns Action result with configuration
 */
export async function getTimetableConfigAction(
  academicYear: number,
  semester: semester
): Promise<ActionResult<TimetableConfig>> {
  try {
    const config = await getTimetableConfig(academicYear, semester);
    
    return {
      success: true,
      data: config,
    };
  } catch (error) {
    console.error('Error in getTimetableConfigAction:', error);
    
    // Return default config on error
    return {
      success: true,
      data: getDefaultTimetableConfig(),
    };
  }
}

/**
 * Get default configuration (doesn't require DB access)
 */
export async function getDefaultTimetableConfigAction(): Promise<ActionResult<TimetableConfig>> {
  const config = await Promise.resolve(getDefaultTimetableConfig());
  return {
    success: true,
    data: config,
  };
}
