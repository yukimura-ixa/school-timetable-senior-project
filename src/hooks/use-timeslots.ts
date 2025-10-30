"use client"

import useSWR from "swr"
import type { timeslot } from "@/prisma/generated"
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions"

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
  const { data, error, mutate } = useSWR<timeslot[]>(
    `timeslots-${academicYear}-${semester}`,
    async () => {
      const result = await getTimeslotsByTermAction({
        AcademicYear: academicYear,
        Semester: `SEMESTER_${semester}` as 'SEMESTER_1' | 'SEMESTER_2'
      })
      return result.success ? result.data : []
    }
  )

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}
