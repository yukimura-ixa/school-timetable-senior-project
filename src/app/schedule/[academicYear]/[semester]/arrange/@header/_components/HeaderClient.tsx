/**
 * Header Client Component
 *
 * Receives server-fetched data and handles client-side interactions:
 * - Teacher selection (Autocomplete)
 * - Tab navigation
 * - Action buttons (Save, Undo, Redo)
 */

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Autocomplete,
  TextField,
  Tabs,
  Tab,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { AutoFixHigh as AutoFixHighIcon } from "@mui/icons-material";

type Teacher = {
  TeacherID: number;
  Prefix: string;
  Firstname: string;
  Lastname: string;
  Department: string | null;
  Role: string;
};

type GradeLevel = {
  GradeID: string;
  Year: number;
  Number: number;
  GradeName: string;
};

type Props = {
  teachers: Teacher[];
  gradeLevels: GradeLevel[];
  gradeCounts: Record<number, number>;
  selectedTeacher?: string;
  currentTab: string;
  academicYear: string;
  semester: string;
};

export function HeaderClient({
  teachers,
  gradeLevels: _gradeLevels,
  gradeCounts,
  selectedTeacher,
  currentTab,
  academicYear,
  semester,
}: Props) {
  const router = useRouter();
  const [autoArrangeLoading, setAutoArrangeLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });

  const handleAutoArrange = useCallback(async () => {
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
      const res = await fetch("/api/schedule/auto-arrange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYear: Number(academicYear),
          semester,
          teacherId: Number(selectedTeacher),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const failureMsg = data.failures?.length
          ? `\n${data.failures.map((f: { subjectCode: string; reason: string }) => `- ${f.subjectCode}: ${f.reason}`).join("\n")}`
          : "";
        setSnackbar({
          open: true,
          message: `จัดตารางไม่สำเร็จ: ${data.message || "เกิดข้อผิดพลาด"}${failureMsg}`,
          severity: "error",
        });
        return;
      }

      const { stats } = data;
      setSnackbar({
        open: true,
        message: `✅ จัดตารางสำเร็จ ${stats.successfullyPlaced} คาบ${stats.failed > 0 ? ` (ไม่สำเร็จ ${stats.failed} คาบ)` : ""} (${stats.durationMs}ms)`,
        severity: stats.failed > 0 ? "warning" : "success",
      });

      // Refresh the page to show new placements
      router.refresh();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : "Unknown"}`,
        severity: "error",
      });
    } finally {
      setAutoArrangeLoading(false);
    }
  }, [selectedTeacher, academicYear, semester, router]);

  // Find selected teacher object
  const teacherObj = teachers.find(
    (t) => t.TeacherID === Number(selectedTeacher),
  );

  const handleTeacherChange = (
    _: React.SyntheticEvent,
    value: Teacher | null,
  ) => {
    if (value) {
      router.push(
        `/schedule/${academicYear}/${semester}/arrange?teacher=${value.TeacherID}&tab=${currentTab}`,
      );
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newTab: string) => {
    const queryParams = new URLSearchParams();
    if (selectedTeacher) queryParams.set("teacher", selectedTeacher);
    queryParams.set("tab", newTab);
    router.push(
      `/schedule/${academicYear}/${semester}/arrange?${queryParams.toString()}`,
    );
  };

  return (
    <Stack spacing={2}>
      {/* Teacher Selector */}
      <Box>
        <Autocomplete
          value={teacherObj || null}
          onChange={handleTeacherChange}
          options={teachers}
          getOptionLabel={(teacher) =>
            `${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname} (${teacher.Department || "ไม่ระบุ"})`
          }
          renderOption={(props, teacher) => (
            <li
              {...props}
              key={teacher.TeacherID}
              data-testid={`teacher-option-${teacher.TeacherID}`}
            >
              {`${teacher.Prefix}${teacher.Firstname} ${teacher.Lastname} (${teacher.Department || "ไม่ระบุ"})`}
            </li>
          )}
          renderInput={(params) => (
            <TextField {...params} label="เลือกครู" placeholder="ค้นหาครู..." />
          )}
          sx={{ width: "100%", maxWidth: 400 }}
        />
      </Box>

      {/* Tabs + Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Grade Level Tabs */}
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="ครู" value="teacher" />
          <Tab label={`ม.1 (${gradeCounts[1] || 0})`} value="grade1" />
          <Tab label={`ม.2 (${gradeCounts[2] || 0})`} value="grade2" />
          <Tab label={`ม.3 (${gradeCounts[3] || 0})`} value="grade3" />
          <Tab label={`ม.4 (${gradeCounts[4] || 0})`} value="grade4" />
          <Tab label={`ม.5 (${gradeCounts[5] || 0})`} value="grade5" />
          <Tab label={`ม.6 (${gradeCounts[6] || 0})`} value="grade6" />
        </Tabs>

        {/* Action Buttons */}
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
          {/* TODO: Re-enable when arrangement store supports undo/redo/save */}
        </Stack>
      </Box>

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
