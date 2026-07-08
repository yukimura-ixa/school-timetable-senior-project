"use client";
import React, { useState } from "react";
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useTimeslots } from "@/hooks";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { formatGradeIdDisplay } from "@/utils/grade-display";
import type { timeslot } from "@/prisma/generated/client";
import { LOCK_TYPE_CONFIG, getLockType, reservedHatch } from "./lockTypeConfig";

interface LockCalendarViewProps {
  lockData: GroupedLockedSchedule[];
  academicYear: number;
  semester: number;
  onEditLock?: (lock: GroupedLockedSchedule) => void;
  onDeleteLock?: (lock: GroupedLockedSchedule) => void;
}

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
  const timeslotGrid = (() => {
    if (!timeslotsData.data) return null;

    const days = ["MON", "TUE", "WED", "THU", "FRI"];
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
  })();

  // Map locks to timeslot grid
  const lockMap = (() => {
    const map: Record<string, GroupedLockedSchedule> = {};

    lockData.forEach((lock) => {
      lock.timeslots.forEach((timeslot) => {
        map[timeslot.TimeslotID] = lock;
      });
    });

    return map;
  })();

  const handleLockClick = (lock: GroupedLockedSchedule) => {
    setSelectedLock(lock);
  };

  const handleCloseDialog = () => {
    setSelectedLock(null);
  };

  if (timeslotsData.isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography
          sx={{
            color: "text.secondary",
          }}
        >
          กำลังโหลดตารางเรียน...
        </Typography>
      </Box>
    );
  }

  if (!timeslotGrid) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography
          sx={{
            color: "text.secondary",
          }}
        >
          ไม่พบข้อมูลตารางเรียน กรุณาตั้งค่าตารางเรียนก่อน
        </Typography>
      </Box>
    );
  }

  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const maxPeriods = Math.max(
    ...days.map((day) => Object.keys(timeslotGrid[day] || {}).length),
  );
  const periods: number[] = Array.from({ length: maxPeriods }, (_, i) => i + 1);

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Calendar Grid */}
        <Box
          data-testid="lock-grid"
          sx={{
            display: "grid",
            gridTemplateColumns: `80px repeat(${periods.length}, 1fr)`,
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
          {periods.map((period) => (
            <Paper
              key={period}
              elevation={0}
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: "primary.lighter",
                fontWeight: "bold",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                }}
              >
                คาบ {period}
              </Typography>
            </Paper>
          ))}

          {/* Day Rows */}
          {days.map((day) => (
            <React.Fragment key={day}>
              {/* Day Label */}
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
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "medium",
                  }}
                >
                  {dayOfWeekThai[day]}
                </Typography>
              </Paper>

              {/* Period Cells */}
              {periods.map((period) => {
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
                      backgroundImage:
                        lock && config
                          ? reservedHatch(config.borderColor)
                          : "none",
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
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.disabled",
                          }}
                        >
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
                    <Typography
                      variant="overline"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
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
                    gutterBottom
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    สถานที่
                  </Typography>
                  <Chip label={selectedLock.room?.RoomName ?? "-"} />
                </Box>

                {/* Timeslots */}
                <Box>
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{
                      color: "text.secondary",
                    }}
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
                    gutterBottom
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    ชั้นเรียน ({selectedLock.GradeIDs.length} ห้อง)
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedLock.GradeIDs.map((grade, index) => (
                      <Chip
                        key={index}
                        size="small"
                        label={formatGradeIdDisplay(grade)}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Teachers */}
                <Box>
                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{
                      color: "text.secondary",
                    }}
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
