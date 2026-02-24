"use client";

import React, { useState } from "react";
import { SubjectCategory, ActivityType } from "@/prisma/generated/client";
import {
  createSubjectAction,
  updateSubjectAction,
} from "@/features/subject/application/actions/subject.actions";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export default function ActivityModal({
  open,
  onClose,
  editActivity,
}: {
  open: boolean;
  onClose: (shouldRefresh: boolean) => void;
  editActivity?: {
    SubjectCode?: string;
    SubjectName?: string;
    ActivityType?: string | null;
    IsGraded?: boolean;
  } | null;
}) {
  const [form, setForm] = useState({
    SubjectCode: editActivity?.SubjectCode ?? "",
    SubjectName: editActivity?.SubjectName ?? "",
    ActivityType: editActivity?.ActivityType ?? "CLUB",
    IsGraded: editActivity?.IsGraded ?? false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, IsGraded: e.target.checked });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    if (!form.SubjectCode || !form.SubjectName) {
      setError("กรุณากรอกรหัสวิชาและชื่อวิชา");
      setSubmitting(false);
      return;
    }
    try {
      if (editActivity?.SubjectCode) {
        await updateSubjectAction({
          SubjectCode: form.SubjectCode,
          SubjectName: form.SubjectName,
          Category: SubjectCategory.ACTIVITY,
          ActivityType: form.ActivityType,
          IsGraded: form.IsGraded,
          Credit: "CREDIT_05", // default for activities
          LearningArea: null,
          Description: "",
        });
      } else {
        await createSubjectAction({
          SubjectCode: form.SubjectCode,
          SubjectName: form.SubjectName,
          Category: SubjectCategory.ACTIVITY,
          ActivityType: form.ActivityType,
          IsGraded: form.IsGraded,
          Credit: "CREDIT_05", // default for activities
          LearningArea: null,
          Description: "",
        });
      }
      onClose(true); // true = should refresh
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      setError(errorMessage);
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>
        {editActivity ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรม"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="รหัสวิชา"
          name="SubjectCode"
          value={form.SubjectCode}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="ชื่อวิชา"
          name="SubjectName"
          value={form.SubjectName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          select
          label="ประเภทกิจกรรม"
          name="ActivityType"
          value={form.ActivityType}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          {Object.values(ActivityType).map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Checkbox checked={form.IsGraded} onChange={handleCheckbox} />
          }
          label="มีเกรด"
        />
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={submitting}>
          ยกเลิก
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          disabled={submitting}
          variant="contained"
          color="primary"
        >
          {editActivity ? "บันทึก" : "เพิ่ม"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
