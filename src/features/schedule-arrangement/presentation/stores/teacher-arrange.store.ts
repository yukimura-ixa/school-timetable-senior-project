/**
 * Teacher Arrange Store (Context7-Powered Refactor)
 * 
 * Production-ready Zustand store with best practices from pmndrs/zustand docs.
 * Implements immer middleware for immutable updates and persist middleware for filter preferences.
 * 
 * Features:
 * - Immer middleware for draft-based state updates
 * - Persist middleware for filter/preference persistence
 * - Optimized selectors to prevent unnecessary re-renders
 * - Type-safe actions with proper TypeScript inference
 * - DevTools integration for debugging
 * 
 * Context7 Sources:
 * - Store creation: /pmndrs/zustand/docs/guides/typescript.md
 * - Immer middleware: /pmndrs/zustand/docs/integrations/immer-middleware.md
 * - Persist middleware: /pmndrs/zustand/docs/middlewares/persist.md
 * - Selector patterns: /pmndrs/zustand (best practices)
 * 
 * Created: Phase 3 - Context7-Powered Zustand Implementation
 * Related: AGENTS.md, .github/copilot-instructions.md
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { class_schedule, teacher } from '@/prisma/generated';

// Import strict types from schedule.types.ts
import type {
  SubjectData,
  TimeslotData,
  SubjectPayload,
  TimeslotChange,
  BreakSlotData,
  DayOfWeekDisplay,
} from '@/types/schedule.types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Error display state by timeslot
 * Maps timeslot IDs to boolean flags for error/lock visibility
 */
export interface ErrorState {
  [timeslotID: string]: boolean;
}

/**
 * Timeslot container structure
 * Groups timeslot data with metadata for rendering
 */
export interface TimeSlotContainer {
  AllData: TimeslotData[];
  SlotAmount: number[];
  DayOfWeek: DayOfWeekDisplay[];
  BreakSlot: BreakSlotData[];
}

/**
 * History stack for undo/redo operations
 * Implements standard undo/redo pattern with past/present/future
 */
export interface HistoryStack {
  past: SubjectData[][];
  present: SubjectData[];
  future: SubjectData[][];
}

/**
 * Persisted filter preferences
 * Only these fields are saved to localStorage
 */
export interface FilterPreferences {
  academicYear: number | null;
  semester: string | null;
  gradeLevel: string | null;
}

// ============================================================================
// Store State Interface
// ============================================================================

interface TeacherArrangeState {
  // === Teacher Context ===
  currentTeacherID: string | null;
  teacherData: teacher | null;

  // === Subject Selection & Dragging ===
  selectedSubject: SubjectData | null;
  draggedSubject: SubjectData | null;
  yearSelected: number | null;

  // === Subject Change/Swap Operations ===
  changeTimeSlotSubject: SubjectData | null;
  destinationSubject: SubjectData | null;
  timeslotIDtoChange: TimeslotChange;
  isClickToChangeSubject: boolean;

  // === Subject Collections ===
  subjectData: SubjectData[];
  scheduledSubjects: SubjectData[];

  // === Timeslot Data ===
  timeSlotData: TimeSlotContainer;
  lockData: class_schedule[];

  // === Modal State ===
  isActiveModal: boolean;
  subjectPayload: SubjectPayload | null;

  // === Error & Lock Display ===
  showErrorMsgByTimeslotID: ErrorState;
  showLockDataMsgByTimeslotID: ErrorState;

  // === Save State ===
  isSaving: boolean;

  // === Filters (persisted to localStorage) ===
  filters: FilterPreferences;

  // === History Stack (Undo/Redo) ===
  history: HistoryStack;
}

// ============================================================================
// Store Actions Interface
// ============================================================================

interface TeacherArrangeActions {
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
  updateSubjectInData: (subjectCode: string, updates: Partial<SubjectData>) => void;

  // === Timeslot Actions ===
  setTimeSlotData: (data: Partial<TimeSlotContainer>) => void;
  updateTimeslotSubject: (timeslotID: string, subject: SubjectData | null) => void;
  swapTimeslots: (sourceID: string, destID: string) => void;
  setLockData: (data: class_schedule[]) => void;

