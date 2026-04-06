"use client";

import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { useCreateSemester } from "../CreateSemesterContext";

export function BasicInfoStep() {
  const { academicYear, setAcademicYear, semester, setSemester } =
    useCreateSemester();

  return (
    <Box>
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
}
