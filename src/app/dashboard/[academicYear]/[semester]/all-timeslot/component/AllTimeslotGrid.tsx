"use client";

import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import GridOnIcon from "@mui/icons-material/GridOn";

import TableHead from "./TableHead";
import TableBody from "./TableBody";
import TeacherList from "./TeacherList";
import TableResult from "./TableResult";

import type { teacher } from "@/prisma/generated/client";
import type { ClassScheduleWithSummary } from "@/features/class/infrastructure/repositories/class.repository";
import type { TimetableColumn } from "../../shared/timeSlot";

type AllTimeslotGridProps = {
  days: { Day: string; TextColor: string; BgColor: string }[];
  columns: TimetableColumn[];
  teachers: teacher[];
  classData: ClassScheduleWithSummary[];
};

/**
 * Presentational all-timeslot master grid (header + per-teacher rows).
 * Shared by the dashboard screen and the /print route so the printed PDF
 * matches the screen exactly. Filtering happens in the caller — this renders
 * whatever days/teachers it is given.
 */
export function AllTimeslotGrid({
  days,
  columns,
  teachers,
  classData,
}: AllTimeslotGridProps) {
  const theme = useTheme();
  return (
    <Box
      className="printable-table"
      sx={{
        mt: 3,
        overflowX: "auto",
        overflowY: "hidden",
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.1),
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.4),
        backdropFilter: "blur(12px)",
        p: 2,
        boxShadow: theme.shadows[1],
      }}
    >
      <Stack>
        {/* Header Row */}
        <Stack direction="row" sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 260,
              mr: 1,
              height: 64,
              display: "flex",
              alignItems: "center",
              px: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.action.selected, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
              }}
            >
              <GridOnIcon fontSize="small" color="primary" />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                }}
              >
                ตารางสรุปภาครวม
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, overflowX: "hidden" }}>
            <TableHead days={days} columns={columns} />
          </Box>
        </Stack>

        {/* Body Content — TeacherList | grid | per-teacher totals */}
        <Stack direction="row">
          <TeacherList teachers={teachers} />
          <Box sx={{ flex: 1, overflowX: "auto", overflowY: "hidden" }}>
            <TableBody
              teachers={teachers}
              columns={columns}
              classData={classData}
              days={days}
            />
          </Box>
          <TableResult teachers={teachers} classData={classData} />
        </Stack>
      </Stack>
    </Box>
  );
}
