/**
 * Application Layer: Timeslot Schemas
 * 
 * Valibot schemas for timeslot feature with TypeScript type inference.
 * Defines validation rules for all timeslot-related operations.
 * 
 * @module timeslot.schemas
 */

import * as v from 'valibot';
import { semester, day_of_week } from @/prisma/generated/client';

/**
 * Schema for creating timeslots (bulk operation with configuration)
 * Generates multiple timeslots based on schedule configuration
 */
export const createTimeslotsSchema = v.object({
  AcademicYear: v.number('ปีการศึกษาต้องเป็นตัวเลข'),
  Semester: v.enum(semester, 'ภาคเรียนไม่ถูกต้อง'),
  Days: v.array(v.enum(day_of_week, 'วันไม่ถูกต้อง'), 'ต้องระบุวันอย่างน้อย 1 วัน'),
  StartTime: v.pipe(v.string(), v.minLength(1, 'เวลาเริ่มต้นห้ามว่าง')),
  Duration: v.number('ระยะเวลาต่อคาบต้องเป็นตัวเลข'),
  BreakDuration: v.number('ระยะเวลาพักต้องเป็นตัวเลข'),
  TimeslotPerDay: v.number('จำนวนคาบต่อวันต้องเป็นตัวเลข'),
  HasMinibreak: v.boolean('ต้องระบุว่ามีพักเล็กหรือไม่'),
  MiniBreak: v.object({
    SlotNumber: v.number('หมายเลขคาบพักเล็กต้องเป็นตัวเลข'),
    Duration: v.number('ระยะเวลาพักเล็กต้องเป็นตัวเลข'),
  }),
  BreakTimeslots: v.object({
    Junior: v.number('หมายเลขคาบพักม.ต้นต้องเป็นตัวเลข'),
    Senior: v.number('หมายเลขคาบพักม.ปลายต้องเป็นตัวเลข'),
  }),
});

export type CreateTimeslotsInput = v.InferOutput<typeof createTimeslotsSchema>;

/**
 * Schema for getting timeslots by academic year and semester
 */
export const getTimeslotsByTermSchema = v.object({
  AcademicYear: v.number('ปีการศึกษาต้องเป็นตัวเลข'),
  Semester: v.enum(semester, 'ภาคเรียนไม่ถูกต้อง'),
});

export type GetTimeslotsByTermInput = v.InferOutput<typeof getTimeslotsByTermSchema>;

/**
 * Schema for deleting timeslots by academic year and semester
 * Also deletes related table_config and teachers_responsibility
 */
export const deleteTimeslotsByTermSchema = v.object({
  AcademicYear: v.number('ปีการศึกษาต้องเป็นตัวเลข'),
  Semester: v.enum(semester, 'ภาคเรียนไม่ถูกต้อง'),
});

export type DeleteTimeslotsByTermInput = v.InferOutput<typeof deleteTimeslotsByTermSchema>;

/**
 * Schema for getting a single timeslot by ID
 */
export const getTimeslotByIdSchema = v.object({
  TimeslotID: v.pipe(v.string(), v.minLength(1, 'รหัสช่วงเวลาห้ามว่าง')),
});

export type GetTimeslotByIdInput = v.InferOutput<typeof getTimeslotByIdSchema>;