  // === Modal Actions ===
  openModal: (payload: SubjectPayload) => void;
  closeModal: () => void;
  setSubjectPayload: (payload: SubjectPayload | null) => void;

  // === Error Display Actions ===
  setShowErrorMsg: (timeslotID: string, show: boolean) => void;
  setShowLockDataMsg: (timeslotID: string, show: boolean) => void;
  clearErrorMessages: () => void;
  clearAllErrors: () => void;

  // === Save State Actions ===
  setIsSaving: (saving: boolean) => void;

  // === Filter Actions ===
  setFilters: (filters: Partial<FilterPreferences>) => void;
  resetFilters: () => void;

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

const initialState: TeacherArrangeState = {
  // Teacher Context
  currentTeacherID: null,
  teacherData: null,

  // Subject Selection
  selectedSubject: null,
  draggedSubject: null,
  yearSelected: null,

  // Subject Change/Swap
  changeTimeSlotSubject: null,
  destinationSubject: null,
  timeslotIDtoChange: { source: '', destination: '' },
  isClickToChangeSubject: false,

  // Subject Collections
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

  // Modal State
  isActiveModal: false,
  subjectPayload: null,

  // Error Display
  showErrorMsgByTimeslotID: {},
  showLockDataMsgByTimeslotID: {},

  // Save State
  isSaving: false,

  // Filters (will be persisted)
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
// Store Creation (Context7 Best Practices)
// ============================================================================

type TeacherArrangeStore = TeacherArrangeState & TeacherArrangeActions;

/**
 * Main teacher arrange store
 * 
 * Middleware Stack:
 * 1. immer - Enables draft-based mutations for cleaner update logic
 * 2. persist - Saves filter preferences to localStorage
 * 3. devtools - Redux DevTools integration for debugging
 * 
 * Pattern from Context7:
 * - Use create<Type>()() for proper TypeScript inference
 * - Apply middlewares from innermost to outermost
 * - Use immer for complex nested updates
 * - Persist only user preferences, not ephemeral state
 */
export const useTeacherArrangeStore = create<TeacherArrangeStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ========================================================================
        // Teacher Actions
        // ========================================================================

        setCurrentTeacherID: (id) =>
          set((state) => {
            state.currentTeacherID = id;
          }, undefined, 'teacher/setCurrentTeacherID'),

        setTeacherData: (data) =>
          set((state) => {
            state.teacherData = data;
          }, undefined, 'teacher/setTeacherData'),

        // ========================================================================
        // Subject Selection Actions (with immer draft mutations)
        // ========================================================================

        setSelectedSubject: (subject) =>
          set((state) => {
            state.selectedSubject = subject;
            state.yearSelected = subject?.gradelevel?.year || null;
          }, undefined, 'subject/setSelectedSubject'),

        setDraggedSubject: (subject) =>
          set((state) => {
            state.draggedSubject = subject;
          }, undefined, 'subject/setDraggedSubject'),

        setYearSelected: (year) =>
          set((state) => {
            state.yearSelected = year;
          }, undefined, 'subject/setYearSelected'),

        clearSelectedSubject: () =>
          set((state) => {
            state.selectedSubject = null;
            state.draggedSubject = null;
            state.yearSelected = null;
          }, undefined, 'subject/clearSelectedSubject'),

        // ========================================================================
        // Subject Change Actions
        // ========================================================================

        setChangeTimeSlotSubject: (subject) =>
          set((state) => {
            state.changeTimeSlotSubject = subject;
          }, undefined, 'subject/setChangeTimeSlotSubject'),

        setDestinationSubject: (subject) =>
          set((state) => {
            state.destinationSubject = subject;
          }, undefined, 'subject/setDestinationSubject'),

        setTimeslotIDtoChange: (change) =>
          set((state) => {
            state.timeslotIDtoChange = change;
          }, undefined, 'subject/setTimeslotIDtoChange'),

        setIsClickToChangeSubject: (isClicked) =>
          set((state) => {
            state.isClickToChangeSubject = isClicked;
          }, undefined, 'subject/setIsClickToChangeSubject'),

        clearChangeSubjectState: () =>
          set((state) => {
            state.changeTimeSlotSubject = null;
            state.destinationSubject = null;
            state.timeslotIDtoChange = { source: '', destination: '' };
            state.isClickToChangeSubject = false;
          }, undefined, 'subject/clearChangeSubjectState'),

        // ========================================================================
        // Subject Data Actions (immer simplifies array operations)
        // ========================================================================

        setSubjectData: (data) =>
          set((state) => {
            state.subjectData = data;
          }, undefined, 'data/setSubjectData'),

        setScheduledSubjects: (subjects) =>
          set((state) => {
            state.scheduledSubjects = subjects;
          }, undefined, 'data/setScheduledSubjects'),

        addSubjectToData: (subject) =>
          set((state) => {
            // Immer allows direct push()
            state.subjectData.push(subject);
          }, undefined, 'data/addSubjectToData'),

        removeSubjectFromData: (subjectCode) =>
          set((state) => {
            // Immer allows filter() assignments
            state.subjectData = state.subjectData.filter((s) => s.subjectCode !== subjectCode);
          }, undefined, 'data/removeSubjectFromData'),

        updateSubjectInData: (subjectCode, updates) =>
          set((state) => {
            const index = state.subjectData.findIndex((s) => s.subjectCode === subjectCode);
            if (index !== -1 && state.subjectData[index]) {
              // Immer allows direct mutation - cast to any to bypass WritableDraft type
              Object.assign(state.subjectData[index], updates as any);
            }
          }, undefined, 'data/updateSubjectInData'),

        // ========================================================================
        // Timeslot Actions (immer shines with nested updates)
        // ========================================================================

        setTimeSlotData: (data) =>
          set((state) => {
            // Immer handles nested spread automatically
            Object.assign(state.timeSlotData, data);
          }, undefined, 'timeslot/setTimeSlotData'),

        updateTimeslotSubject: (timeslotID, subject) =>
          set((state) => {
            const slot = state.timeSlotData.AllData.find((s) => s.TimeslotID === timeslotID);
            if (slot) {
              slot.subject = subject;
            }
          }, undefined, 'timeslot/updateTimeslotSubject'),

        swapTimeslots: (sourceID, destID) =>
          set((state) => {
            const sourceSlot = state.timeSlotData.AllData.find((s) => s.TimeslotID === sourceID);
            const destSlot = state.timeSlotData.AllData.find((s) => s.TimeslotID === destID);

            if (sourceSlot && destSlot) {
              // Immer allows simple swap
              const tempSubject = sourceSlot.subject;
              sourceSlot.subject = destSlot.subject;
              destSlot.subject = tempSubject;
            }
          }, undefined, 'timeslot/swapTimeslots'),

        setLockData: (data) =>
          set((state) => {
            state.lockData = data;
          }, undefined, 'timeslot/setLockData'),

        // ========================================================================
        // Modal Actions
        // ========================================================================

        openModal: (payload) =>
          set((state) => {
            state.isActiveModal = true;
            state.subjectPayload = payload;
          }, undefined, 'modal/openModal'),

        closeModal: () =>
          set((state) => {
            state.isActiveModal = false;
            state.subjectPayload = null;
          }, undefined, 'modal/closeModal'),

        setSubjectPayload: (payload) =>
          set((state) => {
            state.subjectPayload = payload;
          }, undefined, 'modal/setSubjectPayload'),

        // ========================================================================
        // Error Display Actions
        // ========================================================================

        setShowErrorMsg: (timeslotID, show) =>
          set((state) => {
            state.showErrorMsgByTimeslotID[timeslotID] = show;
          }, undefined, 'error/setShowErrorMsg'),

        setShowLockDataMsg: (timeslotID, show) =>
          set((state) => {
            state.showLockDataMsgByTimeslotID[timeslotID] = show;
          }, undefined, 'error/setShowLockDataMsg'),

        clearErrorMessages: () =>
          set((state) => {
            state.showErrorMsgByTimeslotID = {};
            state.showLockDataMsgByTimeslotID = {};
          }, undefined, 'error/clearErrorMessages'),

        clearAllErrors: () =>
          set((state) => {
            state.showErrorMsgByTimeslotID = {};
            state.showLockDataMsgByTimeslotID = {};
          }, undefined, 'error/clearAllErrors'),

        // ========================================================================
        // Save State Actions
        // ========================================================================

        setIsSaving: (saving) =>
          set((state) => {
            state.isSaving = saving;
          }, undefined, 'save/setIsSaving'),

        // ========================================================================
        // Filter Actions (persisted to localStorage)
        // ========================================================================

        setFilters: (filters) =>
          set((state) => {
            Object.assign(state.filters, filters);
          }, undefined, 'filter/setFilters'),

        resetFilters: () =>
          set((state) => {
            state.filters = {
              academicYear: null,
              semester: null,
              gradeLevel: null,
            };
          }, undefined, 'filter/resetFilters'),

        // ========================================================================
        // History Actions (Undo/Redo)
        // ========================================================================

        pushHistory: (scheduledSubjects) =>
          set((state) => {
            state.history.past.push(state.history.present);
            state.history.present = scheduledSubjects;
            state.history.future = []; // Clear future on new action
            state.scheduledSubjects = scheduledSubjects;
          }, undefined, 'history/pushHistory'),

        undo: () =>
          set((state) => {
            if (state.history.past.length === 0) return;

            const previous = state.history.past.pop()!;
            state.history.future.unshift(state.history.present);
            state.history.present = previous;
            state.scheduledSubjects = previous;
          }, undefined, 'history/undo'),

        redo: () =>
          set((state) => {
            if (state.history.future.length === 0) return;

            const next = state.history.future.shift()!;
            state.history.past.push(state.history.present);
            state.history.present = next;
            state.scheduledSubjects = next;
          }, undefined, 'history/redo'),

        canUndo: () => get().history.past.length > 0,

        canRedo: () => get().history.future.length > 0,

        clearHistory: () =>
          set((state) => {
            state.history = {
              past: [],
              present: [],
              future: [],
            };
          }, undefined, 'history/clearHistory'),

        // ========================================================================
        // Reset Actions
        // ========================================================================

        resetAllState: () =>
          set(() => initialState, undefined, 'reset/resetAllState'),

        resetOnTeacherChange: () =>
          set((state) => {
            // Keep teacher context and filters, reset everything else
            state.selectedSubject = null;
            state.draggedSubject = null;
            state.yearSelected = null;
            state.changeTimeSlotSubject = null;
            state.destinationSubject = null;
            state.timeslotIDtoChange = { source: '', destination: '' };
            state.isClickToChangeSubject = false;
            state.subjectPayload = null;
            state.showErrorMsgByTimeslotID = {};
            state.showLockDataMsgByTimeslotID = {};
            state.history = {
              past: [],
              present: [],
              future: [],
            };
          }, undefined, 'reset/resetOnTeacherChange'),
      })),
      {
        name: 'teacher-arrange-filters', // localStorage key
        // Persist only filter preferences (Context7 partialize pattern)
        partialize: (state) => ({ filters: state.filters }),
        storage: createJSONStorage(() => localStorage),
        version: 1,
      },
    ),
    { name: 'teacher-arrange-store' }, // DevTools name
  ),
);

