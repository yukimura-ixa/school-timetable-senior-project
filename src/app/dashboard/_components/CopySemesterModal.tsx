"use client";

/**
 * Copy Semester Modal
 * Quick modal for copying semesters
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { copySemesterAction } from "@/features/semester/application/actions/semester.actions";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";
import { getBangkokThaiBuddhistYear } from "@/utils/datetime";

type Props = {
  open: boolean;
  onClose: () => void;
  sourceSemester: SemesterDTO | null;
  onSuccess: (semester: SemesterDTO) => void;
};

export function CopySemesterModal({
  open,
  onClose,
  sourceSemester,
  onSuccess,
}: Props) {
  const [targetYear, setTargetYear] = useState(getBangkokThaiBuddhistYear());
  const [targetSemester, setTargetSemester] = useState(1);
  const [copyConfig, setCopyConfig] = useState(true);
  const [copyTimeslots, setCopyTimeslots] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    if (!sourceSemester) return;

    setLoading(true);
    try {
      const result = await copySemesterAction({
        sourceConfigId: sourceSemester.configId,
        targetAcademicYear: targetYear,
        targetSemester,
        copyConfig,
        copyTimeslots,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to copy semester");
      }

      enqueueSnackbar("คัดลอกภาคเรียนสำเร็จ", { variant: "success" });
      onSuccess(result.data);
      onClose();
    } catch (error: any) {
      enqueueSnackbar(error.message || "เกิดข้อผิดพลาดในการคัดลอก", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>คัดลอกภาคเรียน</DialogTitle>
      <DialogContent>
        {sourceSemester && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              คัดลอกจาก: ภาคเรียนที่ {sourceSemester.semester}/
              {sourceSemester.academicYear}
            </Alert>

            <TextField
              fullWidth
              label="ปีการศึกษาใหม่"
              type="number"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>ภาคเรียนใหม่</InputLabel>
              <Select
                value={targetSemester}
                label="ภาคเรียนใหม่"
                onChange={(e) => setTargetSemester(Number(e.target.value))}
              >
                <MenuItem value={1}>ภาคเรียนที่ 1</MenuItem>
                <MenuItem value={2}>ภาคเรียนที่ 2</MenuItem>
              </Select>
            </FormControl>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={copyConfig}
                    onChange={(e) => setCopyConfig(e.target.checked)}
                  />
                }
                label="คัดลอกการตั้งค่า"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={copyTimeslots}
                    onChange={(e) => setCopyTimeslots(e.target.checked)}
                  />
                }
                label="คัดลอกช่วงเวลา"
              />
            </FormGroup>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleCopy}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          คัดลอก
        </Button>
      </DialogActions>
    </Dialog>
  );
}
