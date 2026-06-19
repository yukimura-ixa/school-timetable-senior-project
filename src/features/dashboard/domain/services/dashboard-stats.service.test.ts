import { describe, it, expect } from "vitest";
import type { class_schedule } from "@/prisma/generated/client";
import type { SlotConfig } from "@/features/timeslot/domain/models/break.types";
import {
  countTeachersWithSchedules,
  countClassCompletion,
  calculateTeacherWorkload,
  calculateSubjectDistribution,
  findIncompletGrades,
  detectConflicts,
} from "./dashboard-stats.service";

const makeSchedule = (
  overrides: Partial<class_schedule> = {},
): class_schedule => ({
  ClassID: 1,
  TimeslotID: "1-2567-MON1",
  SubjectCode: "MATH101",
  RoomID: 1,
  GradeID: "M1-1",
  IsLocked: false,
  ...overrides,
});

type ScheduleWithTeachers = class_schedule & {
  teachers_responsibility?: Array<{ TeacherID: number }>;
};

const makeScheduleWithTeachers = (
  overrides: Partial<ScheduleWithTeachers> = {},
): ScheduleWithTeachers => ({
  ...makeSchedule(),
  teachers_responsibility: [{ TeacherID: 1 }],
  ...overrides,
});

describe("countTeachersWithSchedules", () => {
  it("returns all without when no schedules", () => {
    const result = countTeachersWithSchedules([], 5);
    expect(result).toEqual({ withSchedules: 0, withoutSchedules: 5 });
  });

  it("counts unique teachers from responsibilities", () => {
    const schedules: ScheduleWithTeachers[] = [
      makeScheduleWithTeachers({
        teachers_responsibility: [{ TeacherID: 1 }, { TeacherID: 2 }],
      }),
      makeScheduleWithTeachers({
        ClassID: 2,
        teachers_responsibility: [{ TeacherID: 1 }],
      }),
    ];
    const result = countTeachersWithSchedules(schedules, 5);
    expect(result).toEqual({ withSchedules: 2, withoutSchedules: 3 });
  });

  it("handles schedules without teachers_responsibility", () => {
    const schedules: ScheduleWithTeachers[] = [
      { ...makeSchedule(), teachers_responsibility: undefined },
    ];
    const result = countTeachersWithSchedules(schedules, 3);
    expect(result).toEqual({ withSchedules: 0, withoutSchedules: 3 });
  });
});

describe("countClassCompletion", () => {
  it("counts all as none when no schedules", () => {
    const grades = [{ GradeID: "M1-1" }, { GradeID: "M1-2" }];
    const result = countClassCompletion([], grades, 10);
    expect(result).toEqual({ full: 0, partial: 0, none: 2 });
  });

  it("counts full when schedules >= totalTimeslots", () => {
    const schedules = Array.from({ length: 10 }, (_, i) =>
      makeSchedule({ ClassID: i + 1, GradeID: "M1-1" }),
    );
    const grades = [{ GradeID: "M1-1" }];
    const result = countClassCompletion(schedules, grades, 10);
    expect(result).toEqual({ full: 1, partial: 0, none: 0 });
  });

  it("counts mixed completion states", () => {
    const schedules = [
      ...Array.from({ length: 10 }, (_, i) =>
        makeSchedule({ ClassID: i + 1, GradeID: "M1-1" }),
      ),
      ...Array.from({ length: 3 }, (_, i) =>
        makeSchedule({ ClassID: 100 + i, GradeID: "M1-2" }),
      ),
    ];
    const grades = [
      { GradeID: "M1-1" },
      { GradeID: "M1-2" },
      { GradeID: "M1-3" },
    ];
    const result = countClassCompletion(schedules, grades, 10);
    expect(result).toEqual({ full: 1, partial: 1, none: 1 });
  });
});

