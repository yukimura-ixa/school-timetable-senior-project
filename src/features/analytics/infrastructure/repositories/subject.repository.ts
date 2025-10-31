/**
 * Subject Repository
 * Section 4: Subject Distribution
 *
 * Provides data fetching methods for subject distribution analysis by category, learning area, and program track.
 */

import prisma from '@/libs/prisma';
import type { SubjectDistribution } from '../../domain/types/analytics.types';
import { parseConfigId } from '../../domain/services/calculation.service';
import { SUBJECT_CATEGORIES } from '../../domain/types/analytics.types';
import type { SubjectCategory, LearningArea } from '@/prisma/generated';

/**
 * Get subject distribution by category and learning area
 */
async function getSubjectDistribution(configId: string): Promise<SubjectDistribution[]> {
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
  
  // Get all scheduled subjects for this semester
  const schedules = await prisma.class_schedule.findMany({
    where: {
      TimeslotID: {
        in: timeslotIds,
      },
    },
    select: {
      SubjectCode: true,
      TimeslotID: true,
      subject: {
        select: {
          SubjectCode: true,
          Category: true,
          LearningArea: true,
        },
      },
    },
  });
  
  // Count total hours
  const totalHours = schedules.length;
  
  // Aggregate by category and learning area
  const categoryMap = new Map<string, Map<string, Set<string>>>();
  
  schedules.forEach(schedule => {
    if (!schedule.subject) return;
    
    const category = schedule.subject.Category;
    const learningArea = schedule.subject.LearningArea || 'GENERAL';
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Map());
    }
    const areaMap = categoryMap.get(category);
    if (!areaMap) return;
    
    if (!areaMap.has(learningArea)) {
      areaMap.set(learningArea, new Set());
    }
    areaMap.get(learningArea)?.add(schedule.subject.SubjectCode);
  });
  
  // Transform to SubjectDistribution
  const distribution: SubjectDistribution[] = [];
  
  categoryMap.forEach((areaMap, category) => {
    areaMap.forEach((subjectCodes, learningArea) => {
      // Count hours for this category/area combination
      const hours = schedules.filter(s => 
        s.subject?.Category === category && 
        (s.subject?.LearningArea || 'GENERAL') === learningArea
      ).length;
      
      const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
      
      // Find category label
      const categoryInfo = SUBJECT_CATEGORIES.find(c => c.value === category);
      
      distribution.push({
        category: category as SubjectCategory,
        categoryLabel: categoryInfo?.label || category,
        learningArea: learningArea === 'GENERAL' ? undefined : (learningArea as LearningArea),
        totalHours: hours,
        percentage: Math.round(percentage * 10) / 10,
        subjectCount: subjectCodes.size,
        color: categoryInfo?.color || '#999999',
      });
    });
  });
  
  return distribution.sort((a, b) => b.totalHours - a.totalHours);
}

/**
 * Get subject distribution for a specific category
 */
async function getSubjectDistributionByCategory(
  configId: string,
  category: string
): Promise<SubjectDistribution[]> {
  const distribution = await getSubjectDistribution(configId);
  return distribution.filter(d => d.category === category);
}

/**
 * Get subject distribution for a specific learning area
 */
async function getSubjectDistributionByLearningArea(
  configId: string,
  learningArea: string
): Promise<SubjectDistribution[]> {
  const distribution = await getSubjectDistribution(configId);
  return distribution.filter(d => d.learningArea === learningArea);
}

/**
 * Get top N categories by hours
 */
async function getTopCategoriesByHours(
  configId: string,
  limit = 5
): Promise<SubjectDistribution[]> {
  const distribution = await getSubjectDistribution(configId);
  
  // Aggregate by category only
  const categoryTotals = new Map<string, SubjectDistribution>();
  distribution.forEach(d => {
    if (categoryTotals.has(d.category)) {
      const existing = categoryTotals.get(d.category);
      if (existing) {
        existing.totalHours += d.totalHours;
        existing.subjectCount += d.subjectCount;
        existing.percentage += d.percentage;
      }
    } else {
      categoryTotals.set(d.category, { ...d });
    }
  });
  
  return Array.from(categoryTotals.values())
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, limit);
}

export const subjectRepository = {
  getSubjectDistribution,
  getSubjectDistributionByCategory,
  getSubjectDistributionByLearningArea,
  getTopCategoriesByHours,
};
