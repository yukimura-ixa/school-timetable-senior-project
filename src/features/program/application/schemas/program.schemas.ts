/**
 * Application Layer: Program Schemas (MOE-Compliant)
 * 
 * Valibot schemas for MOE-compliant program feature with TypeScript type inference.
 * Supports Thai Ministry of Education curriculum structure.
 * 
 * @module program.schemas
 */

import * as v from 'valibot';
import { ProgramTrack, SubjectCategory } from '@/prisma/generated';

/**
 * Schema for creating a program
 * MOE-compliant structure with ProgramCode, Year, Track
 */
export const createProgramSchema = v.object({
  ProgramCode: v.pipe(
    v.string('รหัสหลักสูตรต้องเป็นข้อความ'),
    v.minLength(1, 'รหัสหลักสูตรห้ามว่าง'),
    v.regex(/^M[1-6]-[A-Z-]+$/, 'รหัสหลักสูตรต้องมีรูปแบบ M1-SCI, M2-LANG เป็นต้น')
  ),
  ProgramName: v.pipe(
    v.string('ชื่อหลักสูตรต้องเป็นข้อความ'),
    v.minLength(1, 'ชื่อหลักสูตรห้ามว่าง'),
    v.maxLength(200, 'ชื่อหลักสูตรต้องไม่เกิน 200 ตัวอักษร')
  ),
  Year: v.pipe(
    v.number('ปีต้องเป็นตัวเลข'),
    v.integer('ปีต้องเป็นจำนวนเต็ม'),
    v.minValue(1, 'ปีต้องอยู่ระหว่าง 1-6'),
    v.maxValue(6, 'ปีต้องอยู่ระหว่าง 1-6')
  ),
  Track: v.enum(ProgramTrack, 'แผนการเรียนไม่ถูกต้อง'),
  Description: v.optional(v.string('คำอธิบายต้องเป็นข้อความ')),
  MinTotalCredits: v.pipe(
    v.number('หน่วยกิตขั้นต่ำต้องเป็นตัวเลข'),
    v.minValue(0, 'หน่วยกิตขั้นต่ำต้องไม่น้อยกว่า 0')
  ),
  IsActive: v.optional(v.boolean('สถานะต้องเป็น true/false')),
});

export type CreateProgramInput = v.InferOutput<typeof createProgramSchema>;

/**
 * Schema for updating a program
 */
export const updateProgramSchema = v.object({
  ProgramID: v.number('รหัสหลักสูตรต้องเป็นตัวเลข'),
  ProgramCode: v.optional(v.pipe(
    v.string('รหัสหลักสูตรต้องเป็นข้อความ'),
    v.regex(/^M[1-6]-[A-Z-]+$/, 'รหัสหลักสูตรต้องมีรูปแบบ M1-SCI, M2-LANG เป็นต้น')
  )),
  ProgramName: v.pipe(
    v.string('ชื่อหลักสูตรต้องเป็นข้อความ'),
    v.minLength(1, 'ชื่อหลักสูตรห้ามว่าง'),
    v.maxLength(200, 'ชื่อหลักสูตรต้องไม่เกิน 200 ตัวอักษร')
  ),
  Track: v.optional(v.enum(ProgramTrack, 'แผนการเรียนไม่ถูกต้อง')),
  Description: v.optional(v.string('คำอธิบายต้องเป็นข้อความ')),
  MinTotalCredits: v.optional(v.pipe(
    v.number('หน่วยกิตขั้นต่ำต้องเป็นตัวเลข'),
    v.minValue(0, 'หน่วยกิตขั้นต่ำต้องไม่น้อยกว่า 0')
  )),
  IsActive: v.optional(v.boolean('สถานะต้องเป็น true/false')),
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
 */
export const getProgramsByYearSchema = v.object({
  Year: v.optional(v.pipe(
    v.number('ปีต้องเป็นตัวเลข'),
    v.integer('ปีต้องเป็นจำนวนเต็ม'),
    v.minValue(1, 'ปีต้องอยู่ระหว่าง 1-6'),
    v.maxValue(6, 'ปีต้องอยู่ระหว่าง 1-6')
  )),
  Track: v.optional(v.enum(ProgramTrack, 'แผนการเรียนไม่ถูกต้อง')),
  IsActive: v.optional(v.boolean('สถานะต้องเป็น true/false')),
});

export type GetProgramsByYearInput = v.InferOutput<typeof getProgramsByYearSchema>;

/**
 * Schema for assigning subjects to a program
 */
export const assignSubjectsToProgramSchema = v.object({
  ProgramID: v.number('รหัสหลักสูตรต้องเป็นตัวเลข'),
  subjects: v.array(
    v.object({
      SubjectCode: v.pipe(v.string('รหัสวิชาต้องเป็นข้อความ'), v.minLength(1, 'รหัสวิชาห้ามว่าง')),
      Category: v.enum(SubjectCategory, 'ประเภทวิชาไม่ถูกต้อง'),
      IsMandatory: v.boolean('สถานะบังคับต้องเป็น true/false'),
      MinCredits: v.pipe(
        v.number('หน่วยกิตขั้นต่ำต้องเป็นตัวเลข'),
        v.minValue(0, 'หน่วยกิตขั้นต่ำต้องไม่น้อยกว่า 0')
      ),
      MaxCredits: v.optional(v.pipe(
        v.number('หน่วยกิตสูงสุดต้องเป็นตัวเลข'),
        v.minValue(0, 'หน่วยกิตสูงสุดต้องไม่น้อยกว่า 0')
      )),
      SortOrder: v.optional(v.number('ลำดับต้องเป็นตัวเลข')),
    }),
    'ต้องระบุวิชาอย่างน้อย 1 รายการ'
  ),
});

export type AssignSubjectsToProgramInput = v.InferOutput<typeof assignSubjectsToProgramSchema>;

/**
 * Schema for getting program count (for pagination)
 */
export const getProgramCountSchema = v.object({
  Year: v.optional(v.number('ปีต้องเป็นตัวเลข')),
  Track: v.optional(v.enum(ProgramTrack, 'แผนการเรียนไม่ถูกต้อง')),
  IsActive: v.optional(v.boolean('สถานะต้องเป็น true/false')),
});

export type GetProgramCountInput = v.InferOutput<typeof getProgramCountSchema>;
