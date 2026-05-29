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

/**
 * Whether a timeslot is a break slot of ANY kind, without grade/teacher
 * scoping. For aggregate views (e.g. the all-teacher summary matrix) that only
 * need "is this a break column?" rather than "is it a break for this grade?".
 *
 * V2-aware: a break definition at this slotNumber marks it a break. Falls back
 * to the Breaktime enum (legacy BREAK_JUNIOR/SENIOR/BOTH and v2 BREAK all count;
 * only NOT_BREAK is teaching). Returns a superset of the raw-enum check, so it
 * never drops a break that the enum already marks.
 */
export function isBreakSlot(
  breaktime: string,
  slotNumber?: number,
  breakDefinitions?: BreakDefinition[]
): boolean {
  if (
    slotNumber !== undefined &&
    breakDefinitions &&
    breakDefinitions.length > 0 &&
    breakDefinitions.some((def) => def.slotNumber === slotNumber)
  ) {
    return true;
  }
  return breaktime !== "NOT_BREAK" && breaktime.length > 0;
}
