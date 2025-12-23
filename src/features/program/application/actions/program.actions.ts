/**
 * Application Layer: Program Server Actions (MOE-Compliant)
 *
 * Server Actions for MOE-compliant program management feature.
 * Uses action wrapper for auth, validation, and error handling.
 *
 * @module program.actions
 */

"use server";

import * as v from "valibot";
import { createAction } from "@/shared/lib/action-wrapper";
import { programRepository } from "../../infrastructure/repositories/program.repository";
import {
  validateNoDuplicateProgram,
  validateNoDuplicateProgramForUpdate,
  validateProgramExists,
  validateUniqueProgramCode,
  validateUniqueProgramCodeForUpdate,
} from "../../domain/services/program-validation.service";
import { validateProgramMOECredits } from "../../domain/services/moe-validation.service";
import type { program_subject, subject } from "@/prisma/generated/client";
import type { ProgramSubjectWithSubject } from "../../domain/types/program.types";
import {
  createProgramSchema,
  updateProgramSchema,
  deleteProgramSchema,
  getProgramByIdSchema,
  getProgramByGradeSchema,
  getProgramsByYearSchema,
  assignSubjectsToProgramSchema,
  type CreateProgramInput,
  type GetProgramByGradeInput,
  type UpdateProgramInput,
  type DeleteProgramInput,
  type GetProgramByIdInput,
  type GetProgramsByYearInput,
  type AssignSubjectsToProgramInput,
} from "../schemas/program.schemas";
import { createLogger } from "@/lib/logger";

const log = createLogger("ProgramActions");

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
export const getProgramsAction = createAction(v.object({}), async () => {
  return await programRepository.findAll();
});

/**
 * Get programs by Year (optional), Track (optional), IsActive (optional)
 *
 * @param input - Optional filters: Year, Track, IsActive
 * @returns Array of programs
 *
 * @example
 * ```tsx
 * const result = await getProgramsByYearAction({ Year: 1 });
 * if (result.success) {
 *   console.log(result.data); // program[]
 * }
 * ```
 */
export const getProgramsByYearAction = createAction(
  getProgramsByYearSchema,
  async (input: GetProgramsByYearInput) => {
    const programs = await programRepository.findByFilters({
      Year: input.Year,
      Track: input.Track,
      IsActive: input.IsActive,
    });
    return programs;
  },
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
  },
);
/**
 * Get program by grade
 * Returns program associated with a specific grade level including subjects
 *
 * @param input - GradeID, optional Semester and AcademicYear for teacher data
 * @returns Program with subjects or null (includes teacher assignments if semester/year provided)
 *
 * @example
 * ```tsx
 * const result = await getProgramByGradeAction({
 *   GradeID: "101",
 *   Semester: "SEMESTER_1",
 *   AcademicYear: 2567
 * });
 * if (result.success && result.data) {
 *   console.log(result.data.subjects); // subject[] with Credits, Category, teachers_responsibility
 * }
 * ```
 */
export const getProgramByGradeAction = createAction(
  getProgramByGradeSchema,
  async (input: GetProgramByGradeInput) => {
    const program = await programRepository.findByGrade(
      input.GradeID,
      input.Semester,
      input.AcademicYear,
    );
    return program;
  },
);

/**
 * Create a MOE-compliant program
 * Validates unique ProgramCode and Year + Track combination
 * Does NOT assign subjects initially (use assignSubjectsToProgramAction)
 *
 * @param input - ProgramCode, ProgramName, Year, Track, MinTotalCredits, Description, IsActive
 * @returns Created program
 *
 * @example
 * ```tsx
 * const result = await createProgramAction({
 *   ProgramCode: "M1-SCI",
 *   ProgramName: "หลักสูตรวิทยาศาสตร์-คณิตศาสตร์ ม.1",
 *   Year: 1,
 *   Track: "SCIENCE_MATH",
 *   MinTotalCredits: 30,
 * });
 * ```
 */
export const createProgramAction = createAction(
  createProgramSchema,
  async (input: CreateProgramInput) => {
    // Validate unique ProgramCode
    const codeError = await validateUniqueProgramCode(input.ProgramCode);
    if (codeError) {
      throw new Error(codeError);
    }

    // Validate no duplicate (Year + Track)
    const duplicateError = await validateNoDuplicateProgram(
      input.Year,
      input.Track,
    );
    if (duplicateError) {
      throw new Error(duplicateError);
    }

    // Create program
    const program = await programRepository.create(input);

    return program;
  },
);

