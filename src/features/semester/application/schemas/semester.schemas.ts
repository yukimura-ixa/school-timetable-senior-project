/**
 * Semester Valibot Schemas
 * Validation for semester operations (create, update, filter, copy)
 */

import * as v from "valibot";

// Semester Status Enum Schema
export const SemesterStatusSchema = v.picklist([
  "DRAFT",
  "PUBLISHED",
  "LOCKED",
  "ARCHIVED",
]);

export type SemesterStatus = v.InferOutput<typeof SemesterStatusSchema>;

// Semester Filter Schema
export const SemesterFilterSchema = v.object({
  search: v.optional(v.string()),
  status: v.optional(SemesterStatusSchema),
  year: v.optional(v.number()),
  sortBy: v.optional(
    v.picklist(["recent", "name", "status", "year", "completeness"])
  ),
  sortOrder: v.optional(v.picklist(["asc", "desc"])),
  showArchived: v.optional(v.boolean()),
});

export type SemesterFilter = v.InferOutput<typeof SemesterFilterSchema>;

// Create Semester Schema
export const CreateSemesterSchema = v.object({
  academicYear: v.pipe(
    v.number(),
    v.minValue(2500, "ปีการศึกษาต้องมากกว่า 2500"),
    v.maxValue(2600, "ปีการศึกษาต้องน้อยกว่า 2600")
  ),
  semester: v.pipe(v.number(), v.minValue(1), v.maxValue(2)),
  copyFromConfigId: v.optional(v.string()),
  copyConfig: v.optional(v.boolean()),
  copyTeachers: v.optional(v.boolean()),
  copyRooms: v.optional(v.boolean()),
  copySubjects: v.optional(v.boolean()),
});

export type CreateSemester = v.InferOutput<typeof CreateSemesterSchema>;

// Update Semester Status Schema
export const UpdateSemesterStatusSchema = v.object({
  configId: v.pipe(v.string(), v.minLength(1)),
  status: SemesterStatusSchema,
});

export type UpdateSemesterStatus = v.InferOutput<
  typeof UpdateSemesterStatusSchema
>;

// Pin Semester Schema
export const PinSemesterSchema = v.object({
  configId: v.pipe(v.string(), v.minLength(1)),
  isPinned: v.boolean(),
});

export type PinSemester = v.InferOutput<typeof PinSemesterSchema>;

// Track Access Schema
export const TrackSemesterAccessSchema = v.object({
  configId: v.pipe(v.string(), v.minLength(1)),
});

export type TrackSemesterAccess = v.InferOutput<
  typeof TrackSemesterAccessSchema
>;

// Copy Semester Schema
export const CopySemesterSchema = v.object({
  sourceConfigId: v.pipe(v.string(), v.minLength(1)),
  targetAcademicYear: v.pipe(
    v.number(),
    v.minValue(2500),
    v.maxValue(2600)
  ),
  targetSemester: v.pipe(v.number(), v.minValue(1), v.maxValue(2)),
  copyConfig: v.boolean(),
  copyTimeslots: v.optional(v.boolean()),
  copyAssignments: v.optional(v.boolean()),
  copySchedules: v.optional(v.boolean()),
});

export type CopySemester = v.InferOutput<typeof CopySemesterSchema>;

// Semester DTO (Data Transfer Object)
export const SemesterDTOSchema = v.object({
  configId: v.string(),
  academicYear: v.number(),
  semester: v.number(),
  status: SemesterStatusSchema,
  isPinned: v.boolean(),
  configCompleteness: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  lastAccessedAt: v.optional(v.date()),
  publishedAt: v.optional(v.date()),
  createdAt: v.date(),
  updatedAt: v.date(),
  // Computed fields
  classCount: v.optional(v.number()),
  teacherCount: v.optional(v.number()),
  roomCount: v.optional(v.number()),
  subjectCount: v.optional(v.number()),
});

export type SemesterDTO = v.InferOutput<typeof SemesterDTOSchema>;
