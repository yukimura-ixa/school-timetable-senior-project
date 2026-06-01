/**
 * Config Feature - Domain Types
 *
 * Type-safe schema for table_config.Config JSON field.
 * Eliminates `as any` casts and provides full type safety.
 */

import * as v from "valibot";

/**
 * Days of week enum for timetable configuration
 */
export const DayOfWeekSchema = v.picklist([
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
]);

export type DayOfWeek = v.InferOutput<typeof DayOfWeekSchema>;


/**
 * Complete configuration data for timetable generation
 * Maps to table_config.Config JSON field in Prisma schema
 *
 * @example
 * ```typescript
 * const config: ConfigData = {
 *   Days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
 *   StartTime: '08:30',
 *   Duration: 50,
 *   TimeslotPerDay: 9,
 *   breakDefinitions: [...],
 * };
 * ```
 */
export const ConfigDataSchema = v.object({
  /** Days of week included in timetable */
  Days: v.array(DayOfWeekSchema),

  /** Start time in HH:MM format (24-hour) */
  StartTime: v.pipe(v.string(), v.minLength(5), v.maxLength(5)),

  /** Duration of each timeslot in minutes */
  Duration: v.pipe(v.number(), v.integer(), v.minValue(1)),

  /** Number of timeslots per day */
  TimeslotPerDay: v.pipe(v.number(), v.integer(), v.minValue(1)),

  /** Break definitions in new system */
  breakDefinitions: v.optional(v.array(v.any())),
});

export type ConfigData = v.InferOutput<typeof ConfigDataSchema>;

/**
 * Input type for ConfigData (may have optional fields undefined)
 */
export type ConfigDataInput = v.InferInput<typeof ConfigDataSchema>;

/**
 * Type guard to check if value is valid ConfigData
 */
export function isConfigData(value: unknown): value is ConfigData {
  try {
    v.parse(ConfigDataSchema, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse and validate ConfigData from unknown input
 * Throws ValiError if validation fails
 */
export function parseConfigData(value: unknown): ConfigData {
  return v.parse(ConfigDataSchema, value);
}
