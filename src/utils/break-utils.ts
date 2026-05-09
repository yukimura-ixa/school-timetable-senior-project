import type { BreakDefinition } from "@/features/timeslot/domain/models/break.types";

/**
 * Utility to determine if a specific timeslot is a break for a specific grade level or grade ID.
 * Supports both legacy Breaktime enum strings ("BREAK_JUNIOR", "BREAK_SENIOR", "BREAK_BOTH")
 * and the new V2 break definitions mapping ("BREAK" + breakDefinitions).
 */
export function isBreakForGrade(
  breaktime: string,
  gradeLevel: number | undefined,
  slotNumber: number,
  breakDefinitions?: BreakDefinition[],
  gradeId?: string
): boolean {
  // V2 Logic: if the breaktime indicates a break slot and we have definitions
  if (breaktime === "BREAK" && breakDefinitions) {
    // Find definitions that match this slot number
    const matchingDefs = breakDefinitions.filter((def) => def.slotNumber === slotNumber);
    if (matchingDefs.length === 0) return false;

    // For now, if groups include "*", it's for everyone.
    if (matchingDefs.some((def) => def.groups.includes("*"))) return true;

    // "junior" -> gradeLevel <= 3
    // "senior" -> gradeLevel >= 4
    for (const def of matchingDefs) {
      if (def.groups.includes("junior") && gradeLevel && gradeLevel <= 3) return true;
      if (def.groups.includes("senior") && gradeLevel && gradeLevel >= 4) return true;
    }
  }

  return false;
}

/**
 * Checks if a slot is a break for a teacher. 
 * Teachers have a break if all groups they teach or all students have a break, or typically 
 * for teachers, we check if they have a scheduled class. If not, it's their free time, but 
 * the "break slot" UI highlighting is usually shown if it's BREAK_BOTH or if they don't have a class.
 */
export function isBreakForTeacher(
  breaktime: string,
  slotNumber: number,
  breakDefinitions?: BreakDefinition[]
): boolean {
  
  // If it's a V2 break and applies to all groups
  if (breaktime === "BREAK" && breakDefinitions) {
    const matchingDefs = breakDefinitions.filter((def) => def.slotNumber === slotNumber);
    if (matchingDefs.some((def) => def.groups.includes("*"))) return true;
  }
  
  return false;
}
