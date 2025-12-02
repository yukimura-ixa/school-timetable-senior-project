/**
 * Application Layer: Teacher Server Actions
 *
 * Server Actions for teacher management feature.
 * Uses action wrapper for auth, validation, and error handling.
 *
 * @module teacher.actions
 */

"use server";

import * as v from "valibot";
import { createAction } from "@/shared/lib/action-wrapper";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import type { teacher } from "@/prisma/generated/client";
import { teacherRepository } from "../../infrastructure/repositories/teacher.repository";
import {
  checkDuplicateTeacher,
  checkEmailConflict,
} from "../../domain/services/teacher-validation.service";
import { withPrismaTransaction } from "@/lib/prisma-transaction";
import {
  createTeacherSchema,
  createTeachersSchema,
  updateTeacherSchema,
  updateTeachersSchema,
  deleteTeachersSchema,
  getTeacherByIdSchema,
  type CreateTeacherInput,
  type CreateTeachersInput,
  type UpdateTeacherInput,
  type UpdateTeachersInput,
  type DeleteTeachersInput,
  type GetTeacherByIdInput,
} from "../schemas/teacher.schemas";

/**
 * Get all teachers ordered by firstname
 *
 * @returns Array of all teachers
 *
 * @example
 * ```tsx
 * const teachers = await getTeachersAction();
 * if (!teachers.success) {
 *   console.error(teachers.error);
 * } else {
 *   console.log(teachers.data); // teacher[]
 * }
 * ```
 */

export const getTeachersAction = createAction(
  v.object({}),
  async () => {
    return await teacherRepository.findAll();
  },
);

/**
 * Get a single teacher by ID
 *
 * @param input - Teacher ID
 * @returns Single teacher or null
 *
 * @example
 * ```tsx
 * const result = await getTeacherByIdAction({ TeacherID: 1 });
 * if (result.success) {
 *   console.log(result.data); // teacher | null
 * }
 * ```
 */
export const getTeacherByIdAction = createAction(
  getTeacherByIdSchema,
  async (input: GetTeacherByIdInput) => {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    const userRole = normalizeAppRole(session?.user?.role);
    const userId = session?.user?.id;

    // SECURITY: Enforce role-based access
    // Only Admin or the Teacher themselves can view their profile details
    if (!isAdminRole(userRole)) {
      const isOwner =
        userRole === "teacher" && userId === input.TeacherID.toString();
      if (!isOwner) {
        throw new Error("Unauthorized: You can only view your own profile.");
      }
    }

    const teacher = await teacherRepository.findById(input.TeacherID);
    return teacher;
  },
);

/**
 * Create a single teacher
 *
 * Validates:
 * - No duplicate teacher (exact match on all fields)
 * - Email not already in use
 *
 * @param input - Teacher data
 * @returns Created teacher with TeacherID
 *
 * @example
 * ```tsx
 * const result = await createTeacherAction({
 *   Prefix: 'นาย',
 *   Firstname: 'สมชาย',
 *   Lastname: 'ใจดี',
 *   Email: 'somchai@school.ac.th',
 *   Department: 'คณิตศาสตร์',
 * });
 *
 * if (!result.success) {
 *   alert(result.error);
 * } else {
 *   console.log('Created teacher:', result.data.TeacherID);
 * }
 * ```
 */
export const createTeacherAction = createAction(
  createTeacherSchema,
  async (input: CreateTeacherInput) => {
    // 1. Check for duplicate teacher
    const existingTeacher = await teacherRepository.findDuplicate(input);
    const duplicateCheck = checkDuplicateTeacher(input, existingTeacher);

    if (duplicateCheck.isDuplicate) {
      throw new Error(duplicateCheck.reason);
    }

    // 2. Check for email conflict
    const teacherWithEmail = await teacherRepository.findByEmail(input.Email);
    const emailCheck = checkEmailConflict(input.Email, teacherWithEmail);

    if (emailCheck.isDuplicate) {
      throw new Error(emailCheck.reason);
    }

    // 3. Create teacher
    const newTeacher = await teacherRepository.create(input);

    // 4. Revalidate cache (optional - for future cache optimization)
    // revalidateTag('teachers');

    return newTeacher;
  },
);

