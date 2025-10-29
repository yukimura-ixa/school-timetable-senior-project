/**
 * Presentation Layer: Config Form Component
 * 
 * Main form for timetable configuration using Zustand store
 * and MUI v7 components. Replaces legacy form implementation.
 * 
 * @module ConfigForm
 */

'use client';

import React from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Grid,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  LunchDining as LunchIcon,
  Coffee as CoffeeIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';
import { useConfigStore } from '@/features/config/presentation/stores/timetable-config.store';
import { CONFIG_CONSTRAINTS } from '@/features/config/domain/constants/config.constants';
import { NumberInput } from './NumberInput';
import { BreakSlotSelect } from './BreakSlotSelect';

interface ConfigFormProps {
  /** Whether the form is in view-only mode */
  readonly?: boolean;
}

/**
 * Config form component
 */
export function ConfigForm({ readonly = false }: ConfigFormProps) {
  const config = useConfigStore((state) => state.config);
  const errors = useConfigStore((state) => state.validationErrors);
  const updateField = useConfigStore((state) => state.updateField);
  const updateBreakSlot = useConfigStore((state) => state.updateBreakSlot);
  const updateMiniBreak = useConfigStore((state) => state.updateMiniBreak);
  const toggleMiniBreak = useConfigStore((state) => state.toggleMiniBreak);

  return (
    <Stack spacing={3}>
      {/* Timeslots Per Day */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h6">จำนวนคาบต่อวัน</Typography>
        </Stack>
        <NumberInput
          value={config.TimeslotPerDay}
          onChange={(val) => updateField('TimeslotPerDay', val)}
          min={CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.min}
          max={CONFIG_CONSTRAINTS.TIMESLOT_PER_DAY.max}
          step={1}
          unit="คาบ"
          disabled={readonly}
        />
        {errors.timeslotPerDay && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {errors.timeslotPerDay}
          </Typography>
        )}
      </Paper>

      {/* Start Time */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <ClockIcon color="primary" />
          <Typography variant="h6">เวลาเริ่มเรียน</Typography>
        </Stack>
        <TextField
          type="time"
          value={config.StartTime}
          onChange={(e) => updateField('StartTime', e.target.value)}
          disabled={readonly}
          error={!!errors.startTime}
          helperText={errors.startTime}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Paper>

      {/* Period Duration */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TimerIcon color="primary" />
          <Typography variant="h6">ระยะเวลาต่อคาบ</Typography>
        </Stack>
        <NumberInput
          value={config.Duration}
          onChange={(val) => updateField('Duration', val)}
          min={CONFIG_CONSTRAINTS.DURATION.min}
          max={CONFIG_CONSTRAINTS.DURATION.max}
          step={CONFIG_CONSTRAINTS.DURATION.step}
          unit="นาที"
          disabled={readonly}
        />
        {errors.duration && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {errors.duration}
          </Typography>
        )}
      </Paper>

      <Divider />

      {/* Break Timeslots */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <LunchIcon color="primary" />
          <Typography variant="h6">คาบพักเที่ยง</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <BreakSlotSelect
              label="มัธยมต้น (ม.1-3)"
              value={config.BreakTimeslots.Junior}
              onChange={(slot) => updateBreakSlot('Junior', slot)}
              maxSlots={config.TimeslotPerDay}
              error={errors.breakSlotJunior}
              disabled={readonly}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <BreakSlotSelect
              label="มัธยมปลาย (ม.4-6)"
              value={config.BreakTimeslots.Senior}
              onChange={(slot) => updateBreakSlot('Senior', slot)}
              maxSlots={config.TimeslotPerDay}
              error={errors.breakSlotSenior}
              disabled={readonly}
            />
          </Grid>
        </Grid>
        {errors.breakSlotWarning && (
          <Typography variant="caption" color="warning.main" sx={{ mt: 2, display: 'block' }}>
            ⚠️ {errors.breakSlotWarning}
          </Typography>
        )}
      </Paper>

      <Divider />

      {/* Mini Break */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <CoffeeIcon color="primary" />
          <Typography variant="h6">พักเบรก (ทางเลือก)</Typography>
        </Stack>
        <FormControlLabel
          control={
            <Switch
              checked={config.HasMinibreak}
              onChange={toggleMiniBreak}
              disabled={readonly}
            />
          }
          label="เปิดใช้งานพักเบรก"
        />

        {config.HasMinibreak && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <NumberInput
                  value={config.MiniBreak.Duration}
                  onChange={(val) => updateMiniBreak('Duration', val)}
                  min={CONFIG_CONSTRAINTS.MINI_BREAK_DURATION.min}
                  max={CONFIG_CONSTRAINTS.MINI_BREAK_DURATION.max}
                  step={CONFIG_CONSTRAINTS.MINI_BREAK_DURATION.step}
                  unit="นาที"
                  disabled={readonly}
                />
                {errors.miniBreakDuration && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.miniBreakDuration}
                  </Typography>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <BreakSlotSelect
                  label="หลังคาบที่"
                  value={config.MiniBreak.SlotNumber}
                  onChange={(slot) => updateMiniBreak('SlotNumber', slot)}
                  maxSlots={config.TimeslotPerDay}
                  error={errors.miniBreakSlot}
                  disabled={readonly}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Stack>
  );
}

