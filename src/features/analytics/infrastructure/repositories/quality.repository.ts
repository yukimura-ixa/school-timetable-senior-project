/**
 * Quality Repository
 * Section 5: Schedule Quality Metrics
 *
 * Provides data fetching methods for schedule quality analysis including conflicts, gaps, and balance.
 * Reuses metrics from overview repository for consistency.
 */

import prisma from '@/lib/prisma';
import { parseConfigId } from '../../domain/services/calculation.service';
import { overviewRepository } from './overview.repository';

/**
 * Quality metrics type
 */
export type QualityMetrics = {
  totalConflicts: number;
  completionRate: number;
  lockedPercentage: number;
  activeTeachers: number;
  totalGrades: number;
  balanceScore: number;  // 0-100, higher is better
};

/**
 * Get overall schedule quality metrics
 */
async function getQualityMetrics(configId: string): Promise<QualityMetrics> {
  // Reuse overview stats
  const [overviewStats, lockStatus] = await Promise.all([
    overviewRepository.getOverviewStats(configId),
    overviewRepository.getLockStatusSummary(configId),
  ]);
  
  // Calculate balance score based on completion and lock status
  // High completion + high lock rate = good balance
  const balanceScore = (
    overviewStats.completionRate * 0.7 +
    lockStatus.lockedPercentage * 0.3
  );
  
  return {
    totalConflicts: overviewStats.scheduleConflicts,
    completionRate: overviewStats.completionRate,
    lockedPercentage: lockStatus.lockedPercentage,
    activeTeachers: overviewStats.activeTeachers,
    totalGrades: overviewStats.totalGrades,
    balanceScore: Math.round(balanceScore * 10) / 10,
  };
}

/**
 * Get gap analysis (periods with no schedules)
 */
async function getGapAnalysis(configId: string): Promise<{
  totalGaps: number;
  gapsByGrade: Map<string, number>;
}> {
  const config = parseConfigId(configId);
  
  // Get timeslot IDs for this semester
  const timeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: config.academicYear,
      Semester: config.semester,
    },
    select: {
      TimeslotID: true,
    },
  });
  
  const timeslotIds = timeslots.map(t => t.TimeslotID);
  
  // Get all gradelevels
  const gradelevels = await prisma.gradelevel.findMany({
    where: {
      Year: config.academicYear,
    },
    select: {
      GradeID: true,
    },
  });
  
  // Get all schedules
  const schedules = await prisma.class_schedule.findMany({
    where: {
      TimeslotID: {
        in: timeslotIds,
      },
    },
    select: {
      GradeID: true,
      TimeslotID: true,
    },
  });
  
  // Calculate gaps per grade
  const gapsByGrade = new Map<string, number>();
  const totalSlotsPerGrade = timeslotIds.length;
  
  gradelevels.forEach(grade => {
    const scheduledSlots = schedules.filter(s => s.GradeID === grade.GradeID).length;
    const gaps = totalSlotsPerGrade - scheduledSlots;
    gapsByGrade.set(grade.GradeID, gaps);
  });
  
  const totalGaps = Array.from(gapsByGrade.values()).reduce((sum, gaps) => sum + gaps, 0);
  
  return {
    totalGaps,
    gapsByGrade,
  };
}

/**
 * Check if schedule quality is acceptable
 */
async function isQualityAcceptable(configId: string): Promise<{
  isAcceptable: boolean;
  reasons: string[];
}> {
  const metrics = await getQualityMetrics(configId);
  const reasons: string[] = [];
  
  // Quality checks
  if (metrics.totalConflicts > 0) {
    reasons.push(`มีความขัดแย้ง ${metrics.totalConflicts} รายการ`);
  }
  
  if (metrics.completionRate < 80) {
    reasons.push(`อัตราความสมบูรณ์ต่ำ (${metrics.completionRate}%)`);
  }
  
  if (metrics.balanceScore < 70) {
    reasons.push(`คะแนนความสมดุลต่ำ (${metrics.balanceScore}/100)`);
  }
  
  return {
    isAcceptable: reasons.length === 0,
    reasons,
  };
}

export const qualityRepository = {
  getQualityMetrics,
  getGapAnalysis,
  isQualityAcceptable,
};
