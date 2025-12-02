"use server";

/**
 * Config Lifecycle Actions
 * Server Actions for managing config status and completeness
 */

import { createAction } from "@/shared/lib/action-wrapper";
import * as configRepository from "../../infrastructure/repositories/config.repository";
import {
  UpdateConfigStatusSchema,
  calculateCompleteness,
  canTransitionStatus,
} from "../schemas/config-lifecycle.schemas";
import { generateConfigID } from "@/features/config/domain/services/config-validation.service";
import { getPublishReadiness } from "../services/publish-readiness-query.service";
import type { semester } from "@/prisma/generated/client";
import * as v from "valibot";

type ConfigStatus = "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED";

/**
 * Update config status with validation
 */
export const updateConfigStatusAction = createAction(
  UpdateConfigStatusSchema,
  async (input: {
    configId: string;
    status: string;
    force?: boolean;
    reason?: string;
  }) => {
    // Get current config
    const config = await configRepository.findByConfigId(input.configId);

    if (!config) {
      throw new Error("ไม่พบการตั้งค่านี้");
    }

    const isPublishing =
      (config.status as ConfigStatus) !== "PUBLISHED" &&
      (input.status as ConfigStatus) === "PUBLISHED";

    // If publishing, check for readiness unless force flag is set
    if (isPublishing && !input.force) {
      const readiness = await getPublishReadiness(input.configId);

      if (readiness && readiness.status !== "ready") {
        const errorMessages = [
          "ไม่สามารถเผยแพร่ได้ เนื่องจาก:",
          ...readiness.issues,
        ];
        throw new Error(errorMessages.join("\n- "));
      }
    }

    // Check if transition is allowed
    const canTransition = canTransitionStatus(
      config.status as ConfigStatus,
      input.status as ConfigStatus,
      config.configCompleteness,
    );

    if (!canTransition.allowed) {
      throw new Error(canTransition.reason || "ไม่สามารถเปลี่ยนสถานะได้");
    }

    // Update status
    const updated = await configRepository.updateStatus(
      input.configId,
      input.status as ConfigStatus,
      input.status === "PUBLISHED"
        ? new Date()
        : config.publishedAt || undefined,
    );

    return updated;
  },
);

/**
 * Calculate and update config completeness
 */
const UpdateConfigCompletenessSchema = v.object({
  academicYear: v.number(),
  semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
});

export const updateConfigCompletenessAction = createAction(
  UpdateConfigCompletenessSchema,
  async (input: { academicYear: number; semester: "SEMESTER_1" | "SEMESTER_2" }) => {
    // Convert SEMESTER_1 to "1", SEMESTER_2 to "2"
    const semesterNum =
      input.semester === "SEMESTER_1"
        ? "1"
        : input.semester === "SEMESTER_2"
          ? "2"
          : "3";
    const configId = generateConfigID(semesterNum, input.academicYear);

    // Count related data using repository
    const counts = await configRepository.countEntitiesForCompleteness(
      input.academicYear,
      input.semester,
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
      completeness,
      counts: {
        timeslots: counts.timeslotCount,
        teachers: counts.teacherCount,
        subjects: counts.subjectCount,
        classes: counts.classCount,
        rooms: counts.roomCount,
      },
    };
  },
);

/**
 * Get config with completeness info
 */
export const getConfigWithCompletenessAction = createAction(
  UpdateConfigCompletenessSchema,
  async (input: { academicYear: number; semester: "SEMESTER_1" | "SEMESTER_2" }) => {
    // Convert SEMESTER_1 to "1", SEMESTER_2 to "2"
    const semesterNum =
      input.semester === "SEMESTER_1"
        ? "1"
        : input.semester === "SEMESTER_2"
          ? "2"
          : "3";
    const configId = generateConfigID(semesterNum, input.academicYear);

    // Use repository method that fetches config with counts
    const configWithCounts = await configRepository.findByIdWithCounts(
      configId,
      input.academicYear,
      input.semester,
    );

    return configWithCounts;
  },
);
