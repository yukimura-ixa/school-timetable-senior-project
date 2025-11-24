/**
 * Assign Feature - Valibot Schemas
 *
 * Input validation schemas for teacher assignment operations.
 * Uses Valibot for runtime type checking and validation.
 */

import * as v from "valibot";

/**
 * Schema: Get assignments by teacher and term
 * Query params: TeacherID, AcademicYear, Semester
 */
export const getAssignmentsSchema = v.object({
  TeacherID: v.pipe(v.number(), v.integer(), v.minValue(1)),
  AcademicYear: v.pipe(v.number(), v.integer(), v.minValue(2500)),
  Semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
});

export type GetAssignmentsInput = v.InferInput<typeof getAssignmentsSchema>;
export type GetAssignmentsOutput = v.InferOutput<typeof getAssignmentsSchema>;

/**
 * Schema: Get available responsibility slots by teacher and term
 * Query params: TeacherID, AcademicYear, Semester
 */
export const getAvailableRespsSchema = v.object({
  TeacherID: v.pipe(v.number(), v.integer(), v.minValue(1)),
  AcademicYear: v.pipe(v.number(), v.integer(), v.minValue(2500)),
  Semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
});

export type GetAvailableRespsInput = v.InferInput<
  typeof getAvailableRespsSchema
>;
export type GetAvailableRespsOutput = v.InferOutput<
  typeof getAvailableRespsSchema
>;

/**
 * Schema: Get subjects with locked responsibilities
 * Query params: AcademicYear, Semester
 */
export const getLockedRespsSchema = v.object({
  AcademicYear: v.pipe(v.number(), v.integer(), v.minValue(2500)),
  Semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
});

export type GetLockedRespsInput = v.InferInput<typeof getLockedRespsSchema>;
export type GetLockedRespsOutput = v.InferOutput<typeof getLockedRespsSchema>;

/**
 * Schema: Single responsibility input (for sync operation)
 * RespID is optional (present for existing, absent for new)
 */
export const responsibilityInputSchema = v.object({
  RespID: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  SubjectCode: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
  GradeID: v.pipe(v.string(), v.regex(/^\d{1,2}\/\d{4}$/)), // e.g., "10/2566"
  Credit: v.picklist(["0.5", "1.0", "1.5", "2.0", "2.5", "3.0"]),
});

export type ResponsibilityInput = v.InferInput<
  typeof responsibilityInputSchema
>;
export type ResponsibilityOutput = v.InferOutput<
  typeof responsibilityInputSchema
>;

/**
 * Schema: Sync assignments (create new, delete removed)
 * POST body with teacher info and array of responsibilities
 */
export const syncAssignmentsSchema = v.object({
  TeacherID: v.pipe(v.number(), v.integer(), v.minValue(1)),
  AcademicYear: v.pipe(v.number(), v.integer(), v.minValue(2500)),
  Semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
  Resp: v.array(responsibilityInputSchema),
});

export type SyncAssignmentsInput = v.InferInput<typeof syncAssignmentsSchema>;
export type SyncAssignmentsOutput = v.InferOutput<typeof syncAssignmentsSchema>;

/**
 * Schema: Delete assignment by RespID
 */
export const deleteAssignmentSchema = v.object({
  RespID: v.pipe(v.number(), v.integer(), v.minValue(1)),
});

export type DeleteAssignmentInput = v.InferInput<typeof deleteAssignmentSchema>;
export type DeleteAssignmentOutput = v.InferOutput<
  typeof deleteAssignmentSchema
>;
