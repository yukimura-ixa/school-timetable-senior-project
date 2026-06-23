"use client";
import React from "react";
import { Box, Typography, Stack, alpha } from "@mui/material";
import { colors } from "@/shared/design-system";
import type { TimetableColumn } from "../../shared/timeSlot";

type DayData = {
  Day: string;
  BgColor: string;
  TextColor: string;
  [key: string]: unknown;
};

type Props = {
  days: DayData[];
  columns: TimetableColumn[];
};

const TEACH_WIDTH = 52;
const BREAK_WIDTH = 24;
const CELL_GAP = 4;

const TableHead = (props: Props) => {
  const teachingCount = props.columns.filter(
    (c) => c.kind === "teaching",
  ).length;
  const breakCount = props.columns.length - teachingCount;
  const dayMinWidth =
    teachingCount * TEACH_WIDTH +
    breakCount * BREAK_WIDTH +
    Math.max(props.columns.length - 1, 0) * CELL_GAP;

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ height: "64px", userSelect: "none" }}
    >
      {props.days.map((item) => (
        <Stack
          key={item.Day}
          spacing={0.5}
          sx={{ flex: 1, minWidth: dayMinWidth }}
        >
          {/* Day Label */}
          <Box
            sx={{
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              bgcolor: item.BgColor,
              boxShadow: `0 2px 8px ${alpha(item.BgColor, 0.2)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: "bold",
                color: item.TextColor,
                letterSpacing: 0.5,
              }}
            >
              {item.Day}
            </Typography>
          </Box>

          {/* Period Labels — left-packed to match TableBody */}
          <Stack direction="row" spacing={0.5} sx={{ pt: 0.5 }}>
            {props.columns.map((col) => {
              const isBreak = col.kind === "break";
              return (
                <Box
                  key={col.TimeslotID}
                  sx={{
                    width: isBreak ? BREAK_WIDTH : TEACH_WIDTH,
                    minWidth: isBreak ? BREAK_WIDTH : TEACH_WIDTH,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isBreak
                      ? alpha(colors.slate[400], 0.05)
                      : alpha(colors.slate[400], 0.15),
                    borderRadius: 1,
                    border: `1px solid ${alpha(colors.slate[300], 0.2)}`,
                  }}
                >
                  {!isBreak && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.7rem",
                        opacity: 0.7,
                      }}
                    >
                      {col.periodNumber}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export default TableHead;
