/**
 * Infrastructure Layer: Program Repository (MOE-Compliant)
 * 
 * Handles all database operations for MOE-compliant programs using Prisma.
 * Pure data access layer with no business logic.
 * 
 * @module program.repository
 */

import prisma from '@/lib/prisma';
import type { 
  CreateProgramInput, 
  UpdateProgramInput,
  AssignSubjectsToProgramInput 
} from '../../application/schemas/program.schemas';
import type { ProgramTrack } from @/prisma/generated/client';

export const programRepository = {
  /**
   * Find all programs ordered by Year and Track
   * Includes gradelevel relations and program_subject with subject details
   */
  async findAll() {
    return prisma.program.findMany({
      where: {
        IsActive: true,
      },
      orderBy: [
        { Year: 'asc' },
        { Track: 'asc' },
      ],
      include: {
        gradelevel: {
          orderBy: {
            Number: 'asc',
          },
        },
        program_subject: {
          include: {
            subject: true,
          },
          orderBy: {
            SortOrder: 'asc',
          },
        },
      },
    });
  },

  /**
   * Find programs by Year (optional), Track (optional), and IsActive
   */
  async findByFilters(filters: {
    Year?: number;
    Track?: ProgramTrack;
    IsActive?: boolean;
  }) {
    return prisma.program.findMany({
      where: {
        ...(filters.Year !== undefined && { Year: filters.Year }),
        ...(filters.Track && { Track: filters.Track }),
        ...(filters.IsActive !== undefined && { IsActive: filters.IsActive }),
      },
      orderBy: [
        { Year: 'asc' },
        { Track: 'asc' },
      ],
      include: {
        gradelevel: {
          orderBy: {
            Number: 'asc',
          },
        },
        program_subject: {
          include: {
            subject: true,
          },
          orderBy: {
            SortOrder: 'asc',
          },
        },
      },
    });
  },

  /**
   * Find a single program by ID with all relations
   */
  async findById(programId: number) {
    return prisma.program.findUnique({
      where: {
        ProgramID: programId,
      },
      include: {
        gradelevel: {
          orderBy: {
            Number: 'asc',
          },
        },
        program_subject: {
          include: {
            subject: true,
          },
          orderBy: {
            SortOrder: 'asc',
          },
        },
      },
    });
  },

  /**
   * Find program by ProgramCode
   */
  async findByCode(programCode: string) {
    return prisma.program.findUnique({
      where: {
        ProgramCode: programCode,
      },
    });
  },

  /**
   * Find program by Year and Track (for duplicate check)
   */
  async findByYearAndTrack(year: number, track: ProgramTrack) {
    return prisma.program.findFirst({
      where: {
        Year: year,
        Track: track,
      },
    });
  },

  /**
   * Find program by grade ID with subjects
   * Returns program associated with a specific grade level including subjects
   */
  async findByGrade(gradeId: string, semester?: string, academicYear?: number) {
    const gradelevel = await prisma.gradelevel.findUnique({
      where: { GradeID: gradeId },
      include: {
        program: {
          include: {
            program_subject: {
              include: {
                subject: semester && academicYear
                  ? {
                      include: {
                        teachers_responsibility: {
                          where: {
                            GradeID: gradeId,
                            Semester: semester as 'SEMESTER_1' | 'SEMESTER_2',
                            AcademicYear: academicYear,
                          },
                          include: {
                            teacher: {
                              select: {
                                Prefix: true,
                                Firstname: true,
                                Lastname: true,
                              },
                            },
                          },
                        },
                      },
                    }
                  : true,
              },
              orderBy: {
                SortOrder: 'asc',
              },
            },
          },
        },
      },
    });

    if (!gradelevel?.program) {
      return null;
    }

    // Transform program_subject to subjects array for easier consumption
    const program = {
      ...gradelevel.program,
      subjects: gradelevel.program.program_subject.map(ps => ({
        ...ps.subject,
        MinCredits: ps.MinCredits,
        MaxCredits: ps.MaxCredits,
        Category: ps.Category,
        IsMandatory: ps.IsMandatory,
        SortOrder: ps.SortOrder,
        teachers_responsibility: 'teachers_responsibility' in ps.subject 
          ? ps.subject.teachers_responsibility 
          : [],
      })),
    };

    return program;
  },

  /**
   * Create a program (without subjects initially)
   */
  async create(data: CreateProgramInput) {
    return prisma.program.create({
      data: {
        ProgramCode: data.ProgramCode,
        ProgramName: data.ProgramName,
        Year: data.Year,
        Track: data.Track,
        Description: data.Description,
        MinTotalCredits: data.MinTotalCredits,
        IsActive: data.IsActive ?? true,
      },
      include: {
        gradelevel: true,
        program_subject: {
          include: {
            subject: true,
          },
        },
      },
    });
  },

  /**
   * Update a program basic info (not subjects)
   */
  async update(programId: number, data: Partial<UpdateProgramInput>) {
    return prisma.program.update({
      where: {
        ProgramID: programId,
      },
      data: {
        ...(data.ProgramCode && { ProgramCode: data.ProgramCode }),
        ...(data.ProgramName && { ProgramName: data.ProgramName }),
        ...(data.Track && { Track: data.Track }),
        ...(data.Description !== undefined && { Description: data.Description }),
        ...(data.MinTotalCredits !== undefined && { MinTotalCredits: data.MinTotalCredits }),
        ...(data.IsActive !== undefined && { IsActive: data.IsActive }),
      },
      include: {
        gradelevel: true,
        program_subject: {
          include: {
            subject: true,
          },
        },
      },
    });
  },

  /**
   * Assign subjects to a program (replaces all existing assignments)
   * Uses transaction to ensure atomicity
   */
  async assignSubjects(data: AssignSubjectsToProgramInput) {
    return prisma.$transaction(async (tx) => {
      await tx.program_subject.deleteMany({
        where: {
          ProgramID: data.ProgramID,
        },
      });

      await tx.program_subject.createMany({
        data: data.subjects.map((subject, index) => ({
          ProgramID: data.ProgramID,
          SubjectCode: subject.SubjectCode,
          Category: subject.Category,
          IsMandatory: subject.IsMandatory,
          MinCredits: subject.MinCredits,
          MaxCredits: subject.MaxCredits,
          SortOrder: subject.SortOrder ?? index + 1,
        })),
      });

      return tx.program.findUnique({
        where: {
          ProgramID: data.ProgramID,
        },
        include: {
          gradelevel: true,
          program_subject: {
            include: {
              subject: true,
            },
            orderBy: {
              SortOrder: 'asc',
            },
          },
        },
      });
    });
  },

  /**
   * Get program subjects with full subject details (for MOE validation)
   */
  async getProgramSubjectsWithDetails(programId: number) {
    return prisma.program_subject.findMany({
      where: {
        ProgramID: programId,
      },
      include: {
        subject: true,
      },
      orderBy: {
        SortOrder: 'asc',
      },
    });
  },

  /**
   * Delete a program
   * Note: Will cascade delete program_subject entries
   * Will set ProgramID to null in gradelevel (due to SetNull)
   */
  async delete(programId: number) {
    return prisma.program.delete({
      where: {
        ProgramID: programId,
      },
    });
  },

  /**
   * Count programs by filters (for pagination)
   */
  async count(filters: {
    Year?: number;
    Track?: ProgramTrack;
    IsActive?: boolean;
  }) {
    return prisma.program.count({
      where: {
        ...(filters.Year !== undefined && { Year: filters.Year }),
        ...(filters.Track && { Track: filters.Track }),
        ...(filters.IsActive !== undefined && { IsActive: filters.IsActive }),
      },
    });
  },

  /**
   * Get programs grouped by Year (for program management page)
   */
  async findGroupedByYear() {
    const programs = await prisma.program.findMany({
      where: {
        IsActive: true,
      },
      orderBy: [
        { Year: 'asc' },
        { Track: 'asc' },
      ],
      include: {
        gradelevel: {
          select: {
            GradeID: true,
            Number: true,
          },
        },
        program_subject: {
          select: {
            SubjectCode: true,
          },
        },
      },
    });

    const grouped: Record<number, typeof programs> = {};
    for (const program of programs) {
      if (!grouped[program.Year]) {
        grouped[program.Year] = [];
      }
      grouped[program.Year]?.push(program);
    }

    return grouped;
  },
};
