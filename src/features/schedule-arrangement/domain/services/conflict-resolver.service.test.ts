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


describe("suggestResolutions", () => {
  it("returns [] when conflict has hasConflict=false", () => {
    expect(suggestResolutions(makeCtx())).toEqual([]);
  });
});

describe("RE_ROOM suggestions", () => {
  const roomBusySchedule: ExistingSchedule = {
    classId: 99,
    timeslotId: "1-2567-MON-1",
    subjectCode: "ENG101",
    subjectName: "English",
    roomId: 10,
    roomName: "R-10",
    gradeId: "M1-2",
    isLocked: false,
  };

  const rooms: RoomOption[] = [
    { roomId: 10, roomName: "R-10" },
    { roomId: 11, roomName: "R-11" },
    { roomId: 12, roomName: "R-12" },
  ];

  it("proposes RE_ROOM when conflict is ROOM_CONFLICT and at least one room is free in the same slot", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.ROOM_CONFLICT,
        message: "Room occupied",
      },
      attempt: makeAttempt({ roomId: 10, timeslotId: "1-2567-MON-1" }),
      existingSchedules: [roomBusySchedule],
      availableRooms: rooms,
    });

    const result = suggestResolutions(ctx, { maxSuggestions: 3 });
    const roomIds = result
      .filter(
        (s): s is Extract<ResolutionSuggestion, { kind: "RE_ROOM" }> =>
          s.kind === "RE_ROOM",
      )
      .map((s) => s.targetRoomId);
    expect(roomIds).toEqual([11, 12]);
  });

  it("does not propose RE_ROOM for non-ROOM conflict types", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt(),
      existingSchedules: [roomBusySchedule],
      availableRooms: rooms,
    });

    const result = suggestResolutions(ctx);
    expect(result.find((s) => s.kind === "RE_ROOM")).toBeUndefined();
  });

  it("returns no RE_ROOM when availableRooms is empty", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.ROOM_CONFLICT,
        message: "Room occupied",
      },
      attempt: makeAttempt({ roomId: 10 }),
      existingSchedules: [roomBusySchedule],
      availableRooms: [],
    });

    expect(suggestResolutions(ctx)).toEqual([]);
  });
});

describe("MOVE same-day suggestions", () => {
  const timeslots: TimeslotOption[] = [
    { timeslotId: "1-2567-MON-1", dayOfWeek: "MON", slotNumber: 1 },
    { timeslotId: "1-2567-MON-2", dayOfWeek: "MON", slotNumber: 2 },
    {
      timeslotId: "1-2567-MON-3",
      dayOfWeek: "MON",
      slotNumber: 3,
      isBreaktime: true,
    },
    { timeslotId: "1-2567-MON-4", dayOfWeek: "MON", slotNumber: 4 },
    { timeslotId: "1-2567-TUE-1", dayOfWeek: "TUE", slotNumber: 1 },
  ];

  const responsibility: TeacherResponsibility = {
    respId: 1,
    teacherId: 1,
    gradeId: "M1-1",
    subjectCode: "MATH101",
    academicYear: 2567,
    semester: "SEMESTER_1",
    teachHour: 2,
  };

  it("proposes MOVE to an empty same-day non-break slot", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt({ timeslotId: "1-2567-MON-1" }),
      existingSchedules: [],
      responsibilities: [responsibility],
      allTimeslots: timeslots,
    });

    const moves = suggestResolutions(ctx, { maxSuggestions: 5 }).filter(
      (s): s is Extract<ResolutionSuggestion, { kind: "MOVE" }> =>
        s.kind === "MOVE",
    );
    const targets = moves.map((m) => m.targetTimeslotId);
    expect(targets).toContain("1-2567-MON-2");
    expect(targets).toContain("1-2567-MON-4");
    expect(targets).not.toContain("1-2567-MON-3"); // break slot
    expect(targets).not.toContain("1-2567-MON-1"); // origin
  });

  it("includes cross-day MOVE candidates when same-day yields fewer than maxSuggestions", () => {
    const tightSameDaySlots: TimeslotOption[] = [
      { timeslotId: "1-2567-MON-1", dayOfWeek: "MON", slotNumber: 1 },
      { timeslotId: "1-2567-TUE-1", dayOfWeek: "TUE", slotNumber: 1 },
      { timeslotId: "1-2567-TUE-2", dayOfWeek: "TUE", slotNumber: 2 },
      { timeslotId: "1-2567-WED-1", dayOfWeek: "WED", slotNumber: 1 },
    ];
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt({ timeslotId: "1-2567-MON-1" }),
      responsibilities: [responsibility],
      allTimeslots: tightSameDaySlots,
    });

    const result = suggestResolutions(ctx, { maxSuggestions: 3 });
    const targets = result
      .filter(
        (s): s is Extract<ResolutionSuggestion, { kind: "MOVE" }> =>
          s.kind === "MOVE",
      )
      .map((s) => s.targetTimeslotId);
    expect(targets).toEqual(
      expect.arrayContaining(["1-2567-TUE-1", "1-2567-WED-1"]),
    );
  });

  it("ranks nearer periods higher than farther periods on same day", () => {
    const ctx = makeCtx({
      conflict: {
        hasConflict: true,
        conflictType: ConflictType.TEACHER_CONFLICT,
        message: "Teacher busy",
      },
      attempt: makeAttempt({ timeslotId: "1-2567-MON-1" }),
      existingSchedules: [],
      responsibilities: [responsibility],
      allTimeslots: timeslots,
    });

    const moves = suggestResolutions(ctx, { maxSuggestions: 5 }).filter(
      (s): s is Extract<ResolutionSuggestion, { kind: "MOVE" }> =>
        s.kind === "MOVE",
    );
    const mon2 = moves.find((m) => m.targetTimeslotId === "1-2567-MON-2");
    const mon4 = moves.find((m) => m.targetTimeslotId === "1-2567-MON-4");
    expect(mon2 && mon4).toBeTruthy();
    expect(mon2!.confidence).toBeGreaterThan(mon4!.confidence);
  });
});
