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
import { updateConfigWithTimeslotsAction } from "@/features/config/application/actions/config.actions";
import type { ConfigData } from "@/features/config/domain/types/config-data.types";
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
  mode?: "create" | "edit";
  initialConfig?: ConfigData;
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
  configId,
  mode = "create",
  initialConfig,
}: Pick<Props, "onClose" | "onSuccess" | "academicYear" | "semester" | "configId" | "mode" | "initialConfig">) {
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

  const handleSubmit = async () => {
    if (!timeslotConfig) {
      enqueueSnackbar("กรุณากรอกข้อมูลให้ครบถ้วน", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      if (mode === "edit") {
        const { AcademicYear: _ay, Semester: _sem, ...configData } = timeslotConfig;
        const result = await updateConfigWithTimeslotsAction({
          ConfigID: configId,
          Config: configData,
        });
        if (!result.success) {
          const errorMessage =
            typeof result.error === "string"
              ? result.error
              : result.error?.message || "Failed to update timeslots";
          throw new Error(errorMessage);
        }
        enqueueSnackbar("อัปเดตตารางเรียนสำเร็จ", { variant: "success" });
      } else {
        const result = await createTimeslotsAction(timeslotConfig);
        if (!result.success) {
          const errorMessage =
            typeof result.error === "string"
              ? result.error
              : result.error?.message || "Failed to create timeslots";
          throw new Error(errorMessage);
        }
        enqueueSnackbar("ตั้งค่าตารางเรียนสำเร็จ", { variant: "success" });
      }
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
        {mode === "edit" ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            การแก้ไขจะสร้างคาบเรียนใหม่ทั้งหมด ข้อมูลการมอบหมายครูเดิมจะถูกลบ
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            ภาคเรียนนี้ยังไม่มีการตั้งค่าตารางเรียน กรุณากำหนดค่าช่วงเวลาเรียน
          </Alert>
        )}

        <TimeslotConfigurationStep initialConfig={initialConfig} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          variant="contained"
          disabled={loading || !isTimeslotConfigValid}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading
            ? mode === "edit" ? "กำลังอัปเดต..." : "กำลังสร้าง..."
            : mode === "edit" ? "อัปเดตตารางเรียน" : "ตั้งค่าตารางเรียน"}
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
  mode = "create",
  initialConfig,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "edit" ? "แก้ไขตารางเรียน" : "ตั้งค่าตารางเรียน"} - {configId}
      </DialogTitle>

      <CreateSemesterProvider>
        <ConfigureTimeslotsContent
          onClose={onClose}
          onSuccess={onSuccess}
          academicYear={academicYear}
          semester={semester}
          configId={configId}
          mode={mode}
          initialConfig={initialConfig}
        />
      </CreateSemesterProvider>
    </Dialog>
  );
}