describe("calculateTeacherWorkload", () => {
  const teachers = [
    {
      TeacherID: 1,
      Prefix: "นาย",
      Firstname: "สมชาย",
      Lastname: "ใจดี",
      Department: "คณิตศาสตร์",
    },
    {
      TeacherID: 2,
      Prefix: "นาง",
      Firstname: "สมหญิง",
      Lastname: "รักเรียน",
      Department: "วิทยาศาสตร์",
    },
  ];

  it("calculates workload for teachers with schedules", () => {
    const schedules: ScheduleWithTeachers[] = [
      makeScheduleWithTeachers({
        GradeID: "M1-1",
        teachers_responsibility: [{ TeacherID: 1 }],
      }),
      makeScheduleWithTeachers({
        ClassID: 2,
        GradeID: "M1-2",
        teachers_responsibility: [{ TeacherID: 1 }],
      }),
    ];
    const result = calculateTeacherWorkload(schedules, teachers);
    expect(result[0]!.teacherId).toBe(1);
    expect(result[0]!.scheduledHours).toBe(2);
    expect(result[0]!.classCount).toBe(2);
    expect(result[1]!.scheduledHours).toBe(0);
  });

  it("caps utilization at 100%", () => {
    const schedules: ScheduleWithTeachers[] = Array.from(
      { length: 30 },
      (_, i) =>
        makeScheduleWithTeachers({
          ClassID: i + 1,
          teachers_responsibility: [{ TeacherID: 1 }],
        }),
    );
    const result = calculateTeacherWorkload(schedules, [teachers[0]!]);
    expect(result[0]!.utilizationRate).toBe(100);
  });

  it("sorts by scheduledHours descending", () => {
    const schedules: ScheduleWithTeachers[] = [
      makeScheduleWithTeachers({
        teachers_responsibility: [{ TeacherID: 2 }],
      }),
      ...Array.from({ length: 3 }, (_, i) =>
        makeScheduleWithTeachers({
          ClassID: 10 + i,
          teachers_responsibility: [{ TeacherID: 1 }],
        }),
      ),
    ];
    const result = calculateTeacherWorkload(schedules, teachers);
    expect(result[0]!.teacherId).toBe(1);
    expect(result[1]!.teacherId).toBe(2);
  });
});

describe("calculateSubjectDistribution", () => {
  const subjects = [
    { SubjectCode: "MATH101", SubjectName: "คณิตศาสตร์" },
    { SubjectCode: "SCI201", SubjectName: "วิทยาศาสตร์" },
  ];

  it("calculates distribution for single subject", () => {
    const schedules = [makeSchedule(), makeSchedule({ ClassID: 2 })];
    const result = calculateSubjectDistribution(schedules, subjects);
    expect(result).toHaveLength(1);
    expect(result[0]!.subjectCode).toBe("MATH101");
    expect(result[0]!.totalHours).toBe(2);
    expect(result[0]!.percentage).toBe(100);
  });

  it("calculates percentages for multiple subjects", () => {
    const schedules = [
      makeSchedule({ ClassID: 1 }),
      makeSchedule({ ClassID: 2 }),
      makeSchedule({ ClassID: 3, SubjectCode: "SCI201", GradeID: "M2-1" }),
    ];
    const result = calculateSubjectDistribution(schedules, subjects);
    expect(result).toHaveLength(2);
    expect(result[0]!.subjectCode).toBe("MATH101");
    expect(result[0]!.percentage).toBe(66.7);
    expect(result[1]!.subjectCode).toBe("SCI201");
    expect(result[1]!.percentage).toBe(33.3);
  });

  it("falls back to SubjectCode when name not found", () => {
    const schedules = [
      makeSchedule({ SubjectCode: "UNKNOWN" }),
    ];
    const result = calculateSubjectDistribution(schedules, subjects);
    expect(result[0]!.subjectName).toBe("UNKNOWN");
  });

  it("counts unique grades as classCount", () => {
    const schedules = [
      makeSchedule({ ClassID: 1, GradeID: "M1-1" }),
      makeSchedule({ ClassID: 2, GradeID: "M1-1" }),
      makeSchedule({ ClassID: 3, GradeID: "M1-2" }),
    ];
    const result = calculateSubjectDistribution(schedules, subjects);
    expect(result[0]!.classCount).toBe(2);
  });
});

