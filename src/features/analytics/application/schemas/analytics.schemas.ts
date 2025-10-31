/**
 * Analytics Validation Schemas
 * Valibot schemas for validating analytics action inputs
 */

import * as v from 'valibot';

/**
 * ConfigId format: "SEMESTER-YEAR" (e.g., "1-2567", "2-2567")
 */
export const ConfigIdSchema = v.pipe(
  v.string('ConfigId must be a string'),
  v.regex(/^\d-\d{4}$/, 'ConfigId must be in format "SEMESTER-YEAR" (e.g., "1-2567")')
);

/**
 * Teacher ID (positive integer)
 */
export const TeacherIdSchema = v.pipe(
  v.number('Teacher ID must be a number'),
  v.integer('Teacher ID must be an integer'),
  v.minValue(1, 'Teacher ID must be positive')
);

/**
 * Room ID (positive integer)
 */
export const RoomIdSchema = v.pipe(
  v.number('Room ID must be a number'),
  v.integer('Room ID must be an integer'),
  v.minValue(1, 'Room ID must be positive')
);

/**
 * Program ID (positive integer)
 */
export const ProgramIdSchema = v.pipe(
  v.number('Program ID must be a number'),
  v.integer('Program ID must be an integer'),
  v.minValue(1, 'Program ID must be positive')
);

/**
 * Grade ID format: "YEAR-NUMBER" (e.g., "2567-10", "2567-11")
 */
export const GradeIdSchema = v.pipe(
  v.string('Grade ID must be a string'),
  v.regex(/^\d{4}-\d+$/, 'Grade ID must be in format "YEAR-NUMBER" (e.g., "2567-10")')
);

/**
 * Limit for pagination (1-100)
 */
export const LimitSchema = v.optional(
  v.pipe(
    v.number('Limit must be a number'),
    v.integer('Limit must be an integer'),
    v.minValue(1, 'Limit must be at least 1'),
    v.maxValue(100, 'Limit must be at most 100')
  ),
  10
);

/**
 * Workload status values
 */
export const WorkloadStatusSchema = v.picklist(
  ['underutilized', 'optimal', 'high', 'overloaded'],
  'Invalid workload status'
);

/**
 * Room utilization status values
 */
export const RoomUtilizationStatusSchema = v.picklist(
  ['rarely-used', 'light', 'moderate', 'well-used', 'over-utilized'],
  'Invalid room utilization status'
);

/**
 * Subject category values
 */
export const SubjectCategorySchema = v.picklist(
  ['CORE', 'ADDITIONAL', 'ACTIVITY'],
  'Invalid subject category'
);

/**
 * Compliance threshold (0-100)
 */
export const ComplianceThresholdSchema = v.optional(
  v.pipe(
    v.number('Threshold must be a number'),
    v.minValue(0, 'Threshold must be at least 0'),
    v.maxValue(100, 'Threshold must be at most 100')
  ),
  80
);

// ============================================================================
// Action Input Schemas
// ============================================================================

/**
 * Get overview stats
 */
export const GetOverviewStatsSchema = v.object({
  configId: ConfigIdSchema,
});

/**
 * Get grade stats
 */
export const GetGradeStatsSchema = v.object({
  configId: ConfigIdSchema,
  gradeId: GradeIdSchema,
});

/**
 * Get teacher workloads
 */
export const GetTeacherWorkloadsSchema = v.object({
  configId: ConfigIdSchema,
});

/**
 * Get teacher workload by ID
 */
export const GetTeacherWorkloadByIdSchema = v.object({
  configId: ConfigIdSchema,
  teacherId: TeacherIdSchema,
});

/**
 * Get teachers by workload status
 */
export const GetTeachersByWorkloadStatusSchema = v.object({
  configId: ConfigIdSchema,
  status: WorkloadStatusSchema,
});

/**
 * Get top teachers by hours
 */
export const GetTopTeachersByHoursSchema = v.object({
  configId: ConfigIdSchema,
  limit: LimitSchema,
});

/**
 * Get room occupancy
 */
export const GetRoomOccupancySchema = v.object({
  configId: ConfigIdSchema,
});

