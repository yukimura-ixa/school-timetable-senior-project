/**
 * Centralized Business Rules Configuration
 *
 * This file contains all configurable business rules, thresholds, and limits
 * for the school timetable system. Modify these values to adjust system behavior
 * without changing code logic.
 *
 * @module business-rules
 */

// =============================================================================
// TEACHER WORKLOAD CONFIGURATION
// =============================================================================

/**
 * Teacher workload limits (weekly hours)
 *
 * Based on Thai Ministry of Education guidelines:
 * - Teachers should typically teach 16-18 periods per week
 * - Maximum allowed is typically 20-22 periods per week
 */
export const TEACHER_WORKLOAD = {
  /** Absolute maximum weekly teaching hours (hard limit) */
  MAX_WEEKLY_HOURS: 20,
  /** Recommended maximum weekly hours (soft limit - shows warning) */
  RECOMMENDED_HOURS: 16,
  /** Minimum rest hours between classes (future enhancement) */
  MIN_REST_HOURS: 2,
} as const;

/**
 * Workload status thresholds for analytics visualization
 *
 * These thresholds define the color-coded status shown in analytics dashboards.
 * Note: These are more granular than TEACHER_WORKLOAD limits for better
 * visualization of distribution across all teachers.
 */
export const WORKLOAD_ANALYTICS_THRESHOLDS = {
  /** Maximum hours to be considered "underutilized" */
  UNDERUTILIZED_MAX: 12,
  /** Minimum hours for "optimal" workload */
  OPTIMAL_MIN: 13,
  /** Maximum hours for "optimal" workload */
  OPTIMAL_MAX: 16,
  /** Minimum hours for "high" workload (warning zone) */
  HIGH_MIN: 17,
  /** Maximum hours for "high" workload */
  HIGH_MAX: 20,
  /** Minimum hours to be considered "overloaded" */
  OVERLOADED_MIN: 21,
} as const;

// =============================================================================
// ROOM UTILIZATION CONFIGURATION
// =============================================================================

/**
 * Room utilization status thresholds (percentage)
 *
 * Defines how room usage is categorized for reporting.
 */
export const ROOM_UTILIZATION_THRESHOLDS = {
  /** Maximum utilization to be considered "rarely used" */
  RARELY_USED_MAX: 20,
  /** Range for "light usage" */
  LIGHT_MIN: 20,
  LIGHT_MAX: 40,
  /** Range for "moderate usage" */
  MODERATE_MIN: 40,
  MODERATE_MAX: 60,
  /** Range for "well used" */
  WELL_USED_MIN: 60,
  WELL_USED_MAX: 90,
  /** Minimum utilization to be considered "over-utilized" */
  OVER_UTILIZED_MIN: 90,
} as const;

// =============================================================================
// SEMESTER COMPLETION CONFIGURATION
// =============================================================================

/**
 * Semester configuration completeness thresholds (percentage)
 *
 * Defines the progress stages for semester setup.
 */
export const COMPLETION_THRESHOLDS = {
  /** Maximum completion to be considered "not started" */
  NOT_STARTED_MAX: 10,
  /** Range for "in progress" */
  IN_PROGRESS_MIN: 10,
  IN_PROGRESS_MAX: 70,
  /** Range for "near complete" */
  NEAR_COMPLETE_MIN: 70,
  NEAR_COMPLETE_MAX: 95,
  /** Minimum completion to be considered "complete" */
  COMPLETE_MIN: 95,
} as const;

/**
 * Completeness calculation weights (percentage points)
 *
 * Defines how much each component contributes to overall completeness.
 * Total should equal 100.
 */
export const COMPLETENESS_WEIGHTS = {
  /** Timeslots configured */
  TIMESLOTS: 25,
  /** Teacher assignments defined */
  TEACHER_ASSIGNMENTS: 25,
  /** Schedule slots filled (timetable) */
  SCHEDULE_SLOTS: 40,
  /** Additional configuration (locked slots, etc.) */
  ADDITIONAL_CONFIG: 10,
} as const;

// =============================================================================
// CURRICULUM COMPLIANCE CONFIGURATION
// =============================================================================

/**
 * Program/curriculum compliance thresholds
 */
export const COMPLIANCE_THRESHOLDS = {
  /** Default minimum compliance rate to be considered "passing" */
  DEFAULT_PASSING_RATE: 80,
  /** Warning threshold for compliance */
  WARNING_RATE: 90,
  /** Target compliance rate (green status) */
  TARGET_RATE: 100,
} as const;

// =============================================================================
// UI/UX CONFIGURATION
// =============================================================================

/**
 * Dashboard display limits
 */
