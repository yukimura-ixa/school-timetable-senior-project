/**
 * Application Layer: Teacher Schemas
 * 
 * Valibot schemas for teacher feature with TypeScript type inference.
 * Defines validation rules for all teacher-related operations.
 * 
 * @module teacher.schemas
 */

import * as v from 'valibot';

/**
 * Schema for creating a single teacher
 */
export const createTeacherSchema = v.object({
  Prefix: v.pipe(v.string(), v.minLength(1, 'คำนำหน้าชื่อห้ามว่าง')),
  Firstname: v.pipe(v.string(), v.minLength(1, 'ชื่อห้ามว่าง')),
  Lastname: v.pipe(v.string(), v.minLength(1, 'นามสกุลห้ามว่าง')),
  Email: v.pipe(
    v.string(),
    v.minLength(1, 'อีเมลห้ามว่าง'),
    v.email('รูปแบบอีเมลไม่ถูกต้อง')
  ),
  Department: v.pipe(v.string(), v.minLength(1, 'ภาควิชาห้ามว่าง')),
});

export type CreateTeacherInput = v.InferOutput<typeof createTeacherSchema>;

/**
 * Schema for creating multiple teachers (bulk operation)
 */
export const createTeachersSchema = v.array(createTeacherSchema);

export type CreateTeachersInput = v.InferOutput<typeof createTeachersSchema>;

/**
 * Schema for updating a teacher
 */
export const updateTeacherSchema = v.object({
  TeacherID: v.number('รหัสครูต้องเป็นตัวเลข'),
  Prefix: v.pipe(v.string(), v.minLength(1, 'คำนำหน้าชื่อห้ามว่าง')),
  Firstname: v.pipe(v.string(), v.minLength(1, 'ชื่อห้ามว่าง')),
  Lastname: v.pipe(v.string(), v.minLength(1, 'นามสกุลห้ามว่าง')),
  Email: v.pipe(
    v.string(),
    v.minLength(1, 'อีเมลห้ามว่าง'),
    v.email('รูปแบบอีเมลไม่ถูกต้อง')
  ),
  Department: v.pipe(v.string(), v.minLength(1, 'ภาควิชาห้ามว่าง')),
});

export type UpdateTeacherInput = v.InferOutput<typeof updateTeacherSchema>;

/**
 * Schema for updating multiple teachers (bulk operation)
 */
export const updateTeachersSchema = v.array(updateTeacherSchema);

export type UpdateTeachersInput = v.InferOutput<typeof updateTeachersSchema>;

/**
 * Schema for deleting teachers (by IDs)
 */
export const deleteTeachersSchema = v.array(
  v.number('รหัสครูต้องเป็นตัวเลข'),
  'ต้องระบุรายการครูที่ต้องการลบ'
);

export type DeleteTeachersInput = v.InferOutput<typeof deleteTeachersSchema>;

/**
 * Schema for getting a single teacher by ID
 */
export const getTeacherByIdSchema = v.object({
  TeacherID: v.number('รหัสครูต้องเป็นตัวเลข'),
});

export type GetTeacherByIdInput = v.InferOutput<typeof getTeacherByIdSchema>;
