/**
 * Conflict Resolver — pure ranking for conflict resolution suggestions.
 *
 * Given a ResolutionContext (conflict + attempt + world snapshot), produce up
 * to N ranked `ResolutionSuggestion`s. No I/O, no React, no Prisma — every
 * input is passed in explicitly so unit tests can exercise every branch.
 */

import { ConflictType } from "../models/conflict.model";
import type {
  ExistingSchedule,
  ReRoomSuggestion,
  ResolutionContext,
  ResolutionSuggestion,
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

export function suggestResolutions(
  ctx: ResolutionContext,
  opts: SuggestOptions = {},
): ResolutionSuggestion[] {
  if (!ctx.conflict.hasConflict) return [];
  const max = opts.maxSuggestions ?? 3;

  const all: ResolutionSuggestion[] = [...generateReRoom(ctx)];
  all.sort((a, b) => b.confidence - a.confidence);
  return all.slice(0, max);
}
