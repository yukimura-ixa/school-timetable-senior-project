"use client";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import React from "react";
import type { TimeSlotTableData } from "../../shared/timeSlot";
import { formatTimeslotTimeUtc } from "@/utils/datetime";
import { isBreakForGrade, buildGradeGroupIndex } from "@/utils/break-utils";
import type { BreakDefinition, BreakGroup } from "@/features/timeslot/domain/models/break.types";
import {
  Box,
  Typography,
  Stack,
  Paper,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import { colors } from "@/shared/design-system";

type Props = {
  timeSlotData: TimeSlotTableData;
  searchGradeID: string | null;
  breakDefinitions?: BreakDefinition[];
  breakGroups?: BreakGroup[];
};

const formatTime = formatTimeslotTimeUtc;

const LABEL_WIDTH = 90;
const TEACHING_MIN_WIDTH = 80;
const BREAK_WIDTH = 32;
const ROW_SPACING = 1.5;

export default function TimeSlot({
  timeSlotData,
  searchGradeID,
  breakDefinitions = [],
  breakGroups = [],
}: Props) {
  const theme = useTheme();
  const breakIndex = buildGradeGroupIndex(breakGroups);

  const columns = timeSlotData.Columns;
  const monSlots = timeSlotData.AllData.filter(
    (item) => item.DayOfWeek === "MON",
  );

  const teachingCellSx = {
    flex: 1,
    minWidth: TEACHING_MIN_WIDTH,
  };
  const breakCellSx = {
    flex: `0 0 ${BREAK_WIDTH}px`,
    minWidth: BREAK_WIDTH,
    maxWidth: BREAK_WIDTH,
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        pb: 1,
        "&::-webkit-scrollbar": { height: 8 },
        "&::-webkit-scrollbar-track": {
          backgroundColor: alpha(theme.palette.divider, 0.05),
          borderRadius: 4,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 4,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
          },
        },
      }}
    >
      <Stack spacing={ROW_SPACING} sx={{ minWidth: 800 }}>
        {/* Header: Periods */}
        <Stack direction="row" spacing={ROW_SPACING}>
          <Box
            sx={{
              width: LABEL_WIDTH,
              minWidth: LABEL_WIDTH,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              bgcolor: alpha(colors.emerald.main, 0.08),
              border: `1px solid ${alpha(colors.emerald.main, 0.15)}`,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              sx={{ color: colors.emerald.main }}
            >
              คาบที่
            </Typography>
          </Box>
          {columns.map((col, idx) => {
            const isBreak = col.kind === "break";
            return (
              <Box
                key={`head-${col.TimeslotID || `syn-${idx}`}`}
                sx={{
                  ...(isBreak ? breakCellSx : teachingCellSx),
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                  bgcolor: isBreak
                    ? alpha(theme.palette.divider, 0.12)
                    : alpha(theme.palette.action.selected, 0.3),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                {!isBreak && (
                  <Typography variant="subtitle2" fontWeight="bold">
                    {(col.periodNumber ?? 0) < 10
                      ? `0${col.periodNumber}`
                      : col.periodNumber}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>

        {/* Time Row */}
        <Stack direction="row" spacing={ROW_SPACING}>
          <Box
            sx={{
              width: LABEL_WIDTH,
              minWidth: LABEL_WIDTH,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
              bgcolor: alpha(theme.palette.text.secondary, 0.05),
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <Typography
              variant="caption"
              fontWeight="medium"
              color="text.secondary"
            >
              เวลา
            </Typography>
          </Box>
          {columns.map((col, idx) => {
            const isBreak = col.kind === "break";
            const slot =
              col.slotIndex >= 0 ? monSlots[col.slotIndex] : undefined;
            return (
              <Box
                key={`time-${col.TimeslotID || `syn-${idx}`}`}
                sx={{
                  ...(isBreak ? breakCellSx : teachingCellSx),
                  height: 40,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                  bgcolor: isBreak
                    ? alpha(theme.palette.divider, 0.06)
                    : alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                }}
              >
                {slot && !isBreak && (
                  <>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.65rem", lineHeight: 1 }}
                    >
                      {formatTime(slot.StartTime)}
                    </Typography>
                    <Box
                      sx={{
                        height: 2,
                        width: 8,
                        bgcolor: alpha(theme.palette.divider, 0.2),
                        my: 0.25,
                        borderRadius: 1,
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.65rem", lineHeight: 1 }}
                    >
                      {formatTime(slot.EndTime)}
                    </Typography>
                  </>
                )}
                {isBreak && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontSize: "0.6rem", letterSpacing: 0.5 }}
                  >
                    พัก
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>

        {/* Day Rows */}
        {timeSlotData.DayOfWeek.map((day) => {
          const daySlots = timeSlotData.AllData.filter(
            (item) => dayOfWeekThai[item.DayOfWeek] === day.Day,
          );
          return (
            <Stack key={`day-${day.Day}`} direction="row" spacing={ROW_SPACING}>
              <Box
                sx={{
                  width: LABEL_WIDTH,
                  minWidth: LABEL_WIDTH,
                  height: 86,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                  bgcolor: day.BgColor,
                  boxShadow: `0 4px 12px ${alpha(day.BgColor, 0.2)}`,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.02)" },
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: day.TextColor }}
                >
                  {day.Day}
                </Typography>
              </Box>
              {columns.map((col, idx) => {
                const isBreak = col.kind === "break";
                const data =
                  col.slotIndex >= 0 ? daySlots[col.slotIndex] : undefined;
                const slotNumber = data?.TimeslotID
                  ? Number(
                      data.TimeslotID.replace(
                        /.*(?:MON|TUE|WED|THU|FRI|SAT|SUN)(\d+)/,
                        "$1",
                      ),
                    )
                  : 0;
                const showBreak =
                  isBreak ||
                  (data && searchGradeID
                    ? isBreakForGrade(slotNumber, searchGradeID, breakDefinitions, breakIndex)
                    : false);
                const subject = data?.subject;
                const subjectCode = subject?.SubjectCode ?? "";
                const teacherName =
                  !subject?.IsLocked &&
                  Array.isArray(subject?.teachers) &&
                  subject.teachers.length > 0
                    ? (subject.teachers[0]?.Firstname ?? "")
                    : "";
                const roomName = subject?.room?.RoomName ?? "";

                return (
                  <Paper
                    key={`slot-${col.TimeslotID || `syn-${idx}`}`}
                    elevation={0}
                    sx={{
                      ...(isBreak ? breakCellSx : teachingCellSx),
                      height: 86,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                      bgcolor: showBreak
                        ? alpha(theme.palette.action.hover, 0.5)
                        : alpha(theme.palette.background.paper, 0.8),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      boxShadow: showBreak
                        ? "none"
                        : `0 2px 4px ${alpha(theme.palette.common.black, 0.02)}`,
                      transition: "all 0.2s ease-in-out",
                      cursor: "default",
                      "&:hover":
                        !showBreak && !isBreak
                          ? {
                              transform: "translateY(-4px)",
                              bgcolor: theme.palette.background.paper,
                              boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                              borderColor: alpha(
                                theme.palette.primary.main,
                                0.3,
                              ),
                              zIndex: 1,
                            }
                          : {},
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {showBreak ? (
                      isBreak ? null : (
                        <Typography
                          variant="caption"
                          fontWeight="medium"
                          color="text.disabled"
                          sx={{
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            fontSize: "0.7rem",
                          }}
                        >
                          พักกลางวัน
                        </Typography>
                      )
                    ) : (
                      <Stack spacing={0.25} alignItems="center">
                        {subjectCode && (
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{
                              fontSize:
                                subjectCode.length > 8 ? "0.75rem" : "0.875rem",
                              color: theme.palette.text.primary,
                              lineHeight: 1.2,
                            }}
                          >
                            {subjectCode}
                          </Typography>
                        )}
                        {teacherName && (
                          <Typography
                            variant="caption"
                            color="primary.main"
                            fontWeight="medium"
                          >
                            {teacherName}
                          </Typography>
                        )}
                        {roomName && (
                          <Tooltip title={roomName}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: "0.7rem",
                                opacity: 0.8,
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {roomName}
                            </Typography>
                          </Tooltip>
                        )}
                      </Stack>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
