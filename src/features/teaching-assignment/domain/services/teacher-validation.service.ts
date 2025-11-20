/**
 * Teacher Validation Service
 * Business logic for validating teacher assignments and calculating workload
 */

import { findTeacherWorkload } from "../../infrastructure/repositories/teaching-assignment.repository"
import { teacherRepository } from "@/features/teacher/infrastructure/repositories/teacher.repository"
import type {
  TeacherWorkload,
  ValidationResult,
} from "../types/teaching-assignment.types"
import { WORKLOAD_LIMITS, getWorkloadStatus } from "../types/teaching-assignment.types"
import { semester } from '@/prisma/generated/client';;

// ============================================================================
// Workload Calculation
// ============================================================================

/**
 * Calculate teacher's total workload for a semester
 * @param teacherId - Teacher ID
 * @param semesterValue - Semester (SEMESTER_1, SEMESTER_2, SEMESTER_3)
 * @param year - Academic year
 * @returns Teacher workload with hours and status
 */
export async function calculateTeacherWorkload(
  teacherId: number,
  semesterValue: semester,
  year: number
): Promise<TeacherWorkload> {
  const assignments = await findTeacherWorkload(teacherId, semesterValue, year)

  if (assignments.length === 0) {
    return {
      teacherId,
      teacherName: "Unknown",
      totalHours: 0,
      assignments: [],
      status: "ok",
    }
  }

  // Calculate total hours
  // TeachHour is already per week from the database
  const totalHours = assignments.reduce((sum: any, assignment: any) => {
    return sum + assignment.TeachHour
  }, 0)

  // Determine status
  const status = getWorkloadStatus(totalHours)

  // Get teacher name from first assignment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstAssignment = assignments[0] as any
  const teacherName = firstAssignment?.teacher
    ? `${firstAssignment.teacher.Prefix}${firstAssignment.teacher.Firstname} ${firstAssignment.teacher.Lastname}`
    : "Unknown"

  return {
    teacherId,
    teacherName,
    totalHours,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assignments: assignments.map((a: any) => ({
      subject: a.subject?.SubjectName || "Unknown",
      subjectCode: a.subject?.SubjectCode || a.SubjectCode,
      grade: a.gradelevel?.GradeID || a.GradeID,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      credits: a.subject?.Credit ? parseFloat(a.subject.Credit) : 0,
      hours: a.TeachHour,
    })),
    status,
  }
}

/**
 * Calculate workload for multiple teachers at once
 * Useful for bulk operations and validation
 */
export async function calculateMultipleTeacherWorkloads(
  teacherIds: number[],
  semesterValue: semester,
  year: number
): Promise<Map<number, TeacherWorkload>> {
  const workloads = await Promise.all(
    teacherIds.map((teacherId) => calculateTeacherWorkload(teacherId, semesterValue, year))
  )

  return new Map(workloads.map((w) => [w.teacherId, w]))
}

// ============================================================================
// Assignment Validation
// ============================================================================

/**
 * Validate a single assignment
 * Checks teacher exists, workload limits, and business rules
 */
export async function validateAssignment(input: {
  teacherId: number
  subjectCode: string
  gradeId: string
  semester: semester
  year: number
  additionalHours: number // Hours this assignment would add
}): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Check teacher exists
  const teacher = await teacherRepository.findById(input.teacherId)
  if (!teacher) {
    errors.push("ไม่พบข้อมูลครู")
    return { valid: false, errors, warnings }
  }

  // Check workload
  const currentWorkload = await calculateTeacherWorkload(
    input.teacherId,
    input.semester,
    input.year
  )

  const projectedHours = currentWorkload.totalHours + input.additionalHours

  if (projectedHours > WORKLOAD_LIMITS.MAX_WEEKLY_HOURS) {
    errors.push(
      `ครูจะสอนเกิน ${WORKLOAD_LIMITS.MAX_WEEKLY_HOURS} ชม./สัปดาห์ ` +
      `(${projectedHours} ชม.) หากมอบหมายรายวิชานี้`
    )
  } else if (projectedHours > WORKLOAD_LIMITS.RECOMMENDED_HOURS) {
    warnings.push(
      `ครูจะสอนเกิน ${WORKLOAD_LIMITS.RECOMMENDED_HOURS} ชม./สัปดาห์ที่แนะนำ ` +
      `(${projectedHours} ชม.)`
    )
  }

  // Additional validation: Check if teacher has any existing conflicts
  // (This would require schedule data, implement if needed)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate bulk assignments
 * Checks all assignments together to detect conflicts
 */
export async function validateBulkAssignments(
  assignments: Array<{
    teacherId: number
    subjectCode: string
    gradeId: string
    semester: semester
    year: number
    hours: number
  }>
): Promise<{
  valid: boolean
  errors: string[]
  warnings: string[]
  teacherValidations: Map<number, ValidationResult>
}> {
  const allErrors: string[] = []
  const allWarnings: string[] = []
  const teacherValidations = new Map<number, ValidationResult>()

  // Group assignments by teacher
  const teacherAssignments = new Map<number, typeof assignments>()
  for (const assignment of assignments) {
    const existing = teacherAssignments.get(assignment.teacherId) || []
    existing.push(assignment)
    teacherAssignments.set(assignment.teacherId, existing)
  }

  // Validate each teacher's assignments
  for (const [teacherId, teacherAssignmentsList] of teacherAssignments) {
    const totalAdditionalHours = teacherAssignmentsList.reduce((sum: any, a: any) => sum + a.hours, 0)

    const validation = await validateAssignment({
      teacherId,
      subjectCode: teacherAssignmentsList[0]!.subjectCode,
      gradeId: teacherAssignmentsList[0]!.gradeId,
      semester: teacherAssignmentsList[0]!.semester,
      year: teacherAssignmentsList[0]!.year,
      additionalHours: totalAdditionalHours,
    })

    teacherValidations.set(teacherId, validation)
    allErrors.push(...validation.errors)
    allWarnings.push(...validation.warnings)
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    teacherValidations,
  }
}

// ============================================================================
// Business Rule Helpers
// ============================================================================

/**
 * Check if teacher is over recommended workload
 */
export function isOverRecommendedWorkload(hours: number): boolean {
  return hours > WORKLOAD_LIMITS.RECOMMENDED_HOURS
}

/**
 * Check if teacher is over maximum workload
 */
export function isOverMaxWorkload(hours: number): boolean {
  return hours > WORKLOAD_LIMITS.MAX_WEEKLY_HOURS
}

/**
 * Get available capacity for teacher
 */
export function getAvailableCapacity(currentHours: number): number {
  return Math.max(0, WORKLOAD_LIMITS.MAX_WEEKLY_HOURS - currentHours)
}

/**
 * Get workload status message in Thai
 */
export function getWorkloadMessage(workload: TeacherWorkload): string {
  const { totalHours, status } = workload

  switch (status) {
    case "ok":
      return `ปกติ (${totalHours}/${WORKLOAD_LIMITS.RECOMMENDED_HOURS} ชม.)`
    case "warning":
      return `เตือน: เกิน ${WORKLOAD_LIMITS.RECOMMENDED_HOURS} ชม. (${totalHours} ชม.)`
    case "overload":
      return `เกินภาระ: เกิน ${WORKLOAD_LIMITS.MAX_WEEKLY_HOURS} ชม. (${totalHours} ชม.)`
  }
}
