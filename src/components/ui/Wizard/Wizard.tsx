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

export function WizardStep({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const { activeStep } = useWizard();

  if (activeStep !== index) {
    return null;
  }

  return <Box sx={{ mt: 2 }}>{children}</Box>;
}

export function WizardActions({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        mt: 4,
        pt: 2,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
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
