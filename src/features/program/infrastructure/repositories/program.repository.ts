/**
 * Infrastructure Layer: Program Repository
 * 
 * Handles all database operations for programs using Prisma.
 * Pure data access layer with no business logic.
 * 
 * @module program.repository
 */

import prisma from '@/libs/prisma';
import type { CreateProgramInput, UpdateProgramInput } from '../../application/schemas/program.schemas';

export const programRepository = {
  /**
   * Find all programs ordered by ProgramID with gradelevel and subject relations
   */
  async findAll() {
    return prisma.program.findMany({
      orderBy: {
        ProgramID: 'asc',
      },
      include: {
        gradelevel: true,
        subject: {
          orderBy: {
            SubjectCode: 'asc',
          },
        },
      },
    });
  },

  /**
   * Find programs by Year
   * Returns programs where all gradelevels have the specified Year
   * Optionally filters by Semester and AcademicYear
   */
  async findByYear(year: number, semester?: string, academicYear?: number) {
    return prisma.program.findMany({
      where: {
        gradelevel: {
          every: {
            Year: year,
          },
        },
        ...(semester && { Semester: semester as any }),
        ...(academicYear && { AcademicYear: academicYear }),
      },
      orderBy: [
        { AcademicYear: 'desc' },
        { Semester: 'asc' },
        { ProgramID: 'asc' },
      ],
      include: {
        gradelevel: true,
        subject: {
          orderBy: {
            SubjectCode: 'asc',
          },
        },
      },
    });
  },

  /**
   * Find a single program by ID with relations
   */
  async findById(programId: number) {
    return prisma.program.findUnique({
      where: {
        ProgramID: programId,
      },
      include: {
        gradelevel: true,
        subject: {
          orderBy: {
            SubjectCode: 'asc',
          },
        },
      },
    });
  },

  /**
   * Find program by unique constraint (for duplicate check)
   */
  async findByNameAndTerm(programName: string, semester: string, academicYear: number) {
    return prisma.program.findFirst({
      where: {
        ProgramName: programName,
        Semester: semester as any,
        AcademicYear: academicYear,
      },
    });
  },

  /**
   * Create a program with gradelevel and subject connections
   */
  async create(data: CreateProgramInput) {
    return prisma.program.create({
      data: {
        ProgramName: data.ProgramName,
        Semester: data.Semester,
        AcademicYear: data.AcademicYear,
        gradelevel: {
          connect: data.gradelevel.map((element) => ({
            GradeID: element.GradeID,
          })),
        },
        subject: {
          connect: data.subject.map((element) => ({
            SubjectCode: element.SubjectCode,
          })),
        },
      },
      include: {
        gradelevel: true,
        subject: true,
      },
    });
  },

  /**
   * Update a program
   * Uses set: [] to clear existing relations, then connects new ones
   */
  async update(programId: number, data: Omit<UpdateProgramInput, 'ProgramID'>) {
    return prisma.program.update({
      where: {
        ProgramID: programId,
      },
      data: {
        ProgramName: data.ProgramName,
        Semester: data.Semester,
        AcademicYear: data.AcademicYear,
        gradelevel: {
          set: [], // Clear existing connections
          connect: data.gradelevel.map((element) => ({
            GradeID: element.GradeID,
          })),
        },
        subject: {
          set: [], // Clear existing connections
          connect: data.subject.map((element) => ({
            SubjectCode: element.SubjectCode,
          })),
        },
      },
      include: {
        gradelevel: true,
        subject: true,
      },
    });
  },

  /**
   * Delete a program by ID
   */
  async delete(programId: number) {
    return prisma.program.delete({
      where: {
        ProgramID: programId,
      },
    });
  },

  /**
   * Get program count (useful for statistics)
   */
  async count() {
    return prisma.program.count();
  },
};
