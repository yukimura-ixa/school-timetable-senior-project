/**
 * Lock Schedule Types
 * 
 * Type definitions for lock schedule operations (create, update, delete).
 * Used by lock schedule components and server actions.
 * 
 * Created: Week 8 - Type Safety Improvements
 * Related: src/app/schedule/[semesterAndyear]/lock/
 */

import type {
  class_schedule,
  subject,
  room,
  gradelevel,
  timeslot,
  teachers_responsibility,
  teacher,
  day_of_week,
  semester,
} from '@/prisma/generated';

// ============================================================================
// Extended Types (with relations)
// ============================================================================

/**
 * Subject with teacher responsibilities (for teacher assignment queries)
 */
export type SubjectWithResponsibilities = subject & {
  teachers_responsibility: teachers_responsibility[];
};

// ============================================================================
// Lock Schedule Form Data (User Input)
// ============================================================================

/**
 * Data structure for creating/editing a lock schedule
 * Used in LockScheduleForm, AddLockScheduleModal, EditLockScheduleModal
 * 
 * Note: Uses PascalCase field names to match database schema and component usage
 */
export interface LockScheduleFormData {
  /** Selected subject (for lock schedules like assembly) */
  Subject: subject;
  /** Day of week for the lock */
  DayOfWeek: string;
  /** Selected timeslot IDs (array of numbers) */
  timeSlotID: number[];
  /** Selected teacher list */
  Teachers: teacher[];
  /** Selected grade IDs */
  Grade: string[];
  /** Selected room name (null if no room required) */
  RoomName: string | null;
}

// ============================================================================
// Lock Schedule with Relations (Database Result)
// ============================================================================

/**
 * Complete lock schedule with all related entities
 * Returned from API endpoints and used in UI display
 */
export type LockSchedule = class_schedule & {
  subject: subject;
  room: room | null;
  gradelevel: gradelevel;
  timeslot: timeslot;
  teachers_responsibility: (teachers_responsibility & {
    teacher: teacher;
  })[];
};

/**
 * Extended lock schedule data with denormalized fields for UI display
 * Used in LockSchedule component list display
 */
export interface LockScheduleExtended {
  SubjectCode: string;
  GradeID: string;
  ClassID: string;
  TimeslotID: string;
  RoomID: number | null;
  IsLocked: boolean;
  // Denormalized/computed fields
  SubjectName: string;
  DayOfWeek: day_of_week;
  room: room | null;
  timeslots: timeslot[];
  GradeIDs: string[];
  teachers: teacher[];
}

/**
 * Simplified lock schedule for list display
 */
export interface LockScheduleListItem {
  ClassID: string;
  TimeslotID: string;
  SubjectCode: string;
  SubjectName: string;
  RoomID: number | null;
  RoomName: string | null;
  GradeID: string;
  IsLocked: boolean;
  DayOfWeek: day_of_week;
  StartTime: string;
  EndTime: string;
  Teachers: {
    TeacherID: number;
    Name: string;
  }[];
}

// ============================================================================
// Lock Schedule Modal Props
// ============================================================================

export interface AddLockScheduleModalProps {
  isOpen: boolean;
  closeModal: () => void;
  confirmChange: (data: LockScheduleFormData) => Promise<void>;
  academicYear: number;
  semester: semester;
}

export interface EditLockScheduleModalProps {
  isOpen: boolean;
  lockSchedule: LockSchedule;
  closeModal: () => void;
  confirmChange: (data: Partial<LockScheduleFormData>) => Promise<void>;
}

export interface DeleteLockScheduleModalProps {
  isOpen: boolean;
  closeModal: () => void;
  deleteData: LockSchedule;
  onConfirm: () => Promise<void>;
}

// ============================================================================
// Lock Schedule Form State
// ============================================================================

/**
 * Internal state for lock schedule form reducer
 */
export type LockScheduleFormState = {
  selectedTimeslots: string[];
  selectedGrades: string[];
  selectedSubject: string | null;
  selectedRoom: number | null;
  selectedTeachers: number[];
  selectedDayOfWeek: day_of_week | null;
};

export type LockScheduleFormAction =
  | { type: 'SET_TIMESLOTS'; payload: string[] }
  | { type: 'SET_GRADES'; payload: string[] }
  | { type: 'SET_SUBJECT'; payload: string | null }
  | { type: 'SET_ROOM'; payload: number | null }
  | { type: 'SET_TEACHERS'; payload: number[] }
  | { type: 'ADD_TEACHER'; payload: number }
  | { type: 'REMOVE_TEACHER'; payload: number }
  | { type: 'SET_DAY_OF_WEEK'; payload: day_of_week }
  | { type: 'RESET' };

// ============================================================================
// Lock Schedule API Responses
// ============================================================================

export interface LockScheduleCreateResponse {
  success: boolean;
  message: string;
  data?: LockSchedule[];
}

export interface LockScheduleUpdateResponse {
  success: boolean;
  message: string;
  data?: LockSchedule;
}

export interface LockScheduleDeleteResponse {
  success: boolean;
  message: string;
}

export interface LockScheduleListResponse {
  success: boolean;
  data: LockScheduleListItem[];
}
