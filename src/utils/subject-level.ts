/**
 * Subject Level Utility
 *
 * Helper functions to determine grade level range from MOE subject codes.
 *
 * MOE Subject Code Structure: [ThaiChar][LevelCode][YearCode][Sequence (3 digits)]
 * Example: ท21101
 * - ท (ThaiChar): Category
 * - 2 (LevelCode): 1=Primary, 2=Lower Secondary, 3=Upper Secondary
 * - 1 (YearCode): Year within level (1-3 or 1-6), 0=All years in level
 * - 101 (Sequence): Serial number
 */

export type LevelRange = {
  minYear: number;
  maxYear: number;
};

/**
 * Parses a subject code to determine the expected grade level range.
 * @param subjectCode - The subject code (e.g., "ท21101")
 * @returns LevelRange object { minYear, maxYear } or null if invalid
 */
export function getSubjectLevelRange(subjectCode: string): LevelRange | null {
  if (!subjectCode || subjectCode.length < 5) return null;

  // Regex to capture LevelCode (digit 2) and YearCode (digit 3)
  // Assumes mostly standard format with Thai char start
  const match = subjectCode.match(/^[ก-ฮA-Z] \.?(\d)(\d)\d{3}$/);
  // Note: Some codes might not strictly follow this, checking simpler char checks

  // Try simpler extraction by index since codes are fixed width usually
  // But safest is regex: Thai char followed by digits
  const cleanerMatch = subjectCode.match(/^[^0-9]+(\d)(\d)\d{3}$/);

  if (!cleanerMatch) return null;

  const levelCode = parseInt(cleanerMatch[1] || "0");
  const yearCode = parseInt(cleanerMatch[2] || "0");

  // Logic mapping
  // Level 1: Primary (P.1-6) - Not implemented in this high school system?
  // Level 2: Lower Secondary (M.1-3)
  // Level 3: Upper Secondary (M.4-6)

  if (levelCode === 2) {
    // Lower Secondary
    if (yearCode === 0) return { minYear: 1, maxYear: 3 };
    if (yearCode >= 1 && yearCode <= 3)
      return { minYear: yearCode, maxYear: yearCode };
    // Fallback
    return { minYear: 1, maxYear: 3 };
  }

  if (levelCode === 3) {
    // Upper Secondary
    // M.4 is year 1 of upper sec? Or usually M.4=4?
    // In this system `gradelevel.Year` is usually 1,2,3 for M.1-3 and 4,5,6 for M.4-6?
    // Let's verify `gradelevel` schema or data.
    // Usually in this app M.1=1, ... M.6=6.

    // If levelCode=3 (Upper), yearCode=1 -> M.4 (Year 4) if mapped relative?
    // Or does YearCode 1 mean "1st year of this level"? Yes usually.
    // So for Level 3:
    // YearCode 1 => M.4 (Year 4)
    // YearCode 2 => M.5 (Year 5)
    // YearCode 3 => M.6 (Year 6)

    if (yearCode === 0) return { minYear: 4, maxYear: 6 };
    if (yearCode >= 1 && yearCode <= 3)
      return { minYear: yearCode + 3, maxYear: yearCode + 3 }; // Map 1->4, 2->5, 3->6
    return { minYear: 4, maxYear: 6 };
  }

  // Level 1 (Primary) ??
  if (levelCode === 1) {
    // Assuming 1->1 ...
    if (yearCode === 0) return { minYear: 1, maxYear: 6 };
    return { minYear: yearCode, maxYear: yearCode };
  }

  return null;
}
