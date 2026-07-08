"use client";
import React, { useState, useSyncExternalStore } from "react";
import { MdAddCircle } from "react-icons/md";
import { useLockedSchedules } from "@/hooks";
import LockScheduleForm from "./LockScheduleForm";
import { useConfirmDialog } from "@/components/dialogs";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";
import { deleteLocksAction } from "@/features/lock/application/actions/lock.actions";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import {
  Box,
  Button,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ViewList as ViewListIcon,
  CalendarMonth as CalendarIcon,
  ContentPaste as TemplateIcon,
  LockClock as LockClockIcon,
  MeetingRoom as RoomIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  CardSkeleton,
  NoLockedSchedulesEmptyState,
  NetworkErrorEmptyState,
} from "@/components/feedback";
import LockCalendarView from "./LockCalendarView";
import LockListView from "./LockListView";
import LockTemplatesModal from "./LockTemplatesModal";
import { LOCK_TYPE_CONFIG } from "./lockTypeConfig";

type ViewMode = "list" | "calendar";

const VIEW_MODE_KEY = "lockScheduleViewMode";

const viewModeListeners = new Set<() => void>();

function subscribeViewMode(callback: () => void) {
  window.addEventListener("storage", callback);
  viewModeListeners.add(callback);
  return () => {
    window.removeEventListener("storage", callback);
    viewModeListeners.delete(callback);
  };
}

function getViewModeSnapshot(): ViewMode {
  const saved = localStorage.getItem(VIEW_MODE_KEY);
  return saved === "list" || saved === "calendar" ? saved : "calendar";
}

function getViewModeServerSnapshot(): ViewMode {
  return "calendar";
}

function setViewModePreference(mode: ViewMode) {
  localStorage.setItem(VIEW_MODE_KEY, mode);
  viewModeListeners.forEach((listener) => listener());
}

function useViewModePreference(): ViewMode {
  return useSyncExternalStore(
    subscribeViewMode,
    getViewModeSnapshot,
    getViewModeServerSnapshot,
  );
}

function handleViewModeChange(
  _event: React.MouseEvent<HTMLElement>,
  newMode: ViewMode | null,
) {
  if (newMode !== null) {
    setViewModePreference(newMode);
  }
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Box sx={{ display: "flex", color: "primary.main" }}>{icon}</Box>
      <Typography
        variant="body2"
        component="span"
        sx={{ fontWeight: 700, color: "text.primary" }}
      >
        {value}
      </Typography>
      <Typography variant="body2" component="span" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
    </Stack>
  );
}

