/**
 * Schedule Arrangement UI Store
 * 
 * Manages all UI state for the teacher/student schedule arrangement pages.
 * Replaces 34+ useState hooks with centralized Zustand state management.
 * 
 * Created: Week 5 - Phase 2 Refactoring
 * Pattern: Zustand store with devtools middleware
 * Related Docs: Context7 Zustand v5.0.8
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { class_schedule, teacher } from '@/prisma/generated';

// Phase 1: Import strict types from schedule.types.ts
import type {
  SubjectData,
  TimeslotData,
  SubjectPayload,
  TimeslotChange,
  BreakSlotData,
  DayOfWeekDisplay,
} from '@/types/schedule.types';

// ============================================================================
// Type Definitions (imported from schedule.types.ts)
// ============================================================================

// Phase 1: All main types imported from @/types/schedule.types
// Local definitions removed to avoid conflicts

/**
 * Error display state by timeslot
 * Legacy type - TODO: migrate to TimeslotErrorState from schedule.types.ts
 */
export interface ErrorState {
  [timeslotID: string]: boolean;
}

// ============================================================================
// Store State Interface
// ============================================================================

interface ArrangementUIState {
  // === Teacher Selection ===
  currentTeacherID: string | null;
  teacherData: teacher | null;

  // === Subject Selection & Dragging ===
  selectedSubject: SubjectData | null; // Changed from non-null to nullable
  draggedSubject: SubjectData | null;
  yearSelected: number | null;

  // === Subject Change/Swap Operations ===
  changeTimeSlotSubject: SubjectData | null; // Changed from non-null to nullable
  destinationSubject: SubjectData | null; // Changed from non-null to nullable
  timeslotIDtoChange: TimeslotChange;
  isClickToChangeSubject: boolean; // Fixed typo: was isCilckToChangeSubject

  // === Subject Data ===
  subjectData: SubjectData[];
  scheduledSubjects: SubjectData[];

  // === Timeslot Data ===
  timeSlotData: {
    AllData: TimeslotData[];
    SlotAmount: number[];
    DayOfWeek: DayOfWeekDisplay[]; // Use proper type
    BreakSlot: BreakSlotData[]; // Use proper type
  };
  lockData: class_schedule[];

  // === Modal State ===
  isActiveModal: boolean;
  subjectPayload: SubjectPayload | null; // Changed to nullable

  // === Error & Lock Display ===
  showErrorMsgByTimeslotID: ErrorState;
  showLockDataMsgByTimeslotID: ErrorState;

  // === Save State ===
  isSaving: boolean;

  // === Filters (for future use) ===
  filters: {
    academicYear: number | null;
    semester: string | null;
    gradeLevel: string | null;
  };

  // === History Stack (Undo/Redo) ===
  history: {
    past: SubjectData[][];
    present: SubjectData[];
    future: SubjectData[][];
  };
}

// ============================================================================
// Store Actions Interface
// ============================================================================

interface ArrangementUIActions {
  // === Teacher Actions ===
  setCurrentTeacherID: (id: string | null) => void;
  setTeacherData: (data: teacher | null) => void;

  // === Subject Selection Actions ===
  setSelectedSubject: (subject: SubjectData | null) => void;
  setDraggedSubject: (subject: SubjectData | null) => void;
  setYearSelected: (year: number | null) => void;
  clearSelectedSubject: () => void;

  // === Subject Change Actions ===
  setChangeTimeSlotSubject: (subject: SubjectData | null) => void;
  setDestinationSubject: (subject: SubjectData | null) => void;
  setTimeslotIDtoChange: (change: TimeslotChange) => void;
  setIsClickToChangeSubject: (isClicked: boolean) => void;
  clearChangeSubjectState: () => void;

  // === Subject Data Actions ===
  setSubjectData: (data: SubjectData[]) => void;
  setScheduledSubjects: (subjects: SubjectData[]) => void;
  addSubjectToData: (subject: SubjectData) => void;
  removeSubjectFromData: (subjectCode: string) => void;

  // === Timeslot Actions ===
  setTimeSlotData: (data: Partial<ArrangementUIState['timeSlotData']>) => void;
  updateTimeslotSubject: (timeslotID: string, subject: SubjectData) => void;
  setLockData: (data: class_schedule[]) => void;

  // === Modal Actions ===
  openModal: (payload: SubjectPayload) => void;
  closeModal: () => void;
  setSubjectPayload: (payload: SubjectPayload) => void;

  // === Error Display Actions ===
  setShowErrorMsg: (timeslotID: string, show: boolean) => void;
  setShowLockDataMsg: (timeslotID: string, show: boolean) => void;
  clearErrorMessages: () => void;

  // === Save State Actions ===
  setIsSaving: (saving: boolean) => void;

  // === Filter Actions ===
  setFilters: (filters: Partial<ArrangementUIState['filters']>) => void;

