/**
 * Infrastructure Layer: Public Data Repository
 * 
 * Handles all database operations for public/unauthenticated data access.
 * Centralizes queries for teachers, statistics, and class information
 * that were previously scattered across src/lib/public/*.ts files.
 * 
 * Pure data access layer with no business logic.
 * 
 * @module public-data.repository
 */

import { cache } from 'react';
import prisma from '@/lib/prisma';
import type { Prisma, semester } from '@/prisma/generated';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Public-safe teacher data (no PII)
 */
export interface PublicTeacher {
  teacherId: number;
  name: string;
  department: string;
  subjectCount: number;
  weeklyHours: number;
  utilization: number;
}

/**
 * Filters for public teacher queries
 */
export interface PublicTeacherFilters {
  academicYear: number;
  semester: string;
  searchQuery?: string;
  sortBy?: 'name' | 'hours' | 'utilization';
  sortOrder?: 'asc' | 'desc';
}

const teacherResponsibilityInclude = {
  subject: {
    select: {
      SubjectName: true,
      SubjectCode: true,
      Category: true,
    },
  },
  gradelevel: {
    select: {
      GradeID: true,
      Year: true,
      Number: true,
    },
  },
  class_schedule: {
    include: {
      timeslot: true,
      subject: {
        select: {
          SubjectCode: true,
          SubjectName: true,
        },
      },
      gradelevel: {
        select: {
          GradeID: true,
          Year: true,
          Number: true,
        },
      },
      room: {
        select: {
          RoomID: true,
          RoomName: true,
          Building: true,
        },
      },
    },
  },
} as const;

type ResponsibilityWithSchedules = Prisma.teachers_responsibilityGetPayload<{
  include: typeof teacherResponsibilityInclude;
}>;

/**
 * Quick statistics for dashboard
 */
export interface QuickStats {
  totalTeachers: number;
  totalClasses: number;
  totalRooms: number;
  totalSubjects: number;
  totalPrograms: number;
  periodsPerDay: number;
  currentTerm: string;
  lastUpdated: string;
}

/**
 * Period load by day
 */
export interface PeriodLoad {
  day: string;
  periods: number;
}

/**
 * Room occupancy statistics
 */
export interface RoomOccupancy {
  day: string;
  period: number;
  occupancyPercent: number;
}

/**
 * Public-safe grade level data
 */
export interface PublicGradeLevel {
  gradeId: string;
  year: number;
  number: number;
  name: string;
  studentCount: number;
  subjectCount: number;
}

/**
 * Filters for public grade level queries
 */
export interface PublicGradeLevelFilters {
  academicYear: number;
  semester: semester;
  searchQuery?: string;
  sortBy?: 'year' | 'number' | 'students';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Type for public teacher data (excludes sensitive fields like Email and Role)
 */
type PublicTeacherData = Prisma.teacherGetPayload<{
  select: {
    TeacherID: true;
    Prefix: true;
    Firstname: true;
    Lastname: true;
    Department: true;
    teachers_responsibility: {
      select: {
        SubjectCode: true;
        TeachHour: true;
      };
    };
  };
}>;

type GradeLevelWithSchedules = Prisma.gradelevelGetPayload<{
  include: {
    class_schedule: {
      select: {
        SubjectCode: true;
      };
    };
  };
}>;

// ============================================================================
// Constants
// ============================================================================

const MAX_WEEKLY_HOURS = 40;

// ============================================================================
// Helper Functions (Private)
// ============================================================================

/**
 * Convert string semester ("1", "2") to Prisma enum
 */
function toSemesterEnum(semesterString: string): semester {
  return semesterString === '1' ? 'SEMESTER_1' : 'SEMESTER_2';
}

/**
 * Get current academic term from latest config
 * Cached per request using React cache()
 */
const getCurrentTerm = cache(async () => {
  return await prisma.table_config.findFirst({
    orderBy: { AcademicYear: 'desc' },
    select: {
      AcademicYear: true,
      Semester: true,
      Config: true,
      updatedAt: true,
    },
  });
});

/**
 * Transform teacher database record to public-safe format
 */
function transformTeacherToPublic(
  teacher: PublicTeacherData
): PublicTeacher {
  const weeklyHours = teacher.teachers_responsibility.reduce(
    (sum, resp) => sum + (resp.TeachHour || 0),
    0
  );

  const utilization = Math.round((weeklyHours / MAX_WEEKLY_HOURS) * 100);

  return {
    teacherId: teacher.TeacherID,
    name: `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname}`.trim(),
    department: teacher.Department || 'ไม่ระบุ',
    subjectCount: teacher.teachers_responsibility.length,
    weeklyHours,
    utilization,
  };
}

/**
 * Transform grade level database record to public-safe format
 */
function transformGradeLevelToPublic(
  gradeLevel: GradeLevelWithSchedules
): PublicGradeLevel {
  // Count unique subjects for this grade
  const uniqueSubjects = new Set(
    gradeLevel.class_schedule.map((schedule) => schedule.SubjectCode)
  );

  return {
    gradeId: gradeLevel.GradeID,
    year: gradeLevel.Year,
    number: gradeLevel.Number,
    name: `${gradeLevel.Year}/${gradeLevel.Number}`,
    studentCount: gradeLevel.StudentCount || 0,
    subjectCount: uniqueSubjects.size,
  };
}

// ============================================================================
// Repository Methods
// ============================================================================

export const publicDataRepository = {
  // ==========================================================================
  // Teachers
  // ==========================================================================

  /**
   * Find all public teachers with optional filtering and sorting
   * Cached per request using React cache()
   */
  async findPublicTeachers(
    filters: PublicTeacherFilters
  ): Promise<PublicTeacher[]> {
    const { academicYear, semester, searchQuery, sortBy, sortOrder } = filters;

    // Build where clause
    const where = searchQuery
      ? {
          OR: [
            { Firstname: { contains: searchQuery } },
            { Lastname: { contains: searchQuery } },
            { Department: { contains: searchQuery } },
          ],
        }
      : undefined;

    // Query teachers with their teaching responsibilities
    const teachers = await prisma.teacher.findMany({
      where,
      select: {
        TeacherID: true,
        Prefix: true,
        Firstname: true,
        Lastname: true,
        Department: true,
        // Explicitly exclude Email field for security
        teachers_responsibility: {
          where: {
            AcademicYear: academicYear,
            Semester: toSemesterEnum(semester),
          },
          select: {
            SubjectCode: true,
            TeachHour: true,
          },
        },
      },
      orderBy: { Firstname: 'asc' },
    });

    // Transform to public format
    const publicTeachers = teachers.map(transformTeacherToPublic);

    // Apply sorting if specified
    if (sortBy && sortOrder) {
      publicTeachers.sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        switch (sortBy) {
          case 'name':
            return order * a.name.localeCompare(b.name, 'th');
          case 'hours':
            return order * (a.weeklyHours - b.weeklyHours);
          case 'utilization':
            return order * (a.utilization - b.utilization);
          default:
            return 0;
        }
      });
    }

