/**
 * Schedule Arrangement Type Definitions
 *
 * Strict type definitions for schedule arrangement features.
 * Replaces unsafe 'any' types and consolidates schedule-related types.
 *
 * Phase 1: Type Safety Refactoring
 * Created: October 30, 2025
 */

import type {
  room,
  gradelevel,
  timeslot,
  subject,
  class_schedule,
  day_of_week,
  teachers_responsibility,
  teacher,
} from "@/prisma/generated/client";

// ============================================================================
// Subject Category Enum
// ============================================================================

/**
 * Subject category types based on Thai education system
 */
export type SubjectCategory = "CORE" | "ADDITIONAL" | "ACTIVITY";

// ============================================================================
// Subject Data (for Drag & Drop Operations)
// ============================================================================

/**
 * Subject data structure for drag and drop operations in timetable arrangement.
 * Uses consistent camelCase naming (database fields remain as-is from Prisma).
 *
 * Required fields must always be present; optional fields marked with '?'.
 */
export interface SubjectData {
  // Core identification (required)
  itemID: number;
  subjectCode: string;
  subjectName: string;
  gradeID: string;
  teacherID: number;
  category: SubjectCategory;

  // Teaching hours (required for scheduling logic)
  credit: number;
  teachHour: number; // Weekly teaching hours from teachers_responsibility

  // Optional scheduling data
  remainingHours?: number;
  scheduled?: boolean;

  // Room assignment (optional, assigned during arrangement)
  roomID?: number | null;
  roomName?: string | null;
  room?: room | null;

  // Class context
  classID?: string;

  // Related data
  gradelevel?: {
    year: number;
    number: number;
  };
}

/**
 * Partial subject data for display purposes (e.g., in palette)
 * When not all fields are available yet
 */
export interface PartialSubjectData {
  itemID?: number;
  subjectCode?: string;
  subjectName?: string;
  gradeID?: string;
  category?: SubjectCategory;
  remainingHours?: number;
  scheduled?: boolean;
}

// ============================================================================
// Timeslot Data
// ============================================================================

/**
 * Timeslot with optional subject assignment
 * Used in TimeSlot grid components for drag-and-drop operations
 */
export interface TimeslotData extends timeslot {
  subject?: SubjectData | null;
}

/**
 * Complete timeslot data with all Prisma relations loaded
 * Used when fetching full schedule data from database
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
// Break Slot Data
// ============================================================================

/**
 * Break time slot information
 */
export interface BreakSlotData {
  timeslotID: string;
  breaktime: string;
  slotNumber: number;
}

// ============================================================================
// Day of Week Display Data
// ============================================================================

/**
 * Day of week with display styling
 */
export type DayOfWeekDisplay = {
  day_of_week: day_of_week;
  textColor: string;
  bgColor: string;
};

// ============================================================================
// Timeslot Grid Data
// ============================================================================

/**
 * Complete data structure for timetable grid display
 * Used in TimeSlot components to render the grid
 */
export interface TimeSlotGridData {
  /** All timeslot data for the grid */
  allData: TimeslotData[];

  /** Number of slots per day (e.g., [1, 2, 3, 4, 5, 6, 7, 8]) */
  slotAmount: number[];

  /** Days of the week with styling */
  daysOfWeek: DayOfWeekDisplay[];

  /** Break time slots */
  breakSlots: BreakSlotData[];
}

// ============================================================================
// Teacher Data
// ============================================================================

/**
 * Teacher information for schedule arrangement
 */
export interface TeacherData {
  teacherID: number;
  firstname: string;
  lastname: string;
  prefix: string;
  department: string;
  email: string;
  role: string;
}

// ============================================================================
// Timeslot Change Operations
// ============================================================================

/**
 * Time slot change/swap operation payload
 */
export interface TimeslotChange {
  source: string; // Source timeslot ID
  destination: string; // Destination timeslot ID
}

/**
 * Subject addition payload for modal operations
 */
export interface SubjectPayload {
  timeslotID: string;
  selectedSubject: SubjectData;
}

// ============================================================================
// Drag and Drop Types
// ============================================================================

/**
 * Drag source data structure
 */
export interface DragSourceData {
  type: "subject" | "timeslot";
  subject?: SubjectData;
  timeslotID?: string;
}