/**
 * Create multiple teachers (bulk operation)
 *
 * Validates each teacher:
 * - No duplicate teacher
 * - Unique email
 *
 * Uses Prisma transaction for atomicity - all succeed or all fail.
 *
 * @param input - Array of teacher data
 * @returns Array of created teacher IDs
 *
 * @example
 * ```tsx
 * const result = await createTeachersAction([
 *   { Prefix: 'นาย', Firstname: 'สมชาย', ... },
 *   { Prefix: 'นาง', Firstname: 'สมหญิง', ... },
 * ]);
 *
 * if (result.success) {
 *   console.log('Created teacher IDs:', result.data); // [1, 2]
 * }
 * ```
 */
export const createTeachersAction = createAction(
  createTeachersSchema,
  async (input: CreateTeachersInput) => {
    // Use transaction for atomicity - all succeed or all fail
    return await withPrismaTransaction(async (tx) => {
      // Phase 1: Validate ALL teachers before creating any
      const validationErrors: string[] = [];
      const emailsInBatch = new Set<string>();

      for (const teacherData of input) {
        // Check for duplicate email within the batch
        if (emailsInBatch.has(teacherData.Email)) {
          validationErrors.push(
            `อีเมล ${teacherData.Email} ซ้ำกันในรายการที่อัปโหลด`,
          );
          continue;
        }
        emailsInBatch.add(teacherData.Email);

        // Check for duplicate teacher in database
        const existingTeacher = await tx.teacher.findFirst({
          where: {
            Prefix: teacherData.Prefix,
            Firstname: teacherData.Firstname,
            Lastname: teacherData.Lastname,
            Email: teacherData.Email,
            Department: teacherData.Department,
          },
        });

        const duplicateCheck = checkDuplicateTeacher(
          teacherData,
          existingTeacher,
        );

        if (duplicateCheck.isDuplicate && duplicateCheck.reason) {
          validationErrors.push(duplicateCheck.reason);
          continue;
        }

        // Check for email conflict in database
        const teacherWithEmail = await tx.teacher.findFirst({
          where: { Email: teacherData.Email },
        });

        const emailCheck = checkEmailConflict(
          teacherData.Email,
          teacherWithEmail,
        );

        if (emailCheck.isDuplicate && emailCheck.reason) {
          validationErrors.push(emailCheck.reason);
        }
      }

      // If any validation errors, throw before creating anything
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("; "));
      }

      // Phase 2: Create all teachers within the transaction
      const createdTeachers = await Promise.all(
        input.map(async (teacherData) => {
          return await tx.teacher.create({
            data: {
              Prefix: teacherData.Prefix,
              Firstname: teacherData.Firstname,
              Lastname: teacherData.Lastname,
              Department: teacherData.Department,
              Email: teacherData.Email,
            },
          });
        }),
      );

      // Return array of IDs
      return createdTeachers.map((t: teacher) => t.TeacherID);
    });
  },
);

/**
 * Update a single teacher
 *
 * Validates:
 * - Teacher exists
 * - Email not in use by another teacher
 *
 * @param input - Updated teacher data with TeacherID
 * @returns Updated teacher
 *
 * @example
 * ```tsx
 * const result = await updateTeacherAction({
 *   TeacherID: 1,
 *   Prefix: 'นาย',
 *   Firstname: 'สมชาย',
 *   Lastname: 'ใจดี',
 *   Email: 'somchai.new@school.ac.th',
 *   Department: 'วิทยาศาสตร์',
 * });
 *
 * if (!result.success) {
 *   alert(result.error);
 * }
 * ```
 */
