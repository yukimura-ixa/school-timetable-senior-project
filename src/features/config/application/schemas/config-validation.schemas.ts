/**
 * Config Validation Schemas
 * Valibot schemas for timetable configuration
 */

import * as v from "valibot";

// Valid days of week
export const DayOfWeekSchema = v.picklist([
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
  "SUN",
]);

// Mini break configuration
export const MiniBreakSchema = v.object({
  Duration: v.pipe(
    v.number(),
    v.minValue(5, "Mini break must be at least 5 minutes"),
    v.maxValue(30, "Mini break cannot exceed 30 minutes")
  ),
  SlotNumber: v.pipe(
    v.number(),
    v.minValue(1, "Slot number must be at least 1"),
    v.maxValue(10, "Slot number cannot exceed 10")
  ),
});

// Break timeslots for junior/senior
export const BreakTimeslotsSchema = v.object({
  Junior: v.pipe(
    v.number(),
    v.minValue(1, "Junior break slot must be at least 1"),
    v.maxValue(10, "Junior break slot cannot exceed 10")
  ),
  Senior: v.pipe(
    v.number(),
    v.minValue(1, "Senior break slot must be at least 1"),
    v.maxValue(10, "Senior break slot cannot exceed 10")
  ),
});

// Main config schema
export const TimetableConfigSchema = v.object({
  Days: v.pipe(
    v.array(DayOfWeekSchema),
    v.minLength(1, "At least one day must be selected"),
    v.maxLength(7, "Cannot exceed 7 days")
  ),
  AcademicYear: v.pipe(
    v.number(),
    v.minValue(2500, "Academic year must be at least 2500"),
    v.maxValue(2600, "Academic year cannot exceed 2600")
  ),
  Semester: v.picklist(["SEMESTER_1", "SEMESTER_2"]),
  StartTime: v.pipe(
    v.string(),
    v.regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
  ),
  Duration: v.pipe(
    v.number(),
    v.minValue(30, "Duration must be at least 30 minutes"),
    v.maxValue(120, "Duration cannot exceed 120 minutes")
  ),
  BreakDuration: v.pipe(
    v.number(),
    v.minValue(30, "Break duration must be at least 30 minutes"),
    v.maxValue(120, "Break duration cannot exceed 120 minutes")
  ),
  TimeslotPerDay: v.pipe(
    v.number(),
    v.minValue(6, "Must have at least 6 timeslots per day"),
    v.maxValue(12, "Cannot exceed 12 timeslots per day")
  ),
  BreakTimeslots: BreakTimeslotsSchema,
  HasMinibreak: v.boolean(),
  MiniBreak: v.optional(MiniBreakSchema),
});

// Type export
export type TimetableConfig = v.InferOutput<typeof TimetableConfigSchema>;
export type DayOfWeek = v.InferOutput<typeof DayOfWeekSchema>;
export type MiniBreak = v.InferOutput<typeof MiniBreakSchema>;
export type BreakTimeslots = v.InferOutput<typeof BreakTimeslotsSchema>;

// Validation helper
export function validateConfig(data: unknown) {
  try {
    return {
      success: true,
      data: v.parse(TimetableConfigSchema, data),
      error: null,
    };
  } catch (error) {
    if (error instanceof v.ValiError) {
      const firstIssue = error.issues[0];
      return {
        success: false,
        data: null,
        error: firstIssue?.message || "Validation failed",
      };
    }
    return {
      success: false,
      data: null,
      error: "Unknown validation error",
    };
  }
}
