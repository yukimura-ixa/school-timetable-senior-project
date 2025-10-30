/**
 * Presentation Layer: Schedule Progress Indicators
 * 
 * Visual progress tracking for schedule arrangement completion.
 * Phase 2 Part 3 - Interactive Enhancements
 * 
 * @module ScheduleProgressIndicators
 */

'use client';

import React from 'react';
import {
  Stack,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Box,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as EmptyIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

interface ProgressItem {
  id: string;
  name: string;
  total: number;
  completed: number;
  conflicts: number;
}

interface ScheduleProgressIndicatorsProps {
  teacherProgress?: ProgressItem[];
  classProgress?: ProgressItem[];
  overallProgress?: {
    totalSlots: number;
    filledSlots: number;
    conflictSlots: number;
  };
}

export function ScheduleProgressIndicators({
  teacherProgress = [],
  classProgress = [],
  overallProgress,
}: ScheduleProgressIndicatorsProps) {
  // ============================================================================
  // CALCULATIONS
  // ============================================================================
  
  const calculatePercentage = (completed: number, total: number): number => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getProgressColor = (percentage: number, hasConflicts: boolean): 'success' | 'warning' | 'error' | 'primary' => {
    if (hasConflicts) return 'error';
    if (percentage === 100) return 'success';
    if (percentage >= 50) return 'primary';
    return 'warning';
  };

  const overallPercentage = overallProgress
    ? calculatePercentage(overallProgress.filledSlots, overallProgress.totalSlots)
    : 0;

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderProgressItem = (item: ProgressItem, icon: React.ReactNode) => {
    const percentage = calculatePercentage(item.completed, item.total);
    const hasConflicts = item.conflicts > 0;
    const color = getProgressColor(percentage, hasConflicts);

    return (
      <Paper
        key={item.id}
        elevation={1}
        sx={{
          p: 1.5,
          border: 1,
          borderColor: hasConflicts ? 'error.light' : 'divider',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: 2,
            borderColor: hasConflicts ? 'error.main' : 'primary.main',
          },
        }}
      >
        <Stack spacing={1}>
          {/* Header */}
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1 }}>
              {icon}
              <Tooltip title={item.name}>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </Typography>
              </Tooltip>
            </Stack>

            <Chip
              label={`${percentage}%`}
              size="small"
              color={color}
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 'bold',
                minWidth: 45,
              }}
            />
          </Stack>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={color}
            sx={{ height: 6, borderRadius: 1 }}
          />

          {/* Stats */}
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {item.completed}/{item.total} คาบ
            </Typography>

            {hasConflicts && (
              <Chip
                label={`ขัดแย้ง: ${item.conflicts}`}
                size="small"
                color="error"
                variant="outlined"
                sx={{ height: 18, fontSize: '0.65rem' }}
              />
            )}

            {!hasConflicts && percentage === 100 && (
              <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
            )}
          </Stack>
        </Stack>
      </Paper>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <Stack spacing={2}>
      {/* Overall Progress */}
      {overallProgress && (
        <Paper elevation={2} sx={{ p: 2, bgcolor: 'primary.lighter' }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                  ความคืบหน้าโดยรวม
                </Typography>
              </Stack>

              <Chip
                label={`${overallPercentage}%`}
                color={overallPercentage === 100 ? 'success' : 'primary'}
                sx={{ fontWeight: 'bold' }}
              />
            </Stack>

            <LinearProgress
              variant="determinate"
              value={overallPercentage}
              color={overallPercentage === 100 ? 'success' : 'primary'}
              sx={{ height: 10, borderRadius: 1 }}
            />

            <Stack direction="row" spacing={2} justifyContent="space-between" flexWrap="wrap">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
                <Typography variant="caption">
                  เสร็จแล้ว: {overallProgress.filledSlots}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.5} alignItems="center">
                <EmptyIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="caption">
                  ว่าง: {overallProgress.totalSlots - overallProgress.filledSlots}
                </Typography>
              </Stack>

              {overallProgress.conflictSlots > 0 && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                    }}
                  />
                  <Typography variant="caption" color="error.main">
                    ขัดแย้ง: {overallProgress.conflictSlots}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Teacher Progress */}
      {teacherProgress.length > 0 && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight="bold">
                ความคืบหน้าตามครู
              </Typography>
              <Chip
                label={`${teacherProgress.length} คน`}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Stack>

            <Grid container spacing={1}>
              {teacherProgress.map((teacher) =>
                renderProgressItem(
                  teacher,
                  <PersonIcon fontSize="small" color="primary" />
                )
              )}
            </Grid>
          </Stack>
        </Paper>
      )}

      {/* Class Progress */}
      {classProgress.length > 0 && (
        <Paper elevation={1} sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SchoolIcon fontSize="small" color="secondary" />
              <Typography variant="subtitle2" fontWeight="bold">
                ความคืบหน้าตามห้องเรียน
              </Typography>
              <Chip
                label={`${classProgress.length} ห้อง`}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Stack>

            <Grid container spacing={1}>
              {classProgress.map((classItem) =>
                renderProgressItem(
                  classItem,
                  <SchoolIcon fontSize="small" color="secondary" />
                )
              )}
            </Grid>
          </Stack>
        </Paper>
      )}

      {/* Empty State */}
      {teacherProgress.length === 0 && classProgress.length === 0 && !overallProgress && (
        <Paper
          elevation={1}
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            ยังไม่มีข้อมูลความคืบหน้า
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
