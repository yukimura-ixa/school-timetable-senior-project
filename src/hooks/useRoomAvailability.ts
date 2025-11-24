import { useEffect, useState, useMemo } from "react";
import type { class_schedule, semester } from "@/prisma/generated/client";
import { getRawLockedSchedulesAction } from "@/features/lock/application/actions/lock.actions";
import { computeAvailability } from "@/hooks/roomAvailabilityUtils";

export type RoomAvailabilityStatus = "available" | "occupied" | "partial";

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

export { computeAvailability };

export function useRoomAvailability({
  academicYear,
  semester,
  selectedTimeslots,
  enabled = true,
}: UseRoomAvailabilityParams): UseRoomAvailabilityResult {
  const [lockedSchedules, setLockedSchedules] = useState<
    Array<Pick<class_schedule, "RoomID" | "TimeslotID">>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLocked = async () => {
    if (!academicYear || !semester || !enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRawLockedSchedulesAction({
        AcademicYear: academicYear,
        Semester: semester,
      });
      if (Array.isArray(data)) {
        setLockedSchedules(
          data.map((d) => ({
            RoomID: d.RoomID ?? null,
            TimeslotID: d.TimeslotID,
          })),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to load locked schedules"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLocked();
  }, [academicYear, semester, enabled]);

  const availabilityMap = useMemo(
    () => computeAvailability(lockedSchedules, selectedTimeslots),
    [lockedSchedules, selectedTimeslots],
  );

  return { availabilityMap, loading, error, refresh: fetchLocked };
}
