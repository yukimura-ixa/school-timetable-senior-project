"use client"

import useSWR from "swr"
import { getLockedSchedulesAction } from "@/features/lock/application/actions/lock.actions"
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service"

/**
 * React hook for fetching locked schedules by academic term.
 * Uses SWR for caching and revalidation.
 * 
 * @param academicYear - Academic year (e.g., 2567)
 * @param semester - Semester number (1 or 2)
 * @returns {Object} Locked schedules data with loading/error states
 * @example
 * const { data, isLoading, error, mutate } = useLockedSchedules(2567, 1)
 */
export const useLockedSchedules = (academicYear: number, semester: number) => {
  const { data, error, mutate } = useSWR<GroupedLockedSchedule[]>(
    `locked-schedules-${academicYear}-${semester}`,
    async () => {
      const result = await getLockedSchedulesAction({
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
