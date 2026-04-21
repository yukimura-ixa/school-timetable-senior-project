import { describe, it, expect } from "vitest";
import { suggestResolutions } from "./conflict-resolver.service";
import { ConflictType } from "../models/conflict.model";
import type {
  ResolutionContext,
  ScheduleArrangementInput,
  ExistingSchedule,
  TeacherResponsibility,
  RoomOption,
  TimeslotOption,
  ConflictResult,
  ResolutionSuggestion,
} from "../models/conflict.model";

function makeAttempt(
  over: Partial<ScheduleArrangementInput> = {},
): ScheduleArrangementInput {
  return {
    timeslotId: "1-2567-MON-1",
    subjectCode: "MATH101",
    gradeId: "M1-1",
    teacherId: 1,
    roomId: 10,
    academicYear: 2567,
    semester: "SEMESTER_1",
    ...over,
  };
}

function makeCtx(over: Partial<ResolutionContext> = {}): ResolutionContext {
  const conflict: ConflictResult = {
    hasConflict: false,
    conflictType: ConflictType.NONE,
    message: "",
  };
  return {
    conflict,
    attempt: makeAttempt(),
    existingSchedules: [],
    responsibilities: [],
    availableRooms: [],
    allTimeslots: [],
    ...over,
  };
}

// Re-exports to silence unused-import warnings in early tasks; the types
// become referenced as subsequent tasks add test suites.
void (0 as unknown as ExistingSchedule);
void (0 as unknown as TeacherResponsibility);
void (0 as unknown as RoomOption);
void (0 as unknown as TimeslotOption);
void (0 as unknown as ResolutionSuggestion);

describe("suggestResolutions", () => {
  it("returns [] when conflict has hasConflict=false", () => {
    expect(suggestResolutions(makeCtx())).toEqual([]);
  });
});
