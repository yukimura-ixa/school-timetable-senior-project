/**
 * Assign Feature - Server Actions
 * 
 * React Server Actions for teacher assignment operations.
 * Uses 'use server' directive for Next.js 16+ Server Actions.
 */

"use server";

import { revalidateTag } from 'next/cache';
import { semester } from @/prisma/generated/client';
import type { teachers_responsibility } from @/prisma/generated/client';
import * as v from 'valibot';

// Schemas
import {
  getAssignmentsSchema,
  getAvailableRespsSchema,
  getLockedRespsSchema,
  syncAssignmentsSchema,
  deleteAssignmentSchema,
  type GetAssignmentsInput,
  type GetAvailableRespsInput,
  type GetLockedRespsInput,
  type SyncAssignmentsInput,
  type DeleteAssignmentInput,
} from '../schemas/assign.schemas';

// Repository
import * as assignRepository from '../../infrastructure/repositories/assign.repository';
import { withPrismaTransaction } from '@/lib/prisma-transaction';
import { generateConfigID } from '@/features/config/domain/services/config-validation.service';

// Services
import {
  calculateTeachHour,
  computeResponsibilitiesDiff,
  expandAvailableSlots,
} from '../../domain/services/assign-validation.service';

/**
 * Helper: Create server action with validation
 */
