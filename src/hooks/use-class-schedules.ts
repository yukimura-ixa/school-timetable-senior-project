"use client";

import useSWR from "swr";
import type { class_schedule } from "@/prisma/generated/client";
import { getClassSchedulesAction } from "@/features/class/application/actions/class.actions";
import type { ActionResult } from "@/shared/lib/action-wrapper";

/**
 * React hook for fetching class schedules with optional filters.
 * Uses SWR for caching and revalidation.
 *
 * @param academicYear - Academic year (e.g., 2567)
 * @param semester - Semester number (1 or 2)
 * @param teacherId - Optional teacher ID to filter by
 * @param gradeId - Optional grade ID to filter by
 * @returns {Object} Class schedules data with loading/error/validating states
 * @example
 * const { data, isLoading, error, mutate } = useClassSchedules(2567, 1, undefined, 'P1')
 */
export const useClassSchedules = (
  academicYear: number,
  semester: number,
  teacherId?: number,
  gradeId?: string,
) => {
  const key = `class-schedules-${academicYear}-${semester}${gradeId ? `-grade-${gradeId}` : ""}${teacherId ? `-teacher-${teacherId}` : ""}`;

  const { data, error, mutate, isValidating } = useSWR<class_schedule[], Error>(
    key,
    async () => {
      const result = (await getClassSchedulesAction({
        AcademicYear: academicYear,
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        ...(gradeId && { GradeID: gradeId }),
        ...(teacherId && { TeacherID: teacherId }),
      })) as ActionResult<class_schedule[]>;
      return result.success && result.data ? result.data : [];
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return {
    data: data ?? [],
    isLoading: !error && !data,
    isValidating,
    error,
    mutate,
  };
};