export const DASHBOARD_LIMITS = {
  /** Maximum teachers shown in workload overview */
  TOP_TEACHERS_COUNT: 10,
  /** Maximum rooms shown in utilization overview */
  TOP_ROOMS_COUNT: 10,
  /** Maximum recent semesters to show */
  RECENT_SEMESTERS_COUNT: 5,
  /** Maximum pinned semesters allowed */
  MAX_PINNED_SEMESTERS: 3,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  /** Default page size for lists */
  DEFAULT_PAGE_SIZE: 20,
  /** Maximum page size allowed */
  MAX_PAGE_SIZE: 100,
  /** Page size options for selectors */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const;

// =============================================================================
// SCHEDULING CONFIGURATION
// =============================================================================

/**
 * Default timetable configuration
 */
export const DEFAULT_TIMETABLE_CONFIG = {
  /** Default class duration in minutes */
  DEFAULT_PERIOD_DURATION: 50,
  /** Default break duration in minutes */
  DEFAULT_BREAK_DURATION: 10,
  /** Default periods per day */
  DEFAULT_PERIODS_PER_DAY: 8,
  /** Maximum periods per day allowed */
  MAX_PERIODS_PER_DAY: 12,
  /** Default start time (HH:mm) */
  DEFAULT_START_TIME: "08:30",
} as const;

/**
 * Days of week configuration (Thai school week)
 */
export const SCHOOL_DAYS = {
  WEEKDAYS: ["MON", "TUE", "WED", "THU", "FRI"] as const,
  WEEKEND: ["SAT", "SUN"] as const,
  /** Thai labels for days */
  LABELS: {
    MON: "จันทร์",
    TUE: "อังคาร",
    WED: "พุธ",
    THU: "พฤหัสบดี",
    FRI: "ศุกร์",
    SAT: "เสาร์",
    SUN: "อาทิตย์",
  } as const,
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type WorkloadStatus = "ok" | "warning" | "overload";
export type AnalyticsWorkloadStatus =
  | "underutilized"
  | "optimal"
  | "high"
  | "overloaded";
export type RoomUtilizationStatus =
  | "rarely_used"
  | "light"
  | "moderate"
  | "well_used"
  | "over_utilized";
export type CompletionStatus =
  | "not_started"
  | "in_progress"
  | "near_complete"
  | "complete";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate teacher workload status based on hours
 *
 * @param hours - Weekly teaching hours
 * @returns Workload status for validation
 */
export function getTeacherWorkloadStatus(hours: number): WorkloadStatus {
  if (hours > TEACHER_WORKLOAD.MAX_WEEKLY_HOURS) return "overload";
  if (hours > TEACHER_WORKLOAD.RECOMMENDED_HOURS) return "warning";
  return "ok";
}

/**
 * Calculate analytics workload status for visualization
 *
 * @param hours - Weekly teaching hours
 * @returns Detailed workload status for charts
 */
export function getAnalyticsWorkloadStatus(
  hours: number,
): AnalyticsWorkloadStatus {
  if (hours >= WORKLOAD_ANALYTICS_THRESHOLDS.OVERLOADED_MIN) return "overloaded";
  if (hours >= WORKLOAD_ANALYTICS_THRESHOLDS.HIGH_MIN) return "high";
  if (hours >= WORKLOAD_ANALYTICS_THRESHOLDS.OPTIMAL_MIN) return "optimal";
  return "underutilized";
}

/**
 * Calculate room utilization status
 *
 * @param utilizationPercent - Room utilization percentage (0-100)
 * @returns Utilization status
 */
export function getRoomUtilizationStatus(
  utilizationPercent: number,
): RoomUtilizationStatus {
  if (utilizationPercent >= ROOM_UTILIZATION_THRESHOLDS.OVER_UTILIZED_MIN)
    return "over_utilized";
  if (utilizationPercent >= ROOM_UTILIZATION_THRESHOLDS.WELL_USED_MIN)
    return "well_used";
  if (utilizationPercent >= ROOM_UTILIZATION_THRESHOLDS.MODERATE_MIN)
    return "moderate";
  if (utilizationPercent >= ROOM_UTILIZATION_THRESHOLDS.LIGHT_MIN)
    return "light";
  return "rarely_used";
}

/**
 * Calculate completion status
 *
 * @param completionPercent - Completion percentage (0-100)
 * @returns Completion status
 */
export function getCompletionStatus(completionPercent: number): CompletionStatus {
  if (completionPercent >= COMPLETION_THRESHOLDS.COMPLETE_MIN) return "complete";
  if (completionPercent >= COMPLETION_THRESHOLDS.NEAR_COMPLETE_MIN)
    return "near_complete";
  if (completionPercent >= COMPLETION_THRESHOLDS.IN_PROGRESS_MIN)
    return "in_progress";
  return "not_started";
}

/**
 * Get status color for UI components
 *
 * @param status - Any status type
 * @returns MUI-compatible color string
 */
export function getStatusColor(
  status: WorkloadStatus | AnalyticsWorkloadStatus | CompletionStatus,
): "success" | "warning" | "error" | "info" | "default" {
  switch (status) {
    case "ok":
    case "optimal":
    case "complete":
      return "success";
    case "warning":
    case "high":
    case "near_complete":
      return "warning";
    case "overload":
    case "overloaded":
      return "error";
    case "in_progress":
    case "underutilized":
      return "info";
    default:
      return "default";
  }
}

/**
 * Get status label in Thai
 *
 * @param status - Workload status
 * @returns Thai label
 */
export function getWorkloadLabel(status: WorkloadStatus): string {
  switch (status) {
    case "ok":
      return "ปกติ";
    case "warning":
      return "เตือน";
    case "overload":
      return "เกินภาระ";
  }
}
