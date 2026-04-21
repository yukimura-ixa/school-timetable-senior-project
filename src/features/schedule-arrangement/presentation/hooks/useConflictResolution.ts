"use client";

import { useCallback, useState } from "react";
import { suggestResolutionAction } from "../../application/actions/conflict-resolution.actions";
import type {
  ResolutionSuggestion,
  ScheduleArrangementInput,
} from "../../domain/models/conflict.model";

export interface UseConflictResolutionParams {
  academicYear: number;
  semester: 1 | 2;
}

export function useConflictResolution({
  academicYear,
  semester,
}: UseConflictResolutionParams) {
  const [suggestions, setSuggestions] = useState<ResolutionSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFor = useCallback(
    async (attempt: ScheduleArrangementInput) => {
      setIsLoading(true);
      try {
        const res = await suggestResolutionAction({
          AcademicYear: academicYear,
          Semester: semester === 1 ? "SEMESTER_1" : "SEMESTER_2",
          attempt,
        });
        setSuggestions(res.success && res.data ? res.data : []);
      } finally {
        setIsLoading(false);
      }
    },
    [academicYear, semester],
  );

  const reset = useCallback(() => {
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  return { suggestions, isLoading, fetchFor, reset };
}
