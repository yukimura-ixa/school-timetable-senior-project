/**
 * Conflict Resolution Actions
 *
 * Admin-gated server action that returns ranked resolution suggestions for a
 * conflicting schedule arrangement attempt.
 */

"use server";

import { createAction } from "@/shared/lib/action-wrapper";
import { createLogger } from "@/lib/logger";
import {
  suggestResolutionSchema,
  type SuggestResolutionInput,
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
