/**
 * Conflict Detection Actions
 *
 * Server Actions for detecting and analyzing schedule conflicts
 */

"use server";

import { createAction } from "@/shared/lib/action-wrapper";
import { createLogger } from "@/lib/logger";
import { conflictRepository } from "../../infrastructure/repositories/conflict.repository";

const log = createLogger("ConflictActions");
import {
  getConflictsSchema,
  checkTeacherConflictSchema,
  checkRoomConflictSchema,
  type GetConflictsInput,
  type CheckTeacherConflictInput,
  type CheckRoomConflictInput,
} from "../schemas/conflict.schemas";

/**
 * Get all schedule conflicts for a term
 *
 * Returns conflicts grouped by type:
 * - Teacher conflicts (double-booked teachers)
 * - Room conflicts (double-booked rooms)
 * - Class conflicts (class with multiple subjects at same time)
 * - Unassigned schedules (missing teacher/room)
 */
export const getConflictsAction = createAction(
  getConflictsSchema,
  async (input: GetConflictsInput) => {
    const conflicts = await conflictRepository.findAllConflicts(
      input.AcademicYear,
      input.Semester,
    );
    return conflicts;
  },
);

/**
 * Check if a teacher has a conflict at a specific timeslot
 *
 * Used for validating schedule placement before committing changes.
 * Returns conflict details if teacher is already scheduled at the timeslot.
 *
 * @param input - Teacher ID and Timeslot ID to check
 * @returns Conflict details if exists, null if no conflict
 */
export const checkTeacherConflictAction = createAction(
  checkTeacherConflictSchema,
  async (input: CheckTeacherConflictInput) => {
    log.debug("Checking teacher conflict", { teacherId: input.teacherId, timeslotId: input.timeslotId });
    
    const result = await conflictRepository.checkTeacherConflict(
      input.teacherId,
      input.timeslotId,
    );

    if (!result) {
      throw new Error("ไม่สามารถตรวจสอบข้อขัดแย้งของครูได้");
    }

    if (result.hasConflict && result.conflictingSchedule) {
      const schedule = result.conflictingSchedule;
      const teacher = schedule.teachers_responsibility[0]?.teacher;

      return {
        hasConflict: true,
        teacherName: teacher
          ? `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`
          : "ไม่ทราบชื่อ",
        subjectName: schedule.subject?.SubjectName || "ไม่ทราบชื่อวิชา",
        gradeName: schedule.gradelevel
          ? `ม.${schedule.gradelevel.Year}/${schedule.gradelevel.Number}`
          : "ไม่ทราบชั้น",
        roomName: schedule.room?.RoomName || "ไม่ระบุห้อง",
        timeslot: {
          day: schedule.timeslot.DayOfWeek,
          start: schedule.timeslot.StartTime,
          end: schedule.timeslot.EndTime,
        },
      };
    }

    return { hasConflict: false };
  },
);

/**
 * Check if a room has a conflict at a specific timeslot
 *
 * Used for validating room selection before committing changes.
 * Returns conflict details if room is already occupied at the timeslot.
 *
 * @param input - Room ID and Timeslot ID to check
 * @returns Conflict details if exists, null if no conflict
 */
export const checkRoomConflictAction = createAction(
  checkRoomConflictSchema,
  async (input: CheckRoomConflictInput) => {
    const result = await conflictRepository.checkRoomConflict(
      input.roomId,
      input.timeslotId,
    );

    if (!result) {
      throw new Error("ไม่สามารถตรวจสอบข้อขัดแย้งของห้องได้");
    }

    if (result.hasConflict && result.conflictingSchedule) {
      const schedule = result.conflictingSchedule;
      const teacher = schedule.teachers_responsibility[0]?.teacher;

      return {
        hasConflict: true,
        roomName: schedule.room?.RoomName || "ไม่ทราบชื่อห้อง",
        subjectName: schedule.subject?.SubjectName || "ไม่ทราบชื่อวิชา",
        teacherName: teacher
          ? `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`
          : "ไม่ทราบชื่อครู",
        gradeName: schedule.gradelevel
          ? `ม.${schedule.gradelevel.Year}/${schedule.gradelevel.Number}`
          : "ไม่ทราบชั้น",
        timeslot: {
          day: schedule.timeslot.DayOfWeek,
          start: schedule.timeslot.StartTime,
          end: schedule.timeslot.EndTime,
        },
      };
    }

    return { hasConflict: false };
  },
);
