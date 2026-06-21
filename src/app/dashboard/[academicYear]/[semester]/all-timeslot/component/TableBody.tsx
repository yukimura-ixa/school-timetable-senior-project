"use client";
import React from "react";
import {
  Paper,
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
import type { TimetableColumn } from "../../shared/timeSlot";

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
  columns: TimetableColumn[];
  classData: ClassData[];
  days: DayData[];
};

const TEACH_WIDTH = 52;
const BREAK_WIDTH = 24;
const CELL_GAP = 4;
const ROW_HEIGHT = 60;

const TableBody = (props: Props) => {
  const theme = useTheme();

  const teachingCount = props.columns.filter(
    (c) => c.kind === "teaching",
  ).length;
  const breakCount = props.columns.length - teachingCount;
  const dayMinWidth =
    teachingCount * TEACH_WIDTH +
    breakCount * BREAK_WIDTH +
    Math.max(props.columns.length - 1, 0) * CELL_GAP;

  const formatGradeLabel = (gradeId: string) => formatGradeIdDisplay(gradeId);

  function getClassDataByTeacherID(
    TeacherID: number,
    Day: string,
    SlotPeriod: number,
  ) {
    const filterClass = props.classData.filter(
      (item) =>
        item.teachers_responsibility
          .map((tid) => tid.TeacherID)
          .includes(TeacherID) &&
        dayOfWeekThai[item.timeslot.DayOfWeek] === Day &&
        extractPeriodFromTimeslotId(item.timeslot.TimeslotID) === SlotPeriod,
    );

    if (filterClass.length === 0) {
      return null;
    }

    const firstClass = filterClass[0];
    const isLocked = Boolean(firstClass?.IsLocked);
    // Joining multiple grades into a single cell is only valid for locked
    // timeslots (assemblies, flag ceremony, MOE-pinned activities). For
    // non-locked classes a teacher can only be in one grade per slot;
    // any duplicates here indicate a seed/data conflict — display the
    // first match only.
    const gradeLabel = isLocked
      ? filterClass.map((item) => formatGradeLabel(item.GradeID)).join(", ")
      : formatGradeLabel(firstClass?.GradeID ?? "");

    return (
      <Stack
        spacing={0.5}
        sx={{
          alignItems: "center",
          width: "100%",
          px: 0.25,
        }}
      >
        {isLocked && (
          <Tooltip title="Locked">
            <LockIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
          </Tooltip>
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: isLocked ? "bold" : "medium",
            fontSize: "0.7rem",
            color: isLocked ? "error.main" : "text.primary",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {gradeLabel}
        </Typography>
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
      </Stack>
    );
  }

  return (
    <Stack spacing={0.25} sx={{ width: "100%" }}>
      {props.teachers.map((tch) => (
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
              sx={{ flex: 1, minWidth: dayMinWidth }}
            >
              {props.columns.map((col) => {
                const isBreak = col.kind === "break";
                const slotPeriod = extractPeriodFromTimeslotId(col.TimeslotID);
                const content = isBreak
                  ? null
                  : getClassDataByTeacherID(tch.TeacherID, day.Day, slotPeriod);
                const hasContent = content !== null;

                return (
                  <Paper
                    key={`slot-${col.TimeslotID || `syn-${col.slotIndex}`}`}
                    elevation={0}
                    sx={{
                      width: isBreak ? BREAK_WIDTH : TEACH_WIDTH,
                      minWidth: isBreak ? BREAK_WIDTH : TEACH_WIDTH,
                      height: ROW_HEIGHT,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                      border: `1px solid ${
                        hasContent
                          ? alpha(day.BgColor, 0.5)
                          : alpha(theme.palette.divider, 0.1)
                      }`,
                      bgcolor: isBreak
                        ? alpha(theme.palette.action.hover, 0.5)
                        : hasContent
                          ? alpha(day.BgColor, 0.08)
                          : alpha(theme.palette.background.paper, 0.8),
                      boxShadow:
                        isBreak || !hasContent
                          ? "none"
                          : `0 2px 4px ${alpha(theme.palette.common.black, 0.02)}`,
                      position: "relative",
                      transition: "all 0.2s ease-in-out",
                      cursor: "default",
                      overflow: "hidden",
                      "&:hover":
                        !isBreak && hasContent
                          ? {
                              transform: "translateY(-2px)",
                              bgcolor: alpha(day.BgColor, 0.15),
                              boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.06)}`,
                              borderColor: alpha(day.BgColor, 0.7),
                              zIndex: 1,
                            }
                          : !isBreak
                            ? {
                                bgcolor: alpha(theme.palette.action.hover, 0.3),
                              }
                            : {},
                    }}
                  >
                    {content}
                  </Paper>
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
