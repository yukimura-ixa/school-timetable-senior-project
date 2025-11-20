"use client"

import useSWR from "swr"
import type { teachers_responsibility } from '@/prisma/generated/client';
import { getAssignmentsByTeacherAction } from "@/features/assign/application/actions/assign.actions"
import type { ActionResult } from "@/shared/lib/action-wrapper"

/**
 * React hook for fetching teacher assignments (responsibilities).
 * Uses SWR for caching and revalidation.
 * 
 * @param teacherId - Teacher ID to fetch assignments for
 * @returns {Object} Teacher assignments data with loading/error states
 * @example
 * const { data, isLoading, error, mutate } = useTeacherAssignments(12345)
 */
export const useTeacherAssignments = (teacherId: number) => {
  const { data, error, mutate } = useSWR<teachers_responsibility[]>(
    `assignments-teacher-${teacherId}`,
    async () => {
      const result = await getAssignmentsByTeacherAction({ TeacherID: teacherId }) as ActionResult<teachers_responsibility[]>
      return result.success && result.data ? result.data : []
    }
  )

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  }
}
