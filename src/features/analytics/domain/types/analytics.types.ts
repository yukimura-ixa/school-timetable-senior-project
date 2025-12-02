/**
 * Analytics Domain Types
 * School Timetable Management System
 *
 * Type definitions for all analytics data structures
 */

import type { semester, day_of_week } from "@/prisma/generated/client";

import type {
  SubjectCategory,
  LearningArea,
  ProgramTrack,
} from "@/prisma/generated/client";

// ==================== Section 1: Overview Dashboard ====================

export type OverviewStats = {
  totalScheduledHours: number; // Count of all class_schedule entries
  completionRate: number; // Percentage of required hours scheduled
  activeTeachers: number; // Teachers with >= 1 responsibility
  scheduleConflicts: number; // Detected conflicts (overlapping timeslots)
  totalGrades: number; // Total number of grade levels
  totalRooms: number; // Total number of rooms
};

// ==================== Section 2: Teacher Workload ====================

export type TeacherWorkload = {
  teacherId: number;
  teacherName: string;
  teacherPrefix: string;
  teacherFirstname: string;
  teacherLastname: string;
  department: string;
  totalHours: number; // Number of scheduled periods
  classCount: number; // Unique classes taught
  utilizationRate: number; // Percentage of available hours
  workloadStatus: "underutilized" | "optimal" | "high" | "overloaded";
};

export type DepartmentWorkload = {
  department: string;
  teacherCount: number;
  avgHoursPerTeacher: number;
  totalHours: number;
  minHours: number;
  maxHours: number;
  utilizationRate: number;
};

// ==================== Section 3: Room Utilization ====================

export type RoomOccupancy = {
  roomId: number;
  roomName: string;
  building: string;
  floor: string;
  dayOccupancy: DayOccupancy[];
  occupancyRate: number; // Percentage of occupied slots
  totalSlots: number;
  occupiedSlots: number;
  emptySlots: number;
  utilizationStatus:
    | "rarely-used"
    | "light"
    | "moderate"
    | "well-used"
    | "over-utilized";
};

export type DayOccupancy = {
  day: day_of_week;
  dayLabel: string; // Thai label (จันทร์, อังคาร, etc.)
  periods: PeriodOccupancy[];
};

export type PeriodOccupancy = {
  period: number; // 1-8
  periodLabel: string; // e.g., "08:00-09:00"
  isOccupied: boolean;
  classId?: string; // ClassID if occupied
  subjectCode?: string; // SubjectCode if occupied
  gradeId?: string; // GradeID if occupied
};

export type RoomUtilizationRanking = {
  roomId: number;
  roomName: string;
  building: string;
  occupiedSlots: number;
  totalSlots: number;
  utilizationRate: number;
  status: "over-utilized" | "well-utilized" | "under-utilized" | "rarely-used";
  statusColor: string;
};

// ==================== Section 4: Subject Distribution ====================

export type SubjectDistribution = {
  category: SubjectCategory;
  categoryLabel: string; // Thai label
  learningArea?: LearningArea;
  totalHours: number;
  percentage: number;
  subjectCount: number;
  color: string;
};

export type LearningAreaDistribution = {
  learningArea: LearningArea;
  learningAreaLabel: string; // Thai label
  totalHours: number;
  requiredHours: number; // From MOE standards
  scheduledHours: number;
  complianceRate: number; // (scheduled / required) * 100
  isCompliant: boolean;
  subjects: {
    subjectCode: string;
    subjectName: string;
    hours: number;
  }[];
};

// ==================== Section 5: Schedule Quality ====================

export type CompletionMetrics = {
  totalRequiredSlots: number; // grades * timeslots
  totalScheduledSlots: number; // count of class_schedule
  completionRate: number; // percentage
  lockedSchedules: number; // IsLocked = true count
  unlockedSchedules: number; // IsLocked = false count
  emptySlots: number; // required - scheduled
  progressStatus: "not-started" | "in-progress" | "near-complete" | "complete";
};

export type LockStatusSummary = {
  locked: number;
  unlocked: number;
  empty: number;
  total: number;
  lockedPercentage: number;
  unlockedPercentage: number;
  emptyPercentage: number;
};

// ==================== Section 6: Time Analysis ====================

export type PeriodLoad = {
  period: number; // 1-8
  periodLabel: string; // "08:00-09:00"
  totalScheduled: number;
  avgClassesPerDay: number;
  peakDay: day_of_week | null; // Day with most schedules in this period
  peakDayCount: number;
  loadStatus: "low" | "moderate" | "high" | "peak";
};

export type DayLoad = {
  day: day_of_week;
  dayLabel: string; // "จันทร์", "อังคาร"
  dayIndex: number; // 0-4 for sorting
  totalScheduled: number;
  avgPerPeriod: number;
  breaktimeCount: number; // Count of breaktime slots
  loadPercentage: number;
};

// ==================== Section 7: Curriculum Compliance ====================

