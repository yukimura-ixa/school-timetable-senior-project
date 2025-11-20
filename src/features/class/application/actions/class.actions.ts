/**
 * Class Feature - Server Actions
 * 
 * React Server Actions for class schedule (timetable) operations.
 * Uses 'use server' directive for Next.js 16+ Server Actions.
 */

'use server';

import { semester } from @/prisma/generated/client';
import * as v from 'valibot';

// Schemas
import {
  getClassSchedulesSchema,
  getConflictsSchema,
  getSummarySchema,
  createClassScheduleSchema,
  updateClassScheduleSchema,
  deleteClassScheduleSchema,
  type GetClassSchedulesInput,
  type GetConflictsInput,
  type GetSummaryInput,
  type CreateClassScheduleInput,
  type UpdateClassScheduleInput,
  type DeleteClassScheduleInput,
} from '../schemas/class.schemas';

// Repository
import * as classRepository from '../../infrastructure/repositories/class.repository';

// Services
import { addTeachersToSchedules } from '../../domain/services/class-validation.service';

/**
 * Helper: Create server action with validation
 */
function createAction<TInput, TOutput>(
  schema: v.GenericSchema<TInput, TOutput> | undefined,
  handler: (input: TOutput) => Promise<unknown>
) {
  return async (input: TInput) => {
    try {
      const validated = schema ? v.parse(schema, input) : (input as unknown as TOutput);
      return await handler(validated);
    } catch (error) {
      if (error instanceof v.ValiError) {
        const errorMessages = error.issues.map((issue) => issue.message).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw error;
    }
  };
}

/**
 * Get class schedules with flexible filtering
 * Can filter by term only, by teacher, or by grade
 */
export const getClassSchedulesAction = createAction(
  getClassSchedulesSchema,
  async (input: GetClassSchedulesInput) => {
    const sem = semester[input.Semester];

    let schedules;

    if (input.TeacherID) {
      // Filter by teacher
      schedules = await classRepository.findByTeacher(
        input.TeacherID,
        input.AcademicYear,
        sem
      );
    } else if (input.GradeID) {
      // Filter by grade
      schedules = await classRepository.findByGrade(
        input.GradeID,
        input.AcademicYear,
        sem
      );

      // Add teachers list for grade view
      return addTeachersToSchedules(schedules);
    } else {
      // Get all schedules for term
      schedules = await classRepository.findByTerm(
        input.AcademicYear,
        sem
      );
    }

    return schedules;
  }
);

/**
 * Get schedule conflicts for a teacher
 * Returns schedules where OTHER teachers are assigned at same time
 */
export const getConflictsAction = createAction(
  getConflictsSchema,
  async (input: GetConflictsInput) => {
    const sem = semester[input.Semester];

    const conflicts = await classRepository.findConflicts(
      input.TeacherID,
      input.AcademicYear,
      sem
    );

    return conflicts;
  }
);

/**
 * Get class schedule summary
 * Returns only schedules with teachers assigned (excludes empty schedules)
 */
export const getSummaryAction = createAction(
  getSummarySchema,
  async (input: GetSummaryInput) => {
    const sem = semester[input.Semester];

    const summary = await classRepository.findSummary(
      input.AcademicYear,
      sem
    );

    return summary;
  }
);

/**
 * Create a new class schedule
 */
export const createClassScheduleAction = createAction(
  createClassScheduleSchema,
  async (input: CreateClassScheduleInput) => {
    const schedule = await classRepository.create({
      ClassID: input.ClassID,
      IsLocked: input.IsLocked ?? false,
      timeslot: {
        connect: { TimeslotID: input.TimeslotID },
      },
      subject: {
        connect: { SubjectCode: input.SubjectCode },
      },
      gradelevel: {
        connect: { GradeID: input.GradeID },
      },
      room: input.RoomID
        ? {
            connect: { RoomID: input.RoomID },
          }
        : undefined,
      teachers_responsibility: input.ResponsibilityIDs
        ? {
            connect: input.ResponsibilityIDs.map((id) => ({ RespID: id })),
          }
        : undefined,
    });

    return schedule;
  }
);

/**
 * Update an existing class schedule
 */
export const updateClassScheduleAction = createAction(
  updateClassScheduleSchema,
  async (input: UpdateClassScheduleInput) => {
    const updateData: Record<string, unknown> = {};

    if (input.TimeslotID !== undefined) {
      updateData.TimeslotID = input.TimeslotID;
    }

    if (input.SubjectCode !== undefined) {
      updateData.SubjectCode = input.SubjectCode;
    }

    if (input.GradeID !== undefined) {
      updateData.GradeID = input.GradeID;
    }

    if (input.IsLocked !== undefined) {
      updateData.IsLocked = input.IsLocked;
    }

    if (input.RoomID !== undefined) {
      updateData.room = {
        connect: { RoomID: input.RoomID },
      };
    }

    if (input.ResponsibilityIDs !== undefined) {
      updateData.teachers_responsibility = {
        set: input.ResponsibilityIDs.map((id) => ({ RespID: id })),
      };
    }

    const schedule = await classRepository.update(
      input.ClassID,
      updateData
    );

    return schedule;
  }
);

/**
 * Delete a class schedule
 */
export const deleteClassScheduleAction = createAction(
  deleteClassScheduleSchema,
  async (input: DeleteClassScheduleInput) => {
    const schedule = await classRepository.deleteById(input.ClassID);
    return schedule;
  }
);

/**
 * Get count of all class schedules
 */
export const getClassScheduleCountAction = createAction(
  undefined,
  async () => {
    const count = await classRepository.count();
    return { count };
  }
);

/**
 * Get a single class schedule by ClassID
 */
export const getClassScheduleByIdAction = createAction(
  v.object({
    ClassID: v.pipe(v.string(), v.minLength(1)),
  }),
  async (input: { ClassID: string }) => {
    const schedule = await classRepository.findByClassId(input.ClassID);

    if (!schedule) {
      throw new Error(`Class schedule with ClassID ${input.ClassID} not found`);
    }

    return schedule;
  }
);

/**
 * Get schedules by timeslot
 * Utility action for timeslot-specific queries
 */
export const getSchedulesByTimeslotAction = createAction(
  v.object({
    TimeslotID: v.pipe(v.string(), v.minLength(1)),
  }),
  async (input: { TimeslotID: string }) => {
    const schedules = await classRepository.findByTerm(0, semester.SEMESTER_1);
    
    // Filter by timeslot (simple filter since no direct repository method)
    return schedules.filter((schedule) => schedule.TimeslotID === input.TimeslotID);
  }
);
