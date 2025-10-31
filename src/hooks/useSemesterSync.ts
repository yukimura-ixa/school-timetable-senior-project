/**
 * Custom hook for syncing semester state between URL params and global store
 * 
 * This hook:
 * 1. Reads semester/year from URL params
 * 2. Syncs with global store (Zustand)
 * 3. Provides consistent semester data across the app
 * 
 * Usage in schedule pages:
 * ```tsx
 * const { semester, academicYear, configId } = useSemesterSync(params.semesterAndyear);
 * ```
 * 
 * Note: Individual pages should check config status using their own data fetching
 */

import { useEffect } from "react";
import { useSemesterStore } from "@/stores/semesterStore";

interface SemesterSyncResult {
  semester: string;
  academicYear: string;
  configId: string;
}

export function useSemesterSync(semesterAndYear: string): SemesterSyncResult {
  const { setSemester } = useSemesterStore();

  // Parse URL param
  const [semester, academicYear] = semesterAndYear.split("-");
  const configId = semesterAndYear;

  useEffect(() => {
    // Sync URL params with global store on mount and when params change
    if (semester && academicYear) {
      setSemester(configId, parseInt(academicYear), parseInt(semester));
    }
  }, [semester, academicYear, configId, setSemester]);

  return {
    semester,
    academicYear,
    configId,
  };
}
