/**
 * Domain Layer: Subject Validation Service
 * 
 * Pure business logic and validation rules for subjects.
 * No external dependencies - can be tested independently.
 * 
 * @module subject-validation.service
 */

import { subjectRepository } from '../../infrastructure/repositories/subject.repository';
import type { CreateSubjectInput, UpdateSubjectInput } from '../../application/schemas/subject.schemas';

/**
 * Trim all whitespace from SubjectCode
 * Business rule: SubjectCode should not contain spaces
 */
export function trimSubjectCode(subjectCode: string): string {
  return subjectCode.replace(/\s/g, '');
}

/**
 * Validate that a subject with the same SubjectCode doesn't exist
 */
export async function validateNoDuplicateSubjectCode(
  subjectCode: string
): Promise<string | null> {
  const existing = await subjectRepository.findByCode(subjectCode);

  if (existing) {
    return 'มีวิชานี้อยู่แล้ว กรุณาตรวจสอบอีกครั้ง';
  }

  return null;
}

/**
 * Validate that a subject with the same SubjectName doesn't exist
 */
export async function validateNoDuplicateSubjectName(
  subjectName: string
): Promise<string | null> {
  const existing = await subjectRepository.findByName(subjectName);

  if (existing) {
    return 'มีชื่อวิชานี้อยู่แล้ว กรุณาตรวจสอบอีกครั้ง';
  }

  return null;
}

/**
 * Validate that a subject exists
 */
export async function validateSubjectExists(
  subjectCode: string
): Promise<string | null> {
  const subject = await subjectRepository.findByCode(subjectCode);

  if (!subject) {
    return 'ไม่พบวิชานี้ กรุณาตรวจสอบอีกครั้ง';
  }

  return null;
}

/**
 * Validate multiple subjects for bulk creation
 * Checks for duplicates (both internal and database)
 */
export async function validateBulkCreateSubjects(
  subjects: CreateSubjectInput[]
): Promise<string[]> {
  const errors: string[] = [];
  const seenCodes = new Map<string, number>();
  const seenNames = new Map<string, number>();

  // Process each subject
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    if (!subject) continue;
    
    const trimmedCode = trimSubjectCode(subject.SubjectCode);

    // Check internal SubjectCode duplicates
    if (seenCodes.has(trimmedCode)) {
      errors.push(
        `รายการที่ ${i + 1}: รหัสวิชาซ้ำกับรายการที่ ${seenCodes.get(trimmedCode)! + 1} (${trimmedCode})`
      );
    } else {
      seenCodes.set(trimmedCode, i);

      // Check database SubjectCode duplicates
      const codeError = await validateNoDuplicateSubjectCode(trimmedCode);
      if (codeError) {
        errors.push(`รายการที่ ${i + 1}: ${codeError}`);
      }
    }

    // Check internal SubjectName duplicates
    if (seenNames.has(subject.SubjectName)) {
      errors.push(
        `รายการที่ ${i + 1}: ชื่อวิชาซ้ำกับรายการที่ ${seenNames.get(subject.SubjectName)! + 1} (${subject.SubjectName})`
      );
    } else {
      seenNames.set(subject.SubjectName, i);

      // Check database SubjectName duplicates
      const nameError = await validateNoDuplicateSubjectName(subject.SubjectName);
      if (nameError) {
        errors.push(`รายการที่ ${i + 1}: ${nameError}`);
      }
    }
  }

  return errors;
}

/**
 * Validate multiple subjects for bulk update
 * Checks that all subjects exist
 */
export async function validateBulkUpdateSubjects(
  subjects: UpdateSubjectInput[]
): Promise<string[]> {
  const errors: string[] = [];

  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    if (!subject) continue;
    
    const existsError = await validateSubjectExists(subject.SubjectCode);

    if (existsError) {
      errors.push(`รายการที่ ${i + 1}: ${existsError}`);
    }
  }

  return errors;
}