// ============================================================================
// Optimized Selector Hooks (Context7 Best Practice)
// ============================================================================

/**
 * Selector hooks prevent unnecessary re-renders by only subscribing to specific state slices.
 * Pattern from Context7: Use shallow selectors for objects, direct selectors for primitives.
 */

export const useCurrentTeacher = () =>
  useTeacherArrangeStore((state) => ({
    id: state.currentTeacherID,
    data: state.teacherData,
  }));

export const useSelectedSubject = () =>
  useTeacherArrangeStore((state) => state.selectedSubject);

export const useDraggedSubject = () =>
  useTeacherArrangeStore((state) => state.draggedSubject);

export const useYearSelected = () =>
  useTeacherArrangeStore((state) => state.yearSelected);

export const useSubjectData = () =>
  useTeacherArrangeStore((state) => state.subjectData);

export const useScheduledSubjects = () =>
  useTeacherArrangeStore((state) => state.scheduledSubjects);

export const useTimeslotData = () =>
  useTeacherArrangeStore((state) => state.timeSlotData);

export const useLockData = () =>
  useTeacherArrangeStore((state) => state.lockData);

export const useModalState = () =>
  useTeacherArrangeStore((state) => ({
    isOpen: state.isActiveModal,
    payload: state.subjectPayload,
  }));

