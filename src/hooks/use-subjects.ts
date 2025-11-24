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
  const { data, error, mutate } = useSWR<subject[]>("subjects", async () => {
    const result = await getSubjectsAction();
    return result.success ? result.data : [];
  });

  return {
    data: data ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
