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
   */
  async findByYear(year: number) {
    return prisma.program.findMany({
      where: {
        gradelevel: {
          every: {
            Year: year,
          },
        },
      },
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
   * Find program by name (for duplicate check)
   */
  async findByName(programName: string) {
    return prisma.program.findUnique({
      where: {
        ProgramName: programName,
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
