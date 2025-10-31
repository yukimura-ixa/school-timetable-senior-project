"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Alert,
  Collapse,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import type { teacher, subject, gradelevel } from "@/prisma/generated";
import { enqueueSnackbar } from "notistack";

interface QuickAssignmentPanelProps {
  teacher: teacher;
  academicYear: number;
  semester: number;
  subjects: subject[];
  grades: gradelevel[];
  currentAssignments: Array<{
    RespID: string;
    SubjectCode: string;
    SubjectName: string;
    GradeID: number;
    GradeName: string;
    TeachHour: number;
  }>;
  onAssignmentAdded?: () => void;
  onAssignmentUpdated?: () => void;
  onAssignmentDeleted?: () => void;
}

function QuickAssignmentPanel({
  teacher: _teacher,
  academicYear: _academicYear,
  semester: _semester,
  subjects,
  grades,
  currentAssignments,
  onAssignmentAdded,
  onAssignmentUpdated,
  onAssignmentDeleted,
}: QuickAssignmentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<subject | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<gradelevel[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingHours, setEditingHours] = useState<number>(0);

  // Filter out subjects already assigned
  const availableSubjects = useMemo(() => {
    const assignedSubjectCodes = new Set(
      currentAssignments.map((a) => a.SubjectCode)
    );
    return subjects.filter((s) => !assignedSubjectCodes.has(s.SubjectCode));
  }, [subjects, currentAssignments]);

  const handleSubmit = async () => {
    // Validation
    if (!selectedSubject) {
      enqueueSnackbar("กรุณาเลือกวิชา", { variant: "warning" });
      return;
    }
    if (selectedGrades.length === 0) {
      enqueueSnackbar("กรุณาเลือกชั้นเรียนอย่างน้อย 1 ห้อง", {
        variant: "warning",
      });
      return;
    }
    if (weeklyHours <= 0 || weeklyHours > 20) {
      enqueueSnackbar("กรุณาระบุชั่วโมงต่อสัปดาห์ (1-20 ชั่วโมง)", {
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Call server action to create assignment
      // Example: await createTeacherResponsibilityAction({
      //   TeacherID: _teacher.TeacherID,
      //   SubjectCode: selectedSubject.SubjectCode,
      //   GradeIDs: selectedGrades.map(g => g.GradeID),
      //   TeachHour: weeklyHours,
      //   AcademicYear: _academicYear,
      //   Semester: _semester,
      // });
      
      // Temporary: Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      enqueueSnackbar(
        `เพิ่มวิชา ${selectedSubject.SubjectCode} สำเร็จ (${selectedGrades.length} ห้อง)`,
        { variant: "success" }
      );

      // Reset form
      setSelectedSubject(null);
      setSelectedGrades([]);
      setWeeklyHours(0);

      // Callback to refresh data
      if (onAssignmentAdded) {
        onAssignmentAdded();
      }
    } catch (error) {
      enqueueSnackbar(
        `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (assignment: (typeof currentAssignments)[0]) => {
    setEditingId(assignment.RespID);
    setEditingHours(assignment.TeachHour);
  };

  const handleSaveEdit = async (_respId: string) => {
    if (editingHours <= 0 || editingHours > 20) {
      enqueueSnackbar("กรุณาระบุชั่วโมงต่อสัปดาห์ (1-20 ชั่วโมง)", {
        variant: "warning",
      });
      return;
    }

    try {
      // TODO: Call server action to update assignment
      // await updateTeacherResponsibilityAction(_respId, { TeachHour: editingHours });
      
      // Temporary: Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      enqueueSnackbar("อัปเดตชั่วโมงสอนสำเร็จ", { variant: "success" });

      setEditingId(null);
      setEditingHours(0);

      if (onAssignmentUpdated) {
        onAssignmentUpdated();
      }
    } catch (error) {
      enqueueSnackbar(
        `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" }
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingHours(0);
  };

  const handleDelete = async (assignment: (typeof currentAssignments)[0]) => {
    if (
      !confirm(
        `ต้องการลบวิชา ${assignment.SubjectCode} - ${assignment.SubjectName} ใช่หรือไม่?`
      )
    ) {
      return;
    }

    try {
      // TODO: Call server action to delete assignment
      // await deleteTeacherResponsibilityAction(assignment.RespID);
      
      // Temporary: Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      enqueueSnackbar(
        `ลบวิชา ${assignment.SubjectCode} สำเร็จ`,
        { variant: "success" }
      );

      if (onAssignmentDeleted) {
        onAssignmentDeleted();
      }
    } catch (error) {
      enqueueSnackbar(
        `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" }
      );
    }
  };

  return (
    <Paper sx={{ mt: 3 }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "primary.lighter",
          cursor: "pointer",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="h6">มอบหมายวิชาด่วน</Typography>
          <Chip
            label={`${currentAssignments.length} วิชา`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <IconButton size="small">
          {isExpanded ? <CloseIcon /> : <AddIcon />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: 3 }}>
          {/* Quick Add Form */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom color="primary">
                เพิ่มวิชาใหม่
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "2fr 2fr 1fr auto" },
                  gap: 2,
                  alignItems: "start",
                }}
              >
                {/* Subject Autocomplete */}
                <Autocomplete
                  value={selectedSubject}
                  onChange={(_event, newValue) => setSelectedSubject(newValue)}
                  options={availableSubjects}
                  getOptionLabel={(option) =>
                    `${option.SubjectCode} - ${option.SubjectName}`
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="วิชา"
                      placeholder="ค้นหาวิชา..."
                      size="small"
                    />
                  )}
                  disabled={isSubmitting}
                  noOptionsText="ไม่พบวิชาที่ยังไม่ได้มอบหมาย"
                />

                {/* Grade Multi-Select */}
                <Autocomplete
                  multiple
                  value={selectedGrades}
                  onChange={(_event, newValue) => setSelectedGrades(newValue)}
                  options={grades}
                  getOptionLabel={(option) =>
                    `ม.${option.GradeID.toString()[0]}/${option.GradeID.toString()[2]}`
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="ชั้นเรียน"
                      placeholder="เลือกชั้น..."
                      size="small"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...otherProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={`ม.${option.GradeID.toString()[0]}/${option.GradeID.toString()[2]}`}
                          size="small"
                          {...otherProps}
                        />
                      );
                    })
                  }
                  disabled={isSubmitting}
                />

                {/* Weekly Hours Input */}
                <TextField
                  label="ชั่วโมง/สัปดาห์"
                  type="number"
                  value={weeklyHours || ""}
                  onChange={(e) =>
                    setWeeklyHours(parseInt(e.target.value) || 0)
                  }
                  size="small"
                  inputProps={{ min: 0, max: 20 }}
                  disabled={isSubmitting}
                />

                {/* Add Button */}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    void handleSubmit();
                  }}
                  disabled={
                    isSubmitting ||
                    !selectedSubject ||
                    selectedGrades.length === 0 ||
                    weeklyHours <= 0
                  }
                  sx={{ height: 40 }}
                >
                  เพิ่ม
                </Button>
              </Box>

              {/* Validation Hints */}
              {(selectedSubject || selectedGrades.length > 0 || weeklyHours > 0) && (
                <Alert severity="info" sx={{ mt: 2 }} icon={<CheckCircleIcon />}>
                  {!selectedSubject && "• เลือกวิชาที่ต้องการมอบหมาย"}
                  {selectedSubject && selectedGrades.length === 0 && "• เลือกชั้นเรียน"}
                  {selectedSubject &&
                    selectedGrades.length > 0 &&
                    weeklyHours <= 0 &&
                    "• ระบุจำนวนชั่วโมงต่อสัปดาห์"}
                  {selectedSubject &&
                    selectedGrades.length > 0 &&
                    weeklyHours > 0 &&
                    `✓ พร้อมเพิ่ม: ${selectedSubject.SubjectCode} ให้ ${selectedGrades.length} ห้อง (${weeklyHours} ชม./สัปดาห์)`}
                </Alert>
              )}
            </CardContent>
          </Card>

          <Divider sx={{ my: 2 }} />

          {/* Current Assignments Table */}
          <Typography variant="subtitle2" gutterBottom>
            วิชาที่รับผิดชอบปัจจุบัน ({currentAssignments.length} วิชา)
          </Typography>

          {currentAssignments.length === 0 ? (
            <Alert severity="info">
              ยังไม่มีวิชาที่มอบหมาย กรุณาเพิ่มวิชาด้านบน
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>รหัสวิชา</TableCell>
                    <TableCell>ชื่อวิชา</TableCell>
                    <TableCell align="center">ชั้น</TableCell>
                    <TableCell align="center">ชั่วโมง/สัปดาห์</TableCell>
                    <TableCell align="right">จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentAssignments.map((assignment) => (
                    <TableRow
                      key={assignment.RespID}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {assignment.SubjectCode}
                        </Typography>
                      </TableCell>
                      <TableCell>{assignment.SubjectName}</TableCell>
                      <TableCell align="center">
                        <Chip label={assignment.GradeName} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        {editingId === assignment.RespID ? (
                          <TextField
                            type="number"
                            value={editingHours}
                            onChange={(e) =>
                              setEditingHours(parseInt(e.target.value) || 0)
                            }
                            size="small"
                            sx={{ width: 80 }}
                            inputProps={{ min: 1, max: 20 }}
                          />
                        ) : (
                          <Chip
                            label={`${assignment.TeachHour} ชม.`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {editingId === assignment.RespID ? (
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                void handleSaveEdit(assignment.RespID);
                              }}
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleCancelEdit}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(assignment)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                void handleDelete(assignment);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default QuickAssignmentPanel;
