/**
 * Custom hook for fetching program and subject data with SWR caching
 * 
 * Benefits:
 * - Automatic caching and deduplication
 * - Revalidation on focus/reconnect
 * - Optimistic updates support
 * - Loading and error states
 */

import useSWR from 'swr';
import { getProgramByIdAction } from '../../application/actions/program.actions';
import { getSubjectsAction } from '@/features/subject/application/actions/subject.actions';
import type { SubjectCategory } from '@/prisma/generated/client';

export type Subject = {
  SubjectCode: string;
  SubjectName: string;
  Category: SubjectCategory;
  Credit: string;
};

export type ProgramSubject = {
  SubjectCode: string;
  MinCredits?: number | null;
  MaxCredits?: number | null;
  IsMandatory?: boolean | null;
};

export type Program = {
  ProgramID: number;
  ProgramName: string;
  program_subject: ProgramSubject[];
};

/**
 * Fetches program and all subjects data for assignment page
 * @param programId - Program ID to fetch
 * @returns Program data, subjects list, loading states, and mutate functions
 */
export function useProgramSubjects(programId: number) {
  // Fetch program data with SWR
  const {
    data: programResponse,
    error: programError,
    mutate: mutateProgram,
    isLoading: isProgramLoading
  } = useSWR(
    ['program-by-id', programId],
    async ([, id]) => await getProgramByIdAction({ ProgramID: id }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Fetch all subjects with SWR
  const {
    data: subjectsResponse,
    error: subjectsError,
    mutate: mutateSubjects,
    isLoading: isSubjectsLoading
  } = useSWR(
    'subjects-all',
    async () => await getSubjectsAction(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Unwrap ActionResult for program
  const program =
    programResponse && 'success' in programResponse && programResponse.success && programResponse.data
      ? (programResponse.data as Program)
      : null;

  // Unwrap ActionResult for subjects
  const subjects =
    subjectsResponse && 'success' in subjectsResponse && subjectsResponse.success && subjectsResponse.data
      ? (subjectsResponse.data as Subject[])
      : [];

  const isLoading = isProgramLoading || isSubjectsLoading;
  const error = programError || subjectsError;

  return {
    program,
    subjects,
    isLoading,
    error,
    mutateProgram,
    mutateSubjects,
  };
}
