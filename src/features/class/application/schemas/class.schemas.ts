/**
 * Class Feature - Valibot Schemas
 * 
 * Input validation schemas for class schedule operations.
 * Uses Valibot for runtime type checking and validation.
 */

import * as v from 'valibot';

/**
 * Schema: Get class schedules with flexible filtering
 * Query params: AcademicYear, Semester, optional TeacherID, optional GradeID
 */
export const getClassSchedulesSchema = v.object({
  AcademicYear: v.pipe(v.number(), v.integer(), v.minValue(2500)),
  Semester: v.picklist(['SEMESTER_1', 'SEMESTER_2']),
  TeacherID: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  GradeID: v.optional(v.pipe(v.string(), v.regex(/^\d{1,2}\/\d{4}$/))), // e.g., "10/2566"
});

export type GetClassSchedulesInput = v.InferInput<typeof getClassSchedulesSchema>;
export type GetClassSchedulesOutput = v.InferOutput<typeof getClassSchedulesSchema>;

/**
 * Schema: Get schedule conflicts for a teacher
 * Query params: AcademicYear, Semester, TeacherID
 */
export const getConflictsSchema = v.object({
  AcademicYear: v.pipe(v.number(), v.integer(), v.minValue(2500)),
  Semester: v.picklist(['SEMESTER_1', 'SEMESTER_2']),
  TeacherID: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

export type GetConflictsInput = v.InferInput<typeof getConflictsSchema>;
export type GetConflictsOutput = v.InferOutput<typeof getConflictsSchema>;

/**
 * Schema: Get class schedule summary (schedules with teachers assigned)
 * Query params: AcademicYear, Semester
 */
export const getSummarySchema = v.object({
  AcademicYear: v.pipe(v.number(), v.integer(), v.minValue(2500)),
  Semester: v.picklist(['SEMESTER_1', 'SEMESTER_2']),
});

export type GetSummaryInput = v.InferInput<typeof getSummarySchema>;
export type GetSummaryOutput = v.InferOutput<typeof getSummarySchema>;

/**
 * Schema: Create class schedule
 * POST body for creating a new schedule entry
 */
export const createClassScheduleSchema = v.object({
  ClassID: v.pipe(v.string(), v.minLength(1)),
  TimeslotID: v.pipe(v.string(), v.minLength(1)),
  SubjectCode: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
  RoomID: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  GradeID: v.pipe(v.string(), v.regex(/^\d{1,2}\/\d{4}$/)),
  IsLocked: v.optional(v.boolean()),
  ResponsibilityIDs: v.optional(v.array(v.pipe(v.number(), v.integer(), v.minValue(1)))),
});

export type CreateClassScheduleInput = v.InferInput<typeof createClassScheduleSchema>;
export type CreateClassScheduleOutput = v.InferOutput<typeof createClassScheduleSchema>;

/**
 * Schema: Update class schedule
 * PUT body for updating an existing schedule entry
 */
export const updateClassScheduleSchema = v.object({
  ClassID: v.pipe(v.string(), v.minLength(1)),
  TimeslotID: v.optional(v.pipe(v.string(), v.minLength(1))),
  SubjectCode: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(20))),
  RoomID: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  GradeID: v.optional(v.pipe(v.string(), v.regex(/^\d{1,2}\/\d{4}$/))),
  IsLocked: v.optional(v.boolean()),
  ResponsibilityIDs: v.optional(v.array(v.pipe(v.number(), v.integer(), v.minValue(1)))),
});

export type UpdateClassScheduleInput = v.InferInput<typeof updateClassScheduleSchema>;
export type UpdateClassScheduleOutput = v.InferOutput<typeof updateClassScheduleSchema>;

/**
 * Schema: Delete class schedule
 * DELETE params
 */
export const deleteClassScheduleSchema = v.object({
  ClassID: v.pipe(v.string(), v.minLength(1)),
});

export type DeleteClassScheduleInput = v.InferInput<typeof deleteClassScheduleSchema>;
export type DeleteClassScheduleOutput = v.InferOutput<typeof deleteClassScheduleSchema>;
