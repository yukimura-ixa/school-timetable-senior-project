"use client";
import React, { useState, useMemo, useEffect } from "react";
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
import type { teacher, subject, gradelevel } from "@/prisma/generated/client";
import { enqueueSnackbar } from "notistack";
import {
  syncAssignmentsAction,
  deleteAssignmentAction,
} from "@/features/assign/application/actions/assign.actions";
import {
  syncAssignmentsSchema,
  type ResponsibilityInput,
} from "@/features/assign/application/schemas/assign.schemas";
import * as v from "valibot";
import { subjectCreditValues } from "@/models/credit-value";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { getSubjectLevelRange } from "@/utils/subject-level";

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
    GradeID: string;
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
  onAssignmentUpdated: _onAssignmentUpdated, // Unused - edit feature disabled (see handleSaveEdit)
  onAssignmentDeleted,
}: QuickAssignmentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<subject | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<gradelevel[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill weekly hours based on subject credit
  useEffect(() => {
    if (selectedSubject) {
      const rawCredit = selectedSubject.Credit;
      const creditVal =
        subjectCreditValues[rawCredit as keyof typeof subjectCreditValues] ?? 0;
      setWeeklyHours(creditVal * 2);
    } else {
      setWeeklyHours(0);
    }
  }, [selectedSubject]);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingHours, setEditingHours] = useState<number>(0);

  // Check for subject-grade level mismatch (MOE compliance)
  const gradeLevelMismatch = useMemo(() => {
    if (!selectedSubject || selectedGrades.length === 0) return null;

    const levelRange = getSubjectLevelRange(selectedSubject.SubjectCode);
    if (!levelRange) return null;

    const mismatchedGrades = selectedGrades.filter(
      (g) => g.Year < levelRange.minYear || g.Year > levelRange.maxYear,
    );

    if (mismatchedGrades.length === 0) return null;

    return {
      expectedRange: `ม.${levelRange.minYear}-ม.${levelRange.maxYear}`,
      mismatchedGrades: mismatchedGrades.map((g) => `ม.${g.Year}/${g.Number}`),
    };
  }, [selectedSubject, selectedGrades]);

  // Filter out subjects already assigned
  const availableSubjects = useMemo(() => {
    const assignedSubjectCodes = new Set(
      currentAssignments.map((a) => a.SubjectCode),
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
    console.log("QuickAssignmentPanel: Starting handleSubmit...");

    try {
      // Build new assignments to add
      const newAssignments = selectedGrades.map((grade) => {
        const rawCredit = selectedSubject.Credit;
        const creditVal =
          subjectCreditValues[rawCredit as keyof typeof subjectCreditValues] ??
          0;
        const formattedCredit = creditVal.toFixed(1);

        return {
          SubjectCode: selectedSubject.SubjectCode,
          GradeID: grade.GradeID,
          Credit: formattedCredit as ResponsibilityInput["Credit"],
        };
      });

      // Get existing assignments for this teacher/term
      const existingAssignments = currentAssignments.map((assignment) => {
        const subj = subjects.find(
          (s) => s.SubjectCode === assignment.SubjectCode,
        );
        const rawCredit = subj?.Credit;
        const creditVal = rawCredit
          ? (subjectCreditValues[
              rawCredit as keyof typeof subjectCreditValues
            ] ?? 1.0)
          : 1.0;
        const formattedCredit = creditVal.toFixed(1);

        return {
          RespID: parseInt(assignment.RespID),
          SubjectCode: assignment.SubjectCode,
          GradeID: assignment.GradeID,
          Credit: formattedCredit as ResponsibilityInput["Credit"],
        };
      });

      // Combine existing + new for sync action
      const allAssignments = [...existingAssignments, ...newAssignments];

      // Call server action to sync assignments
      const actionResult = await syncAssignmentsAction({
        TeacherID: _teacher.TeacherID,
        AcademicYear: _academicYear,
        Semester: _semester === 1 ? "SEMESTER_1" : "SEMESTER_2",
        Resp: allAssignments,
      });

      if (!actionResult?.success) {
        throw new Error(
          actionResult?.error?.message || "Failed to sync assignments",
        );
      }

      enqueueSnackbar(
        `เพิ่มวิชา ${selectedSubject.SubjectCode} สำเร็จ (${selectedGrades.length} ห้อง)`,
        { variant: "success" },
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
      console.error("QuickAssignmentPanel: Error in handleSubmit:", error);
      enqueueSnackbar(
        `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (assignment: (typeof currentAssignments)[0]) => {
    setEditingId(assignment.RespID);
    setEditingHours(assignment.TeachHour);
  };

  const handleSaveEdit = async (respId: string) => {
    const assignmentToEdit = currentAssignments.find(
      (a) => a.RespID === respId,
    );
    if (!assignmentToEdit) return;

    if (editingHours <= 0 || editingHours > 30) {
      enqueueSnackbar("กรุณาระบุชั่วโมงสอนที่ถูกต้อง (1-30)", {
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Strategy: "Delete + Create" to update
      // 1. Keep other assignments as-is (with RespID)
      // 2. Add edited assignment WITHOUT RespID (treated as new) and with new TeachHour
      const otherAssignments = currentAssignments
        .filter((a) => a.RespID !== respId)
        .map((a) => {
          // Find subject to get Credit (needed for schema validation)
          // If subject not found (unlikely), fallback to 1.0 logic
          let formattedCredit: ResponsibilityInput["Credit"] = "1.0";
          const subj = subjects.find((s) => s.SubjectCode === a.SubjectCode);
          if (subj) {
            const rawCredit = subj.Credit;
            const creditVal =
              subjectCreditValues[
                rawCredit as keyof typeof subjectCreditValues
              ] ?? 1.0;
            formattedCredit = creditVal.toFixed(
              1,
            ) as ResponsibilityInput["Credit"];
          }

          return {
            RespID: parseInt(a.RespID),
            SubjectCode: a.SubjectCode,
            GradeID: a.GradeID,
            Credit: formattedCredit,
            TeachHour: a.TeachHour,
          };
        });

      // Prepare edited item
      let editedCredit: ResponsibilityInput["Credit"] = "1.0";
      const subj = subjects.find(
        (s) => s.SubjectCode === assignmentToEdit.SubjectCode,
      );
      if (subj) {
        const rawCredit = subj.Credit;
        const creditVal =
          subjectCreditValues[rawCredit as keyof typeof subjectCreditValues] ??
          1.0;
        editedCredit = creditVal.toFixed(1) as ResponsibilityInput["Credit"];
      }

      const editedItem: ResponsibilityInput = {
        SubjectCode: assignmentToEdit.SubjectCode,
        GradeID: assignmentToEdit.GradeID,
        Credit: editedCredit,
        TeachHour: editingHours, // Pass manual hours
      };

      // Combine
      const allAssignments = [...otherAssignments, editedItem];

      const result = await syncAssignmentsAction({
        TeacherID: _teacher.TeacherID,
        AcademicYear: _academicYear,
        Semester: _semester === 1 ? "SEMESTER_1" : "SEMESTER_2",
        Resp: allAssignments,
      });

      if (!result?.success) {
        throw new Error(
          result?.error?.message || "Failed to update assignment",
        );
      }

      enqueueSnackbar("บันทึกการแก้ไขสำเร็จ", { variant: "success" });
      setEditingId(null);
      setEditingHours(0);

      // Refresh data
      if (onAssignmentAdded) onAssignmentAdded();
    } catch (error) {
      console.error("Update failed:", error);
      enqueueSnackbar("เกิดข้อผิดพลาดในการบันทึก", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingHours(0);
  };

  const handleDelete = async (assignment: (typeof currentAssignments)[0]) => {
    if (
      !confirm(
        `ต้องการลบวิชา ${assignment.SubjectCode} - ${assignment.SubjectName} ใช่หรือไม่?`,
      )
    ) {
      return;
    }

    try {
      // Call server action to delete assignment
      await deleteAssignmentAction({
        RespID: parseInt(assignment.RespID),
      });

      enqueueSnackbar(`ลบวิชา ${assignment.SubjectCode} สำเร็จ`, {
        variant: "success",
      });

      if (onAssignmentDeleted) {
        onAssignmentDeleted();
      }
    } catch (error) {
      enqueueSnackbar(
        `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" },
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
                  data-testid="subject-autocomplete"
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
                  data-testid="grade-autocomplete"
                  multiple
                  value={selectedGrades}
                  onChange={(_event, newValue) => setSelectedGrades(newValue)}
                  options={grades}
                  getOptionLabel={(option) =>
                    `ม.${option.Year}/${option.Number}`
                  }
                  getOptionKey={(option) => option.GradeID}
                  isOptionEqualToValue={(option, value) =>
                    option.GradeID === value.GradeID
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
                          label={`ม.${option.Year}/${option.Number}`}
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
                  label="ชั่วโมง/สัปดาห์ (คำนวณจากหน่วยกิต)"
                  type="number"
                  value={weeklyHours || ""}
                  onChange={(e) =>
                    setWeeklyHours(parseInt(e.target.value) || 0)
                  }
                  size="small"
                  inputProps={{ min: 0, max: 20 }}
                  disabled={isSubmitting}
                  helperText={
                    selectedSubject
                      ? `หน่วยกิต: ${subjectCreditValues[selectedSubject.Credit as keyof typeof subjectCreditValues] || 0}`
                      : ""
                  }
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

              {/* MOE Compliance Warning */}
              {gradeLevelMismatch && (
                <Alert
                  severity="warning"
                  sx={{ mt: 2 }}
                  icon={<WarningAmberIcon />}
                >
                  <strong>⚠️ ไม่ตรงตามหลักสูตร:</strong> วิชา{" "}
                  {selectedSubject?.SubjectCode} เป็นวิชาสำหรับ{" "}
                  {gradeLevelMismatch.expectedRange} แต่เลือกชั้น{" "}
                  {gradeLevelMismatch.mismatchedGrades.join(", ")}{" "}
                  ซึ่งอยู่นอกช่วงระดับชั้นที่กำหนด
                </Alert>
              )}

              {/* Validation Hints */}
              {(selectedSubject ||
                selectedGrades.length > 0 ||
                weeklyHours > 0) && (
                <Alert
                  severity={gradeLevelMismatch ? "warning" : "info"}
                  sx={{ mt: gradeLevelMismatch ? 1 : 2 }}
                  icon={<CheckCircleIcon />}
                >
                  {!selectedSubject && "• เลือกวิชาที่ต้องการมอบหมาย"}
                  {selectedSubject &&
                    selectedGrades.length === 0 &&
                    "• เลือกชั้นเรียน"}
                  {selectedSubject &&
                    selectedGrades.length > 0 &&
                    weeklyHours <= 0 &&
                    "• ระบุจำนวนชั่วโมงต่อสัปดาห์"}
                  {selectedSubject &&
                    selectedGrades.length > 0 &&
                    weeklyHours > 0 &&
                    `✓ พร้อมเพิ่ม: ${selectedSubject.SubjectCode} ให้ ${selectedGrades.length} ห้อง ห้องละ ${weeklyHours} ชม. (รวมเพิ่ม ${weeklyHours * selectedGrades.length} ชม.)`}
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
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "flex-end",
                            }}
                          >
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                void handleSaveEdit(assignment.RespID);
                              }}
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={handleCancelEdit}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "flex-end",
                            }}
                          >
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
