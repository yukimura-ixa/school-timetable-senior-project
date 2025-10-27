/**
 * Semester Repository
 * Data access layer for semester/table_config operations
 */

import prisma from "@/libs/prisma";
import type {
  SemesterFilter,
  SemesterStatus,
} from "../../application/schemas/semester.schemas";
import type { table_config } from "@/prisma/generated";

export class SemesterRepository {
  /**
   * Get all semesters with optional filtering
   */
  async findMany(filter?: SemesterFilter) {
    const where: any = {};

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
    const orderBy: any = {};
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
        lastAccessedAt: { not: null },
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
    config?: any;
  }) {
    const semesterEnum = data.semester === 1 ? "SEMESTER_1" : "SEMESTER_2";
    const configId = `${data.semester}-${data.academicYear}`;

    return prisma.table_config.create({
      data: {
        ConfigID: configId,
        AcademicYear: data.academicYear,
        Semester: semesterEnum,
        Config: data.config || {},
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
    const updates: any = { status };

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

    return {
      timeslotCount,
      teacherCount: uniqueTeachers.length,
      classCount: uniqueClasses.length,
      subjectCount: uniqueSubjects.length,
      responsibilityCount,
    };
  }
}

export const semesterRepository = new SemesterRepository();
