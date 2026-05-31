"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Stack, Step, StepButton, Stepper } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

import {
  WIZARD_STEPS,
  resolveStepAccess,
  furthestReachableStep,
  type WizardState,
  type WizardStepKey,
} from "../../domain/wizard-steps";

interface WizardStepperProps {
  state: WizardState;
  /** /schedule/{academicYear}/{semester} */
  basePath: string;
}

/** Map a URL path to the wizard step it belongs to (null = base path). */
function stepKeyFromPath(
  pathname: string,
  basePath: string,
): WizardStepKey | null {
  if (!pathname.startsWith(basePath)) return null;
  const rest = pathname.slice(basePath.length).replace(/^\//, "");
  if (rest === "") return null;
  const segment = rest.split("/")[0];
  const step = WIZARD_STEPS.find((s) => s.segment === segment);
  return step ? step.key : null;
}

function segmentForKey(key: WizardStepKey): string {
  const step = WIZARD_STEPS.find((s) => s.key === key);
  return step?.segment ?? "config";
}

export function WizardStepper({ state, basePath }: WizardStepperProps) {
  const pathname = usePathname();
  const router = useRouter();

  const access = resolveStepAccess(state);
  const currentKey = stepKeyFromPath(pathname, basePath);
  const furthest = furthestReachableStep(state);

  // Forward-skip guard: if the user lands on a step that isn't reachable yet
  // (deep link or stale URL), bounce them to the furthest reachable step.
  useEffect(() => {
    if (!currentKey) return;
    const entry = access.find((a) => a.key === currentKey);
    if (entry && !entry.reachable) {
      router.replace(`${basePath}/${segmentForKey(furthest)}`);
    }
  }, [currentKey, access, furthest, basePath, router]);

  const activeIndex = currentKey
    ? WIZARD_STEPS.findIndex((s) => s.key === currentKey)
    : -1;

  // Prev is always allowed (revisiting completed steps); Next only when the
  // following step's prerequisites are met (forward-skip stays blocked).
  const prevStep = activeIndex > 0 ? WIZARD_STEPS[activeIndex - 1] : null;
  const nextStep =
    activeIndex >= 0 && activeIndex < WIZARD_STEPS.length - 1
      ? WIZARD_STEPS[activeIndex + 1]
      : null;
  const nextReachable = nextStep
    ? (access.find((a) => a.key === nextStep.key)?.reachable ?? false)
    : false;

  const goTo = (key: WizardStepKey) =>
    router.push(`${basePath}/${segmentForKey(key)}`);

  const handleStep = (key: WizardStepKey, reachable: boolean) => () => {
    if (!reachable) return;
    router.push(`${basePath}/${segmentForKey(key)}`);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stepper nonLinear activeStep={activeIndex} alternativeLabel>
        {WIZARD_STEPS.map((step, index) => {
          const reachable =
            access.find((a) => a.key === step.key)?.reachable ?? false;
          return (
            <Step key={step.key} completed={reachable && index < activeIndex}>
              <StepButton
                color="inherit"
                disabled={!reachable}
                onClick={handleStep(step.key, reachable)}
              >
                {step.label}
              </StepButton>
            </Step>
          );
        })}
      </Stepper>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          disabled={!prevStep}
          onClick={() => prevStep && goTo(prevStep.key)}
        >
          ย้อนกลับ
        </Button>
        <Button
          size="small"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          disabled={!nextStep || !nextReachable}
          onClick={() => nextStep && goTo(nextStep.key)}
        >
          ถัดไป
        </Button>
      </Stack>
    </Box>
  );
}
