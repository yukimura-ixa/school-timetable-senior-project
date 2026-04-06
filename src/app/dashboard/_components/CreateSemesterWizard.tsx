"use client";

/**
 * Create Semester Wizard
 * Compound-component wizard for creating new semesters.
 *
 * Architecture:
 *   <Wizard>          → generic UI step context
 *   <CreateSemesterProvider> → business state context
 *   steps/...         → individual step components
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { Wizard, useWizard } from "@/components/ui/Wizard";
import {
  CreateSemesterProvider,
  useCreateSemester,
} from "./CreateSemesterWizard/CreateSemesterContext";
import { BasicInfoStep } from "./CreateSemesterWizard/steps/BasicInfoStep";
import { CopyPreviousStep } from "./CreateSemesterWizard/steps/CopyPreviousStep";
import { TimeslotConfigurationStep } from "./TimeslotConfigurationStep";
import { ReviewStep } from "./CreateSemesterWizard/steps/ReviewStep";
import { createSemesterWithTimeslotsAction } from "@/features/semester/application/actions/semester.actions";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

const STEPS = [
  "ข้อมูลพื้นฐาน",
  "คัดลอกจากภาคเรียนก่อนหน้า",
  "ตั้งค่าตารางเรียน",
  "ตรวจสอบและสร้าง",
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (semester: SemesterDTO) => void;
  existingSemesters?: SemesterDTO[];
};

function WizardNavigation({
  onClose,
  onSuccess,
  existingSemesters: _existingSemesters,
}: Props) {
  const { activeStep, nextStep, prevStep, setStep } = useWizard();
  const {
    copyFrom,
    copyTimeslots,
    isTimeslotConfigValid,
    academicYear,
    semester,
    copyConfig,
    timeslotConfig,
    reset,
  } = useCreateSemester();
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    // Explicit skip logic: If copying timeslots, skip the timeslot config step
    if (activeStep === 1 && copyFrom && copyTimeslots) {
      setStep(3); // Jump directly to review
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    // Explicit skip back logic
    if (activeStep === 3 && copyFrom && copyTimeslots) {
      setStep(1); // Jump back to copy previous step
    } else {
      prevStep();
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const result = await createSemesterWithTimeslotsAction({
        academicYear,
        semester,
        copyFromConfigId: copyFrom || undefined,
        copyConfig: copyFrom ? copyConfig : undefined,
        timeslotConfig: timeslotConfig || undefined,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to create semester");
      }

      enqueueSnackbar("สร้างภาคเรียนสำเร็จ", { variant: "success" });
      onSuccess(result.data);
      reset();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการสร้างภาคเรียน";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={onClose} disabled={loading}>
        ยกเลิก
      </Button>
      <Box sx={{ flex: "1 1 auto" }} />
      {activeStep > 0 && (
        <Button onClick={handleBack} disabled={loading}>
          ย้อนกลับ
        </Button>
      )}
      {activeStep < STEPS.length - 1 ? (
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={activeStep === 2 && !copyFrom && !isTimeslotConfigValid}
        >
          ถัดไป
        </Button>
      ) : (
        <Button
          onClick={() => void handleCreate()}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          สร้างภาคเรียน
        </Button>
      )}
    </>
  );
}

export function CreateSemesterWizard(props: Props) {
  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
      <DialogTitle>สร้างภาคเรียนใหม่</DialogTitle>

      <CreateSemesterProvider>
        <Wizard>
          <DialogContent>
            <Wizard.Stepper steps={STEPS} />
            <Wizard.Step index={0}>
              <BasicInfoStep />
            </Wizard.Step>
            <Wizard.Step index={1}>
              <CopyPreviousStep existingSemesters={props.existingSemesters} />
            </Wizard.Step>
            <Wizard.Step index={2}>
              <TimeslotConfigurationStep />
            </Wizard.Step>
            <Wizard.Step index={3}>
              <ReviewStep existingSemesters={props.existingSemesters} />
            </Wizard.Step>
          </DialogContent>
          <DialogActions>
            <WizardNavigation {...props} />
          </DialogActions>
        </Wizard>
      </CreateSemesterProvider>
    </Dialog>
  );
}
