"use client";

import useSWR from "swr";
import type { timeslot } from "@/prisma/generated/client";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";

/**
 * React hook for fetching timeslots by academic term.
 * Uses SWR for caching and revalidation.
 *
 * @param academicYear - Academic year (e.g., 2567)
 * @param semester - Semester number (1 or 2)
 * @returns {Object} Timeslots data with loading/error states
 * @example
 * const { data, isLoading, error, mutate } = useTimeslots(2567, 1)
 */
export const useTimeslots = (academicYear: number, semester: number) => {
  const fetcher = async () => {
    const result = await getTimeslotsByTermAction({
      AcademicYear: academicYear,
      Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
    });
    return result.success && result.data ? result.data : [];
  };

  const { data, error, mutate, isLoading, isValidating } = useSWR<timeslot[]>(
    `timeslots-${academicYear}-${semester}`,
    fetcher,
  );

  return {
    data: data ?? [],
    isLoading: isLoading ?? (!error && !data),
    isValidating: isValidating ?? false,
    error,
    mutate,
  };
};