function Legend() {
  return (
    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
      {Object.entries(LOCK_TYPE_CONFIG).map(([type, config]) => (
        <Stack key={type} direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "3px",
              bgcolor: config.bgColor,
              border: `1.5px solid ${config.borderColor}`,
            }}
          />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {config.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function computeStats(locks: GroupedLockedSchedule[]) {
  const grades = new Set<string>();
  const teachers = new Set<number>();
  for (const lock of locks) {
    lock.GradeIDs.forEach((g) => grades.add(g));
    lock.teachers.forEach((t) => teachers.add(t.TeacherID));
  }
  return { locks: locks.length, grades: grades.size, teachers: teachers.size };
}

type LockScheduleProps = {
  initialData: GroupedLockedSchedule[];
  semester: number;
  academicYear: number;
};

function LockSchedule({ initialData, semester, academicYear }: LockScheduleProps) {
  const [lockScheduleFormActive, setLockScheduleFormActive] =
    useState<boolean>(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState<boolean>(false);
  const viewMode = useViewModePreference();

  const { confirm, dialog } = useConfirmDialog();

  // Use SWR with server-provided initial data for revalidation
  const lockData = useLockedSchedules(
    academicYear,
    semester,
    initialData, // Pass initial data from server
  );

  // Derive ConfigID from semesterAndyear params
  const configId = `${semester}-${academicYear}`;

  const [selectedLock, setSelectedLock] =
    useState<GroupedLockedSchedule | null>(null);

  const handleClickAddLockSchedule = () => {
    setSelectedLock(null);
    setLockScheduleFormActive(true);
  };

  const handleClickDeleteLockSchedule = async (item: GroupedLockedSchedule) => {
    const confirmed = await confirm({
      title: "ลบข้อมูลคาบล็อก",
      message: `คุณต้องการลบข้อมูลคาบล็อก "${item.SubjectCode} - ${item.SubjectName}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      variant: "danger",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return;

    const loadbar = enqueueSnackbar("กำลังลบข้อมูลคาบล็อก", {
      variant: "info",
      persist: true,
    });

    try {
      const result = await deleteLocksAction(item.ClassIDs);
      if (!result.success) {
        throw new Error(result.error?.message ?? "Unknown error");
      }
      closeSnackbar(loadbar);
      enqueueSnackbar("ลบข้อมูลคาบล็อกสำเร็จ", { variant: "success" });
      await lockData.mutate();
    } catch (error: unknown) {
      closeSnackbar(loadbar);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar("ลบข้อมูลคาบล็อกไม่สำเร็จ: " + errorMessage, {
        variant: "error",
      });
      console.error(error);
    }
  };

  if (lockData.isLoading) {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, py: 2 }}>
        {[...Array(4)].map((_, i) => (
          <Box key={i} sx={{ width: "49%" }}>
            <CardSkeleton />
          </Box>
        ))}
      </Box>
    );
  }

  if (lockData.error) {
    return <NetworkErrorEmptyState onRetry={() => void lockData.mutate()} />;
  }

  const hasData = !!lockData.data && lockData.data.length > 0;
  const stats = computeStats(lockData.data ?? []);

  return (
    <>
      {dialog}
      {lockScheduleFormActive ? (
        <LockScheduleForm
          closeModal={() => setLockScheduleFormActive(false)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={selectedLock as any}
          mutate={() => void lockData.mutate()}
        />
      ) : null}

      {/* Hero header: title + purpose, primary actions */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            คาบล็อก
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 560 }}>
            กันช่วงเวลาไว้สำหรับกิจกรรมพิเศษ เช่น ชุมนุม กิจกรรมเช้า หรือการประชุม
            เพื่อไม่ให้ระบบจัดตารางนำคาบเหล่านี้ไปใช้
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<MdAddCircle />}
            onClick={handleClickAddLockSchedule}
            data-testid="add-lock-btn"
          >
            เพิ่มคาบล็อก
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<TemplateIcon />}
            onClick={() => setTemplatesModalOpen(true)}
            data-testid="template-lock-btn"
          >
            ใช้เทมเพลต
          </Button>
        </Stack>
      </Box>

      {/* Stat strip + legend + view toggle (only meaningful once locks exist) */}
      {hasData && (
        <Box
          sx={{
            mt: 1,
            mb: 1,
            py: 1.5,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{ alignItems: "center", flexWrap: "wrap" }}
          >
            <StatItem
              icon={<LockClockIcon fontSize="small" />}
              value={stats.locks}
              label="คาบล็อก"
            />
            <StatItem
              icon={<RoomIcon fontSize="small" />}
              value={stats.grades}
              label="ชั้นเรียน"
            />
            <StatItem
              icon={<PersonIcon fontSize="small" />}
              value={stats.teachers}
              label="ครูผู้สอน"
            />
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Legend />
            </Box>
          </Stack>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="โหมดมุมมอง"
            size="small"
          >
            <ToggleButton value="calendar" aria-label="มุมมองปฏิทิน">
              <CalendarIcon sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">ปฏิทิน</Typography>
            </ToggleButton>
            <ToggleButton value="list" aria-label="มุมมองรายการ">
              <ViewListIcon sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">รายการ</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Empty state when no data — CTA wired to open the add-lock form */}
      {!hasData && (
        <Box sx={{ mb: 4 }}>
          <NoLockedSchedulesEmptyState onAdd={handleClickAddLockSchedule} />
        </Box>
      )}

      {/* Calendar View */}
      {hasData && viewMode === "calendar" && (
        <LockCalendarView
          lockData={lockData.data}
          academicYear={academicYear}
          semester={semester}
          onEditLock={(lock) => {
            const index = lockData.data.findIndex(
              (item) => item.SubjectCode === lock.SubjectCode,
            );
            if (index !== -1 && lockData.data[index]) {
              setSelectedLock(lockData.data[index]);
              setLockScheduleFormActive(true);
            }
          }}
          onDeleteLock={(lock) => {
            void handleClickDeleteLockSchedule(lock);
          }}
        />
      )}

      {/* List View */}
      {hasData && viewMode === "list" && (
        <LockListView
          lockData={lockData.data}
          onAddLock={handleClickAddLockSchedule}
          onDeleteLock={(item) => {
            void handleClickDeleteLockSchedule(item);
          }}
        />
      )}

      {/* Lock Templates Modal */}
      <LockTemplatesModal
        open={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        academicYear={academicYear}
        semester={semester}
        configId={configId}
        onSuccess={() => {
          void lockData.mutate();
          setTemplatesModalOpen(false);
        }}
      />
    </>
  );
}

export default LockSchedule;
