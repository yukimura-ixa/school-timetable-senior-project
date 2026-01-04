/**
 * Class Feature - Server Actions
 *
 * React Server Actions for class schedule (timetable) operations.
 * Uses 'use server' directive for Next.js 16+ Server Actions.
 */

"use server";

import { semester } from "@/prisma/generated/client";
import * as v from "valibot";
import { createAction } from "@/shared/lib/action-wrapper";
import { createLogger } from "@/lib/logger";

const log = createLogger("ClassActions");

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
} from "../schemas/class.schemas";

// Repository
import * as classRepository from "../../infrastructure/repositories/class.repository";

// Services
import { addTeachersToSchedules } from "../../domain/services/class-validation.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";

/**
 * Get class schedules with flexible filtering
 * Can filter by term only, by teacher, or by grade
 */
export const getClassSchedulesAction = createAction(
  getClassSchedulesSchema,
  async (input: GetClassSchedulesInput) => {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    const userRole = normalizeAppRole(session?.user?.role);
    const userId = session?.user?.id;
    const teacherIdFromSession = userId ? Number(userId) : undefined;

    const sem = semester[input.Semester];

    let schedules;

    // Non-admins must be scoped by identity or grade
    if (!isAdminRole(userRole)) {
      if (userRole === "teacher") {
        const targetTeacherId = input.TeacherID ?? teacherIdFromSession;
        if (!targetTeacherId) {
          throw new Error("Unauthorized: missing teacher id for scoped view.");
        }
        if (input.TeacherID && Number(input.TeacherID) !== targetTeacherId) {
          throw new Error("Unauthorized: you can only view your own schedule.");
        }

        schedules = await classRepository.findByTeacher(
          targetTeacherId,
          input.AcademicYear,
          sem,
        );
        return schedules;
      }

      // Students/guests may view grade-level timetables only
      if (userRole === "student" || userRole === undefined) {
        if (!input.GradeID) {
          throw new Error(
            "Unauthorized: grade-scoped timetable required for this role.",
          );
        }
        schedules = await classRepository.findByGrade(
          input.GradeID,
          input.AcademicYear,
          sem,
        );
        return addTeachersToSchedules(schedules);
      }

      throw new Error("Unauthorized: insufficient role for timetable access.");
    }

    if (input.TeacherID) {
      schedules = await classRepository.findByTeacher(
        input.TeacherID,
        input.AcademicYear,
        sem,
      );
    } else if (input.GradeID) {
      // Admin grade view
      schedules = await classRepository.findByGrade(
        input.GradeID,
        input.AcademicYear,
        sem,
      );

      // Add teachers list for grade view
      return addTeachersToSchedules(schedules);
    } else {
      // Get all schedules for term
      schedules = await classRepository.findByTerm(input.AcademicYear, sem);
    }

    return schedules;
  },
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
      sem,
    );

    return conflicts;
  },
);

/**
 * Get class schedule summary
 * Returns only schedules with teachers assigned (excludes empty schedules)
 */
export const getSummaryAction = createAction(
  getSummarySchema,
  async (input: GetSummaryInput) => {
    const sem = semester[input.Semester];

    const summary = await classRepository.findSummary(input.AcademicYear, sem);

    return summary;
  },
);

/**
 * Create a new class schedule
 */
export const createClassScheduleAction = createAction(
  createClassScheduleSchema,
  async (input: CreateClassScheduleInput) => {
    log.debug("Creating class schedule", { timeslot: input.TimeslotID, subject: input.SubjectCode, grade: input.GradeID });
    
    const schedule = await classRepository.create({
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

    log.info("Class schedule created", { classId: schedule.ClassID });
    return schedule;
  },
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

    const schedule = await classRepository.update(input.ClassID, updateData);

    return schedule;
  },
);

/**
 * Delete a class schedule
 */
export const deleteClassScheduleAction = createAction(
  deleteClassScheduleSchema,
  async (input: DeleteClassScheduleInput) => {
    log.debug("Deleting class schedule", { classId: input.ClassID });
    const schedule = await classRepository.deleteById(input.ClassID);
    log.info("Class schedule deleted", { classId: input.ClassID });
    return schedule;
  },
);

/**
 * Get count of all class schedules
 */
export const getClassScheduleCountAction = createAction(
  v.optional(v.unknown()),
  async () => {
    const count = await classRepository.count();
    return { count };
  },
);

/**
 * Get a single class schedule by ClassID
 */
export const getClassScheduleByIdAction = createAction(
  v.object({
    ClassID: v.pipe(v.number(), v.integer(), v.minValue(1)),
  }),
  async (input: { ClassID: number }) => {
    const schedule = await classRepository.findByClassId(input.ClassID);

    if (!schedule) {
      throw new Error(`Class schedule with ClassID ${input.ClassID} not found`);
    }

    return schedule;
  },
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
    return schedules.filter(
      (schedule) => schedule.TimeslotID === input.TimeslotID,
    );
  },
);
