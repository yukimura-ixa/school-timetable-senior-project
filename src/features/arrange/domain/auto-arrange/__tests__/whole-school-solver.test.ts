/**
 * Whole-School Auto-Solve Orchestration Tests
 *
 * Orchestrates the per-teacher greedy `solve()` across all teachers in one pass.
 * Core correctness property: each teacher's placements must be visible to every
 * subsequent teacher (as existing schedules) so no two teachers double-book the
 * same room or grade slot.
 */
import { describe, expect, it } from "vitest";

import { solveWholeSchool } from "../whole-school-solver";
import type {
  AvailableRoom,
  AvailableTimeslot,
  UnplacedSubject,
} from "../types";
import type {
  TeacherSolveTask,
  WholeSchoolSolverInput,
} from "../whole-school-solver";

// ─── Helpers ─────────────────────────────────────────────────────

function makeTimeslots(periodsPerDay: number): AvailableTimeslot[] {
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const slots: AvailableTimeslot[] = [];
  for (const day of days) {
    for (let p = 1; p <= periodsPerDay; p++) {
      slots.push({
        timeslotId: `1-2567-${day}${p}`,
        day,
        period: p,
        isBreak: false,
      });
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

function makeSubject(overrides: Partial<UnplacedSubject> = {}): UnplacedSubject {
  return {
    respId: 1,
    subjectCode: "ค21101",
    subjectName: "คณิตศาสตร์",
    gradeId: "M1-1",
    gradeName: "1/1",
    periodsPerWeek: 1,
    periodsAlreadyPlaced: 0,
    ...overrides,
  };
}

function makeInput(
  teachers: TeacherSolveTask[],
  overrides: Partial<WholeSchoolSolverInput> = {},
): WholeSchoolSolverInput {
  return {
    academicYear: 2567,
    semester: "1",
    teachers,
    timeslots: makeTimeslots(8),
    existingSchedules: [],
    rooms: makeRooms(5),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────

describe("solveWholeSchool", () => {
  it("returns empty success result when there are no teachers", () => {
    const result = solveWholeSchool(makeInput([]));

    expect(result.success).toBe(true);
    expect(result.placements).toHaveLength(0);
    expect(result.failures).toHaveLength(0);
    expect(result.perTeacher).toHaveLength(0);
    expect(result.stats.totalSubjectsToPlace).toBe(0);
  });

  it("places independent teachers and aggregates their stats", () => {
    const result = solveWholeSchool(
      makeInput([
        {
          teacherId: 100,
          unplacedSubjects: [
            makeSubject({ respId: 1, gradeId: "M1-1", periodsPerWeek: 2 }),
          ],
        },
        {
          teacherId: 200,
          unplacedSubjects: [
            makeSubject({
              respId: 2,
              subjectCode: "ท21101",
              gradeId: "M2-1",
              periodsPerWeek: 3,
            }),
          ],
        },
      ]),
    );

    expect(result.success).toBe(true);
    expect(result.placements).toHaveLength(5); // 2 + 3
    expect(result.failures).toHaveLength(0);
    expect(result.stats.totalSubjectsToPlace).toBe(5);
    expect(result.stats.successfullyPlaced).toBe(5);
    expect(result.stats.failed).toBe(0);
    expect(result.perTeacher).toHaveLength(2);
  });

  it("prevents two teachers from booking the same room at the same time", () => {
    // One room, one usable slot, two teachers teaching DIFFERENT grades.
    // No grade/teacher conflict — only the shared room is contested.
    const result = solveWholeSchool(
      makeInput(
        [
          {
            teacherId: 100,
            unplacedSubjects: [makeSubject({ respId: 1, gradeId: "M1-1" })],
          },
          {
            teacherId: 200,
            unplacedSubjects: [
              makeSubject({
                respId: 2,
                subjectCode: "ท21101",
                gradeId: "M2-1",
              }),
            ],
          },
        ],
        {
          timeslots: [
            { timeslotId: "1-2567-MON1", day: "MON", period: 1, isBreak: false },
          ],
          rooms: makeRooms(1),
        },
      ),
    );

    expect(result.placements).toHaveLength(1);
    expect(result.failures).toHaveLength(1);
    expect(result.success).toBe(false);
    expect(result.failures[0]?.reason).toContain("ช่วงเวลา");
  });

  it("prevents two teachers from booking the same grade at the same time", () => {
    // Same grade taught by two teachers, single usable slot, two rooms.
    // Room is free, but the grade can only have one subject at MON1.
    const result = solveWholeSchool(
      makeInput(
        [
          {
            teacherId: 100,
            unplacedSubjects: [makeSubject({ respId: 1, gradeId: "M1-1" })],
          },
          {
            teacherId: 200,
            unplacedSubjects: [
              makeSubject({
                respId: 2,
                subjectCode: "ท21101",
                gradeId: "M1-1",
              }),
            ],
          },
        ],
        {
          timeslots: [
            { timeslotId: "1-2567-MON1", day: "MON", period: 1, isBreak: false },
          ],
          rooms: makeRooms(2),
        },
      ),
    );

    expect(result.placements).toHaveLength(1);
    expect(result.failures).toHaveLength(1);
  });

  it("orders most-constrained (heaviest-load) teachers first", () => {
    // Single room, single slot, different grades → only one placement possible.
    // Heavier teacher (3 periods) must win the contested slot over the lighter
    // teacher (1 period), because heaviest load is scheduled while grid emptiest.
    const result = solveWholeSchool(
      makeInput(
        [
          {
            teacherId: 100, // lighter: 1 period
            unplacedSubjects: [
              makeSubject({ respId: 1, gradeId: "M1-1", periodsPerWeek: 1 }),
            ],
          },
          {
            teacherId: 200, // heavier: 3 periods
            unplacedSubjects: [
              makeSubject({
                respId: 2,
                subjectCode: "ท21101",
                gradeId: "M2-1",
                periodsPerWeek: 3,
              }),
            ],
          },
        ],
        {
          timeslots: [
            { timeslotId: "1-2567-MON1", day: "MON", period: 1, isBreak: false },
          ],
          rooms: makeRooms(1),
        },
      ),
    );

    expect(result.placements).toHaveLength(1);
    expect(result.placements[0]?.respId).toBe(2); // heavier teacher won
  });

  it("honors the per-grade break guard (skips a grade's staggered break slot)", () => {
    // 3 periods, period 2 = junior lunch. M1-1 is in the junior group, so its
    // subject must never be placed at period 2 (7dc).
    const result = solveWholeSchool(
      makeInput(
        [
          {
            teacherId: 100,
            unplacedSubjects: [
              makeSubject({ respId: 1, gradeId: "M1-1", periodsPerWeek: 3 }),
            ],
          },
        ],
        {
          timeslots: [
            { timeslotId: "1-2567-MON1", day: "MON", period: 1, isBreak: false },
            { timeslotId: "1-2567-MON2", day: "MON", period: 2, isBreak: false },
            { timeslotId: "1-2567-MON3", day: "MON", period: 3, isBreak: false },
          ],
          rooms: makeRooms(1),
          breakGuard: {
            slotConfigs: [
              { duration: 50 },
              { duration: 50, breakGroups: ["junior"] },
              { duration: 50 },
            ],
            gradeBreakIndex: new Map([["M1-1", new Set(["junior"])]]),
          },
        },
      ),
    );

    expect(
      result.placements.some((p) => p.timeslotId === "1-2567-MON2"),
    ).toBe(false);
    expect(result.placements).toHaveLength(2); // only periods 1 and 3
  });

  it("reports per-teacher outcomes", () => {
    const result = solveWholeSchool(
      makeInput([
        {
          teacherId: 100,
          unplacedSubjects: [
            makeSubject({ respId: 1, gradeId: "M1-1", periodsPerWeek: 2 }),
          ],
        },
      ]),
    );

    const outcome = result.perTeacher.find((t) => t.teacherId === 100);
    expect(outcome).toBeDefined();
    expect(outcome?.placed).toBe(2);
    expect(outcome?.failed).toBe(0);
    expect(outcome?.totalToPlace).toBe(2);
  });
});
