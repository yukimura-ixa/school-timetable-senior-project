/**
 * Infrastructure Layer: GradeLevel Repository
 *
 * Handles all database operations for gradelevels using Prisma.
 * Pure data access layer with no business logic.
 *
 * @module gradelevel.repository
 */

import prisma from "@/lib/prisma";
import type { semester } from "@/prisma/generated/client";
import type {
  CreateGradeLevelInput,
  UpdateGradeLevelInput,
} from "../../application/schemas/gradelevel.schemas";

export const gradeLevelRepository = {
  /**
   * Find all gradelevels ordered by GradeID with program relation
   */
  async findAll() {
    return prisma.gradelevel.findMany({
      orderBy: {
        GradeID: "asc",
      },
      include: {
        program: true,
      },
    });
  },

  /**
   * Find a single gradelevel by ID
   */
  async findById(gradeId: string) {
    return prisma.gradelevel.findUnique({
      where: {
        GradeID: gradeId,
      },
      include: {
        program: true,
      },
    });
  },

  /**
   * Check if a gradelevel with Year + Number combination already exists
   */
  async findDuplicate(year: number, number: number) {
    return prisma.gradelevel.findFirst({
      where: {
        Year: year,
        Number: number,
      },
    });
  },

  /**
   * Find teacher responsibilities for lock feature query
   * Returns responsibilities grouped by GradeID
   */
  async findTeacherResponsibilities(
    subjectCode: string,
    academicYear: number,
    semester: semester,
    teacherIds: number[],
  ) {
    return prisma.teachers_responsibility.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
        SubjectCode: subjectCode,
        TeacherID: {
          in: teacherIds,
        },
      },
    });
  },

  /**
   * Find gradelevels by IDs (used in lock feature)
   */
  async findByIds(gradeIds: string[]) {
    return prisma.gradelevel.findMany({
      where: {
        GradeID: {
          in: gradeIds,
        },
      },
    });
  },

  /**
   * Create a single gradelevel
   * GradeID is auto-generated from Year + '0' + Number
   */
  async create(data: CreateGradeLevelInput) {
    // Generate GradeID in the canonical format: M{Year}-{Number} e.g., M1-1
    const gradeId = `M${data.Year}-${data.Number}`;

    return prisma.gradelevel.create({
      data: {
        GradeID: gradeId,
        Year: data.Year,
        Number: data.Number,
        StudentCount: data.StudentCount ?? 0,
        ProgramID: data.ProgramID ?? null,
      },
    });
  },

  /**
   * Update a gradelevel by ID
   */
  async update(gradeId: string, data: Omit<UpdateGradeLevelInput, "GradeID">) {
    return prisma.gradelevel.update({
      where: {
        GradeID: gradeId,
      },
      data: {
        Year: data.Year,
        Number: data.Number,
        StudentCount: data.StudentCount ?? undefined,
        ProgramID: data.ProgramID ?? undefined,
      },
    });
  },

  /**
   * Delete multiple gradelevels by IDs
   */
  async deleteMany(gradeIds: string[]) {
    return prisma.gradelevel.deleteMany({
      where: {
        GradeID: {
          in: gradeIds,
        },
      },
    });
  },

  /**
   * Get gradelevel count (useful for statistics)
   */
  async count() {
    return prisma.gradelevel.count();
  },
};
