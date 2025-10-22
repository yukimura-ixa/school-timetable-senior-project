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
import type {} from '@redux-devtools/extension'; // Required for devtools typing
import type { SubjectData, TimeslotData } from '@/types';
import type { class_schedule } from '@prisma/client';

// ============================================================================
// Type Definitions
// ============================================================================

// SubjectData and TimeslotData imported from @/types

/**
 * Teacher data structure
 */
export interface TeacherData {
  TeacherID: number | null;
  Firstname: string;
  Lastname: string;
  Prefix: string;
  Department: string;
  Email: string;
  Role: string;
}

/**
 * Time slot change payload
 */
export interface TimeslotChange {
  source: string;
  destination: string;
}

/**
 * Subject addition payload for modal
 */
export interface SubjectPayload {
  timeslotID: string;
  selectedSubject: SubjectData;
}

/**
 * Error display state by timeslot
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
  teacherData: TeacherData;

  // === Subject Selection & Dragging ===
  selectedSubject: SubjectData;
  draggedSubject: SubjectData | null;
  yearSelected: number | null;

  // === Subject Change/Swap Operations ===
  changeTimeSlotSubject: SubjectData;
  destinationSubject: SubjectData;
  timeslotIDtoChange: TimeslotChange;
  isCilckToChangeSubject: boolean;

  // === Subject Data ===
  subjectData: SubjectData[];
  scheduledSubjects: SubjectData[];

  // === Timeslot Data ===
  timeSlotData: {
    AllData: TimeslotData[];
    SlotAmount: number[];
    DayOfWeek: Array<{ Day: string; TextColor: string; BgColor: string }>;
    BreakSlot: Array<{ TimeslotID: string; Breaktime: string; SlotNumber: number }>;
  };
  lockData: class_schedule[];

  // === Modal State ===
  isActiveModal: boolean;
  subjectPayload: SubjectPayload;

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
}

// ============================================================================
// Store Actions Interface
// ============================================================================

interface ArrangementUIActions {
  // === Teacher Actions ===
  setCurrentTeacherID: (id: string | null) => void;
  setTeacherData: (data: TeacherData) => void;

  // === Subject Selection Actions ===
  setSelectedSubject: (subject: SubjectData) => void;
  setDraggedSubject: (subject: SubjectData | null) => void;
  setYearSelected: (year: number | null) => void;
  clearSelectedSubject: () => void;

  // === Subject Change Actions ===
  setChangeTimeSlotSubject: (subject: SubjectData) => void;
  setDestinationSubject: (subject: SubjectData) => void;
  setTimeslotIDtoChange: (change: TimeslotChange) => void;
  setIsCilckToChangeSubject: (isClicked: boolean) => void;
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
  teacherData: {
    TeacherID: null,
    Firstname: '',
    Lastname: '',
    Prefix: '',
    Department: '',
    Email: '',
    Role: 'teacher',
  },

  // Subject Selection
  selectedSubject: {},
  draggedSubject: null,
  yearSelected: null,

  // Subject Change
  changeTimeSlotSubject: {},
  destinationSubject: {},
  timeslotIDtoChange: { source: '', destination: '' },
  isCilckToChangeSubject: false,

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

  // Modal
  isActiveModal: false,
  subjectPayload: { timeslotID: '', selectedSubject: {} },

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
            yearSelected: subject.gradelevel?.Year || null,
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
            selectedSubject: {},
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

      setIsCilckToChangeSubject: (isClicked) =>
        set(
          { isCilckToChangeSubject: isClicked },
          undefined,
          'arrangement/setIsCilckToChangeSubject',
        ),

      clearChangeSubjectState: () =>
        set(
          {
            changeTimeSlotSubject: {},
            destinationSubject: {},
            timeslotIDtoChange: { source: '', destination: '' },
            isCilckToChangeSubject: false,
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
            subjectData: state.subjectData.filter((s) => s.SubjectCode !== subjectCode),
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
          { isActiveModal: false, subjectPayload: { timeslotID: '', selectedSubject: {} } },
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

      // === Reset Actions ===
      resetAllState: () => set(initialState, undefined, 'arrangement/resetAllState'),

      resetOnTeacherChange: () =>
        set(
          {
            selectedSubject: {},
            draggedSubject: null,
            yearSelected: null,
            changeTimeSlotSubject: {},
            destinationSubject: {},
            timeslotIDtoChange: { source: '', destination: '' },
            isCilckToChangeSubject: false,
            subjectPayload: { timeslotID: '', selectedSubject: {} },
            showErrorMsgByTimeslotID: {},
            showLockDataMsgByTimeslotID: {},
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
