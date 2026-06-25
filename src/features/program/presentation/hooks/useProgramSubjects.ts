/**
 * Custom hook for fetching program and subject data with SWR caching
 *
 * Benefits:
 * - Automatic caching and deduplication
 * - Revalidation on focus/reconnect
 * - Optimistic updates support
 * - Loading and error states
 */

import useSWR from "swr";
import {
  getProgramByIdAction,
  getInheritedFundamentalsAction,
} from "../../application/actions/program.actions";
import { getSubjectsAction } from "@/features/subject/application/actions/subject.actions";
import type { SubjectCategory, subject } from "@/prisma/generated/client";

export type InheritedFundamental = {
  SubjectCode: string;
  subject: subject;
  SortOrder: number;
  TemplateMinCredits: number;
  TemplateMaxCredits: number | null;
  excluded: boolean;
  overridden: boolean;
  MinCredits: number;
  MaxCredits: number | null;
};

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
  ProgramCode?: string;
  Track?: string;
  Year?: number;
  MinTotalCredits?: number;
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
    isLoading: isProgramLoading,
  } = useSWR(
    ["program-by-id", programId],
    async ([, id]) => await getProgramByIdAction({ ProgramID: id }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    },
  );

  // Fetch all subjects with SWR
  const {
    data: subjectsResponse,
    error: subjectsError,
    mutate: mutateSubjects,
    isLoading: isSubjectsLoading,
  } = useSWR("subjects-all", async () => await getSubjectsAction({}), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });

  // Unwrap ActionResult for program
  // Note: Cast required - transforms Prisma's ProgramWithRelations to local view-model type
  const program =
    programResponse &&
    "success" in programResponse &&
    programResponse.success &&
    programResponse.data
      ? (programResponse.data as unknown as Program)
      : null;

  // Unwrap ActionResult for subjects
  const subjects =
    subjectsResponse &&
    "success" in subjectsResponse &&
    subjectsResponse.success &&
    subjectsResponse.data
      ? (subjectsResponse.data as Subject[])
      : [];

  // Inherited fundamentals (CORE) from this program's grade template, annotated
  // with per-program exclude/override state. Drives the inherited section.
  const {
    data: inheritedResponse,
    error: inheritedError,
    mutate: mutateInherited,
    isLoading: isInheritedLoading,
  } = useSWR(
    ["program-inherited", programId],
    async ([, id]) => await getInheritedFundamentalsAction({ ProgramID: id }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  const inherited: InheritedFundamental[] =
    inheritedResponse &&
    "success" in inheritedResponse &&
    inheritedResponse.success &&
    inheritedResponse.data
      ? inheritedResponse.data
      : [];

  const isLoading = isProgramLoading || isSubjectsLoading || isInheritedLoading;
  const error = programError || subjectsError || inheritedError;

  return {
    program,
    subjects,
    inherited,
    isLoading,
    error,
    mutateProgram,
    mutateSubjects,
    mutateInherited,
  };
}
