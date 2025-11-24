/**
 * Domain Layer: Schedule Arrangement Constants
 *
 * Centralized constants for timetable arrangement functionality.
 * Defines constraints, validation rules, and type-safe defaults.
 *
 * @module schedule-arrangement/domain/constants
 */

// ============================================================================
// GRADE LEVEL CONSTANTS
// ============================================================================

/**
 * Thai grade level labels for secondary school (มัธยม)
 */
export const GRADE_LEVELS = [
  { level: 7, label: "ม.1", category: "junior" },
  { level: 8, label: "ม.2", category: "junior" },
  { level: 9, label: "ม.3", category: "junior" },
  { level: 10, label: "ม.4", category: "senior" },
  { level: 11, label: "ม.5", category: "senior" },
  { level: 12, label: "ม.6", category: "senior" },
] as const;

/**
 * Grade category type
 */
export type GradeCategory = "junior" | "senior";

/**
 * Get grade category from grade level
 */
export function getGradeCategory(gradeLevel: number): GradeCategory {
  return gradeLevel <= 9 ? "junior" : "senior";
}

/**
 * Get Thai label for grade level
 */
export function getGradeLevelLabel(gradeLevel: number): string {
  const grade = GRADE_LEVELS.find((g) => g.level === gradeLevel);
  return grade?.label ?? `ม.${gradeLevel - 6}`;
}

// ============================================================================
// DAY OF WEEK CONSTANTS
// ============================================================================

/**
 * Days of week for timetable
 */
export const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI"] as const;

/**
 * Thai day labels
 */
export const DAY_LABELS_TH: Record<string, string> = {
  MON: "จันทร์",
  TUE: "อังคาร",
  WED: "พุธ",
  THU: "พฤหัสบดี",
  FRI: "ศุกร์",
  SAT: "เสาร์",
  SUN: "อาทิตย์",
} as const;

/**
 * Day colors for visual differentiation
 */
export const DAY_COLORS: Record<string, { bg: string; text: string }> = {
  MON: { bg: "#FFF9C4", text: "#F57F17" }, // Yellow
  TUE: { bg: "#FFE0F0", text: "#C2185B" }, // Pink
  WED: { bg: "#E1F5DD", text: "#388E3C" }, // Green
  THU: { bg: "#FFE0B2", text: "#E65100" }, // Orange
  FRI: { bg: "#E3F2FD", text: "#1565C0" }, // Blue
} as const;

// ============================================================================
// CONFLICT TYPES
// ============================================================================

/**
 * Types of scheduling conflicts
 */
export const CONFLICT_TYPES = {
  TEACHER: "TEACHER_CONFLICT",
  CLASS: "CLASS_CONFLICT",
  ROOM: "ROOM_CONFLICT",
  LOCKED: "TIMESLOT_LOCKED",
} as const;

export type ConflictType = (typeof CONFLICT_TYPES)[keyof typeof CONFLICT_TYPES];

/**
 * Conflict severity levels
 */
export const CONFLICT_SEVERITY = {
  ERROR: "error", // Cannot proceed
  WARNING: "warning", // Can proceed with caution
  INFO: "info", // Informational
} as const;

export type ConflictSeverity =
  (typeof CONFLICT_SEVERITY)[keyof typeof CONFLICT_SEVERITY];

/**
 * Conflict messages in Thai
 */
export const CONFLICT_MESSAGES: Record<ConflictType, string> = {
  [CONFLICT_TYPES.TEACHER]: "ครูสอนซ้ำในคาบเดียวกัน",
  [CONFLICT_TYPES.CLASS]: "ห้องเรียนมีวิชาซ้ำในคาบเดียวกัน",
  [CONFLICT_TYPES.ROOM]: "ห้องถูกใช้งานซ้ำในคาบเดียวกัน",
  [CONFLICT_TYPES.LOCKED]: "คาบนี้ถูกล็อค ไม่สามารถแก้ไขได้",
} as const;

// ============================================================================
// DRAG & DROP CONSTANTS
// ============================================================================

/**
 * Drag & drop zones
 */
export const DND_ZONES = {
  SUBJECT_PALETTE: "subject-palette",
  TIMESLOT_GRID: "timeslot-grid",
  TRASH: "trash-zone",
} as const;

export type DndZone = (typeof DND_ZONES)[keyof typeof DND_ZONES];

/**
 * Draggable item types
 */
export const DRAGGABLE_TYPES = {
  SUBJECT: "subject-item",
  SCHEDULE: "schedule-item",
} as const;

export type DraggableType =
  (typeof DRAGGABLE_TYPES)[keyof typeof DRAGGABLE_TYPES];

// ============================================================================
// TIMESLOT CONSTRAINTS
// ============================================================================

/**
 * Standard timeslot configuration
 */
export const TIMESLOT_CONSTRAINTS = {
  /** Typical periods per day */
  PERIODS_PER_DAY: {
    min: 6,
    max: 10,
    default: 8,
  },

  /** Typical school days */
  SCHOOL_DAYS: {
    min: 5,
    max: 6,
    default: 5,
  },

  /** Break slot positions (1-indexed) */
  BREAK_SLOTS: {
    junior: 4, // ม.1-3 break at period 4
    senior: 5, // ม.4-6 break at period 5
  },
} as const;

// ============================================================================
// UI BEHAVIOR CONSTANTS
// ============================================================================

