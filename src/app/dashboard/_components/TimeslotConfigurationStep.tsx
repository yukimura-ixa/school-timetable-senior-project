"use client";

/**
 * Timeslot Configuration Step Component
 * Form for configuring timeslots during semester creation
 * 
 * Used in CreateSemesterWizard as Step 3
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
} from "@mui/material";
import { AccessTime, CalendarMonth, Schedule } from "@mui/icons-material";
import type { CreateTimeslotsInput } from "@/features/timeslot/application/schemas/timeslot.schemas";
import type { day_of_week } from '@/prisma/generated/client';;

type Props = {
  academicYear: number;
  semester: 1 | 2;
  initialConfig?: Partial<CreateTimeslotsInput>;
  onChange: (config: CreateTimeslotsInput) => void;
  onValidationChange?: (isValid: boolean) => void;
};

const DAYS: { value: day_of_week; label: string }[] = [
  { value: "MON", label: "จันทร์" },
  { value: "TUE", label: "อังคาร" },
  { value: "WED", label: "พุธ" },
  { value: "THU", label: "พฤหัสบดี" },
  { value: "FRI", label: "ศุกร์" },
  { value: "SAT", label: "เสาร์" },
  { value: "SUN", label: "อาทิตย์" },
];

export function TimeslotConfigurationStep({
  academicYear,
  semester,
  initialConfig,
  onChange,
  onValidationChange,
}: Props) {
  const [config, setConfig] = useState<CreateTimeslotsInput>({
    AcademicYear: academicYear,
    Semester: semester === 1 ? "SEMESTER_1" : "SEMESTER_2",
    Days: initialConfig?.Days || ["MON", "TUE", "WED", "THU", "FRI"],
    StartTime: initialConfig?.StartTime || "08:00",
    Duration: initialConfig?.Duration || 50,
    BreakDuration: initialConfig?.BreakDuration || 15,
    TimeslotPerDay: initialConfig?.TimeslotPerDay || 8,
    HasMinibreak: initialConfig?.HasMinibreak ?? true,
    MiniBreak: initialConfig?.MiniBreak || { SlotNumber: 3, Duration: 10 },
    BreakTimeslots: initialConfig?.BreakTimeslots || { Junior: 4, Senior: 5 },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate configuration
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (config.Days.length === 0) {
      newErrors.days = "กรุณาเลือกอย่างน้อย 1 วัน";
    }

    if (!config.StartTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      newErrors.startTime = "รูปแบบเวลาไม่ถูกต้อง (HH:MM)";
    }

    if (config.Duration < 10 || config.Duration > 120) {
      newErrors.duration = "ระยะเวลาต่อคาบต้องอยู่ระหว่าง 10-120 นาที";
    }

    if (config.BreakDuration < 5 || config.BreakDuration > 60) {
      newErrors.breakDuration = "ระยะเวลาพักต้องอยู่ระหว่าง 5-60 นาที";
    }

    if (config.TimeslotPerDay < 1 || config.TimeslotPerDay > 15) {
      newErrors.timeslotPerDay = "จำนวนคาบต่อวันต้องอยู่ระหว่าง 1-15";
    }

    if (config.HasMinibreak) {
      if (
        config.MiniBreak.SlotNumber < 1 ||
        config.MiniBreak.SlotNumber > config.TimeslotPerDay
      ) {
        newErrors.miniBreak = "หมายเลขคาบพักเล็กไม่ถูกต้อง";
      }
      if (config.MiniBreak.Duration < 5 || config.MiniBreak.Duration > 30) {
        newErrors.miniBreakDuration = "ระยะเวลาพักเล็กต้องอยู่ระหว่าง 5-30 นาที";
      }
    }

    if (
      config.BreakTimeslots.Junior < 1 ||
      config.BreakTimeslots.Junior > config.TimeslotPerDay
    ) {
      newErrors.juniorBreak = "หมายเลขคาบพักม.ต้นไม่ถูกต้อง";
    }

    if (
      config.BreakTimeslots.Senior < 1 ||
      config.BreakTimeslots.Senior > config.TimeslotPerDay
    ) {
      newErrors.seniorBreak = "หมายเลขคาบพักม.ปลายไม่ถูกต้อง";
    }

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0;
    onValidationChange?.(isValid);

    if (isValid) {
      onChange(config);
    }
  }, [config, onChange, onValidationChange]);

  const handleDayToggle = (day: day_of_week) => {
    setConfig((prev) => ({
      ...prev,
      Days: prev.Days.includes(day)
        ? prev.Days.filter((d) => d !== day)
        : [...prev.Days, day],
    }));
  };

  // Calculate preview schedule
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = (hours ?? 0) * 60 + (minutes ?? 0) + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  const generatePreview = () => {
    const preview: { slot: number; time: string; type: string }[] = [];
    let currentTime = config.StartTime;

    for (let i = 1; i <= config.TimeslotPerDay; i++) {
      // Add mini break before slot if configured
      if (config.HasMinibreak && config.MiniBreak.SlotNumber === i) {
        currentTime = calculateEndTime(currentTime, config.MiniBreak.Duration);
      }

      const isJuniorBreak = config.BreakTimeslots.Junior === i;
      const isSeniorBreak = config.BreakTimeslots.Senior === i;
      const isBothBreak = isJuniorBreak && isSeniorBreak;

      let duration: number;
      let type: string;

      if (isBothBreak) {
        duration = config.BreakDuration;
        type = "พักทั้งหมด";
      } else if (isJuniorBreak) {
        duration = config.BreakDuration;
        type = "พักม.ต้น";
      } else if (isSeniorBreak) {
        duration = config.BreakDuration;
        type = "พักม.ปลาย";
      } else {
        duration = config.Duration;
        type = "เรียน";
      }

      const endTime = calculateEndTime(currentTime, duration);
      preview.push({
        slot: i,
        time: `${currentTime}-${endTime}`,
        type,
      });

      currentTime = endTime;
    }

    return preview;
  };

  const previewSchedule = generatePreview();

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
            helperText={errors.startTime || "เช่น 08:00"}
          />
          <TextField
            fullWidth
            label="ระยะเวลาต่อคาบ (นาที)"
            type="number"
            value={config.Duration}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                Duration: Number(e.target.value),
              }))
            }
            error={!!errors.duration}
            helperText={errors.duration || "ระยะเวลาการเรียนต่อคาบ"}
          />
          <TextField
            fullWidth
            label="ระยะเวลาพัก (นาที)"
            type="number"
            value={config.BreakDuration}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                BreakDuration: Number(e.target.value),
              }))
            }
            error={!!errors.breakDuration}
            helperText={errors.breakDuration || "ระยะเวลาพักกลางวัน"}
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
            value={config.TimeslotPerDay}
            onChange={(_, value) =>
              setConfig((prev) => ({
                ...prev,
                TimeslotPerDay: typeof value === "number" ? value : value[0],
              }))
            }
            min={1}
            max={12}
            marks
            valueLabelDisplay="on"
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {config.TimeslotPerDay} คาบต่อวัน
        </Typography>
      </Paper>

      {/* Mini Break Configuration */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={config.HasMinibreak}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  HasMinibreak: e.target.checked,
                }))
              }
            />
          }
          label={
            <Typography variant="subtitle1" fontWeight={600}>
              พักเล็กระหว่างคาบ
            </Typography>
          }
        />
        {config.HasMinibreak && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="พักเล็กหลังคาบที่"
              type="number"
              value={config.MiniBreak.SlotNumber}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  MiniBreak: {
                    ...prev.MiniBreak,
                    SlotNumber: Number(e.target.value),
                  },
                }))
              }
              error={!!errors.miniBreak}
              helperText={errors.miniBreak || "หมายเลขคาบที่ต้องการพักเล็ก"}
            />
            <TextField
              fullWidth
              label="ระยะเวลาพักเล็ก (นาที)"
              type="number"
              value={config.MiniBreak.Duration}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  MiniBreak: {
                    ...prev.MiniBreak,
                    Duration: Number(e.target.value),
                  },
                }))
              }
              error={!!errors.miniBreakDuration}
              helperText={errors.miniBreakDuration || "ระยะเวลาพักเล็ก"}
            />
          </Stack>
        )}
      </Paper>

      {/* Break Periods */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          คาบพักกลางวัน
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="คาบพักม.ต้น (ม.1-3)"
            type="number"
            value={config.BreakTimeslots.Junior}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                BreakTimeslots: {
                  ...prev.BreakTimeslots,
                  Junior: Number(e.target.value),
                },
              }))
            }
            error={!!errors.juniorBreak}
            helperText={errors.juniorBreak || "คาบที่ม.ต้นพัก"}
          />
          <TextField
            fullWidth
            label="คาบพักม.ปลาย (ม.4-6)"
            type="number"
            value={config.BreakTimeslots.Senior}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                BreakTimeslots: {
                  ...prev.BreakTimeslots,
                  Senior: Number(e.target.value),
                },
              }))
            }
            error={!!errors.seniorBreak}
            helperText={errors.seniorBreak || "คาบที่ม.ปลายพัก"}
          />
        </Stack>
        {config.BreakTimeslots.Junior === config.BreakTimeslots.Senior && (
          <Alert severity="info" sx={{ mt: 2 }}>
            พักพร้อมกัน (ม.ต้น + ม.ปลาย)
          </Alert>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Preview */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          ตัวอย่างตารางเรียน (วันจันทร์-ศุกร์)
        </Typography>
        <Stack spacing={1}>
          {previewSchedule.map((slot) => (
            <Box
              key={slot.slot}
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
                label={`คาบที่ ${slot.slot}`}
                size="small"
                color={
                  slot.type === "เรียน"
                    ? "primary"
                    : slot.type === "พักทั้งหมด"
                      ? "success"
                      : "warning"
                }
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {slot.time}
              </Typography>
              <Chip label={slot.type} size="small" variant="outlined" />
            </Box>
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          เวลาเลิก: {calculateEndTime(config.StartTime, previewSchedule.reduce((acc, slot) => {
            const [start, end] = slot.time.split("-");
            const [startH, startM] = (start ?? "").split(":").map(Number);
            const [endH, endM] = (end ?? "").split(":").map(Number);
            const duration = ((endH ?? 0) * 60 + (endM ?? 0)) - ((startH ?? 0) * 60 + (startM ?? 0));
            return acc + duration;
          }, 0))}
        </Typography>
      </Paper>
    </Box>
  );
}
