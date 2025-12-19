"use client";

/**
 * AddSubjectDialog - Refactored subject creation dialog
 *
 * Uses FormDialog with proper MUI Dialog accessibility and form semantics.
 * Allows adding multiple subjects at once via dynamic form rows.
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
import { createSubjectAction } from "@/features/subject/application/actions/subject.actions";
import type { subject_credit, SubjectCategory } from "@/prisma/generated/client";
import { subjectCreditTitles } from "@/models/credit-titles";

// ==================== Types ====================

interface SubjectFormEntry {
  id: string;
  subjectCode: string;
  subjectName: string;
  credit: subject_credit | "";
  category: SubjectCategory;
}

interface AddSubjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

// ==================== Constants ====================

const CREDIT_OPTIONS: readonly subject_credit[] = [
  "CREDIT_05",
  "CREDIT_10",
  "CREDIT_15",
  "CREDIT_20",
] as const;

const CATEGORY_OPTIONS = [
  { value: "CORE", label: "พื้นฐาน" },
  { value: "ADDITIONAL", label: "เพิ่มเติม" },
  { value: "ACTIVITY", label: "กิจกรรมพัฒนาผู้เรียน" },
];

// ==================== Helpers ====================

const INITIAL_SUBJECT_ROW_ID = "subject-0";

function safeRandomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createEmptySubject(id: string): SubjectFormEntry {
  return {
    id,
    subjectCode: "",
    subjectName: "",
    credit: "",
    category: "CORE",
  };
}

// ==================== Component ====================

export function AddSubjectDialog({
  open,
  onClose,
  onSuccess,
}: AddSubjectDialogProps) {
  const [subjects, setSubjects] = useState<SubjectFormEntry[]>([
    createEmptySubject(INITIAL_SUBJECT_ROW_ID),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form has unsaved changes
  const isDirty = useMemo(() => {
    if (subjects.length > 1) return true;
    const first = subjects[0];
    return !!(first?.subjectCode.trim() || first?.subjectName.trim());
  }, [subjects]);

  // Add new row
  const handleAddRow = useCallback(() => {
    setSubjects((prev) => [...prev, createEmptySubject(safeRandomUUID())]);
  }, []);

  // Remove row
  const handleRemoveRow = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Update field
  const handleFieldChange = useCallback(
    (id: string, field: keyof SubjectFormEntry, value: string) => {
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
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

    subjects.forEach((subject) => {
      if (!subject.subjectCode.trim()) {
        newErrors[`${subject.id}-subjectCode`] = "กรุณากรอกรหัสวิชา";
      }
      if (!subject.subjectName.trim()) {
        newErrors[`${subject.id}-subjectName`] = "กรุณากรอกชื่อวิชา";
      }
      if (!subject.credit) {
        newErrors[`${subject.id}-credit`] = "กรุณาเลือกหน่วยกิต";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [subjects]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await createSubjectAction({
        subjects: subjects.map((s) => ({
          SubjectCode: s.subjectCode.trim(),
          SubjectName: s.subjectName.trim(),
          Credit: s.credit as subject_credit,
          Category: s.category,
          LearningArea: null,
          ActivityType: null,
          IsGraded: true,
          Description: "",
        })),
      });

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "เกิดข้อผิดพลาด";
        throw new Error(errorMessage);
      }

      enqueueSnackbar(`เพิ่มวิชา ${subjects.length} รายการสำเร็จ`, {
        variant: "success",
      });
      onSuccess();
      onClose();
    } catch (error) {
      enqueueSnackbar(
        `เพิ่มวิชาไม่สำเร็จ: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setSubjects([createEmptySubject(INITIAL_SUBJECT_ROW_ID)]);
      setErrors({});
    }
  }, [open]);

  return (
    <form onSubmit={handleSubmit}>
      <FormDialog
        open={open}
        onClose={onClose}
        title="เพิ่มรายวิชา"
        description={`กำลังเพิ่ม ${subjects.length} รายการ`}
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

        {/* Subject Rows */}
        <Stack spacing={3}>
          {subjects.map((subject, index) => (
            <Box
              key={subject.id}
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
                {subjects.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRow(subject.id)}
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
                {/* Subject Code */}
                <TextField
                  label="รหัสวิชา"
                  placeholder="เช่น ท21101"
                  value={subject.subjectCode}
                  onChange={(e) =>
                    handleFieldChange(subject.id, "subjectCode", e.target.value)
                  }
                  size="small"
                  required
                  error={!!errors[`${subject.id}-subjectCode`]}
                  helperText={errors[`${subject.id}-subjectCode`]}
                  inputProps={{ "data-testid": `subject-code-${index}` }}
                />

                {/* Subject Name */}
                <TextField
                  label="ชื่อวิชา"
                  placeholder="เช่น ภาษาไทย 1"
                  value={subject.subjectName}
                  onChange={(e) =>
                    handleFieldChange(subject.id, "subjectName", e.target.value)
                  }
                  size="small"
                  required
                  error={!!errors[`${subject.id}-subjectName`]}
                  helperText={errors[`${subject.id}-subjectName`]}
                  inputProps={{ "data-testid": `subject-name-${index}` }}
                />

                {/* Credit */}
                <TextField
                  select
                  label="หน่วยกิต"
                  value={subject.credit}
                  onChange={(e) =>
                    handleFieldChange(subject.id, "credit", e.target.value)
                  }
                  size="small"
                  required
                  error={!!errors[`${subject.id}-credit`]}
                  helperText={errors[`${subject.id}-credit`]}
                >
                  <MenuItem value="" disabled>
                    เลือกหน่วยกิต
                  </MenuItem>
                  {CREDIT_OPTIONS.map((credit) => (
                    <MenuItem key={credit} value={credit}>
                      {subjectCreditTitles[credit]}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Category */}
                <TextField
                  select
                  label="สาระการเรียนรู้"
                  value={subject.category}
                  onChange={(e) =>
                    handleFieldChange(subject.id, "category", e.target.value)
                  }
                  size="small"
                  required
                >
                  {CATEGORY_OPTIONS.map((opt) => (
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
          <SubmitButton data-testid="add-subject-submit">
            เพิ่มวิชา ({subjects.length} รายการ)
          </SubmitButton>
        </FormDialogActions>
      </FormDialog>
    </form>
  );
}

export default AddSubjectDialog;
