/**
 * Application Layer: Subject Server Actions
 * 
 * Server Actions for subject management feature.
 * Handles SubjectCode trimming and dual uniqueness validation (code + name).
 * 
 * @module subject.actions
 */

'use server';

import { createAction } from '@/shared/lib/action-wrapper';
import { subjectRepository } from '../../infrastructure/repositories/subject.repository';
import {
  trimSubjectCode,
  validateNoDuplicateSubjectCode,
  validateNoDuplicateSubjectName,
  validateSubjectExists,
  validateBulkCreateSubjects,
  validateBulkUpdateSubjects,
} from '../../domain/services/subject-validation.service';
import {
  createSubjectSchema,
  createSubjectsSchema,
  updateSubjectSchema,
  updateSubjectsSchema,
  deleteSubjectsSchema,
  getSubjectByCodeSchema,
  getSubjectsByGradeSchema,
  type CreateSubjectInput,
  type CreateSubjectsInput,
  type UpdateSubjectInput,
  type UpdateSubjectsInput,
  type DeleteSubjectsInput,
  type GetSubjectByCodeInput,
  type GetSubjectsByGradeInput,
} from '../schemas/subject.schemas';

/**
 * Get all subjects ordered by SubjectCode
 * 
 * @returns Array of all subjects
 * 
 * @example
 * ```tsx
 * const subjects = await getSubjectsAction();
 * if (!subjects.success) {
 *   console.error(subjects.error);
 * } else {
 *   console.log(subjects.data); // subject[]
 * }
 * ```
 */
export async function getSubjectsAction() {
  try {
    const subjects = await subjectRepository.findAll();
    return { success: true as const, data: subjects };
  } catch (error) {
    return {
      success: false as const,
      error: 'ไม่สามารถดึงข้อมูลวิชาได้',
    };
  }
}

/**
 * Get a single subject by SubjectCode
 * 
 * @param input - SubjectCode
 * @returns Single subject or null
 * 
 * @example
 * ```tsx
 * const result = await getSubjectByCodeAction({ SubjectCode: "MATH101" });
 * if (result.success) {
 *   console.log(result.data); // subject | null
 * }
 * ```
 */
export const getSubjectByCodeAction = createAction(
  getSubjectByCodeSchema,
  async (input: GetSubjectByCodeInput) => {
    const subject = await subjectRepository.findByCode(input.SubjectCode);
    return subject;
  }
);

/**
 * Get subjects by grade
 * Returns subjects available for a specific grade level through program relationship
 * 
 * @param input - GradeID
 * @returns Array of subjects for the grade
 * 
 * @example
 * ```tsx
 * const result = await getSubjectsByGradeAction({ GradeID: "101" });
 * if (result.success) {
 *   console.log(result.data); // subject[]
 * }
 * ```
 */
export const getSubjectsByGradeAction = createAction(
  getSubjectsByGradeSchema,
  async (input: GetSubjectsByGradeInput) => {
    const subjects = await subjectRepository.findByGrade(input.GradeID);
    return subjects;
  }
);

/**
 * Create a single subject with validation
 * Validates SubjectCode and SubjectName uniqueness
 * Trims whitespace from SubjectCode
 * 
 * @param input - Subject data
 * @returns Created subject
 * 
 * @example
 * ```tsx
 * const result = await createSubjectAction({
 *   SubjectCode: "MATH 101", // Will be trimmed to "MATH101"
 *   SubjectName: "คณิตศาสตร์พื้นฐาน",
 *   Credit: "CREDIT_10",
 *   Category: "พื้นฐาน",
 *   ProgramID: null,
 * });
 * ```
 */
export const createSubjectAction = createAction(
  createSubjectSchema,
  async (input: CreateSubjectInput) => {
    // Trim SubjectCode
    const trimmedCode = trimSubjectCode(input.SubjectCode);

    // Validate no duplicate SubjectCode
    const codeError = await validateNoDuplicateSubjectCode(trimmedCode);
    if (codeError) {
      throw new Error(codeError);
    }

    // Validate no duplicate SubjectName
    const nameError = await validateNoDuplicateSubjectName(input.SubjectName);
    if (nameError) {
      throw new Error(nameError);
    }

    // Create subject with trimmed code
    const subject = await subjectRepository.create({
      ...input,
      SubjectCode: trimmedCode,
    });

    return subject;
  }
);

