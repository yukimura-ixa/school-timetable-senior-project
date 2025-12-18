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
  const { year, section } = parseGradeId(gradeId);
  return formatGradeDisplay(year, section);
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
