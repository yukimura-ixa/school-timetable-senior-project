/**
 * Teaching Assignment Valibot Schemas
 * Validation schemas for teacher-subject assignment operations
 */

import * as v from "valibot";

/**
 * Schema for assigning a single teacher to a subject
 */
export const assignTeacherSchema = v.object({
  TeacherID: v.pipe(
    v.number("Teacher ID must be a number"),
    v.minValue(1, "Teacher ID must be positive"),
  ),
  SubjectCode: v.pipe(
    v.string("Subject code must be a string"),
    v.minLength(1, "Subject code is required"),
  ),
  GradeID: v.pipe(
    v.string("Grade ID must be a string"),
    v.minLength(1, "Grade ID is required"),
  ),
  Semester: v.picklist(
    ["SEMESTER_1", "SEMESTER_2"] as const,
    "Semester must be SEMESTER_1 or SEMESTER_2",
  ),
  AcademicYear: v.pipe(
    v.number("Academic year must be a number"),
    v.minValue(2500, "Academic year must be at least 2500"),
    v.maxValue(2600, "Academic year must not exceed 2600"),
  ),
  TeachHour: v.pipe(
    v.number("Teaching hours must be a number"),
    v.minValue(1, "Teaching hours must be at least 1"),
    v.maxValue(20, "Teaching hours must not exceed 20"),
  ),
});

export type AssignTeacherInput = v.InferInput<typeof assignTeacherSchema>;
export type AssignTeacherOutput = v.InferOutput<typeof assignTeacherSchema>;

/**
 * Schema for unassigning a teacher from a subject
 */
export const unassignTeacherSchema = v.object({
  RespID: v.pipe(
    v.number("Responsibility ID must be a number"),
    v.minValue(1, "Responsibility ID must be positive"),
  ),
});

export type UnassignTeacherInput = v.InferInput<typeof unassignTeacherSchema>;
export type UnassignTeacherOutput = v.InferOutput<typeof unassignTeacherSchema>;

/**
 * Schema for bulk assignment operations
 */
export const bulkAssignSchema = v.object({
  assignments: v.pipe(
    v.array(assignTeacherSchema),
    v.minLength(1, "At least one assignment is required"),
    v.maxLength(100, "Maximum 100 assignments per bulk operation"),
  ),
});

export type BulkAssignInput = v.InferInput<typeof bulkAssignSchema>;
export type BulkAssignOutput = v.InferOutput<typeof bulkAssignSchema>;

/**
 * Schema for copying assignments from previous semester
 */
export const copyAssignmentsSchema = v.object({
  sourceGradeID: v.pipe(
    v.string("Source grade ID must be a string"),
    v.minLength(1, "Source grade ID is required"),
  ),
  sourceSemester: v.picklist(
    ["SEMESTER_1", "SEMESTER_2"] as const,
    "Source semester must be SEMESTER_1 or SEMESTER_2",
  ),
  sourceYear: v.pipe(
    v.number("Source year must be a number"),
    v.minValue(2500, "Source year must be at least 2500"),
    v.maxValue(2600, "Source year must not exceed 2600"),
  ),
  targetGradeID: v.pipe(
    v.string("Target grade ID must be a string"),
    v.minLength(1, "Target grade ID is required"),
  ),
  targetSemester: v.picklist(
    ["SEMESTER_1", "SEMESTER_2"] as const,
    "Target semester must be SEMESTER_1 or SEMESTER_2",
  ),
  targetYear: v.pipe(
    v.number("Target year must be a number"),
    v.minValue(2500, "Target year must be at least 2500"),
    v.maxValue(2600, "Target year must not exceed 2600"),
  ),
});

export type CopyAssignmentsInput = v.InferInput<typeof copyAssignmentsSchema>;
export type CopyAssignmentsOutput = v.InferOutput<typeof copyAssignmentsSchema>;

/**
 * Schema for clearing all assignments in a context
 */
export const clearAssignmentsSchema = v.object({
  GradeID: v.pipe(
    v.string("Grade ID must be a string"),
    v.minLength(1, "Grade ID is required"),
  ),
  Semester: v.picklist(
    ["SEMESTER_1", "SEMESTER_2"] as const,
    "Semester must be SEMESTER_1 or SEMESTER_2",
  ),
  AcademicYear: v.pipe(
    v.number("Academic year must be a number"),
    v.minValue(2500, "Academic year must be at least 2500"),
    v.maxValue(2600, "Academic year must not exceed 2600"),
  ),
});

export type ClearAssignmentsInput = v.InferInput<typeof clearAssignmentsSchema>;
export type ClearAssignmentsOutput = v.InferOutput<
  typeof clearAssignmentsSchema
>;
