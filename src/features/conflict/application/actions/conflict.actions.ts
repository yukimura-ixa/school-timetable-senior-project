/**
 * Conflict Detection Actions
 * 
 * Server Actions for detecting and analyzing schedule conflicts
 */

'use server';

import { createAction } from "@/shared/lib/action-wrapper";
import { conflictRepository } from "../../infrastructure/repositories/conflict.repository";
import { getConflictsSchema, type GetConflictsInput } from "../schemas/conflict.schemas";

/**
 * Get all schedule conflicts for a term
 * 
 * Returns conflicts grouped by type:
 * - Teacher conflicts (double-booked teachers)
 * - Room conflicts (double-booked rooms)
 * - Class conflicts (class with multiple subjects at same time)
 * - Unassigned schedules (missing teacher/room)
 */
export const getConflictsAction = createAction(
  getConflictsSchema,
  async (input: GetConflictsInput) => {
    const conflicts = await conflictRepository.findAllConflicts(
      input.AcademicYear,
      input.Semester
    );
    return conflicts;
  }
);
