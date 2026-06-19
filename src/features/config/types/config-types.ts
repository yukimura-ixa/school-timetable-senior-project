/**
 * Shared types for the Config feature
 *
 * @module features/config/types/config-types
 */

import type {
  class_schedule,
  gradelevel,
  program,
  program_subject,
  subject,
  timeslot,
} from "@/prisma/generated/client";
import type { SlotConfig } from "@/features/timeslot/domain/models/break.types";

/**
 * Represents the full data set required for a readiness check.
 */
export interface FullConfigData {
  configId: string;
  schedules: class_schedule[];
  grades: gradelevel[];
  programs: (program & {
    program_subject: (program_subject & { subject: subject })[];
  })[];
  /** All timeslot rows for the term (used to count per-grade teaching slots). */
  timeslots: timeslot[];
  /** Per-period break config from table_config.Config.slots (empty if unparseable). */
  slots: SlotConfig[];
  /** grade -> break group names, for per-grade staggered-break exclusion. */
  gradeBreakIndex: Map<string, Set<string>>;
  totalTimeslots: number;
  requiredSubjects: Map<string, string[]>;
}
