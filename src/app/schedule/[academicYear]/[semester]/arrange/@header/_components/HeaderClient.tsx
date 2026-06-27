/**
 * Header Client Component
 *
 * Receives server-fetched data and handles client-side interactions:
 * - Teacher selection (Autocomplete)
 * - Tab navigation
 * - Action buttons (Save, Undo, Redo)
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Autocomplete,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  AutoFixHigh as AutoFixHighIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import { autoArrangeAction } from "@/features/arrange/application/actions/auto-arrange.action";
import { useAutoArrangeResult } from "../../_lib/auto-arrange-result.store";

type Teacher = {
  TeacherID: number;
  Prefix: string;
  Firstname: string;
  Lastname: string;
  Department: string | null;
  Role: string;
};

type Grade = {
  GradeID: string;
  GradeLabel: string;
};

type Props = {
  teachers: Teacher[];
  grades: Grade[];
  selectedTeacher?: string;
  selectedGrade?: string;
  /** "teacher" (default) | "class" */
  view?: string;
  academicYear: string;
  semester: string;
};

export function HeaderClient({
  teachers,
  grades,
  selectedTeacher,
  selectedGrade,
  view,
  academicYear,
  semester,
}: Props) {
  const router = useRouter();
  const isClassView = view === "class";
  const arrangeBase = `/schedule/${academicYear}/${semester}/arrange`;
  const [autoArrangeLoading, setAutoArrangeLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });
  const setAutoArrangeResult = useAutoArrangeResult((s) => s.setResult);

  async function handleAutoArrange() {
    if (!selectedTeacher) {
      setSnackbar({
        open: true,
        message: "กรุณาเลือกครูก่อนจัดตารางอัตโนมัติ",
        severity: "warning",
      });
      return;
    }

    setAutoArrangeLoading(true);
    try {
      const result = await autoArrangeAction({
        academicYear: Number(academicYear),
        semester,
        teacherId: Number(selectedTeacher),
      });

      if (!result.success) {
        const failureMsg = result.failures?.length
          ? `\n${result.failures.map((f) => `- ${f.subjectCode}: ${f.reason}`).join("\n")}`
          : "";
        setSnackbar({
          open: true,
          message: `จัดตารางไม่สำเร็จ: ${result.message || "เกิดข้อผิดพลาด"}${failureMsg}`,
          severity: "error",
        });
        setAutoArrangeResult(result.failures ?? []);
        setAutoArrangeLoading(false);
        return;
      }

      const { stats } = result;
      setAutoArrangeResult(result.failures);
      setSnackbar({
        open: true,
        message: `✅ จัดตารางสำเร็จ ${stats.successfullyPlaced} คาบ${stats.failed > 0 ? ` (ไม่สำเร็จ ${stats.failed} คาบ)` : ""} (${stats.durationMs}ms)`,
        severity: stats.failed > 0 ? "warning" : "success",
      });

      // Refresh server components (palette unplaced count) + bust SWR cache in grid
      router.refresh();
      window.dispatchEvent(new Event("schedule-updated"));
      setAutoArrangeLoading(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : "Unknown"}`,
        severity: "error",
      });
      setAutoArrangeLoading(false);
    }
  }

  // Find selected teacher / grade objects
  const teacherObj = teachers.find(
    (t) => t.TeacherID === Number(selectedTeacher),
  );
  const gradeObj = grades.find((g) => g.GradeID === selectedGrade) ?? null;

  const handleTeacherChange = (
    _: React.SyntheticEvent,
    value: Teacher | null,
  ) => {
    if (value) router.push(`${arrangeBase}?teacher=${value.TeacherID}`);
  };

  const handleGradeChange = (_: React.SyntheticEvent, value: Grade | null) => {
    if (value) router.push(`${arrangeBase}?view=class&grade=${value.GradeID}`);
  };

  const handleViewChange = (
    _: React.MouseEvent<HTMLElement>,
    next: string | null,
  ) => {
    if (!next || next === (isClassView ? "class" : "teacher")) return;
    if (next === "class") {
      router.push(
        `${arrangeBase}?view=class${selectedGrade ? `&grade=${selectedGrade}` : ""}`,
      );
    } else {
      router.push(
        selectedTeacher
          ? `${arrangeBase}?teacher=${selectedTeacher}`
          : arrangeBase,
      );
    }
  };

  return (
    <Stack spacing={2}>
      {/* View toggle: teacher arrangement vs read-only class view */}
      <ToggleButtonGroup
        exclusive
        size="small"
        value={isClassView ? "class" : "teacher"}
        onChange={handleViewChange}
        aria-label="มุมมองตาราง"
      >
        <ToggleButton value="teacher" data-testid="view-toggle-teacher">
          <PersonIcon fontSize="small" sx={{ mr: 0.5 }} /> มุมมองครู
        </ToggleButton>
        <ToggleButton value="class" data-testid="view-toggle-class">
          <GroupsIcon fontSize="small" sx={{ mr: 0.5 }} /> มุมมองชั้นเรียน
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Selector: teacher (arrange) or grade (read-only) by view */}
      <Box>
        {isClassView ? (
          <Autocomplete
            value={gradeObj}
            onChange={handleGradeChange}
            options={grades}
            getOptionLabel={(g) => g?.GradeLabel ?? ""}
            isOptionEqualToValue={(o, v) => o.GradeID === v.GradeID}
            renderOption={(props, g) => {
              const { key, ...optionProps } = props;
              return (
                <li
                  key={key}
                  {...optionProps}
                  data-testid={`grade-option-${g.GradeID}`}
                >
                  {g.GradeLabel}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="เลือกชั้นเรียน"
                placeholder="ค้นหาชั้นเรียน..."
              />
            )}
            sx={{ width: "100%", maxWidth: 400 }}
          />
        ) : (
          <Autocomplete
            value={teacherObj || null}
            onChange={handleTeacherChange}
            options={teachers}
            getOptionLabel={(teacher) =>
              teacher?.Prefix !== undefined
                ? `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname} (${teacher.Department || "ไม่ระบุ"})`
                : ""
            }
            isOptionEqualToValue={(o, v) => o.TeacherID === v.TeacherID}
            renderOption={(props, teacher) => {
              const { key, ...optionProps } = props;
              return (
                <li
                  key={key}
                  {...optionProps}
                  data-testid={`teacher-option-${teacher.TeacherID}`}
                >
                  {`${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname} (${teacher.Department || "ไม่ระบุ"})`}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label="เลือกครู" placeholder="ค้นหาครู..." />
            )}
            sx={{ width: "100%", maxWidth: 400 }}
          />
        )}
      </Box>

      {/* Actions (teacher view only — class view is read-only) */}
      {!isClassView && (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={
                autoArrangeLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <AutoFixHighIcon />
                )
              }
              onClick={handleAutoArrange}
              disabled={autoArrangeLoading || !selectedTeacher}
            >
              {autoArrangeLoading ? "กำลังจัด..." : "จัดอัตโนมัติ"}
            </Button>
          </Stack>
        </Box>
      )}

      {/* Auto-arrange feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
