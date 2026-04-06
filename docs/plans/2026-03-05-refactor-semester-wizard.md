# Refactor Semester Wizard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the `CreateSemesterWizard` into a maintainable compound component architecture, separating UI state from business logic and eliminating hacky workarounds like `setTimeout` for step skipping.

**Architecture:** We will implement a generic, reusable `Wizard` compound component (`Wizard`, `Wizard.Step`, `Wizard.Stepper`, `Wizard.Actions`) using React Context. Then, we will create a domain-specific `CreateSemesterContext` to manage the business state for semester creation. Finally, we will refactor `CreateSemesterWizard` to use these new contexts and the compound component structure.

**Tech Stack:** React 19, Next.js 16 (App Router), TypeScript, Material UI (MUI).

---

### Task 1: Implement the Generic UI Wizard Context

**Files:**
- Create: `src/components/ui/Wizard/WizardContext.tsx`
- Create: `src/components/ui/Wizard/index.ts`

**Step 1: Write the WizardContext implementation**

Implement the context to manage the active step and navigation logic.

```tsx
// src/components/ui/Wizard/WizardContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type WizardContextType = {
  activeStep: number;
  totalSteps: number;
  setTotalSteps: (count: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [activeStep, setActiveStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));
  const setStep = (step: number) => setActiveStep(Math.max(0, Math.min(step, totalSteps - 1)));

  return (
    <WizardContext.Provider
      value={{
        activeStep,
        totalSteps,
        setTotalSteps,
        nextStep,
        prevStep,
        setStep,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}
```

**Step 2: Export from index**

```typescript
// src/components/ui/Wizard/index.ts
export * from "./WizardContext";
```

**Step 3: Commit**

```bash
git add src/components/ui/Wizard/WizardContext.tsx src/components/ui/Wizard/index.ts
git commit -m "feat(ui): add generic WizardContext for UI state management"
```

---

### Task 2: Implement the Compound Wizard Components

**Files:**
- Create: `src/components/ui/Wizard/Wizard.tsx`
- Modify: `src/components/ui/Wizard/index.ts`

**Step 1: Write the Compound Components**

Create the components that consume the UI context.

```tsx
// src/components/ui/Wizard/Wizard.tsx
"use client";

import React, { useEffect, ReactNode } from "react";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import { WizardProvider, useWizard } from "./WizardContext";

export function WizardRoot({ children }: { children: ReactNode }) {
  return <WizardProvider>{children}</WizardProvider>;
}

export function WizardStepper({ steps }: { steps: string[] }) {
  const { activeStep, setTotalSteps } = useWizard();

  useEffect(() => {
    setTotalSteps(steps.length);
  }, [steps.length, setTotalSteps]);

  return (
    <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export function WizardStep({ index, children }: { index: number; children: ReactNode }) {
  const { activeStep } = useWizard();

  if (activeStep !== index) {
    return null;
  }

  return <Box sx={{ mt: 2 }}>{children}</Box>;
}

export function WizardActions({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", mt: 4, pt: 2, borderTop: 1, borderColor: "divider" }}>
      {children}
    </Box>
  );
}

// Compound API
export const Wizard = Object.assign(WizardRoot, {
  Stepper: WizardStepper,
  Step: WizardStep,
  Actions: WizardActions,
});
```

**Step 2: Export the Wizard**

```typescript
// Modify: src/components/ui/Wizard/index.ts
export * from "./WizardContext";
export * from "./Wizard";
```

**Step 3: Commit**

```bash
git add src/components/ui/Wizard/Wizard.tsx src/components/ui/Wizard/index.ts
git commit -m "feat(ui): implement generic Wizard compound components"
```

---

### Task 3: Create the Semester Business State Context

**Files:**
- Create: `src/app/dashboard/_components/CreateSemesterWizard/CreateSemesterContext.tsx`

**Step 1: Define the Business State Context**

This context will hold the form data (`academicYear`, `semester`, etc.) specifically for the semester creation process. We'll use the existing types from `src/features/timeslot/application/schemas/timeslot.schemas.ts`.

