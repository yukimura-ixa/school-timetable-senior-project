/**
 * useTeacherSchedule Hook
 * 
 * Manages data fetching for teacher schedule arrangement with:
 * - Teacher data
 * - Available responsibilities (subjects)
 * - Timeslots configuration
 * - Existing class schedules
 * - Conflict detection
 * 
 * Uses Server Actions (Clean Architecture) with SWR for client-side caching.
 * Applies type transformations at API boundaries for type safety.
 * 
 * @module useTeacherSchedule
 */

import { useMemo } from 'react';

// ============================================================================
// TYPE GUARDS FOR SERVER ACTION RESPONSES
// ============================================================================

/**
 * Type guard for successful Server Action response
 */
function isSuccessResponse(result: unknown): result is { success: true; data: unknown } {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    result.success === true &&
    'data' in result
  );
}
import useSWR from 'swr';
import type { 
  timeslot, 
  class_schedule, 
  subject, 
  room, 
  teacher,
  teachers_responsibility 
} from '@/prisma/generated/client';

// Server Actions
import { getTeacherScheduleAction } from '@/features/arrange/application/actions/arrange.actions';
import { getConflictsAction } from '@/features/class/application/actions/class.actions';
import { getTeachersAction } from '@/features/teacher/application/actions/teacher.actions';
import { getAvailableRespsAction } from '@/features/assign/application/actions/assign.actions';
import { getTimeslotsByTermAction } from '@/features/timeslot/application/actions/timeslot.actions';

// Type definition for class schedule with relations
export type ClassScheduleWithRelations = class_schedule & {
  subject: subject;
  room: room | null;
};

// Type for conflict data - schedules with extra display fields
export type ConflictSchedule = class_schedule & {
  subject: subject;
  room: room;
  Scheduled?: boolean;
  SubjectName?: string;
  RoomName?: string;
};

export interface UseTeacherScheduleParams {
  teacherID: string | null;
  academicYear: string;
  semester: string;
}

export interface UseTeacherScheduleResult {
  // Teacher data
  teacher: teacher | null;
  
  // Subject responsibilities
  responsibilities: teachers_responsibility[];
  
  // Timeslots configuration
  timeslots: timeslot[];
  
  // Existing schedules
  schedules: ClassScheduleWithRelations[];
  
  // Conflict data (schedules for the selected grade)
  conflicts: ConflictSchedule[] | null;
  
  // Loading states
  isLoading: boolean;
  isValidating: boolean;
  
  // Error states
  hasError: boolean;
  errors: {
    teacher?: Error;
    responsibilities?: Error;
    timeslots?: Error;
    schedules?: Error;
    conflicts?: Error;
  };
  
  // Refetch functions
  refetch: {
    teacher: () => void;
    responsibilities: () => void;
    timeslots: () => void;
    schedules: () => void;
    conflicts: () => void;
    all: () => void;
  };
}

/**
 * Hook for fetching all teacher schedule arrangement data
 * 
 * @param params - Teacher ID, academic year, semester
 * @returns Teacher schedule data with loading/error states
 * 
 * @example
 * const { teacher, responsibilities, timeslots, schedules, isLoading } = useTeacherSchedule({
 *   teacherID: '123',
 *   academicYear: '2567',
 *   semester: '1',
 * });
 */
