/**
 * Application Layer: GradeLevel Server Actions
 * 
 * Server Actions for gradelevel management feature.
 * Uses action wrapper for auth, validation, and error handling.
 * 
 * @module gradelevel.actions
 */

'use server';

import { createAction } from '@/shared/lib/action-wrapper';
import { gradeLevelRepository } from '../../infrastructure/repositories/gradelevel.repository';
import {
  generateGradeId,
  validateNoDuplicateGradeLevel,
  validateBulkGradeLevels,
  findGradeLevelsForLock,
} from '../../domain/services/gradelevel-validation.service';
import {
  createGradeLevelSchema,
  createGradeLevelsSchema,
  updateGradeLevelSchema,
  updateGradeLevelsSchema,
  deleteGradeLevelsSchema,
  getGradeLevelsForLockSchema,
  type CreateGradeLevelInput,
  type CreateGradeLevelsInput,
  type UpdateGradeLevelInput,
  type UpdateGradeLevelsInput,
  type DeleteGradeLevelsInput,
  type GetGradeLevelsForLockInput,
} from '../schemas/gradelevel.schemas';

/**
 * Get all gradelevels ordered by GradeID with program relation
 * 
 * @returns Array of all gradelevels
 * 
 * @example
 * ```tsx
 * const gradelevels = await getGradeLevelsAction();
 * if (!gradelevels.success) {
 *   console.error(gradelevels.error);
 * } else {
 *   console.log(gradelevels.data); // gradelevel[]
 * }
 * ```
 */
export async function getGradeLevelsAction() {
  try {
    const gradelevels = await gradeLevelRepository.findAll();
    return { success: true as const, data: gradelevels };
  } catch (error) {
    return {
      success: false as const,
      error: 'ไม่สามารถดึงข้อมูลชั้นเรียนได้',
    };
  }
}

/**
 * Create a single gradelevel with duplicate validation
 * GradeID is auto-generated from Year + '0' + Number
 * 
 * @param input - Year and Number
 * @returns Created gradelevel
 * 
 * @example
 * ```tsx
 * const result = await createGradeLevelAction({ Year: 1, Number: 1 });
 * if (result.success) {
 *   console.log(result.data); // { GradeID: "101", Year: 1, Number: 1 }
 * }
 * ```
 */
export const createGradeLevelAction = createAction(
  createGradeLevelSchema,
  async (input: CreateGradeLevelInput) => {
    // Validate no duplicate
    const duplicateError = await validateNoDuplicateGradeLevel(input.Year, input.Number);
    if (duplicateError) {
      throw new Error(duplicateError);
    }

    // Create gradelevel
    const gradelevel = await gradeLevelRepository.create(input);
    
    // Note: revalidateTag is optional in Next.js 16
    // Commented out for now as it requires second parameter
    // revalidateTag('gradelevels');

    return gradelevel;
  }
);

/**
 * Create multiple gradelevels (bulk operation)
 * Validates all entries before creating any
 * 
 * @param input - Array of gradelevels
 * @returns Array of created gradelevels
 * 
 * @example
 * ```tsx
 * const result = await createGradeLevelsAction([
 *   { Year: 1, Number: 1 },
 *   { Year: 1, Number: 2 },
 * ]);
 * ```
 */
export const createGradeLevelsAction = createAction(
  createGradeLevelsSchema,
  async (input: CreateGradeLevelsInput) => {
    // Validate all gradelevels
    const errors = await validateBulkGradeLevels(input);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    // Create all gradelevels
    const created = await Promise.all(
      input.map((data) => gradeLevelRepository.create(data))
    );

    return created;
  }
);

/**
 * Update a single gradelevel
 * 
 * @param input - GradeID, Year, Number
 * @returns Updated gradelevel
 * 
 * @example
 * ```tsx
 * const result = await updateGradeLevelAction({
 *   GradeID: "101",
 *   Year: 1,
 *   Number: 2,
 * });
 * ```
 */
export const updateGradeLevelAction = createAction(
  updateGradeLevelSchema,
  async (input: UpdateGradeLevelInput) => {
    // Note: Year and Number should not normally be changed after creation
    // as GradeID depends on them. Consider if this should be allowed.
    const gradelevel = await gradeLevelRepository.update(input.GradeID, {
      Year: input.Year,
      Number: input.Number,
    });

    return gradelevel;
  }
);

/**
 * Update multiple gradelevels (bulk operation)
 * 
 * @param input - Array of gradelevels with GradeID
 * @returns Array of updated gradelevels
 * 
 * @example
 * ```tsx
 * const result = await updateGradeLevelsAction([
 *   { GradeID: "101", Year: 1, Number: 1 },
 *   { GradeID: "102", Year: 1, Number: 2 },
 * ]);
 * ```
 */
export const updateGradeLevelsAction = createAction(
  updateGradeLevelsSchema,
  async (input: UpdateGradeLevelsInput) => {
    const updated = await Promise.all(
      input.map((data) =>
        gradeLevelRepository.update(data.GradeID, {
          Year: data.Year,
          Number: data.Number,
        })
      )
    );

    return updated;
  }
);

/**
 * Delete multiple gradelevels
 * 
 * @param input - Array of GradeIDs
 * @returns Delete result
 * 
 * @example
 * ```tsx
 * const result = await deleteGradeLevelsAction(["101", "102", "103"]);
 * ```
 */
export const deleteGradeLevelsAction = createAction(
  deleteGradeLevelsSchema,
  async (input: DeleteGradeLevelsInput) => {
    const result = await gradeLevelRepository.deleteMany(input);

    return {
      count: result.count,
      message: `ลบข้อมูล ${result.count} ชั้นเรียนสำเร็จ`,
    };
  }
);

/**
 * Get gradelevels for lock feature
 * Finds gradelevels where multiple teachers are responsible for the same subject
 * 
 * @param input - SubjectCode, AcademicYear, Semester, TeacherIDs
 * @returns Array of gradelevels with shared teachers
 * 
 * @example
 * ```tsx
 * const result = await getGradeLevelsForLockAction({
 *   SubjectCode: "MATH101",
 *   AcademicYear: 2024,
 *   Semester: "SEMESTER_1",
 *   TeacherIDs: [1, 2, 3],
 * });
 * ```
 */
export const getGradeLevelsForLockAction = createAction(
  getGradeLevelsForLockSchema,
  async (input: GetGradeLevelsForLockInput) => {
    const gradelevels = await findGradeLevelsForLock(
      input.SubjectCode,
      input.AcademicYear,
      input.Semester,
      input.TeacherIDs
    );

    return gradelevels;
  }
);

/**
 * Get gradelevel count (statistics)
 * 
 * @returns Count of all gradelevels
 * 
 * @example
 * ```tsx
 * const result = await getGradeLevelCountAction();
 * if (result.success) {
 *   console.log(`Total: ${result.data.count}`);
 * }
 * ```
 */
export async function getGradeLevelCountAction() {
  try {
    const count = await gradeLevelRepository.count();
    return { success: true as const, data: { count } };
  } catch (error) {
    return {
      success: false as const,
      error: 'ไม่สามารถนับจำนวนชั้นเรียนได้',
    };
  }
}