```tsx
// src/app/dashboard/_components/CreateSemesterWizard/CreateSemesterContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { getBangkokThaiBuddhistYear } from "@/utils/datetime";
import type { CreateTimeslotsInput } from "@/features/timeslot/application/schemas/timeslot.schemas";

type CreateSemesterState = {
  academicYear: number;
  semester: number;
  copyFrom: string;
  copyConfig: boolean;
  copyTimeslots: boolean;
  timeslotConfig: CreateTimeslotsInput | null;
  isTimeslotConfigValid: boolean;
};

type CreateSemesterActions = {
  setAcademicYear: (year: number) => void;
  setSemester: (semester: number) => void;
  setCopyFrom: (id: string) => void;
  setCopyConfig: (copy: boolean) => void;
  setCopyTimeslots: (copy: boolean) => void;
  setTimeslotConfig: (config: CreateTimeslotsInput | null) => void;
  setIsTimeslotConfigValid: (valid: boolean) => void;
  reset: () => void;
};

type CreateSemesterContextType = CreateSemesterState & CreateSemesterActions;

const CreateSemesterContext = createContext<CreateSemesterContextType | undefined>(undefined);

export function useCreateSemester() {
  const context = useContext(CreateSemesterContext);
  if (!context) {
    throw new Error("useCreateSemester must be used within a CreateSemesterProvider");
  }
  return context;
}

export function CreateSemesterProvider({ children }: { children: ReactNode }) {
  const [academicYear, setAcademicYear] = useState(getBangkokThaiBuddhistYear());
  const [semester, setSemester] = useState(1);
  const [copyFrom, setCopyFrom] = useState<string>("");
  const [copyConfig, setCopyConfig] = useState(true);
  const [copyTimeslots, setCopyTimeslots] = useState(true);
  const [timeslotConfig, setTimeslotConfig] = useState<CreateTimeslotsInput | null>(null);
  const [isTimeslotConfigValid, setIsTimeslotConfigValid] = useState(false);

  const reset = () => {
    setAcademicYear(getBangkokThaiBuddhistYear());
    setSemester(1);
    setCopyFrom("");
    setCopyConfig(true);
    setCopyTimeslots(true);
    setTimeslotConfig(null);
    setIsTimeslotConfigValid(false);
  };

  return (
    <CreateSemesterContext.Provider
      value={{
        academicYear,
        semester,
        copyFrom,
        copyConfig,
        copyTimeslots,
        timeslotConfig,
        isTimeslotConfigValid,
        setAcademicYear,
        setSemester,
        setCopyFrom,
        setCopyConfig,
        setCopyTimeslots,
        setTimeslotConfig,
        setIsTimeslotConfigValid,
        reset,
      }}
    >
      {children}
    </CreateSemesterContext.Provider>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/dashboard/_components/CreateSemesterWizard/CreateSemesterContext.tsx
git commit -m "refactor(semester): extract business state to CreateSemesterContext"
```

---

### Task 4: Refactor Individual Steps into Components

**Files:**
- Create: `src/app/dashboard/_components/CreateSemesterWizard/steps/BasicInfoStep.tsx`
- Create: `src/app/dashboard/_components/CreateSemesterWizard/steps/CopyPreviousStep.tsx`
- Create: `src/app/dashboard/_components/CreateSemesterWizard/steps/ReviewStep.tsx`
- Modify: `src/app/dashboard/_components/TimeslotConfigurationStep.tsx`

**Step 1: Create BasicInfoStep**

```tsx
// src/app/dashboard/_components/CreateSemesterWizard/steps/BasicInfoStep.tsx
"use client";

import React from "react";
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material";
import { useCreateSemester } from "../CreateSemesterContext";

export function BasicInfoStep() {
  const { academicYear, setAcademicYear, semester, setSemester } = useCreateSemester();

  return (
    <Box>
      <TextField
        fullWidth
        label="ปีการศึกษา"
        type="number"
        value={academicYear}
        onChange={(e) => setAcademicYear(Number(e.target.value))}
        sx={{ mb: 2 }}
        helperText="พ.ศ. (เช่น 2567)"
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>ภาคเรียน</InputLabel>
        <Select
          value={semester}
          label="ภาคเรียน"
          onChange={(e) => setSemester(Number(e.target.value))}
        >
          <MenuItem value={1}>ภาคเรียนที่ 1</MenuItem>
          <MenuItem value={2}>ภาคเรียนที่ 2</MenuItem>
        </Select>
      </FormControl>
      <Alert severity="info">
        จะสร้างภาคเรียนที่ {semester}/{academicYear}
      </Alert>
    </Box>
  );
}
```

**Step 2: Create CopyPreviousStep**

```tsx
// src/app/dashboard/_components/CreateSemesterWizard/steps/CopyPreviousStep.tsx
"use client";

import React from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useCreateSemester } from "../CreateSemesterContext";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

export function CopyPreviousStep({ existingSemesters = [] }: { existingSemesters?: SemesterDTO[] }) {
  const { copyFrom, setCopyFrom, copyConfig, setCopyConfig, copyTimeslots, setCopyTimeslots } = useCreateSemester();

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        เลือกภาคเรียนที่ต้องการคัดลอกค่าตั้งต้น (ไม่บังคับ)
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>คัดลอกจาก</InputLabel>
        <Select
          value={copyFrom}
          label="คัดลอกจาก"
          onChange={(e) => setCopyFrom(e.target.value)}
        >
          <MenuItem value="">ไม่คัดลอก (เริ่มต้นใหม่)</MenuItem>
          {existingSemesters
            .filter((s) => s.status !== "ARCHIVED")
            .map((s) => (
              <MenuItem key={s.configId} value={s.configId}>
                ภาคเรียนที่ {s.semester}/{s.academicYear} - {s.status}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {copyFrom && (
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={copyConfig} onChange={(e) => setCopyConfig(e.target.checked)} />}
            label="คัดลอกการตั้งค่าตารางเรียน"
          />
          <FormControlLabel
            control={<Checkbox checked={copyTimeslots} onChange={(e) => setCopyTimeslots(e.target.checked)} />}
            label="คัดลอกช่วงเวลา (Timeslots)"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            หมายเหตุ: ข้อมูลครู นักเรียน และวิชาจะไม่ถูกคัดลอก
          </Typography>
        </FormGroup>
      )}
    </Box>
  );
}
```

