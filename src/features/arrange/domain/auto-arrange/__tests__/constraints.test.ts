/**
 * Auto-Arrange Constraint Engine Tests
 */
import { describe, expect, it } from "vitest";

import {
  checkAllHardConstraints,
  checkBreakConstraint,
  checkGradeConflict,
  checkLockedSlot,
  checkRoomConflict,
  checkTeacherConflict,
  scoreSoftConstraints,
} from "../constraints";
import type { AvailableTimeslot, ExistingSchedule, Placement } from "../types";

// ─── Test Fixtures ───────────────────────────────────────────────

const makeTimeslot = (
  overrides: Partial<AvailableTimeslot> = {},
): AvailableTimeslot => ({
  timeslotId: "1-2567-MON1",
  day: "MON",
  period: 1,
  isBreak: false,
  ...overrides,
});

const makeExisting = (
  overrides: Partial<ExistingSchedule> = {},
): ExistingSchedule => ({
  classId: 1,
  timeslotId: "1-2567-MON1",
  subjectCode: "ค21101",
  gradeId: "M1-1",
  teacherId: 100,
  roomId: 1,
  isLocked: false,
  ...overrides,
});

const makePlacement = (overrides: Partial<Placement> = {}): Placement => ({
  respId: 1,
  subjectCode: "ท21101",
  gradeId: "M1-1",
  timeslotId: "1-2567-MON1",
  roomId: 1,
  ...overrides,
});

// ─── Break Constraint ────────────────────────────────────────────

describe("checkBreakConstraint", () => {
  it("returns null for non-break timeslot", () => {
    expect(checkBreakConstraint(makeTimeslot())).toBeNull();
  });

  it("returns violation for break timeslot", () => {
    const result = checkBreakConstraint(makeTimeslot({ isBreak: true }));
    expect(result).not.toBeNull();
    expect(result?.type).toBe("BREAK_SLOT");
  });
});

// ─── Locked Slot Constraint ─────────────────────────────────────

describe("checkLockedSlot", () => {
  it("returns null when no locked schedules at timeslot", () => {
    const result = checkLockedSlot("1-2567-MON1", "M1-1", [
      makeExisting({ isLocked: false }),
    ]);
    expect(result).toBeNull();
  });

  it("returns null for empty schedules", () => {
    const result = checkLockedSlot("1-2567-MON1", "M1-1", []);
    expect(result).toBeNull();
  });

  it("detects locked schedule at same timeslot and same grade", () => {
    const result = checkLockedSlot("1-2567-MON1", "M1-1", [
      makeExisting({ isLocked: true, timeslotId: "1-2567-MON1", gradeId: "M1-1" }),
    ]);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LOCKED_SLOT");
    expect(result?.message).toContain("ล็อก");
  });

  it("blocks same grade level (M1-2 blocked by M1-1 lock)", () => {
    const result = checkLockedSlot("1-2567-MON1", "M1-2", [
      makeExisting({ isLocked: true, timeslotId: "1-2567-MON1", gradeId: "M1-1" }),
    ]);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("LOCKED_SLOT");
  });

  it("allows different grade level (M2-1 not blocked by M1-1 lock)", () => {
    const result = checkLockedSlot("1-2567-MON1", "M2-1", [
      makeExisting({ isLocked: true, timeslotId: "1-2567-MON1", gradeId: "M1-1" }),
    ]);
    expect(result).toBeNull();
  });

  it("ignores locked schedule at different timeslot", () => {
    const result = checkLockedSlot("1-2567-MON2", "M1-1", [
      makeExisting({ isLocked: true, timeslotId: "1-2567-MON1" }),
    ]);
    expect(result).toBeNull();
  });
});

// ─── Teacher Conflict ────────────────────────────────────────────

describe("checkTeacherConflict", () => {
  it("returns null when teacher has no conflict", () => {
    const result = checkTeacherConflict(
      100,
      "1-2567-MON2",
      [makeExisting()],
      [],
    );
    expect(result).toBeNull();
  });

  it("detects conflict with existing schedule", () => {
    const result = checkTeacherConflict(
      100,
      "1-2567-MON1",
      [makeExisting()],
      [],
    );
    expect(result).not.toBeNull();
    expect(result?.type).toBe("TEACHER_CONFLICT");
  });

  it("detects conflict with pending placement", () => {
    const result = checkTeacherConflict(
      100,
      "1-2567-MON1",
      [],
      [makePlacement()],
    );
    expect(result).not.toBeNull();
    expect(result?.type).toBe("TEACHER_CONFLICT");
  });

  it("ignores different teacher", () => {
    const result = checkTeacherConflict(
      200,
      "1-2567-MON1",
      [makeExisting()],
      [],
    );
    expect(result).toBeNull();
  });
});

// ─── Grade Conflict ──────────────────────────────────────────────

