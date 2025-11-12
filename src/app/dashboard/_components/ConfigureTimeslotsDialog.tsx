"use client";

/**
 * Configure Timeslots Dialog
 * Allows configuring timeslots for existing semesters
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import type { CreateTimeslotsInput } from "@/features/timeslot/application/schemas/timeslot.schemas";
import { createTimeslotsAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { TimeslotConfigurationStep } from "./TimeslotConfigurationStep";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  academicYear: number;
  semester: 1 | 2;
  configId: string;
};

export function ConfigureTimeslotsDialog({
  open,
  onClose,
  onSuccess,
  academicYear,
  semester,
  configId,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [timeslotConfig, setTimeslotConfig] = useState<CreateTimeslotsInput | null>(null);
  const [isValid, setIsValid] = useState(false);

  const handleCreate = async () => {
    if (!timeslotConfig) {
      enqueueSnackbar("กรุณากรอกข้อมูลให้ครบถ้วน", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      const result = await createTimeslotsAction(timeslotConfig);

      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || "Failed to create timeslots";
        throw new Error(errorMessage);
      }

      enqueueSnackbar("ตั้งค่าตารางเรียนสำเร็จ", { variant: "success" });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการตั้งค่าตารางเรียน";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>ตั้งค่าตารางเรียน - {configId}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          ภาคเรียนนี้ยังไม่มีการตั้งค่าตารางเรียน กรุณากำหนดค่าช่วงเวลาเรียน
        </Alert>

        <TimeslotConfigurationStep
          academicYear={academicYear}
          semester={semester}
          onChange={setTimeslotConfig}
          onValidationChange={setIsValid}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          onClick={() => void handleCreate()}
          variant="contained"
          disabled={loading || !isValid}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "กำลังสร้าง..." : "ตั้งค่าตารางเรียน"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