    return publicTeachers;
  },

  /**
   * Count all teachers
   * Cached per request using React cache()
   */
  async countTeachers(): Promise<number> {
    return await prisma.teacher.count();
  },

  /**
   * Find a single public teacher by ID
   * Cached per request using React cache()
   */
  async findPublicTeacherById(
    teacherId: number,
    academicYear: number,
    semester: string
  ): Promise<PublicTeacher | null> {
    const teacher = await prisma.teacher.findUnique({
      where: { TeacherID: teacherId },
      select: {
        TeacherID: true,
        Prefix: true,
        Firstname: true,
        Lastname: true,
        Department: true,
        // Explicitly exclude Email field for security
        teachers_responsibility: {
          where: {
            AcademicYear: academicYear,
            Semester: toSemesterEnum(semester),
          },
          select: {
            SubjectCode: true,
            TeachHour: true,
          },
        },
      },
    });

    if (!teacher) return null;

    return transformTeacherToPublic(teacher);
  },

  async findTeacherResponsibilities(
    teacherId: number,
    academicYear: number,
    semester: string
  ): Promise<ResponsibilityWithSchedules[]> {
    const responsibilities = await prisma.teachers_responsibility.findMany({
      where: {
        TeacherID: teacherId,
        AcademicYear: academicYear,
        Semester: toSemesterEnum(semester),
      },
      include: teacherResponsibilityInclude,
      orderBy: [{ gradelevel: { Year: 'asc' } }, { SubjectCode: 'asc' }],
    });

    return responsibilities as ResponsibilityWithSchedules[];
  },

  // ==========================================================================
  // Statistics
  // ==========================================================================

  /**
   * Get quick stats for dashboard/homepage
   * Cached per request using React cache()
   */
  async getQuickStats(): Promise<QuickStats> {
    const config = await getCurrentTerm();

    if (!config) {
      // Return empty stats if no config found
      return {
        totalTeachers: 0,
        totalClasses: 0,
        totalRooms: 0,
        totalSubjects: 0,
        totalPrograms: 0,
        periodsPerDay: 0,
        currentTerm: 'N/A',
        lastUpdated: new Date().toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      };
    }

    // Run all count queries in parallel
    const [
      teacherCount,
      classCount,
      roomCount,
      subjectCount,
      programCount,
      periodsPerDay,
    ] = await Promise.all([
      prisma.teacher.count(),
      prisma.gradelevel.count(),
      prisma.room.count(),
      prisma.subject.count(),
      prisma.program.count(),
      prisma.timeslot.count({
        where: {
          DayOfWeek: 'MON',
          AcademicYear: config.AcademicYear,
          Semester: config.Semester,
        },
      }),
    ]);

    const semesterLabel =
      config.Semester === 'SEMESTER_1' ? 'ภาคเรียนที่ 1' : 'ภาคเรียนที่ 2';

    // Format date in Thai locale (short format: 14 พ.ย. 2568)
    const formattedDate = config.updatedAt.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return {
      totalTeachers: teacherCount,
      totalClasses: classCount,
      totalRooms: roomCount,
      totalSubjects: subjectCount,
      totalPrograms: programCount,
      periodsPerDay,
      currentTerm: `${semesterLabel} ปีการศึกษา ${config.AcademicYear}`,
      lastUpdated: formattedDate,
    };
  },

  /**
   * Get period load distribution by day
   */
  async getPeriodLoad(
    academicYear: number,
    semester: semester
  ): Promise<PeriodLoad[]> {
    const config = await prisma.table_config.findFirst({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
      select: { AcademicYear: true, Semester: true },
    });

    if (!config) return [];

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;
    const periodLoads: PeriodLoad[] = [];

    for (const day of days) {
      const count = await prisma.class_schedule.count({
        where: {
          timeslot: {
            DayOfWeek: day,
            AcademicYear: academicYear,
            Semester: semester,
          },
        },
      });

      periodLoads.push({ day, periods: count });
    }

    return periodLoads;
  },

  /**
   * Get room occupancy statistics
   */
  async getRoomOccupancy(
    academicYear: number,
    semester: semester
  ): Promise<RoomOccupancy[]> {
    const config = await prisma.table_config.findFirst({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
    });

    if (!config) return [];

    const [totalRooms, timeslots] = await Promise.all([
      prisma.room.count(),
      prisma.timeslot.findMany({
        where: {
          AcademicYear: academicYear,
          Semester: semester,
        },
        select: {
          TimeslotID: true,
          DayOfWeek: true,
        },
        orderBy: [{ DayOfWeek: 'asc' }, { StartTime: 'asc' }],
      }),
    ]);

    if (totalRooms === 0 || timeslots.length === 0) return [];

    // Group by day and calculate occupancy percentage
    const occupancyData: RoomOccupancy[] = [];
    const periodCounter: Record<string, number> = {};

    for (const slot of timeslots) {
      const dayKey = slot.DayOfWeek;
      if (!periodCounter[dayKey]) {
        periodCounter[dayKey] = 1;
      }

      // Count schedules for this timeslot
      const scheduleCount = await prisma.class_schedule.count({
        where: {
          TimeslotID: slot.TimeslotID,
        },
      });

      const occupancyPercent =
        totalRooms > 0 ? Math.round((scheduleCount / totalRooms) * 100) : 0;

      occupancyData.push({
        day: dayKey.slice(0, 3),
        period: periodCounter[dayKey],
        occupancyPercent,
      });

      periodCounter[dayKey]++;
    }

    return occupancyData;
  },

  // ==========================================================================
  // Grade Levels / Classes
  // ==========================================================================

  /**
   * Find all public grade levels with optional filtering and sorting
   * Cached per request using React cache()
   */
  async findPublicGradeLevels(
    filters: PublicGradeLevelFilters
  ): Promise<PublicGradeLevel[]> {
    const { academicYear, semester, searchQuery, sortBy, sortOrder } = filters;

    // Build where clause
    const where: Prisma.gradelevelWhereInput = searchQuery
      ? {
          OR: [
            { Year: { equals: parseInt(searchQuery, 10) || undefined } },
            { Number: { equals: parseInt(searchQuery, 10) || undefined } },
          ],
        }
      : {};

    // Query grade levels with their schedules
    const gradeLevels = await prisma.gradelevel.findMany({
      where,
      include: {
        class_schedule: {
          where: {
            timeslot: {
              AcademicYear: academicYear,
              Semester: semester,
            },
          },
          select: {
            SubjectCode: true,
          },
        },
      },
      orderBy: [{ Year: 'asc' }, { Number: 'asc' }],
    });

    // Transform to public format
    const publicGradeLevels = (gradeLevels as GradeLevelWithSchedules[]).map(transformGradeLevelToPublic);

    // Apply sorting if specified
    if (sortBy && sortOrder) {
      publicGradeLevels.sort((a, b) => {
        const order = sortOrder === 'asc' ? 1 : -1;
        switch (sortBy) {
          case 'year':
            return order * (a.year - b.year);
          case 'number':
            return order * (a.number - b.number);
          case 'students':
            return order * (a.studentCount - b.studentCount);
          default:
            return 0;
        }
      });
    }

    return publicGradeLevels;
  },

  /**
   * Count all grade levels
   * Cached per request using React cache()
   */
  async countGradeLevels(): Promise<number> {
    return await prisma.gradelevel.count();
  },
};
