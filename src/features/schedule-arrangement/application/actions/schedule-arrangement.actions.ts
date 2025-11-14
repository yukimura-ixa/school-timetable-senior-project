/**
 * Application Layer: Schedule Arrangement Server Actions
 * 
 * Server Actions for schedule arrangement feature.
 * Uses action wrapper for auth, validation, and error handling.
 * 
 * @module schedule-arrangement.actions
 */

'use server';

import { createAction } from '@/shared/lib/action-wrapper';
import { scheduleRepository } from '../../infrastructure/repositories/schedule.repository';
import { checkAllConflicts } from '../../domain/services/conflict-detector.service';
import {
  arrangeScheduleSchema,
  deleteScheduleSchema,
  getSchedulesByTermSchema,
  updateScheduleLockSchema,
  type ArrangeScheduleInput,
  type DeleteScheduleInput,
  type GetSchedulesByTermInput,
  type UpdateScheduleLockInput,
} from '../schemas/schedule-arrangement.schemas';
import type { ConflictResult } from '../../domain/models/conflict.model';
import { createConflictError } from '@/types';
import type { class_schedule } from '@/prisma/generated';

/**
 * Arrange (create or update) a class schedule
 * 
 * This action:
 * 1. Validates input with Valibot
 * 2. Checks for conflicts using conflict detection service
 * 3. Creates or updates the schedule if no conflicts
 * 4. Links teacher to schedule if teacherId provided
 * 
 * @returns Success with schedule data, or conflict error
 * 
 * @example
 * ```tsx
 * const result = await arrangeScheduleAction({
 *   classId: 'C_M1-1_T1_MATH101',
 *   timeslotId: 'T1',
 *   subjectCode: 'MATH101',
 *   roomId: 101,
 *   gradeId: 'M1-1',
 *   teacherId: 1,
 *   academicYear: 2566,
 *   semester: 'SEMESTER_1',
 * });
 * 
 * if (!result.success) {
 *   // Show error to user
 *   alert(result.error);
 * } else {
 *   // Schedule arranged successfully
 *   console.log(result.data);
 * }
 * ```
 */
export const arrangeScheduleAction = createAction(
  arrangeScheduleSchema,
  async (input: ArrangeScheduleInput, userId: string) => {
    // 1. Fetch existing schedules and teacher responsibilities for conflict checking
    const [existingSchedules, responsibilities] = await Promise.all([
      scheduleRepository.findSchedulesByTerm(input.academicYear, input.semester),
      scheduleRepository.findResponsibilitiesByTerm(input.academicYear, input.semester),
    ]);

    // 2. Check for conflicts
    const conflictResult = checkAllConflicts(
      {
        classId: input.classId,
        timeslotId: input.timeslotId,
        subjectCode: input.subjectCode,
        roomId: input.roomId,
        gradeId: input.gradeId,
        teacherId: input.teacherId,
        academicYear: input.academicYear,
        semester: input.semester,
      },
      existingSchedules,
      responsibilities
    );

    // 3. If conflict found, throw error with conflict details
    if (conflictResult.hasConflict) {
      const schedule = conflictResult.conflictingSchedule;
      throw createConflictError(
        conflictResult.conflictType,
        conflictResult.message,
        {
          classId: schedule?.classId || '',
          subjectCode: schedule?.subjectCode || '',
          subjectName: schedule?.subjectName || '',
          gradeId: schedule?.gradeId || '',
          teacherId: schedule?.teacherId || null,
          teacherName: schedule?.teacherName || 'Unknown',
          timeslotId: schedule?.timeslotId || '',
          roomId: schedule?.roomId,
          roomName: schedule?.roomName,
        }
      );
    }

    // 4. Check if schedule already exists (update) or create new
    const existingSchedule = await scheduleRepository.findScheduleById(input.classId);

    let schedule;
    if (existingSchedule) {
      // Update existing schedule
      schedule = await scheduleRepository.updateSchedule(input.classId, {
        TimeslotID: input.timeslotId,
        SubjectCode: input.subjectCode,
        RoomID: input.roomId,
        GradeID: input.gradeId,
        IsLocked: input.isLocked,
      });
    } else {
      // Create new schedule
      schedule = await scheduleRepository.createSchedule({
        ClassID: input.classId,
        TimeslotID: input.timeslotId,
        SubjectCode: input.subjectCode,
        RoomID: input.roomId,
        GradeID: input.gradeId,
        IsLocked: input.isLocked,
      });
    }

    // 5. Link teacher to schedule if teacherId provided
    if (input.teacherId) {
      // Find the responsibility record for this teacher/subject/grade/term
      const responsibility = responsibilities.find(
        (r) =>
          r.teacherId === input.teacherId &&
          r.subjectCode === input.subjectCode &&
          r.gradeId === input.gradeId &&
          r.academicYear === input.academicYear &&
          r.semester === input.semester
      );

      if (responsibility) {
        await scheduleRepository.linkTeacherToSchedule(input.classId, responsibility.respId);
      }
    }

    // Return data directly - action wrapper will wrap in { success: true, data }
    return {
      classId: input.classId,
      created: !existingSchedule,
    };
  }
);

/**
 * Delete a class schedule
 * 
 * @example
 * ```tsx
 * const result = await deleteScheduleAction({ classId: 'C_M1-1_T1_MATH101' });
 * if (result.success) {
 *   console.log('Schedule deleted');
 * }
 * ```
 */
export const deleteScheduleAction = createAction(
  deleteScheduleSchema,
  async (input: DeleteScheduleInput, userId: string) => {
    // Check if schedule exists
    const schedule = await scheduleRepository.findScheduleById(input.classId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Check if schedule is locked
    if (schedule.IsLocked) {
      throw new Error('Cannot delete a locked schedule. This operation is forbidden.');
    }

    // Delete the schedule
    await scheduleRepository.deleteSchedule(input.classId);

    return {
      classId: input.classId,
      deleted: true,
    };
  }
);

/**
 * Get all schedules for a specific term
 * 
 * @example
 * ```tsx
 * const result = await getSchedulesByTermAction({
 *   academicYear: 2566,
 *   semester: 'SEMESTER_1',
 * });
 * 
 * if (result.success) {
 *   const schedules = result.data.schedules;
 *   // Render schedules in UI
 * }
 * ```
 */
export const getSchedulesByTermAction = createAction(
  getSchedulesByTermSchema,
  async (input: GetSchedulesByTermInput, userId: string) => {
    const schedules = await scheduleRepository.findSchedulesByTerm(
      input.academicYear,
      input.semester
    );

    return schedules;
  }
);

/**
 * Update the lock status of a schedule
 * Locked schedules cannot be modified or deleted
 * 
 * @example
 * ```tsx
 * const result = await updateScheduleLockAction({
 *   classId: 'C_M1-1_T1_ASSEMBLY',
 *   isLocked: true,
 * });
 * ```
 */
export const updateScheduleLockAction = createAction(
  updateScheduleLockSchema,
  async (input: UpdateScheduleLockInput, userId: string) => {
    // Check if schedule exists
    const schedule = await scheduleRepository.findScheduleById(input.classId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Update lock status
    await scheduleRepository.updateSchedule(input.classId, {
      IsLocked: input.isLocked,
    });

    return {
      classId: input.classId,
      locked: input.isLocked,
    };
  }
);

/**
 * Type exports for use in components
 */
export type ArrangeScheduleResult = {
  success: boolean;
  data?: {
    schedule: class_schedule;
    message: string;
  };
  error?: string;
  errorCode?: string;
  conflict?: ConflictResult;
};