function createAction<TInput, TOutput>(
  schema: v.GenericSchema<TInput, TOutput> | undefined,
  handler: (input: TOutput) => Promise<unknown>
) {
  return async (input: TInput) => {
    try {
      const validated = schema ? v.parse(schema, input) : (input as unknown as TOutput);
      return await handler(validated);
    } catch (error) {
      if (error instanceof v.ValiError) {
        const errorMessages = error.issues.map((issue) => issue.message).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw error;
    }
  };
}

/**
 * Get assignments by teacher and term
 * Returns responsibilities with subject, grade, and teacher details
 */
export const getAssignmentsAction = createAction(
  getAssignmentsSchema,
  async (input: GetAssignmentsInput) => {
    const sem = semester[input.Semester];
    
    const data = await assignRepository.findByTeacherAndTerm(
      input.TeacherID,
      input.AcademicYear,
      sem
    );

    // Add computed fields
    const results = data.map((resp) => ({
      ...resp,
      SubjectName: resp.subject.SubjectName,
      Credit: resp.subject.Credit,
    }));

    return results;
  }
);

/**
 * Get available responsibility slots by teacher and term
 * Expands responsibilities into individual available slots based on TeachHour - assigned count
 */
export const getAvailableRespsAction = createAction(
  getAvailableRespsSchema,
  async (input: GetAvailableRespsInput) => {
    const sem = semester[input.Semester];
    
    const data = await assignRepository.findAvailableByTeacherAndTerm(
      input.TeacherID,
      input.AcademicYear,
      sem
    );

    // Expand into available slots
    const slots = expandAvailableSlots(data);

    return slots;
  }
);

/**
 * Get subjects with locked responsibilities
 * Returns subjects that have at least one assignment in the term
 */
export const getLockedRespsAction = createAction(
  getLockedRespsSchema,
  async (input: GetLockedRespsInput) => {
    const sem = semester[input.Semester];
    
    const subjects = await assignRepository.findLockedSubjectsByTerm(
      input.AcademicYear,
      sem
    );

    return subjects;
  }
);

/**
 * Sync assignments for a teacher
 * Creates new responsibilities and deletes removed ones in a single transaction
 * Also cascades deletes to related class_schedule entries
 */
export const syncAssignmentsAction = createAction(
  syncAssignmentsSchema,
  async (input: SyncAssignmentsInput) => {
    const sem = semester[input.Semester];
    const semesterNum = input.Semester === 'SEMESTER_1' ? '1' : '2';
    const configId = generateConfigID(semesterNum, input.AcademicYear);
    const conflictsKey = `${input.AcademicYear}-${semesterNum}`;

    // Execute all operations in a transaction
    const result = await withPrismaTransaction(async (tx) => {
      // 1. Get existing responsibilities
      const existingResponsibilities: teachers_responsibility[] = await tx.teachers_responsibility.findMany({
        where: {
          TeacherID: input.TeacherID,
          AcademicYear: input.AcademicYear,
          Semester: sem,
        },
      });

      // 2. Compute diff (what to create, what to delete)
      const { toCreate, toDelete } = computeResponsibilitiesDiff(
        existingResponsibilities,
        input.Resp
      );

      const results: Array<{
        created?: typeof existingResponsibilities[0];
        deleted?: typeof existingResponsibilities[0];
      }> = [];

      // 3. Create new responsibilities
      for (const resp of toCreate) {
        const teachHour = calculateTeachHour(String(resp.Credit));

        const newResp = await tx.teachers_responsibility.create({
          data: {
            TeacherID: input.TeacherID,
            AcademicYear: input.AcademicYear,
            Semester: sem,
            SubjectCode: resp.SubjectCode,
            GradeID: resp.GradeID,
            TeachHour: teachHour,
          },
        });

        results.push({ created: newResp });
      }

      // 4. Delete removed responsibilities
      for (const resp of toDelete) {
        const deletedResp = await tx.teachers_responsibility.delete({
          where: {
            RespID: resp.RespID,
          },
        });

        results.push({ deleted: deletedResp });
      }

      // 5. Cascade delete related class_schedule entries
      // Delete schedules where all connected responsibilities belong to this teacher/term
      await tx.class_schedule.deleteMany({
        where: {
          timeslot: {
            AcademicYear: input.AcademicYear,
            Semester: sem,
          },
          teachers_responsibility: {
            every: {
              TeacherID: input.TeacherID,
              AcademicYear: input.AcademicYear,
              Semester: sem,
            },
          },
        },
      });

      return {
        status: 'success' as const,
        results,
        summary: {
          created: toCreate.length,
          deleted: toDelete.length,
        },
      };
    });

    await Promise.all([
      revalidateTag(`stats:${configId}`, 'max'),
      revalidateTag(`conflicts:${conflictsKey}`, 'max'),
    ]);

    return result;
  }
);

/**
 * Delete a single assignment by RespID
 * Also cascades to related class_schedule entries
 */
export const deleteAssignmentAction = createAction(
  deleteAssignmentSchema,
  async (input: DeleteAssignmentInput) => {
    // Get the responsibility to find its teacher/term for cascade delete
    const resp = await assignRepository.findByRespId(input.RespID);

    if (!resp) {
      throw new Error(`Responsibility with RespID ${input.RespID} not found`);
    }

    const semesterNum = resp.Semester === 'SEMESTER_1' ? '1' : '2';
    const configId = generateConfigID(semesterNum, resp.AcademicYear);
    const conflictsKey = `${resp.AcademicYear}-${semesterNum}`;

    const result = await withPrismaTransaction(async (tx) => {
      // 1. Delete the responsibility
      const deleted = await tx.teachers_responsibility.delete({
        where: { RespID: input.RespID },
      });

      // 2. Cascade delete related class_schedule entries
      await tx.class_schedule.deleteMany({
        where: {
          timeslot: {
            AcademicYear: resp.AcademicYear,
            Semester: resp.Semester,
          },
          teachers_responsibility: {
            every: {
              TeacherID: resp.TeacherID,
              AcademicYear: resp.AcademicYear,
              Semester: resp.Semester,
            },
          },
        },
      });

      return deleted;
    });

    await Promise.all([
      revalidateTag(`stats:${configId}`, 'max'),
      revalidateTag(`conflicts:${conflictsKey}`, 'max'),
    ]);

    return result;
  }
);

/**
 * Get count of all assignments
 */
export const getAssignmentCountAction = createAction(
  undefined,
  async () => {
    const count = await assignRepository.count();
    return { count };
  }
);

/**
 * Get assignments by teacher (all terms)
 * Utility action for teacher-specific queries
 */
export const getAssignmentsByTeacherAction = createAction(
  v.object({
    TeacherID: v.pipe(v.number(), v.integer(), v.minValue(1)),
  }),
  async (input: { TeacherID: number }) => {
    const assignments = await assignRepository.findMany({
      TeacherID: input.TeacherID,
    });

    return assignments;
  }
);

/**
 * Get assignments by term (all teachers)
 * Utility action for term-specific queries
 */
export const getAssignmentsByTermAction = createAction(
  v.object({
    AcademicYear: v.pipe(v.number(), v.integer(), v.minValue(2500)),
    Semester: v.picklist(['SEMESTER_1', 'SEMESTER_2']),
  }),
  async (input: { AcademicYear: number; Semester: 'SEMESTER_1' | 'SEMESTER_2' }) => {
    const sem = semester[input.Semester];
    
    const assignments = await assignRepository.findMany({
      AcademicYear: input.AcademicYear,
      Semester: sem,
    });

    return assignments;
  }
);