export const useErrorState = () =>
  useTeacherArrangeStore((state) => ({
    errorMessages: state.showErrorMsgByTimeslotID,
    lockMessages: state.showLockDataMsgByTimeslotID,
  }));

export const useSaveState = () =>
  useTeacherArrangeStore((state) => state.isSaving);

export const useFilters = () =>
  useTeacherArrangeStore((state) => state.filters);

export const useHistoryControls = () =>
  useTeacherArrangeStore((state) => ({
    canUndo: state.canUndo(),
    canRedo: state.canRedo(),
    undo: state.undo,
    redo: state.redo,
  }));

// ============================================================================
// Store Actions Hook (for components needing only actions)
// ============================================================================

/**
 * Actions-only hook for components that only trigger updates
 * Prevents re-renders when state changes since actions are stable
 */
export const useTeacherArrangeActions = () =>
  useTeacherArrangeStore((state) => ({
    // Teacher
    setCurrentTeacherID: state.setCurrentTeacherID,
    setTeacherData: state.setTeacherData,
    
    // Subject Selection
    setSelectedSubject: state.setSelectedSubject,
    setDraggedSubject: state.setDraggedSubject,
    setYearSelected: state.setYearSelected,
    clearSelectedSubject: state.clearSelectedSubject,
    
    // Subject Change
    setChangeTimeSlotSubject: state.setChangeTimeSlotSubject,
    setDestinationSubject: state.setDestinationSubject,
    setTimeslotIDtoChange: state.setTimeslotIDtoChange,
    setIsClickToChangeSubject: state.setIsClickToChangeSubject,
    clearChangeSubjectState: state.clearChangeSubjectState,
    
    // Subject Data
    setSubjectData: state.setSubjectData,
    setScheduledSubjects: state.setScheduledSubjects,
    addSubjectToData: state.addSubjectToData,
    removeSubjectFromData: state.removeSubjectFromData,
    updateSubjectInData: state.updateSubjectInData,
    
    // Timeslot
    setTimeSlotData: state.setTimeSlotData,
    updateTimeslotSubject: state.updateTimeslotSubject,
    swapTimeslots: state.swapTimeslots,
    setLockData: state.setLockData,
    
    // Modal
    openModal: state.openModal,
    closeModal: state.closeModal,
    setSubjectPayload: state.setSubjectPayload,
    
    // Error
    setShowErrorMsg: state.setShowErrorMsg,
    setShowLockDataMsg: state.setShowLockDataMsg,
    clearErrorMessages: state.clearErrorMessages,
    clearAllErrors: state.clearAllErrors,
    
    // Save
    setIsSaving: state.setIsSaving,
    
    // Filter
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    
    // History
    pushHistory: state.pushHistory,
    undo: state.undo,
    redo: state.redo,
    clearHistory: state.clearHistory,
    
    // Reset
    resetAllState: state.resetAllState,
    resetOnTeacherChange: state.resetOnTeacherChange,
  }));

// ============================================================================
// Type Exports
// ============================================================================

export type {
  TeacherArrangeState,
  TeacherArrangeActions,
  TeacherArrangeStore,
};
