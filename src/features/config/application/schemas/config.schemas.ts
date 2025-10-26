/**
 * Config Feature - Valibot Validation Schemas
 * 
 * Defines validation schemas for table_config operations using Valibot.
 * Config feature manages timetable configuration settings stored as JSON.
 */

import * as v from 'valibot';
import { semester } from '@prisma/client';

/**
 * Schema for querying config by academic year and semester
 */
export const getConfigByTermSchema = v.object({
  AcademicYear: v.pipe(
    v.number('ปีการศึกษาต้องเป็นตัวเลข'),
    v.integer('ปีการศึกษาต้องเป็นจำนวนเต็ม'),
    v.minValue(2500, 'ปีการศึกษาต้องไม่น้อยกว่า 2500')
  ),
  Semester: v.enum(semester, 'ภาคเรียนไม่ถูกต้อง'),
});

export type GetConfigByTermInput = v.InferOutput<typeof getConfigByTermSchema>;

/**
 * Schema for creating a new config
 * ConfigID format: "SEMESTER/YEAR" (e.g., "1/2566")
 * Config is JSON (any structure)
 */
export const createConfigSchema = v.object({
  ConfigID: v.pipe(
    v.string('ConfigID ต้องเป็นข้อความ'),
    v.nonEmpty('ConfigID ต้องไม่เป็นค่าว่าง'),
    v.regex(/^\d+\/\d{4}$/, 'ConfigID ต้องมีรูปแบบ "SEMESTER/YEAR" (เช่น "1/2566")')
  ),
  AcademicYear: v.pipe(
    v.number('ปีการศึกษาต้องเป็นตัวเลข'),
    v.integer('ปีการศึกษาต้องเป็นจำนวนเต็ม'),
    v.minValue(2500, 'ปีการศึกษาต้องไม่น้อยกว่า 2500')
  ),
  Semester: v.enum(semester, 'ภาคเรียนไม่ถูกต้อง'),
  Config: v.unknown(),
});

export type CreateConfigInput = v.InferOutput<typeof createConfigSchema>;

/**
 * Schema for updating a config
 */
export const updateConfigSchema = v.object({
  ConfigID: v.pipe(
    v.string('ConfigID ต้องเป็นข้อความ'),
    v.nonEmpty('ConfigID ต้องไม่เป็นค่าว่าง')
  ),
  AcademicYear: v.optional(
    v.pipe(
      v.number('ปีการศึกษาต้องเป็นตัวเลข'),
      v.integer('ปีการศึกษาต้องเป็นจำนวนเต็ม'),
      v.minValue(2500, 'ปีการศึกษาต้องไม่น้อยกว่า 2500')
    )
  ),
  Semester: v.optional(v.enum(semester, 'ภาคเรียนไม่ถูกต้อง')),
  Config: v.optional(v.unknown()),
});

export type UpdateConfigInput = v.InferOutput<typeof updateConfigSchema>;

/**
 * Schema for deleting a config by ConfigID
 */
export const deleteConfigSchema = v.pipe(
  v.string('ConfigID ต้องเป็นข้อความ'),
  v.nonEmpty('ConfigID ต้องไม่เป็นค่าว่าง')
);

export type DeleteConfigInput = v.InferOutput<typeof deleteConfigSchema>;

/**
 * Schema for copying config from one term to another
 * Complex operation that copies config, timeslots, and optionally:
 * - assign (teachers_responsibility)
 * - lock (locked class_schedule)
 * - timetable (non-locked class_schedule)
 */
export const copyConfigSchema = v.object({
  from: v.pipe(
    v.string('from ต้องเป็นข้อความ'),
    v.nonEmpty('from ต้องไม่เป็นค่าว่าง'),
    v.regex(/^\d+\/\d{4}$/, 'from ต้องมีรูปแบบ "SEMESTER/YEAR" (เช่น "1/2566")')
  ),
  to: v.pipe(
    v.string('to ต้องเป็นข้อความ'),
    v.nonEmpty('to ต้องไม่เป็นค่าว่าง'),
    v.regex(/^\d+\/\d{4}$/, 'to ต้องมีรูปแบบ "SEMESTER/YEAR" (เช่น "2/2567")')
  ),
  assign: v.boolean('assign ต้องเป็น boolean'),
  lock: v.boolean('lock ต้องเป็น boolean'),
  timetable: v.boolean('timetable ต้องเป็น boolean'),
});

export type CopyConfigInput = v.InferOutput<typeof copyConfigSchema>;
