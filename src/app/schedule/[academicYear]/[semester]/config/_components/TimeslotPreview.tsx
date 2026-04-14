"use client";

/**
 * TimeslotPreview Component
 * Visual timeline showing timeslots with breaks
 */

import React from "react";
import { Box, Paper, Typography, Chip } from "@mui/material";
import {
  Schedule as ScheduleIcon,
  LunchDining as LunchIcon,
  Coffee as CoffeeIcon,
} from "@mui/icons-material";
import {
  calculateSchoolDayEndTime,
  calculateSchoolDayMinutes,
  generatePreviewSlots,
} from "@/features/timeslot/domain/services/timeslot-config.service";
import type { ConfigData } from "@/features/config/domain/constants/config.constants";

type Props = {
  config: ConfigData;
};

export function TimeslotPreview({ config }: Props) {
  const slots = generatePreviewSlots(config);
  const endTime = calculateSchoolDayEndTime(slots);

  return (
    <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: "divider" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <ScheduleIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          ตัวอย่างตารางเวลา
        </Typography>
        <Chip
          label={`${config.StartTime} - ${endTime}`}
          size="small"
          variant="outlined"
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {slots.map((slot, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor:
                slot.type === "break"
                  ? "warning.light"
                  : slot.type === "minibreak"
                    ? "info.light"
                    : "grey.100",
              border: 1,
              borderColor:
                slot.type === "break"
                  ? "warning.main"
                  : slot.type === "minibreak"
                    ? "info.main"
                    : "grey.300",
            }}
          >
            {slot.type === "class" ? (
              <>
                <Chip
                  label={`คาบที่ ${slot.period}`}
                  size="small"
                  color="primary"
                  sx={{ minWidth: 80 }}
                />
                <Typography variant="body2" fontWeight="medium">
                  {slot.startTime} - {slot.endTime}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({config.Duration} นาที)
                </Typography>
              </>
            ) : slot.type === "lunch-both" ||
              slot.type === "lunch-junior" ||
              slot.type === "lunch-senior" ? (
              <>
                <LunchIcon sx={{ color: "warning.dark" }} />
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="warning.dark"
                >
                  พักเที่ยง
                </Typography>
                <Typography variant="body2">
                  {slot.startTime} - {slot.endTime}
                </Typography>
                <Chip
                  label={
                    slot.type === "lunch-both"
                      ? "ม.ต้น + ม.ปลาย"
                      : slot.type === "lunch-junior"
                        ? "ม.ต้น"
                        : "ม.ปลาย"
                  }
                  size="small"
                  variant="outlined"
                  color="warning"
                />
              </>
            ) : (
              <>
                <CoffeeIcon sx={{ color: "info.dark" }} />
                <Typography variant="body2" fontWeight="bold" color="info.dark">
                  พักเล็ก
                </Typography>
                <Typography variant="body2">
                  {slot.startTime} - {slot.endTime}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({slot.duration} นาที)
                </Typography>
              </>
            )}
          </Box>
        ))}
      </Box>

      {/* Summary */}
      <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>สรุป:</strong> {config.TimeslotPerDay} คาบเรียน • เริ่ม{" "}
          {config.StartTime} • จบ {endTime} • รวมเวลาประมาณ{" "}
          {formatTotalDuration(calculateSchoolDayMinutes(slots))} ชั่วโมง
        </Typography>
      </Box>
    </Paper>
  );
}

function formatTotalDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes > 0
    ? `${hours}.${Math.round((minutes / 60) * 10)}`
    : `${hours}`;
}
