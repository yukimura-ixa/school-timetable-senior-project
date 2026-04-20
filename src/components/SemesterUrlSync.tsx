"use client";

import { useEffect } from "react";
import { useSemesterStore } from "@/stores/semesterStore";

interface SemesterUrlSyncProps {
  academicYear: number;
  semester: number;
}

// Syncs URL segment [academicYear]/[semester] into the persisted semester store
// so navbar selectors, badges, and other subscribers reflect the route the user
// landed on directly (bookmark, refresh, cross-page link).
export function SemesterUrlSync({ academicYear, semester }: SemesterUrlSyncProps) {
  const selectedSemester = useSemesterStore((s) => s.selectedSemester);
  const setSemester = useSemesterStore((s) => s.setSemester);

  useEffect(() => {
    const configId = `${semester}-${academicYear}`;
    if (selectedSemester !== configId) {
      setSemester(configId, academicYear, semester);
    }
  }, [academicYear, semester, selectedSemester, setSemester]);

  return null;
}
