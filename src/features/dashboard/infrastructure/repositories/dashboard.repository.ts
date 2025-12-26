/**
 * Dashboard Repository
 * Aggregates data from multiple sources for dashboard statistics
 *
 * @module dashboard.repository
 */

import prisma from "@/lib/prisma";
import type { semester } from "@/prisma/generated/client";
import { cache } from "react";

/**
 * Fetch all data needed for dashboard in a single query
 * Uses React cache() for request-level memoization
 */
export const getDashboardData = cache(async function getDashboardData(
  configId: string,
  academicYear: number,
  sem: semester,
) {
  const [
    config,
    schedules,
    teachers,
    grades,
    timeslots,
    subjects,
    responsibilities,
  ] = await Promise.all([
    // Get semester config
    prisma.table_config.findUnique({
      where: { ConfigID: configId },
    }),

    // Get all schedules for this semester
    prisma.class_schedule.findMany({
      where: {
        timeslot: {
          AcademicYear: academicYear,
          Semester: sem,
        },
      },
      include: {
        teachers_responsibility: {
          include: {
            teacher: {
              select: {
                TeacherID: true,
                Prefix: true,
                Firstname: true,
                Lastname: true,
                Department: true,
              },
            },
          },
        },
        subject: {
          select: {
            SubjectCode: true,
            SubjectName: true,
            Category: true,
          },
        },
        gradelevel: {
          select: {
            GradeID: true,
            Year: true,
            Number: true,
            ProgramID: true,
          },
        },
        room: {
          select: {
            RoomID: true,
            RoomName: true,
          },
        },
        timeslot: {
          select: {
            TimeslotID: true,
            DayOfWeek: true,
            Breaktime: true,
          },
        },
      },
    }),

    // Get all teachers
    prisma.teacher.findMany({
      orderBy: { Firstname: "asc" },
    }),

    // Get all grades
    prisma.gradelevel.findMany({
      orderBy: { GradeID: "asc" },
      include: {
        program: true,
      },
    }),

    // Get all timeslots for this semester
    prisma.timeslot.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: sem,
      },
      orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
    }),

    // Get all subjects
    prisma.subject.findMany({
      orderBy: { SubjectCode: "asc" },
    }),

    // Get teacher responsibilities for this semester
    prisma.teachers_responsibility.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: sem,
      },
      include: {
        teacher: {
          select: {
            TeacherID: true,
            Prefix: true,
            Firstname: true,
            Lastname: true,
          },
        },
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
      },
    }),
  ]);

  return {
    config,
    schedules,
    teachers,
    grades,
    timeslots,
    subjects,
    responsibilities,
  };
});

/**
 * Get quick stats counts
 * Optimized for performance with count queries
 */
export const getQuickStats = cache(async function getQuickStats(
  configId: string,
  academicYear: number,
  sem: semester,
) {
  const [
    teacherCount,
    gradeCount,
    scheduleCount,
    timeslotCount,
    subjectCount,
    responsibilityCount,
  ] = await Promise.all([
    prisma.teacher.count(),
    prisma.gradelevel.count(),
    // class_schedule doesn't have ConfigID - filter via timeslot relation
    prisma.class_schedule.count({
      where: {
        timeslot: {
          AcademicYear: academicYear,
          Semester: sem,
        },
      },
    }),
    prisma.timeslot.count({
      where: {
        AcademicYear: academicYear,
        Semester: sem,
      },
    }),
    prisma.subject.count(),
    // teachers_responsibility has AcademicYear and Semester directly
    prisma.teachers_responsibility.count({
      where: {
        AcademicYear: academicYear,
        Semester: sem,
      },
    }),
  ]);

  return {
    teacherCount,
    gradeCount,
    scheduleCount,
    timeslotCount,
    subjectCount,
    responsibilityCount,
  };
});

/**
 * Get schedules with minimal fields for dashboard stats/health/charts
 */
export const getScheduleStatsData = cache(
  async function getScheduleStatsData(academicYear: number, sem: semester) {
    return prisma.class_schedule.findMany({
      where: {
        timeslot: {
          AcademicYear: academicYear,
          Semester: sem,
        },
      },
      include: {
        teachers_responsibility: {
          select: {
            TeacherID: true,
          },
        },
      },
    });
  },
);

