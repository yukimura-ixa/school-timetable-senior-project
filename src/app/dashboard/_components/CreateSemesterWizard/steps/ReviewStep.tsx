"use client";

import React from "react";
import { Box, Typography, Alert } from "@mui/material";
import { useCreateSemester } from "../CreateSemesterContext";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

export function ReviewStep({
  existingSemesters = [],
}: {
  existingSemesters?: SemesterDTO[];
}) {
  const {
    semester,
    academicYear,
    copyFrom,
    copyConfig,
    copyTimeslots,
    timeslotConfig,
  } = useCreateSemester();

  return (
    <Box>
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
              {existingSemesters.find((s) => s.configId === copyFrom)?.configId}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>คัดลอก:</strong>{" "}
              {[copyConfig && "การตั้งค่า", copyTimeslots && "ช่วงเวลา"]
                .filter(Boolean)
                .join(", ") || "ไม่มี"}
            </Typography>
          </>
        )}
        {timeslotConfig && !copyFrom && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>ตารางเรียน:</strong> {timeslotConfig.Days.length} วัน,{" "}
            {timeslotConfig.TimeslotPerDay} คาบต่อวัน
          </Typography>
        )}
      </Box>
      <Alert severity="warning">กรุณาตรวจสอบข้อมูลก่อนสร้างภาคเรียน</Alert>
    </Box>
  );
}
