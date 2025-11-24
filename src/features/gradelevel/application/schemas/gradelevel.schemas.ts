/**
 * Application Layer: GradeLevel Schemas
 *
 * Valibot schemas for gradelevel feature with TypeScript type inference.
 * Defines validation rules for all gradelevel-related operations.
 *
 * @module gradelevel.schemas
 */

import * as v from "valibot";
import { semester } from "@/prisma/generated/client";

/**
 * Schema for creating a single gradelevel
 */
export const createGradeLevelSchema = v.object({
  Year: v.number("ปีต้องเป็นตัวเลข"),
  Number: v.number("หมายเลขชั้นต้องเป็นตัวเลข"),
  StudentCount: v.optional(v.number("จำนวนนักเรียนต้องเป็นตัวเลข")),
  // ProgramID can be number or null, and is optional in input
  ProgramID: v.optional(
    v.union([v.number("รหัสหลักสูตรต้องเป็นตัวเลข"), v.null()]),
  ),
});

export type CreateGradeLevelInput = v.InferOutput<
  typeof createGradeLevelSchema
>;

/**
 * Schema for creating multiple gradelevels (bulk operation)
 */
export const createGradeLevelsSchema = v.array(createGradeLevelSchema);

export type CreateGradeLevelsInput = v.InferOutput<
  typeof createGradeLevelsSchema
>;

/**
 * Schema for updating a gradelevel
 */
export const updateGradeLevelSchema = v.object({
  GradeID: v.pipe(v.string(), v.minLength(1, "รหัสชั้นเรียนห้ามว่าง")),
  Year: v.number("ปีต้องเป็นตัวเลข"),
  Number: v.number("หมายเลขชั้นต้องเป็นตัวเลข"),
  StudentCount: v.optional(v.number("จำนวนนักเรียนต้องเป็นตัวเลข")),
  ProgramID: v.optional(
    v.union([v.number("รหัสหลักสูตรต้องเป็นตัวเลข"), v.null()]),
  ),
});

export type UpdateGradeLevelInput = v.InferOutput<
  typeof updateGradeLevelSchema
>;

/**
 * Schema for updating multiple gradelevels (bulk operation)
 */
export const updateGradeLevelsSchema = v.array(updateGradeLevelSchema);

export type UpdateGradeLevelsInput = v.InferOutput<
  typeof updateGradeLevelsSchema
>;

/**
 * Schema for deleting gradelevels (by IDs)
 */
export const deleteGradeLevelsSchema = v.array(
  v.pipe(v.string(), v.minLength(1, "รหัสชั้นเรียนห้ามว่าง")),
  "ต้องระบุรายการชั้นเรียนที่ต้องการลบ",
);

export type DeleteGradeLevelsInput = v.InferOutput<
  typeof deleteGradeLevelsSchema
>;

/**
 * Schema for getting a single gradelevel by ID
 */
export const getGradeLevelByIdSchema = v.object({
  GradeID: v.pipe(v.string(), v.minLength(1, "รหัสชั้นเรียนห้ามว่าง")),
});

export type GetGradeLevelByIdInput = v.InferOutput<
  typeof getGradeLevelByIdSchema
>;

/**
 * Schema for getting gradelevels for lock feature
 * (complex query based on teacher responsibilities)
 */
export const getGradeLevelsForLockSchema = v.object({
  SubjectCode: v.pipe(v.string(), v.minLength(1, "รหัสวิชาห้ามว่าง")),
  AcademicYear: v.number("ปีการศึกษาต้องเป็นตัวเลข"),
  Semester: v.enum(semester, "ภาคเรียนไม่ถูกต้อง"),
  TeacherIDs: v.array(v.number("รหัสครูต้องเป็นตัวเลข"), "ต้องระบุรายการครู"),
});

export type GetGradeLevelsForLockInput = v.InferOutput<
  typeof getGradeLevelsForLockSchema
>;
