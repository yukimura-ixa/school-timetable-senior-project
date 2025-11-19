/**
 * Shared types for the Config feature
 * 
 * @module features/config/types/config-types
 */

import type { class_schedule, gradelevel, program, program_subject, subject } from "@/prisma/generated";

/**
 * Represents the full data set required for a readiness check.
 */
export interface FullConfigData {
  configId: string;
  schedules: class_schedule[];
  grades: gradelevel[];
  programs: (program & { program_subject: (program_subject & { subject: subject })[] })[];
  totalTimeslots: number;
  requiredSubjects: Map<string, string[]>;
}
