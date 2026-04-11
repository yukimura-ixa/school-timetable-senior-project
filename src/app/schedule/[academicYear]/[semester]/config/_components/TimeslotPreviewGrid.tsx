/**
 * Presentation Layer: Timeslot Preview Grid Component
 *
 * Visual preview of generated timeslots with time ranges,
 * breaks, and mini-breaks before saving configuration.
 *
 * @module TimeslotPreviewGrid
 */

import React, { useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  LunchDining as LunchIcon,
  Coffee as CoffeeIcon,
  AccessTime as ClockIcon,
} from "@mui/icons-material";
import { ConfigData } from "@/features/config/domain/constants/config.constants";
import {
  calculateSchoolDayEndTime,
  calculateSchoolDayMinutes,
  generatePreviewSlots,
} from "@/features/timeslot/domain/services/timeslot-config.service";

interface TimeslotPreviewProps {
  /** Configuration data to generate preview from */
  config: ConfigData;
}

/**
 * Get chip color and icon based on slot type
 */
function getSlotStyle(type: string) {
  switch (type) {
    case "lunch-both":
    case "lunch-junior":
    case "lunch-senior":
      return {
        color: "warning" as const,
        icon: <LunchIcon />,
        variant: "filled" as const,
      };
    case "mini-break":
      return {
        color: "info" as const,
        icon: <CoffeeIcon />,
        variant: "outlined" as const,
      };
    default:
      return {
        color: "primary" as const,
        icon: <ScheduleIcon />,
        variant: "filled" as const,
      };
  }
}

/**
 * Timeslot preview grid component
 */
export function TimeslotPreviewGrid({ config }: TimeslotPreviewProps) {
  const slots = useMemo(() => generatePreviewSlots(config), [config]);
  const endTime = useMemo(() => calculateSchoolDayEndTime(slots), [slots]);
  const totalMinutes = useMemo(() => calculateSchoolDayMinutes(slots), [slots]);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ClockIcon color="primary" />
          <Typography variant="h6">ตัวอย่างตารางเวลา</Typography>
        </Box>

        <Divider />

        {/* Summary */}
        <Alert severity="info" variant="outlined">
          <Stack direction="row" spacing={3}>
            <Typography variant="body2">
              <strong>เวลาเริ่ม:</strong> {config.StartTime}
            </Typography>
            <Typography variant="body2">
              <strong>เวลาเลิก:</strong> {endTime}
            </Typography>
            <Typography variant="body2">
              <strong>รวม:</strong> {totalMinutes} นาที (
              {(totalMinutes / 60).toFixed(1)} ชั่วโมง)
            </Typography>
          </Stack>
        </Alert>

        {/* Timeslot List */}
        <Stack spacing={1.5}>
          {slots.map((slot, idx) => {
            const style = getSlotStyle(slot.type);

            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor:
                    slot.type !== "class" ? "action.hover" : "transparent",
                  border: 1,
                  borderColor:
                    slot.type !== "class" ? "divider" : "transparent",
                }}
              >
                {/* Period Number */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    bgcolor: style.color + ".lighter",
                    color: style.color + ".dark",
                    fontWeight: "bold",
                  }}
                >
                  {slot.period}
                </Box>

                {/* Slot Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {slot.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {slot.startTime} - {slot.endTime} ({slot.duration} นาที)
                  </Typography>
                </Box>

                {/* Chip */}
                <Chip
                  icon={style.icon}
                  label={
                    slot.type === "class"
                      ? "เรียน"
                      : slot.type === "mini-break"
                        ? "พักเบรก"
                        : "พักเที่ยง"
                  }
                  color={style.color}
                  variant={style.variant}
                  size="small"
                />
              </Box>
            );
          })}
        </Stack>

        {/* Legend */}
        <Divider />
        <Stack direction="row" spacing={2} justifyContent="center">
          <Chip
            icon={<ScheduleIcon />}
            label="คาบเรียน"
            color="primary"
            size="small"
          />
          <Chip
            icon={<LunchIcon />}
            label="พักเที่ยง"
            color="warning"
            size="small"
          />
          <Chip
            icon={<CoffeeIcon />}
            label="พักเบรก"
            color="info"
            size="small"
            variant="outlined"
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
