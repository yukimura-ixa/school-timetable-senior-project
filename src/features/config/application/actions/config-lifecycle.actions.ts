"use server";

/**
 * Config Lifecycle Actions
 * Server Actions for managing config status and completeness
 */

import * as configRepository from "../../infrastructure/repositories/config.repository";
import {
  UpdateConfigStatusSchema,
  calculateCompleteness,
  canTransitionStatus,
} from "../schemas/config-lifecycle.schemas";
import { generateConfigID } from "@/features/config/domain/services/config-validation.service";
import { getPublishReadiness } from "../services/publish-readiness-query.service";
import type { semester } from "@/prisma/generated";
import * as v from "valibot";

type ConfigStatus = "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED";

/**
 * Update config status with validation
 */
export async function updateConfigStatusAction(input: {
  configId: string;
  status: string;
  force?: boolean; // Allow overriding the publish gate
  reason?: string;
}) {
  try {
    // Validate input
    const validated = v.parse(UpdateConfigStatusSchema, input);

    // Get current config
    const config = await configRepository.findByConfigId(validated.configId);

    if (!config) {
      return {
        success: false,
        error: "ไม่พบการตั้งค่านี้",
      };
    }

    const isPublishing =
      (config.status as ConfigStatus) !== "PUBLISHED" &&
      (input.status as ConfigStatus) === "PUBLISHED";

    // If publishing, check for readiness unless force flag is set
    if (isPublishing && !validated.force) {
      const readiness = await getPublishReadiness(validated.configId);
      
      if (readiness && readiness.status !== 'ready') {
        const errorMessages = [
          "ไม่สามารถเผยแพร่ได้ เนื่องจาก:",
          ...readiness.issues,
        ];
        return {
          success: false,
          error: errorMessages.join("\n- "),
        };
      }
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
    const updated = await configRepository.updateStatus(
      validated.configId,
      validated.status as ConfigStatus,
      validated.status === "PUBLISHED" ? new Date() : (config.publishedAt || undefined)
    );

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

    // Count related data using repository
    const counts = await configRepository.countEntitiesForCompleteness(
      input.academicYear,
      input.semester
    );

    // Calculate completeness
    const completeness = calculateCompleteness({
      timeslotCount: counts.timeslotCount,
      teacherCount: counts.teacherCount,
      subjectCount: counts.subjectCount,
      classCount: counts.classCount,
      roomCount: counts.roomCount,
    });

    // Update config using repository
    await configRepository.updateCompleteness(configId, completeness);

    return {
      success: true,
      data: {
        completeness,
        counts: {
          timeslots: counts.timeslotCount,
          teachers: counts.teacherCount,
          subjects: counts.subjectCount,
          classes: counts.classCount,
          rooms: counts.roomCount,
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

    // Use repository method that fetches config with counts
    const configWithCounts = await configRepository.findByIdWithCounts(
      configId,
      input.academicYear,
      input.semester
    );

    if (!configWithCounts) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: configWithCounts,
    };
  } catch (error) {
    console.error("getConfigWithCompletenessAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
    };
  }
}