/**
 * Drop target data structure
 */
export interface DropTargetData {
  type: "timeslot";
  timeslotID: string;
  item: TimeslotData;
}

// ============================================================================
// Error and Lock State
// ============================================================================

/**
 * Error/lock display state by timeslot ID
 * Use Set for better performance with many timeslots
 */
export type TimeslotErrorState = Set<string>;

/**
 * Alternative object-based error state (legacy compatibility)
 */
export interface TimeslotErrorStateMap {
  [timeslotID: string]: boolean;
}

// ============================================================================
// Callback Function Types
// ============================================================================

/**
 * Callback function type definitions for schedule operations
 * Replace generic 'Function' type with specific signatures
 */

export type CheckBreakTimeCallback = (breaktime: string | null) => boolean;

export type IsSelectedToAddCallback = () => boolean;

export type IsSelectedToChangeCallback = () => boolean;

export type TimeSlotCssClassNameCallback = (
  subject: SubjectData | null,
  isBreakTime: boolean,
  isLocked: boolean,
) => string;

export type AddRoomModalCallback = (payload: SubjectPayload) => void;

export type ClickOrDragToChangeCallback = (
  sourceID: string,
  destID: string,
) => void;

export type RemoveSubjectCallback = (timeslotID: string) => void;

export type DisplayErrorChangeSubjectCallback = (error: string) => void;

export type SetErrorStateCallback = (timeslotID: string, show: boolean) => void;

// ============================================================================
// Store Action Types
// ============================================================================

/**
 * Store action function signatures
 * These should be in the store, not passed as props
 */
export interface ScheduleStoreActions {
  // Subject selection
  setSelectedSubject: (subject: SubjectData | null) => void;
  clearSelectedSubject: () => void;

  // Timeslot operations
  addSubjectToTimeslot: (timeslotID: string, subject: SubjectData) => void;
  removeSubjectFromTimeslot: (timeslotID: string) => void;
  swapTimeslots: (sourceID: string, destinationID: string) => void;

  // Modal state
  openAddRoomModal: (payload: SubjectPayload) => void;
  closeModal: () => void;

  // Error handling
  showError: (timeslotID: string) => void;
  hideError: (timeslotID: string) => void;
  clearAllErrors: () => void;

  // Save operations
  saveSchedule: () => Promise<void>;
  resetSchedule: () => void;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for TimeslotCell component (reduced from 18 to essential props)
 * Most logic should be handled by store/hooks
 */
export interface TimeslotCellProps {
  item: TimeslotData;
  index: number;

  // Optional props for special rendering
  showError?: boolean;
  showLockMessage?: boolean;
  isChangeMode?: boolean;
}

/**
 * Props for TimeSlot grid component
 */
export interface TimeSlotProps {
  gridData: TimeSlotGridData;
  lockData?: class_schedule[];
  onTimeslotClick?: (timeslotID: string) => void;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * API response type for schedule data
 */
export interface ScheduleDataResponse {
  subjects: SubjectData[];
  timeslots: TimeslotData[];
  lockData: class_schedule[];
  config: {
    periodsPerDay: number;
    daysPerWeek: number;
  };
}

/**
 * Save schedule response
 */
export interface SaveScheduleResponse {
  success: boolean;
  message: string;
  errors?: Array<{
    timeslotID: string;
    error: string;
  }>;
}

// ============================================================================
// Utility Type Guards
// ============================================================================

/**
 * Type guard to check if subject data is complete
 */
export function isCompleteSubjectData(
  subject: Partial<SubjectData>,
): subject is SubjectData {
  return !!(
    subject.itemID &&
    subject.subjectCode &&
    subject.subjectName &&
    subject.gradeID &&
    subject.teacherID &&
    subject.category &&
    typeof subject.credit === "number" &&
    typeof subject.teachHour === "number"
  );
}

/**
 * Type guard to check if timeslot has subject assigned
 */
export function hasSubjectAssigned(
  timeslot: TimeslotData,
): timeslot is TimeslotData & { subject: SubjectData } {
  return !!timeslot.subject && isCompleteSubjectData(timeslot.subject);
}

/**
 * Type guard for break time check
 */
export function isBreakTime(breaktime: string | null): breaktime is string {
  return breaktime !== null && breaktime.trim().length > 0;
}
