/**
 * TimeslotID Utility Functions
 *
 * Provides robust parsing and manipulation of TimeslotID strings.
 *
 * TimeslotID Format: "SEMESTER-YEAR-DAYPERIOD"
 * Examples:
 *   - "1-2567-MON1" (Semester 1, Year 2567, Monday, Period 1)
 *   - "2-2568-FRI8" (Semester 2, Year 2568, Friday, Period 8)
 *   - "1-2567-WED10" (Semester 1, Year 2567, Wednesday, Period 10)
 *
 * @module utils/timeslot-id
 */

import type { day_of_week, semester } from "@/prisma/generated/client";

/**
 * Parsed components of a TimeslotID
 */
export interface ParsedTimeslotId {
  semester: number;
  academicYear: number;
  day: day_of_week;
  period: number;
  /** Original TimeslotID string */
  raw: string;
}

/**
 * Valid day codes in TimeslotID
 */
const VALID_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

/**
 * Extract period number from TimeslotID
 *
 * Uses regex to robustly extract the trailing digits,
 * regardless of TimeslotID format variations.
 *
 * @param timeslotId - TimeslotID string (e.g., "1-2567-MON1")
 * @returns Period number (1-16), or 0 if parsing fails
 *
 * @example
 * extractPeriodFromTimeslotId("1-2567-MON1")   // 1
 * extractPeriodFromTimeslotId("1-2567-FRI8")   // 8
 * extractPeriodFromTimeslotId("1-2567-WED10")  // 10
 * extractPeriodFromTimeslotId("invalid")       // 0
 */
export function extractPeriodFromTimeslotId(timeslotId: string): number {
  if (!timeslotId || typeof timeslotId !== "string") {
    return 0;
  }

  // Match trailing digits at end of string
  const match = timeslotId.match(/(\d+)$/);
  if (match && match[1]) {
    const period = parseInt(match[1], 10);
    // Validate reasonable period range (1-16 for extended schedules)
    if (period >= 1 && period <= 16) {
      return period;
    }
  }

  return 0;
}

/**
 * Extract day of week from TimeslotID
 *
 * @param timeslotId - TimeslotID string (e.g., "1-2567-MON1")
 * @returns Day of week string (MON, TUE, etc.), or null if parsing fails
 *
 * @example
 * extractDayFromTimeslotId("1-2567-MON1")  // "MON"
 * extractDayFromTimeslotId("1-2567-FRI8")  // "FRI"
 */
export function extractDayFromTimeslotId(
  timeslotId: string,
): day_of_week | null {
  if (!timeslotId || typeof timeslotId !== "string") {
    return null;
  }

  // Match day code (3 uppercase letters before digits)
  const match = timeslotId.match(/(MON|TUE|WED|THU|FRI|SAT|SUN)/);
  if (match && match[1]) {
    return match[1] as day_of_week;
  }

  return null;
}

/**
 * Extract academic year from TimeslotID
 *
 * @param timeslotId - TimeslotID string (e.g., "1-2567-MON1")
 * @returns Academic year (e.g., 2567), or null if parsing fails
 *
 * @example
 * extractYearFromTimeslotId("1-2567-MON1")  // 2567
 * extractYearFromTimeslotId("2-2568-FRI8")  // 2568
 */
export function extractYearFromTimeslotId(timeslotId: string): number | null {
  if (!timeslotId || typeof timeslotId !== "string") {
    return null;
  }

  // Split by hyphen and get second part (year)
  const parts = timeslotId.split("-");
  if (parts.length >= 2 && parts[1]) {
    const year = parseInt(parts[1], 10);
    // Validate reasonable Thai Buddhist year range
    if (year >= 2500 && year <= 2700) {
      return year;
    }
  }

  return null;
}

/**
 * Extract semester from TimeslotID
 *
 * @param timeslotId - TimeslotID string (e.g., "1-2567-MON1")
 * @returns Semester number (1 or 2), or null if parsing fails
 *
 * @example
 * extractSemesterFromTimeslotId("1-2567-MON1")  // 1
 * extractSemesterFromTimeslotId("2-2568-FRI8")  // 2
 */
export function extractSemesterFromTimeslotId(
  timeslotId: string,
): 1 | 2 | null {
  if (!timeslotId || typeof timeslotId !== "string") {
    return null;
  }

  // Split by hyphen and get first part (semester)
  const parts = timeslotId.split("-");
  if (parts.length >= 1 && parts[0]) {
    const sem = parseInt(parts[0], 10);
    if (sem === 1 || sem === 2) {
      return sem;
    }
  }

  return null;
}

/**
 * Parse a complete TimeslotID into its components
 *
 * @param timeslotId - TimeslotID string (e.g., "1-2567-MON1")
 * @returns Parsed components, or null if parsing fails
 *
 * @example
 * parseTimeslotId("1-2567-MON1")
 * // { semester: 1, academicYear: 2567, day: "MON", period: 1, raw: "1-2567-MON1" }
 */
export function parseTimeslotId(timeslotId: string): ParsedTimeslotId | null {
  const semester = extractSemesterFromTimeslotId(timeslotId);
  const academicYear = extractYearFromTimeslotId(timeslotId);
  const day = extractDayFromTimeslotId(timeslotId);
  const period = extractPeriodFromTimeslotId(timeslotId);

  if (
    semester === null ||
    academicYear === null ||
    day === null ||
    period === 0
  ) {
    return null;
  }

  return {
    semester,
    academicYear,
    day,
    period,
    raw: timeslotId,
  };
}

/**
 * Generate a TimeslotID from components
 *
 * @param semester - Semester number (1 or 2) or semester enum
 * @param academicYear - Academic year (e.g., 2567)
 * @param day - Day of week (MON, TUE, etc.)
 * @param period - Period number (1-16)
 * @returns TimeslotID string (e.g., "1-2567-MON1")
 *
 * @example
 * generateTimeslotId(1, 2567, "MON", 1)  // "1-2567-MON1"
 * generateTimeslotId("SEMESTER_2", 2568, "FRI", 8)  // "2-2568-FRI8"
 */
export function generateTimeslotId(
  semester: number | semester,
  academicYear: number,
  day: day_of_week,
  period: number,
): string {
  const semNum =
    typeof semester === "string"
      ? semester === "SEMESTER_1"
        ? 1
        : 2
      : semester;

  return `${semNum}-${academicYear}-${day}${period}`;
}

/**
 * Extract ConfigID (semester-year) from TimeslotID
 *
 * @param timeslotId - TimeslotID string (e.g., "1-2567-MON1")
 * @returns ConfigID string (e.g., "1-2567"), or null if parsing fails
 *
 * @example
 * extractConfigIdFromTimeslotId("1-2567-MON1")  // "1-2567"
 * extractConfigIdFromTimeslotId("2-2568-FRI8")  // "2-2568"
 */
export function extractConfigIdFromTimeslotId(
  timeslotId: string,
): string | null {
  const semester = extractSemesterFromTimeslotId(timeslotId);
  const year = extractYearFromTimeslotId(timeslotId);

  if (semester === null || year === null) {
    return null;
  }

  return `${semester}-${year}`;
}

/**
 * Validate a TimeslotID string
 *
 * @param timeslotId - String to validate
 * @returns True if valid TimeslotID format
 *
 * @example
 * isValidTimeslotId("1-2567-MON1")  // true
 * isValidTimeslotId("invalid")      // false
 * isValidTimeslotId("1-2567-MON")   // false (no period)
 */
export function isValidTimeslotId(timeslotId: string): boolean {
  return parseTimeslotId(timeslotId) !== null;
}
