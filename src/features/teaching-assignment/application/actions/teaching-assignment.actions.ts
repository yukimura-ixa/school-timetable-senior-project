/**
 * Application Layer: Teaching Assignment Server Actions
 *
 * Server Actions for teacher-subject assignment management feature.
 * Handles assignment CRUD operations with validation and workload checks.
 *
 * @module teaching-assignment.actions
 */

"use server";

import * as v from "valibot";
import { revalidatePath } from "next/cache";
import { createAction } from "@/shared/lib/action-wrapper";
import prisma from "@/lib/prisma";
import * as teachingAssignmentRepository from "../../infrastructure/repositories/teaching-assignment.repository";
import {
  validateAssignment,
  validateBulkAssignments,
} from "../../domain/services/teacher-validation.service";
import {
  assignTeacherSchema,
  unassignTeacherSchema,
  bulkAssignSchema,
  copyAssignmentsSchema,
  clearAssignmentsSchema,
  type AssignTeacherInput,
  type UnassignTeacherInput,
  type BulkAssignInput,
  type CopyAssignmentsInput,
  type ClearAssignmentsInput,
} from "../schemas/teaching-assignment.schemas";
import { createLogger } from "@/lib/logger";
import { invalidatePublicCache } from "@/lib/cache-invalidation";

const log = createLogger("TeachingAssignment");

/**
 * Assign a teacher to a subject
 * Validates workload limits and creates/updates assignment
 *
 * @param input - Assignment details (TeacherID, SubjectCode, GradeID, Semester, Year, TeachHour)
 * @returns Assignment result with validation status
 *
 * @example
 * ```tsx
 * const result = await assignTeacherAction({
 *   TeacherID: "T001",
 *   SubjectCode: "TH101",
 *   GradeID: "M1",
 *   Semester: "1",
 *   AcademicYear: 2567,
 *   TeachHour: 4
 * });
 * if (result.success) {
 *   console.log("Assignment created:", result.data);
 * } else {
 *   console.error("Validation failed:", result.error);
 * }
 * ```
 */
export const assignTeacherAction = createAction(
  assignTeacherSchema,
  async (input: AssignTeacherInput) => {
    // Validate assignment (workload, duplicates, etc.)
    const validation = await validateAssignment({
      teacherId: input.TeacherID,
      subjectCode: input.SubjectCode,
      gradeId: input.GradeID,
      semester: input.Semester,
      year: input.AcademicYear,
      additionalHours: input.TeachHour,
    });

    if (!validation.valid) {
      // Return validation errors in Thai
      throw new Error(validation.errors.join(", ") || "ไม่สามารถมอบหมายได้");
    }

    // Create/update assignment
    const assignment =
      await teachingAssignmentRepository.assignTeacherToSubject({
        TeacherID: input.TeacherID,
        SubjectCode: input.SubjectCode,
        GradeID: input.GradeID,
        Semester: input.Semester,
        AcademicYear: input.AcademicYear,
        TeachHour: input.TeachHour,
      });

    // Revalidate relevant pages
    revalidatePath("/management/teacher-assignment");
    const semesterNum = input.Semester === "SEMESTER_1" ? "1" : "2";
    revalidatePath(`/schedule/${input.AcademicYear}/${semesterNum}`);

    await invalidatePublicCache(["teachers", "stats"]);
    return {
      assignment,
      warnings: validation.warnings,
    };
  },
);

/**
 * Unassign a teacher from a subject
 * Removes the assignment record
 *
 * @param input - Responsibility ID to delete
 * @returns Success status
 *
 * @example
 * ```tsx
 * const result = await unassignTeacherAction({ RespID: 123 });
 * if (result.success) {
 *   console.log("Assignment removed");
 * }
 * ```
 */
