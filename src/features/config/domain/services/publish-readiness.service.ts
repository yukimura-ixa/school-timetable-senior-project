/**
 * Domain Service: Publish Readiness
 *
 * This service checks if a given semester configuration is "ready to publish"
 * by validating it against several criteria, including timetable completeness
 * and MoE compliance.
 *
 * @module features/config/domain/services/publish-readiness.service
 */

import type {
  PublishReadinessResult,
  PublishReadinessStatus,
} from "../types/publish-readiness-types";
import { findIncompletGrades } from "@/features/dashboard/domain/services/dashboard-stats.service";
import {
  validateProgramMOECredits,
  type ProgramValidationResult,
} from "@/features/program/domain/services/moe-validation.service";
import type { FullConfigData } from "../../types/config-types";

/**
 * Aggregates various checks to determine if a semester configuration is ready to be published.
 *
 * @param configData - The full data set for a semester, including schedules, grades, and programs.
 * @returns A result object with the readiness status and a list of issues.
 */
export function checkPublishReadiness(
  configData: FullConfigData,
): PublishReadinessResult {
  const issues: string[] = [];

  // 1. Check for timetable completeness
  const incompleteGrades = findIncompletGrades(
    configData.schedules,
    configData.grades,
    configData.totalTimeslots,
    configData.requiredSubjects,
  );

  if (incompleteGrades.length > 0) {
    const incompleteMessages = incompleteGrades.map(
      (g) =>
        `ชั้น ${g.gradeName}: ยังไม่ครบ (${g.scheduledHours}/${g.requiredHours} คาบ)`,
    );
    issues.push(...incompleteMessages);
  }

  // 2. Check for MoE compliance for each program
  const moeValidationResults: ProgramValidationResult[] = [];
  for (const program of configData.programs) {
    const result = validateProgramMOECredits(
      program.Year,
      program.program_subject,
    );
    if (!result.isValid) {
      issues.push(
        `หลักสูตร ม.${program.Year} (${program.ProgramName}): ${result.errors.join(", ")}`,
      );
    }
    moeValidationResults.push(result);
  }

  // Determine final status
  let status: PublishReadinessStatus = "ready";
  if (issues.length > 0) {
    if (incompleteGrades.length > 0) {
      status = "incomplete";
    } else {
      status = "moe-failed";
    }
  }

  return {
    status,
    issues,
    details: {
      incompleteGrades,
      moeValidationResults,
    },
  };
}
