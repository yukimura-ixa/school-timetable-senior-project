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
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ViewList as ViewListIcon,
  CalendarMonth as CalendarIcon,
  ContentPaste as TemplateIcon,
} from "@mui/icons-material";
import {
  CardSkeleton,
  NoLockedSchedulesEmptyState,
  NetworkErrorEmptyState,
} from "@/components/feedback";
import LockCalendarView from "./LockCalendarView";
import LockListView from "./LockListView";
import LockTemplatesModal from "./LockTemplatesModal";

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
      // Use ClassIDs from grouped schedule
      await deleteLocksAction({ ClassIDs: item.ClassIDs });
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

      {/* Action Buttons and View Toggle (always visible to allow creating first lock) */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={2}>
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

      {/* Empty state when no data */}
      {!hasData && (
        <Box sx={{ mb: 4 }}>
          <NoLockedSchedulesEmptyState />
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