**Step 3: Create ReviewStep**

```tsx
// src/app/dashboard/_components/CreateSemesterWizard/steps/ReviewStep.tsx
"use client";

import React from "react";
import { Box, Typography, Alert } from "@mui/material";
import { useCreateSemester } from "../CreateSemesterContext";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

export function ReviewStep({ existingSemesters = [] }: { existingSemesters?: SemesterDTO[] }) {
  const { semester, academicYear, copyFrom, copyConfig, copyTimeslots, timeslotConfig } = useCreateSemester();

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
```

**Step 4: Update TimeslotConfigurationStep to use Context**

Modify `src/app/dashboard/_components/TimeslotConfigurationStep.tsx`.
*Remove the `onChange`, `onValidationChange`, `academicYear`, and `semester` props.*
*Consume `useCreateSemester()` to get/set `timeslotConfig`, `setIsTimeslotConfigValid`, `academicYear`, and `semester`.*
*(I will provide the exact modifications during execution to avoid making this plan document too long, but the concept is replacing local state with the context state).*

**Step 5: Commit**

```bash
git add src/app/dashboard/_components/CreateSemesterWizard/steps/ src/app/dashboard/_components/TimeslotConfigurationStep.tsx
git commit -m "refactor(semester): break down wizard into explicit step components"
```

---

### Task 5: Wire Up the Main Wizard Component

**Files:**
- Modify: `src/app/dashboard/_components/CreateSemesterWizard.tsx` (Move to `src/app/dashboard/_components/CreateSemesterWizard/index.tsx` if desired, or keep naming and just rewrite). Let's rewrite `src/app/dashboard/_components/CreateSemesterWizard.tsx`.

**Step 1: Rewrite CreateSemesterWizard**

Combine the UI Context, Business Context, and Steps. Handle the "skip logic" explicitly in the navigation actions.

```tsx
// src/app/dashboard/_components/CreateSemesterWizard.tsx
"use client";

import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, CircularProgress } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { Wizard, useWizard } from "@/components/ui/Wizard";
import { CreateSemesterProvider, useCreateSemester } from "./CreateSemesterWizard/CreateSemesterContext";
import { BasicInfoStep } from "./CreateSemesterWizard/steps/BasicInfoStep";
import { CopyPreviousStep } from "./CreateSemesterWizard/steps/CopyPreviousStep";
import { TimeslotConfigurationStep } from "./TimeslotConfigurationStep";
import { ReviewStep } from "./CreateSemesterWizard/steps/ReviewStep";
import { createSemesterWithTimeslotsAction } from "@/features/semester/application/actions/semester.actions";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

const STEPS = ["ข้อมูลพื้นฐาน", "คัดลอกจากภาคเรียนก่อนหน้า", "ตั้งค่าตารางเรียน", "ตรวจสอบและสร้าง"];

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (semester: SemesterDTO) => void;
  existingSemesters?: SemesterDTO[];
};

function WizardNavigation({ onClose, onSuccess, existingSemesters }: Props) {
  const { activeStep, nextStep, prevStep, setStep } = useWizard();
  const { 
    copyFrom, copyTimeslots, isTimeslotConfigValid, 
    academicYear, semester, copyConfig, timeslotConfig, reset 
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
      const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการสร้างภาคเรียน";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={onClose} disabled={loading}>ยกเลิก</Button>
      <Box sx={{ flex: "1 1 auto" }} />
      {activeStep > 0 && (
        <Button onClick={handleBack} disabled={loading}>ย้อนกลับ</Button>
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
            <Wizard.Step index={0}><BasicInfoStep /></Wizard.Step>
            <Wizard.Step index={1}><CopyPreviousStep existingSemesters={props.existingSemesters} /></Wizard.Step>
            <Wizard.Step index={2}><TimeslotConfigurationStep /></Wizard.Step>
            <Wizard.Step index={3}><ReviewStep existingSemesters={props.existingSemesters} /></Wizard.Step>
          </DialogContent>
          <DialogActions>
            <WizardNavigation {...props} />
          </DialogActions>
        </Wizard>
      </CreateSemesterProvider>
    </Dialog>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/dashboard/_components/CreateSemesterWizard.tsx
git commit -m "refactor(semester): assemble compound Wizard and wire up business state"
```

---

### Task 6: Type Check and Lint

**Step 1: Run standard checks**

Run the project's standard checks to ensure no regressions were introduced.

Run: `pnpm run typecheck`
Expected: PASS
Run: `pnpm run lint`
Expected: PASS

**Step 2: Commit**

```bash
git add -u
git commit -m "chore: fix types and lint issues after wizard refactor"
```
