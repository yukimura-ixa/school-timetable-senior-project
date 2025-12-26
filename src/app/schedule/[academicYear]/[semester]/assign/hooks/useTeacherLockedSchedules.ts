"use client";

import useSWR from "swr";
import { getTeacherScheduleAction } from "@/features/arrange/application/actions/arrange.actions";
import type { LockedScheduleItem } from "../components/LockedScheduleList";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";
import type { TeacherScheduleWithRelations } from "@/features/arrange/infrastructure/repositories/arrange.repository";

/**
 * useTeacherLockedSchedules Hook
 *
 * Fetches and filters locked schedule items for a teacher in a given term.
 *
 * @param teacherId - Teacher ID
 * @param academicYear - Academic Year (BE)
 * @param semester - Semester (1 or 2)
 */
export function useTeacherLockedSchedules(
  teacherId: number | undefined,
  academicYear: number | undefined,
  semester: string | undefined,
) {
  const semesterEnum = semester === "1" ? "SEMESTER_1" : "SEMESTER_2";

  const { data, error, isLoading, mutate } = useSWR(
    teacherId && academicYear && semester
      ? `locked-schedules-${teacherId}-${academicYear}-${semester}`
      : null,
    async () => {
      if (!teacherId) return [];

      const actionResult = await getTeacherScheduleAction({
        TeacherID: teacherId,
      });
      if (!actionResult.success) return [];
      if (!actionResult.data) return [];

      const result = actionResult.data;
      if (!result.success) return [];

      // Filter for locked items in this term
      return result.data
        .filter((item: TeacherScheduleWithRelations) => {
          return (
            item.IsLocked &&
            item.timeslot.AcademicYear === academicYear &&
            item.timeslot.Semester === semesterEnum
          );
        })
        .map((item: TeacherScheduleWithRelations) => {
          // Map to LockedScheduleItem type
          return {
            ...item,
            SubjectName: item.subject.SubjectName,
            RoomName: item.room?.RoomName || "-",
            DayOfWeek: item.timeslot.DayOfWeek,
            TimePeriod: extractPeriodFromTimeslotId(item.TimeslotID),
          } as LockedScheduleItem;
        });
    },
  );

  return {
    lockedSchedules: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
