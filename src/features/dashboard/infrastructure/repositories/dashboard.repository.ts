/**
 * Dashboard Repository
 * Aggregates data from multiple sources for dashboard statistics
 * 
 * @module dashboard.repository
 */

import prisma from "@/libs/prisma";
import type { semester } from "@/prisma/generated";
import { cache } from "react";

/**
 * Fetch all data needed for dashboard in a single query
 * Uses React cache() for request-level memoization
 */
export const getDashboardData = cache(async function getDashboardData(
  configId: string,
  academicYear: number,
  sem: semester
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
      orderBy: [
        { DayOfWeek: "asc" },
        { StartTime: "asc" },
      ],
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
  sem: semester
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
    prisma.class_schedule.count({
      where: { ConfigID: configId },
    }),
    prisma.timeslot.count({
      where: {
        AcademicYear: academicYear,
        Semester: sem,
      },
    }),
    prisma.subject.count(),
    prisma.teachers_responsibility.count({
      where: { ConfigID: configId },
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
 * Get teachers with their schedule counts for the semester
 */
export const getTeachersWithScheduleCounts = cache(
  async function getTeachersWithScheduleCounts(configId: string) {
    return prisma.teacher.findMany({
      include: {
        class_schedule: {
          where: {
            ConfigID: configId,
          },
          select: {
            ClassScheduleID: true,
            GradeID: true,
            SubjectCode: true,
          },
        },
      },
      orderBy: { Firstname: "asc" },
    });
  }
);

/**
 * Get grades with their schedule counts for the semester
 */
export const getGradesWithScheduleCounts = cache(
  async function getGradesWithScheduleCounts(configId: string) {
    return prisma.gradelevel.findMany({
      include: {
        class_schedule: {
          where: {
            ConfigID: configId,
          },
          select: {
            ClassScheduleID: true,
            SubjectCode: true,
            TeacherID: true,
          },
        },
        program: true,
      },
      orderBy: { GradeID: "asc" },
    });
  }
);

/**
 * Get subject distribution with counts
 */
export const getSubjectDistribution = cache(
  async function getSubjectDistribution(configId: string) {
    const schedules = await prisma.class_schedule.groupBy({
      by: ["SubjectCode"],
      where: {
        ConfigID: configId,
      },
      _count: {
        ClassScheduleID: true,
      },
      orderBy: {
        _count: {
          ClassScheduleID: "desc",
        },
      },
    });
    
    // Enrich with subject details
    const subjectCodes = schedules.map(s => s.SubjectCode);
    const subjects = await prisma.subject.findMany({
      where: {
        SubjectCode: {
          in: subjectCodes,
        },
      },
    });
    
    return schedules.map(schedule => {
      const subject = subjects.find(s => s.SubjectCode === schedule.SubjectCode);
      return {
        subjectCode: schedule.SubjectCode,
        subjectName: subject?.SubjectName || schedule.SubjectCode,
        count: schedule._count.ClassScheduleID,
      };
    });
  }
);

/**
 * Dashboard repository export
 */
export const dashboardRepository = {
  getDashboardData,
  getQuickStats,
  getTeachersWithScheduleCounts,
  getGradesWithScheduleCounts,
  getSubjectDistribution,
};
