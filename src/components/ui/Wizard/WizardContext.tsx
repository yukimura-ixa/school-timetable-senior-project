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

  const nextStep = () =>
    setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));
  const setStep = (step: number) =>
    setActiveStep(Math.max(0, Math.min(step, totalSteps - 1)));

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
