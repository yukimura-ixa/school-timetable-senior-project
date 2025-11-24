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

type ConfigData = {
  StartTime: string;
  Duration: number;
  TimeslotPerDay: number;
  BreakDuration: number;
  BreakTimeslots: {
    Junior: number;
    Senior: number;
  };
  HasMinibreak: boolean;
  MiniBreak?: {
    Duration: number;
    SlotNumber: number;
  };
};

type Props = {
  config: ConfigData;
};

export function TimeslotPreview({ config }: Props) {
  const calculateTimeslots = () => {
    const timeslots: Array<{
      number: number;
      start: string;
      end: string;
      type: "class" | "break" | "minibreak";
      breakFor?: "junior" | "senior" | "both";
    }> = [];

    // Parse start time
    const [hours, minutes] = config.StartTime.split(":").map(Number);
    if (hours === undefined || minutes === undefined) {
      return [];
    }
    let currentTime = hours * 60 + minutes; // Convert to minutes

    for (let i = 1; i <= config.TimeslotPerDay; i++) {
      const start = formatTime(currentTime);
      currentTime += config.Duration;
      const end = formatTime(currentTime);

      timeslots.push({
        number: i,
        start,
        end,
        type: "class",
      });

      // Check for lunch break
      if (
        i === config.BreakTimeslots.Junior ||
        i === config.BreakTimeslots.Senior
      ) {
        const breakFor =
          i === config.BreakTimeslots.Junior &&
          i === config.BreakTimeslots.Senior
            ? "both"
            : i === config.BreakTimeslots.Junior
              ? "junior"
              : "senior";

        const breakStart = formatTime(currentTime);
        currentTime += config.BreakDuration;
        const breakEnd = formatTime(currentTime);

        timeslots.push({
          number: i,
          start: breakStart,
          end: breakEnd,
          type: "break",
          breakFor,
        });
      }

      // Check for mini break
      if (
        config.HasMinibreak &&
        config.MiniBreak &&
        i === config.MiniBreak.SlotNumber
      ) {
        const miniStart = formatTime(currentTime);
        currentTime += config.MiniBreak.Duration;
        const miniEnd = formatTime(currentTime);

        timeslots.push({
          number: i,
          start: miniStart,
          end: miniEnd,
          type: "minibreak",
        });
      }
    }

    return timeslots;
  };

  const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const slots = calculateTimeslots();
  const endTime = slots[slots.length - 1]?.end || config.StartTime;

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
                  label={`คาบที่ ${slot.number}`}
                  size="small"
                  color="primary"
                  sx={{ minWidth: 80 }}
                />
                <Typography variant="body2" fontWeight="medium">
                  {slot.start} - {slot.end}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({config.Duration} นาที)
                </Typography>
              </>
            ) : slot.type === "break" ? (
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
                  {slot.start} - {slot.end}
                </Typography>
                <Chip
                  label={
                    slot.breakFor === "both"
                      ? "ม.ต้น + ม.ปลาย"
                      : slot.breakFor === "junior"
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
                  {slot.start} - {slot.end}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({config.MiniBreak?.Duration} นาที)
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
          {calculateTotalDuration(slots)} ชั่วโมง
        </Typography>
      </Box>
    </Paper>
  );
}

function calculateTotalDuration(slots: any[]): string {
  if (slots.length === 0) return "0";
  const firstStart = slots[0].start;
  const lastEnd = slots[slots.length - 1].end;

  const [startH, startM] = firstStart.split(":").map(Number);
  const [endH, endM] = lastEnd.split(":").map(Number);

  const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes > 0
    ? `${hours}.${Math.round((minutes / 60) * 10)}`
    : `${hours}`;
}
