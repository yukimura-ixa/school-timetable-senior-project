/**
 * Application Layer: Subject Server Actions
 *
 * Server Actions for subject management feature.
 * Handles SubjectCode trimming and dual uniqueness validation (code + name).
 *
 * @module subject.actions
 */

"use server";

import * as v from "valibot";
import { createAction } from "@/shared/lib/action-wrapper";
import { createLogger } from "@/lib/logger";

const log = createLogger("SubjectActions");
import { withPrismaTransaction } from "@/lib/prisma-transaction";
import { subjectRepository } from "../../infrastructure/repositories/subject.repository";
import {
  trimSubjectCode,
  validateNoDuplicateSubjectCode,
  validateNoDuplicateSubjectName,
  validateSubjectExists,
} from "../../domain/services/subject-validation.service";
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
} from "../schemas/subject.schemas";

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
export const getSubjectsAction = createAction(
  v.object({}),
  async () => {
    return await subjectRepository.findAll();
  },
);

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
  },
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
  },
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
    log.info("[CREATE_SUBJECT_START]", {
      nodeEnv: process.env.NODE_ENV,
      originalCode: input.SubjectCode,
      subjectName: input.SubjectName,
      category: input.Category,
    });

    // Trim SubjectCode
    const trimmedCode = trimSubjectCode(input.SubjectCode);
    log.debug("[TRIM_CODE]", { original: input.SubjectCode, trimmed: trimmedCode });

    // Validate no duplicate SubjectCode
    log.debug("[VALIDATE_CODE_START]", { code: trimmedCode });
    const codeError = await validateNoDuplicateSubjectCode(trimmedCode);
    if (codeError) {
      log.warn("[VALIDATE_CODE_FAILED]", { error: codeError, code: trimmedCode });
      throw new Error(codeError);
    }
    log.debug("[VALIDATE_CODE_SUCCESS]", { code: trimmedCode });

    // Validate no duplicate SubjectName
    log.debug("[VALIDATE_NAME_START]", { name: input.SubjectName });
    const nameError = await validateNoDuplicateSubjectName(input.SubjectName);
    if (nameError) {
      log.warn("[VALIDATE_NAME_FAILED]", { error: nameError, name: input.SubjectName });
      throw new Error(nameError);
    }
    log.debug("[VALIDATE_NAME_SUCCESS]", { name: input.SubjectName });

    // Create subject with trimmed code
    log.debug("[REPOSITORY_CREATE_START]", { trimmedCode });
    const subject = await subjectRepository.create({
      ...input,
      SubjectCode: trimmedCode,
    });
    log.info("[CREATE_SUBJECT_SUCCESS]", {
      subjectCode: subject.SubjectCode,
      subjectName: subject.SubjectName,
      category: subject.Category,
    });

    return subject;
  },
);

/**
 * Create multiple subjects (bulk operation)
 * Validates all subjects before creating any
 * Uses Prisma transaction for atomicity - all succeed or all fail.
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
    // Use transaction for atomicity - all succeed or all fail
    return await withPrismaTransaction(async (tx) => {
      // Phase 1: Validate ALL subjects before creating any
      const errors: string[] = [];
      const seenCodes = new Map<string, number>();
      const seenNames = new Map<string, number>();

      // Trim all SubjectCodes first
      const trimmedInputs = input.map((subject) => ({
        ...subject,
        SubjectCode: trimSubjectCode(subject.SubjectCode),
      }));

      for (let i = 0; i < trimmedInputs.length; i++) {
        const subject = trimmedInputs[i];
        if (!subject) continue;

        const trimmedCode = subject.SubjectCode;

        // Check internal SubjectCode duplicates
        if (seenCodes.has(trimmedCode)) {
          errors.push(
            `รายการที่ ${i + 1}: รหัสวิชาซ้ำกับรายการที่ ${seenCodes.get(trimmedCode)! + 1} (${trimmedCode})`,
          );
        } else {
          seenCodes.set(trimmedCode, i);

          // Check database SubjectCode duplicates using transaction client
          const existingByCode = await tx.subject.findUnique({
            where: { SubjectCode: trimmedCode },
          });

          if (existingByCode) {
            errors.push(
              `รายการที่ ${i + 1}: มีวิชานี้อยู่แล้ว กรุณาตรวจสอบอีกครั้ง`,
            );
          }
        }

        // Check internal SubjectName duplicates
        if (seenNames.has(subject.SubjectName)) {
          errors.push(
            `รายการที่ ${i + 1}: ชื่อวิชาซ้ำกับรายการที่ ${seenNames.get(subject.SubjectName)! + 1} (${subject.SubjectName})`,
          );
        } else {
          seenNames.set(subject.SubjectName, i);

          // Check database SubjectName duplicates using transaction client
          const existingByName = await tx.subject.findFirst({
            where: { SubjectName: subject.SubjectName },
          });

          if (existingByName) {
            errors.push(
              `รายการที่ ${i + 1}: มีชื่อวิชานี้อยู่แล้ว กรุณาตรวจสอบอีกครั้ง`,
            );
          }
        }
      }

      // If any validation errors, throw before creating anything
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      // Phase 2: Create all subjects within the transaction
      const created = await Promise.all(
        trimmedInputs.map((data) =>
          tx.subject.create({
            data: {
              SubjectCode: data.SubjectCode,
              SubjectName: data.SubjectName,
              Credit: data.Credit,
              Category: data.Category,
              LearningArea: data.LearningArea,
              ActivityType: data.ActivityType,
              IsGraded: data.IsGraded,
              Description: data.Description,
            },
          }),
        ),
      );

      return created;
    });
  },
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
  },
);

/**
 * Update multiple subjects (bulk operation)
 * Validates all subjects exist before updating any
 * Uses Prisma transaction for atomicity - all succeed or all fail.
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
    // Use transaction for atomicity - all succeed or all fail
    return await withPrismaTransaction(async (tx) => {
      // Phase 1: Validate ALL subjects exist before updating any
      const errors: string[] = [];

      for (let i = 0; i < input.length; i++) {
        const subject = input[i];
        if (!subject) continue;

        const existing = await tx.subject.findUnique({
          where: { SubjectCode: subject.SubjectCode },
        });

        if (!existing) {
          errors.push(`รายการที่ ${i + 1}: ไม่พบวิชานี้ กรุณาตรวจสอบอีกครั้ง`);
        }
      }

      // If any validation errors, throw before updating anything
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      // Phase 2: Update all subjects within the transaction
      const updated = await Promise.all(
        input.map((data) => {
          const trimmedCode = trimSubjectCode(data.SubjectCode);
          return tx.subject.update({
            where: { SubjectCode: data.SubjectCode },
            data: {
              SubjectCode: trimmedCode,
              SubjectName: data.SubjectName,
              Credit: data.Credit,
              Category: data.Category,
              LearningArea: data.LearningArea,
              ActivityType: data.ActivityType,
              IsGraded: data.IsGraded,
              Description: data.Description,
            },
          });
        }),
      );

      return updated;
    });
  },
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
  },
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
export const getSubjectCountAction = createAction(
  v.object({}),
  async () => {
    const count = await subjectRepository.count();
    return { count };
  },
);
