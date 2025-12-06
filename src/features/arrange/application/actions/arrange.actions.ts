/**
 * Arrange Feature - Server Actions
 *
 * React Server Actions for teacher schedule arrangement.
 * Handles fetching teacher schedules and syncing drag-and-drop changes.
 */

"use server";

import { semester } from "@/prisma/generated/client";
import { createAction } from "@/shared/lib/action-wrapper";
import {
  getTeacherScheduleSchema,
  syncTeacherScheduleSchema,
  type GetTeacherScheduleOutput,
  type SyncTeacherScheduleOutput,
} from "../schemas/arrange.schemas";
import {
  arrangeRepository,
  type TeacherScheduleWithRelations,
} from "../../infrastructure/repositories/arrange.repository";
import {
  calculateScheduleChanges,
  countChanges,
} from "../../domain/services/arrange-validation.service";

// ============================================================================
// Action Results
// ============================================================================

export type GetTeacherScheduleResult =
  | { success: true; data: TeacherScheduleWithRelations[] }
  | { success: false; error: string };

export type SyncTeacherScheduleResult =
  | {
      success: true;
      data: {
        deleted: Array<{ ClassID: number }>;
        added: Array<{
          TimeslotID: string;
          SubjectCode: string;
          GradeID: string;
          RoomID: number;
          RespID: number;
        }>;
        totalChanges: number;
      };
    }
  | { success: false; error: string };

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Get teacher's schedule with all relations
 * Used for displaying the teacher's timetable in the arrange UI
 *
 * @param input - Teacher ID
 * @returns Array of class schedules with relations
 *
 * @example
 * ```ts
 * const result = await getTeacherScheduleAction({ TeacherID: 1 });
 * if (result.success) {
 *   console.log('Schedules:', result.data);
 * }
 * ```
 */
export const getTeacherScheduleAction = createAction<
  GetTeacherScheduleOutput,
  GetTeacherScheduleResult
>(getTeacherScheduleSchema, async (input) => {
  try {
    const schedules = await arrangeRepository.findByTeacher(input.TeacherID);

    return {
      success: true,
      data: schedules,
    };
  } catch (error) {
    console.error("[getTeacherScheduleAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch teacher schedule",
    };
  }
});

/**
 * Sync teacher schedule changes (drag-and-drop)
 * Calculates diff between current and new state, then deletes/creates schedules
 *
 * @param input - Teacher ID, term info, and schedule slots
 * @returns Summary of deleted and added schedules
 *
 * @example
 * ```ts
 * const result = await syncTeacherScheduleAction({
 *   TeacherID: 1,
 *   AcademicYear: '2024',
 *   Semester: '1',
 *   Schedule: [
 *     { TimeslotID: 1, subject: {} }, // Empty slot
 *     { TimeslotID: 2, subject: { ... } }, // Slot with subject
 *   ]
 * });
 * if (result.success) {
 *   console.log('Changes:', result.data.totalChanges);
 * }
 * ```
 */
export const syncTeacherScheduleAction = createAction<
  SyncTeacherScheduleOutput,
  SyncTeacherScheduleResult
>(syncTeacherScheduleSchema, async (input) => {
  try {
    // Convert semester string to enum
    const semesterValue =
      input.Semester === "1" ? semester.SEMESTER_1 : semester.SEMESTER_2;

    // Fetch existing unlocked schedules for this teacher/term
    const existingSchedules = await arrangeRepository.findExistingUnlocked(
      input.TeacherID,
      input.AcademicYear,
      semesterValue,
    );

    // Calculate what needs to be deleted and created
    const changes = calculateScheduleChanges(input.Schedule, existingSchedules);

    // Execute deletions
    const deletedResults = await Promise.all(
      changes.deleted.map(async (item) => {
        try {
          await arrangeRepository.deleteById(item.ClassID);
          return { ClassID: item.ClassID };
        } catch (error) {
          console.warn(`Failed to delete schedule ${item.ClassID}:`, error);
          return null;
        }
      }),
    );

    // Execute creations
    const addedResults = await Promise.all(
      changes.added.map(async (item) => {
        try {
          await arrangeRepository.create({
            TimeslotID: item.TimeslotID,
            SubjectCode: item.SubjectCode,
            GradeID: item.GradeID,
            RoomID: item.RoomID,
            RespID: item.RespID,
          });
          return item;
        } catch (error) {
          console.warn(`Failed to create schedule`, error);
          return null;
        }
      }),
    );

    // Filter out failed operations
    const successfulDeletes = deletedResults.filter(
      (r) => r !== null,
    ) as Array<{
      ClassID: number;
    }>;
    const successfulAdds = addedResults.filter((r) => r !== null);

    const totalChanges = countChanges({
      deleted: successfulDeletes,
      added: successfulAdds,
    });

    console.warn(
      `[syncTeacherScheduleAction] Teacher ${input.TeacherID}: ${totalChanges} changes (${successfulDeletes.length} deleted, ${successfulAdds.length} added)`,
    );

    return {
      success: true,
      data: {
        deleted: successfulDeletes,
        added: successfulAdds,
        totalChanges,
      },
    };
  } catch (error) {
    console.error("[syncTeacherScheduleAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to sync teacher schedule",
    };
  }
});

/**
 * Get count of schedules for a teacher (utility action)
 *
 * @param input - Teacher ID
 * @returns Count of schedules
 */
export const getTeacherScheduleCountAction = createAction<
  GetTeacherScheduleOutput,
  { success: true; data: number } | { success: false; error: string }
>(getTeacherScheduleSchema, async (input) => {
  try {
    const count = await arrangeRepository.countByTeacher(input.TeacherID);

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error("[getTeacherScheduleCountAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to count teacher schedules",
    };
  }
});
