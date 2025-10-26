/**
 * Arrange Feature - Valibot Schemas
 * 
 * Validation schemas for teacher schedule arrangement (drag-and-drop interface).
 * Handles fetching teacher schedules and syncing schedule changes.
 */

import * as v from 'valibot';

// ============================================================================
// GET Teacher Schedule Schema
// ============================================================================

/**
 * Schema for getting a teacher's schedule
 * Query params: TeacherID (required)
 */
export const getTeacherScheduleSchema = v.object({
  TeacherID: v.pipe(
    v.number('TeacherID must be a number'),
    v.integer('TeacherID must be an integer'),
    v.minValue(1, 'TeacherID must be positive')
  ),
});

export type GetTeacherScheduleInput = v.InferInput<typeof getTeacherScheduleSchema>;
export type GetTeacherScheduleOutput = v.InferOutput<typeof getTeacherScheduleSchema>;

// ============================================================================
// Sync Teacher Schedule Schema
// ============================================================================

/**
 * Schema for a single schedule slot in the sync operation
 */
export const scheduleSlotSchema = v.object({
  TimeslotID: v.string('TimeslotID must be a string'),
  subject: v.union([
    // Empty slot (will delete existing schedule)
    v.object({}),
    // Slot with subject
    v.object({
      SubjectCode: v.optional(v.string()),
      GradeID: v.optional(v.string()),
      ClassID: v.optional(v.string()),
      RespID: v.optional(v.number()),
      IsLocked: v.optional(v.boolean()),
      room: v.optional(v.object({
        RoomID: v.optional(v.number()),
      })),
      timeslot: v.optional(v.object({
        TimeslotID: v.optional(v.string()),
      })),
      teachers_responsibility: v.optional(v.array(v.object({
        RespID: v.optional(v.number()),
      }))),
    }),
  ]),
});

/**
 * Schema for syncing a teacher's schedule (POST)
 * This handles drag-and-drop changes to the teacher's timetable
 */
export const syncTeacherScheduleSchema = v.object({
  TeacherID: v.pipe(
    v.number('TeacherID must be a number'),
    v.integer('TeacherID must be an integer'),
    v.minValue(1, 'TeacherID must be positive')
  ),
  AcademicYear: v.pipe(
    v.number('AcademicYear must be a number'),
    v.integer('AcademicYear must be an integer'),
    v.minValue(2000, 'AcademicYear must be 2000 or later'),
    v.maxValue(2100, 'AcademicYear must be 2100 or earlier')
  ),
  Semester: v.picklist(['1', '2'], 'Semester must be "1" or "2"'),
  Schedule: v.array(scheduleSlotSchema, 'Schedule must be an array of schedule slots'),
});

export type SyncTeacherScheduleInput = v.InferInput<typeof syncTeacherScheduleSchema>;
export type SyncTeacherScheduleOutput = v.InferOutput<typeof syncTeacherScheduleSchema>;
