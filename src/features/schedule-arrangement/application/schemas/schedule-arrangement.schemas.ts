/**
 * Valibot Schemas: Schedule Arrangement
 * 
 * Input validation schemas for schedule arrangement operations.
 * Uses Valibot for runtime type checking and validation.
 * 
 * @module schedule-arrangement.schemas
 */

import * as v from 'valibot';
import {
  academicYearSchema,
  semesterSchema,
  nonEmptyStringSchema,
} from '@/shared/schemas/common.schemas';

/**
 * Schema for arranging a schedule (create or update)
 * 
 * @example
 * ```ts
 * const result = v.safeParse(arrangeScheduleSchema, {
 *   classId: 'C_M1-1_T1_MATH101',
 *   timeslotId: 'T1',
 *   subjectCode: 'MATH101',
 *   roomId: 101,
 *   gradeId: 'M1-1',
 *   teacherId: 1,
 *   academicYear: 2566,
 *   semester: 'SEMESTER_1',
 * });
 * ```
 */
export const arrangeScheduleSchema = v.object({
  classId: v.pipe(
    v.string('Class ID must be a string'),
    v.nonEmpty('Class ID is required'),
    v.maxLength(255, 'Class ID must not exceed 255 characters')
  ),
  timeslotId: v.pipe(
    v.string('Timeslot ID must be a string'),
    v.nonEmpty('Timeslot ID is required')
  ),
  subjectCode: v.pipe(
    v.string('Subject code must be a string'),
    v.nonEmpty('Subject code is required'),
    v.maxLength(50, 'Subject code must not exceed 50 characters')
  ),
  roomId: v.nullable(
    v.pipe(
      v.number('Room ID must be a number'),
      v.integer('Room ID must be an integer'),
      v.minValue(1, 'Room ID must be positive')
    ),
    null
  ),
  gradeId: v.pipe(
    v.string('Grade ID must be a string'),
    v.nonEmpty('Grade ID is required'),
    v.maxLength(50, 'Grade ID must not exceed 50 characters')
  ),
  teacherId: v.optional(
    v.pipe(
      v.number('Teacher ID must be a number'),
      v.integer('Teacher ID must be an integer'),
      v.minValue(1, 'Teacher ID must be positive')
    )
  ),
  academicYear: academicYearSchema,
  semester: semesterSchema,
  isLocked: v.optional(v.boolean('Is locked must be a boolean'), false),
});

/**
 * Inferred TypeScript type from arrangeScheduleSchema
 */
export type ArrangeScheduleInput = v.InferOutput<typeof arrangeScheduleSchema>;

/**
 * Schema for deleting a schedule
 */
export const deleteScheduleSchema = v.object({
  classId: nonEmptyStringSchema,
});

/**
 * Inferred TypeScript type from deleteScheduleSchema
 */
export type DeleteScheduleInput = v.InferOutput<typeof deleteScheduleSchema>;

/**
 * Schema for getting schedules by term
 */
export const getSchedulesByTermSchema = v.object({
  academicYear: academicYearSchema,
  semester: semesterSchema,
});

/**
 * Inferred TypeScript type from getSchedulesByTermSchema
 */
export type GetSchedulesByTermInput = v.InferOutput<typeof getSchedulesByTermSchema>;

/**
 * Schema for updating schedule lock status
 */
export const updateScheduleLockSchema = v.object({
  classId: nonEmptyStringSchema,
  isLocked: v.boolean('Is locked must be a boolean'),
});

/**
 * Inferred TypeScript type from updateScheduleLockSchema
 */
export type UpdateScheduleLockInput = v.InferOutput<typeof updateScheduleLockSchema>;

/**
 * Schema for batch arranging schedules
 * Used when arranging multiple schedules at once
 */
export const batchArrangeSchedulesSchema = v.object({
  schedules: v.pipe(
    v.array(arrangeScheduleSchema),
    v.minLength(1, 'At least one schedule is required'),
    v.maxLength(100, 'Cannot arrange more than 100 schedules at once')
  ),
});

/**
 * Inferred TypeScript type from batchArrangeSchedulesSchema
 */
export type BatchArrangeSchedulesInput = v.InferOutput<typeof batchArrangeSchedulesSchema>;
