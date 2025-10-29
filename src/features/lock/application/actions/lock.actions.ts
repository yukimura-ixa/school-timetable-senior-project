/**
 * Lock Feature - Server Actions
 * 
 * Server Actions for managing locked class schedules.
 * Uses React 19 Server Actions with 'use server' directive.
 */

'use server';

import { createAction } from '@/shared/lib/action-wrapper';
import * as lockRepository from '../../infrastructure/repositories/lock.repository';
import {
  generateClassID,
  groupSchedulesBySubject,
  validateLockInput,
} from '../../domain/services/lock-validation.service';
import {
  getLockedSchedulesSchema,
  createLockSchema,
  deleteLocksSchema,
  type GetLockedSchedulesInput,
  type CreateLockInput,
  type DeleteLocksInput,
} from '../schemas/lock.schemas';

/**
 * Get all locked schedules for a given academic year and semester
 * Returns grouped data by SubjectCode
 */
export const getLockedSchedulesAction = createAction(
  getLockedSchedulesSchema,
  async (input: GetLockedSchedulesInput) => {
    // Fetch raw locked schedules from database
    const rawSchedules = await lockRepository.findLockedSchedules(
      input.AcademicYear,
      input.Semester
    );

    // Group schedules by SubjectCode using domain service
    const groupedSchedules = groupSchedulesBySubject(rawSchedules);

    return groupedSchedules;
  }
);

/**
 * Create locked schedules for multiple timeslots and grades
 * Creates cartesian product: timeslots × grades
 * 
 * Example: 2 timeslots × 3 grades = 6 class schedules created
 */
export const createLockAction = createAction(
  createLockSchema,
  async (input: CreateLockInput) => {
    // Validate input using domain service
    const validationError = validateLockInput({
      timeslots: input.timeslots,
      GradeIDs: input.GradeIDs,
      RespIDs: input.RespIDs,
    });

    if (validationError) {
      throw new Error(validationError);
    }

    const created = [];
    const respIds = input.RespIDs.map((respId) => ({ RespID: respId }));

    // Nested loops: for each timeslot, for each grade
    for (const timeslotId of input.timeslots) {
      for (const gradeId of input.GradeIDs) {
        // Generate ClassID using domain service
        const classId = generateClassID(timeslotId, input.SubjectCode, gradeId);

        // Create single locked schedule
        const schedule = await lockRepository.createLock({
          ClassID: classId,
          IsLocked: true,
          SubjectCode: input.SubjectCode,
          TimeslotID: timeslotId,
          RoomID: input.RoomID,
          GradeID: gradeId,
          RespIDs: respIds,
        });

        created.push(schedule);
      }
    }

    return created;
  }
);

/**
 * Delete multiple locked schedules by ClassIDs
 * Bulk delete operation
 */
export const deleteLocksAction = createAction(
  deleteLocksSchema,
  async (classIds: DeleteLocksInput) => {
    const result = await lockRepository.deleteMany(classIds);

    return {
      count: result.count,
      deletedClassIds: classIds,
    };
  }
);

/**
 * Get count of locked schedules for a given academic year and semester
 * Statistics endpoint
 */
export const getLockedScheduleCountAction = createAction(
  getLockedSchedulesSchema,
  async (input: GetLockedSchedulesInput) => {
    const count = await lockRepository.count(
      input.AcademicYear,
      input.Semester
    );

    return { count };
  }
);
