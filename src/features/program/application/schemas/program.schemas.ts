/**
 * Application Layer: Program Schemas
 * 
 * Valibot schemas for program feature with TypeScript type inference.
 * Defines validation rules for all program-related operations.
 * 
 * @module program.schemas
 */

import * as v from 'valibot';
import { semester } from '@/prisma/generated';
import { academicYearSchema } from '@/shared/schemas/common.schemas';

/**
 * Schema for creating a program
 * Connects to gradelevels and subjects via their IDs
 */
export const createProgramSchema = v.object({
  ProgramName: v.pipe(v.string(), v.minLength(1, 'ชื่อหลักสูตรห้ามว่าง')),
  Semester: v.enum(semester, 'ภาคเรียนไม่ถูกต้อง'),
  AcademicYear: academicYearSchema,
  gradelevel: v.array(
    v.object({
      GradeID: v.pipe(v.string(), v.minLength(1, 'รหัสชั้นเรียนห้ามว่าง')),
    }),
    'ต้องระบุชั้นเรียนอย่างน้อย 1 รายการ'
  ),
  subject: v.array(
    v.object({
      SubjectCode: v.pipe(v.string(), v.minLength(1, 'รหัสวิชาห้ามว่าง')),
    }),
    'ต้องระบุวิชาอย่างน้อย 1 รายการ'
  ),
});

export type CreateProgramInput = v.InferOutput<typeof createProgramSchema>;

/**
 * Schema for updating a program
 * Includes ProgramID and replaces all relations
 */
export const updateProgramSchema = v.object({
  ProgramID: v.number('รหัสหลักสูตรต้องเป็นตัวเลข'),
  ProgramName: v.pipe(v.string(), v.minLength(1, 'ชื่อหลักสูตรห้ามว่าง')),
  Semester: v.enum(semester, 'ภาคเรียนไม่ถูกต้อง'),
  AcademicYear: academicYearSchema,
  gradelevel: v.array(
    v.object({
      GradeID: v.pipe(v.string(), v.minLength(1, 'รหัสชั้นเรียนห้ามว่าง')),
    }),
    'ต้องระบุชั้นเรียนอย่างน้อย 1 รายการ'
  ),
  subject: v.array(
    v.object({
      SubjectCode: v.pipe(v.string(), v.minLength(1, 'รหัสวิชาห้ามว่าง')),
    }),
    'ต้องระบุวิชาอย่างน้อย 1 รายการ'
  ),
});

export type UpdateProgramInput = v.InferOutput<typeof updateProgramSchema>;

/**
 * Schema for deleting a program
 */
export const deleteProgramSchema = v.object({
  ProgramID: v.number('รหัสหลักสูตรต้องเป็นตัวเลข'),
});

export type DeleteProgramInput = v.InferOutput<typeof deleteProgramSchema>;

/**
 * Schema for getting a single program by ID
 */
export const getProgramByIdSchema = v.object({
  ProgramID: v.number('รหัสหลักสูตรต้องเป็นตัวเลข'),
});

export type GetProgramByIdInput = v.InferOutput<typeof getProgramByIdSchema>;

/**
 * Schema for getting programs by Year
 * Filters programs where all gradelevels have the specified Year
 */
export const getProgramsByYearSchema = v.object({
  Year: v.number('ปีต้องเป็นตัวเลข'),
  Semester: v.optional(v.enum(semester, 'ภาคเรียนไม่ถูกต้อง')),
  AcademicYear: v.optional(academicYearSchema),
});

export type GetProgramsByYearInput = v.InferOutput<typeof getProgramsByYearSchema>;
