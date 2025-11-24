/**
 * Conflict Detection Schemas
 *
 * Valibot schemas for validating conflict detection inputs
 */

import * as v from "valibot";

export const getConflictsSchema = v.object({
  AcademicYear: v.pipe(
    v.number(),
    v.minValue(2500, "ปีการศึกษาต้องไม่ต่ำกว่า 2500"),
    v.maxValue(3000, "ปีการศึกษาต้องไม่เกิน 3000"),
  ),
  Semester: v.picklist(
    ["SEMESTER_1", "SEMESTER_2", "SEMESTER_3"],
    "เทอมไม่ถูกต้อง",
  ),
});

export type GetConflictsInput = v.InferInput<typeof getConflictsSchema>;

export const checkTeacherConflictSchema = v.object({
  teacherId: v.pipe(v.number(), v.minValue(1, "รหัสครูต้องมากกว่า 0")),
  timeslotId: v.pipe(v.string(), v.minLength(1, "รหัสช่วงเวลาต้องไม่ว่าง")),
});

export type CheckTeacherConflictInput = v.InferInput<
  typeof checkTeacherConflictSchema
>;

export const checkRoomConflictSchema = v.object({
  roomId: v.pipe(v.number(), v.minValue(1, "รหัสห้องต้องมากกว่า 0")),
  timeslotId: v.pipe(v.string(), v.minLength(1, "รหัสช่วงเวลาต้องไม่ว่าง")),
});

export type CheckRoomConflictInput = v.InferInput<
  typeof checkRoomConflictSchema
>;
