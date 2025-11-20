/**
 * Domain Layer: Teacher Validation Service
 * 
 * Pure business logic functions for teacher validation.
 * No I/O operations, no Prisma, no external dependencies.
 * 
 * @module teacher-validation.service
 */

import type { CreateTeacherInput } from '../../application/schemas/teacher.schemas';
import type { teacher } from @/prisma/generated/client';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: string;
}

/**
 * Check if teacher data is a duplicate
 * 
 * @param newTeacher - New teacher data to validate
 * @param existingTeacher - Existing teacher from database (if found)
 * @returns Validation result with duplicate status and reason
 */
export function checkDuplicateTeacher(
  newTeacher: CreateTeacherInput,
  existingTeacher: teacher | null
): DuplicateCheckResult {
  if (!existingTeacher) {
    return { isDuplicate: false };
  }

  // Check for exact match (all fields identical)
  const isExactMatch =
    existingTeacher.Prefix === newTeacher.Prefix &&
    existingTeacher.Firstname === newTeacher.Firstname &&
    existingTeacher.Lastname === newTeacher.Lastname &&
    existingTeacher.Email === newTeacher.Email &&
    existingTeacher.Department === newTeacher.Department;

  if (isExactMatch) {
    return {
      isDuplicate: true,
      reason: 'มีข้อมูลอยู่แล้ว กรุณาตรวจสอบอีกครั้ง',
    };
  }

  return { isDuplicate: false };
}

/**
 * Check if email is already in use by another teacher
 * 
 * @param email - Email to check
 * @param existingTeacher - Teacher with this email (if found)
 * @param currentTeacherId - ID of teacher being updated (optional, for update operations)
 * @returns Validation result
 */
export function checkEmailConflict(
  email: string,
  existingTeacher: teacher | null,
  currentTeacherId?: number
): DuplicateCheckResult {
  if (!existingTeacher) {
    return { isDuplicate: false };
  }

  // If updating, allow same email for same teacher
  if (currentTeacherId && existingTeacher.TeacherID === currentTeacherId) {
    return { isDuplicate: false };
  }

  return {
    isDuplicate: true,
    reason: 'เพิ่มอีเมลซ้ำ กรุณาตรวจสอบอีกครั้ง',
  };
}
