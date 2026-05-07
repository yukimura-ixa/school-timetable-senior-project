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
  // Legacy logic fallback
  if (breaktime === "BREAK_BOTH") return true;
  if (breaktime === "BREAK_JUNIOR") return typeof gradeLevel !== "undefined" && gradeLevel <= 3;
  if (breaktime === "BREAK_SENIOR") return typeof gradeLevel !== "undefined" && gradeLevel >= 4;

  // New V2 Logic: if the breaktime indicates a break slot and we have definitions
  if (breaktime === "BREAK" && breakDefinitions) {
    // Find definitions that match this slot number
    const matchingDefs = breakDefinitions.filter((def) => def.slotNumber === slotNumber);
    if (matchingDefs.length === 0) return false;

    // A slot might have multiple definitions for different groups, or a single definition for multiple groups.
    // However, the current V2 `groups` array relies on mapping to grade level names ("junior", "senior").
    // Wait, let's see how `groups` is defined. The V2 config stores group names (e.g., ["junior"], ["*"]).
    // The actual grade mapping should happen via `break_group` tables, but for client-side rendering
    // without hitting the DB for every cell, we can rely on standard naming conventions if possible,
    // OR we must pass down the `breakGroupMap` (a map of groupName -> gradeIds).
    
    // For now, if groups include "*", it's for everyone.
    if (matchingDefs.some((def) => def.groups.includes("*"))) return true;

    // If we only have basic gradeLevel info but no precise group mapping, we can fallback to heuristics for default groups.
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
  if (breaktime === "BREAK_BOTH") return true;
  
  // If it's a V2 break and applies to all groups
  if (breaktime === "BREAK" && breakDefinitions) {
    const matchingDefs = breakDefinitions.filter((def) => def.slotNumber === slotNumber);
    if (matchingDefs.some((def) => def.groups.includes("*"))) return true;
  }
  
  return false;
}
