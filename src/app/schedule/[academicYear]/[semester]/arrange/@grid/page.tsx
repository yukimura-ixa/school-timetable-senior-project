"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
import { useDroppable } from "@dnd-kit/core";
import { useSnackbar } from "notistack";
import { deleteScheduleAction } from "@/features/schedule-arrangement/application/actions/schedule-arrangement.actions";

type Timeslot = {
  TimeslotID: string;
  DayOfWeek: string;
  Period: number;
  StartTime: Date;
  EndTime: Date;
  Breaktime: string;
};

type ScheduleEntry = {
  ClassID: number;
  TimeslotID: string;
  SubjectCode: string;
  GradeID: string;
  RoomID: number;
  subject: { SubjectName: string };
  gradelevel: { GradeName: string };
  room: { RoomName: string };
};

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"] as const;

const DAY_LABEL: Record<string, string> = {
  MON: "จ",
  TUE: "อ",
  WED: "พ",
  THU: "พฤ",
  FRI: "ศ",
};

function DroppableCell({
  timeslot,
  entry,
  onRemove,
}: {
  timeslot: Timeslot;
  entry?: ScheduleEntry;
  onRemove?: (classId: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: timeslot.TimeslotID,
    data: timeslot,
  });

  const isBreak = timeslot.Breaktime !== "NOT_BREAK";

  return (
    <Box
      ref={setNodeRef}
      data-testid="timeslot-card"
      data-timeslot-id={timeslot.TimeslotID}
      data-is-break={isBreak}
      data-subject-code={entry?.SubjectCode}
      sx={{
        border: "1px solid",
        borderColor: isOver ? "primary.main" : entry ? "success.main" : "divider",
        borderRadius: 1,
        p: 1,
        minHeight: 80,
        position: "relative",
        bgcolor: isBreak
          ? "action.disabledBackground"
          : isOver
            ? "action.hover"
            : entry
              ? "success.lighter"
              : "background.paper",
        transition: "all 0.2s",
      }}
    >
      {isBreak ? (
        <Typography variant="caption" color="text.disabled">
          พัก
        </Typography>
      ) : entry ? (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography variant="body2" fontWeight="bold" noWrap sx={{ flex: 1 }}>
              {entry.subject.SubjectName}
            </Typography>
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
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
            <Chip label={entry.gradelevel.GradeName} size="small" color="primary" />
            <Chip label={entry.room.RoomName} size="small" variant="outlined" />
          </Box>
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          คาบว่าง
        </Typography>
      )}
    </Box>
  );
}

export default function GridSlot() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  const academicYear = params.academicYear as string;
  const semester = params.semester as string;
  const teacher = searchParams.get("teacher");

  const {
    data: timeslotsData,
    error: timeslotsError,
    isLoading: timeslotsLoading,
  } = useSWR(
    `/api/timeslots?year=${academicYear}&semester=${semester}`,
    (url) => fetch(url).then((r) => r.json()),
    {
      onError: () =>
        enqueueSnackbar("ไม่สามารถโหลดข้อมูลช่วงเวลาได้ กรุณาลองใหม่อีกครั้ง", {
          variant: "error",
        }),
    },
  );

  const {
    data: scheduleData,
    error: scheduleError,
    isLoading: scheduleLoading,
    mutate,
  } = useSWR(
    teacher
      ? `/api/schedule/teacher/${teacher}?year=${academicYear}&semester=${semester}`
      : null,
    (url) => fetch(url).then((r) => r.json()),
    {
      refreshInterval: 0,
      onError: () =>
        enqueueSnackbar("ไม่สามารถโหลดตารางสอนของครูได้ กรุณาลองใหม่อีกครั้ง", {
          variant: "error",
        }),
    },
  );

  useEffect(() => {
    const handler = () => { void mutate(); };
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
      } else {
        enqueueSnackbar(result.error?.message || "ไม่สามารถลบรายวิชาได้", { variant: "error" });
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
        {!teacher && (
          <Alert severity="info" sx={{ mb: 2 }}>
            เลือกครูเพื่อดูตารางสอน
          </Alert>
        )}
        {teacher && scheduleEntries.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            จัดแล้ว {scheduleEntries.length} คาบ
          </Alert>
        )}
      </div>

      {/* Grid: rows = days, columns = periods */}
      <Box sx={{ overflowX: "auto" }}>
        <table
          data-testid="timetable-grid"
          style={{ width: "100%", borderCollapse: "separate", borderSpacing: 4 }}
        >
          <thead>
            <tr>
              <th style={{ minWidth: 48 }}>วัน \ คาบ</th>
              {periods.map((p) => (
                <th key={p} style={{ minWidth: 120 }}>
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td style={{ textAlign: "center", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {DAY_LABEL[day]}
                </td>
                {periods.map((period) => {
                  const timeslot = grid[day]?.[period];
                  const entry = timeslot ? scheduleByTimeslot[timeslot.TimeslotID] : undefined;
                  return (
                    <td key={`${day}-${period}`}>
                      {timeslot ? (
                        <DroppableCell timeslot={timeslot} entry={entry} onRemove={handleRemoveEntry} />
                      ) : (
                        <Box sx={{ minHeight: 80 }} />
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