export type ProgramCompliance = {
  programId: number;
  programCode: string;
  programName: string;
  year: number;
  track: ProgramTrack;
  trackLabel: string; // Thai label
  minTotalCredits: number;

  scheduledCredits: CategoryCredits;
  requiredCredits: CategoryCredits;

  complianceRate: number; // (scheduled total / required total) * 100
  complianceStatus: "non-compliant" | "partial" | "near-complete" | "compliant";
  missingMandatorySubjects: MandatorySubjectInfo[];
  gradeCount: number; // Number of grade levels in this program
};

export type CategoryCredits = {
  core: number;
  additional: number;
  activity: number;
  elective: number;
  total: number;
};

export type MandatorySubjectInfo = {
  subjectCode: string;
  subjectName: string;
  category: SubjectCategory;
  minCredits: number;
  maxCredits: number | null;
  reason: string; // Why it's missing (e.g., "ยังไม่ได้จัดในตาราง")
};

export type SubjectCoverageStatus = {
  programId: number;
  subjectCode: string;
  subjectName: string;
  isMandatory: boolean;
  isScheduled: boolean;
  scheduledGrades: string[]; // GradeIDs where this subject is scheduled
  missingGrades: string[]; // GradeIDs where this subject should be but isn't
};

// ==================== Utility Types ====================

/**
 * Config ID format: "SEMESTER-YEAR" (e.g., "1-2567")
 */
export type ConfigId = string;

/**
 * Parsed config ID
 */
export type ParsedConfig = {
  semester: semester;
  academicYear: number;
  configId: string;
};

// Re-export thresholds from centralized config for backward compatibility
import {
  WORKLOAD_ANALYTICS_THRESHOLDS,
  ROOM_UTILIZATION_THRESHOLDS as ROOM_UTIL_THRESHOLDS,
  COMPLETION_THRESHOLDS as COMPLETION_THRESH,
  SCHOOL_DAYS,
} from "@/config/business-rules";

/**
 * @deprecated Use WORKLOAD_ANALYTICS_THRESHOLDS from @/config/business-rules instead
 * Workload status thresholds (hours)
 */
export const WORKLOAD_THRESHOLDS = {
  UNDERUTILIZED_MAX: WORKLOAD_ANALYTICS_THRESHOLDS.UNDERUTILIZED_MAX,
  OPTIMAL_MIN: WORKLOAD_ANALYTICS_THRESHOLDS.OPTIMAL_MIN,
  OPTIMAL_MAX: WORKLOAD_ANALYTICS_THRESHOLDS.OPTIMAL_MAX,
  HIGH_MIN: WORKLOAD_ANALYTICS_THRESHOLDS.HIGH_MIN,
  HIGH_MAX: WORKLOAD_ANALYTICS_THRESHOLDS.HIGH_MAX,
  OVERLOADED_MIN: WORKLOAD_ANALYTICS_THRESHOLDS.OVERLOADED_MIN,
} as const;

/**
 * @deprecated Use ROOM_UTILIZATION_THRESHOLDS from @/config/business-rules instead
 * Room utilization status thresholds (percentage)
 */
export const ROOM_UTILIZATION_THRESHOLDS = ROOM_UTIL_THRESHOLDS;

/**
 * @deprecated Use COMPLETION_THRESHOLDS from @/config/business-rules instead
 * Completion progress thresholds (percentage)
 */
export const COMPLETION_THRESHOLDS = COMPLETION_THRESH;

/**
 * Days of week with Thai labels
 */
export const DAYS_OF_WEEK: {
  value: day_of_week;
  label: string;
  index: number;
}[] = [
  { value: "MON", label: SCHOOL_DAYS.LABELS.MON, index: 0 },
  { value: "TUE", label: SCHOOL_DAYS.LABELS.TUE, index: 1 },
  { value: "WED", label: SCHOOL_DAYS.LABELS.WED, index: 2 },
  { value: "THU", label: SCHOOL_DAYS.LABELS.THU, index: 3 },
  { value: "FRI", label: SCHOOL_DAYS.LABELS.FRI, index: 4 },
];

/**
 * Subject categories with Thai labels
 */
export const SUBJECT_CATEGORIES: {
  value: SubjectCategory;
  label: string;
  color: string;
}[] = [
  { value: "CORE", label: "รายวิชาพื้นฐาน", color: "#3b82f6" },
  { value: "ADDITIONAL", label: "รายวิชาเพิ่มเติม", color: "#10b981" },
  { value: "ACTIVITY", label: "กิจกรรม", color: "#f59e0b" },
];

/**
 * Program tracks with Thai labels
 */
export const PROGRAM_TRACKS: { value: ProgramTrack; label: string }[] = [
  { value: "SCIENCE_MATH", label: "วิทย์-คณิต" },
  { value: "LANGUAGE_MATH", label: "ศิลป์-คำนวณ" },
  { value: "LANGUAGE_ARTS", label: "ศิลป์-ภาษา" },
  { value: "GENERAL", label: "ทั่วไป" },
];

/**
 * Chart color palette for data visualization
 */
export const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  gray: "#6b7280",
  gradients: {
    blue: ["#60a5fa", "#3b82f6", "#2563eb"],
    green: ["#6ee7b7", "#10b981", "#059669"],
    purple: ["#c084fc", "#8b5cf6", "#7c3aed"],
    orange: ["#fdba74", "#f59e0b", "#d97706"],
  },
} as const;