export const unassignTeacherAction = createAction(
  unassignTeacherSchema,
  async (input: UnassignTeacherInput) => {
    // Note: This would need additional fields (SubjectCode, GradeID, Semester, Year, TeacherID)
    // to call unassignTeacherFromSubject properly
    // For now, we can delete directly by RespID using Prisma
    await prisma.teachers_responsibility.delete({
      where: { RespID: input.RespID },
    });

    // Revalidate all teacher assignment pages
    revalidatePath("/management/teacher-assignment");

    await invalidatePublicCache(["teachers", "stats"]);
    return { success: true };
  },
);

/**
 * Bulk assign multiple teachers
 * Validates all assignments together and applies in transaction
 *
 * @param input - Array of assignments
 * @returns Bulk operation result with validation summary
 *
 * @example
 * ```tsx
 * const result = await bulkAssignTeachersAction({
 *   assignments: [
 *     { TeacherID: "T001", SubjectCode: "TH101", ... },
 *     { TeacherID: "T002", SubjectCode: "EN101", ... }
 *   ]
 * });
 * if (result.success) {
 *   console.log(`${result.data.successCount} assignments created`);
 * }
 * ```
 */
export const bulkAssignTeachersAction = createAction(
  bulkAssignSchema,
  async (input: BulkAssignInput) => {
    // Map input to validation format
    const validationInput = input.assignments.map((a) => ({
      teacherId: a.TeacherID,
      subjectCode: a.SubjectCode,
      gradeId: a.GradeID,
      semester: a.Semester,
      year: a.AcademicYear,
      hours: a.TeachHour,
    }));

    // Validate all assignments together
    const validation = await validateBulkAssignments(validationInput);

    if (!validation.valid) {
      // Return all validation errors
      throw new Error(
        `พบข้อผิดพลาด ${validation.errors.length} รายการ:\n` +
          validation.errors.map((e) => `- ${e}`).join("\n"),
      );
    }

    // Apply assignments in transaction
    const results = await teachingAssignmentRepository.bulkAssignTeachers(
      input.assignments,
    );

    // Revalidate pages
    revalidatePath("/management/teacher-assignment");

    await invalidatePublicCache(["teachers", "stats"]);
    return {
      successCount: results.length,
      warnings: validation.warnings,
      assignments: results,
    };
  },
);

/**
 * Copy assignments from previous semester
 * Clones teacher assignments to a new semester/year
 *
 * @param input - Source and target semester/year details
 * @returns Copied assignments count
 *
 * @example
 * ```tsx
 * const result = await copyAssignmentsAction({
 *   sourceGradeID: "M1",
 *   sourceSemester: "1",
 *   sourceYear: 2567,
 *   targetGradeID: "M1",
 *   targetSemester: "2",
 *   targetYear: 2567
 * });
 * if (result.success) {
 *   console.log(`Copied ${result.data.count} assignments`);
 * }
 * ```
 */
export const copyAssignmentsAction = createAction(
  copyAssignmentsSchema,
  async (input: CopyAssignmentsInput) => {
    const copiedAssignments =
      await teachingAssignmentRepository.copyAssignmentsFromPreviousSemester(
        input.sourceGradeID,
        input.sourceSemester,
        input.sourceYear,
        input.targetGradeID,
        input.targetSemester,
        input.targetYear,
      );

    // Revalidate pages
    revalidatePath("/management/teacher-assignment");

    await invalidatePublicCache(["teachers", "stats"]);
    return {
      count: copiedAssignments.length,
      assignments: copiedAssignments,
    };
  },
);

/**
 * Clear all assignments for a grade/semester/year
 * Removes all teacher assignments in the specified context
 *
 * @param input - Grade ID, Semester, and Academic Year
 * @returns Success status with count of removed assignments
 *
 * @example
 * ```tsx
 * const result = await clearAllAssignmentsAction({
 *   GradeID: "M1",
 *   Semester: "1",
 *   AcademicYear: 2567
 * });
 * if (result.success) {
 *   console.log(`Removed ${result.data.count} assignments`);
 * }
 * ```
 */