describe("checkGradeConflict", () => {
  it("returns null when grade has no conflict", () => {
    const result = checkGradeConflict(
      "M1-1",
      "1-2567-MON2",
      [makeExisting()],
      [],
    );
    expect(result).toBeNull();
  });

  it("detects conflict with existing schedule", () => {
    const result = checkGradeConflict(
      "M1-1",
      "1-2567-MON1",
      [makeExisting()],
      [],
    );
    expect(result).not.toBeNull();
    expect(result?.type).toBe("GRADE_CONFLICT");
  });

  it("detects conflict with pending placement", () => {
    const result = checkGradeConflict(
      "M1-1",
      "1-2567-MON1",
      [],
      [makePlacement()],
    );
    expect(result).not.toBeNull();
    expect(result?.type).toBe("GRADE_CONFLICT");
  });
});

// ─── Room Conflict ───────────────────────────────────────────────

describe("checkRoomConflict", () => {
  it("returns null when room is free", () => {
    const result = checkRoomConflict(2, "1-2567-MON1", [makeExisting()], []);
    expect(result).toBeNull();
  });

  it("detects conflict with existing schedule", () => {
    const result = checkRoomConflict(1, "1-2567-MON1", [makeExisting()], []);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("ROOM_CONFLICT");
  });

  it("detects conflict with pending placement", () => {
    const result = checkRoomConflict(1, "1-2567-MON1", [], [makePlacement()]);
    expect(result).not.toBeNull();
    expect(result?.type).toBe("ROOM_CONFLICT");
  });
});

// ─── Combined Hard Constraints ───────────────────────────────────

describe("checkAllHardConstraints", () => {
  it("returns null when all constraints pass", () => {
    const ts = makeTimeslot({ timeslotId: "1-2567-TUE3" });
    const result = checkAllHardConstraints(100, "M1-1", 2, ts, [], []);
    expect(result).toBeNull();
  });

  it("catches break constraint first", () => {
    const ts = makeTimeslot({ isBreak: true });
    const result = checkAllHardConstraints(100, "M1-1", 1, ts, [], []);
    expect(result?.type).toBe("BREAK_SLOT");
  });

  it("catches teacher conflict", () => {
    const ts = makeTimeslot();
    const result = checkAllHardConstraints(
      100,
      "M2-1", // different grade
      2, // different room
      ts,
      [makeExisting()],
      [],
    );
    expect(result?.type).toBe("TEACHER_CONFLICT");
  });

  it("catches locked slot after break but before teacher (same grade level)", () => {
    const ts = makeTimeslot({ timeslotId: "1-2567-MON1" });
    const result = checkAllHardConstraints(
      200, // different teacher — no teacher conflict
      "M1-2", // same grade LEVEL as locked (M1) — triggers lock
      2, // different room — no room conflict
      ts,
      [makeExisting({ isLocked: true, timeslotId: "1-2567-MON1", gradeId: "M1-1" })],
      [],
    );
    expect(result?.type).toBe("LOCKED_SLOT");
  });

  it("does not catch locked slot for different grade level", () => {
    const ts = makeTimeslot({ timeslotId: "1-2567-MON1" });
    const result = checkAllHardConstraints(
      200, // different teacher — no teacher conflict
      "M2-1", // different grade LEVEL (M2 vs M1) — lock should NOT trigger
      2, // different room — no room conflict
      ts,
      [makeExisting({ isLocked: true, timeslotId: "1-2567-MON1", gradeId: "M1-1" })],
      [],
    );
    // No locked slot since M2 ≠ M1, and no other conflicts (different teacher, grade, room)
    expect(result).toBeNull();
  });
});

// ─── Soft Constraints ────────────────────────────────────────────

describe("scoreSoftConstraints", () => {
  it("returns a score between 0 and 100", () => {
    const ts = makeTimeslot();
    const score = scoreSoftConstraints(ts, "ค21101", "M1-1", [], []);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("gives higher score for earlier periods", () => {
    const early = makeTimeslot({ period: 1 });
    const late = makeTimeslot({ period: 8, timeslotId: "1-2567-MON8" });

    const earlyScore = scoreSoftConstraints(early, "ค21101", "M1-1", [], []);
    const lateScore = scoreSoftConstraints(late, "ค21101", "M1-1", [], []);

    expect(earlyScore).toBeGreaterThan(lateScore);
  });

  it("penalizes same subject on same day", () => {
    const ts = makeTimeslot({ timeslotId: "1-2567-MON3", period: 3 });
    const existingOnSameDay = makeExisting({
      subjectCode: "ค21101",
      gradeId: "M1-1",
      timeslotId: "1-2567-MON1",
    });

    const withDuplicate = scoreSoftConstraints(
      ts,
      "ค21101",
      "M1-1",
      [],
      [existingOnSameDay],
    );
    const withoutDuplicate = scoreSoftConstraints(ts, "ค21101", "M1-1", [], []);

    expect(withoutDuplicate).toBeGreaterThan(withDuplicate);
  });
});
