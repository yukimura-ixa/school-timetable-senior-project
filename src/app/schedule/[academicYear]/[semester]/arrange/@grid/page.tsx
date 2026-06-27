"use client";

import { useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import {
  getCellState,
  formatPeriodRange,
  DAY_FULL_LABEL,
} from "../_lib/grid-format";
import { useDroppable } from "@dnd-kit/core";
import { useSnackbar } from "notistack";
import { deleteScheduleAction } from "@/features/schedule-arrangement/application/actions/schedule-arrangement.actions";
import {
  type Timeslot,
  type ScheduleEntry,
  jsonFetcher,
  timeslotsKey,
  teacherScheduleKey,
  classScheduleKey,
} from "../_lib/teacher-schedule";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"] as const;

function DroppableCell({
  timeslot,
  entry,
  onRemove,
  readOnly = false,
}: {
  timeslot: Timeslot;
  entry?: ScheduleEntry;
  onRemove?: (classId: number) => void;
  readOnly?: boolean;
}) {
  // Pre-compute locked so we can disable the droppable hook before getCellState
  const isLocked =
    timeslot.Breaktime !== "NOT_BREAK" || Boolean(entry?.IsLocked);

  const { isOver, setNodeRef } = useDroppable({
    id: timeslot.TimeslotID,
    data: timeslot,
    disabled: readOnly || isLocked,
  });

  const state = getCellState(timeslot, entry, isOver);

  const bg = {
    locked: "action.disabledBackground",
    "drop-target": "primary.lighter",
    placed: "success.lighter",
    empty: "background.paper",
  }[state.kind];

  const borderColor = {
    locked: "divider",
    "drop-target": "primary.main",
    placed: "success.main",
    empty: "divider",
  }[state.kind];

  return (
    <Box
      ref={setNodeRef}
      data-testid="timeslot-card"
      data-timeslot-id={timeslot.TimeslotID}
      data-is-break={
        state.kind === "locked" && state.lockReason === "break"
      }
      data-subject-code={entry?.SubjectCode}
      sx={{
        border: state.kind === "empty" ? "1px dashed" : "1px solid",
        borderColor,
        borderRadius: 1,
        p: 1,
        minHeight: 110,
        position: "relative",
        bgcolor: bg,
        transition: "all 0.2s",
      }}
    >
      {state.kind === "locked" ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 90,
            gap: 0.5,
            color: "text.disabled",
          }}
        >
          {state.lockReason === "break" ? (
            <FreeBreakfastIcon sx={{ fontSize: 24 }} />
          ) : (
            <LockIcon sx={{ fontSize: 24 }} />
          )}
          <Typography variant="caption" align="center">
            {state.lockReason === "break"
              ? state.label
              : (entry?.subject.SubjectName ?? "")}
          </Typography>
        </Box>
      ) : state.kind === "placed" && entry ? (
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flex: 1,
                minWidth: 0,
              }}
            >
              <CheckCircleIcon
                sx={{ fontSize: 16, color: "success.main", flexShrink: 0 }}
              />
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: "bold",
                }}
              >
                {entry.subject.SubjectName}
              </Typography>
            </Box>
            {!readOnly && (
              <IconButton
                data-testid="timeslot-remove"
                aria-label="ลบรายวิชาออกจากคาบเรียน"
                size="small"
                onClick={() => onRemove?.(entry.ClassID)}
                sx={{
                  p: 0.25,
                  ml: 0.5,
                  color: "error.main",
                  "&:hover": { bgcolor: "error.lighter" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
            <Chip
              label={entry.gradelevel.GradeName}
              size="small"
              color="primary"
            />
            {entry.room && (
              <Chip
                label={entry.room.RoomName}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          {entry.teacherName && (
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: "text.secondary",
                display: "block",
                mt: 0.5,
              }}
            >
              {entry.teacherName}
            </Typography>
          )}
        </Box>
      ) : (
        <Typography
          variant="caption"
          color={
            state.kind === "drop-target" ? "primary.main" : "text.secondary"
          }
        >
          {state.kind === "drop-target" ? `⤓ ${state.label}` : state.label}
        </Typography>
      )}
    </Box>
  );
}

export default function GridSlot() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const academicYear = params.academicYear as string;
  const semester = params.semester as string;
  const teacher = searchParams.get("teacher");
  const grade = searchParams.get("grade");
  const isClassView = searchParams.get("view") === "class";
  const hasSelection = isClassView ? Boolean(grade) : Boolean(teacher);

  const {
    data: timeslotsData,
    error: timeslotsError,
    isLoading: timeslotsLoading,
  } = useSWR(timeslotsKey(academicYear, semester), jsonFetcher, {
    onError: () =>
      enqueueSnackbar("ไม่สามารถโหลดข้อมูลช่วงเวลาได้ กรุณาลองใหม่อีกครั้ง", {
        variant: "error",
      }),
  });

  const {
    data: scheduleData,
    error: scheduleError,
    isLoading: scheduleLoading,
    mutate,
  } = useSWR(
    isClassView
      ? classScheduleKey(grade, academicYear, semester)
      : teacherScheduleKey(teacher, academicYear, semester),
    jsonFetcher,
    {
      refreshInterval: 0,
      onError: () =>
        enqueueSnackbar("ไม่สามารถโหลดตารางสอนของครูได้ กรุณาลองใหม่อีกครั้ง", {
          variant: "error",
        }),
    },
  );

  useEffect(() => {
    const handler = () => {
      void mutate();
    };
    window.addEventListener("schedule-updated", handler);
    return () => window.removeEventListener("schedule-updated", handler);
  }, [mutate]);

  const handleRemoveEntry = async (classId: number) => {
    try {
      const result = await deleteScheduleAction({ classId });
      if (result.success) {
        enqueueSnackbar("ลบรายวิชาออกจากคาบเรียนแล้ว", { variant: "success" });
        await mutate();
        window.dispatchEvent(new Event("schedule-updated"));
        // Palette (รายวิชาที่สอน) is server-rendered and hides fully-placed
        // subjects; refresh so a removed subject reappears as available.
        router.refresh();
      } else {
        enqueueSnackbar(result.error?.message || "ไม่สามารถลบรายวิชาได้", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบ",
        { variant: "error" },
      );
    }
  };

  if (timeslotsLoading || scheduleLoading) {
    return (
      <Paper sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (timeslotsError || scheduleError) {
    return <Alert severity="error">เกิดข้อผิดพลาดในการโหลดข้อมูล</Alert>;
  }

  if (!hasSelection) {
    return (
      <Paper
        sx={{
          p: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <Alert severity="info" variant="outlined">
          {isClassView
            ? "เลือกชั้นเรียนเพื่อดูตารางสอน"
            : "เลือกครูเพื่อดูตารางสอน"}
        </Alert>
      </Paper>
    );
  }

  const timeslots: Timeslot[] = timeslotsData?.data || [];
  const scheduleEntries: ScheduleEntry[] = scheduleData?.data || [];

  // Group timeslots by day and period
  const grid: Record<string, Record<number, Timeslot>> = {};
  timeslots.forEach((ts) => {
    if (!grid[ts.DayOfWeek]) grid[ts.DayOfWeek] = {};
    const dayGrid = grid[ts.DayOfWeek];
    if (dayGrid) dayGrid[ts.Period] = ts;
  });

  // Group schedule entries by timeslot
  const scheduleByTimeslot: Record<string, ScheduleEntry> = {};
  scheduleEntries.forEach((entry) => {
    scheduleByTimeslot[entry.TimeslotID] = entry;
  });

  const maxPeriod = Math.max(...timeslots.map((ts) => ts.Period), 8);
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        ตารางสอน
      </Typography>

      <div aria-live="polite">
        {scheduleEntries.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            จัดแล้ว {scheduleEntries.length} คาบ
          </Alert>
        )}
      </div>

      {/* Grid: rows = days, columns = periods. Fixed layout so columns share
          the available width (no horizontal scroll); rows are tall enough to
          hold a placed entry's name + chips. */}
      <Box sx={{ width: "100%" }}>
        <table
          data-testid="timetable-grid"
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "separate",
            borderSpacing: 4,
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 56 }}>วัน \ คาบ</th>
              {periods.map((p) => {
                const anySlot = DAYS.map((d) => grid[d]?.[p]).find(Boolean);
                return (
                  <th key={p}>
                    <div style={{ fontWeight: 700 }}>{p}</div>
                    <Box
                      component="div"
                      sx={{
                        fontWeight: 400,
                        fontSize: "0.75rem",
                        color: "text.secondary",
                      }}
                    >
                      {anySlot
                        ? formatPeriodRange(anySlot.StartTime, anySlot.EndTime)
                        : ""}
                    </Box>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  {DAY_FULL_LABEL[day] ?? day}
                </td>
                {periods.map((period) => {
                  const timeslot = grid[day]?.[period];
                  const entry = timeslot
                    ? scheduleByTimeslot[timeslot.TimeslotID]
                    : undefined;
                  return (
                    <td key={`${day}-${period}`}>
                      {timeslot ? (
                        <DroppableCell
                          timeslot={timeslot}
                          entry={entry}
                          onRemove={isClassView ? undefined : handleRemoveEntry}
                          readOnly={isClassView}
                        />
                      ) : (
                        <Box sx={{ minHeight: 110 }} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
}
