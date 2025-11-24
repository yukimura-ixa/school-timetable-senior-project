/**
 * Presentation Layer: Teacher Selection Store Slice
 *
 * Manages teacher selection and filtering state.
 * Part of the refactored arrangement store architecture.
 *
 * @module teacher-selection.slice
 */

import type { StateCreator } from "zustand";

// ============================================================================
// TYPES
// ============================================================================

export interface TeacherData {
  TeacherID: number | null;
  Firstname: string;
  Lastname: string;
  Prefix: string;
  Department: string;
  Email: string;
  Role: string;
}

export interface TeacherSelectionState {
  // Current selected teacher
  currentTeacherID: string | null;
  teacherData: TeacherData;

  // Teacher list for selection
  availableTeachers: TeacherData[];

  // Loading state
  isLoadingTeachers: boolean;
}

export interface TeacherSelectionActions {
  setCurrentTeacherID: (id: string | null) => void;
  setTeacherData: (data: TeacherData) => void;
  setAvailableTeachers: (teachers: TeacherData[]) => void;
  setIsLoadingTeachers: (isLoading: boolean) => void;
  clearTeacherSelection: () => void;
}

export type TeacherSelectionSlice = TeacherSelectionState &
  TeacherSelectionActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialTeacherData: TeacherData = {
  TeacherID: null,
  Firstname: "",
  Lastname: "",
  Prefix: "",
  Department: "",
  Email: "",
  Role: "",
};

const initialState: TeacherSelectionState = {
  currentTeacherID: null,
  teacherData: initialTeacherData,
  availableTeachers: [],
  isLoadingTeachers: false,
};

// ============================================================================
// SLICE CREATOR
// ============================================================================

export const createTeacherSelectionSlice: StateCreator<
  TeacherSelectionSlice,
  [],
  [],
  TeacherSelectionSlice
> = (set) => ({
  ...initialState,

  setCurrentTeacherID: (id) => set({ currentTeacherID: id }),

  setTeacherData: (data) => set({ teacherData: data }),

  setAvailableTeachers: (teachers) => set({ availableTeachers: teachers }),

  setIsLoadingTeachers: (isLoading) => set({ isLoadingTeachers: isLoading }),

  clearTeacherSelection: () =>
    set({
      currentTeacherID: null,
      teacherData: initialTeacherData,
    }),
});

// ============================================================================
// SELECTORS
// ============================================================================

export const selectCurrentTeacher = (state: TeacherSelectionSlice) => ({
  id: state.currentTeacherID,
  data: state.teacherData,
});

export const selectAvailableTeachers = (state: TeacherSelectionSlice) =>
  state.availableTeachers;

export const selectIsLoadingTeachers = (state: TeacherSelectionSlice) =>
  state.isLoadingTeachers;
