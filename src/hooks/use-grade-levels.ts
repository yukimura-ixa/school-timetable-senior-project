"use client"

import useSWR from "swr"
import type { gradelevel } from "@/prisma/generated"
import { getGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions"

/**
 * React hook for fetching grade levels.
 * Uses SWR for caching and revalidation.
 * 
 * @returns {Object} Grade levels data with loading/error states
 * @example
 * const { data, isLoading, error, mutate } = useGradeLevels()
 */
export const useGradeLevels = () => {
  const { data, error, mutate } = useSWR<gradelevel[]>(
    'grade-levels',
    async () => {
      const result = await getGradeLevelsAction()
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
