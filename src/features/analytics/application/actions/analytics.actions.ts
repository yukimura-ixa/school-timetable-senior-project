/**
 * Analytics Server Actions
 * Server-side actions for analytics features with input validation
 */

'use server';

import { safeParse } from 'valibot';
import { cache } from 'react';

// Repositories
import { overviewRepository } from '../../infrastructure/repositories/overview.repository';
import { teacherRepository } from '../../infrastructure/repositories/teacher.repository';
import { roomRepository } from '../../infrastructure/repositories/room.repository';
import { subjectRepository } from '../../infrastructure/repositories/subject.repository';
import { qualityRepository } from '../../infrastructure/repositories/quality.repository';
import { timeRepository } from '../../infrastructure/repositories/time.repository';
import { complianceRepository } from '../../infrastructure/repositories/compliance.repository';

// Schemas
import {
  GetOverviewStatsSchema,
  GetGradeStatsSchema,
  GetTeacherWorkloadsSchema,
  GetTeacherWorkloadByIdSchema,
  GetTeachersByWorkloadStatusSchema,
  GetTopTeachersByHoursSchema,
  GetRoomOccupancySchema,
  GetRoomOccupancyByIdSchema,
  GetRoomsByUtilizationStatusSchema,
  GetTopRoomsByOccupancySchema,
  GetSubjectDistributionSchema,
  GetSubjectDistributionByCategorySchema,
  GetQualityMetricsSchema,
  GetPeriodDistributionSchema,
  GetDayDistributionSchema,
  GetPeakHoursSchema,
  GetProgramComplianceSchema,
  GetProgramComplianceByIdSchema,
  GetProgramsBelowThresholdSchema,
} from '../schemas/analytics.schemas';

// Types
import type {
  OverviewStats,
  TeacherWorkload,
  DepartmentWorkload,
  RoomOccupancy,
  SubjectDistribution,
  CompletionMetrics,
  ProgramCompliance,
} from '../../domain/types/analytics.types';
import type { QualityMetrics } from '../../infrastructure/repositories/quality.repository';
import type { PeriodDistribution, DayDistribution } from '../../infrastructure/repositories/time.repository';

/**
 * Standard action result type
 */
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Helper to wrap repository calls with error handling
 */
