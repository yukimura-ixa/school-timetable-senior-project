"use client";

import useSWR from "swr";
import { getLockedSchedulesAction } from "@/features/lock/application/actions/lock.actions";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";

/**
 * React hook for fetching locked schedules by academic term.
 * Uses SWR for caching and revalidation with server-provided fallback data.
 *
 * @param academicYear - Academic year (e.g., 2567)
 * @param semester - Semester number (1 or 2)
 * @param fallbackData - Initial data from server (optional)
 * @returns {Object} Locked schedules data with loading/error states
 * @example
 * const { data, isLoading, error, mutate } = useLockedSchedules(2567, 1, initialData)
 */
export const useLockedSchedules = (
  academicYear: number,
  semester: number,
  fallbackData?: GroupedLockedSchedule[],
) => {
  const fetcher = async () => {
    const result = await getLockedSchedulesAction({
      AcademicYear: academicYear,
      Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
    });
    return result.success && result.data ? result.data : [];
  };

  const { data, error, mutate, isLoading } = useSWR<GroupedLockedSchedule[]>(
    `locked-schedules-${academicYear}-${semester}`,
    fetcher,
    {
      fallbackData, // Use server data as fallback
      revalidateOnMount: !fallbackData, // Only revalidate if no fallback data
    },
  );

  return {
    data: data ?? fallbackData ?? [],
    isLoading: isLoading ?? (!error && !data && !fallbackData),
    error,
    mutate,
  };
};
