/**
 * Domain types for Teaching Assignment feature
 * Manages teacher-to-subject assignments for specific grades, semesters, and academic years
 */

import { semester } from @/prisma/generated/client";

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
export type WorkloadStatus = 'ok' | 'warning' | 'overload';

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
// Business Rule Constants
// ============================================================================

export const WORKLOAD_LIMITS = {
  MAX_WEEKLY_HOURS: 20, // Hard limit
  RECOMMENDED_HOURS: 16, // Soft limit (warning threshold)
  MIN_REST_HOURS: 2, // Between classes (future use)
} as const;

/**
 * Calculate workload status based on hours
 */
export function getWorkloadStatus(hours: number): WorkloadStatus {
  if (hours > WORKLOAD_LIMITS.MAX_WEEKLY_HOURS) return 'overload';
  if (hours > WORKLOAD_LIMITS.RECOMMENDED_HOURS) return 'warning';
  return 'ok';
}

/**
 * Get status color for UI
 */
export function getWorkloadColor(status: WorkloadStatus): string {
  switch (status) {
    case 'ok':
      return 'success';
    case 'warning':
      return 'warning';
    case 'overload':
      return 'error';
  }
}

/**
 * Get status label in Thai
 */
export function getWorkloadLabel(status: WorkloadStatus): string {
  switch (status) {
    case 'ok':
      return 'ปกติ';
    case 'warning':
      return 'เตือน';
    case 'overload':
      return 'เกินภาระ';
  }
}
