/**
 * Overview Analytics Repository
 * Section 1: Schedule Overview Dashboard
 *
 * Handles data fetching for high-level statistics and health checks
 */

import prisma from "@/lib/prisma";
import type { OverviewStats } from "../../domain/types/analytics.types";
import { parseConfigId } from "../../domain/services/calculation.service";
import { cacheTag } from "next/cache";

// Prisma payload types for overview queries
type TimeslotId = { TimeslotID: string };
type ScheduleWithResponsibility = {
  teachers_responsibility: { TeacherID: number }[];
};

export const overviewRepository = {
  /**
   * Get overview statistics for dashboard
   * @param configId - Format: "SEMESTER-YEAR" (e.g., "1-2567")
   * @returns Overview stats including completion rate, active teachers, conflicts
   */
  async getOverviewStats(configId: string): Promise<OverviewStats> {
    cacheTag(`stats:${configId}`);
    const config = parseConfigId(configId);

    // Step 1: Get all timeslot IDs for this semester
    const timeslots = await prisma.timeslot.findMany({
      where: {
        AcademicYear: config.academicYear,
        Semester: config.semester,
      },
      select: {
        TimeslotID: true,
      },
    });

    const timeslotIds = timeslots.map((t: TimeslotId) => t.TimeslotID);

    // Step 2: Parallel queries for better performance
    const [totalScheduled, totalGrades, activeTeachersResult, totalRooms] =
      await Promise.all([
        // Count all scheduled classes for this semester
        prisma.class_schedule.count({
          where: {
            TimeslotID: {
              in: timeslotIds,
            },
          },
        }),

        // Count total grade levels
        prisma.gradelevel.count(),

        // Count unique teachers with assignments for this semester
        prisma.class_schedule
          .findMany({
            where: {
              TimeslotID: {
                in: timeslotIds,
              },
            },
            select: {
              teachers_responsibility: {
                select: {
                  TeacherID: true,
                },
              },
            },
          })
          .then((schedules: ScheduleWithResponsibility[]) => {
            // Extract unique teacher IDs
            const teacherIds = new Set<number>();
            schedules.forEach((schedule: ScheduleWithResponsibility) => {
              schedule.teachers_responsibility.forEach(
                (resp: { TeacherID: number }) => {
                  teacherIds.add(resp.TeacherID);
                },
              );
            });
            return Array.from(teacherIds).map((id) => ({ TeacherID: id }));
          }),

        // Count total rooms
        prisma.room.count(),
      ]);

    // Calculate metrics
    const activeTeachers = activeTeachersResult.length;
    const totalTimeslots = timeslots.length;
    const totalRequiredSlots = totalGrades * totalTimeslots;
    const completionRate =
      totalRequiredSlots > 0 ? (totalScheduled / totalRequiredSlots) * 100 : 0;

    // Issue #107: Implement conflict detection using conflictRepository
    const { conflictRepository } =
      await import("@/features/conflict/infrastructure/repositories/conflict.repository");
    const conflictData = await conflictRepository.findAllConflicts(
      config.academicYear,
      config.semester,
    );
    const scheduleConflicts = conflictData.totalConflicts;

    return {
      totalScheduledHours: totalScheduled,
      completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
      activeTeachers,
      scheduleConflicts,
      totalGrades,
      totalRooms,
    };
  },

  /**
   * Get quick stats for a specific grade level
   * @param configId - Format: "SEMESTER-YEAR"
   * @param gradeId - Grade level ID
   * @returns Stats specific to the grade
   */
  async getGradeStats(configId: string, gradeId: string) {
    cacheTag(`stats:${configId}`, `stats:${configId}:grade:${gradeId}`);
    const config = parseConfigId(configId);

    // Get timeslot IDs for this semester
    const timeslots = await prisma.timeslot.findMany({
      where: {
        AcademicYear: config.academicYear,
        Semester: config.semester,
      },
      select: {
        TimeslotID: true,
      },
    });

    const timeslotIds = timeslots.map((t: TimeslotId) => t.TimeslotID);

    const [scheduledCount, gradeInfo] = await Promise.all([
      prisma.class_schedule.count({
        where: {
          GradeID: gradeId,
          TimeslotID: {
            in: timeslotIds,
          },
        },
      }),

      prisma.gradelevel.findUnique({
        where: { GradeID: gradeId },
        select: {
          Year: true,
          Number: true,
          StudentCount: true,
          program: {
            select: {
              ProgramName: true,
              ProgramCode: true,
            },
          },
        },
      }),
    ]);

    const totalTimeslots = timeslots.length;

    return {
      gradeId,
      gradeInfo,
      scheduledHours: scheduledCount,
      totalHours: totalTimeslots,
      completionRate:
        totalTimeslots > 0 ? (scheduledCount / totalTimeslots) * 100 : 0,
    };
  },

  /**
   * Get locked vs unlocked schedule summary
   * @param configId - Format: "SEMESTER-YEAR"
   * @returns Count of locked and unlocked schedules
   */
  async getLockStatusSummary(configId: string) {
    cacheTag(`stats:${configId}`, `stats:${configId}:locks`);
    const config = parseConfigId(configId);

    // Get timeslot IDs for this semester
    const timeslots = await prisma.timeslot.findMany({
      where: {
        AcademicYear: config.academicYear,
        Semester: config.semester,
      },
      select: {
        TimeslotID: true,
      },
    });

    const timeslotIds = timeslots.map((t: TimeslotId) => t.TimeslotID);

    const [locked, unlocked] = await Promise.all([
      prisma.class_schedule.count({
        where: {
          IsLocked: true,
          TimeslotID: {
            in: timeslotIds,
          },
        },
      }),

      prisma.class_schedule.count({
        where: {
          IsLocked: false,
          TimeslotID: {
            in: timeslotIds,
          },
        },
      }),
    ]);

    const total = locked + unlocked;

    return {
      locked,
      unlocked,
      total,
      lockedPercentage: total > 0 ? (locked / total) * 100 : 0,
      unlockedPercentage: total > 0 ? (unlocked / total) * 100 : 0,
    };
  },

  /**
   * Get schedule completion metrics
   * @param configId - Format: "SEMESTER-YEAR"
   * @returns Detailed completion metrics
   */
  async getCompletionMetrics(configId: string) {
    cacheTag(`stats:${configId}`, `stats:${configId}:completion`);
    const config = parseConfigId(configId);

    // Get timeslot IDs for this semester
    const timeslots = await prisma.timeslot.findMany({
      where: {
        AcademicYear: config.academicYear,
        Semester: config.semester,
      },
      select: {
        TimeslotID: true,
      },
    });

    const timeslotIds = timeslots.map((t: TimeslotId) => t.TimeslotID);

    const [totalScheduled, locked, unlocked, totalGrades] = await Promise.all([
      prisma.class_schedule.count({
        where: {
          TimeslotID: {
            in: timeslotIds,
          },
        },
      }),

      prisma.class_schedule.count({
        where: {
          IsLocked: true,
          TimeslotID: {
            in: timeslotIds,
          },
        },
      }),

      prisma.class_schedule.count({
        where: {
          IsLocked: false,
          TimeslotID: {
            in: timeslotIds,
          },
        },
      }),

      prisma.gradelevel.count(),
    ]);

    const totalTimeslots = timeslots.length;
    const totalRequired = totalGrades * totalTimeslots;
    const empty = totalRequired - totalScheduled;
    const completionRate =
      totalRequired > 0 ? (totalScheduled / totalRequired) * 100 : 0;

    // Determine progress status
    let progressStatus:
      | "not-started"
      | "in-progress"
      | "near-complete"
      | "complete";
    if (completionRate < 10) {
      progressStatus = "not-started";
    } else if (completionRate < 70) {
      progressStatus = "in-progress";
    } else if (completionRate < 95) {
      progressStatus = "near-complete";
    } else {
      progressStatus = "complete";
    }

    return {
      totalRequiredSlots: totalRequired,
      totalScheduledSlots: totalScheduled,
      completionRate: Math.round(completionRate * 10) / 10,
      lockedSchedules: locked,
      unlockedSchedules: unlocked,
      emptySlots: empty,
      progressStatus,
    };
  },
};
