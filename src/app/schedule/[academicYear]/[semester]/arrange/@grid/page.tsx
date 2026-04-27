/**
 * Grid Slot - Client Component
 *
 * Displays timetable grid with droppable cells.
 * Shows created schedule entries.
 * Handles DnD with validation and modal navigation.
 */

"use client";

import { useEffect, useState } from "react";
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
import {
  DndContext,
  useDroppable,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useSnackbar } from "notistack";
import { validateDropAction } from "@/features/arrange/application/actions/validate-drop.action";
import { deleteScheduleAction } from "@/features/schedule-arrangement/application/actions/schedule-arrangement.actions";
import ConflictDetailsModal from "@/features/schedule-arrangement/presentation/components/ConflictDetailsModal";
import { useConflictResolution } from "@/features/schedule-arrangement/presentation/hooks";
import {
  ConflictType,
  type ConflictResult,
  type ResolutionSuggestion,
  type ScheduleArrangementInput,
} from "@/features/schedule-arrangement/domain/models/conflict.model";

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
  subject: {
    SubjectName: string;
  };
  gradelevel: {
    GradeName: string;
  };
  room: {
    RoomName: string;
  };
};

type SubjectDragData = {
  SubjectCode: string;
  GradeID: string;
  RespID?: number;
};

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"] as const;

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
        borderColor: isOver
          ? "primary.main"
          : entry
            ? "success.main"
            : "divider",
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
            <Chip
              label={entry.gradelevel.GradeName}
              size="small"
              color="primary"
            />
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
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const academicYear = params.academicYear as string;
  const semester = params.semester as string;
  const teacher = searchParams.get("teacher");

  const yearInt = parseInt(academicYear, 10);
  const semInt = semester === "2" ? 2 : 1;

  const [conflictModal, setConflictModal] = useState<{
    conflict: ConflictResult;
    attempt: ScheduleArrangementInput;
    respId?: number;
  } | null>(null);
  const {
    suggestions,
    isLoading: isLoadingSuggestions,
    fetchFor,
    reset: resetSuggestions,
  } = useConflictResolution({
    academicYear: yearInt,
    semester: semInt,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch timeslots via Route Handler
  const {
    data: timeslotsData,
    error: timeslotsError,
    isLoading: timeslotsLoading,
  } = useSWR(
    `/api/timeslots?year=${academicYear}&semester=${semester}`,
    (url) => fetch(url).then((r) => r.json()),
    {
      onError: (err) => {
        console.error("Failed to load timeslots:", err);
        enqueueSnackbar("ไม่สามารถโหลดข้อมูลช่วงเวลาได้ กรุณาลองใหม่อีกครั้ง", {
          variant: "error",
        });
      },
    },
  );

  // Fetch teacher's schedule
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
      refreshInterval: 0, // Only refresh on demand
      onError: (err) => {
        console.error("Failed to load teacher schedule:", err);
        enqueueSnackbar("ไม่สามารถโหลดตารางสอนของครูได้ กรุณาลองใหม่อีกครั้ง", {
          variant: "error",
        });
      },
    },
  );

  // Re-fetch schedule when room-select creates an entry.
  // The @modal parallel route keeps GridSlot mounted, so SWR's
  // revalidateOnFocus won't fire after router.back().
  useEffect(() => {
    const handler = () => { void mutate(); };
    window.addEventListener('schedule-updated', handler);
    return () => window.removeEventListener('schedule-updated', handler);
  }, [mutate]);

  // Handle drag end - validate and navigate to room selection
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !teacher) return;

    const timeslotId = over.id as string;
    const subjectData = active.data.current as SubjectDragData | undefined;

    if (!subjectData?.SubjectCode || !subjectData.GradeID) {
      enqueueSnackbar("ข้อมูลไม่ครบถ้วน", { variant: "warning" });
      return;
    }

    // Validate drop via consolidated endpoint
    try {
      const result = await validateDropAction({
        timeslot: timeslotId,
        subject: subjectData.SubjectCode,
        grade: subjectData.GradeID,
        teacher: teacher,
      });

      if (!result.allowed) {
        const attempt: ScheduleArrangementInput = {
          timeslotId,
          subjectCode: subjectData.SubjectCode,
          gradeId: subjectData.GradeID,
          teacherId: parseInt(teacher, 10) || undefined,
          roomId: null,
          academicYear: yearInt,
          semester: semInt === 1 ? "SEMESTER_1" : "SEMESTER_2",
        };
        const reasonToConflictType: Record<string, ConflictType> = {
          teacher_conflict: ConflictType.TEACHER_CONFLICT,
          grade_conflict: ConflictType.CLASS_CONFLICT,
          break_timeslot: ConflictType.LOCKED_TIMESLOT,
          locked_timeslot: ConflictType.LOCKED_TIMESLOT,
        };
        const conflict: ConflictResult = {
          hasConflict: true,
          conflictType: reasonToConflictType[result.reason] ?? ConflictType.TEACHER_CONFLICT,
          message: result.message || "ไม่สามารถจัดตารางได้",
        };
        setConflictModal({ conflict, attempt, respId: subjectData.RespID });
        void fetchFor(attempt);
        return;
      }

      // Success: Navigate to room selection modal
      const queryParams = new URLSearchParams({
        timeslot: timeslotId,
        subject: subjectData.SubjectCode,
        grade: subjectData.GradeID,
        teacher: teacher,
        ...(subjectData.RespID ? { resp: String(subjectData.RespID) } : {}),
      });

      router.push(
        `/schedule/${academicYear}/${semester}/arrange/room-select?${queryParams.toString()}`,
      );

      // SWR will revalidate when component refocuses after navigation
      void mutate();
    } catch (error) {
      console.error("Validation error:", error);
      enqueueSnackbar("เกิดข้อผิดพลาดในการตรวจสอบ", { variant: "error" });
    }
  };

  const handleRemoveEntry = async (classId: number) => {
    try {
      const result = await deleteScheduleAction({ classId });
      if (result.success) {
        enqueueSnackbar("ลบรายวิชาออกจากคาบเรียนแล้ว", { variant: "success" });
        await mutate();
        window.dispatchEvent(new Event("schedule-updated"));
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

  const closeConflictModal = () => {
    setConflictModal(null);
    resetSuggestions();
  };

  const handleApplySuggestion = (s: ResolutionSuggestion) => {
    if (!conflictModal || !teacher) return;
    const { attempt, respId } = conflictModal;

    // Responsibility ID must flow to /room-select so the created class
    // schedule is linked to a teachers_responsibility row. Missing resp
    // silently creates orphaned schedules that disappear from teacher views.
    const respEntry = respId ? { resp: String(respId) } : {};

    if (s.kind === "MOVE") {
      const q = new URLSearchParams({
        timeslot: s.targetTimeslotId,
        subject: attempt.subjectCode,
        grade: attempt.gradeId,
        teacher,
        ...respEntry,
      });
      router.push(
        `/schedule/${academicYear}/${semester}/arrange/room-select?${q.toString()}`,
      );
      closeConflictModal();
      return;
    }

    if (s.kind === "RE_ROOM") {
      const q = new URLSearchParams({
        timeslot: attempt.timeslotId,
        subject: attempt.subjectCode,
        grade: attempt.gradeId,
        teacher,
        room: String(s.targetRoomId),
        ...respEntry,
      });
      router.push(
        `/schedule/${academicYear}/${semester}/arrange/room-select?${q.toString()}`,
      );
      closeConflictModal();
      return;
    }

    // SWAP — MVP: manual follow-up required, see issue tracker
    enqueueSnackbar(
      "ฟังก์ชันสลับอัตโนมัติยังไม่รองรับ โปรดลบรายวิชาปลายทางก่อนแล้วจัดใหม่",
      { variant: "warning" },
    );
    closeConflictModal();
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
    if (dayGrid) {
      dayGrid[ts.Period] = ts;
    }
  });

  // Group schedule entries by timeslot
  const scheduleByTimeslot: Record<string, ScheduleEntry> = {};
  scheduleEntries.forEach((entry) => {
    scheduleByTimeslot[entry.TimeslotID] = entry;
  });

  // Get max periods
  const maxPeriod = Math.max(...timeslots.map((ts) => ts.Period), 8);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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

        {/* Grid */}
        <Box sx={{ overflowX: "auto" }}>
          <table
            data-testid="timetable-grid"
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 4,
            }}
          >
            <thead>
              <tr>
                <th style={{ minWidth: 60 }}>คาบ</th>
                {DAYS.map((day) => (
                  <th key={day} style={{ minWidth: 120 }}>
                    {day === "MON"
                      ? "จ"
                      : day === "TUE"
                        ? "อ"
                        : day === "WED"
                          ? "พ"
                          : day === "THU"
                            ? "พฤ"
                            : "ศ"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxPeriod }, (_, i) => i + 1).map(
                (period) => (
                  <tr key={period}>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                      {period}
                    </td>
                    {DAYS.map((day) => {
                      const timeslot = grid[day]?.[period];
                      const entry = timeslot
                        ? scheduleByTimeslot[timeslot.TimeslotID]
                        : undefined;

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
                ),
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
      {conflictModal && (
        <ConflictDetailsModal
          open
          conflict={conflictModal.conflict}
          attempt={conflictModal.attempt}
          suggestions={suggestions}
          isLoadingSuggestions={isLoadingSuggestions}
          onApply={handleApplySuggestion}
          onClose={closeConflictModal}
        />
      )}
    </DndContext>
  );
}
