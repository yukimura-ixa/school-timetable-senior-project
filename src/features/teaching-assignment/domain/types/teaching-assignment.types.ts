/**
 * Domain types for Teaching Assignment feature
 * Manages teacher-to-subject assignments for specific grades, semesters, and academic years
 */

import { semester } from "@/prisma/generated/client";

// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * Teacher assignment to a subject for specific context
 */
export interface TeacherAssignment {
  id: number;
  subjectCode: string;
  subjectName: string;
  gradeId: string;
  semester: semester;
  academicYear: number;
  teacherId: number;
  teacherName: string;
  teacherPrefix: string;
  credit: number;
  category: string;
}

/**
 * Teacher's full workload across all assignments
 */
export interface TeacherWorkload {
  teacherId: number;
  teacherName: string;
  totalHours: number;
  assignments: WorkloadAssignment[];
  status: WorkloadStatus;
}

/**
 * Individual assignment contributing to workload
 */
export interface WorkloadAssignment {
  subject: string;
  subjectCode: string;
  grade: string;
  credits: number;
  hours: number;
}

/**
 * Workload status based on hours
 */
export type WorkloadStatus = "ok" | "warning" | "overload";

/**
 * Validation result for assignment
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Context filters for loading assignments
 */
export interface AssignmentContext {
  gradeId: string;
  semester: string;
  academicYear: number;
}

// ============================================================================
// Assignment Operations
// ============================================================================

/**
 * Input for assigning teacher to subject
 */
export interface AssignTeacherInput {
  subjectCode: string;
  gradeId: string;
  semester: string;
  academicYear: number;
  teacherId: number;
}

/**
 * Input for bulk assignment
 */
export interface BulkAssignInput {
  gradeId: string;
  semester: string;
  academicYear: number;
  assignments: Array<{
    subjectCode: string;
    teacherId: number;
  }>;
}

/**
 * Input for unassigning teacher from subject
 */
export interface UnassignTeacherInput {
  subjectCode: string;
  gradeId: string;
  semester: string;
  academicYear: number;
  teacherId: number;
}

// ============================================================================
// UI Types
// ============================================================================

/**
 * Subject with assignment status for display
 */
export interface SubjectWithAssignment {
  subjectCode: string;
  subjectName: string;
  category: string;
  credit: number;
  assignedTeachers: Array<{
    teacherId: number;
    teacherName: string;
    teacherPrefix: string;
  }>;
  isAssigned: boolean;
}

/**
 * Teacher option for selector
 */
export interface TeacherOption {
  teacherId: number;
  name: string;
  prefix: string;
  department: string;
  currentWorkload: number;
  status: WorkloadStatus;
}

// ============================================================================
// Business Rule Constants (Re-exported from centralized config)
// ============================================================================

// Import centralized business rules
import {
  TEACHER_WORKLOAD,
  getTeacherWorkloadStatus,
  getStatusColor as getStatusColorFromConfig,
  getWorkloadLabel as getWorkloadLabelFromConfig,
} from "@/config/business-rules";

/**
 * @deprecated Use TEACHER_WORKLOAD from @/config/business-rules instead
 * Keeping for backward compatibility
 */
export const WORKLOAD_LIMITS = TEACHER_WORKLOAD;

/**
 * Calculate workload status based on hours
 */
export function getWorkloadStatus(hours: number): WorkloadStatus {
  return getTeacherWorkloadStatus(hours);
}

/**
 * Get status color for UI
 */
export function getWorkloadColor(status: WorkloadStatus): string {
  return getStatusColorFromConfig(status);
}

/**
 * Get status label in Thai
 */
export function getWorkloadLabel(status: WorkloadStatus): string {
  return getWorkloadLabelFromConfig(status);
}
