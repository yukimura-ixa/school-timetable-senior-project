/**
 * Domain Layer: GradeLevel Validation Service
 * 
 * Pure business logic and validation rules for gradelevels.
 * No external dependencies - can be tested independently.
 * 
 * @module gradelevel-validation.service
 */

import { gradeLevelRepository } from '../../infrastructure/repositories/gradelevel.repository'
import type { CreateGradeLevelInput } from '../../application/schemas/gradelevel.schemas'

/**
 * Generate GradeID from Year and Number
 * Pattern: Year + '0' + Number
 * Example: Year=1, Number=1 => "101"
 */
export function generateGradeId(year: number, number: number): string {
  return `${year}0${number}`
}

/**
 * Validate that a gradelevel with the same Year+Number combination doesn't exist
 * Returns error message in Thai if duplicate found, null otherwise
 */
export async function validateNoDuplicateGradeLevel(
  year: number,
  number: number
): Promise<string | null> {
  const existing = await gradeLevelRepository.findDuplicate(year, number)

  if (existing) {
    return 'มีข้อมูลชั้นปีนี้อยู่แล้ว กรุณาตรวจสอบอีกครั้ง'
  }

  return null
}

/**
 * Validate multiple gradelevels for bulk creation
 * Checks for both internal duplicates and database duplicates
 * Returns array of error messages (empty if valid)
 */
export async function validateBulkGradeLevels(
  gradelevels: CreateGradeLevelInput[]
): Promise<string[]> {
  const errors: string[] = []
  const seen = new Map<string, number>()

  // Check for internal duplicates
  for (let i = 0; i < gradelevels.length; i++) {
    const gradelevel = gradelevels[i]
    if (!gradelevel) continue

    const { Year, Number } = gradelevel
    const key = `${Year}-${Number}`

    if (seen.has(key)) {
      errors.push(
        `รายการที่ ${i + 1}: ข้อมูลซ้ำกับรายการที่ ${seen.get(key)! + 1} (ปี ${Year} ระดับ ${Number})`
      )
    } else {
      seen.set(key, i)
    }
  }

  // Check for database duplicates
  for (let i = 0; i < gradelevels.length; i++) {
    const gradelevel = gradelevels[i]
    if (!gradelevel) continue

    const { Year, Number } = gradelevel
    const dbError = await validateNoDuplicateGradeLevel(Year, Number)

    if (dbError) {
      errors.push(`รายการที่ ${i + 1}: ${dbError}`)
    }
  }

  return errors
}

/**
 * Find gradelevels where multiple teachers are responsible for the same subject
 * This is used for the lock feature to find gradelevels that share teachers
 * 
 * Business logic:
 * 1. Get all teacher responsibilities for the given subject, year, semester, and teacher IDs
 * 2. Group by GradeID
 * 3. Return only gradelevels where at least 2 teachers are assigned
 */
export async function findGradeLevelsForLock(
  subjectCode: string,
  academicYear: number,
  semester: 'SEMESTER_1' | 'SEMESTER_2',
  teacherIds: number[]
): Promise<{ GradeID: string; Year: number; Number: number }[]> {
  // Get all responsibilities
  const responsibilities = await gradeLevelRepository.findTeacherResponsibilities(
    subjectCode,
    academicYear,
    semester,
    teacherIds
  )

  // Group by GradeID and count unique teachers
  const gradeTeacherMap = new Map<string, Set<number>>()

  for (const resp of responsibilities) {
    if (!gradeTeacherMap.has(resp.GradeID)) {
      gradeTeacherMap.set(resp.GradeID, new Set())
    }
    gradeTeacherMap.get(resp.GradeID)!.add(resp.TeacherID)
  }

  // Filter gradelevels with at least 2 teachers
  const gradeIdsWithMultipleTeachers = Array.from(gradeTeacherMap.entries())
    .filter(([, teachers]) => teachers.size >= 2)
    .map(([gradeId]) => gradeId)

  if (gradeIdsWithMultipleTeachers.length === 0) {
    return []
  }

  // Fetch the actual gradelevel records
  const gradelevels = await gradeLevelRepository.findByIds(gradeIdsWithMultipleTeachers)

  return gradelevels.map((g: any) => ({
    GradeID: g.GradeID,
    Year: g.Year,
    Number: g.Number,
  }))
}
