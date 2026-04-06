"use client";

import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useCreateSemester } from "../CreateSemesterContext";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

export function CopyPreviousStep({
  existingSemesters = [],
}: {
  existingSemesters?: SemesterDTO[];
}) {
  const {
    copyFrom,
    setCopyFrom,
    copyConfig,
    setCopyConfig,
    copyTimeslots,
    setCopyTimeslots,
  } = useCreateSemester();

  return (
    <Box>
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
          {existingSemesters
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
}
