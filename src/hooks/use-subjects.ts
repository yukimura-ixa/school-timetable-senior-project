"use client";

import useSWR from "swr";
import type { subject } from "@/prisma/generated/client";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";

/**
 * React hook for fetching subjects.
 * Uses SWR for caching and revalidation.
 *
 * @returns {Object} Subjects data with loading/error states
 * @example
 * const { data, isLoading, error, mutate } = useSubjects()
 */
export const useSubjects = () => {
  const { data, error, mutate, isLoading } = useSWR<subject[]>(
    "subjects",
    async () => {
      const result = await getSubjectsAction({});
      return result.success ? result.data : [];
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
