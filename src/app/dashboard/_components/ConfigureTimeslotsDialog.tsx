"use client";

/**
 * Configure Timeslots Dialog
 * Allows configuring timeslots for existing semesters.
 *
 * Wraps TimeslotConfigurationStep in a CreateSemesterProvider so the
 * context-based step can function outside the wizard.
 */

import React, { useEffect, useState } from "react";
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
import { createTimeslotsAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { TimeslotConfigurationStep } from "./TimeslotConfigurationStep";
import {
  CreateSemesterProvider,
  useCreateSemester,
} from "./CreateSemesterWizard/CreateSemesterContext";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  academicYear: number;
  semester: 1 | 2;
  configId: string;
};

/**
 * Inner content that lives inside the CreateSemesterProvider so it can
 * read timeslotConfig / isTimeslotConfigValid from context.
 */
function ConfigureTimeslotsContent({
  onClose,
  onSuccess,
  academicYear,
  semester,
}: Pick<Props, "onClose" | "onSuccess" | "academicYear" | "semester">) {
  const {
    timeslotConfig,
    isTimeslotConfigValid,
    setAcademicYear,
    setSemester,
  } = useCreateSemester();
  const [loading, setLoading] = useState(false);

  // Sync the parent-provided academicYear/semester into the context
  useEffect(() => {
    setAcademicYear(academicYear);
    setSemester(semester);
  }, [academicYear, semester, setAcademicYear, setSemester]);

  const handleCreate = async () => {
    if (!timeslotConfig) {
      enqueueSnackbar("กรุณากรอกข้อมูลให้ครบถ้วน", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      const result = await createTimeslotsAction(timeslotConfig);

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Failed to create timeslots";
        throw new Error(errorMessage);
      }

      enqueueSnackbar("ตั้งค่าตารางเรียนสำเร็จ", { variant: "success" });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการตั้งค่าตารางเรียน";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          ภาคเรียนนี้ยังไม่มีการตั้งค่าตารางเรียน กรุณากำหนดค่าช่วงเวลาเรียน
        </Alert>

        <TimeslotConfigurationStep />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          onClick={() => void handleCreate()}
          variant="contained"
          disabled={loading || !isTimeslotConfigValid}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "กำลังสร้าง..." : "ตั้งค่าตารางเรียน"}
        </Button>
      </DialogActions>
    </>
  );
}

export function ConfigureTimeslotsDialog({
  open,
  onClose,
  onSuccess,
  academicYear,
  semester,
  configId,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>ตั้งค่าตารางเรียน - {configId}</DialogTitle>

      <CreateSemesterProvider>
        <ConfigureTimeslotsContent
          onClose={onClose}
          onSuccess={onSuccess}
          academicYear={academicYear}
          semester={semester}
        />
      </CreateSemesterProvider>
    </Dialog>
  );
}
