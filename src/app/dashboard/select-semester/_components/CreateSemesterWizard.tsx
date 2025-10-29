"use client";

/**
 * Create Semester Wizard
 * 3-step wizard for creating new semesters
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { createSemesterAction } from "@/features/semester/application/actions/semester.actions";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (semester: SemesterDTO) => void;
  existingSemesters?: SemesterDTO[];
};

const STEPS = ["ข้อมูลพื้นฐาน", "คัดลอกจากภาคเรียนก่อนหน้า", "ตรวจสอบและสร้าง"];

export function CreateSemesterWizard({
  open,
  onClose,
  onSuccess,
  existingSemesters,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + 543);
  const [semester, setSemester] = useState(1);

  // Step 2: Copy from previous
  const [copyFrom, setCopyFrom] = useState<string>("");
  const [copyConfig, setCopyConfig] = useState(true);
  const [copyTimeslots, setCopyTimeslots] = useState(true);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setAcademicYear(new Date().getFullYear() + 543);
    setSemester(1);
    setCopyFrom("");
    setCopyConfig(true);
    setCopyTimeslots(true);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const result = await createSemesterAction({
        academicYear,
        semester,
        copyFromConfigId: copyFrom || undefined,
        copyConfig: copyFrom ? copyConfig : undefined,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to create semester");
      }

      enqueueSnackbar("สร้างภาคเรียนสำเร็จ", { variant: "success" });
      onSuccess(result.data);
      handleReset();
      onClose();
    } catch (error: any) {
      enqueueSnackbar(error.message || "เกิดข้อผิดพลาดในการสร้างภาคเรียน", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="ปีการศึกษา"
              type="number"
              value={academicYear}
              onChange={(e) => setAcademicYear(Number(e.target.value))}
              sx={{ mb: 2 }}
              helperText="พ.ศ. (เช่น 2567)"
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>ภาคเรียน</InputLabel>
              <Select
                value={semester}
                label="ภาคเรียน"
                onChange={(e) => setSemester(Number(e.target.value))}
              >
                <MenuItem value={1}>ภาคเรียนที่ 1</MenuItem>
                <MenuItem value={2}>ภาคเรียนที่ 2</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">
              จะสร้างภาคเรียนที่ {semester}/{academicYear}
            </Alert>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              เลือกภาคเรียนที่ต้องการคัดลอกค่าตั้งต้น (ไม่บังคับ)
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>คัดลอกจาก</InputLabel>
              <Select
                value={copyFrom}
                label="คัดลอกจาก"
                onChange={(e) => setCopyFrom(e.target.value)}
              >
                <MenuItem value="">ไม่คัดลอก (เริ่มต้นใหม่)</MenuItem>
                {(existingSemesters || [])
                  .filter((s) => s.status !== "ARCHIVED")
                  .map((s) => (
                    <MenuItem key={s.configId} value={s.configId}>
                      ภาคเรียนที่ {s.semester}/{s.academicYear} - {s.status}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {copyFrom && (
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={copyConfig}
                      onChange={(e) => setCopyConfig(e.target.checked)}
                    />
                  }
                  label="คัดลอกการตั้งค่าตารางเรียน"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={copyTimeslots}
                      onChange={(e) => setCopyTimeslots(e.target.checked)}
                    />
                  }
                  label="คัดลอกช่วงเวลา (Timeslots)"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  หมายเหตุ: ข้อมูลครู นักเรียน และวิชาจะไม่ถูกคัดลอก
                </Typography>
              </FormGroup>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              ตรวจสอบข้อมูล
            </Typography>
            <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>ภาคเรียน:</strong> {semester}/{academicYear}
              </Typography>
              {copyFrom && (
                <>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>คัดลอกจาก:</strong>{" "}
                    {(existingSemesters || []).find((s) => s.configId === copyFrom)?.configId}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>คัดลอก:</strong>{" "}
                    {[
                      copyConfig && "การตั้งค่า",
                      copyTimeslots && "ช่วงเวลา",
                    ]
                      .filter(Boolean)
                      .join(", ") || "ไม่มี"}
                  </Typography>
                </>
              )}
            </Box>
            <Alert severity="warning">
              กรุณาตรวจสอบข้อมูลก่อนสร้างภาคเรียน
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>สร้างภาคเรียนใหม่</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            ย้อนกลับ
          </Button>
        )}
        {activeStep < STEPS.length - 1 ? (
          <Button onClick={handleNext} variant="contained">
            ถัดไป
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            สร้างภาคเรียน
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
