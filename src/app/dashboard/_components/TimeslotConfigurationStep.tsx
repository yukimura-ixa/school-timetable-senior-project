"use client";

/**
 * Timeslot Configuration Step Component
 * Form for configuring timeslots during semester creation
 *
 * Used in CreateSemesterWizard as Step 3.
 * Reads academicYear/semester from CreateSemesterContext and pushes
 * config changes back via setTimeslotConfig / setIsTimeslotConfigValid.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Slider,
  Stack,
  Chip,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import {
  AccessTime,
  CalendarMonth,
  Schedule,
  Add,
  Delete,
} from "@mui/icons-material";
import type { CreateTimeslotsInput } from "@/features/timeslot/application/schemas/timeslot.schemas";
import type { day_of_week } from "@/prisma/generated/client";
import { useCreateSemester } from "./CreateSemesterWizard/CreateSemesterContext";
import {
  DEFAULT_BREAK_GROUPS,
  DEFAULT_BREAK_DEFINITIONS,
  DEFAULT_JUNIOR_GRADES,
  DEFAULT_SENIOR_GRADES,
  type BreakDefinition,
  type BreakGroup,
} from "@/features/timeslot/domain/models/break.types";
import { generatePreviewSlots } from "@/features/timeslot/domain/services/timeslot-config.service";

const DAYS: { value: day_of_week; label: string }[] = [
  { value: "MON", label: "จันทร์" },
  { value: "TUE", label: "อังคาร" },
  { value: "WED", label: "พุธ" },
  { value: "THU", label: "พฤหัสบดี" },
  { value: "FRI", label: "ศุกร์" },
  { value: "SAT", label: "เสาร์" },
  { value: "SUN", label: "อาทิตย์" },
];

type Props = {
  initialConfig?: Partial<CreateTimeslotsInput>;
  initialBreakGroups?: BreakGroup[];
};

export function TimeslotConfigurationStep({ initialConfig, initialBreakGroups }: Props) {
  const {
    academicYear,
    semester,
    setTimeslotConfig,
    setIsTimeslotConfigValid,
  } = useCreateSemester();

  // Core schedule fields (Days / StartTime) held in config state
  const [config, setConfig] = useState<Pick<CreateTimeslotsInput, "AcademicYear" | "Semester" | "Days" | "StartTime">>({
    AcademicYear: academicYear,
    Semester: semester === 1 ? "SEMESTER_1" : "SEMESTER_2",
    Days: initialConfig?.Days ?? ["MON", "TUE", "WED", "THU", "FRI"],
    StartTime: initialConfig?.StartTime ?? "08:30",
  });

  // Local UI state for per-slot defaults (used by preview and slot builder)
  const [duration, setDuration] = useState(50);
  const [timeslotPerDay, setTimeslotPerDay] = useState(8);

  const [breakGroups, setBreakGroups] = useState(() => {
    if (initialBreakGroups && initialBreakGroups.length > 0) {
      return initialBreakGroups.map((g) => ({
        Name: g.name,
        Label: g.label,
        Color: g.color,
        gradeIds: g.gradeIds,
      }));
    }
    return DEFAULT_BREAK_GROUPS.map((g) => ({
      Name: g.Name,
      Label: g.Label,
      Color: g.Color,
      gradeIds:
        g.Name === "junior"
          ? [...DEFAULT_JUNIOR_GRADES]
          : [...DEFAULT_SENIOR_GRADES],
    }));
  });

  const [breakDefs, setBreakDefs] = useState<BreakDefinition[]>(
    [...DEFAULT_BREAK_DEFINITIONS],
  );

  const errors = (() => {
    const newErrors: Record<string, string> = {};

    if (config.Days.length === 0) {
      newErrors.days = "กรุณาเลือกอย่างน้อย 1 วัน";
    }

    if (!config.StartTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      newErrors.startTime = "รูปแบบเวลาไม่ถูกต้อง (HH:MM)";
    }

    if (duration < 10 || duration > 120) {
      newErrors.duration = "ระยะเวลาต่อคาบต้องอยู่ระหว่าง 10-120 นาที";
    }

    if (timeslotPerDay < 1 || timeslotPerDay > 15) {
      newErrors.timeslotPerDay = "จำนวนคาบต่อวันต้องอยู่ระหว่าง 1-15";
    }

    return newErrors;
  })();

  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    setIsTimeslotConfigValid(isValid);

    if (isValid) {
      // Build slots[] from duration/timeslotPerDay/breakDefs
      // breakDefs carry slotNumber (1-based) indicating "break before this period"
      const breaksBySlot = new Map<number, BreakDefinition[]>();
      for (const brk of breakDefs) {
        const existing = breaksBySlot.get(brk.slotNumber) ?? [];
        existing.push(brk);
        breaksBySlot.set(brk.slotNumber, existing);
      }

      const slots: Array<{ duration: number; breakGroups?: string[] }> = [];
      // Insert break slots before the teaching period they precede
      for (let period = 1; period <= timeslotPerDay; period++) {
        const breaksHere = breaksBySlot.get(period) ?? [];
        for (const brk of breaksHere) {
          slots.push({
            duration: brk.duration,
            breakGroups: brk.groups.length > 0 ? brk.groups : ["*"],
          });
        }
        slots.push({ duration });
      }

      setTimeslotConfig({
        ...config,
        slots,
        breakGroups,
      });
    }
  }, [
    config,
    duration,
    timeslotPerDay,
    breakGroups,
    breakDefs,
    isValid,
    setTimeslotConfig,
    setIsTimeslotConfigValid,
  ]);

  const handleDayToggle = (day: day_of_week) => {
    setConfig((prev) => ({
      ...prev,
      Days: prev.Days.includes(day)
        ? prev.Days.filter((d) => d !== day)
        : [...prev.Days, day],
    }));
  };

  // Calculate preview schedule using V2
  const previewSchedule = generatePreviewSlots({
    StartTime: config.StartTime,
    Duration: duration,
    TimeslotPerDay: timeslotPerDay,
    breakDefinitions: breakDefs,
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          กำหนดค่าตารางเรียนสำหรับภาคเรียนที่ {semester}/{academicYear}
        </Typography>
      </Alert>

      {/* Days Selection */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <CalendarMonth color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            วันที่เรียน
          </Typography>
        </Stack>
        <FormGroup row>
          {DAYS.map((day) => (
            <FormControlLabel
              key={day.value}
              control={
                <Checkbox
                  checked={config.Days.includes(day.value)}
                  onChange={() => handleDayToggle(day.value)}
                />
              }
              label={day.label}
            />
          ))}
        </FormGroup>
        {errors.days && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            {errors.days}
          </Typography>
        )}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            เลือก: {config.Days.length} วัน
          </Typography>
        </Box>
      </Paper>

      {/* Time Configuration */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AccessTime color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            ตั้งค่าเวลา
          </Typography>
        </Stack>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="เวลาเริ่มเรียน"
            type="time"
            value={config.StartTime}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, StartTime: e.target.value }))
            }
            InputLabelProps={{ shrink: true }}
            error={!!errors.startTime}
            helperText={errors.startTime || "เช่น 08:30"}
          />
          <TextField
            fullWidth
            label="ระยะเวลาต่อคาบ (นาที)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            error={!!errors.duration}
            helperText={errors.duration || "ระยะเวลาการเรียนต่อคาบ"}
          />
        </Stack>
      </Paper>

      {/* Periods Per Day */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Schedule color="primary" />
          <Typography variant="subtitle1" fontWeight={600}>
            จำนวนคาบต่อวัน
          </Typography>
        </Stack>
        <Box sx={{ px: 2 }}>
          <Slider
            value={timeslotPerDay}
            onChange={(_, value) =>
              setTimeslotPerDay(typeof value === "number" ? value : value[0])
            }
            min={1}
            max={12}
            marks
            valueLabelDisplay="on"
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {timeslotPerDay} คาบต่อวัน
        </Typography>
      </Paper>

      {/* Break Groups */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          กลุ่มการพัก (Break Groups)
        </Typography>
        <Stack spacing={2}>
          {breakGroups.map((group, idx) => (
            <Box
              key={idx}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  size="small"
                  label="รหัสกลุ่ม"
                  value={group.Name}
                  onChange={(e) => {
                    const newGroups = [...breakGroups];
                    newGroups[idx]!.Name = e.target.value;
                    setBreakGroups(newGroups);
                  }}
                />
                <TextField
                  size="small"
                  label="ชื่อกลุ่ม"
                  value={group.Label}
                  onChange={(e) => {
                    const newGroups = [...breakGroups];
                    newGroups[idx]!.Label = e.target.value;
                    setBreakGroups(newGroups);
                  }}
                />
                <TextField
                  size="small"
                  type="color"
                  label="สี"
                  value={group.Color}
                  sx={{ width: 100 }}
                  onChange={(e) => {
                    const newGroups = [...breakGroups];
                    newGroups[idx]!.Color = e.target.value;
                    setBreakGroups(newGroups);
                  }}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Break Definitions */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          กำหนดเวลาพัก (Break Definitions)
        </Typography>
        <Stack spacing={2}>
          {breakDefs.map((def, idx) => (
            <Box
              key={idx}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  size="small"
                  label="ชื่อช่วงพัก"
                  value={def.label}
                  onChange={(e) => {
                    const newDefs = [...breakDefs];
                    newDefs[idx]!.label = e.target.value;
                    setBreakDefs(newDefs);
                  }}
                />
                <TextField
                  size="small"
                  label="พักก่อนคาบที่"
                  type="number"
                  value={def.slotNumber}
                  onChange={(e) => {
                    const newDefs = [...breakDefs];
                    newDefs[idx]!.slotNumber = Number(e.target.value);
                    setBreakDefs(newDefs);
                  }}
                />
                <TextField
                  size="small"
                  label="ระยะเวลา (นาที)"
                  type="number"
                  value={def.duration}
                  onChange={(e) => {
                    const newDefs = [...breakDefs];
                    newDefs[idx]!.duration = Number(e.target.value);
                    setBreakDefs(newDefs);
                  }}
                />
                <IconButton
                  onClick={() => {
                    const newDefs = breakDefs.filter((_, i) => i !== idx);
                    setBreakDefs(newDefs);
                  }}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Stack>
            </Box>
          ))}
          <Box>
            <Chip
              icon={<Add />}
              label="เพิ่มช่วงพัก"
              onClick={() => {
                setBreakDefs([
                  ...breakDefs,
                  {
                    id: `break-${Date.now()}`,
                    label: "พักใหม่",
                    slotNumber: 1,
                    duration: 15,
                    color: "#9E9E9E",
                    groups: ["*"],
                  },
                ]);
              }}
            />
          </Box>
        </Stack>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Preview */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          ตัวอย่างตารางเรียน (วันจันทร์-ศุกร์)
        </Typography>
        <Stack spacing={1}>
          {previewSchedule.map((slot, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1,
                bgcolor: "white",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Chip
                label={slot.type === "class" ? `คาบที่ ${slot.period}` : "พัก"}
                size="small"
                color={slot.type === "class" ? "primary" : "warning"}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {slot.startTime}-{slot.endTime}
              </Typography>
              <Chip label={slot.label} size="small" variant="outlined" />
            </Box>
          ))}
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: "block" }}
        >
          เวลาเลิก:{" "}
          {previewSchedule.length > 0
            ? previewSchedule[previewSchedule.length - 1]!.endTime
            : "--:--"}
        </Typography>
      </Paper>
    </Box>
  );
}
