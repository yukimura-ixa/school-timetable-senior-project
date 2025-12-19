"use client";

/**
 * AddTeacherDialog - Refactored teacher creation dialog
 *
 * Uses FormDialog with proper MUI Dialog accessibility and form semantics.
 * Allows adding multiple teachers at once via dynamic form rows.
 *
 * @see docs/ux/form-dialogs-spec.md
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  MenuItem,
  Alert,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { enqueueSnackbar } from "notistack";
import { FormDialog, FormDialogActions } from "@/components/dialogs/FormDialog";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { createTeachersAction } from "@/features/teacher/application/actions/teacher.actions";

// ==================== Types ====================

interface TeacherFormEntry {
  id: string; // Unique ID for React key
  prefix: string;
  firstname: string;
  lastname: string;
  department: string;
  email: string;
  role: string;
}

interface AddTeacherDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

// ==================== Constants ====================

const PREFIX_OPTIONS = [
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
  { value: "ผศ.", label: "ผศ." },
  { value: "อ.", label: "อ." },
];

const DEPARTMENT_OPTIONS = [
  "คณิตศาสตร์",
  "วิทยาศาสตร์และเทคโนโลยี",
  "ภาษาไทย",
  "ภาษาต่างประเทศ",
  "สังคมศึกษาฯ",
  "ศิลปะ",
  "สุขศึกษาและพลศึกษา",
  "การงานอาชีพ",
];

const ROLE_OPTIONS = [
  { value: "teacher", label: "ครู" },
  { value: "admin", label: "ผู้ดูแลระบบ" },
];

// ==================== Helpers ====================

const INITIAL_TEACHER_ROW_ID = "teacher-0";

function safeRandomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function generateTempTeacherEmail(): string {
  return `teacher_${safeRandomUUID()}@school.local`;
}

function createEmptyTeacher(id: string, email = ""): TeacherFormEntry {
  return {
    id,
    prefix: "นาย",
    firstname: "",
    lastname: "",
    department: "คณิตศาสตร์",
    email,
    role: "teacher",
  };
}

// ==================== Component ====================

export function AddTeacherDialog({
  open,
  onClose,
  onSuccess,
}: AddTeacherDialogProps) {
  const [teachers, setTeachers] = useState<TeacherFormEntry[]>([
    createEmptyTeacher(INITIAL_TEACHER_ROW_ID),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form has unsaved changes
  const isDirty = useMemo(() => {
    if (teachers.length > 1) return true;
    const first = teachers[0];
    return !!(first?.firstname.trim() || first?.lastname.trim());
  }, [teachers]);

  // Add new row
  const handleAddRow = useCallback(() => {
    setTeachers((prev) => [
      ...prev,
      createEmptyTeacher(safeRandomUUID(), generateTempTeacherEmail()),
    ]);
  }, []);

  // Remove row
  const handleRemoveRow = useCallback((id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update field
  const handleFieldChange = useCallback(
    (id: string, field: keyof TeacherFormEntry, value: string) => {
      setTeachers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
      );
      // Clear error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${id}-${field}`];
        return newErrors;
      });
    },
    [],
  );

  // Validate all entries
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    teachers.forEach((teacher) => {
      if (!teacher.firstname.trim()) {
        newErrors[`${teacher.id}-firstname`] = "กรุณากรอกชื่อ";
      }
      if (!teacher.lastname.trim()) {
        newErrors[`${teacher.id}-lastname`] = "กรุณากรอกนามสกุล";
      }
      if (!teacher.email.trim()) {
        newErrors[`${teacher.id}-email`] = "กรุณากรอกอีเมล";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacher.email)) {
        newErrors[`${teacher.id}-email`] = "รูปแบบอีเมลไม่ถูกต้อง";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [teachers]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await createTeachersAction(
        teachers.map((t) => ({
          Prefix: t.prefix,
          Firstname: t.firstname.trim(),
          Lastname: t.lastname.trim(),
          Department: t.department,
          Email: t.email.trim(),
          Role: t.role,
        })),
      );

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "เกิดข้อผิดพลาด";
        throw new Error(errorMessage);
      }

      enqueueSnackbar(`เพิ่มครู ${teachers.length} คนสำเร็จ`, {
        variant: "success",
      });
      onSuccess();
      onClose();
    } catch (error) {
      enqueueSnackbar(
        `เพิ่มครูไม่สำเร็จ: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setTeachers([
        createEmptyTeacher(INITIAL_TEACHER_ROW_ID, generateTempTeacherEmail()),
      ]);
      setErrors({});
    }
  }, [open]);

  return (
    <form onSubmit={handleSubmit}>
      <FormDialog
        open={open}
        onClose={onClose}
        title="เพิ่มรายชื่อครู"
        description={`กำลังเพิ่ม ${teachers.length} รายการ`}
        size="lg"
        dirty={isDirty}
        loading={isSubmitting}
      >
        {/* Add Row Button */}
        <Stack direction="row" justifyContent="flex-end" mb={2}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
            size="small"
          >
            เพิ่มรายการ
          </Button>
        </Stack>

        {/* Teacher Rows */}
        <Stack spacing={3}>
          {teachers.map((teacher, index) => (
            <Box
              key={teacher.id}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                position: "relative",
              }}
            >
              {/* Row Header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  รายการที่ {index + 1}
                </Typography>
                {teachers.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRow(teacher.id)}
                    aria-label="ลบรายการ"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                )}
              </Stack>

              {/* Form Fields - 2 Column Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {/* Prefix */}
                <TextField
                  select
                  label="คำนำหน้าชื่อ"
                  value={teacher.prefix}
                  onChange={(e) =>
                    handleFieldChange(teacher.id, "prefix", e.target.value)
                  }
                  size="small"
                  required
                >
                  {PREFIX_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Department */}
                <TextField
                  select
                  label="กลุ่มสาระ"
                  value={teacher.department}
                  onChange={(e) =>
                    handleFieldChange(teacher.id, "department", e.target.value)
                  }
                  size="small"
                >
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Firstname */}
                <TextField
                  label="ชื่อ"
                  value={teacher.firstname}
                  onChange={(e) =>
                    handleFieldChange(teacher.id, "firstname", e.target.value)
                  }
                  size="small"
                  required
                  error={!!errors[`${teacher.id}-firstname`]}
                  helperText={errors[`${teacher.id}-firstname`]}
                  inputProps={{ "data-testid": `firstname-${index}` }}
                />

                {/* Lastname */}
                <TextField
                  label="นามสกุล"
                  value={teacher.lastname}
                  onChange={(e) =>
                    handleFieldChange(teacher.id, "lastname", e.target.value)
                  }
                  size="small"
                  required
                  error={!!errors[`${teacher.id}-lastname`]}
                  helperText={errors[`${teacher.id}-lastname`]}
                  inputProps={{ "data-testid": `lastname-${index}` }}
                />

                {/* Email - Full Width */}
                <TextField
                  label="อีเมล"
                  type="email"
                  value={teacher.email}
                  onChange={(e) =>
                    handleFieldChange(teacher.id, "email", e.target.value)
                  }
                  size="small"
                  required
                  error={!!errors[`${teacher.id}-email`]}
                  helperText={errors[`${teacher.id}-email`]}
                  sx={{ gridColumn: { sm: "span 2" } }}
                  inputProps={{ "data-testid": `email-${index}` }}
                />

                {/* Role */}
                <TextField
                  select
                  label="บทบาท"
                  value={teacher.role}
                  onChange={(e) =>
                    handleFieldChange(teacher.id, "role", e.target.value)
                  }
                  size="small"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน
          </Alert>
        )}

        {/* Actions */}
        <FormDialogActions>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <SubmitButton data-testid="add-teacher-submit">
            เพิ่มครู ({teachers.length} คน)
          </SubmitButton>
        </FormDialogActions>
      </FormDialog>
    </form>
  );
}

export default AddTeacherDialog;
