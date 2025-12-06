/**
 * Grade Display Utilities
 * Format numeric DisplayID to Thai grade display format
 */

/**
 * Format DisplayID to Thai grade display format
 * @param displayId String display ID (e.g., "101", "205", "615")
 * @returns Thai formatted grade display (e.g., "ม.1/1", "ม.2/5", "ม.6/15")
 * 
 * @example
 * formatGradeDisplay("101") // "ม.1/1"
 * formatGradeDisplay("205") // "ม.2/5"
 * formatGradeDisplay("615") // "ม.6/15"
 */
export function formatGradeDisplay(displayId: string): string {
  const numericId = parseInt(displayId, 10);
  const year = Math.floor(numericId / 100);
  const section = numericId % 100;
  return `ม.${year}/${section}`;
}

/**
 * Parse GradeID to DisplayID
 * @param gradeId Grade ID string (e.g., "M1-1", "M2-5")
 * @returns String DisplayID (e.g., "101", "205")
 * 
 * @example
 * parseGradeIdToDisplayId("M1-1") // "101"
 * parseGradeIdToDisplayId("M2-5") // "205"
 */
export function parseGradeIdToDisplayId(gradeId: string): string {
  const match = gradeId.match(/^M(\d+)-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid GradeID format: ${gradeId}. Expected format: M{year}-{section}`);
  }
  
  const year = parseInt(match[1]!, 10);
  const section = parseInt(match[2]!, 10);
  return String((year * 100) + section);
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
  const displayId = parseGradeIdToDisplayId(gradeId);
  return formatGradeDisplay(displayId);
}

/**
 * Parse DisplayID to year and section components
 * @param displayId String display ID (e.g., "101", "205")
 * @returns Object with year and section numbers
 * 
 * @example
 * parseDisplayId("101") // { year: 1, section: 1 }
 * parseDisplayId("615") // { year: 6, section: 15 }
 */
export function parseDisplayId(displayId: string): { year: number; section: number } {
  const numericId = parseInt(displayId, 10);
  const year = Math.floor(numericId / 100);
  const section = numericId % 100;
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