/**
 * Get room occupancy by ID
 */
export const GetRoomOccupancyByIdSchema = v.object({
  configId: ConfigIdSchema,
  roomId: RoomIdSchema,
});

/**
 * Get rooms by utilization status
 */
export const GetRoomsByUtilizationStatusSchema = v.object({
  configId: ConfigIdSchema,
  status: RoomUtilizationStatusSchema,
});

/**
 * Get top rooms by occupancy
 */
export const GetTopRoomsByOccupancySchema = v.object({
  configId: ConfigIdSchema,
  limit: LimitSchema,
});

/**
 * Get subject distribution
 */
export const GetSubjectDistributionSchema = v.object({
  configId: ConfigIdSchema,
});

/**
 * Get subject distribution by category
 */
export const GetSubjectDistributionByCategorySchema = v.object({
  configId: ConfigIdSchema,
  category: SubjectCategorySchema,
});

/**
 * Get quality metrics
 */
export const GetQualityMetricsSchema = v.object({
  configId: ConfigIdSchema,
});

/**
 * Get period distribution
 */
export const GetPeriodDistributionSchema = v.object({
  configId: ConfigIdSchema,
});

/**
 * Get day distribution
 */
export const GetDayDistributionSchema = v.object({
  configId: ConfigIdSchema,
});

/**
 * Get peak hours
 */
export const GetPeakHoursSchema = v.object({
  configId: ConfigIdSchema,
  limit: LimitSchema,
});

/**
 * Get program compliance
 */
export const GetProgramComplianceSchema = v.object({
  configId: ConfigIdSchema,
});

/**
 * Get program compliance by ID
 */
export const GetProgramComplianceByIdSchema = v.object({
  configId: ConfigIdSchema,
  programId: ProgramIdSchema,
});

/**
 * Get programs below threshold
 */
export const GetProgramsBelowThresholdSchema = v.object({
  configId: ConfigIdSchema,
  threshold: ComplianceThresholdSchema,
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type GetOverviewStatsInput = v.InferOutput<typeof GetOverviewStatsSchema>;
export type GetGradeStatsInput = v.InferOutput<typeof GetGradeStatsSchema>;
export type GetTeacherWorkloadsInput = v.InferOutput<typeof GetTeacherWorkloadsSchema>;
export type GetTeacherWorkloadByIdInput = v.InferOutput<typeof GetTeacherWorkloadByIdSchema>;
export type GetTeachersByWorkloadStatusInput = v.InferOutput<typeof GetTeachersByWorkloadStatusSchema>;
export type GetTopTeachersByHoursInput = v.InferOutput<typeof GetTopTeachersByHoursSchema>;
export type GetRoomOccupancyInput = v.InferOutput<typeof GetRoomOccupancySchema>;
export type GetRoomOccupancyByIdInput = v.InferOutput<typeof GetRoomOccupancyByIdSchema>;
export type GetRoomsByUtilizationStatusInput = v.InferOutput<typeof GetRoomsByUtilizationStatusSchema>;
export type GetTopRoomsByOccupancyInput = v.InferOutput<typeof GetTopRoomsByOccupancySchema>;
export type GetSubjectDistributionInput = v.InferOutput<typeof GetSubjectDistributionSchema>;
export type GetSubjectDistributionByCategoryInput = v.InferOutput<typeof GetSubjectDistributionByCategorySchema>;
export type GetQualityMetricsInput = v.InferOutput<typeof GetQualityMetricsSchema>;
export type GetPeriodDistributionInput = v.InferOutput<typeof GetPeriodDistributionSchema>;
export type GetDayDistributionInput = v.InferOutput<typeof GetDayDistributionSchema>;
export type GetPeakHoursInput = v.InferOutput<typeof GetPeakHoursSchema>;
export type GetProgramComplianceInput = v.InferOutput<typeof GetProgramComplianceSchema>;
export type GetProgramComplianceByIdInput = v.InferOutput<typeof GetProgramComplianceByIdSchema>;
export type GetProgramsBelowThresholdInput = v.InferOutput<typeof GetProgramsBelowThresholdSchema>;