describe("findIncompletGrades", () => {
  const makeGrade = (id: string, year: number, num: number) => ({
    GradeID: id,
    Year: year,
    Number: num,
    StudentCount: 30,
    ProgramID: null,
  });

  // N teaching timeslots for one day (no breaks); TimeslotID period suffix MON1..MONn
  const timeslots = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ TimeslotID: `1-2567-MON${i + 1}` }));
  const noSlots: SlotConfig[] = [];
  const noIndex = new Map<string, Set<string>>();

  it("returns empty when all grades are complete", () => {
    const schedules = Array.from({ length: 10 }, (_, i) =>
      makeSchedule({ ClassID: i + 1, GradeID: "M1-1", TimeslotID: `1-2567-MON${i + 1}` }),
    );
    const grades = [makeGrade("M1-1", 1, 1)];
    const result = findIncompletGrades(schedules, grades, timeslots(10), noSlots, noIndex, new Map());
    expect(result).toHaveLength(0);
  });

  it("returns incomplete grades with missing subjects", () => {
    const schedules = [
      makeSchedule({ ClassID: 1, GradeID: "M1-1", SubjectCode: "MATH101", TimeslotID: "1-2567-MON1" }),
    ];
    const grades = [makeGrade("M1-1", 1, 1)];
    const required = new Map([["M1-1", ["MATH101", "SCI201", "ENG301"]]]);
    const result = findIncompletGrades(schedules, grades, timeslots(10), noSlots, noIndex, required);
    expect(result).toHaveLength(1);
    expect(result[0]!.missingSubjects).toEqual(["SCI201", "ENG301"]);
    expect(result[0]!.scheduledHours).toBe(1);
  });

  it("includes grades with zero schedules", () => {
    const grades = [makeGrade("M1-1", 1, 1)];
    const result = findIncompletGrades([], grades, timeslots(10), noSlots, noIndex, new Map());
    expect(result).toHaveLength(1);
    expect(result[0]!.completionRate).toBe(0);
  });

  // 7dc: staggered per-grade breaks (junior lunch at p2, senior lunch at p4)
  describe("staggered per-grade breaks", () => {
    const slots: SlotConfig[] = [
      { duration: 50 },
      { duration: 50, breakGroups: ["junior"] },
      { duration: 50 },
      { duration: 50, breakGroups: ["senior"] },
      { duration: 50 },
    ];
    const index = new Map<string, Set<string>>([
      ["M1-1", new Set(["junior"])],
      ["M4-1", new Set(["senior"])],
    ]);
    const ts = timeslots(5); // MON1..MON5

    it("excludes only the grade's own break from requiredHours", () => {
      const jr = findIncompletGrades([], [makeGrade("M1-1", 1, 1)], ts, slots, index, new Map())[0]!;
      const sr = findIncompletGrades([], [makeGrade("M4-1", 4, 1)], ts, slots, index, new Map())[0]!;
      // junior teaches p1,p3,p4,p5 (not its p2); senior teaches p1,p2,p3,p5 (not its p4)
      expect(jr.requiredHours).toBe(4);
      expect(sr.requiredHours).toBe(4);
    });

    it("does not let a class in a break slot inflate completion (symmetry)", () => {
      // senior fills teaching p1,p3,p5 + a locked activity in its break p4; p2 left empty
      const schedules = [
        makeSchedule({ ClassID: 1, GradeID: "M4-1", TimeslotID: "1-2567-MON1" }),
        makeSchedule({ ClassID: 2, GradeID: "M4-1", TimeslotID: "1-2567-MON3" }),
        makeSchedule({ ClassID: 3, GradeID: "M4-1", TimeslotID: "1-2567-MON5" }),
        makeSchedule({ ClassID: 4, GradeID: "M4-1", TimeslotID: "1-2567-MON4", IsLocked: true }),
      ];
      const result = findIncompletGrades(schedules, [makeGrade("M4-1", 4, 1)], ts, slots, index, new Map())[0]!;
      expect(result.scheduledHours).toBe(3); // break-slot activity (p4) not counted
      expect(result.requiredHours).toBe(4);
      expect(result.completionRate).toBeLessThan(100); // not inflated to complete
    });

    it("is complete when all teaching slots are filled", () => {
      const schedules = [1, 2, 3, 5].map((p, i) =>
        makeSchedule({ ClassID: i + 1, GradeID: "M4-1", TimeslotID: `1-2567-MON${p}` }),
      );
      const result = findIncompletGrades(schedules, [makeGrade("M4-1", 4, 1)], ts, slots, index, new Map());
      expect(result).toHaveLength(0);
    });
  });
});

