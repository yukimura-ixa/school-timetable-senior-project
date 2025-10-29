/**
 * Application Layer: Subject Schemas (MOE-Compliant)
 * 
 * Valibot schemas for subject feature with TypeScript type inference.
 * Defines validation rules for all subject-related operations.
 * Updated for MOE curriculum compliance.
 * 
 * @module subject.schemas
 */

import * as v from 'valibot';
import { subject_credit, SubjectCategory, LearningArea, ActivityType } from '@/prisma/generated';

/**
 * Schema for creating a single subject
 */
export const createSubjectSchema = v.object({
  SubjectCode: v.pipe(v.string(), v.minLength(1, 'รหัสวิชาห้ามว่าง')),
  SubjectName: v.pipe(v.string(), v.minLength(1, 'ชื่อวิชาห้ามว่าง')),
  Credit: v.enum(subject_credit, 'หน่วยกิตไม่ถูกต้อง'),
  Category: v.enum(SubjectCategory, 'ประเภทวิชาไม่ถูกต้อง'),
  LearningArea: v.nullable(v.enum(LearningArea, 'สาระการเรียนรู้ไม่ถูกต้อง')),
  ActivityType: v.nullable(v.enum(ActivityType, 'ประเภทกิจกรรมไม่ถูกต้อง')),
  IsGraded: v.boolean('ค่าให้คะแนนต้องเป็น true หรือ false'),
  Description: v.nullable(v.string()),
});

export type CreateSubjectInput = v.InferOutput<typeof createSubjectSchema>;

/**
 * Schema for creating multiple subjects (bulk operation)
 */
export const createSubjectsSchema = v.array(
  createSubjectSchema,
  'ต้องระบุวิชาอย่างน้อย 1 รายการ'
);

export type CreateSubjectsInput = v.InferOutput<typeof createSubjectsSchema>;

/**
 * Schema for updating a single subject
 */
export const updateSubjectSchema = v.object({
  SubjectCode: v.pipe(v.string(), v.minLength(1, 'รหัสวิชาห้ามว่าง')),
  SubjectName: v.pipe(v.string(), v.minLength(1, 'ชื่อวิชาห้ามว่าง')),
  Credit: v.enum(subject_credit, 'หน่วยกิตไม่ถูกต้อง'),
  Category: v.enum(SubjectCategory, 'ประเภทวิชาไม่ถูกต้อง'),
  LearningArea: v.nullable(v.enum(LearningArea, 'สาระการเรียนรู้ไม่ถูกต้อง')),
  ActivityType: v.nullable(v.enum(ActivityType, 'ประเภทกิจกรรมไม่ถูกต้อง')),
  IsGraded: v.boolean('ค่าให้คะแนนต้องเป็น true หรือ false'),
  Description: v.nullable(v.string()),
});

export type UpdateSubjectInput = v.InferOutput<typeof updateSubjectSchema>;

/**
 * Schema for updating multiple subjects (bulk operation)
 */
export const updateSubjectsSchema = v.array(
  updateSubjectSchema,
  'ต้องระบุวิชาอย่างน้อย 1 รายการ'
);

export type UpdateSubjectsInput = v.InferOutput<typeof updateSubjectsSchema>;

/**
 * Schema for deleting subjects (by SubjectCode array)
 */
export const deleteSubjectsSchema = v.object({
  subjectCodes: v.array(
    v.pipe(v.string(), v.minLength(1, 'รหัสวิชาห้ามว่าง')),
    'ต้องระบุวิชาที่ต้องการลบ'
  ),
});

export type DeleteSubjectsInput = v.InferOutput<typeof deleteSubjectsSchema>;

/**
 * Schema for getting a single subject by SubjectCode
 */
export const getSubjectByCodeSchema = v.object({
  SubjectCode: v.pipe(v.string(), v.minLength(1, 'รหัสวิชาห้ามว่าง')),
});

export type GetSubjectByCodeInput = v.InferOutput<typeof getSubjectByCodeSchema>;
