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
    (set) => ({
      selectedSemester: null,
      academicYear: null,
      semester: null,
      
      setSemester: (configId, academicYear, semester) =>
        set({
          selectedSemester: configId,
          academicYear,
          semester,
        }),
      
      clearSemester: () =>
        set({
          selectedSemester: null,
          academicYear: null,
          semester: null,
        }),
    }),
    {
      name: "semester-selection", // localStorage key
    }
  )
);