/**
 * Create multiple subjects (bulk operation)
 * Validates all subjects before creating any
 * 
 * @param input - Array of subjects
 * @returns Array of created subjects
 * 
 * @example
 * ```tsx
 * const result = await createSubjectsAction([
 *   { SubjectCode: "MATH101", SubjectName: "คณิตศาสตร์", ... },
 *   { SubjectCode: "SCI101", SubjectName: "วิทยาศาสตร์", ... },
 * ]);
 * ```
 */
export const createSubjectsAction = createAction(
  createSubjectsSchema,
  async (input: CreateSubjectsInput) => {
    // Trim all SubjectCodes
    const trimmedInputs = input.map((subject) => ({
      ...subject,
      SubjectCode: trimSubjectCode(subject.SubjectCode),
    }));

    // Validate all subjects
    const errors = await validateBulkCreateSubjects(trimmedInputs);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Create all subjects
    const created = await Promise.all(
      trimmedInputs.map((data) => subjectRepository.create(data))
    );

    return created;
  }
);

/**
 * Update a single subject
 * Validates subject exists
 * 
 * @param input - Subject data with SubjectCode
 * @returns Updated subject
 * 
 * @example
 * ```tsx
 * const result = await updateSubjectAction({
 *   SubjectCode: "MATH101",
 *   SubjectName: "คณิตศาสตร์ขั้นสูง",
 *   Credit: "CREDIT_15",
 *   Category: "เพิ่มเติม",
 *   ProgramID: 1,
 * });
 * ```
 */
export const updateSubjectAction = createAction(
  updateSubjectSchema,
  async (input: UpdateSubjectInput) => {
    // Validate subject exists
    const existsError = await validateSubjectExists(input.SubjectCode);
    if (existsError) {
      throw new Error(existsError);
    }

    // Trim SubjectCode
    const trimmedCode = trimSubjectCode(input.SubjectCode);

    // Update subject
    const subject = await subjectRepository.update(input.SubjectCode, {
      ...input,
      SubjectCode: trimmedCode,
    });

    return subject;
  }
);

/**
 * Update multiple subjects (bulk operation)
 * Validates all subjects exist before updating any
 * 
 * @param input - Array of subjects
 * @returns Array of updated subjects
 * 
 * @example
 * ```tsx
 * const result = await updateSubjectsAction([
 *   { SubjectCode: "MATH101", SubjectName: "คณิตศาสตร์", ... },
 *   { SubjectCode: "SCI101", SubjectName: "วิทยาศาสตร์", ... },
 * ]);
 * ```
 */
export const updateSubjectsAction = createAction(
  updateSubjectsSchema,
  async (input: UpdateSubjectsInput) => {
    // Validate all subjects exist
    const errors = await validateBulkUpdateSubjects(input);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Update all subjects
    const updated = await Promise.all(
      input.map((data) => {
        const trimmedCode = trimSubjectCode(data.SubjectCode);
        return subjectRepository.update(data.SubjectCode, {
          ...data,
          SubjectCode: trimmedCode,
        });
      })
    );

    return updated;
  }
);

/**
 * Delete multiple subjects
 * 
 * @param input - Array of SubjectCodes
 * @returns Delete result
 * 
 * @example
 * ```tsx
 * const result = await deleteSubjectsAction(["MATH101", "SCI101"]);
 * if (result.success) {
 *   console.log(`Deleted ${result.data.count} subjects`);
 * }
 * ```
 */
export const deleteSubjectsAction = createAction(
  deleteSubjectsSchema,
  async (input: DeleteSubjectsInput) => {
    const result = await subjectRepository.deleteMany(input.subjectCodes);

    return {
      count: result.count,
      message: `ลบข้อมูล ${result.count} วิชาสำเร็จ`,
    };
  }
);

/**
 * Get subject count (statistics)
 * 
 * @returns Count of all subjects
 * 
 * @example
 * ```tsx
 * const result = await getSubjectCountAction();
 * if (result.success) {
 *   console.log(`Total: ${result.data.count}`);
 * }
 * ```
 */
export async function getSubjectCountAction() {
  try {
    const count = await subjectRepository.count();
    return { success: true as const, data: { count } };
  } catch {
    return {
      success: false as const,
      error: 'ไม่สามารถนับจำนวนวิชาได้',
    };
  }
}
