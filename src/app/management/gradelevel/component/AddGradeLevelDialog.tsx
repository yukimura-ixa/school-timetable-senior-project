"use client";

/**
 * AddGradeLevelDialog - Refactored grade level creation dialog
 *
 * Uses FormDialog with proper form semantics and program selection by year.
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
import { createGradeLevelAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
import type { program } from "@/prisma/generated/client";

// ==================== Types ====================

interface GradeLevelFormEntry {
  id: string;
  year: number;
  number: number;
  studentCount: number;
  programId: number | null;
}

interface AddGradeLevelDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  programsByYear: Record<number, program[]>;
}

// ==================== Helpers ====================

const INITIAL_GRADELEVEL_ROW_ID = "gradelevel-0";

function safeRandomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createEmptyGradeLevel(id: string): GradeLevelFormEntry {
  return {
    id,
    year: 1,
    number: 1,
    studentCount: 0,
    programId: null,
  };
}

// ==================== Component ====================

export function AddGradeLevelDialog({
  open,
  onClose,
  onSuccess,
  programsByYear,
}: AddGradeLevelDialogProps) {
  const [gradeLevels, setGradeLevels] = useState<GradeLevelFormEntry[]>([
    createEmptyGradeLevel(INITIAL_GRADELEVEL_ROW_ID),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form has unsaved changes
  const isDirty = useMemo(() => {
    if (gradeLevels.length > 1) return true;
    const first = gradeLevels[0];
    return (
      first?.year !== 1 || first?.number !== 1 || first?.studentCount !== 0
    );
  }, [gradeLevels]);

  // Add new row
  const handleAddRow = useCallback(() => {
    setGradeLevels((prev) => [...prev, createEmptyGradeLevel(safeRandomUUID())]);
  }, []);

  // Remove row
  const handleRemoveRow = useCallback((id: string) => {
    setGradeLevels((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // Update field
  const handleFieldChange = useCallback(
    (id: string, field: keyof GradeLevelFormEntry, value: number | null) => {
      setGradeLevels((prev) =>
        prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
      );
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

    gradeLevels.forEach((grade) => {
      if (grade.year < 1 || grade.year > 6) {
        newErrors[`${grade.id}-year`] = "ชั้นปีต้องอยู่ระหว่าง 1-6";
      }
      if (grade.number < 1 || grade.number > 99) {
        newErrors[`${grade.id}-number`] = "ห้องต้องอยู่ระหว่าง 1-99";
      }
      if (grade.studentCount < 0) {
        newErrors[`${grade.id}-studentCount`] =
          "จำนวนนักเรียนต้องไม่น้อยกว่า 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [gradeLevels]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Create each grade level
      for (const grade of gradeLevels) {
        const result = await createGradeLevelAction({
          Year: grade.year,
          Number: grade.number,
          StudentCount: grade.studentCount,
          ProgramID: grade.programId,
        });

        if (!result.success) {
          throw new Error(
            typeof result.error === "string"
              ? result.error
              : result.error?.message || "เกิดข้อผิดพลาด",
          );
        }
      }

      enqueueSnackbar(`เพิ่มระดับชั้น ${gradeLevels.length} รายการสำเร็จ`, {
        variant: "success",
      });
      onSuccess();
      onClose();
    } catch (error) {
      enqueueSnackbar(
        `เพิ่มระดับชั้นไม่สำเร็จ: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setGradeLevels([createEmptyGradeLevel(INITIAL_GRADELEVEL_ROW_ID)]);
      setErrors({});
    }
  }, [open]);

  return (
    <form onSubmit={handleSubmit}>
      <FormDialog
        open={open}
        onClose={onClose}
        title="เพิ่มระดับชั้น"
        description={`กำลังเพิ่ม ${gradeLevels.length} รายการ`}
        size="md"
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

        {/* GradeLevel Rows */}
        <Stack spacing={3}>
          {gradeLevels.map((grade, index) => (
            <Box
              key={grade.id}
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
                {gradeLevels.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveRow(grade.id)}
                    aria-label="ลบรายการ"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                )}
              </Stack>

              {/* Form Fields - Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr 1fr" },
                  gap: 2,
                }}
              >
                {/* Year */}
                <TextField
                  select
                  label="ชั้นปี (ม.)"
                  value={grade.year}
                  onChange={(e) =>
                    handleFieldChange(grade.id, "year", Number(e.target.value))
                  }
                  size="small"
                  required
                  error={!!errors[`${grade.id}-year`]}
                  helperText={errors[`${grade.id}-year`]}
                >
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <MenuItem key={y} value={y}>
                      ม.{y}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Number */}
                <TextField
                  label="ห้อง"
                  type="number"
                  value={grade.number}
                  onChange={(e) =>
                    handleFieldChange(
                      grade.id,
                      "number",
                      Number(e.target.value),
                    )
                  }
                  size="small"
                  required
                  error={!!errors[`${grade.id}-number`]}
                  helperText={errors[`${grade.id}-number`]}
                  inputProps={{ min: 1, max: 99 }}
                />

                {/* StudentCount */}
                <TextField
                  label="จำนวนนักเรียน"
                  type="number"
                  value={grade.studentCount}
                  onChange={(e) =>
                    handleFieldChange(
                      grade.id,
                      "studentCount",
                      Number(e.target.value),
                    )
                  }
                  size="small"
                  error={!!errors[`${grade.id}-studentCount`]}
                  helperText={errors[`${grade.id}-studentCount`]}
                  inputProps={{ min: 0 }}
                />

                {/* Program */}
                <TextField
                  select
                  label="หลักสูตร"
                  value={grade.programId ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      grade.id,
                      "programId",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  size="small"
                >
                  <MenuItem value="">
                    <em>ไม่ระบุ</em>
                  </MenuItem>
                  {(programsByYear[grade.year] ?? []).map((p) => (
                    <MenuItem key={p.ProgramID} value={p.ProgramID}>
                      {p.ProgramCode} — {p.ProgramName}
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
            กรุณากรอกข้อมูลที่ถูกต้อง
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
          <SubmitButton data-testid="add-gradelevel-submit">
            เพิ่มระดับชั้น ({gradeLevels.length} รายการ)
          </SubmitButton>
        </FormDialogActions>
      </FormDialog>
    </form>
  );
}

export default AddGradeLevelDialog;
