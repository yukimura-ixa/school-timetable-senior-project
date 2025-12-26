"use client";

/**
 * AddProgramDialog - Program creation dialog using FormDialog
 *
 * Uses FormDialog with proper form semantics and Track selection.
 */

import React, { useState, useCallback, useMemo } from "react";
import { TextField, MenuItem, Alert, Stack, Button } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { FormDialog, FormDialogActions } from "@/components/dialogs/FormDialog";
import { SubmitButton } from "@/components/buttons/SubmitButton";
import { createProgramAction } from "@/features/program/application/actions/program.actions";
import type { $Enums } from "@/prisma/generated/client";

// ==================== Types ====================

interface AddProgramDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  year: number;
}

interface ProgramFormData {
  programCode: string;
  programName: string;
  track: $Enums.ProgramTrack;
  minTotalCredits: number;
  isActive: boolean;
}

// ==================== Constants ====================

const TRACK_OPTIONS: { value: $Enums.ProgramTrack; label: string }[] = [
  { value: "SCIENCE_MATH", label: "วิทย์-คณิต" },
  { value: "LANGUAGE_MATH", label: "ศิลป์-คำนวณ" },
  { value: "LANGUAGE_ARTS", label: "ศิลป์-ภาษา" },
  { value: "GENERAL", label: "ทั่วไป" },
];

// ==================== Component ====================

export function AddProgramDialog({
  open,
  onClose,
  onSuccess,
  year,
}: AddProgramDialogProps) {
  const getDefaultCode = useCallback(
    (trackVal: $Enums.ProgramTrack) => `M${year}-${trackVal.replace("_", "-")}`,
    [year],
  );

  const [formData, setFormData] = useState<ProgramFormData>({
    programCode: getDefaultCode("GENERAL"),
    programName: "",
    track: "GENERAL",
    minTotalCredits: 0,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check dirty state
  const isDirty = useMemo(() => {
    return (
      formData.programName.trim() !== "" ||
      formData.track !== "GENERAL" ||
      formData.minTotalCredits !== 0
    );
  }, [formData]);

  // Update code when track changes
  const handleTrackChange = useCallback(
    (newTrack: $Enums.ProgramTrack) => {
      setFormData((prev) => ({
        ...prev,
        track: newTrack,
        programCode: getDefaultCode(newTrack),
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.track;
        return newErrors;
      });
    },
    [getDefaultCode],
  );

  // Validate
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.programCode?.trim()) {
      newErrors.programCode = "รหัสหลักสูตรห้ามว่าง";
    }
    if (!formData.programName?.trim()) {
      newErrors.programName = "ชื่อหลักสูตรห้ามว่าง";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await createProgramAction({
        ProgramCode: formData.programCode.trim(),
        ProgramName: formData.programName.trim(),
        Year: year,
        Track: formData.track,
        MinTotalCredits: formData.minTotalCredits,
        IsActive: formData.isActive,
      });

      if (!result.success) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "เกิดข้อผิดพลาด",
        );
      }

      enqueueSnackbar("เพิ่มหลักสูตรสำเร็จ", { variant: "success" });
      await onSuccess();
      onClose();
    } catch (error) {
      enqueueSnackbar(
        `เพิ่มหลักสูตรไม่สำเร็จ: ${error instanceof Error ? error.message : "Unknown error"}`,
        { variant: "error" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setFormData({
        programCode: getDefaultCode("GENERAL"),
        programName: "",
        track: "GENERAL",
        minTotalCredits: 0,
        isActive: true,
      });
      setErrors({});
    }
  }, [open, getDefaultCode]);

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={`เพิ่มหลักสูตร ม.${year}`}
      description="กรอกข้อมูลหลักสูตรใหม่"
      size="sm"
      dirty={isDirty}
      loading={isSubmitting}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Track Selection */}
          <TextField
            select
            label="แผนการเรียน"
            value={formData.track}
            onChange={(e) =>
              handleTrackChange(e.target.value as $Enums.ProgramTrack)
            }
            size="small"
            required
            fullWidth
            inputProps={{ "data-testid": "program-track-select" }}
          >
            {TRACK_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Program Code */}
          <TextField
            label="รหัสหลักสูตร"
            value={formData.programCode}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                programCode: e.target.value,
              }))
            }
            size="small"
            required
            fullWidth
            error={!!errors.programCode}
            helperText={errors.programCode || "เช่น GENERAL-M1-2567"}
            inputProps={{ "data-testid": "program-code" }}
          />

          {/* Program Name */}
          <TextField
            label="ชื่อหลักสูตร"
            value={formData.programName}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                programName: e.target.value,
              }));
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.programName;
                return newErrors;
              });
            }}
            size="small"
            required
            fullWidth
            error={!!errors.programName}
            helperText={errors.programName}
            autoFocus
            inputProps={{ "data-testid": "program-name" }}
          />

          {/* Min Total Credits */}
          <TextField
            label="หน่วยกิตขั้นต่ำ"
            type="number"
            value={formData.minTotalCredits}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                minTotalCredits: Number(e.target.value) || 0,
              }))
            }
            size="small"
            fullWidth
            inputProps={{ min: 0 }}
          />

          {/* Is Active */}
          <TextField
            select
            label="สถานะ"
            value={formData.isActive ? "true" : "false"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                isActive: e.target.value === "true",
              }))
            }
            size="small"
            fullWidth
          >
            <MenuItem value="true">เปิดใช้งาน</MenuItem>
            <MenuItem value="false">ปิดใช้งาน</MenuItem>
          </TextField>
        </Stack>

        {/* Validation Errors */}
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
          <SubmitButton data-testid="add-program-submit">
            เพิ่มหลักสูตร
          </SubmitButton>
        </FormDialogActions>
      </form>
    </FormDialog>
  );
}

export default AddProgramDialog;