describe("detectConflicts", () => {
  it("returns zeros when no conflicts", () => {
    const schedules: ScheduleWithTeachers[] = [
      makeScheduleWithTeachers({
        TimeslotID: "TS-1",
        GradeID: "M1-1",
        RoomID: 1,
        teachers_responsibility: [{ TeacherID: 1 }],
      }),
      makeScheduleWithTeachers({
        ClassID: 2,
        TimeslotID: "TS-2",
        GradeID: "M1-1",
        RoomID: 1,
        teachers_responsibility: [{ TeacherID: 1 }],
      }),
    ];
    const result = detectConflicts(schedules);
    expect(result).toEqual({
      teacherConflicts: 0,
      classConflicts: 0,
      roomConflicts: 0,
    });
  });

  it("detects teacher conflict at same timeslot", () => {
    const schedules: ScheduleWithTeachers[] = [
      makeScheduleWithTeachers({
        TimeslotID: "TS-1",
        GradeID: "M1-1",
        RoomID: 1,
        teachers_responsibility: [{ TeacherID: 1 }],
      }),
      makeScheduleWithTeachers({
        ClassID: 2,
        TimeslotID: "TS-1",
        GradeID: "M1-2",
        RoomID: 2,
        teachers_responsibility: [{ TeacherID: 1 }],
      }),
    ];
    const result = detectConflicts(schedules);
    expect(result.teacherConflicts).toBe(1);
  });

  it("detects class conflict (same grade at same timeslot)", () => {
    const schedules: ScheduleWithTeachers[] = [
      makeScheduleWithTeachers({
        TimeslotID: "TS-1",
        GradeID: "M1-1",
        RoomID: 1,
      }),
      makeScheduleWithTeachers({
        ClassID: 2,
        TimeslotID: "TS-1",
        GradeID: "M1-1",
        RoomID: 2,
      }),
    ];
    const result = detectConflicts(schedules);
    expect(result.classConflicts).toBe(1);
  });

  it("detects room conflict at same timeslot", () => {
    const schedules: ScheduleWithTeachers[] = [
      makeScheduleWithTeachers({
        TimeslotID: "TS-1",
        GradeID: "M1-1",
        RoomID: 5,
        teachers_responsibility: [{ TeacherID: 1 }],
      }),
      makeScheduleWithTeachers({
        ClassID: 2,
        TimeslotID: "TS-1",
        GradeID: "M1-2",
        RoomID: 5,
        teachers_responsibility: [{ TeacherID: 2 }],
      }),
    ];
    const result = detectConflicts(schedules);
    expect(result.roomConflicts).toBe(1);
  });

  it("skips room conflict when RoomID is null", () => {
    const schedules: ScheduleWithTeachers[] = [
      makeScheduleWithTeachers({
        TimeslotID: "TS-1",
        GradeID: "M1-1",
        RoomID: null,
      }),
      makeScheduleWithTeachers({
        ClassID: 2,
        TimeslotID: "TS-1",
        GradeID: "M1-2",
        RoomID: null,
      }),
    ];
    const result = detectConflicts(schedules);
    expect(result.roomConflicts).toBe(0);
  });
});
