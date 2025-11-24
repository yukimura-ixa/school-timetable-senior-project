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

import { useEffect, useMemo } from "react";
import { useSemesterStore } from "@/stores/semesterStore";

interface SemesterSyncResult {
  semester: string;
  academicYear: string;
  configId: string;
  semesterNum: number;
  academicYearNum: number;
}

/**
 * Improve robustness for reading `params.semesterAndyear` from App Router.
 * Compatible with Next.js useParams typing and catch-all segments.
 *
 * Recommended usage in a client component:
 *
 * const params = useParams<{ semesterAndyear: string }>();
 * const { semester, academicYear, configId } = useSemesterSync(params.semesterAndyear);
 */
export function useSemesterSync(
  semesterAndYear: string | string[] | undefined,
): SemesterSyncResult {
  const { setSemester, selectedSemester } = useSemesterStore();

  // Normalize and parse the input safely
  const { semester, academicYear, configId, semesterNum, academicYearNum } =
    useMemo(() => {
      const raw = Array.isArray(semesterAndYear)
        ? (semesterAndYear[0] ?? "")
        : (semesterAndYear ?? "");

      const trimmed = raw.trim();

      // Expect pattern like "1-2567"; be tolerant but safe
      const parts = trimmed.split("-");
      const semStr = (parts[0] ?? "").trim();
      const yearStr = (parts[1] ?? "").trim();

      const semNum = Number.parseInt(semStr, 10);
      const yearNum = Number.parseInt(yearStr, 10);

      const valid =
        Number.isFinite(semNum) &&
        Number.isFinite(yearNum) &&
        semStr !== "" &&
        yearStr !== "";
      const cfg = valid ? `${semNum}-${yearNum}` : "";

      return {
        semester: valid ? String(semNum) : "",
        academicYear: valid ? String(yearNum) : "",
        configId: cfg,
        semesterNum: valid ? semNum : 0,
        academicYearNum: valid ? yearNum : 0,
      };
    }, [semesterAndYear]);

  useEffect(() => {
    // Only sync if valid and changed (prevents unnecessary localStorage writes)
    if (
      configId &&
      semesterNum &&
      academicYearNum &&
      selectedSemester !== configId
    ) {
      setSemester(configId, academicYearNum, semesterNum);
    }
  }, [semesterNum, academicYearNum, configId, selectedSemester, setSemester]);

  return {
    semester: semester || "",
    academicYear: academicYear || "",
    configId,
    semesterNum,
    academicYearNum,
  };
}