export function useTeacherSchedule({
  teacherID,
  academicYear,
  semester,
}: UseTeacherScheduleParams): UseTeacherScheduleResult {
  // Convert semester to enum format
  const semesterEnum = `SEMESTER_${semester}` as 'SEMESTER_1' | 'SEMESTER_2';
  const academicYearNum = parseInt(academicYear);
  const teacherIDNum = teacherID ? parseInt(teacherID) : null;

  // ============================================================================
  // TEACHER DATA
  // ============================================================================
  const teacherQuery = useSWR<teacher | null>(
    teacherID ? `teacher-${teacherID}` : null,
    async () => {
      if (!teacherID) return null;
      
      const result = await getTeachersAction();
      if (!result || !result.success || !result.data) {
        return null;
      }

      const teachers = result.data as teacher[];
      const foundTeacher = teachers.find((t) => t.TeacherID === teacherIDNum);
      return foundTeacher || null;
    },
    { revalidateOnFocus: false }
  );

  // ============================================================================
  // AVAILABLE RESPONSIBILITIES (SUBJECTS)
  // ============================================================================
  const responsibilitiesQuery = useSWR<teachers_responsibility[]>(
    teacherID
      ? `available-resp-${academicYear}-${semester}-${teacherID}`
      : null,
    async () => {
      if (!teacherID || !teacherIDNum) return [];

      const result = await getAvailableRespsAction({
        AcademicYear: academicYearNum,
        Semester: semesterEnum,
        TeacherID: teacherIDNum,
      });

      if (!isSuccessResponse(result) || !Array.isArray(result.data)) {
        return [];
      }

      return result.data as teachers_responsibility[];
    },
    { revalidateOnFocus: false }
  );

  // ============================================================================
  // TIMESLOTS CONFIGURATION
  // ============================================================================
  const timeslotsQuery = useSWR<timeslot[]>(
    teacherID ? `timeslots-${academicYear}-${semester}` : null,
    async () => {
      if (!teacherID) return [];

      const result = await getTimeslotsByTermAction({
        AcademicYear: academicYearNum,
        Semester: semesterEnum,
      });

      if (!isSuccessResponse(result) || !Array.isArray(result.data)) {
        return [];
      }

      // Type assertion needed because Server Action returns unknown
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      return result.data as timeslot[];
    },
    { revalidateOnFocus: false }
  );

  // ============================================================================
  // EXISTING CLASS SCHEDULES
  // ============================================================================
  const schedulesQuery = useSWR<ClassScheduleWithRelations[]>(
    teacherID
      ? `teacher-schedule-${academicYear}-${semester}-${teacherID}`
      : null,
    async () => {
      if (!teacherID || !teacherIDNum) return [];

      const result = await getTeacherScheduleAction({
        TeacherID: teacherIDNum,
      });

      if (!isSuccessResponse(result) || !Array.isArray(result.data)) {
        return [];
      }

      return result.data as ClassScheduleWithRelations[];
    },
    { revalidateOnFocus: false, revalidateOnMount: true }
  );

  // ============================================================================
  // CONFLICT DETECTION
  // ============================================================================
  const conflictsQuery = useSWR<ConflictSchedule[] | null>(
    teacherID ? `conflicts-${academicYear}-${semester}-${teacherID}` : null,
    async () => {
      if (!teacherID || !teacherIDNum) return null;

      const result = await getConflictsAction({
        AcademicYear: academicYearNum,
        Semester: semesterEnum,
        TeacherID: teacherIDNum,
      });

      if (!isSuccessResponse(result) || !Array.isArray(result.data)) {
        return null;
      }

      return result.data as ConflictSchedule[];
    },
    { revalidateOnFocus: false }
  );

  // ============================================================================
  // COMPUTED STATES
  // ============================================================================
  
  const isLoading = useMemo(() => {
    return (
      !teacherQuery.data &&
      !teacherQuery.error &&
      !responsibilitiesQuery.data &&
      !responsibilitiesQuery.error &&
      !timeslotsQuery.data &&
      !timeslotsQuery.error &&
      !schedulesQuery.data &&
      !schedulesQuery.error
    );
  }, [
    teacherQuery.data,
    teacherQuery.error,
    responsibilitiesQuery.data,
    responsibilitiesQuery.error,
    timeslotsQuery.data,
    timeslotsQuery.error,
    schedulesQuery.data,
    schedulesQuery.error,
  ]);

  const isValidating = useMemo(() => {
    return (
      teacherQuery.isValidating ||
      responsibilitiesQuery.isValidating ||
      timeslotsQuery.isValidating ||
      schedulesQuery.isValidating ||
      conflictsQuery.isValidating
    );
  }, [
    teacherQuery.isValidating,
    responsibilitiesQuery.isValidating,
    timeslotsQuery.isValidating,
    schedulesQuery.isValidating,
    conflictsQuery.isValidating,
  ]);

  const hasError = useMemo(() => {
    return !!(
      teacherQuery.error ||
      responsibilitiesQuery.error ||
      timeslotsQuery.error ||
      schedulesQuery.error ||
      conflictsQuery.error
    );
  }, [
    teacherQuery.error,
    responsibilitiesQuery.error,
    timeslotsQuery.error,
    schedulesQuery.error,
    conflictsQuery.error,
  ]);

  const errors = useMemo(() => {
    return {
      teacher: teacherQuery.error as Error | undefined,
      responsibilities: responsibilitiesQuery.error as Error | undefined,
      timeslots: timeslotsQuery.error as Error | undefined,
      schedules: schedulesQuery.error as Error | undefined,
      conflicts: conflictsQuery.error as Error | undefined,
    };
  }, [
    teacherQuery.error,
    responsibilitiesQuery.error,
    timeslotsQuery.error,
    schedulesQuery.error,
    conflictsQuery.error,
  ]);

  // ============================================================================
  // REFETCH FUNCTIONS
  // ============================================================================
  
  const refetch = useMemo(() => {
    return {
      teacher: () => void teacherQuery.mutate(),
      responsibilities: () => void responsibilitiesQuery.mutate(),
      timeslots: () => void timeslotsQuery.mutate(),
      schedules: () => void schedulesQuery.mutate(),
      conflicts: () => void conflictsQuery.mutate(),
      all: () => {
        void teacherQuery.mutate();
        void responsibilitiesQuery.mutate();
        void timeslotsQuery.mutate();
        void schedulesQuery.mutate();
        void conflictsQuery.mutate();
      },
    };
  }, [
    teacherQuery,
    responsibilitiesQuery,
    timeslotsQuery,
    schedulesQuery,
    conflictsQuery,
  ]);

  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    teacher: teacherQuery.data ?? null,
    responsibilities: responsibilitiesQuery.data ?? [],
    timeslots: timeslotsQuery.data ?? [],
    schedules: schedulesQuery.data ?? [],
    conflicts: conflictsQuery.data ?? null,
    isLoading,
    isValidating,
    hasError,
    errors,
    refetch,
  };
}
