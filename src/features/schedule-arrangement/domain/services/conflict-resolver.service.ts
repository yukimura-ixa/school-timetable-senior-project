/**
 * Conflict Resolver — pure ranking for conflict resolution suggestions.
 *
 * Given a ResolutionContext (conflict + attempt + world snapshot), produce up
 * to N ranked `ResolutionSuggestion`s. No I/O, no React, no Prisma — every
 * input is passed in explicitly so unit tests can exercise every branch.
 */

import { checkAllConflicts } from "./conflict-detector.service";
import { ConflictType } from "../models/conflict.model";
import type {
  ExistingSchedule,
  MoveSuggestion,
  ReRoomSuggestion,
  ResolutionContext,
  ResolutionSuggestion,
  ScheduleArrangementInput,
  SwapSuggestion,
  TimeslotOption,
} from "../models/conflict.model";

export interface SuggestOptions {
  maxSuggestions?: number;
}

function roomsBusyAt(
  schedules: ExistingSchedule[],
  timeslotId: string,
): Set<number> {
  const busy = new Set<number>();
  for (const s of schedules) {
    if (s.timeslotId === timeslotId && s.roomId != null) {
      busy.add(s.roomId);
    }
  }
  return busy;
}

function generateReRoom(ctx: ResolutionContext): ReRoomSuggestion[] {
  if (ctx.conflict.conflictType !== ConflictType.ROOM_CONFLICT) return [];
  const busy = roomsBusyAt(ctx.existingSchedules, ctx.attempt.timeslotId);
  const out: ReRoomSuggestion[] = [];
  for (const room of ctx.availableRooms) {
    if (busy.has(room.roomId)) continue;
    if (room.roomId === ctx.attempt.roomId) continue;
    out.push({
      kind: "RE_ROOM",
      targetRoomId: room.roomId,
      targetRoomName: room.roomName,
      rationale: `ย้ายไปห้อง ${room.roomName} (คาบเดิม)`,
      confidence: 0.9,
    });
  }
  return out;
}

function slotMeta(
  allTimeslots: TimeslotOption[],
  timeslotId: string,
): { slotNumber: number; dayOfWeek: string } | null {
  const hit = allTimeslots.find((t) => t.timeslotId === timeslotId);
  if (!hit) return null;
  return { slotNumber: hit.slotNumber, dayOfWeek: hit.dayOfWeek };
}

function generateMoveCandidates(
  ctx: ResolutionContext,
  sameDay: boolean,
): MoveSuggestion[] {
  const origin = slotMeta(ctx.allTimeslots, ctx.attempt.timeslotId);
  if (!origin) return [];

  const candidates = ctx.allTimeslots.filter((t) => {
    if (t.timeslotId === ctx.attempt.timeslotId) return false;
    if (t.isBreaktime) return false;
    const onSameDay = t.dayOfWeek === origin.dayOfWeek;
    return sameDay ? onSameDay : !onSameDay;
  });

  const out: MoveSuggestion[] = [];
  for (const slot of candidates) {
    const altAttempt = { ...ctx.attempt, timeslotId: slot.timeslotId };
    const result = checkAllConflicts(
      altAttempt,
      ctx.existingSchedules,
      ctx.responsibilities,
    );
    if (result.hasConflict) continue;

    const distance = Math.abs(slot.slotNumber - origin.slotNumber);
    const base = sameDay ? 0.8 : 0.65;
    const floor = sameDay ? 0.7 : 0.5;
    const confidence = Math.max(base - 0.02 * distance, floor);

    out.push({
      kind: "MOVE",
      targetTimeslotId: slot.timeslotId,
      rationale: sameDay
        ? `ย้ายไปคาบ ${slot.slotNumber} วัน${slot.dayOfWeek}`
        : `ย้ายไปวัน${slot.dayOfWeek} คาบ ${slot.slotNumber}`,
      confidence,
    });
  }
  return out;
}

function generateSwap(
  ctx: ResolutionContext,
  swapTargets: readonly string[],
): SwapSuggestion[] {
  const blockers = ctx.existingSchedules.filter(
    (s) => s.timeslotId === ctx.attempt.timeslotId,
  );
  const out: SwapSuggestion[] = [];

  for (const blocker of blockers) {
    for (const targetSlotId of swapTargets) {
      const blockerAttempt: ScheduleArrangementInput = {
        classId: blocker.classId,
        timeslotId: targetSlotId,
        subjectCode: blocker.subjectCode,
        gradeId: blocker.gradeId,
        teacherId: blocker.teacherId,
        roomId: blocker.roomId ?? null,
        academicYear: ctx.attempt.academicYear,
        semester: ctx.attempt.semester,
      };
      const others = ctx.existingSchedules.filter(
        (s) => s.classId !== blocker.classId,
      );
      const check = checkAllConflicts(
        blockerAttempt,
        others,
        ctx.responsibilities,
      );
      if (check.hasConflict) continue;

      out.push({
        kind: "SWAP",
        counterpartTimeslotId: targetSlotId,
        counterpartClassId: blocker.classId,
        counterpartSubjectCode: blocker.subjectCode,
        rationale: `สลับกับ ${blocker.subjectCode}`,
        confidence: 0.5,
      });
      break;
    }
  }
  return out;
}

export function suggestResolutions(
  ctx: ResolutionContext,
  opts: SuggestOptions = {},
): ResolutionSuggestion[] {
  if (!ctx.conflict.hasConflict) return [];
  const max = opts.maxSuggestions ?? 3;

  const reRoom = generateReRoom(ctx);
  const moveSameDay = generateMoveCandidates(ctx, true);
  const needCrossDay = reRoom.length + moveSameDay.length < max;
  const moveCrossDay = needCrossDay ? generateMoveCandidates(ctx, false) : [];

  const moveCount = moveSameDay.length + moveCrossDay.length;
  const needSwap = moveCount < 3;

  const moveTargets = [...moveSameDay, ...moveCrossDay].map(
    (m) => m.targetTimeslotId,
  );
  const swapTargets: string[] =
    moveTargets.length > 0
      ? moveTargets
      : ctx.allTimeslots
          .filter(
            (t) =>
              !t.isBreaktime && t.timeslotId !== ctx.attempt.timeslotId,
          )
          .map((t) => t.timeslotId);

  const swap = needSwap ? generateSwap(ctx, swapTargets) : [];

  const all: ResolutionSuggestion[] = [
    ...reRoom,
    ...moveSameDay,
    ...moveCrossDay,
    ...swap,
  ];
  all.sort((a, b) => b.confidence - a.confidence);
  return all.slice(0, max);
}