/**
 * Get basic teacher identity fields for dashboard charts
 */
export const getTeachersBasic = cache(async function getTeachersBasic() {
  return prisma.teacher.findMany({
    select: {
      TeacherID: true,
      Prefix: true,
      Firstname: true,
      Lastname: true,
      Department: true,
    },
    orderBy: { Firstname: "asc" },
  });
});

/**
 * Get basic grade fields for dashboard stats
 */
export const getGradesBasic = cache(async function getGradesBasic() {
  return prisma.gradelevel.findMany({
    select: {
      GradeID: true,
    },
    orderBy: { GradeID: "asc" },
  });
});

/**
 * Get basic subject fields for dashboard charts
 */
export const getSubjectsBasic = cache(async function getSubjectsBasic() {
  return prisma.subject.findMany({
    select: {
      SubjectCode: true,
      SubjectName: true,
    },
    orderBy: { SubjectCode: "asc" },
  });
});

/**
 * Get teachers with their schedule counts for the semester
 * Note: teacher doesn't have direct class_schedule relation - goes through teachers_responsibility
 */
export const getTeachersWithScheduleCounts = cache(
  async function getTeachersWithScheduleCounts(
    academicYear: number,
    sem: semester,
  ) {
    return prisma.teacher.findMany({
      include: {
        teachers_responsibility: {
          where: {
            AcademicYear: academicYear,
            Semester: sem,
          },
          select: {
            RespID: true,
            GradeID: true,
            SubjectCode: true,
          },
        },
      },
      orderBy: { Firstname: "asc" },
    });
  },
);

/**
 * Get grades with their schedule counts for the semester
 * Note: class_schedule has ClassID (not ClassScheduleID) and no TeacherID field
 */
export const getGradesWithScheduleCounts = cache(
  async function getGradesWithScheduleCounts(
    academicYear: number,
    sem: semester,
  ) {
    return prisma.gradelevel.findMany({
      include: {
        class_schedule: {
          where: {
            timeslot: {
              AcademicYear: academicYear,
              Semester: sem,
            },
          },
          select: {
            ClassID: true,
            SubjectCode: true,
            TimeslotID: true,
          },
        },
        program: true,
      },
      orderBy: { GradeID: "asc" },
    });
  },
);

/**
 * Get subject distribution with counts
 * Note: class_schedule primary key is ClassID (not ClassScheduleID)
 */
export const getSubjectDistribution = cache(
  async function getSubjectDistribution(academicYear: number, sem: semester) {
    type ScheduleGroup = {
      SubjectCode: string;
      _count: {
        ClassID: number;
      };
    };

    const schedules = (await (prisma.class_schedule as any).groupBy({
      by: ["SubjectCode"],
      where: {
        timeslot: {
          AcademicYear: academicYear,
          Semester: sem,
        },
      },
      _count: {
        ClassID: true,
      },
      orderBy: {
        _count: {
          ClassID: "desc",
        },
      },
    })) as ScheduleGroup[];

    // Enrich with subject details
    const subjectCodes = schedules.map((s) => s.SubjectCode);
    const subjects = await prisma.subject.findMany({
      where: {
        SubjectCode: {
          in: subjectCodes,
        },
      },
    });

    return schedules.map((schedule) => {
      const subject = subjects.find(
        (s: any) => s.SubjectCode === schedule.SubjectCode,
      );
      return {
        subjectCode: schedule.SubjectCode,
        subjectName: subject?.SubjectName || schedule.SubjectCode,
        count: schedule._count.ClassID,
      };
    });
  },
);

/**
 * Get config only (for header)
 */
export const getConfig = cache(async function getConfig(configId: string) {
  return prisma.table_config.findUnique({
    where: { ConfigID: configId },
  });
});

/**
 * Dashboard repository export
 */
export const dashboardRepository = {
  getDashboardData,
  getQuickStats,
  getScheduleStatsData,
  getTeachersBasic,
  getGradesBasic,
  getSubjectsBasic,
  getTeachersWithScheduleCounts,
  getGradesWithScheduleCounts,
  getSubjectDistribution,
  getConfig,
};
