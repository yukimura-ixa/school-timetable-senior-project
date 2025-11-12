/**
 * Presentation Layer: Timetable Grid Component
 * 
 * MUI v7 responsive grid for displaying weekly timetable.
 * Replaces legacy TimeSlot component with modern design.
 * 
 * @module TimetableGrid
 */

'use client';

import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { TimeslotCard } from './TimeslotCard';
import type { TimeslotData } from '@/types/schedule.types';
import {
  DAY_LABELS_TH,
  DAY_COLORS,
  DAYS_OF_WEEK,
} from '@/features/schedule-arrangement/domain/constants';

interface TimetableGridProps {
  /** All timeslot data organized by day and period */
  timeslots: TimeslotData[];
  
  /** Number of periods per day */
  periodsPerDay: number;
  
  /** Break slot configurations */
  breakSlots?: {
    junior?: number;
    senior?: number;
  };
  
  /** Conflict checker */
  getConflicts?: (timeslotID: string) => {
    hasConflict: boolean;
    message?: string;
    severity?: 'error' | 'warning' | 'info';
  };
  
  /** Locked timeslots */
  lockedTimeslots?: Set<string>;
  
  /** Selected timeslot */
  selectedTimeslotID?: string | null;
  
  /** Handler for remove subject from slot */
  onRemoveSubject?: (timeslotID: string) => void;
  
  /** Handler for timeslot click */
  onTimeslotClick?: (timeslot: TimeslotData) => void;
}

/**
 * Timetable grid component
 */
export function TimetableGrid({
  timeslots,
  periodsPerDay,
  breakSlots,
  getConflicts,
  lockedTimeslots,
  selectedTimeslotID,
  onRemoveSubject,
  onTimeslotClick,
}: TimetableGridProps) {
  // Organize timeslots by day and period
  const timeslotsByDay = React.useMemo(() => {
    const organized: Record<string, TimeslotData[]> = {};
    
    DAYS_OF_WEEK.forEach(day => {
      organized[day] = [];
    });
    
    timeslots.forEach(slot => {
      if (organized[slot.DayOfWeek]) {
        organized[slot.DayOfWeek]?.push(slot);
      }
    });
    
    // Sort by slot number within each day
    Object.keys(organized).forEach(day => {
      organized[day]?.sort((a, b) => {
        const aNum = parseInt(a.TimeslotID.split('-').pop()?.replace(/[^\d]/g, '') || '0');
        const bNum = parseInt(b.TimeslotID.split('-').pop()?.replace(/[^\d]/g, '') || '0');
        return aNum - bNum;
      });
    });
    
    return organized;
  }, [timeslots]);

  // Generate period numbers (1, 2, 3, ...)
  const periods = Array.from({ length: periodsPerDay }, (_, i) => i + 1);

  // Check if timeslot is a break period based on Breaktime field
  const isBreakSlot = (timeslot: TimeslotData): boolean => {
    // Check if timeslot has Breaktime field that is not NOT_BREAK
    const breaktime = (timeslot as unknown as { Breaktime?: string }).Breaktime;
    return breaktime !== undefined && breaktime !== 'NOT_BREAK';
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Paper elevation={2} sx={{ minWidth: 800 }}>
        {/* Header Row - Days of Week */}
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderBottom: 2, borderColor: 'divider' }}>
          <Grid container spacing={1}>
            {/* Empty cell for period column */}
            <Grid size={1}>
              <Typography
                variant="caption"
                fontWeight="bold"
                color="text.secondary"
                textAlign="center"
                display="block"
              >
                คาบ
              </Typography>
            </Grid>
            
            {/* Day headers */}
            {DAYS_OF_WEEK.map(day => {
              const colors = DAY_COLORS[day];
              return (
                <Grid size="grow" key={day}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      bgcolor: colors?.bg || 'grey.50',
                      border: '2px solid',
                      borderColor: colors?.text || 'grey.300',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ color: colors?.text || 'text.primary' }}
                    >
                      {DAY_LABELS_TH[day]}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Timetable Body */}
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {periods.map(periodNum => {
              return (
                <Grid container spacing={1} key={periodNum}>
                  {/* Period Number */}
                  <Grid size={1}>
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 80,
                      }}
                    >
                      <Chip
                        label={periodNum}
                        color="default"
                        variant="outlined"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          minWidth: 40,
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Timeslots for each day */}
                  {DAYS_OF_WEEK.map(day => {
                    const dayTimeslots = timeslotsByDay[day] || [];
                    const timeslot = dayTimeslots[periodNum - 1];
                    
                    if (!timeslot) {
                      return (
                        <Grid size="grow" key={`${day}-${periodNum}`}>
                          <Paper
                            variant="outlined"
                            sx={{
                              minHeight: 80,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.50',
                            }}
                          >
                            <Typography variant="caption" color="text.disabled">
                              -
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    }

                    const conflicts = getConflicts?.(timeslot.TimeslotID) || {
                      hasConflict: false,
                    };
                    const isLocked = lockedTimeslots?.has(timeslot.TimeslotID) || false;
                    const isSelected = selectedTimeslotID === timeslot.TimeslotID;
                    const isBreak = isBreakSlot(timeslot);
                    
                    // Determine validation state from conflict severity
                    const validationState = conflicts.hasConflict
                      ? conflicts.severity === 'warning'
                        ? 'warning'
                        : conflicts.severity === 'error'
                          ? 'error'
                          : null
                      : null;

                    return (
                      <Grid size="grow" key={timeslot.TimeslotID}>
                        <TimeslotCard
                          timeslot={timeslot}
                          isBreak={isBreak}
                          hasConflict={conflicts.hasConflict}
                          conflictMessage={conflicts.message}
                          isLocked={isLocked}
                          isSelected={isSelected}
                          validationState={validationState}
                          onRemove={onRemoveSubject}
                          onClick={() => onTimeslotClick?.(timeslot)}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              );
            })}
          </Stack>
        </Box>

        {/* Footer Legend */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            <Chip
              icon={<Box sx={{ width: 12, height: 12, bgcolor: 'grey.300', borderRadius: 1 }} />}
              label="คาบว่าง"
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Box sx={{ width: 12, height: 12, bgcolor: 'warning.light', borderRadius: 1 }} />}
              label="คาบพัก"
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Box sx={{ width: 12, height: 12, bgcolor: 'error.light', borderRadius: 1 }} />}
              label="มีข้อขัดแย้ง"
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Box sx={{ width: 12, height: 12, bgcolor: 'grey.500', borderRadius: 1 }} />}
              label="ถูกล็อค"
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
