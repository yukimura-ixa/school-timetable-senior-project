/**
 * Lock Feature - Valibot Validation Schemas
 * 
 * Defines validation schemas for locked schedule operations using Valibot.
 * Lock feature manages class schedules that are locked across multiple grades/timeslots.
 */

import * as v from 'valibot';
import { semester } from '@/prisma/generated/client';

/**
 * Schema for querying locked schedules
 * Query params: AcademicYear and Semester
 */
export const getLockedSchedulesSchema = v.object({
  AcademicYear: v.pipe(
    v.number('ปีการศึกษาต้องเป็นตัวเลข'),
    v.integer('ปีการศึกษาต้องเป็นจำนวนเต็ม'),
    v.minValue(2500, 'ปีการศึกษาต้องไม่น้อยกว่า 2500')
  ),
  Semester: v.enum(semester, 'ภาคเรียนไม่ถูกต้อง'),
});

export type GetLockedSchedulesInput = v.InferOutput<typeof getLockedSchedulesSchema>;

/**
 * Schema for creating a locked schedule
 * Creates multiple class_schedule records (timeslots × grades)
 */
export const createLockSchema = v.object({
  SubjectCode: v.pipe(
    v.string('รหัสวิชาต้องเป็นข้อความ'),
    v.nonEmpty('รหัสวิชาต้องไม่เป็นค่าว่าง')
  ),
  RoomID: v.pipe(
    v.number('รหัสห้องต้องเป็นตัวเลข'),
    v.integer('รหัสห้องต้องเป็นจำนวนเต็ม')
  ),
  timeslots: v.pipe(
    v.array(v.string('รหัสคาบเรียนต้องเป็นข้อความ'), 'คาบเรียนต้องเป็น array'),
    v.minLength(1, 'ต้องระบุคาบเรียนอย่างน้อย 1 คาบ')
  ),
  GradeIDs: v.pipe(
    v.array(v.string('รหัสระดับชั้นต้องเป็นข้อความ'), 'ระดับชั้นต้องเป็น array'),
    v.minLength(1, 'ต้องระบุระดับชั้นอย่างน้อย 1 ระดับ')
  ),
  RespIDs: v.pipe(
    v.array(v.pipe(v.number('รหัสความรับผิดชอบต้องเป็นตัวเลข'), v.integer('รหัสความรับผิดชอบต้องเป็นจำนวนเต็ม')), 'ความรับผิดชอบต้องเป็น array'),
    v.minLength(1, 'ต้องระบุความรับผิดชอบอย่างน้อย 1 รายการ')
  ),
});

export type CreateLockInput = v.InferOutput<typeof createLockSchema>;

/**
 * Schema for deleting locked schedules
 * Input: Array of ClassID strings
 */
export const deleteLocksSchema = v.pipe(
  v.array(v.string('ClassID ต้องเป็นข้อความ'), 'ClassIDs ต้องเป็น array'),
  v.minLength(1, 'ต้องระบุ ClassID อย่างน้อย 1 รายการ')
);

export type DeleteLocksInput = v.InferOutput<typeof deleteLocksSchema>;

/**
 * Schema for creating bulk locked schedules
 * Creates multiple locked resource records in a single transaction
 */
export const createBulkLocksSchema = v.object({
  locks: v.pipe(
    v.array(
      v.object({
        SubjectCode: v.pipe(
          v.string('รหัสวิชาต้องเป็นข้อความ'),
          v.nonEmpty('รหัสวิชาต้องไม่เป็นค่าว่าง')
        ),
        RoomID: v.pipe(
          v.number('รหัสห้องต้องเป็นตัวเลข'),
          v.integer('รหัสห้องต้องเป็นจำนวนเต็ม')
        ),
        TimeslotID: v.pipe(
          v.string('รหัสคาบเรียนต้องเป็นข้อความ'),
          v.nonEmpty('รหัสคาบเรียนต้องไม่เป็นค่าว่าง')
        ),
        GradeID: v.pipe(
          v.string('รหัสระดับชั้นต้องเป็นข้อความ'),
          v.nonEmpty('รหัสระดับชั้นต้องไม่เป็นค่าว่าง')
        ),
        RespID: v.pipe(
          v.number('รหัสความรับผิดชอบต้องเป็นตัวเลข'),
          v.integer('รหัสความรับผิดชอบต้องเป็นจำนวนเต็ม')
        ),
      }),
      'รายการล็อกต้องเป็น array'
    ),
    v.minLength(1, 'ต้องระบุรายการล็อกอย่างน้อย 1 รายการ')
  ),
});

export type CreateBulkLocksInput = v.InferOutput<typeof createBulkLocksSchema>;

/**
 * Schema for getting lock templates
 */
export const getLockTemplatesSchema = v.object({
  category: v.optional(
    v.picklist(['lunch', 'activity', 'assembly', 'exam', 'other'], 'ประเภทเทมเพลตไม่ถูกต้อง')
  ),
});

export type GetLockTemplatesInput = v.InferOutput<typeof getLockTemplatesSchema>;

/**
 * Schema for applying a lock template
 */
export const applyLockTemplateSchema = v.object({
  templateId: v.pipe(
    v.string('ID เทมเพลตต้องเป็นข้อความ'),
    v.nonEmpty('ID เทมเพลตต้องไม่เป็นค่าว่าง')
  ),
  AcademicYear: v.pipe(
    v.number('ปีการศึกษาต้องเป็นตัวเลข'),
    v.integer('ปีการศึกษาต้องเป็นจำนวนเต็ม'),
    v.minValue(2500, 'ปีการศึกษาต้องไม่น้อยกว่า 2500')
  ),
  Semester: v.enum(semester, 'ภาคเรียนไม่ถูกต้อง'),
  ConfigID: v.pipe(
    v.string('ConfigID ต้องเป็นข้อความ'),
    v.nonEmpty('ConfigID ต้องไม่เป็นค่าว่าง')
  ),
});

export type ApplyLockTemplateInput = v.InferOutput<typeof applyLockTemplateSchema>;
