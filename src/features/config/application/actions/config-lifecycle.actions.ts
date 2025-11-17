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
import { dashboardRepository } from "@/features/dashboard/infrastructure/repositories/dashboard.repository";
import {
  validateProgramMOECredits,
  type ProgramValidationResult,
} from "@/features/program/domain/services/moe-validation.service";
import type { program_subject, semester, subject } from "@/prisma/generated";
import * as v from "valibot";

type ConfigStatus = "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED";

type PublishReadinessStatus = "ready" | "moe-failed";

interface PublishReadinessResult {
  status: PublishReadinessStatus;
  issues: string[];
}

async function getMoEReadinessForConfig(
  configId: string,
  academicYear: number,
  sem: semester
): Promise<PublishReadinessResult> {
  const data = await dashboardRepository.getDashboardData(
    configId,
    academicYear,
    sem
  );

  const grades = data.grades ?? [];
  if (grades.length === 0) {
    return { status: "ready", issues: [] };
  }

  const issues: string[] = [];

  for (const rawGrade of grades) {
    const grade = rawGrade as {
      GradeID: string;
      Year: number;
      Number: number;
      program?: {
        Year: number;
        program_subject?: Array<program_subject & { subject: subject }>;
      } | null;
    };

    const program = grade.program;
    if (!program || !program.program_subject || program.program_subject.length === 0) {
      continue;
    }

    const validation: ProgramValidationResult = validateProgramMOECredits(
      grade.Year,
      program.program_subject
    );

    if (!validation.isValid) {
      for (const error of validation.errors) {
        issues.push(`ระดับ ${grade.Year}/${grade.Number}: ${error}`);
      }
    }
  }

  return {
    status: issues.length === 0 ? "ready" : "moe-failed",
    issues,
  };
}

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
    const config = await configRepository.findByConfigId(validated.configId);

    if (!config) {
      return {
        success: false,
        error: "ไม่พบการตั้งค่านี้",
      };
    }

    // Additional publish gate: require full timetable completeness
    // before allowing transition to PUBLISHED.
    const isPublishing =
      (config.status as ConfigStatus) !== "PUBLISHED" &&
      (input.status as ConfigStatus) === "PUBLISHED";

    if (isPublishing && config.configCompleteness < 100) {
      return {
        success: false,
        error: `ไม่สามารถเผยแพร่ได้ เนื่องจากตารางสอนยังไม่ครบถ้วน (ความสมบูรณ์ปัจจุบัน ${config.configCompleteness}%)`,
      };
    }

    if (isPublishing) {
      const readiness = await getMoEReadinessForConfig(
        config.ConfigID,
        config.AcademicYear,
        config.Semester as semester
      );

      if (readiness.status !== "ready") {
        return {
          success: false,
          error:
            readiness.issues.join("\n") ||
            "ไม่สามารถเผยแพร่ได้ เนื่องจากหลักสูตรยังไม่ผ่านเกณฑ์ สพฐ.",
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
