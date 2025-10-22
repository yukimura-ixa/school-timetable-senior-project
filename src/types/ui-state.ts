/**
 * UI State Types
 * 
 * Type definitions for UI state management (Zustand stores, component state).
 * Replaces `any` types in arrangement-ui.store.ts and related components.
 * 
 * Created: Week 8 - Type Safety Improvements
 * Related: features/schedule-arrangement/presentation/stores/
 */

import type {
  room,
  gradelevel,
  timeslot,
  subject,
  class_schedule,
  day_of_week,
  semester,
  teachers_responsibility,
  teacher,
} from '@prisma/client';

// ============================================================================
// Subject Data (for Drag & Drop Operations)
// ============================================================================

/**
 * Subject data structure for drag and drop operations in timetable arrangement
 * Used in SubjectDragBox, SubjectItem, and arrangement store
 * Supports both PascalCase (database) and camelCase (component) field names
 */
export interface SubjectData {
  itemID?: number;
  SubjectCode?: string;
  SubjectName?: string;
  subjectCode?: string; // Alternative naming (component usage)
  subjectName?: string; // Alternative naming (component usage)
  credit?: number;
  remainingHours?: number;
  GradeID?: string;
  RoomName?: string | null;
  RoomID?: number | null;
  room?: room | null;
  ClassID?: string;
  teacherID?: number;
  gradelevel?: {
    Year: number;
    Number: number;
  };
  Scheduled?: boolean;
}

// ============================================================================
// Timeslot Data (with Optional Subject)
// ============================================================================

/**
 * Timeslot with optional subject assignment
 * Used in TimeSlot grid components
 */
export type TimeslotData = timeslot & {
  subject?: SubjectData;
};

/**
 * Complete timeslot data with all relations
 */
export type TimeslotWithRelations = timeslot & {
  class_schedule: (class_schedule & {
    subject: subject;
    room: room | null;
    gradelevel: gradelevel;
    teachers_responsibility: (teachers_responsibility & {
      teacher: teacher;
    })[];
  })[];
};

// ============================================================================
// Timeslot Grid Data
// ============================================================================

/**
 * Data structure for the timetable grid display
 * Used in TimeSlot components
 */
export interface TimeSlotGridData {
  /** Array of days of the week */
  DayOfWeek: day_of_week[];
  /** All timeslot data for the grid */
  AllData: TimeslotData[];
  /** Number of slots per day (e.g., [1, 2, 3, 4, 5, 6, 7, 8]) */
  SlotAmount: number[];
}

// ============================================================================
// Schedule Arrangement UI State
// ============================================================================

/**
 * Complete UI state for schedule arrangement page
 * Managed by arrangement-ui.store.ts (Zustand)
 */
export interface ArrangementUIState {
  // Subject/Assignment State
  subjectData: SubjectData[];
  selectedSubject: SubjectData | null;
  storeSelectedSubject: SubjectData | null;

  // Timeslot Grid State
  timeSlotData: TimeSlotGridData;

  // Grade Selection
  selectedGradeID: string | null;
  gradeList: gradelevel[];

  // Lock Data
  lockData: class_schedule[];

  // Loading States
  isLoading: boolean;
  isSaving: boolean;

  // Modal States
  isModalOpen: boolean;
  modalData: unknown | null;

