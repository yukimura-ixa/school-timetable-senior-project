/**
 * Conflict Resolution Actions
 *
 * Admin-gated server action that returns ranked resolution suggestions for a
 * conflicting schedule arrangement attempt.
 */

"use server";

import { createAction } from "@/shared/lib/action-wrapper";
import { createLogger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import {
  suggestResolutionSchema,
  applySwapSchema,
  type SuggestResolutionInput,
  type ApplySwapInput,
} from "../schemas/conflict-resolution.schemas";
import { suggestResolutions } from "@/features/schedule-arrangement/domain/services/conflict-resolver.service";
import { checkAllConflicts } from "@/features/schedule-arrangement/domain/services/conflict-detector.service";
import type {
  ExistingSchedule,
  ResolutionContext,
  RoomOption,
  TeacherResponsibility,
  TimeslotOption,
} from "@/features/schedule-arrangement/domain/models/conflict.model";
import { roomRepository } from "@/features/room/infrastructure/repositories/room.repository";
import { timeslotRepository } from "@/features/timeslot/infrastructure/repositories/timeslot.repository";
import { conflictRepository } from "@/features/conflict/infrastructure/repositories/conflict.repository";
import { invalidatePublicCache } from "@/lib/cache-invalidation";

const log = createLogger("ConflictResolutionAction");

export const suggestResolutionAction = createAction(
  suggestResolutionSchema,
  async (input: SuggestResolutionInput) => {
    log.debug("suggestResolution input", {
      ts: input.attempt.timeslotId,
      sub: input.attempt.subjectCode,
    });

    const [rooms, timeslots, existingSchedules, responsibilities] =
      await Promise.all([
        roomRepository.findAll(),
        timeslotRepository.findByTerm(input.AcademicYear, input.Semester),
        conflictRepository.findSchedulesForSemester(
          input.AcademicYear,
          input.Semester,
        ),
        conflictRepository.findResponsibilitiesForTerm(
          input.AcademicYear,
          input.Semester,
        ),
      ]);

    const existing: ExistingSchedule[] = existingSchedules;
    const resps: TeacherResponsibility[] = responsibilities;

    const availableRooms: RoomOption[] = rooms.map((r) => ({
      roomId: r.RoomID,
      roomName: r.RoomName,
    }));

    // Timeslot rows lack an explicit slot number. Derive one per-day by
    // sorting StartTime ascending, then assigning 1-based index within each
    // day_of_week group. Deterministic given DB ordering.
    const byDay = new Map<string, typeof timeslots>();
    for (const t of timeslots) {
      const arr = byDay.get(t.DayOfWeek) ?? [];
      arr.push(t);
      byDay.set(t.DayOfWeek, arr);
    }
    const slotNumberOf = new Map<string, number>();
    for (const [, group] of byDay) {
      group.sort(
        (a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime(),
      );
      group.forEach((t, i) => slotNumberOf.set(t.TimeslotID, i + 1));
    }
    const allTimeslots: TimeslotOption[] = timeslots.map((t) => ({
      timeslotId: t.TimeslotID,
      dayOfWeek: t.DayOfWeek,
      slotNumber: slotNumberOf.get(t.TimeslotID) ?? 0,
      isBreaktime: t.Breaktime !== "NOT_BREAK",
    }));

    const conflict = checkAllConflicts(
      { ...input.attempt, roomId: input.attempt.roomId ?? null },
      existing,
      resps,
    );

    if (!conflict.hasConflict) {
      return [];
    }

    const ctx: ResolutionContext = {
      conflict,
      attempt: { ...input.attempt, roomId: input.attempt.roomId ?? null },
      existingSchedules: existing,
      responsibilities: resps,
      availableRooms,
      allTimeslots,
    };

    return suggestResolutions(ctx, { maxSuggestions: 3 });
  },
);

/**
 * Atomically apply a SWAP suggestion: move the counterpart schedule off the
 * contested slot and place the attempt at the freed slot, inside a single
 * Prisma transaction. Rejects if either placement would produce a new
 * conflict once the simulated swap is applied.
 */
export const applySwapAction = createAction(
  applySwapSchema,
  async (input: ApplySwapInput) => {
    log.debug("applySwap input", {
      counterpartClassId: input.counterpart.classId,
      counterpartTo: input.counterpart.targetTimeslotId,
      attemptAt: input.attempt.timeslotId,
    });

    const [schedules, responsibilities, timeslots] = await Promise.all([
      conflictRepository.findSchedulesForSemester(
        input.AcademicYear,
        input.Semester,
      ),
      conflictRepository.findResponsibilitiesForTerm(
        input.AcademicYear,
        input.Semester,
      ),
      timeslotRepository.findByTerm(input.AcademicYear, input.Semester),
    ]);

    // Reject any timeslot ID that does not belong to the target term.
    // Without this check a caller could move a counterpart into a timeslot
    // from another term, sidestepping conflict detection entirely.
    const termTimeslotIds = new Set(timeslots.map((t) => t.TimeslotID));
    const requiredTimeslots = [
      input.counterpart.targetTimeslotId,
      input.attempt.timeslotId,
    ];
    const outOfTerm = requiredTimeslots.find((id) => !termTimeslotIds.has(id));
    if (outOfTerm) {
      throw new Error(
        `Timeslot ${outOfTerm} does not belong to ${input.Semester} ${input.AcademicYear}`,
      );
    }

    const counterpart = schedules.find(
      (s) => s.classId === input.counterpart.classId,
    );
    if (!counterpart) {
      throw new Error(
        `Counterpart schedule ${input.counterpart.classId} not found`,
      );
    }
    if (counterpart.isLocked) {
      throw new Error("Counterpart schedule is locked and cannot be swapped");
    }

    // Simulate: remove counterpart from its origin slot; the resolver
    // detector sees neither the old counterpart nor the not-yet-created
    // attempt in the "others" arrays.
    const othersForCounterpart: ExistingSchedule[] = schedules.filter(
      (s) => s.classId !== counterpart.classId,
    );

    const counterpartCheck = checkAllConflicts(
      {
        classId: counterpart.classId,
        timeslotId: input.counterpart.targetTimeslotId,
        subjectCode: counterpart.subjectCode,
        roomId: counterpart.roomId,
        gradeId: counterpart.gradeId,
        teacherId: counterpart.teacherId,
        academicYear: input.AcademicYear,
        semester: input.Semester,
      },
      othersForCounterpart,
      responsibilities,
    );
    if (counterpartCheck.hasConflict) {
      return {
        applied: false,
        reason: counterpartCheck.message,
        failedOn: "counterpart" as const,
      };
    }

    // Simulate the counterpart at its new slot for the attempt check.
    const simulatedCounterpart: ExistingSchedule = {
      ...counterpart,
      timeslotId: input.counterpart.targetTimeslotId,
    };
    const othersForAttempt: ExistingSchedule[] = [
      ...othersForCounterpart,
      simulatedCounterpart,
    ];

    const attemptCheck = checkAllConflicts(
      {
        timeslotId: input.attempt.timeslotId,
        subjectCode: input.attempt.subjectCode,
        roomId: input.attempt.roomId,
        gradeId: input.attempt.gradeId,
        teacherId: input.attempt.teacherId,
        academicYear: input.attempt.academicYear,
        semester: input.attempt.semester,
      },
      othersForAttempt,
      responsibilities,
    );
    if (attemptCheck.hasConflict) {
      return {
        applied: false,
        reason: attemptCheck.message,
        failedOn: "attempt" as const,
      };
    }

    const responsibility = responsibilities.find(
      (r) =>
        r.teacherId === input.attempt.teacherId &&
        r.subjectCode === input.attempt.subjectCode &&
        r.gradeId === input.attempt.gradeId &&
        r.academicYear === input.attempt.academicYear &&
        r.semester === input.attempt.semester,
    );
    if (!responsibility) {
      return {
        applied: false,
        reason: "ไม่พบรายการสอนของครูสำหรับวิชานี้",
        failedOn: "attempt" as const,
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const movedCounterpart = await tx.class_schedule.update({
        where: { ClassID: counterpart.classId },
        data: { TimeslotID: input.counterpart.targetTimeslotId },
      });
      const createdAttempt = await tx.class_schedule.create({
        data: {
          TimeslotID: input.attempt.timeslotId,
          SubjectCode: input.attempt.subjectCode,
          GradeID: input.attempt.gradeId,
          RoomID: input.attempt.roomId,
          IsLocked: false,
          teachers_responsibility: {
            connect: { RespID: responsibility.respId },
          },
        },
      });
      return {
        movedCounterpartClassId: movedCounterpart.ClassID,
        createdAttemptClassId: createdAttempt.ClassID,
      };
    });

    await invalidatePublicCache(["stats", "classes"]);

    return {
      applied: true as const,
      counterpartClassId: result.movedCounterpartClassId,
      attemptClassId: result.createdAttemptClassId,
    };
  },
);
