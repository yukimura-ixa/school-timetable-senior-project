"use client";
import React from "react";
import { Box, Typography, Stack, alpha } from "@mui/material";
import { colors } from "@/shared/design-system";

type DayData = {
  Day: string;
  BgColor: string;
  TextColor: string;
  [key: string]: unknown;
};

type Props = {
  days: DayData[];
  slotAmount: number[];
};

const TableHead = (props: Props) => {
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
          sx={{ flex: 1, minWidth: props.slotAmount.length * 56 }}
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
              fontWeight="bold"
              sx={{ color: item.TextColor, letterSpacing: 0.5 }}
            >
              {item.Day}
            </Typography>
          </Box>

          {/* Period Labels */}
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="center"
            sx={{ pt: 0.5 }}
          >
            {props.slotAmount.map((slot) => (
              <Box
                key={slot}
                sx={{
                  width: 52,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(colors.slate[400], 0.15),
                  borderRadius: 1,
                  border: `1px solid ${alpha(colors.slate[300], 0.2)}`,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{ fontSize: "0.7rem", opacity: 0.7 }}
                >
                  {slot}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export default TableHead;
