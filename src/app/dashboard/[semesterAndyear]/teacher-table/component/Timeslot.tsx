"use client";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import React, { Fragment } from "react";
import type { TimeSlotTableData } from "../../shared/timeSlot";
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
};

const formatTime = (time: string | Date) => {
  const date = new Date(time);
  const hour = date.getHours() - 7;
  const minutes = date.getMinutes();

  const hoursText = hour < 10 ? `0${hour}` : hour.toString();
  const minutesText = minutes === 0 ? `0${minutes}` : minutes.toString();

  return `${hoursText}:${minutesText}`;
};

const isBreakSlot = (breaktime: string) => breaktime !== "NOT_BREAK";

const formatGrade = (gradeId?: string) => {
  if (!gradeId) {
    return "";
  }

  const roomNumber = Number.parseInt(gradeId.substring(1), 10);
  return `ม.${gradeId[0]}/${Number.isNaN(roomNumber) ? "" : roomNumber}`;
};

function TimeSlot({ timeSlotData }: Props) {
  const theme = useTheme();
  const slotCount = timeSlotData.SlotAmount.length;

  // Calculate width percentage for slots
  const slotWidth = `calc((100% - 90px) / ${slotCount})`;

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        pb: 1,
        "&::-webkit-scrollbar": {
          height: 8,
        },
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
      <Stack spacing={1.5} sx={{ minWidth: 800 }}>
        {/* Header: Periods */}
        <Stack direction="row" spacing={1.5}>
          <Box
            sx={{
              width: 90,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1.5,
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
          {timeSlotData.SlotAmount.map((item) => (
            <Box
              key={`slot-${item}`}
              sx={{
                flex: 1,
                minWidth: 80,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.action.selected, 0.3),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backdropFilter: "blur(4px)",
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {item < 10 ? `0${item}` : item}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Time Row */}
        <Stack direction="row" spacing={1.5}>
          <Box
            sx={{
              width: 90,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1.5,
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
          {timeSlotData.AllData.filter((item) => item.DayOfWeek === "MON").map(
            (item) => (
              <Box
                key={`time-${item.StartTime}${item.EndTime}`}
                sx={{
                  flex: 1,
                  minWidth: 80,
                  height: 40,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.65rem", lineHeight: 1 }}
                >
                  {formatTime(item.StartTime)}
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
                  {formatTime(item.EndTime)}
                </Typography>
              </Box>
            ),
          )}
        </Stack>

        {/* Day Rows */}
        {timeSlotData.DayOfWeek.map((day) => (
          <Stack key={`day${day.Day}`} direction="row" spacing={1.5}>
            <Box
              sx={{
                width: 90,
                height: 86,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                bgcolor: day.BgColor,
                boxShadow: `0 4px 12px ${alpha(day.BgColor, 0.2)}`,
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
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
            {timeSlotData.AllData.filter(
              (item) => dayOfWeekThai[item.DayOfWeek] === day.Day,
            ).map((data) => {
              const breakSlot = isBreakSlot(data.Breaktime);
              const subject = data.subject;
              const subjectCode = subject?.SubjectCode ?? "";
              const isLocked = Boolean(subject?.IsLocked);
              const grade = formatGrade(subject?.GradeID);
              const roomName = subject?.room?.RoomName ?? "";

              return (
                <Paper
                  key={`slot-no${data.TimeslotID}`}
                  elevation={0}
                  sx={{
                    flex: 1,
                    minWidth: 80,
                    height: 86,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    bgcolor: breakSlot
                      ? alpha(theme.palette.action.hover, 0.5)
                      : alpha(theme.palette.background.paper, 0.8),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: breakSlot
                      ? "none"
                      : `0 2px 4px ${alpha(theme.palette.common.black, 0.02)}`,
                    transition: "all 0.2s ease-in-out",
                    cursor: "default",
                    "&:hover": !breakSlot
                      ? {
                          transform: "translateY(-4px)",
                          bgcolor: theme.palette.background.paper,
                          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          zIndex: 1,
                        }
                      : {},
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {breakSlot ? (
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
                      {!isLocked && grade && (
                        <Typography
                          variant="caption"
                          color="primary.main"
                          fontWeight="medium"
                        >
                          {grade}
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
                  {/* Subtle status indicator for locked slots */}
                  {isLocked && !breakSlot && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: 0,
                        height: 0,
                        borderStyle: "solid",
                        borderWidth: "0 16px 16px 0",
                        borderColor: `transparent ${alpha(theme.palette.warning.main, 0.4)} transparent transparent`,
                      }}
                    />
                  )}
                </Paper>
              );
            })}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default TimeSlot;
