/**
 * Types for Publish Readiness Service
 * 
 * @module features/config/domain/types/publish-readiness-types
 */

import type { GradeCompletion } from "@/features/dashboard/domain/services/dashboard-stats.service";
import type { ProgramValidationResult } from "@/features/program/domain/services/moe-validation.service";

/**
 * Represents the overall readiness status of a semester configuration.
 * - 'ready': All checks passed.
 * - 'incomplete': Timetable is not fully scheduled.
 * - 'moe-failed': Fails Ministry of Education credit compliance.
 * - 'conflicts': Contains unresolved scheduling conflicts (future).
 * - 'unknown': Status could not be determined.
 */
export type PublishReadinessStatus = 'ready' | 'incomplete' | 'moe-failed' | 'conflicts' | 'unknown';

/**
 * The result object from the publish readiness check.
 */
export interface PublishReadinessResult {
  /** The overall readiness status. */
  status: PublishReadinessStatus;
  
  /** A list of human-readable issues (in Thai) explaining why the status is not 'ready'. */
  issues: string[];

  /** Detailed breakdown of the validation results. */
  details: {
    incompleteGrades: GradeCompletion[];
    moeValidationResults: ProgramValidationResult[];
  };
}
