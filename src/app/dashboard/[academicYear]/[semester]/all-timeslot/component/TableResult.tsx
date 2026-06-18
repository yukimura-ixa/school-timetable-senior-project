"use client";
import type { teacher } from "@/prisma/generated/client";
import React from "react";
import { Box, Typography, Stack, alpha, useTheme } from "@mui/material";
import { colors } from "@/shared/design-system";

type ClassData = {
  teachers_responsibility: Array<{ TeacherID: number }>;
  TimeslotID: string;
  [key: string]: unknown;
};

type Props = {
  teachers: teacher[];
  classData: ClassData[];
};

const ROW_HEIGHT = 60;
const ROW_GAP = 0.25;
const CELL_WIDTH = 56;

const TableResult = (props: Props) => {
  const theme = useTheme();

  const findResult = (tID: number) => {
    const filter1 = props.classData.filter((item) =>
      item.teachers_responsibility.map((tid) => tid.TeacherID).includes(tID),
    );
    const filter2 = filter1.filter(
      (cid, index) =>
        filter1.findIndex((item) => item.TimeslotID === cid.TimeslotID) ===
          index,
    );
    return filter2.length;
  };

  return (
    <Stack data-testid="all-timeslot-grid-totals" sx={{ ml: 1, userSelect: "none" }}>
      {/* Header — matches TableHead height */}
      <Stack direction="row" sx={{ height: 64, mb: 0.5 }}>
        <Box
          sx={{
            width: CELL_WIDTH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            bgcolor: alpha(theme.palette.action.selected, 0.3),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="caption"
            fontWeight="bold"
            color="text.secondary"
          >
            ผลรวม
          </Typography>
        </Box>
      </Stack>

      {/* Body — same per-row pitch as TableBody (cell 60 + py 0.5 + gap 0.25) */}
      <Stack spacing={ROW_GAP}>
        {props.teachers.map((tch) => (
          <Stack
            key={tch.TeacherID}
            direction="row"
            sx={{
              py: 0.5,
              transition: "all 0.2s",
              "&:hover": { bgcolor: alpha(colors.emerald.main, 0.04) },
            }}
          >
            <Box
              sx={{
                width: CELL_WIDTH,
                height: ROW_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {findResult(tch.TeacherID)}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default TableResult;