export const updateTeacherAction = createAction(
  updateTeacherSchema,
  async (input: UpdateTeacherInput) => {
    // 1. Check if teacher exists
    const existingTeacher = await teacherRepository.findById(input.TeacherID);

    if (!existingTeacher) {
      throw new Error("ไม่พบข้อมูลของครูท่านนี้");
    }

    // 2. Check for email conflict (excluding current teacher)
    const teacherWithEmail = await teacherRepository.findByEmail(input.Email);
    const emailCheck = checkEmailConflict(
      input.Email,
      teacherWithEmail,
      input.TeacherID,
    );

    if (emailCheck.isDuplicate) {
      throw new Error(emailCheck.reason);
    }

    // 3. Update teacher
    const updatedTeacher = await teacherRepository.update(input.TeacherID, {
      Prefix: input.Prefix,
      Firstname: input.Firstname,
      Lastname: input.Lastname,
      Email: input.Email,
      Department: input.Department,
    });

    // 4. Revalidate cache (optional - for future cache optimization)
    // revalidateTag('teachers');

    return updatedTeacher;
  },
);

/**
 * Update multiple teachers (bulk operation)
 *
 * Uses Prisma transaction for atomicity - all succeed or all fail.
 *
 * @param input - Array of updated teacher data
 * @returns Array of updated teacher IDs
 *
 * @example
 * ```tsx
 * const result = await updateTeachersAction([
 *   { TeacherID: 1, Prefix: 'นาย', ... },
 *   { TeacherID: 2, Prefix: 'นาง', ... },
 * ]);
 * ```
 */
export const updateTeachersAction = createAction(
  updateTeachersSchema,
  async (input: UpdateTeachersInput) => {
    // Use transaction for atomicity - all succeed or all fail
    return await withPrismaTransaction(async (tx) => {
      // Phase 1: Validate ALL teachers before updating any
      const validationErrors: string[] = [];
      const emailsInBatch = new Map<string, number>(); // email -> TeacherID using it

      for (const teacherData of input) {
        // Track emails within batch to detect conflicts
        const existingInBatch = emailsInBatch.get(teacherData.Email);
        if (
          existingInBatch !== undefined &&
          existingInBatch !== teacherData.TeacherID
        ) {
          validationErrors.push(
            `อีเมล ${teacherData.Email} ซ้ำกันในรายการที่อัปเดต`,
          );
          continue;
        }
        emailsInBatch.set(teacherData.Email, teacherData.TeacherID);

        // Check if teacher exists
        const existingTeacher = await tx.teacher.findUnique({
          where: { TeacherID: teacherData.TeacherID },
        });

        if (!existingTeacher) {
          validationErrors.push(
            `ไม่พบข้อมูลของครู ID ${teacherData.TeacherID}`,
          );
          continue;
        }

        // Check for email conflict in database (excluding current teacher)
        const teacherWithEmail = await tx.teacher.findFirst({
          where: { Email: teacherData.Email },
        });

        const emailCheck = checkEmailConflict(
          teacherData.Email,
          teacherWithEmail,
          teacherData.TeacherID,
        );

        if (emailCheck.isDuplicate && emailCheck.reason) {
          validationErrors.push(emailCheck.reason);
        }
      }

      // If any validation errors, throw before updating anything
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("; "));
      }

      // Phase 2: Update all teachers within the transaction
      const updatedTeachers = await Promise.all(
        input.map(async (teacherData) => {
          return await tx.teacher.update({
            where: { TeacherID: teacherData.TeacherID },
            data: {
              Prefix: teacherData.Prefix,
              Firstname: teacherData.Firstname,
              Lastname: teacherData.Lastname,
              Department: teacherData.Department,
              Email: teacherData.Email,
            },
          });
        }),
      );

      // Return array of IDs
      return updatedTeachers.map((t: teacher) => t.TeacherID);
    });
  },
);

/**
 * Delete multiple teachers
 *
 * @param input - Array of teacher IDs to delete
 * @returns Delete count
 *
 * @example
 * ```tsx
 * const result = await deleteTeachersAction([1, 2, 3]);
 * if (result.success) {
 *   console.log(`Deleted ${result.data.count} teachers`);
 * }
 * ```
 */
export const deleteTeachersAction = createAction(
  deleteTeachersSchema,
  async (input: DeleteTeachersInput) => {
    const result = await teacherRepository.deleteMany(input);

    // Revalidate cache (optional - for future cache optimization)
    // revalidateTag('teachers');

    return result;
  },
);