/**
 * Update a MOE-compliant program
 * Validates unique ProgramCode and Year + Track (excluding current program)
 * Does NOT update subject assignments (use assignSubjectsToProgramAction)
 *
 * @param input - ProgramID, ProgramCode, ProgramName, Year, Track, MinTotalCredits, Description, IsActive
 * @returns Updated program
 *
 * @example
 * ```tsx
 * const result = await updateProgramAction({
 *   ProgramID: 1,
 *   ProgramName: "หลักสูตรวิทยาศาสตร์-คณิตศาสตร์ ม.1 (ปรับปรุง)",
 *   MinTotalCredits: 32,
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

    // Validate unique ProgramCode (if changed)
    if (input.ProgramCode) {
      const codeError = await validateUniqueProgramCodeForUpdate(
        input.ProgramID,
        input.ProgramCode,
      );
      if (codeError) {
        throw new Error(codeError);
      }
    }

    // Validate no duplicate Year + Track (if changed)
    // Fetch current program to check
    const currentProgram = await programRepository.findById(input.ProgramID);
    if (!currentProgram) {
      throw new Error("ไม่พบหลักสูตรที่ระบุ");
    }

    const yearToCheck = currentProgram.Year;
    const trackToCheck = input.Track ?? currentProgram.Track;

    const duplicateError = await validateNoDuplicateProgramForUpdate(
      input.ProgramID,
      yearToCheck,
      trackToCheck,
    );
    if (duplicateError) {
      throw new Error(duplicateError);
    }

    // Update program
    const program = await programRepository.update(input.ProgramID, {
      ProgramCode: input.ProgramCode,
      ProgramName: input.ProgramName,
      Track: input.Track,
      Description: input.Description,
      MinTotalCredits: input.MinTotalCredits,
      IsActive: input.IsActive,
    });

    return program;
  },
);

/**
 * Assign subjects to a program with MOE credit validation
 * Replaces all existing subject assignments
 * Validates against MOE minimum credits per learning area
 *
 * @param input - ProgramID, subjects[] with Category, IsMandatory, MinCredits, MaxCredits
 * @returns Updated program with subjects
 *
 * @example
 * ```tsx
 * const result = await assignSubjectsToProgramAction({
 *   ProgramID: 1,
 *   subjects: [
 *     { SubjectCode: "TH101", Category: "CORE", IsMandatory: true, MinCredits: 2, MaxCredits: 2 },
 *     { SubjectCode: "MATH101", Category: "CORE", IsMandatory: true, MinCredits: 3, MaxCredits: 3 },
 *   ],
 * });
 * ```
 */
export const assignSubjectsToProgramAction = createAction(
  assignSubjectsToProgramSchema,
  async (input: AssignSubjectsToProgramInput) => {
    // Validate program exists
    const existsError = await validateProgramExists(input.ProgramID);
    if (existsError) {
      throw new Error(existsError);
    }

    // Assign subjects (transaction-based)
    const updatedProgram = await programRepository.assignSubjects(input);

    if (!updatedProgram) {
      throw new Error("ไม่สามารถอัปเดตวิชาในหลักสูตรได้");
    }

    // Validate MOE credits using updated assignments (with subject details)
    // Note: program_subject is already correctly typed via Prisma's include
    const validationResult = validateProgramMOECredits(
      updatedProgram.Year,
      updatedProgram.program_subject as ProgramSubjectWithSubject[],
    );

    // Log warnings if not fully compliant (could display in UI)
    if (!validationResult.isValid && validationResult.warnings.length > 0) {
      log.warn("MOE Validation Warnings", {
        warnings: validationResult.warnings,
      });
    }

    return {
      program: updatedProgram,
      moeValidation: validationResult,
    };
  },
);

/**
 * Delete a program by ID
 * Note: Will cascade delete program_subject entries
 * Will set ProgramID to null in gradelevel (due to SetNull cascade)
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
  },
);

/**
 * Get program count with optional filters
 *
 * @param filters - Optional Year, Track, IsActive filters
 * @returns Count of programs matching filters
 *
 * @example
 * ```tsx
 * const result = await getProgramCountAction({ Year: 1, IsActive: true });
 * if (result.success) {
 *   console.log(`Total: ${result.data.count}`);
 * }
 * ```
 */
export const getProgramCountAction = createAction(
  getProgramsByYearSchema,
  async (input: GetProgramsByYearInput) => {
    const count = await programRepository.count({
      Year: input.Year,
      Track: input.Track,
      IsActive: input.IsActive,
    });
    return { count };
  },
);

/**
 * Get programs grouped by Year (for management page)
 *
 * @returns Record of Year -> program[]
 *
 * @example
 * ```tsx
 * const result = await getProgramsGroupedByYearAction();
 * if (result.success) {
 *   console.log(result.data); // { 1: [...], 2: [...], ... }
 * }
 * ```
 */
export const getProgramsGroupedByYearAction = createAction(
  v.object({}),
  async () => {
    return await programRepository.findGroupedByYear();
  },
);
