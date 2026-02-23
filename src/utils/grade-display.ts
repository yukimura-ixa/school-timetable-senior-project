/**
 * Grade Display Utilities
 * Format grade information to Thai grade display format
 */

/**
 * Format year and section to Thai grade display format
 * @param year Grade year (1-6 for M.1-M.6)
 * @param section Section number
 * @returns Thai formatted grade display (e.g., "ม.1/1", "ม.2/5", "ม.6/15")
 * 
 * @example
 * formatGradeDisplay(1, 1) // "ม.1/1"
 * formatGradeDisplay(2, 5) // "ม.2/5"
 * formatGradeDisplay(6, 15) // "ม.6/15"
 */
export function formatGradeDisplay(year: number, section: number): string {
  return `ม.${year}/${section}`;
}

/**
 * Format GradeID to Thai display format
 * @param gradeId Grade ID string (e.g., "M1-1", "M2-5")
 * @returns Thai formatted grade display (e.g., "ม.1/1", "ม.2/5")
 * 
 * @example
 * formatGradeIdDisplay("M1-1") // "ม.1/1"
 * formatGradeIdDisplay("M2-5") // "ม.2/5"
 */
export function formatGradeIdDisplay(gradeId: string): string {
  if (!gradeId) {
    return "";
  }

  const canonicalMatch = /^M(\d+)-(\d+)$/.exec(gradeId);
  if (canonicalMatch) {
    const year = Number.parseInt(canonicalMatch[1]!, 10);
    const section = Number.parseInt(canonicalMatch[2]!, 10);
    if (year >= 1 && year <= 6 && section >= 1) {
      return formatGradeDisplay(year, section);
    }
    return gradeId;
  }

  const thaiMatch = /^ม\.(\d+)\/(\d+)$/.exec(gradeId);
  if (thaiMatch) {
    const year = Number.parseInt(thaiMatch[1]!, 10);
    const section = Number.parseInt(thaiMatch[2]!, 10);
    if (year >= 1 && year <= 6 && section >= 1) {
      return `ม.${thaiMatch[1]}/${thaiMatch[2]}`;
    }
    return gradeId;
  }

  const legacyMatch = /^(\d+)-(\d+)(?:-(\d{4}))?$/.exec(gradeId);
  if (legacyMatch) {
    const rawYear = Number.parseInt(legacyMatch[1]!, 10);
    const section = Number.parseInt(legacyMatch[2]!, 10);
    if (Number.isFinite(rawYear) && Number.isFinite(section)) {
      const thaiYear = rawYear >= 7 && rawYear <= 12 ? rawYear - 6 : rawYear;
      if (thaiYear >= 1 && thaiYear <= 6 && section >= 1) {
        return formatGradeDisplay(thaiYear, section);
      }
    }
  }

  const numericMatch = /^(\d{3})$/.exec(gradeId);
  if (numericMatch) {
    const numeric = Number.parseInt(numericMatch[1]!, 10);
    const rawYear = Math.floor(numeric / 100);
    const section = numeric % 100;
    const thaiYear = rawYear >= 7 && rawYear <= 12 ? rawYear - 6 : rawYear;
    if (thaiYear >= 1 && thaiYear <= 6 && section >= 1) {
      return formatGradeDisplay(thaiYear, section);
    }
  }

  return gradeId;
}

/**
 * Parse GradeID to year and section components
 * @param gradeId Grade ID string (e.g., "M1-1", "M2-5")
 * @returns Object with year and section numbers
 * 
 * @example
 * parseGradeId("M1-1") // { year: 1, section: 1 }
 * parseGradeId("M6-15") // { year: 6, section: 15 }
 */
export function parseGradeId(gradeId: string): { year: number; section: number } {
  const match = gradeId.match(/^M(\d+)-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid GradeID format: ${gradeId}. Expected format: M{year}-{section}`);
  }
  
  const year = parseInt(match[1]!, 10);
  const section = parseInt(match[2]!, 10);
  return { year, section };
}

/**
 * Generate GradeID from year and section
 * @param year Grade year (1-6 for M.1-M.6)
 * @param section Section number
 * @returns Grade ID string (e.g., "M1-1", "M2-5")
 * 
 * @example
 * generateGradeId(1, 1) // "M1-1"
 * generateGradeId(6, 15) // "M6-15"
 */
export function generateGradeId(year: number, section: number): string {
  return `M${year}-${section}`;
}

/**
 * Extract grade level prefix from a GradeID (e.g., "M1-1" → "M1", "M2-5" → "M2")
 * Used for grade-level-wide operations like locking timeslots.
 * 
 * @param gradeId Grade ID string (e.g., "M1-1", "M2-5")
 * @returns Grade level string (e.g., "M1", "M2"), or the original gradeId if format is unexpected
 * 
 * @example
 * extractGradeLevel("M1-1") // "M1"
 * extractGradeLevel("M1-3") // "M1"
 * extractGradeLevel("M2-5") // "M2"
 * extractGradeLevel("M6-15") // "M6"
 */
export function extractGradeLevel(gradeId: string): string {
  const match = gradeId.match(/^(M\d+)-/);
  return match?.[1] ?? gradeId;
}
