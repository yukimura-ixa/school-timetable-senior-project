"use client";
import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Lock as LockIcon,
  Block as BlockIcon,
  EmojiEvents as ActivityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { useTimeslots } from "@/hooks";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import type { timeslot } from "@/prisma/generated/client";

interface LockCalendarViewProps {
  lockData: GroupedLockedSchedule[];
  academicYear: number;
  semester: number;
  onEditLock?: (lock: GroupedLockedSchedule) => void;
  onDeleteLock?: (lock: GroupedLockedSchedule) => void;
}

// Lock type classification
// Note: EXAM type removed - exam scheduling should use dedicated "Exam Arrange Mode" feature
type LockType = "SUBJECT" | "BLOCK" | "ACTIVITY";

interface LockTypeConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactElement;
  label: string;
}

const LOCK_TYPE_CONFIG: Record<LockType, LockTypeConfig> = {
  SUBJECT: {
    color: "#d32f2f",
    bgColor: "rgba(211, 47, 47, 0.1)",
    borderColor: "#d32f2f",
    icon: <LockIcon fontSize="small" />,
    label: "วิชาเรียน",
  },
  BLOCK: {
    color: "#757575",
    bgColor: "rgba(117, 117, 117, 0.1)",
    borderColor: "#757575",
    icon: <BlockIcon fontSize="small" />,
    label: "บล็อกเวลา",
  },
  ACTIVITY: {
    color: "#7b1fa2",
    bgColor: "rgba(123, 31, 162, 0.1)",
    borderColor: "#7b1fa2",
    icon: <ActivityIcon fontSize="small" />,
    label: "กิจกรรม",
  },
};

