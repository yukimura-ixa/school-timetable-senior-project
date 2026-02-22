/**
 * Auto-Arrange Solver Tests
 */
import { describe, expect, it } from "vitest";

import { solve } from "../solver";
import type {
  AvailableRoom,
  AvailableTimeslot,
  ExistingSchedule,
  SolverInput,
  UnplacedSubject,
} from "../types";

// ─── Helpers ─────────────────────────────────────────────────────

function makeInput(overrides: Partial<SolverInput> = {}): SolverInput {
  return {
    teacherId: 100,
    academicYear: 2567,
    semester: "1",
    unplacedSubjects: [],
    timeslots: [],
    existingSchedules: [],
    rooms: [],
    ...overrides,
  };
}

function makeTimeslots(count: number): AvailableTimeslot[] {
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const slots: AvailableTimeslot[] = [];
  let id = 0;
  for (const day of days) {
    for (let p = 1; p <= count; p++) {
      slots.push({
        timeslotId: `1-2567-${day}${p}`,
        day,
        period: p,
        isBreak: false,
      });
      id++;
    }
  }
  return slots;
}

function makeRooms(count: number): AvailableRoom[] {
  return Array.from({ length: count }, (_, i) => ({
    roomId: i + 1,
    roomName: `Room ${i + 1}`,
  }));
}

