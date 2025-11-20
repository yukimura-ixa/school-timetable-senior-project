import { useEffect, useState, useMemo } from 'react';
import type { class_schedule, semester } from @/prisma/generated/client';
import { getRawLockedSchedulesAction } from '@/features/lock/application/actions/lock.actions';

export type RoomAvailabilityStatus = 'available' | 'occupied' | 'partial';

export interface UseRoomAvailabilityParams {
  academicYear?: number;
  semester?: semester;
  selectedTimeslots: Iterable<string>;
  /** Skip fetch when false */
  enabled?: boolean;
}

export interface UseRoomAvailabilityResult {
  availabilityMap: Record<number, RoomAvailabilityStatus>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/** Pure helper for unit tests */
export function computeAvailability(
  lockedSchedules: Array<Pick<class_schedule,'RoomID'|'TimeslotID'>>,
  selectedTimeslots: Iterable<string>
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
      map[roomId] = 'available';
      continue;
    }
    if (selectionSize === 0) {
      map[roomId] = lockedSet.size === 0 ? 'available' : 'partial';
      continue;
    }
    let conflictCount = 0;
    selected.forEach(ts => { if (lockedSet.has(ts)) conflictCount++; });
    if (conflictCount === 0) map[roomId] = 'available';
    else if (conflictCount === selectionSize) map[roomId] = 'occupied';
    else map[roomId] = 'partial';
  }
  return map;
}

export function useRoomAvailability({ academicYear, semester, selectedTimeslots, enabled = true }: UseRoomAvailabilityParams): UseRoomAvailabilityResult {
  const [lockedSchedules, setLockedSchedules] = useState<Array<Pick<class_schedule,'RoomID'|'TimeslotID'>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLocked = async () => {
    if (!academicYear || !semester || !enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRawLockedSchedulesAction({ AcademicYear: academicYear, Semester: semester });
      if (Array.isArray(data)) {
        setLockedSchedules(data.map(d => ({ RoomID: d.RoomID ?? null, TimeslotID: d.TimeslotID })));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load locked schedules'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchLocked(); }, [academicYear, semester, enabled]);

  const availabilityMap = useMemo(
    () => computeAvailability(lockedSchedules, selectedTimeslots),
    [lockedSchedules, selectedTimeslots]
  );

  return { availabilityMap, loading, error, refresh: fetchLocked };
}
