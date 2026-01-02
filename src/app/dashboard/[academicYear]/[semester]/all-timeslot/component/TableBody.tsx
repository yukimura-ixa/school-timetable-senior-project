"use client";
import React from "react";
import {
  Box,
  Typography,
  Stack,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import { colors } from "@/shared/design-system";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import type { teacher } from "@/prisma/generated/client";
import LockIcon from "@mui/icons-material/Lock";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";
import { formatGradeIdDisplay } from "@/utils/grade-display";

type ClassData = {
  teachers_responsibility: Array<{ TeacherID: number }>;
  timeslot: { DayOfWeek: string; TimeslotID: string };
  GradeID: string;
  IsLocked?: boolean;
  SubjectCode?: string;
  [key: string]: unknown;
};

type DayData = {
  Day: string;
  BgColor: string;
  [key: string]: unknown;
};

type Props = {
  teachers: teacher[];
  slotAmount: number[];
  classData: ClassData[];
  days: DayData[];
};

const TableBody = (props: Props) => {
  const theme = useTheme();

  const formatGradeLabel = (gradeId: string) => formatGradeIdDisplay(gradeId);

  function getClassDataByTeacherID(
    TeacherID: number,
    Day: string,
    SlotNumber: number,
  ) {
    const filterClass = props.classData.filter(
      (item) =>
        item.teachers_responsibility
          .map((tid) => tid.TeacherID)
          .includes(TeacherID) &&
        dayOfWeekThai[item.timeslot.DayOfWeek] === Day &&
        extractPeriodFromTimeslotId(item.timeslot.TimeslotID) === SlotNumber,
    );

    if (filterClass.length === 0) {
      return null;
    }

    const firstClass = filterClass[0];
    const convertClass = filterClass
      .map((item) => formatGradeLabel(item.GradeID))
      .join(", ");

    return (
      <Stack spacing={0.5} alignItems="center" sx={{ width: "100%", px: 0.5 }}>
        {firstClass?.IsLocked && (
          <Tooltip title="Locked">
            <LockIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
          </Tooltip>
        )}
        <Typography
          variant="caption"
          fontWeight={firstClass?.IsLocked ? "bold" : "medium"}
          sx={{
            fontSize: "0.75rem",
            color: firstClass?.IsLocked ? "error.main" : "text.primary",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {firstClass?.IsLocked ? firstClass.SubjectCode : convertClass}
        </Typography>
        {!firstClass?.IsLocked && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.65rem",
              color: "text.secondary",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            {firstClass?.SubjectCode}
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={0.25} sx={{ width: "100%" }}>
      {props.teachers.map((tch, _tchIdx) => (
        <Stack
          key={`tch-${tch.TeacherID}`}
          direction="row"
          spacing={0.5}
          sx={{
            py: 0.5,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: alpha(colors.emerald.main, 0.04),
            },
          }}
        >
          {props.days.map((day) => (
            <Stack
              key={`${tch.TeacherID}-${day.Day}`}
              direction="row"
              spacing={0.5}
              sx={{ flex: 1, minWidth: props.slotAmount.length * 56 }}
            >
              {props.slotAmount.map((slot, _slotIdx) => {
                const content = getClassDataByTeacherID(
                  tch.TeacherID,
                  day.Day,
                  slot,
                );
                const hasContent = content !== null;

                return (
                  <Box
                    key={`slot-${slot}`}
                    sx={{
                      width: 52,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                      border: `1px solid ${hasContent ? alpha(day.BgColor, 0.5) : alpha(theme.palette.divider, 0.05)}`,
                      bgcolor: hasContent
                        ? alpha(day.BgColor, 0.05)
                        : "transparent",
                      position: "relative",
                      transition: "all 0.2s",
                      "&:hover": hasContent
                        ? {
                            bgcolor: alpha(day.BgColor, 0.1),
                            boxShadow: `0 2px 4px ${alpha(day.BgColor, 0.1)}`,
                            transform: "translateY(-1px)",
                            zIndex: 1,
                          }
                        : {
                            bgcolor: alpha(theme.palette.action.hover, 0.3),
                          },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        left: 2,
                        top: 0,
                        fontSize: "0.6rem",
                        color: alpha(theme.palette.text.disabled, 0.3),
                        pointerEvents: "none",
                      }}
                    >
                      {slot}
                    </Typography>
                    {content}
                  </Box>
                );
              })}
            </Stack>
          ))}
        </Stack>
      ))}
    </Stack>
  );
};

export default TableBody;
