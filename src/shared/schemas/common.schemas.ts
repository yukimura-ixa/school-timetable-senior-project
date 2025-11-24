/**
 * Common Valibot Schemas
 *
 * Reusable validation schemas used across features.
 * Define once, use everywhere for consistency.
 */

import * as v from "valibot";

/**
 * Academic year validation
 * Supports Buddhist calendar (Thai) years: 2500-2700
 * Note: Thai schools use Buddhist Era (BE) which is ~543 years ahead of CE
 */
export const academicYearSchema = v.pipe(
  v.number("Academic year must be a number"),
  v.minValue(2500, "Year must be 2500 or later"),
  v.maxValue(2700, "Year must be 2700 or earlier"),
);

/**
 * Semester validation
 * Must be "SEMESTER_1" or "SEMESTER_2" (matching database enum)
 */
export const semesterSchema = v.pipe(
  v.string("Semester must be a string"),
  v.picklist(
    ["SEMESTER_1", "SEMESTER_2"],
    "Semester must be SEMESTER_1 or SEMESTER_2",
  ),
);

/**
 * Non-empty string schema
 */
export const nonEmptyStringSchema = v.pipe(
  v.string("Must be a string"),
  v.nonEmpty("Cannot be empty"),
  v.trim(),
);

/**
 * ID schema (non-empty string)
 */
export const idSchema = nonEmptyStringSchema;

/**
 * Email schema
 */
export const emailSchema = v.pipe(
  v.string("Email must be a string"),
  v.nonEmpty("Email is required"),
  v.email("Invalid email format"),
  v.maxLength(100, "Email too long"),
);

/**
 * Positive number schema
 */
export const positiveNumberSchema = v.pipe(
  v.number("Must be a number"),
  v.minValue(1, "Must be greater than 0"),
);

/**
 * Pagination schema
 */
export const paginationSchema = v.object({
  page: v.optional(positiveNumberSchema, 1),
  pageSize: v.optional(
    v.pipe(
      v.number(),
      v.minValue(1, "Page size must be at least 1"),
      v.maxValue(100, "Page size cannot exceed 100"),
    ),
    20,
  ),
});

/**
 * Date range schema
 */
export const dateRangeSchema = v.object({
  startDate: v.pipe(
    v.string("Start date must be a string"),
    v.isoDate("Start date must be in ISO format"),
  ),
  endDate: v.pipe(
    v.string("End date must be a string"),
    v.isoDate("End date must be in ISO format"),
  ),
});

/**
 * Boolean flag schema
 */
export const booleanSchema = v.boolean("Must be true or false");

/**
 * Optional boolean with default
 */
export const optionalBooleanSchema = (defaultValue: boolean = false) =>
  v.optional(booleanSchema, defaultValue);
