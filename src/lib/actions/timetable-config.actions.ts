/**
 * Timetable Configuration Server Actions
 *
 * Provides client-accessible actions for fetching timetable configuration.
 */

"use server";

import * as v from "valibot";
import {
  getTimetableConfig,
  getDefaultTimetableConfig,
} from "@/lib/timetable-config";
import type { semester } from "@/prisma/generated/client";
import { createAction, createPublicAction } from "@/shared/lib/action-wrapper";

/**
 * Get timetable configuration for a specific semester (Server Action)
 *
 * @param academicYear - Academic year
 * @param semester - Semester
 * @returns Action result with configuration
 */

export type GetTimetableConfigInput = {
  academicYear: number;
  semester: semester;
};

const getTimetableConfigSchema = v.object({
  academicYear: v.number(),
  semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
});

export const getTimetableConfigAction = createAction(
  getTimetableConfigSchema,
  async (input: GetTimetableConfigInput) => {
    try {
      return await getTimetableConfig(input.academicYear, input.semester);
    } catch (error) {
      console.error("Error in getTimetableConfigAction:", error);
      // Return default config on error
      return getDefaultTimetableConfig();
    }
  },
);

/**
 * Get default configuration (doesn't require DB access)
 * Public action - no auth required
 */
export const getDefaultTimetableConfigAction = createPublicAction(
  v.object({}),
  async () => {
    return getDefaultTimetableConfig();
  },
);
