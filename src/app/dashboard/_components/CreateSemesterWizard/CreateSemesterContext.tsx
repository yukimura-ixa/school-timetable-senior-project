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

const CreateSemesterContext = createContext<
  CreateSemesterContextType | undefined
>(undefined);

export function useCreateSemester() {
  const context = useContext(CreateSemesterContext);
  if (!context) {
    throw new Error(
      "useCreateSemester must be used within a CreateSemesterProvider",
    );
  }
  return context;
}

export function CreateSemesterProvider({ children }: { children: ReactNode }) {
  const [academicYear, setAcademicYear] = useState(
    getBangkokThaiBuddhistYear(),
  );
  const [semester, setSemester] = useState(1);
  const [copyFrom, setCopyFrom] = useState<string>("");
  const [copyConfig, setCopyConfig] = useState(true);
  const [copyTimeslots, setCopyTimeslots] = useState(true);
  const [timeslotConfig, setTimeslotConfig] =
    useState<CreateTimeslotsInput | null>(null);
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
