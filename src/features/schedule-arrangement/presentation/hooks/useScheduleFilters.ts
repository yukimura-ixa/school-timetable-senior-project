/**
 * useScheduleFilters Hook
 *
 * Encapsulates schedule filtering and search logic.
 * Provides filtering for subjects, teachers, and grade levels.
 *
 * Week 5.4 - Custom Hooks Extraction
 */

import { useArrangementUIStore } from "../stores/arrangement-ui.store";
import type { SubjectData } from "@/types/schedule.types";

export interface ScheduleFiltersOperations {
  // Filtered data
  filteredSubjects: SubjectData[];
  availableYears: number[];

  // Filter operations
  filterBySearchText: (
    subjects: SubjectData[],
    searchText: string,
  ) => SubjectData[];
  filterByGradeLevel: (
    subjects: SubjectData[],
    year: number | null,
  ) => SubjectData[];
  filterByScheduledStatus: (
    subjects: SubjectData[],
    includeScheduled: boolean,
  ) => SubjectData[];

  // Combined filters
  getAvailableSubjects: (searchText?: string) => SubjectData[];
  getSubjectsByYear: (year: number) => SubjectData[];

  // Year/Grade operations
  extractAvailableYears: (subjects: SubjectData[]) => number[];
}

/**
 * Custom hook for schedule filtering operations
 *
 * Provides memoized filtering functions and computed filter values.
 * Optimizes performance by preventing unnecessary recalculations.
 *
 * @example
 * ```typescript
 * const {
 *   filteredSubjects,
 *   availableYears,
 *   getAvailableSubjects
 * } = useScheduleFilters();
 *
 * // Get unscheduled subjects matching search
 * const subjects = getAvailableSubjects('Math');
 * ```
 */
export function useScheduleFilters(): ScheduleFiltersOperations {
  // Get store state
  const { subjectData, yearSelected } = useArrangementUIStore();

  /**
   * Extract unique grade levels from subjects
   */
  const extractAvailableYears = (subjects: SubjectData[]): number[] => {
    const yearsSet = new Set<number>();

    subjects.forEach((subject) => {
      if (subject.gradelevel?.year) {
        yearsSet.add(subject.gradelevel.year);
      }
    });

    return Array.from(yearsSet).sort((a, b) => a - b);
  };

  /**
   * Get available years from current subject data
   */
  const availableYears = extractAvailableYears(subjectData);

  /**
   * Filter subjects by search text (subjectCode or subjectName)
   */
  const filterBySearchText = (
    subjects: SubjectData[],
    searchText: string,
  ): SubjectData[] => {
    if (!searchText || searchText.trim() === "") {
      return subjects;
    }

    const search = searchText.toLowerCase().trim();

    return subjects.filter((subject) => {
      const code = subject.subjectCode?.toLowerCase() || "";
      const name = subject.subjectName?.toLowerCase() || "";

      return code.includes(search) || name.includes(search);
    });
  };

  /**
   * Filter subjects by grade level (year)
   */
  const filterByGradeLevel = (
    subjects: SubjectData[],
    year: number | null,
  ): SubjectData[] => {
    if (year === null) {
      return subjects;
    }

    return subjects.filter((subject) => subject.gradelevel?.year === year);
  };

  /**
   * Filter subjects by scheduled status
   */
  const filterByScheduledStatus = (
    subjects: SubjectData[],
    includeScheduled: boolean,
  ): SubjectData[] => {
    if (includeScheduled) {
      return subjects;
    }

    return subjects.filter((subject) => !subject.scheduled);
  };

  /**
   * Get available subjects with optional search text
   * Combines grade level filter and scheduled status filter
   */
  const getAvailableSubjects = (searchText = ""): SubjectData[] => {
    let filtered = subjectData;

    // Filter by grade level if selected
    if (yearSelected !== null) {
      filtered = filterByGradeLevel(filtered, yearSelected);
    }

    // Filter out scheduled subjects
    filtered = filterByScheduledStatus(filtered, false);

    // Filter by search text
    filtered = filterBySearchText(filtered, searchText);

    return filtered;
  };

  /**
   * Get subjects for a specific year/grade level
   */
  const getSubjectsByYear = (year: number): SubjectData[] => {
    return filterByGradeLevel(subjectData, year);
  };

  /**
   * Get filtered subjects based on current year selection
   */
  const filteredSubjects = getAvailableSubjects();

  return {
    filteredSubjects,
    availableYears,
    filterBySearchText,
    filterByGradeLevel,
    filterByScheduledStatus,
    getAvailableSubjects,
    getSubjectsByYear,
    extractAvailableYears,
  };
}
