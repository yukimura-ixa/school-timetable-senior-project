/**
 * Thai School Year Format Utilities
 *
 * Converts between database values and Thai display format
 * Thai School System: มัธยมศึกษา (Mathayom) ม.1-ม.6
 *
 * Database Format:
 * - Year: 1-6 (integer)
 * - GradeID: "ม.1/1", "ม.2/2", etc. (string)
 *
 * Display Format: "ม.1", "ม.2", etc.
 */

/**
 * Thai year range (1-6)
 */
export const THAI_YEAR_MIN = 1;
export const THAI_YEAR_MAX = 6;

/**
 * International year range (7-12) - legacy format
 */
export const INTERNATIONAL_YEAR_MIN = 7;
export const INTERNATIONAL_YEAR_MAX = 12;

/**
 * All valid Thai years
 */
export const ALL_THAI_YEARS = [1, 2, 3, 4, 5, 6] as const;

/**
 * Junior high years (ม.ต้น)
 */
export const JUNIOR_HIGH_YEARS = [1, 2, 3] as const;

/**
 * Senior high years (ม.ปลาย)
 */
export const SENIOR_HIGH_YEARS = [4, 5, 6] as const;

/**
 * Convert Thai year to display format
 * @param year Thai year (1-6)
 * @returns Display format "ม.1" to "ม.6"
 *
 * @example
 * formatThaiYear(1) // "ม.1"
 * formatThaiYear(6) // "ม.6"
 */
export function formatThaiYear(year: number): string {
  if (year < THAI_YEAR_MIN || year > THAI_YEAR_MAX) {
    throw new Error(
      `Invalid Thai year: ${year}. Must be between ${THAI_YEAR_MIN} and ${THAI_YEAR_MAX}`,
    );
  }
  return `ม.${year}`;
}

/**
 * Parse Thai year display format to number
 * @param thaiYearStr Display format "ม.1" to "ม.6"
 * @returns Thai year (1-6)
 *
 * @example
 * parseThaiYear("ม.1") // 1
 * parseThaiYear("ม.6") // 6
 */
export function parseThaiYear(thaiYearStr: string): number {
  const match = thaiYearStr.match(/^ม\.(\d)$/);
  if (!match) {
    throw new Error(
      `Invalid Thai year format: ${thaiYearStr}. Expected format: "ม.1" to "ม.6"`,
    );
  }
  const year = parseInt(match[1] || "0", 10);
  if (year < THAI_YEAR_MIN || year > THAI_YEAR_MAX) {
    throw new Error(
      `Invalid Thai year: ${year}. Must be between ${THAI_YEAR_MIN} and ${THAI_YEAR_MAX}`,
    );
  }
  return year;
}

/**
 * Generate Thai-format GradeID
 * @param year Thai year (1-6)
 * @param section Section/room number
 * @returns GradeID in format "ม.1/1", "ม.2/2", etc.
 *
 * @example
 * generateThaiGradeID(1, 1) // "ม.1/1"
 * generateThaiGradeID(6, 3) // "ม.6/3"
 */
export function generateThaiGradeID(year: number, section: number): string {
  if (year < THAI_YEAR_MIN || year > THAI_YEAR_MAX) {
    throw new Error(
      `Invalid Thai year: ${year}. Must be between ${THAI_YEAR_MIN} and ${THAI_YEAR_MAX}`,
    );
  }
  if (section < 1) {
    throw new Error(`Invalid section: ${section}. Must be >= 1`);
  }
  return `ม.${year}/${section}`;
}

/**
 * Parse Thai GradeID to year and section
 * @param gradeID GradeID in format "ม.1/1", "ม.2/2", etc.
 * @returns Object with year and section
 *
 * @example
 * parseThaiGradeID("ม.1/1") // { year: 1, section: 1 }
 * parseThaiGradeID("ม.6/3") // { year: 6, section: 3 }
 */
export function parseThaiGradeID(gradeID: string): {
  year: number;
  section: number;
} {
  const match = gradeID.match(/^ม\.(\d)\/(\d+)$/);
  if (!match) {
    throw new Error(
      `Invalid Thai GradeID format: ${gradeID}. Expected format: "ม.1/1", "ม.2/2", etc.`,
    );
  }
  const year = parseInt(match[1] || "0", 10);
  const section = parseInt(match[2] || "0", 10);

  if (year < THAI_YEAR_MIN || year > THAI_YEAR_MAX) {
    throw new Error(
      `Invalid Thai year in GradeID: ${year}. Must be between ${THAI_YEAR_MIN} and ${THAI_YEAR_MAX}`,
    );
  }

  return { year, section };
}

/**
 * Check if year is junior high (ม.ต้น)
 * @param year Thai year (1-6)
 * @returns true if year 1-3 (junior high)
 */
export function isJuniorHigh(year: number): boolean {
  return year >= 1 && year <= 3;
}

/**
 * Check if year is senior high (ม.ปลาย)
 * @param year Thai year (1-6)
 * @returns true if year 4-6 (senior high)
 */
export function isSeniorHigh(year: number): boolean {
  return year >= 4 && year <= 6;
}

/**
 * Get level name (junior/senior)
 * @param year Thai year (1-6)
 * @returns "ม.ต้น" or "ม.ปลาย"
 */
export function getLevelName(year: number): string {
  return isJuniorHigh(year) ? "ม.ต้น" : "ม.ปลาย";
}

/**
 * Convert international year (7-12) to Thai year (1-6)
 * @param internationalYear International year (7-12)
 * @returns Thai year (1-6)
 * @deprecated Use Thai year format directly
 *
 * @example
 * convertToThaiYear(7) // 1
 * convertToThaiYear(12) // 6
 */
export function convertToThaiYear(internationalYear: number): number {
  if (
    internationalYear < INTERNATIONAL_YEAR_MIN ||
    internationalYear > INTERNATIONAL_YEAR_MAX
  ) {
    throw new Error(
      `Invalid international year: ${internationalYear}. Must be between ${INTERNATIONAL_YEAR_MIN} and ${INTERNATIONAL_YEAR_MAX}`,
    );
  }
  return internationalYear - 6;
}

/**
 * Convert Thai year (1-6) to international year (7-12)
 * @param thaiYear Thai year (1-6)
 * @returns International year (7-12)
 * @deprecated Use Thai year format directly
 *
 * @example
 * convertToInternationalYear(1) // 7
 * convertToInternationalYear(6) // 12
 */
export function convertToInternationalYear(thaiYear: number): number {
  if (thaiYear < THAI_YEAR_MIN || thaiYear > THAI_YEAR_MAX) {
    throw new Error(
      `Invalid Thai year: ${thaiYear}. Must be between ${THAI_YEAR_MIN} and ${THAI_YEAR_MAX}`,
    );
  }
  return thaiYear + 6;
}

/**
 * Validate Thai year
 * @param year Thai year (1-6)
 * @returns true if valid
 */
export function isValidThaiYear(year: number): boolean {
  return (
    Number.isInteger(year) && year >= THAI_YEAR_MIN && year <= THAI_YEAR_MAX
  );
}

/**
 * Validate Thai GradeID format
 * @param gradeID GradeID string
 * @returns true if valid
 */
export function isValidThaiGradeID(gradeID: string): boolean {
  try {
    parseThaiGradeID(gradeID);
    return true;
  } catch {
    return false;
  }
}
