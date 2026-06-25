/**
 * Infrastructure Layer: Program Repository (MOE-Compliant)
 *
 * Handles all database operations for MOE-compliant programs using Prisma.
 * Pure data access layer with no business logic.
 *
 * @module program.repository
 */

import prisma from "@/lib/prisma";
import { cacheStrategy } from "@/lib/cache-config";
import {
  getEffectiveProgramSubjects,
  toProgramSubjectShape,
  type EffectiveSubject,
} from "@/features/program/domain/services/effective-subjects.service";
import type {
  CreateProgramInput,
  UpdateProgramInput,
  AssignSubjectsToProgramInput,
} from "../../application/schemas/program.schemas";
import { SubjectCategory } from "@/prisma/generated/client";
import type { ProgramTrack } from "@/prisma/generated/client";
import type { ProgramWithRelations } from "../../domain/types/program.types";

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
      orderBy: [{ Year: "asc" }, { Track: "asc" }],
      include: {
        gradelevel: {
          orderBy: {
            Number: "asc",
          },
        },
        program_subject: {
          include: {
            subject: true,
          },
          orderBy: {
            SortOrder: "asc",
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
    const programs = await prisma.program.findMany({
      where: {
        ...(filters.Year !== undefined && { Year: filters.Year }),
        ...(filters.Track && { Track: filters.Track }),
        ...(filters.IsActive !== undefined && { IsActive: filters.IsActive }),
      },
      orderBy: [{ Year: "asc" }, { Track: "asc" }],
      include: {
        gradelevel: {
          orderBy: {
            Number: "asc",
          },
        },
      },
    });

    // Surface inherited CORE: replace raw (now CORE-less) program_subject rows
    // with the effective set composed through the seam.
    return Promise.all(
      programs.map(async (program) => ({
        ...program,
        program_subject: toProgramSubjectShape(
          await programRepository.getEffectiveSubjects(program.ProgramID),
        ),
      })),
    );
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
            Number: "asc",
          },
        },
        program_subject: {
          include: {
            subject: true,
          },
          orderBy: {
            SortOrder: "asc",
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
      include: { program: true },
    });

    if (!gradelevel?.program) {
      return null;
    }

    const effective = await programRepository.getEffectiveSubjects(
      gradelevel.program.ProgramID,
    );

    // Attach this grade/term's teacher assignments to each effective subject.
    // A flat query keyed by SubjectCode reaches inherited CORE rows too — the
    // old per-subject nested include could not, since CORE left program_subject.
    const responsibilities =
      semester && academicYear
        ? await prisma.teachers_responsibility.findMany({
            where: {
              GradeID: gradeId,
              Semester: semester as "SEMESTER_1" | "SEMESTER_2",
              AcademicYear: academicYear,
              SubjectCode: { in: effective.map((e) => e.SubjectCode) },
            },
            include: {
              teacher: {
                select: { Prefix: true, Firstname: true, Lastname: true },
              },
            },
          })
        : [];

    const teachersByCode = new Map<string, typeof responsibilities>();
    for (const tr of responsibilities) {
      const list = teachersByCode.get(tr.SubjectCode) ?? [];
      list.push(tr);
      teachersByCode.set(tr.SubjectCode, list);
    }

    const subjects = effective.map((e) => ({
      ...e.subject,
      MinCredits: e.MinCredits,
      MaxCredits: e.MaxCredits,
      Category: e.Category,
      IsMandatory: e.IsMandatory,
      SortOrder: e.SortOrder,
      teachers_responsibility: teachersByCode.get(e.SubjectCode) ?? [],
    }));

    return {
      ...gradelevel.program,
      subjects,
    };
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
        ...(data.Description !== undefined && {
          Description: data.Description,
        }),
        ...(data.MinTotalCredits !== undefined && {
          MinTotalCredits: data.MinTotalCredits,
        }),
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
   * Returns ProgramWithRelations for type safety with MOE validation
   */
  async assignSubjects(
    data: AssignSubjectsToProgramInput,
  ): Promise<ProgramWithRelations | null> {
    // CORE is owned by grade_fundamental inheritance, never by program_subject.
    // The editor surfaces inherited CORE as selected, so a naive save would
    // re-duplicate it as owned and silently break inheritance. Drop CORE here
    // and scope the delete to non-CORE so this write only ever replaces the
    // program's owned (ADDITIONAL/ACTIVITY) rows. Inherited CORE is
    // excluded/overridden through program_fundamental_override instead.
    const ownedSubjects = data.subjects.filter(
      (subject) => subject.Category !== SubjectCategory.CORE,
    );

    return prisma.$transaction(async (tx) => {
      await tx.program_subject.deleteMany({
        where: {
          ProgramID: data.ProgramID,
          Category: { not: SubjectCategory.CORE },
        },
      });

      if (ownedSubjects.length > 0) {
        await tx.program_subject.createMany({
          data: ownedSubjects.map((subject, index) => ({
            ProgramID: data.ProgramID,
            SubjectCode: subject.SubjectCode,
            Category: subject.Category,
            IsMandatory: subject.IsMandatory,
            MinCredits: subject.MinCredits,
            MaxCredits: subject.MaxCredits,
            SortOrder: subject.SortOrder ?? index + 1,
          })),
        });
      }

      // Cast required: Prisma transaction doesn't infer include types
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
              SortOrder: "asc",
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
        SortOrder: "asc",
      },
    });
  },

  /**
   * Effective subjects = per-year template (grade_fundamental) inherited by
   * reference, minus per-program excludes, plus credit overrides, plus the
   * program's own (ADDITIONAL/ACTIVITY) program_subject rows. The single seam
   * all readers must use instead of reading program_subject directly.
   */
  async getEffectiveSubjects(programId: number): Promise<EffectiveSubject[]> {
    const program = await prisma.program.findUnique({
      where: { ProgramID: programId },
      select: { ProgramID: true, Year: true },
      ...cacheStrategy("warm", ["programs", `program_${programId}`]),
    });
    if (!program) return [];

    const [template, overrides, programSubjects] = await Promise.all([
      prisma.grade_fundamental.findMany({
        where: { Year: program.Year },
        include: { subject: true },
        orderBy: { SortOrder: "asc" },
        ...cacheStrategy("static", ["fundamentals", `fundamentals_y${program.Year}`]),
      }),
      prisma.program_fundamental_override.findMany({
        where: { ProgramID: programId },
        ...cacheStrategy("warm", ["programs", `program_${programId}`]),
      }),
      prisma.program_subject.findMany({
        where: { ProgramID: programId },
        include: { subject: true },
        orderBy: { SortOrder: "asc" },
        ...cacheStrategy("warm", ["programs", `program_${programId}`]),
      }),
    ]);

    return getEffectiveProgramSubjects({
      programId,
      year: program.Year,
      template,
      overrides,
      programSubjects,
    });
  },

  /** Adapter to the shape moe-validation.service consumes. */
  async getEffectiveSubjectsForValidation(programId: number) {
    // Reference programRepository.* (not `this`) so destructured callers don't break.
    return toProgramSubjectShape(
      await programRepository.getEffectiveSubjects(programId),
    );
  },

  /**
   * Upsert a per-program override of an inherited fundamental: exclude it
   * (Excluded:true) or override its credits. Only provided fields are changed.
   */
  async setFundamentalOverride(
    programId: number,
    subjectCode: string,
    override: {
      Excluded?: boolean;
      MinCredits?: number | null;
      MaxCredits?: number | null;
    },
  ) {
    return prisma.program_fundamental_override.upsert({
      where: {
        ProgramID_SubjectCode: {
          ProgramID: programId,
          SubjectCode: subjectCode,
        },
      },
      update: {
        ...(override.Excluded !== undefined && { Excluded: override.Excluded }),
        ...(override.MinCredits !== undefined && {
          MinCredits: override.MinCredits,
        }),
        ...(override.MaxCredits !== undefined && {
          MaxCredits: override.MaxCredits,
        }),
      },
      create: {
        ProgramID: programId,
        SubjectCode: subjectCode,
        Excluded: override.Excluded ?? false,
        MinCredits: override.MinCredits ?? null,
        MaxCredits: override.MaxCredits ?? null,
      },
    });
  },

  /** Remove a fundamental override, reverting the subject to the template. */
  async clearFundamentalOverride(programId: number, subjectCode: string) {
    return prisma.program_fundamental_override.deleteMany({
      where: { ProgramID: programId, SubjectCode: subjectCode },
    });
  },


  /**
   * Full inherited-fundamentals view for one program's year, annotated with
   * per-program override state. Unlike getEffectiveSubjects (which drops
   * excluded rows), this keeps every template subject so the editor can render
   * excluded ones with a restore control.
   */
  async getInheritedFundamentals(programId: number) {
    const program = await prisma.program.findUnique({
      where: { ProgramID: programId },
      select: { Year: true },
    });
    if (!program) return [];

    const [template, overrides] = await Promise.all([
      prisma.grade_fundamental.findMany({
        where: { Year: program.Year },
        include: { subject: true },
        orderBy: { SortOrder: "asc" },
      }),
      prisma.program_fundamental_override.findMany({
        where: { ProgramID: programId },
      }),
    ]);

    const overrideByCode = new Map(overrides.map((o) => [o.SubjectCode, o]));

    return template.map((t) => {
      const ov = overrideByCode.get(t.SubjectCode);
      const overridden =
        ov != null && (ov.MinCredits != null || ov.MaxCredits != null);
      return {
        SubjectCode: t.SubjectCode,
        subject: t.subject,
        SortOrder: t.SortOrder,
        TemplateMinCredits: t.MinCredits,
        TemplateMaxCredits: t.MaxCredits,
        excluded: ov?.Excluded ?? false,
        overridden,
        MinCredits: ov?.MinCredits ?? t.MinCredits,
        MaxCredits: ov?.MaxCredits ?? t.MaxCredits,
      };
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
      orderBy: [{ Year: "asc" }, { Track: "asc" }],
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

  /**
   * Get program counts grouped by year (for overview page)
   */
  async getCountsByYear() {
    const counts = await prisma.program.groupBy({
      by: ["Year"],
      _count: { ProgramID: true },
      where: { IsActive: true },
    });

    const result: Record<number, number> = {};
    for (const item of counts) {
      result[item.Year] = item._count.ProgramID;
    }
    return result;
  },

  /**
   * Find programs for a specific year, ordered by name
   */
  async findByYear(year: number) {
    return prisma.program.findMany({
      where: { Year: year },
      orderBy: { ProgramName: "asc" },
    });
  },
};