  // Actions
  setSubjectData: (data: SubjectData[]) => void;
  setSelectedSubject: (subject: SubjectData | null) => void;
  setStoreSelectedSubject: (subject: SubjectData | null) => void;
  setTimeSlotData: (data: TimeSlotGridData) => void;
  setSelectedGradeID: (gradeID: string | null) => void;
  setGradeList: (grades: gradelevel[]) => void;
  setLockData: (data: class_schedule[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setModalOpen: (open: boolean) => void;
  setModalData: (data: unknown | null) => void;
  resetState: () => void;
}

// ============================================================================
// Teacher Responsibility Data
// ============================================================================

/**
 * Teacher responsibility with relations for assignment page
 */
export type TeacherResponsibilityWithRelations = teachers_responsibility & {
  teacher: teacher;
  gradelevel: gradelevel;
  subject: subject;
};

/**
 * Teacher responsibility form data
 */
export interface TeacherResponsibilityFormData {
  TeacherID: number;
  GradeID: string;
  SubjectCode: string;
  AcademicYear: number;
  Semester: semester;
  TeachHour: number;
}

// ============================================================================
// Schedule Summary Data
// ============================================================================

/**
 * Class schedule summary for dashboard
 */
export interface ClassScheduleSummary {
  GradeID: string;
  GradeName: string;
  TotalSubjects: number;
  ScheduledSubjects: number;
  UnscheduledSubjects: number;
  TotalHours: number;
  ScheduledHours: number;
  CompletionPercentage: number;
}

/**
 * Teacher schedule summary
 */
export interface TeacherScheduleSummary {
  TeacherID: number;
  TeacherName: string;
  Department: string;
  TotalAssignedHours: number;
  ScheduledHours: number;
  UnscheduledHours: number;
  Subjects: {
    SubjectCode: string;
    SubjectName: string;
    GradeID: string;
    Hours: number;
  }[];
}

// ============================================================================
// Timetable Configuration
// ============================================================================

/**
 * Timetable configuration data
 */
export interface TimetableConfig {
  ConfigID: string;
  AcademicYear: number;
  Semester: semester;
  PeriodsPerDay: number;
  StartTime: string; // HH:mm format
  PeriodDuration: number; // minutes
  BreakDuration: number; // minutes
  DaysOfWeek: day_of_week[];
  Config: {
    periodsPerDay: number;
    startTime: string;
    periodDuration: number;
    breakAfterPeriod: number[];
    breakDuration: number;
    daysOfWeek: day_of_week[];
  };
}

/**
 * Form data for creating/cloning timetable configuration
 */
export interface TimetableConfigFormData {
  AcademicYear: number;
  Semester: semester;
  PeriodsPerDay: number;
  StartTime: string;
  PeriodDuration: number;
  BreakAfterPeriod: number[];
  BreakDuration: number;
  DaysOfWeek: day_of_week[];
}

// ============================================================================
// Dropdown/Select Component Data
// ============================================================================

/**
 * Generic select option
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Teacher select option with additional data
 */
export interface TeacherSelectOption extends SelectOption<number> {
  department: string;
  email: string;
}

/**
 * Room select option with building/floor
 */
export interface RoomSelectOption extends SelectOption<number> {
  building: string;
  floor: string;
}

/**
 * Subject select option with category
 */
export interface SubjectSelectOption extends SelectOption<string> {
  category: string;
  credit: number;
}

// ============================================================================
// Drag & Drop Types
// ============================================================================

/**
 * Drag source data (from @dnd-kit)
 */
export interface DragSourceData {
  type: 'SUBJECT' | 'TIMESLOT';
  id: string | number;
  data: SubjectData | TimeslotData;
}

/**
 * Drop target data
 */
export interface DropTargetData {
  type: 'TIMESLOT' | 'SUBJECT_BOX';
  id: string;
  accepts: ('SUBJECT' | 'TIMESLOT')[];
}

/**
 * Drag event data
 */
export interface DragEventData {
  active: DragSourceData;
  over: DropTargetData | null;
}

// ============================================================================
// Filter/Search State
// ============================================================================

/**
 * Search/filter state for various pages
 */
export interface FilterState {
  searchTerm: string;
  selectedGrade: string | null;
  selectedDepartment: string | null;
  selectedSubject: string | null;
  selectedTeacher: number | null;
  showLockedOnly: boolean;
  showUnscheduledOnly: boolean;
}

// ============================================================================
// Pagination State
// ============================================================================

/**
 * Pagination state for tables
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationState;
}
