/**
 * Assignment Summary Component
 * 
 * Displays statistics about selected subjects:
 * - Total selected count
 * - Total credits
 * - Category breakdown
 */

import React, { useMemo } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { SubjectCategory } from '@/features/program/domain/types/enums';
import type { SubjectConfig } from '../hooks/useSubjectAssignment';
import type { Subject } from '../hooks/useProgramSubjects';

interface AssignmentSummaryProps {
  subjectConfigs: Record<string, SubjectConfig>;
  subjects: Subject[];
}

/**
 * Renders summary statistics for subject assignments
 */
export function AssignmentSummary({ subjectConfigs, subjects }: AssignmentSummaryProps) {
  // Calculate category breakdown
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; credits: number }> = {};

    Object.values(subjectConfigs)
      .filter((config) => config.selected)
      .forEach((config) => {
        const subject = subjects.find((s) => s.SubjectCode === config.SubjectCode);
        if (!subject) return;

        const category = subject.Category;
        if (!stats[category]) {
          stats[category] = { count: 0, credits: 0 };
        }

        stats[category].count += 1;
        stats[category].credits += config.minCredits;
      });

    return stats;
  }, [subjectConfigs, subjects]);

  const selectedCount = Object.values(subjectConfigs).filter((c) => c.selected).length;
  const totalCredits = Object.values(subjectConfigs)
    .filter((c) => c.selected)
    .reduce((sum, c) => sum + c.minCredits, 0);
  const mandatoryCount = Object.values(subjectConfigs).filter((c) => c.selected && c.isMandatory).length;

  if (selectedCount === 0) {
    return (
      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          ยังไม่ได้เลือกรายวิชา กรุณาเลือกรายวิชาที่ต้องการมอบหมายให้หลักสูตร
        </Typography>
      </Box>
    );
  }

  // Category labels in Thai
  const categoryLabels: Record<SubjectCategory, string> = {
    [SubjectCategory.CORE]: 'พื้นฐาน',
    [SubjectCategory.ADDITIONAL]: 'เพิ่มเติม',
    [SubjectCategory.ACTIVITY]: 'กิจกรรมพัฒนาผู้เรียน',
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {/* Total Count */}
        <Chip
          label={`เลือกแล้ว ${selectedCount} รายวิชา`}
          color="primary"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />

        {/* Total Credits */}
        <Chip
          label={`รวม ${totalCredits} หน่วยกิต`}
          color="secondary"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />

        {/* Mandatory Count */}
        {mandatoryCount > 0 && (
          <Chip
            label={`บังคับ ${mandatoryCount} วิชา`}
            variant="outlined"
            size="small"
          />
        )}

        {/* Category Breakdown */}
        {Object.entries(categoryStats).map(([category, stats]) => (
          <Chip
            key={category}
            label={`${categoryLabels[category as SubjectCategory]}: ${stats.count} วิชา (${stats.credits} หน่วยกิต)`}
            variant="outlined"
            size="small"
            sx={{ bgcolor: 'background.paper' }}
          />
        ))}
      </Stack>
    </Box>
  );
}
