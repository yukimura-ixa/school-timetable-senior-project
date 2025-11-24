import type { class_schedule } from "@/prisma/generated/client";

export type RoomAvailabilityStatus = "available" | "occupied" | "partial";

/** Pure helper for unit tests - Logic extracted from useRoomAvailability */
export function computeAvailability(
  lockedSchedules: Array<Pick<class_schedule, "RoomID" | "TimeslotID">>,
  selectedTimeslots: Iterable<string>,
): Record<number, RoomAvailabilityStatus> {
  const map: Record<number, RoomAvailabilityStatus> = {};
  const selected = Array.from(selectedTimeslots);
  const selectionSize = selected.length;
  const byRoom: Record<number, Set<string>> = {};
  for (const sched of lockedSchedules) {
    if (sched.RoomID == null) continue;
    const roomSet = byRoom[sched.RoomID] ?? (byRoom[sched.RoomID] = new Set());
    roomSet.add(sched.TimeslotID);
  }
  for (const roomIdStr of Object.keys(byRoom)) {
    const roomId = Number(roomIdStr);
    const lockedSet = byRoom[roomId];
    if (!lockedSet) {
      map[roomId] = "available";
      continue;
    }
    if (selectionSize === 0) {
      map[roomId] = lockedSet.size === 0 ? "available" : "partial";
      continue;
    }
    let conflictCount = 0;
    selected.forEach((ts) => {
      if (lockedSet.has(ts)) conflictCount++;
    });
    if (conflictCount === 0) map[roomId] = "available";
    else if (conflictCount === selectionSize) map[roomId] = "occupied";
    else map[roomId] = "partial";
  }
  return map;
}
