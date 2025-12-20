"use client";

import useSWR from "swr";
import type { gradelevel } from "@/prisma/generated/client";
import { getGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";

/**
 * React hook for fetching grade levels.
 * Uses SWR for caching and revalidation.
 *
 * @returns {Object} Grade levels data with loading/error states
 * @example
 * const { data, isLoading, error, mutate } = useGradeLevels()
 */
export const useGradeLevels = () => {
  const { data, error, mutate, isLoading } = useSWR<gradelevel[]>(
    "grade-levels",
    async () => {
      const result = await getGradeLevelsAction({});
      return result.success && result.data ? result.data : [];
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute deduplication
      keepPreviousData: true,
    },
  );

  return {
    data: data ?? [],
    isLoading: isLoading ?? (!error && !data),
    error,
    mutate,
  };
};
