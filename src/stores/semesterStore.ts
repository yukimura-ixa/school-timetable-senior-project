/**
 * Global Semester Store
 * Manages the currently selected semester across the application
 * Persists selection in localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SemesterState = {
  // Currently selected semester (null if no selection)
  selectedSemester: string | null; // Format: "1-2567"
  academicYear: number | null;
  semester: number | null;
  
  // Actions
  setSemester: (configId: string, academicYear: number, semester: number) => void;
  clearSemester: () => void;
};

export const useSemesterStore = create<SemesterState>()(
  persist(
    (setState) => ({
      selectedSemester: null,
      academicYear: null,
      semester: null,
      setSemester: (configId, academicYear, semester) =>
        setState({ selectedSemester: configId, academicYear, semester }),
      clearSemester: () =>
        setState({ selectedSemester: null, academicYear: null, semester: null }),
    }),
    { name: "semester-selection" }
  )
);

// Expose for E2E (non-production) without global type augmentation to avoid build issues
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { __semesterStore?: typeof useSemesterStore }).__semesterStore = useSemesterStore;
}