export const clearAllAssignmentsAction = createAction(
  clearAssignmentsSchema,
  async (input: ClearAssignmentsInput) => {
    const deletedCount = await teachingAssignmentRepository.clearAllAssignments(
      input.GradeID,
      input.Semester,
      input.AcademicYear,
    );

    // Revalidate pages
    revalidatePath("/management/teacher-assignment");

    await invalidatePublicCache(["teachers", "stats"]);
    return {
      count: deletedCount,
    };
  },
);

/**
 * Fetch subjects and assignments for a grade/semester/year
 * Returns subjects with their assigned teachers
 *
 * @param gradeId - Grade ID (e.g., "M1", "M2")
 * @param semester - Semester ("SEMESTER_1" or "SEMESTER_2")
 * @param academicYear - Academic year (e.g., 2567)
 * @returns Subjects with assignment data
 */
const getSubjectsWithAssignmentsSchema = v.object({
  gradeId: v.string(),
  semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
  academicYear: v.number(),
});

export const getSubjectsWithAssignments = createAction(
  getSubjectsWithAssignmentsSchema,
  async (input: {
    gradeId: string;
    semester: "SEMESTER_1" | "SEMESTER_2";
    academicYear: number;
  }) => {
    log.debug("getSubjectsWithAssignments called", input);

    const subjectsData = await teachingAssignmentRepository.findSubjectsByGrade(
      input.gradeId,
    );
    log.debug("Found subjects", {
      count: subjectsData.length,
      gradeId: input.gradeId,
    });

    const assignments =
      await teachingAssignmentRepository.findAssignmentsByContext(
        input.gradeId,
        input.semester,
        input.academicYear,
      );
    log.debug("Found assignments", { count: assignments.length });

    return subjectsData.map((subjectData) => {
      const assignment = assignments.find(
        (a) => a.SubjectCode === subjectData.SubjectCode,
      );

      return {
        SubjectCode: subjectData.SubjectCode,
        SubjectName: subjectData.subject.SubjectName,
        Credit: subjectData.subject.Credit,
        assignedTeacher: assignment
          ? {
              RespID: assignment.RespID,
              TeacherID: assignment.TeacherID,
              TeachHour: assignment.TeachHour,
              TeacherName: assignment.teacher
                ? `${assignment.teacher.Prefix}${assignment.teacher.Firstname} ${assignment.teacher.Lastname}`
                : "ไม่ทราบชื่อ",
            }
          : undefined,
      };
    });
  },
);

/**
 * Fetch all teachers for dropdown selection
 * Returns teachers with their current workload information
 *
 * @param semester - Semester to calculate workload for
 * @param academicYear - Academic year to calculate workload for
 * @returns Teachers with workload data
 */
type GetTeachersWithWorkloadInput = {
  semester: "SEMESTER_1" | "SEMESTER_2";
  academicYear: number;
};

const getTeachersWithWorkloadSchema = v.object({
  semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
  academicYear: v.number(),
});

export const getTeachersWithWorkload = createAction(
  getTeachersWithWorkloadSchema,
  async (input: GetTeachersWithWorkloadInput) => {
    const teachers = await prisma.teacher.findMany({
      select: {
        TeacherID: true,
        Prefix: true,
        Firstname: true,
        Lastname: true,
      },
      orderBy: [{ Prefix: "asc" }, { Firstname: "asc" }],
    });

    // Calculate workload for each teacher
    const teachersWithWorkload = await Promise.all(
      teachers.map(async (teacher) => {
        // Get teacher's workload from repository
        const assignments =
          await teachingAssignmentRepository.findTeacherWorkload(
            teacher.TeacherID,
            input.semester,
            input.academicYear,
          );

        // Calculate total hours and determine status
        const totalHours = assignments.reduce((sum, a) => sum + a.TeachHour, 0);
        let status: "ok" | "warning" | "overload";
        if (totalHours >= 25) {
          status = "overload";
        } else if (totalHours >= 20) {
          status = "warning";
        } else {
          status = "ok";
        }

        return {
          TeacherID: teacher.TeacherID,
          TeacherName: `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`,
          currentWorkload: {
            totalHours,
            status,
            assignments: assignments.length,
          },
        };
      }),
    );

    return teachersWithWorkload;
  },
);