function makeSubject(
  overrides: Partial<UnplacedSubject> = {},
): UnplacedSubject {
  return {
    respId: 1,
    subjectCode: "ค21101",
    subjectName: "คณิตศาสตร์",
    gradeId: "M1-1",
    gradeName: "1/1",
    periodsPerWeek: 3,
    periodsAlreadyPlaced: 0,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────

describe("solve", () => {
  it("returns empty result when no subjects to place", () => {
    const result = solve(makeInput());
    expect(result.success).toBe(true);
    expect(result.placements).toHaveLength(0);
    expect(result.failures).toHaveLength(0);
  });

  it("places a single subject in available timeslots", () => {
    const input = makeInput({
      unplacedSubjects: [makeSubject({ periodsPerWeek: 1 })],
      timeslots: makeTimeslots(8), // 5 days × 8 periods = 40 slots
      rooms: makeRooms(3),
    });

    const result = solve(input);

    expect(result.success).toBe(true);
    expect(result.placements).toHaveLength(1);
    expect(result.placements[0]?.subjectCode).toBe("ค21101");
    expect(result.placements[0]?.gradeId).toBe("M1-1");
    expect(result.placements[0]?.roomId).toBeGreaterThan(0);
  });

  it("places multiple periods of the same subject", () => {
    const input = makeInput({
      unplacedSubjects: [makeSubject({ periodsPerWeek: 3 })],
      timeslots: makeTimeslots(8),
      rooms: makeRooms(3),
    });

    const result = solve(input);

    expect(result.success).toBe(true);
    expect(result.placements).toHaveLength(3);
    // All placements should be for the same subject
    expect(result.placements.every((p) => p.subjectCode === "ค21101")).toBe(
      true,
    );
  });

  it("respects teacher conflicts (no double-booking)", () => {
    const existingSchedule: ExistingSchedule = {
      classId: 1,
      timeslotId: "1-2567-MON1",
      subjectCode: "ว21101",
      gradeId: "M1-2",
      teacherId: 100,
      roomId: 1,
      isLocked: false,
    };

    const input = makeInput({
      unplacedSubjects: [makeSubject({ periodsPerWeek: 1 })],
      timeslots: [
        {
          timeslotId: "1-2567-MON1",
          day: "MON",
          period: 1,
          isBreak: false,
        },
        {
          timeslotId: "1-2567-MON2",
          day: "MON",
          period: 2,
          isBreak: false,
        },
      ],
      existingSchedules: [existingSchedule],
      rooms: makeRooms(3),
    });

    const result = solve(input);

    expect(result.success).toBe(true);
    expect(result.placements).toHaveLength(1);
    // Must NOT be placed in MON1 (teacher conflict)
    expect(result.placements[0]?.timeslotId).toBe("1-2567-MON2");
  });

  it("respects break timeslots", () => {
    const input = makeInput({
      unplacedSubjects: [makeSubject({ periodsPerWeek: 1 })],
      timeslots: [
        {
          timeslotId: "1-2567-MON1",
          day: "MON",
          period: 1,
          isBreak: true, // ← break!
        },
        {
          timeslotId: "1-2567-MON2",
          day: "MON",
          period: 2,
          isBreak: false,
        },
      ],
      rooms: makeRooms(1),
    });

    const result = solve(input);

    expect(result.success).toBe(true);
    expect(result.placements).toHaveLength(1);
    expect(result.placements[0]?.timeslotId).toBe("1-2567-MON2");
  });

  it("respects grade conflicts (no two subjects for same class)", () => {
    const existingSchedule: ExistingSchedule = {
      classId: 2,
      timeslotId: "1-2567-MON1",
      subjectCode: "ท21101",
      gradeId: "M1-1", // same grade
      teacherId: 200, // different teacher
      roomId: 2,
      isLocked: false,
    };

    const input = makeInput({
      unplacedSubjects: [makeSubject({ periodsPerWeek: 1 })],
      timeslots: [
        {
          timeslotId: "1-2567-MON1",
          day: "MON",
          period: 1,
          isBreak: false,
        },
        {
          timeslotId: "1-2567-MON2",
          day: "MON",
          period: 2,
          isBreak: false,
        },
      ],
      existingSchedules: [existingSchedule],
      rooms: makeRooms(3),
    });

    const result = solve(input);

    expect(result.success).toBe(true);
    // Must NOT be placed in MON1 (grade conflict)
    expect(result.placements[0]?.timeslotId).toBe("1-2567-MON2");
  });

  it("reports failure when impossible to place", () => {
    const input = makeInput({
      unplacedSubjects: [makeSubject({ periodsPerWeek: 1 })],
      timeslots: [
        {
          timeslotId: "1-2567-MON1",
          day: "MON",
          period: 1,
          isBreak: true, // only slot is a break
        },
      ],
      rooms: makeRooms(1),
    });

    const result = solve(input);

    expect(result.success).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.placements).toHaveLength(0);
  });

  it("handles no available rooms", () => {
    const input = makeInput({
      unplacedSubjects: [makeSubject({ periodsPerWeek: 1 })],
      timeslots: makeTimeslots(2),
      rooms: [], // no rooms!
    });

    const result = solve(input);

    expect(result.success).toBe(false);
    expect(result.failures).toHaveLength(1);
  });

  it("places multiple subjects without conflicts", () => {
    const input = makeInput({
      unplacedSubjects: [
        makeSubject({
          respId: 1,
          subjectCode: "ค21101",
          gradeId: "M1-1",
          periodsPerWeek: 2,
        }),
        makeSubject({
          respId: 2,
          subjectCode: "ท21101",
          gradeId: "M1-1",
          periodsPerWeek: 2,
        }),
      ],
      timeslots: makeTimeslots(8),
      rooms: makeRooms(5),
    });

    const result = solve(input);

    expect(result.success).toBe(true);
    expect(result.placements).toHaveLength(4);

    // No two placements should share a timeslot for the same grade
    const timeslotsByGrade = new Map<string, string[]>();
    for (const p of result.placements) {
      const key = p.gradeId;
      if (!timeslotsByGrade.has(key)) timeslotsByGrade.set(key, []);
      timeslotsByGrade.get(key)!.push(p.timeslotId);
    }
    for (const [, timeslots] of timeslotsByGrade) {
      const unique = new Set(timeslots);
      expect(unique.size).toBe(timeslots.length);
    }
  });

  it("returns stats with timing info", () => {
    const input = makeInput({
      unplacedSubjects: [makeSubject({ periodsPerWeek: 1 })],
      timeslots: makeTimeslots(4),
      rooms: makeRooms(2),
    });

    const result = solve(input);

    expect(result.stats.totalSubjectsToPlace).toBe(1);
    expect(result.stats.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.stats.qualityScore).toBeGreaterThanOrEqual(0);
    expect(result.stats.qualityScore).toBeLessThanOrEqual(100);
  });

  it("skips already-placed periods", () => {
    const input = makeInput({
      unplacedSubjects: [
        makeSubject({
          periodsPerWeek: 3,
          periodsAlreadyPlaced: 2, // only 1 remaining
        }),
      ],
      timeslots: makeTimeslots(8),
      rooms: makeRooms(3),
    });

    const result = solve(input);

    expect(result.success).toBe(true);
    expect(result.placements).toHaveLength(1); // only 1 period needed
  });

  it("completes within 10 seconds for moderate input", () => {
    // 10 subjects × 3 periods = 30 placement jobs
    const subjects = Array.from({ length: 10 }, (_, i) =>
      makeSubject({
        respId: i + 1,
        subjectCode: `ว${20 + i}101`,
        gradeId: `M1-${(i % 3) + 1}`,
        periodsPerWeek: 3,
      }),
    );

    const input = makeInput({
      unplacedSubjects: subjects,
      timeslots: makeTimeslots(8),
      rooms: makeRooms(10),
    });

    const start = Date.now();
    const result = solve(input);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(10_000);
    expect(result.stats.durationMs).toBeLessThan(10_000);
  });
});