  // === History Actions (Undo/Redo) ===
  pushHistory: (scheduledSubjects: SubjectData[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;

  // === Reset Actions ===
  resetAllState: () => void;
  resetOnTeacherChange: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: ArrangementUIState = {
  // Teacher
  currentTeacherID: null,
  teacherData: null,

  // Subject Selection - now properly null
  selectedSubject: null,
  draggedSubject: null,
  yearSelected: null,

  // Subject Change - now properly null
  changeTimeSlotSubject: null,
  destinationSubject: null,
  timeslotIDtoChange: { source: '', destination: '' },
  isClickToChangeSubject: false, // Fixed typo

  // Subject Data
  subjectData: [],
  scheduledSubjects: [],

  // Timeslot Data
  timeSlotData: {
    AllData: [],
    SlotAmount: [],
    DayOfWeek: [],
    BreakSlot: [],
  },
  lockData: [],

  // Modal - now properly null
  isActiveModal: false,
  subjectPayload: null,

  // Error Display
  showErrorMsgByTimeslotID: {},
  showLockDataMsgByTimeslotID: {},

  // Save State
  isSaving: false,

  // Filters
  filters: {
    academicYear: null,
    semester: null,
    gradeLevel: null,
  },

  // History Stack
  history: {
    past: [],
    present: [],
    future: [],
  },
};

// ============================================================================
// Store Creation
// ============================================================================

type ArrangementUIStore = ArrangementUIState & ArrangementUIActions;

export const useArrangementUIStore = create<ArrangementUIStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // === Teacher Actions ===
      setCurrentTeacherID: (id) =>
        set({ currentTeacherID: id }, undefined, 'arrangement/setCurrentTeacherID'),

      setTeacherData: (data) =>
        set({ teacherData: data }, undefined, 'arrangement/setTeacherData'),

      // === Subject Selection Actions ===
      setSelectedSubject: (subject) =>
        set(
          {
            selectedSubject: subject,
            yearSelected: subject?.gradelevel?.year || null, // Fixed casing: Year -> year
          },
          undefined,
          'arrangement/setSelectedSubject',
        ),

      setDraggedSubject: (subject) =>
        set({ draggedSubject: subject }, undefined, 'arrangement/setDraggedSubject'),

      setYearSelected: (year) =>
        set({ yearSelected: year }, undefined, 'arrangement/setYearSelected'),

      clearSelectedSubject: () =>
        set(
          {
            selectedSubject: null,
            draggedSubject: null,
            yearSelected: null,
          },
          undefined,
          'arrangement/clearSelectedSubject',
        ),

      // === Subject Change Actions ===
      setChangeTimeSlotSubject: (subject) =>
        set(
          { changeTimeSlotSubject: subject },
          undefined,
          'arrangement/setChangeTimeSlotSubject',
        ),

      setDestinationSubject: (subject) =>
        set({ destinationSubject: subject }, undefined, 'arrangement/setDestinationSubject'),

      setTimeslotIDtoChange: (change) =>
        set({ timeslotIDtoChange: change }, undefined, 'arrangement/setTimeslotIDtoChange'),

      setIsClickToChangeSubject: (isClicked: boolean) => // Fixed typo, added type
        set(
          { isClickToChangeSubject: isClicked },
          undefined,
          'arrangement/setIsClickToChangeSubject',
        ),

      clearChangeSubjectState: () =>
        set(
          {
            changeTimeSlotSubject: null,
            destinationSubject: null,
            timeslotIDtoChange: { source: '', destination: '' },
            isClickToChangeSubject: false, // Fixed typo
          },
          undefined,
          'arrangement/clearChangeSubjectState',
        ),

      // === Subject Data Actions ===
      setSubjectData: (data) =>
        set({ subjectData: data }, undefined, 'arrangement/setSubjectData'),

      setScheduledSubjects: (subjects) =>
        set({ scheduledSubjects: subjects }, undefined, 'arrangement/setScheduledSubjects'),

      addSubjectToData: (subject) =>
        set(
          (state) => ({
            subjectData: [...state.subjectData, subject],
          }),
          undefined,
          'arrangement/addSubjectToData',
        ),

      removeSubjectFromData: (subjectCode) =>
        set(
          (state) => ({
            subjectData: state.subjectData.filter((s) => s.subjectCode !== subjectCode), // Fixed casing
          }),
          undefined,
          'arrangement/removeSubjectFromData',
        ),

      // === Timeslot Actions ===
      setTimeSlotData: (data) =>
        set(
          (state) => ({
            timeSlotData: { ...state.timeSlotData, ...data },
          }),
          undefined,
          'arrangement/setTimeSlotData',
        ),

      updateTimeslotSubject: (timeslotID, subject) =>
        set(
          (state) => ({
            timeSlotData: {
              ...state.timeSlotData,
              AllData: state.timeSlotData.AllData.map((slot) =>
                slot.TimeslotID === timeslotID ? { ...slot, subject } : slot,
              ),
            },
          }),
          undefined,
          'arrangement/updateTimeslotSubject',
        ),

      setLockData: (data) => set({ lockData: data }, undefined, 'arrangement/setLockData'),

      // === Modal Actions ===
      openModal: (payload) =>
        set(
          { isActiveModal: true, subjectPayload: payload },
          undefined,
          'arrangement/openModal',
        ),

      closeModal: () =>
        set(
          { isActiveModal: false, subjectPayload: null }, // Fixed: use null instead of empty object
          undefined,
          'arrangement/closeModal',
        ),

      setSubjectPayload: (payload) =>
        set({ subjectPayload: payload }, undefined, 'arrangement/setSubjectPayload'),

      // === Error Display Actions ===
      setShowErrorMsg: (timeslotID, show) =>
        set(
          (state) => ({
            showErrorMsgByTimeslotID: {
              ...state.showErrorMsgByTimeslotID,
              [timeslotID]: show,
            },
          }),
          undefined,
          'arrangement/setShowErrorMsg',
        ),

      setShowLockDataMsg: (timeslotID, show) =>
        set(
          (state) => ({
            showLockDataMsgByTimeslotID: {
              ...state.showLockDataMsgByTimeslotID,
              [timeslotID]: show,
            },
          }),
          undefined,
          'arrangement/setShowLockDataMsg',
        ),

      clearErrorMessages: () =>
        set(
          {
            showErrorMsgByTimeslotID: {},
            showLockDataMsgByTimeslotID: {},
          },
          undefined,
          'arrangement/clearErrorMessages',
        ),

      // === Save State Actions ===
      setIsSaving: (saving) => set({ isSaving: saving }, undefined, 'arrangement/setIsSaving'),

      // === Filter Actions ===
      setFilters: (filters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...filters },
          }),
          undefined,
          'arrangement/setFilters',
        ),

      // === History Actions (Undo/Redo) ===
      pushHistory: (scheduledSubjects) =>
        set(
          (state) => ({
            history: {
              past: [...state.history.past, state.history.present],
              present: scheduledSubjects,
              future: [], // Clear future when new action is performed
            },
            scheduledSubjects,
          }),
          undefined,
          'arrangement/pushHistory',
        ),

      undo: () =>
        set(
          (state) => {
            const { past, present, future } = state.history;
            if (past.length === 0) return state;

            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);

            return {
              history: {
                past: newPast,
                present: previous,
                future: [present, ...future],
              },
              scheduledSubjects: previous,
            };
          },
          undefined,
          'arrangement/undo',
        ),

      redo: () =>
        set(
          (state) => {
            const { past, present, future } = state.history;
            if (future.length === 0) return state;

            const next = future[0];
            const newFuture = future.slice(1);

            return {
              history: {
                past: [...past, present],
                present: next,
                future: newFuture,
              },
              scheduledSubjects: next,
            };
          },
          undefined,
          'arrangement/redo',
        ),

      canUndo: () => {
        const state = get();
        return state.history.past.length > 0;
      },

      canRedo: () => {
        const state = get();
        return state.history.future.length > 0;
      },

      clearHistory: () =>
        set(
          {
            history: {
              past: [],
              present: [],
              future: [],
            },
          },
          undefined,
          'arrangement/clearHistory',
        ),

      // === Reset Actions ===
      resetAllState: () => set(initialState, undefined, 'arrangement/resetAllState'),

      resetOnTeacherChange: () =>
        set(
          {
            selectedSubject: null, // Fixed: use null
            draggedSubject: null,
            yearSelected: null,
            changeTimeSlotSubject: null, // Fixed: use null
            destinationSubject: null, // Fixed: use null
            timeslotIDtoChange: { source: '', destination: '' },
            isClickToChangeSubject: false, // Fixed typo
            subjectPayload: null, // Fixed: use null
            showErrorMsgByTimeslotID: {},
            showLockDataMsgByTimeslotID: {},
            history: {
              past: [],
              present: [],
              future: [],
            },
          },
          undefined,
          'arrangement/resetOnTeacherChange',
        ),
    }),
    { name: 'arrangement-ui-store' },
  ),
);

// ============================================================================
// Selector Hooks (Optional - for better performance)
// ============================================================================

/**
 * Example selector hooks for optimized component re-renders
 * Use these instead of selecting the entire store when you only need specific values
 */

export const useCurrentTeacher = () =>
  useArrangementUIStore((state) => ({
    id: state.currentTeacherID,
    data: state.teacherData,
  }));

export const useSelectedSubject = () =>
  useArrangementUIStore((state) => state.selectedSubject);

export const useTimeslotData = () => useArrangementUIStore((state) => state.timeSlotData);

export const useModalState = () =>
  useArrangementUIStore((state) => ({
    isOpen: state.isActiveModal,
    payload: state.subjectPayload,
  }));

export const useSaveState = () => useArrangementUIStore((state) => state.isSaving);