function LockCalendarView({
  lockData,
  academicYear,
  semester,
  onEditLock,
  onDeleteLock,
}: LockCalendarViewProps) {
  const timeslotsData = useTimeslots(academicYear, semester);
  const [selectedLock, setSelectedLock] =
    useState<GroupedLockedSchedule | null>(null);

  // Group timeslots by day and period
  const timeslotGrid = useMemo(() => {
    if (!timeslotsData.data) return null;

    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    const grid: Record<string, Record<number, timeslot>> = {};

    days.forEach((day) => {
      grid[day] = {};
    });

    timeslotsData.data.forEach((slot) => {
      const day = slot.DayOfWeek;
      // Extract period number from TimeslotID (e.g., "1-2567-MON1" -> 1)
      const periodMatch = slot.TimeslotID.match(/\d+$/);
      const period = periodMatch ? parseInt(periodMatch[0]) : 0;

      if (grid[day]) {
        grid[day][period] = slot;
      }
    });

    return grid;
  }, [timeslotsData.data]);

  // Map locks to timeslot grid
  const lockMap = useMemo(() => {
    const map: Record<string, GroupedLockedSchedule> = {};

    lockData.forEach((lock) => {
      lock.timeslots.forEach((timeslot) => {
        map[timeslot.TimeslotID] = lock;
      });
    });

    return map;
  }, [lockData]);

  // Get lock type (heuristic-based classification)
  // Note: Exam periods should use dedicated "Exam Arrange Mode" feature instead
  const getLockType = (lock: GroupedLockedSchedule): LockType => {
    if (lock.SubjectName && lock.SubjectName.includes("กิจกรรม"))
      return "ACTIVITY";
    if (!lock.SubjectCode || lock.SubjectCode === "-") return "BLOCK";
    return "SUBJECT";
  };

  const handleLockClick = (lock: GroupedLockedSchedule) => {
    setSelectedLock(lock);
  };

  const handleCloseDialog = () => {
    setSelectedLock(null);
  };

  if (timeslotsData.isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">กำลังโหลดตารางเรียน...</Typography>
      </Box>
    );
  }

  if (!timeslotGrid) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          ไม่พบข้อมูลตารางเรียน กรุณาตั้งค่าตารางเรียนก่อน
        </Typography>
      </Box>
    );
  }

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const maxPeriods = Math.max(
    ...days.map((day) => Object.keys(timeslotGrid[day] || {}).length),
  );
  const periods: number[] = Array.from({ length: maxPeriods }, (_, i) => i + 1);

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <CalendarIcon color="primary" />
          <Typography variant="h6">ปฏิทินคาบล็อก</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {Object.entries(LOCK_TYPE_CONFIG).map(([type, config]) => (
              <Chip
                key={type}
                icon={config.icon}
                label={config.label}
                size="small"
                sx={{
                  bgcolor: config.bgColor,
                  color: config.color,
                  borderColor: config.borderColor,
                  border: `1px solid ${config.borderColor}`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Calendar Grid */}
        <Box
          data-testid="lock-grid"
          sx={{
            display: "grid",
            gridTemplateColumns: `80px repeat(${days.length}, 1fr)`,
            gap: 1,
            overflowX: "auto",
          }}
        >
          {/* Header Row */}
          <Box
            sx={{
              position: "sticky",
              left: 0,
              bgcolor: "background.paper",
              zIndex: 2,
            }}
          />
          {days.map((day) => (
            <Paper
              key={day}
              elevation={0}
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: "primary.lighter",
                fontWeight: "bold",
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {dayOfWeekThai[day]}
              </Typography>
            </Paper>
          ))}

          {/* Time Slots */}
          {periods.map((period) => (
            <React.Fragment key={period}>
              {/* Period Label */}
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 1,
                  bgcolor: "grey.100",
                  position: "sticky",
                  left: 0,
                  zIndex: 1,
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  คาบ {period}
                </Typography>
              </Paper>

              {/* Day Cells */}
              {days.map((day) => {
                const timeslot = timeslotGrid[day]?.[period];
                const lock = timeslot
                  ? (lockMap[timeslot.TimeslotID] ?? null)
                  : null;
                const lockType = lock ? getLockType(lock) : null;
                const config =
                  lockType !== null ? LOCK_TYPE_CONFIG[lockType] : null;

                return (
                  <Paper
                    key={`${day}-${period}`}
                    elevation={lock ? 2 : 0}
                    sx={{
                      p: 1.5,
                      minHeight: 80,
                      cursor: lock ? "pointer" : "default",
                      bgcolor: lock ? config?.bgColor : "background.paper",
                      border: lock
                        ? `2px solid ${config?.borderColor}`
                        : "1px solid",
                      borderColor: lock ? config?.borderColor : "divider",
                      transition: "all 0.2s",
                      "&:hover": lock
                        ? {
                            transform: "scale(1.02)",
                            boxShadow: 3,
                          }
                        : {},
                    }}
                    onClick={() => lock && handleLockClick(lock)}
                  >
                    {lock ? (
                      <Tooltip
                        title={`${lock.SubjectCode} - ${lock.SubjectName}`}
                        arrow
                      >
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mb: 0.5,
                            }}
                          >
                            {config?.icon}
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "bold",
                                color: config?.color,
                              }}
                            >
                              {lock.SubjectCode}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "text.secondary",
                            }}
                          >
                            {lock.SubjectName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 0.5,
                              color: "text.secondary",
                            }}
                          >
                            {lock.room?.RoomName}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ) : (
                      <Box
                        sx={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.disabled">
                          ว่าง
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Paper>

      {/* Lock Detail Dialog */}
      <Dialog
        open={!!selectedLock}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedLock && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {LOCK_TYPE_CONFIG[getLockType(selectedLock)].icon}
                  <Typography variant="h6">รายละเอียดคาบล็อก</Typography>
                </Box>
                <IconButton size="small" onClick={handleCloseDialog}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Subject Info */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="overline" color="text.secondary">
                      วิชา
                    </Typography>
                    <Typography variant="h6">
                      {selectedLock.SubjectCode} - {selectedLock.SubjectName}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Room */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    สถานที่
                  </Typography>
                  <Chip label={selectedLock.room?.RoomName ?? "-"} />
                </Box>

                {/* Timeslots */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    คาบเรียน
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedLock.timeslots.map((slot, index) => (
                      <Chip
                        key={index}
                        size="small"
                        label={`${dayOfWeekThai[slot.DayOfWeek]} คาบ ${slot.TimeslotID.match(/\d+$/)?.[0] || "?"}`}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Divider />

                {/* Classes */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    ชั้นเรียน ({selectedLock.GradeIDs.length} ห้อง)
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedLock.GradeIDs.map((grade, index) => (
                      <Chip
                        key={index}
                        size="small"
                        label={`ม.${grade.toString()[0]}/${grade.toString()[2]}`}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Teachers */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    ครูผู้สอน ({selectedLock.teachers.length} คน)
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {selectedLock.teachers.map((teacher, index) => (
                      <Chip
                        key={index}
                        label={`${teacher.Firstname} ${teacher.Lastname} - ${teacher.Department}`}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => {
                  if (onDeleteLock) {
                    onDeleteLock(selectedLock);
                    handleCloseDialog();
                  }
                }}
              >
                ลบ
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={handleCloseDialog}>ปิด</Button>
              {onEditLock && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    onEditLock(selectedLock);
                    handleCloseDialog();
                  }}
                >
                  แก้ไข
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}

export default LockCalendarView;
