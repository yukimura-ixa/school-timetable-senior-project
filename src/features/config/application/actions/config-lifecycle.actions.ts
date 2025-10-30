"use server";

/**
 * Config Lifecycle Actions
 * Server Actions for managing config status and completeness
 */

import prisma from "@/libs/prisma";
import {
  UpdateConfigStatusSchema,
  calculateCompleteness,
  canTransitionStatus,
} from "../schemas/config-lifecycle.schemas";
import { generateConfigID } from "@/features/config/domain/services/config-validation.service";
import * as v from "valibot";

type ConfigStatus = "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED";

/**
 * Update config status with validation
 */
export async function updateConfigStatusAction(input: {
  configId: string;
  status: string;
  reason?: string;
}) {
  try {
    // Validate input
    const validated = v.parse(UpdateConfigStatusSchema, input);

    // Get current config
    const config = await prisma.table_config.findUnique({
      where: { ConfigID: validated.configId },
    });

    if (!config) {
      return {
        success: false,
        error: "ไม่พบการตั้งค่านี้",
      };
    }

    // Check if transition is allowed
    const canTransition = canTransitionStatus(
      config.status as ConfigStatus,
      validated.status as ConfigStatus,
      config.configCompleteness
    );

    if (!canTransition.allowed) {
      return {
        success: false,
        error: canTransition.reason || "ไม่สามารถเปลี่ยนสถานะได้",
      };
    }

    // Update status
    const updated = await prisma.table_config.update({
      where: { ConfigID: validated.configId },
      data: {
        status: validated.status as ConfigStatus,
        publishedAt: validated.status === "PUBLISHED" ? new Date() : config.publishedAt,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("updateConfigStatusAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
    };
  }
}

/**
 * Calculate and update config completeness
 */
export async function updateConfigCompletenessAction(input: {
  academicYear: number;
  semester: "SEMESTER_1" | "SEMESTER_2";
}) {
  try {
    // Convert SEMESTER_1 to "1", SEMESTER_2 to "2"
    const semesterNum = input.semester === "SEMESTER_1" ? "1" : input.semester === "SEMESTER_2" ? "2" : "3";
    const configId = generateConfigID(semesterNum, input.academicYear);

    // Count related data
    const [timeslotCount, teacherCount, subjectCount, classCount, roomCount] =
      await Promise.all([
        prisma.timeslot.count({
          where: {
            AcademicYear: input.academicYear,
            Semester: input.semester,
          },
        }),
        prisma.teachers_responsibility.count({
          where: {
            AcademicYear: input.academicYear,
            Semester: input.semester,
          },
        }),
        prisma.subject.count(),
        prisma.gradelevel.count(),
        prisma.room.count(),
      ]);

    // Calculate completeness
    const completeness = calculateCompleteness({
      timeslotCount,
      teacherCount,
      subjectCount,
      classCount,
      roomCount,
    });

    // Update config
    await prisma.table_config.update({
      where: { ConfigID: configId },
      data: {
        configCompleteness: completeness,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: {
        completeness,
        counts: {
          timeslots: timeslotCount,
          teachers: teacherCount,
          subjects: subjectCount,
          classes: classCount,
          rooms: roomCount,
        },
      },
    };
  } catch (error) {
    console.error("updateConfigCompletenessAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
    };
  }
}

/**
 * Get config with completeness info
 */
export async function getConfigWithCompletenessAction(input: {
  academicYear: number;
  semester: "SEMESTER_1" | "SEMESTER_2";
}) {
  try {
    // Convert SEMESTER_1 to "1", SEMESTER_2 to "2"
    const semesterNum = input.semester === "SEMESTER_1" ? "1" : input.semester === "SEMESTER_2" ? "2" : "3";
    const configId = generateConfigID(semesterNum, input.academicYear);

    const config = await prisma.table_config.findUnique({
      where: { ConfigID: configId },
    });

    if (!config) {
      return {
        success: true,
        data: null,
      };
    }

    // Get counts for display
    const [timeslotCount, teacherCount, classScheduleCount] = await Promise.all([
      prisma.timeslot.count({
        where: {
          AcademicYear: input.academicYear,
          Semester: input.semester,
        },
      }),
      prisma.teachers_responsibility.count({
        where: {
          AcademicYear: input.academicYear,
          Semester: input.semester,
        },
      }),
      prisma.class_schedule.count({
        where: {
          timeslot: {
            AcademicYear: input.academicYear,
            Semester: input.semester,
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        ...config,
        counts: {
          timeslots: timeslotCount,
          teachers: teacherCount,
          schedules: classScheduleCount,
        },
      },
    };
  } catch (error) {
    console.error("getConfigWithCompletenessAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
    };
  }
}