/**
 * Animation durations (milliseconds)
 */
export const ANIMATION_DURATION = {
  DRAG_START: 150,
  DRAG_END: 200,
  ERROR_SHAKE: 400,
  SUCCESS_FADE: 300,
} as const;

/**
 * Debounce delays (milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  VALIDATION: 500,
  AUTO_SAVE: 2000,
} as const;

/**
 * Color scheme for conflict states
 */
export const CONFLICT_COLORS = {
  error: {
    border: "#d32f2f",
    bg: "#ffebee",
    text: "#c62828",
  },
  warning: {
    border: "#f57c00",
    bg: "#fff3e0",
    text: "#e65100",
  },
  info: {
    border: "#1976d2",
    bg: "#e3f2fd",
    text: "#1565c0",
  },
  valid: {
    border: "#388e3c",
    bg: "#e8f5e9",
    text: "#2e7d32",
  },
} as const;

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

/**
 * Validation messages for schedule arrangement
 */
export const ARRANGEMENT_VALIDATION_MESSAGES = {
  TEACHER_REQUIRED: "กรุณาเลือกครูผู้สอน",
  SUBJECT_REQUIRED: "กรุณาเลือกวิชาที่ต้องการจัด",
  ROOM_REQUIRED: "กรุณาเลือกห้องเรียน",
  TIMESLOT_REQUIRED: "กรุณาเลือกคาบเรียน",

  CONFLICT_DETECTED: "พบข้อขัดแย้งในตารางสอน",
  LOCKED_TIMESLOT: "คาบนี้ถูกล็อค ไม่สามารถแก้ไขได้",

  SAVE_SUCCESS: "บันทึกตารางสอนสำเร็จ",
  SAVE_ERROR: "เกิดข้อผิดพลาดในการบันทึก",
  DELETE_SUCCESS: "ลบรายการสำเร็จ",
  DELETE_ERROR: "ไม่สามารถลบรายการได้",

  NO_SUBJECTS_AVAILABLE: "ไม่มีวิชาที่สามารถจัดได้",
  NO_TIMESLOTS_AVAILABLE: "ไม่มีคาบว่างสำหรับครูท่านนี้",
} as const;

// ============================================================================
// TAB NAVIGATION CONSTANTS
// ============================================================================

/**
 * Tab identifiers for arrange page
 */
export const ARRANGE_TABS = {
  TEACHER: "teacher",
  GRADE_1: "grade-1",
  GRADE_2: "grade-2",
  GRADE_3: "grade-3",
  GRADE_4: "grade-4",
  GRADE_5: "grade-5",
  GRADE_6: "grade-6",
} as const;

export type ArrangeTab = (typeof ARRANGE_TABS)[keyof typeof ARRANGE_TABS];

/**
 * Tab labels in Thai
 */
export const TAB_LABELS: Record<ArrangeTab, string> = {
  [ARRANGE_TABS.TEACHER]: "จัดตารางครู",
  [ARRANGE_TABS.GRADE_1]: "ม.1",
  [ARRANGE_TABS.GRADE_2]: "ม.2",
  [ARRANGE_TABS.GRADE_3]: "ม.3",
  [ARRANGE_TABS.GRADE_4]: "ม.4",
  [ARRANGE_TABS.GRADE_5]: "ม.5",
  [ARRANGE_TABS.GRADE_6]: "ม.6",
} as const;

/**
 * Map tab to grade level number
 */
export function tabToGradeLevel(tab: ArrangeTab): number | null {
  const mapping: Record<string, number> = {
    [ARRANGE_TABS.GRADE_1]: 7,
    [ARRANGE_TABS.GRADE_2]: 8,
    [ARRANGE_TABS.GRADE_3]: 9,
    [ARRANGE_TABS.GRADE_4]: 10,
    [ARRANGE_TABS.GRADE_5]: 11,
    [ARRANGE_TABS.GRADE_6]: 12,
  };
  return mapping[tab] ?? null;
}

/**
 * Map grade level to tab
 */
export function gradeLevelToTab(gradeLevel: number): ArrangeTab {
  const mapping: Record<number, ArrangeTab> = {
    7: ARRANGE_TABS.GRADE_1,
    8: ARRANGE_TABS.GRADE_2,
    9: ARRANGE_TABS.GRADE_3,
    10: ARRANGE_TABS.GRADE_4,
    11: ARRANGE_TABS.GRADE_5,
    12: ARRANGE_TABS.GRADE_6,
  };
  return mapping[gradeLevel] ?? ARRANGE_TABS.TEACHER;
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Schedule item type for drag & drop
 */
export interface ScheduleItem {
  timeslotID: string;
  subjectCode: string;
  subjectName: string;
  teacherID: number;
  teacherName: string;
  gradeID: number;
  gradeName: string;
  roomID: number | null;
  roomName: string | null;
  isLocked: boolean;
}

/**
 * Conflict detection result
 */
export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: ConflictType;
    severity: ConflictSeverity;
    message: string;
    details?: unknown;
  }>;
}

/**
 * Timeslot status type
 */
export type TimeslotStatus = "empty" | "occupied" | "locked" | "break";

/**
 * Filter criteria for arrangement view
 */
export interface ArrangementFilters {
  teacherID?: number | null;
  gradeLevel?: number | null;
  subjectCode?: string | null;
  dayOfWeek?: string | null;
}
