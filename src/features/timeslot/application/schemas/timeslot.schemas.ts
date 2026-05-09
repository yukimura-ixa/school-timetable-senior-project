/**
 * Application Layer: Timeslot Schemas
 *
 * Valibot schemas for timeslot feature with TypeScript type inference.
 * Defines validation rules for all timeslot-related operations.
 *
 * @module timeslot.schemas
 */

import * as v from "valibot";
import { semester, day_of_week } from "@/prisma/generated/client";

/**
 * Schema for a single break definition in the new N-group break system
 */
export const breakDefinitionSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1, "รหัสช่วงพักห้ามว่าง")),
  label: v.pipe(v.string(), v.minLength(1, "ชื่อช่วงพักห้ามว่าง")),
  slotNumber: v.pipe(v.number(), v.minValue(1, "หมายเลขคาบต้องมากกว่า 0")),
  duration: v.pipe(v.number(), v.minValue(5, "ระยะเวลาพักต้องไม่น้อยกว่า 5 นาที")),
  color: v.pipe(v.string(), v.minLength(1)),
  groups: v.array(v.string(), "ต้องระบุกลุ่มอย่างน้อย 1 กลุ่ม"),
});

export const breakGroupSchema = v.object({
  Name: v.string(),
  Label: v.string(),
  Color: v.string(),
  gradeIds: v.array(v.string()),
});

/**
 * Schema for creating timeslots (bulk operation with configuration)
 * Generates multiple timeslots based on schedule configuration
 */
export const createTimeslotsSchema = v.object({
  AcademicYear: v.number("ปีการศึกษาต้องเป็นตัวเลข"),
  Semester: v.enum(semester, "ภาคเรียนไม่ถูกต้อง"),
  Days: v.array(
    v.enum(day_of_week, "วันไม่ถูกต้อง"),
    "ต้องระบุวันอย่างน้อย 1 วัน",
  ),
  StartTime: v.pipe(v.string(), v.minLength(1, "เวลาเริ่มต้นห้ามว่าง")),
  Duration: v.number("ระยะเวลาต่อคาบต้องเป็นตัวเลข"),
  TimeslotPerDay: v.number("จำนวนคาบต่อวันต้องเป็นตัวเลข"),
  breakDefinitions: v.array(breakDefinitionSchema),
  breakGroups: v.array(breakGroupSchema),
});

export type CreateTimeslotsInput = v.InferOutput<typeof createTimeslotsSchema>;

/**
 * Schema for getting timeslots by academic year and semester
 */
export const getTimeslotsByTermSchema = v.object({
  AcademicYear: v.number("ปีการศึกษาต้องเป็นตัวเลข"),
  Semester: v.enum(semester, "ภาคเรียนไม่ถูกต้อง"),
});

export type GetTimeslotsByTermInput = v.InferOutput<
  typeof getTimeslotsByTermSchema
>;

/**
 * Schema for deleting timeslots by academic year and semester
 * Also deletes related table_config and teachers_responsibility
 */
export const deleteTimeslotsByTermSchema = v.object({
  AcademicYear: v.number("ปีการศึกษาต้องเป็นตัวเลข"),
  Semester: v.enum(semester, "ภาคเรียนไม่ถูกต้อง"),
});

export type DeleteTimeslotsByTermInput = v.InferOutput<
  typeof deleteTimeslotsByTermSchema
>;

/**
 * Schema for getting a single timeslot by ID
 */
export const getTimeslotByIdSchema = v.object({
  TimeslotID: v.pipe(v.string(), v.minLength(1, "รหัสช่วงเวลาห้ามว่าง")),
});

export type GetTimeslotByIdInput = v.InferOutput<typeof getTimeslotByIdSchema>;
