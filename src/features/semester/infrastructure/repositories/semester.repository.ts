/**
 * Semester Repository
 * Data access layer for semester/table_config operations
 */

import prisma from "@/lib/prisma";
import type { Prisma, semester } from "@/prisma/generated";
import type {
  SemesterFilter,
  SemesterStatus,
} from "../../application/schemas/semester.schemas";

export class SemesterRepository {
  /**
   * Get all semesters with optional filtering
   */
  async findMany(filter?: SemesterFilter) {
    const where: Prisma.table_configWhereInput = {};

    // Apply filters
    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.year) {
      where.AcademicYear = filter.year;
    }

    if (filter?.search) {
      // Search in ConfigID or year
      where.OR = [
        { ConfigID: { contains: filter.search, mode: "insensitive" } },
        { AcademicYear: { equals: Number.parseInt(filter.search) || 0 } },
      ];
    }

    if (!filter?.showArchived) {
      where.status = { not: "ARCHIVED" };
    }

    // Build orderBy
    const orderBy: Prisma.table_configOrderByWithRelationInput = {};
    if (filter?.sortBy === "recent") {
      orderBy.lastAccessedAt = filter.sortOrder || "desc";
    } else if (filter?.sortBy === "name") {
      orderBy.ConfigID = filter.sortOrder || "asc";
    } else if (filter?.sortBy === "status") {
      orderBy.status = filter.sortOrder || "asc";
    } else if (filter?.sortBy === "year") {
      orderBy.AcademicYear = filter.sortOrder || "desc";
    } else if (filter?.sortBy === "completeness") {
      orderBy.configCompleteness = filter.sortOrder || "desc";
    } else {
      // Default: most recent first
      orderBy.updatedAt = "desc";
    }

    const semesters = await prisma.table_config.findMany({
      where,
      orderBy,
    });

