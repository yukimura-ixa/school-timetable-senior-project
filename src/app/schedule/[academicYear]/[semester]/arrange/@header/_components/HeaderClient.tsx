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
} from "@mui/material";
import { AutoFixHigh as AutoFixHighIcon } from "@mui/icons-material";
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

type Props = {
  teachers: Teacher[];
  selectedTeacher?: string;
  academicYear: string;
  semester: string;
};

export function HeaderClient({
  teachers,
  selectedTeacher,
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
    } catch (err) {
      setSnackbar({
        open: true,
        message: `เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : "Unknown"}`,
        severity: "error",
      });
    } finally {
      setAutoArrangeLoading(false);
    }
  }

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
        `/schedule/${academicYear}/${semester}/arrange?teacher=${value.TeacherID}`,
      );
    }
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
      </Box>

      {/* Actions */}
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