async function handleAction<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    console.error('Analytics action error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// Section 1: Overview Actions
// ============================================================================

/**
 * Get overview statistics for a semester
 */
export const getOverviewStats = cache(async (
  input: unknown
): Promise<ActionResult<OverviewStats>> => {
  const validation = safeParse(GetOverviewStatsSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    overviewRepository.getOverviewStats(validation.output.configId)
  );
});

/**
 * Get grade-specific statistics
 */
export const getGradeStats = cache(async (
  input: unknown
): Promise<ActionResult<{
  gradeId: string;
  gradeInfo: { Year: number; Number: number; StudentCount: number; program: { ProgramName: string; ProgramCode: string } | null } | null;
  scheduledHours: number;
  totalHours: number;
  completionRate: number;
}>> => {
  const validation = safeParse(GetGradeStatsSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    overviewRepository.getGradeStats(validation.output.configId, validation.output.gradeId)
  );
});

/**
 * Get lock status summary
 */
export async function getLockStatusSummary(
  input: unknown
): Promise<ActionResult<{ locked: number; unlocked: number; total: number; lockedPercentage: number; unlockedPercentage: number }>> {
  const validation = safeParse(GetOverviewStatsSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    overviewRepository.getLockStatusSummary(validation.output.configId)
  );
}

/**
 * Get completion metrics
 */
export const getCompletionMetrics = cache(async (
  input: unknown
): Promise<ActionResult<CompletionMetrics>> => {
  const validation = safeParse(GetOverviewStatsSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    overviewRepository.getCompletionMetrics(validation.output.configId)
  );
});

// ============================================================================
// Section 2: Teacher Workload Actions
// ============================================================================

/**
 * Get all teacher workloads
 */
export const getTeacherWorkloads = cache(async (
  input: unknown
): Promise<ActionResult<TeacherWorkload[]>> => {
  const validation = safeParse(GetTeacherWorkloadsSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    teacherRepository.getTeacherWorkloads(validation.output.configId)
  );
});

/**
 * Get department workload summaries
 */
export const getDepartmentWorkloads = cache(async (
  input: unknown
): Promise<ActionResult<DepartmentWorkload[]>> => {
  const validation = safeParse(GetTeacherWorkloadsSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    teacherRepository.getDepartmentWorkloads(validation.output.configId)
  );
});

/**
 * Get teacher workload by ID
 */
export const getTeacherWorkloadById = cache(async (
  input: unknown
): Promise<ActionResult<TeacherWorkload | null>> => {
  const validation = safeParse(GetTeacherWorkloadByIdSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    teacherRepository.getTeacherWorkloadById(
      validation.output.configId,
      validation.output.teacherId
    )
  );
});

/**
 * Get teachers by workload status
 */
export const getTeachersByWorkloadStatus = cache(async (
  input: unknown
): Promise<ActionResult<TeacherWorkload[]>> => {
  const validation = safeParse(GetTeachersByWorkloadStatusSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    teacherRepository.getTeachersByWorkloadStatus(
      validation.output.configId,
      validation.output.status
    )
  );
});

/**
 * Get top teachers by hours
 */
export const getTopTeachersByHours = cache(async (
  input: unknown
): Promise<ActionResult<TeacherWorkload[]>> => {
  const validation = safeParse(GetTopTeachersByHoursSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    teacherRepository.getTopTeachersByHours(
      validation.output.configId,
      validation.output.limit
    )
  );
});

// ============================================================================
// Section 3: Room Utilization Actions
// ============================================================================

/**
 * Get room occupancy data
 */
export const getRoomOccupancy = cache(async (
  input: unknown
): Promise<ActionResult<RoomOccupancy[]>> => {
  const validation = safeParse(GetRoomOccupancySchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    roomRepository.getRoomOccupancy(validation.output.configId)
  );
});

/**
 * Get room occupancy by ID
 */
export const getRoomOccupancyById = cache(async (
  input: unknown
): Promise<ActionResult<RoomOccupancy | null>> => {
  const validation = safeParse(GetRoomOccupancyByIdSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    roomRepository.getRoomOccupancyById(
      validation.output.configId,
      validation.output.roomId
    )
  );
});

/**
 * Get rooms by utilization status
 */
export const getRoomsByUtilizationStatus = cache(async (
  input: unknown
): Promise<ActionResult<RoomOccupancy[]>> => {
  const validation = safeParse(GetRoomsByUtilizationStatusSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    roomRepository.getRoomsByUtilizationStatus(
      validation.output.configId,
      validation.output.status
    )
  );
});

/**
 * Get top rooms by occupancy
 */
export const getTopRoomsByOccupancy = cache(async (
  input: unknown
): Promise<ActionResult<RoomOccupancy[]>> => {
  const validation = safeParse(GetTopRoomsByOccupancySchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    roomRepository.getTopRoomsByOccupancy(
      validation.output.configId,
      validation.output.limit
    )
  );
});

/**
 * Get low utilization rooms
 */
export const getLowUtilizationRooms = cache(async (
  input: unknown
): Promise<ActionResult<RoomOccupancy[]>> => {
  const validation = safeParse(GetRoomOccupancySchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    roomRepository.getLowUtilizationRooms(validation.output.configId)
  );
});

// ============================================================================
// Section 4: Subject Distribution Actions
// ============================================================================

/**
 * Get subject distribution
 */
export const getSubjectDistribution = cache(async (
  input: unknown
): Promise<ActionResult<SubjectDistribution[]>> => {
  const validation = safeParse(GetSubjectDistributionSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    subjectRepository.getSubjectDistribution(validation.output.configId)
  );
});

/**
 * Get subject distribution by category
 */
export const getSubjectDistributionByCategory = cache(async (
  input: unknown
): Promise<ActionResult<SubjectDistribution[]>> => {
  const validation = safeParse(GetSubjectDistributionByCategorySchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    subjectRepository.getSubjectDistributionByCategory(
      validation.output.configId,
      validation.output.category
    )
  );
});

/**
 * Get top categories by hours
 */
export const getTopCategoriesByHours = cache(async (
  input: unknown
): Promise<ActionResult<SubjectDistribution[]>> => {
  const validation = safeParse(GetTopTeachersByHoursSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    subjectRepository.getTopCategoriesByHours(
      validation.output.configId,
      validation.output.limit
    )
  );
});

// ============================================================================
// Section 5: Quality Metrics Actions
// ============================================================================

/**
 * Get quality metrics
 */
export const getQualityMetrics = cache(async (
  input: unknown
): Promise<ActionResult<QualityMetrics>> => {
  const validation = safeParse(GetQualityMetricsSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    qualityRepository.getQualityMetrics(validation.output.configId)
  );
});

/**
 * Get gap analysis
 */
export async function getGapAnalysis(
  input: unknown
): Promise<ActionResult<{ totalGaps: number; gapsByGrade: Map<string, number> }>> {
  const validation = safeParse(GetQualityMetricsSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    qualityRepository.getGapAnalysis(validation.output.configId)
  );
}

/**
 * Check if quality is acceptable
 */
export async function isQualityAcceptable(
  input: unknown
): Promise<ActionResult<{ isAcceptable: boolean; reasons: string[] }>> {
  const validation = safeParse(GetQualityMetricsSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    qualityRepository.isQualityAcceptable(validation.output.configId)
  );
}

// ============================================================================
// Section 6: Time Analysis Actions
// ============================================================================

/**
 * Get period distribution
 */
export const getPeriodDistribution = cache(async (
  input: unknown
): Promise<ActionResult<PeriodDistribution[]>> => {
  const validation = safeParse(GetPeriodDistributionSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    timeRepository.getPeriodDistribution(validation.output.configId)
  );
});

/**
 * Get day distribution
 */
export const getDayDistribution = cache(async (
  input: unknown
): Promise<ActionResult<DayDistribution[]>> => {
  const validation = safeParse(GetDayDistributionSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    timeRepository.getDayDistribution(validation.output.configId)
  );
});

/**
 * Get peak hours
 */
export const getPeakHours = cache(async (
  input: unknown
): Promise<ActionResult<PeriodDistribution[]>> => {
  const validation = safeParse(GetPeakHoursSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    timeRepository.getPeakHours(
      validation.output.configId,
      validation.output.limit
    )
  );
});

/**
 * Get least utilized periods
 */
export const getLeastUtilizedPeriods = cache(async (
  input: unknown
): Promise<ActionResult<PeriodDistribution[]>> => {
  const validation = safeParse(GetPeakHoursSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    timeRepository.getLeastUtilizedPeriods(
      validation.output.configId,
      validation.output.limit
    )
  );
});

// ============================================================================
// Section 7: Program Compliance Actions
// ============================================================================

/**
 * Get program compliance
 */
export const getProgramCompliance = cache(async (
  input: unknown
): Promise<ActionResult<ProgramCompliance[]>> => {
  const validation = safeParse(GetProgramComplianceSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    complianceRepository.getProgramCompliance(validation.output.configId)
  );
});

/**
 * Get program compliance by ID
 */
export const getProgramComplianceById = cache(async (
  input: unknown
): Promise<ActionResult<ProgramCompliance | null>> => {
  const validation = safeParse(GetProgramComplianceByIdSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    complianceRepository.getProgramComplianceById(
      validation.output.configId,
      validation.output.programId
    )
  );
});

/**
 * Get programs below threshold
 */
export const getProgramsBelowThreshold = cache(async (
  input: unknown
): Promise<ActionResult<ProgramCompliance[]>> => {
  const validation = safeParse(GetProgramsBelowThresholdSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    complianceRepository.getProgramsBelowThreshold(
      validation.output.configId,
      validation.output.threshold
    )
  );
});

/**
 * Get programs with missing subjects
 */
export const getProgramsWithMissingSubjects = cache(async (
  input: unknown
): Promise<ActionResult<ProgramCompliance[]>> => {
  const validation = safeParse(GetProgramComplianceSchema, input);
  if (!validation.success) {
    return { success: false, error: validation.issues[0].message };
  }

  return handleAction(() => 
    complianceRepository.getProgramsWithMissingSubjects(validation.output.configId)
  );
});