    return semesters;
  }

  /**
   * Get recent semesters (last accessed)
   */
  async findRecent(limit = 2) {
    return prisma.table_config.findMany({
      where: {
        status: { not: "ARCHIVED" },
        // Exclude rows where lastAccessedAt is null by requiring a minimal date
        lastAccessedAt: { gt: new Date(0) },
      },
      orderBy: { lastAccessedAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get pinned semesters
   */
  async findPinned() {
    return prisma.table_config.findMany({
      where: {
        isPinned: true,
        status: { not: "ARCHIVED" },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Find semester by ConfigID
   */
  async findById(configId: string) {
    return prisma.table_config.findUnique({
      where: { ConfigID: configId },
    });
  }

  /**
   * Find semester by year and semester number
   */
  async findByYearAndSemester(academicYear: number, semester: number) {
    const semesterEnum = semester === 1 ? "SEMESTER_1" : "SEMESTER_2";
    return prisma.table_config.findFirst({
      where: {
        AcademicYear: academicYear,
        Semester: semesterEnum,
      },
    });
  }

  /**
   * Create new semester
   */
  async create(data: {
    academicYear: number;
    semester: number;
    config?: Prisma.InputJsonValue;
  }) {
    const semesterEnum = data.semester === 1 ? "SEMESTER_1" : "SEMESTER_2";
    const configId = `${data.semester}-${data.academicYear}`;

    return prisma.table_config.create({
      data: {
        ConfigID: configId,
        AcademicYear: data.academicYear,
        Semester: semesterEnum,
        Config: (data.config || {}) as Prisma.InputJsonValue,
        status: "DRAFT",
        configCompleteness: 0,
        isPinned: false,
      },
    });
  }

  /**
   * Update semester status
   */
  async updateStatus(configId: string, status: SemesterStatus) {
    const updates: Prisma.table_configUpdateInput = { status };

    // Set publishedAt when publishing
    if (status === "PUBLISHED") {
      updates.publishedAt = new Date();
    }

    return prisma.table_config.update({
      where: { ConfigID: configId },
      data: updates,
    });
  }

  /**
   * Toggle pin status
   */
  async togglePin(configId: string, isPinned: boolean) {
    return prisma.table_config.update({
      where: { ConfigID: configId },
      data: { isPinned },
    });
  }

  /**
   * Track semester access
   */
  async trackAccess(configId: string) {
    return prisma.table_config.update({
      where: { ConfigID: configId },
      data: { lastAccessedAt: new Date() },
    });
  }

  /**
   * Update config completeness percentage
   */
  async updateCompleteness(configId: string, completeness: number) {
    return prisma.table_config.update({
      where: { ConfigID: configId },
      data: { configCompleteness: Math.min(100, Math.max(0, completeness)) },
    });
  }

  /**
   * Delete semester (soft delete by archiving)
   */
  async archive(configId: string) {
    return prisma.table_config.update({
      where: { ConfigID: configId },
      data: { status: "ARCHIVED" },
    });
  }

  /**
   * Get semester statistics (class count, teacher count, etc.)
   */
  async getStatistics(configId: string) {
    const config = await prisma.table_config.findUnique({
      where: { ConfigID: configId },
    });

    if (!config) {
      return null;
    }

    const [academicYear, semesterNum] = configId.split("-").map(Number);
    const semesterEnum = semesterNum === 1 ? "SEMESTER_1" : "SEMESTER_2";

    // Get counts for this semester
    const [timeslotCount, responsibilityCount] = await Promise.all([
      prisma.timeslot.count({
        where: {
          AcademicYear: academicYear,
          Semester: semesterEnum,
        },
      }),
      prisma.teachers_responsibility.count({
        where: {
          AcademicYear: academicYear,
          Semester: semesterEnum,
        },
      }),
    ]);

    // Get unique teachers and classes
    const uniqueTeachers = await prisma.teachers_responsibility.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: semesterEnum,
      },
      select: { TeacherID: true },
      distinct: ["TeacherID"],
    });

    const uniqueClasses = await prisma.teachers_responsibility.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: semesterEnum,
      },
      select: { GradeID: true },
      distinct: ["GradeID"],
    });

    const uniqueSubjects = await prisma.teachers_responsibility.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: semesterEnum,
      },
      select: { SubjectCode: true },
      distinct: ["SubjectCode"],
    });

    // Get total room count (rooms are not semester-specific)
    const roomCount = await prisma.room.count();

    return {
      timeslotCount,
      teacherCount: uniqueTeachers.length,
      classCount: uniqueClasses.length,
      subjectCount: uniqueSubjects.length,
      responsibilityCount,
      roomCount,
    };
  }


  /**
   * Find timeslots for a given academic year and semester
   */
  async findTimeslots(academicYear: number, sem: semester) {
    return await prisma.timeslot.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: sem,
      },
    });
  }

  /**
   * Copy timeslots from source to target semester
   */
  async copyTimeslots(
    sourceYear: number,
    sourceSem: semester,
    targetYear: number,
    targetSem: semester,
    sourceSemesterNum: number,
    targetSemesterNum: number
  ) {
    const timeslots = await this.findTimeslots(sourceYear, sourceSem);

    if (timeslots.length === 0) {
      return [];
    }

    await prisma.timeslot.createMany({
      data: timeslots.map((ts) => ({
        TimeslotID: ts.TimeslotID.replace(
          `${sourceSemesterNum}-${sourceYear}`,
          `${targetSemesterNum}-${targetYear}`
        ),
        AcademicYear: targetYear,
        Semester: targetSem,
        StartTime: ts.StartTime,
        EndTime: ts.EndTime,
        Breaktime: ts.Breaktime,
        DayOfWeek: ts.DayOfWeek,
      })),
      skipDuplicates: true,
    });

    return timeslots;
  }

  /**
   * Create multiple timeslots
   */
  async createTimeslots(
    timeslots: Prisma.timeslotCreateManyInput[]
  ) {
    return await prisma.timeslot.createMany({
      data: timeslots,
      skipDuplicates: true,
    });
  }


  /**
   * Create semester with timeslots in a transaction
   */
  async createWithTimeslots(data: {
    configId: string;
    academicYear: number;
    semester: semester;
    config: object;
    timeslots?: Prisma.timeslotCreateManyInput[];
  }) {
    return await prisma.$transaction(async (tx) => {
      // Create semester
      const newSemester = await tx.table_config.create({
        data: {
          ConfigID: data.configId,
          AcademicYear: data.academicYear,
          Semester: data.semester,
          Config: data.config,
          status: 'DRAFT',
          isPinned: false,
          configCompleteness: 0,
        },
      });

      // Create timeslots if provided
      if (data.timeslots && data.timeslots.length > 0) {
        await tx.timeslot.createMany({
          data: data.timeslots,
        });

        // Update completeness
        await tx.table_config.update({
          where: { ConfigID: newSemester.ConfigID },
          data: { configCompleteness: 25 },
        });
      }

      return newSemester;
    });
  }

}

export const semesterRepository = new SemesterRepository();
