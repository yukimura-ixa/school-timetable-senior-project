"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { RoomAutocomplete } from "@/components/room";
import type { room } from "@/prisma/generated/client";
import { enqueueSnackbar } from "notistack";
import { createBulkLocksAction } from "@/features/lock/application/actions/lock.actions";
import type { semester } from "@/prisma/generated/client";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";

interface BulkLockModalProps {
  open: boolean;
  onClose: () => void;
  // configId may be wired later; keep but mark unused to satisfy lint
  _configId?: string;
  timeslots?: Array<{ TimeslotID: string; Day: string; PeriodStart: number }>;
  grades?: Array<{ GradeID: string; GradeName: string }>;
  subjects?: Array<{
    SubjectCode: string;
    SubjectName: string;
    RespID: number;
  }>;
  rooms?: Array<{
    RoomID: number;
    RoomName: string;
    Building?: string;
    Floor?: string;
  }>;
  onSuccess: () => void;
}

export default function BulkLockModal({
  open,
  onClose,
  _configId,
  timeslots: propTimeslots,
  grades: propGrades,
  subjects: propSubjects,
  rooms: propRooms,
  onSuccess,
}: BulkLockModalProps) {
  // Use props if provided, otherwise empty arrays (component can be extended to fetch data)
  const timeslots = propTimeslots || [];
  const grades = propGrades || [];
  const subjects = propSubjects || [];
  const rooms = propRooms || [];
  const [selectedTimeslots, setSelectedTimeslots] = useState<Set<string>>(
    new Set(),
  );
  const [selectedGrades, setSelectedGrades] = useState<Set<string>>(new Set());
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<{
    RoomID: number;
    RoomName: string;
    Building?: string;
    Floor?: string;
  } | null>(null);
  const normalizedRooms: room[] = useMemo(
    () =>
      rooms.map((r) => ({
        RoomID: r.RoomID,
        RoomName: r.RoomName,
        Building: r.Building ?? "-",
        Floor: r.Floor ?? "-",
        class_schedule: [],
      })),
    [rooms],
  );
  // Derive academic year & semester from first timeslot ID (pattern: "1-2567-MON1")
  const derivedTerm = useMemo(() => {
    if (!propTimeslots || propTimeslots.length === 0) return null;
    const firstId = propTimeslots[0]?.TimeslotID; // e.g. 1-2567-MON1
    if (!firstId) return null;
    const parts = firstId.split("-");
    if (parts.length < 3) return null;
    const semNum = parts[0];
    const yearNum = Number(parts[1]);
    if (!yearNum || (semNum !== "1" && semNum !== "2")) return null;
    const semEnum: semester = semNum === "1" ? "SEMESTER_1" : "SEMESTER_2";
    return { academicYear: yearNum, semester: semEnum };
  }, [propTimeslots]);

  const { availabilityMap } = useRoomAvailability({
    academicYear: derivedTerm?.academicYear,
    semester: derivedTerm?.semester,
    selectedTimeslots: selectedTimeslots,
    enabled: !!derivedTerm,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DAY_NAMES: Record<string, string> = {
    MON: "จันทร์",
    TUE: "อังคาร",
    WED: "พุธ",
    THU: "พฤหัสบดี",
    FRI: "ศุกร์",
  };

  const handleTimeslotToggle = (timeslotId: string) => {
    setSelectedTimeslots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(timeslotId)) {
        newSet.delete(timeslotId);
      } else {
        newSet.add(timeslotId);
      }
      return newSet;
    });
  };

  const handleGradeToggle = (gradeId: string) => {
    setSelectedGrades((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(gradeId)) {
        newSet.delete(gradeId);
      } else {
        newSet.add(gradeId);
      }
      return newSet;
    });
  };

  const handleSelectAllTimeslots = () => {
    if (selectedTimeslots.size === timeslots.length) {
      setSelectedTimeslots(new Set());
    } else {
      setSelectedTimeslots(new Set(timeslots.map((t) => t.TimeslotID)));
    }
  };

  const handleSelectAllGrades = () => {
    if (selectedGrades.size === grades.length) {
      setSelectedGrades(new Set());
    } else {
      setSelectedGrades(new Set(grades.map((g) => g.GradeID)));
    }
  };

  const totalLocks = selectedTimeslots.size * selectedGrades.size;

  const previewData = useMemo(() => {
    const preview: Array<{
      timeslot: string;
      grade: string;
      subject: string;
      room: string;
    }> = [];

    selectedTimeslots.forEach((timeslotId) => {
      const timeslot = timeslots.find((t) => t.TimeslotID === timeslotId);
      selectedGrades.forEach((gradeId) => {
        const grade = grades.find((g) => g.GradeID === gradeId);
        const subject = subjects.find((s) => s.SubjectCode === selectedSubject);
        const room = rooms.find((r) => r.RoomID === selectedRoom?.RoomID);

        if (timeslot && grade && subject && room) {
          preview.push({
            timeslot: `${DAY_NAMES[timeslot.Day]} คาบ ${timeslot.PeriodStart}`,
            grade: grade.GradeName,
            subject: subject.SubjectName,
            room: room.RoomName,
          });
        }
      });
    });

    return preview;
  }, [
    selectedTimeslots,
    selectedGrades,
    selectedSubject,
    selectedRoom,
    timeslots,
    grades,
    subjects,
    rooms,
    DAY_NAMES,
  ]);

  const handleSubmit = async () => {
    if (
      !selectedSubject ||
      !selectedRoom?.RoomID ||
      selectedTimeslots.size === 0 ||
      selectedGrades.size === 0
    ) {
      enqueueSnackbar("กรุณาเลือกข้อมูลให้ครบถ้วน", { variant: "warning" });
      return;
    }

    setIsSubmitting(true);

    try {
      const subject = subjects.find((s) => s.SubjectCode === selectedSubject);
      if (!subject) {
        throw new Error("ไม่พบวิชาที่เลือก");
      }

      const locks = Array.from(selectedTimeslots).flatMap((timeslotId) =>
        Array.from(selectedGrades).map((gradeId) => ({
          SubjectCode: selectedSubject,
          RoomID: selectedRoom.RoomID,
          TimeslotID: timeslotId,
          GradeID: gradeId,
          RespID: subject.RespID,
        })),
      );

      const result = await createBulkLocksAction({ locks });

      if (result.success) {
        enqueueSnackbar(
          `สร้างคาบล็อกสำเร็จ ${result.data?.count || 0} รายการ`,
          { variant: "success" },
        );
        onSuccess();
        handleClose();
      } else {
        const message = result.error?.message || "เกิดข้อผิดพลาด";
        throw new Error(String(message));
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTimeslots(new Set());
    setSelectedGrades(new Set());
    setSelectedSubject("");
    setSelectedRoom(null);
    onClose();
  };

  const canPreview =
    selectedSubject &&
    selectedRoom?.RoomID &&
    selectedTimeslots.size > 0 &&
    selectedGrades.size > 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <LockIcon />
          <Typography variant="h6">ล็อกหลายคาบพร้อมกัน (Bulk Lock)</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Subject Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <TextField
                select
                label="วิชา"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="">เลือกวิชา</option>
                {subjects.map((subject) => (
                  <option key={subject.SubjectCode} value={subject.SubjectCode}>
                    {subject.SubjectCode} - {subject.SubjectName}
                  </option>
                ))}
              </TextField>
            </FormControl>
          </Grid>

          {/* Room Selection (Enhanced) */}
          <Grid size={{ xs: 12, md: 6 }}>
            <RoomAutocomplete
              rooms={normalizedRooms}
              value={
                selectedRoom
                  ? ({
                      RoomID: selectedRoom.RoomID,
                      RoomName: selectedRoom.RoomName,
                      Building: selectedRoom.Building ?? "-",
                      Floor: selectedRoom.Floor ?? "-",
                      class_schedule: [],
                    } as room)
                  : null
              }
              onChange={(room) =>
                setSelectedRoom(
                  room
                    ? {
                        RoomID: room.RoomID,
                        RoomName: room.RoomName,
                        Building: room.Building,
                        Floor: room.Floor,
                      }
                    : null,
                )
              }
              label="ห้องเรียน"
              placeholder="เลือกห้อง"
              availabilityMap={availabilityMap}
              showAvailability
            />
          </Grid>

          {/* Timeslot Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="subtitle1">เลือกคาบเรียน</Typography>
                  <Button size="small" onClick={handleSelectAllTimeslots}>
                    {selectedTimeslots.size === timeslots.length
                      ? "ยกเลิกทั้งหมด"
                      : "เลือกทั้งหมด"}
                  </Button>
                </Stack>
                <FormGroup>
                  {timeslots.map((timeslot) => (
                    <FormControlLabel
                      key={timeslot.TimeslotID}
                      control={
                        <Checkbox
                          checked={selectedTimeslots.has(timeslot.TimeslotID)}
                          onChange={() =>
                            handleTimeslotToggle(timeslot.TimeslotID)
                          }
                        />
                      }
                      label={`${DAY_NAMES[timeslot.Day]} คาบ ${timeslot.PeriodStart}`}
                    />
                  ))}
                </FormGroup>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  เลือกแล้ว: {selectedTimeslots.size} คาบ
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Grade Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="subtitle1">เลือกชั้นเรียน</Typography>
                  <Button size="small" onClick={handleSelectAllGrades}>
                    {selectedGrades.size === grades.length
                      ? "ยกเลิกทั้งหมด"
                      : "เลือกทั้งหมด"}
                  </Button>
                </Stack>
                <FormGroup>
                  {grades.map((grade) => (
                    <FormControlLabel
                      key={grade.GradeID}
                      control={
                        <Checkbox
                          checked={selectedGrades.has(grade.GradeID)}
                          onChange={() => handleGradeToggle(grade.GradeID)}
                        />
                      }
                      label={grade.GradeName}
                    />
                  ))}
                </FormGroup>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  เลือกแล้ว: {selectedGrades.size} ชั้น
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Preview */}
          <Grid size={12}>
            <Alert severity="info" icon={<CheckCircleIcon />}>
              จำนวนคาบล็อกที่จะสร้าง: <strong>{totalLocks} คาบ</strong>
              {totalLocks > 0 && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  ({selectedTimeslots.size} คาบเรียน × {selectedGrades.size}{" "}
                  ชั้น)
                </Typography>
              )}
            </Alert>

            {canPreview &&
              previewData.length > 0 &&
              previewData.length <= 20 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ตัวอย่างคาบล็อก:
                  </Typography>
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ maxHeight: 300 }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>คาบเรียน</TableCell>
                          <TableCell>ชั้น</TableCell>
                          <TableCell>วิชา</TableCell>
                          <TableCell>ห้อง</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previewData.slice(0, 20).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.timeslot}</TableCell>
                            <TableCell>{row.grade}</TableCell>
                            <TableCell>{row.subject}</TableCell>
                            <TableCell>{row.room}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {previewData.length > 20 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      แสดง 20 รายการแรกจาก {previewData.length} รายการทั้งหมด
                    </Typography>
                  )}
                </Box>
              )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          ยกเลิก
        </Button>
        <Button
          onClick={() => {
            void handleSubmit();
          }}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !canPreview}
          startIcon={
            isSubmitting ? <CircularProgress size={20} /> : <LockIcon />
          }
        >
          {isSubmitting ? "กำลังสร้าง..." : `สร้างคาบล็อก ${totalLocks} รายการ`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
