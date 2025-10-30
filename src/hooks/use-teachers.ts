"use client"

import useSWR from "swr"
import type { teacher } from "@/prisma/generated"
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions"

/**
 * React hook for fetching all teachers.
 * Uses SWR for caching and revalidation.
 * 
 * @returns {Object} Teachers data with loading/error states
 * @example
 * const { data, isLoading, error, mutate } = useTeachers()
 */
export const useTeachers = () => {
  const { data, error, mutate } = useSWR<teacher[]>(
    'teachers',
    async () => {
      const result = await getTeachersAction()
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
