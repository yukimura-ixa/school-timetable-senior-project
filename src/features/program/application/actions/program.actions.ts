/**
 * Application Layer: Program Server Actions
 * 
 * Server Actions for program management feature.
 * Uses action wrapper for auth, validation, and error handling.
 * 
 * @module program.actions
 */

'use server';

import { createAction } from '@/shared/lib/action-wrapper';
import { programRepository } from '../../infrastructure/repositories/program.repository';
import {
  validateNoDuplicateProgram,
  validateNoDuplicateProgramForUpdate,
  validateProgramExists,
} from '../../domain/services/program-validation.service';
import {
  createProgramSchema,
  updateProgramSchema,
  deleteProgramSchema,
  getProgramByIdSchema,
  getProgramsByYearSchema,
  type CreateProgramInput,
  type UpdateProgramInput,
  type DeleteProgramInput,
  type GetProgramByIdInput,
  type GetProgramsByYearInput,
} from '../schemas/program.schemas';

/**
 * Get all programs with gradelevel and subject relations
 * 
 * @returns Array of all programs
 * 
 * @example
 * ```tsx
 * const programs = await getProgramsAction();
 * if (!programs.success) {
 *   console.error(programs.error);
 * } else {
 *   console.log(programs.data); // program[]
 * }
 * ```
 */
export async function getProgramsAction() {
  try {
    const programs = await programRepository.findAll();
    return { success: true as const, data: programs };
  } catch (error) {
    return {
      success: false as const,
      error: 'ไม่สามารถดึงข้อมูลหลักสูตรได้',
    };
  }
}

/**
 * Get programs by Year
 * Returns programs where all gradelevels have the specified Year
 * Optionally filters by Semester and AcademicYear
 * 
 * @param input - Year number, optional Semester and AcademicYear
 * @returns Array of programs
 * 
 * @example
 * ```tsx
 * const result = await getProgramsByYearAction({ Year: 1, Semester: "SEMESTER_1", AcademicYear: 2568 });
 * if (result.success) {
 *   console.log(result.data); // program[]
 * }
 * ```
 */
export const getProgramsByYearAction = createAction(
  getProgramsByYearSchema,
  async (input: GetProgramsByYearInput) => {
    const programs = await programRepository.findByYear(
      input.Year,
      input.Semester,
      input.AcademicYear
    );
    return programs;
  }
);

/**
 * Get a single program by ID with relations
 * 
 * @param input - ProgramID
 * @returns Single program or null
 * 
 * @example
 * ```tsx
 * const result = await getProgramByIdAction({ ProgramID: 1 });
 * if (result.success) {
 *   console.log(result.data); // program | null
 * }
 * ```
 */
export const getProgramByIdAction = createAction(
  getProgramByIdSchema,
  async (input: GetProgramByIdInput) => {
    const program = await programRepository.findById(input.ProgramID);
    return program;
  }
);

/**
 * Create a program with uniqueness validation
 * Validates unique combination of ProgramName, Semester, AcademicYear
 * Connects to gradelevels and subjects via their IDs
 * 
 * @param input - ProgramName, Semester, AcademicYear, gradelevel[], subject[]
 * @returns Created program
 * 
 * @example
 * ```tsx
 * const result = await createProgramAction({
 *   ProgramName: "วิทยาศาสตร์-คณิตศาสตร์",
 *   Semester: "SEMESTER_1",
 *   AcademicYear: 2568,
 *   gradelevel: [{ GradeID: "101" }, { GradeID: "102" }],
 *   subject: [{ SubjectCode: "MATH101" }, { SubjectCode: "SCI101" }],
 * });
 * ```
 */
export const createProgramAction = createAction(
  createProgramSchema,
  async (input: CreateProgramInput) => {
    // Validate no duplicate (ProgramName + Semester + AcademicYear)
    const duplicateError = await validateNoDuplicateProgram(
      input.ProgramName,
      input.Semester,
      input.AcademicYear
    );
    if (duplicateError) {
      throw new Error(duplicateError);
    }

    // Create program
    const program = await programRepository.create(input);
    
    // Note: revalidateTag is optional in Next.js 16
    // Commented out for now as it requires second parameter
    // revalidateTag('programs');

    return program;
  }
);

/**
 * Update a program
 * Validates unique combination of ProgramName, Semester, AcademicYear (excluding current program)
 * Replaces all gradelevel and subject connections
 * 
 * @param input - ProgramID, ProgramName, Semester, AcademicYear, gradelevel[], subject[]
 * @returns Updated program
 * 
 * @example
 * ```tsx
 * const result = await updateProgramAction({
 *   ProgramID: 1,
 *   ProgramName: "วิทยาศาสตร์-คณิตศาสตร์",
 *   Semester: "SEMESTER_1",
 *   AcademicYear: 2568,
 *   gradelevel: [{ GradeID: "101" }],
 *   subject: [{ SubjectCode: "MATH101" }],
 * });
 * ```
 */
export const updateProgramAction = createAction(
  updateProgramSchema,
  async (input: UpdateProgramInput) => {
    // Validate program exists
    const existsError = await validateProgramExists(input.ProgramID);
    if (existsError) {
      throw new Error(existsError);
    }

    // Validate no duplicate (excluding self)
    const duplicateError = await validateNoDuplicateProgramForUpdate(
      input.ProgramID,
      input.ProgramName,
      input.Semester,
      input.AcademicYear
    );
    if (duplicateError) {
      throw new Error(duplicateError);
    }

    // Update program
    const program = await programRepository.update(input.ProgramID, {
      ProgramName: input.ProgramName,
      Semester: input.Semester,
      AcademicYear: input.AcademicYear,
      gradelevel: input.gradelevel,
      subject: input.subject,
    });

    return program;
  }
);

/**
 * Delete a program by ID
 * 
 * @param input - ProgramID
 * @returns Deleted program
 * 
 * @example
 * ```tsx
 * const result = await deleteProgramAction({ ProgramID: 1 });
 * if (result.success) {
 *   console.log(`Deleted: ${result.data.ProgramName}`);
 * }
 * ```
 */
export const deleteProgramAction = createAction(
  deleteProgramSchema,
  async (input: DeleteProgramInput) => {
    // Validate program exists
    const existsError = await validateProgramExists(input.ProgramID);
    if (existsError) {
      throw new Error(existsError);
    }

    // Delete program
    const program = await programRepository.delete(input.ProgramID);

    return program;
  }
);

/**
 * Get program count (statistics)
 * 
 * @returns Count of all programs
 * 
 * @example
 * ```tsx
 * const result = await getProgramCountAction();
 * if (result.success) {
 *   console.log(`Total: ${result.data.count}`);
 * }
 * ```
 */
export async function getProgramCountAction() {
  try {
    const count = await programRepository.count();
    return { success: true as const, data: { count } };
  } catch (error) {
    return {
      success: false as const,
      error: 'ไม่สามารถนับจำนวนหลักสูตรได้',
    };
  }
}
