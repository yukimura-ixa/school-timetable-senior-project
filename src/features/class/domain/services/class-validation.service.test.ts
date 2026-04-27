import { describe, it, expect } from "vitest";

import {
  validateScheduleParams,
  hasTeacherConflict,
  hasRoomConflict,
  hasGradeConflict,
  extractTeachersList,
  addTeachersToSchedules,
  validateClassId,
  isScheduleLocked,
  countSchedulesByTimeslot,
  filterByLockedStatus,
  groupSchedulesByGrade,
} from "./class-validation.service";

const makeTeacher = (id: number) => ({
  TeacherID: id,
  Prefix: "นาย",
  Firstname: "สมชาย",
  Lastname: "ใจดี",
  Department: "คณิตศาสตร์",
  Email: "test@test.com",
  Role: "TEACHER",
});

describe("validateScheduleParams", () => {
  it("returns valid for correct params", () => {
    const result = validateScheduleParams({
      AcademicYear: 2567,
      Semester: "SEMESTER_1",
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error when AcademicYear is missing", () => {
    const result = validateScheduleParams({ Semester: "SEMESTER_1" });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("AcademicYear is required");
  });

  it("returns error when AcademicYear is null", () => {
    const result = validateScheduleParams({
      AcademicYear: null,
      Semester: "SEMESTER_1",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("AcademicYear is required");
  });

  it("returns error when AcademicYear < 2500", () => {
    const result = validateScheduleParams({
      AcademicYear: 2499,
      Semester: "SEMESTER_1",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("AcademicYear must be at least 2500");
  });

  it("accepts AcademicYear exactly 2500", () => {
    const result = validateScheduleParams({
      AcademicYear: 2500,
      Semester: "SEMESTER_2",
    });
    expect(result.isValid).toBe(true);
  });

  it("returns error when Semester is missing", () => {
    const result = validateScheduleParams({ AcademicYear: 2567 });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Semester is required");
  });

  it("returns error when Semester is invalid", () => {
    const result = validateScheduleParams({
      AcademicYear: 2567,
      Semester: "SUMMER",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Semester must be SEMESTER_1 or SEMESTER_2");
  });

  it("returns error when TeacherID < 1", () => {
    const result = validateScheduleParams({
      AcademicYear: 2567,
      Semester: "SEMESTER_1",
      TeacherID: 0,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("TeacherID must be a positive integer");
  });

  it("accepts TeacherID >= 1", () => {
    const result = validateScheduleParams({
      AcademicYear: 2567,
      Semester: "SEMESTER_1",
      TeacherID: 1,
    });
    expect(result.isValid).toBe(true);
  });

  it("returns error for invalid GradeID format", () => {
    const result = validateScheduleParams({
      AcademicYear: 2567,
      Semester: "SEMESTER_1",
      GradeID: "Grade1",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("GradeID must be in format");
  });

  it("accepts valid GradeID format", () => {
    const result = validateScheduleParams({
      AcademicYear: 2567,
      Semester: "SEMESTER_1",
      GradeID: "M1-1",
    });
    expect(result.isValid).toBe(true);
  });

  it("accepts when GradeID is not provided", () => {
    const result = validateScheduleParams({
      AcademicYear: 2567,
      Semester: "SEMESTER_1",
    });
    expect(result.isValid).toBe(true);
  });

  it("collects multiple errors at once", () => {
    const result = validateScheduleParams({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});

describe("hasTeacherConflict", () => {
  const schedules = [
    {
      TimeslotID: "TS-1",
      teachers_responsibility: [{ TeacherID: 1 }, { TeacherID: 2 }],
    },
    {
      TimeslotID: "TS-2",
      teachers_responsibility: [{ TeacherID: 3 }],
    },
  ];

  it("returns false when no conflict", () => {
    expect(hasTeacherConflict(schedules, 99, "TS-1")).toBe(false);
  });

  it("returns true when conflict exists", () => {
    expect(hasTeacherConflict(schedules, 1, "TS-1")).toBe(true);
  });

  it("returns false for same teacher at different timeslot", () => {
    expect(hasTeacherConflict(schedules, 1, "TS-2")).toBe(false);
  });
});

describe("hasRoomConflict", () => {
  const schedules = [
    { TimeslotID: "TS-1", RoomID: 101 },
    { TimeslotID: "TS-2", RoomID: null },
  ];

  it("returns false when no conflict", () => {
    expect(hasRoomConflict(schedules, 999, "TS-1")).toBe(false);
  });

  it("returns true when conflict exists", () => {
    expect(hasRoomConflict(schedules, 101, "TS-1")).toBe(true);
  });

  it("returns false when RoomID is null", () => {
    expect(hasRoomConflict(schedules, 101, "TS-2")).toBe(false);
  });
});

describe("hasGradeConflict", () => {
  const schedules = [
    { TimeslotID: "TS-1", GradeID: "M1-1" },
    { TimeslotID: "TS-2", GradeID: "M2-1" },
  ];

  it("returns false when no conflict", () => {
    expect(hasGradeConflict(schedules, "M3-1", "TS-1")).toBe(false);
  });

  it("returns true when conflict exists", () => {
    expect(hasGradeConflict(schedules, "M1-1", "TS-1")).toBe(true);
  });
});

describe("extractTeachersList", () => {
  it("extracts a single teacher", () => {
    const schedule = {
      teachers_responsibility: [{ teacher: makeTeacher(1) }],
    };
    const result = extractTeachersList(schedule);
    expect(result).toHaveLength(1);
    expect(result[0]!.TeacherID).toBe(1);
  });

  it("deduplicates by TeacherID", () => {
    const schedule = {
      teachers_responsibility: [
        { teacher: makeTeacher(1) },
        { teacher: makeTeacher(1) },
        { teacher: makeTeacher(2) },
      ],
    };
    const result = extractTeachersList(schedule);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.TeacherID)).toEqual([1, 2]);
  });
});

describe("addTeachersToSchedules", () => {
  it("adds teachers field to each schedule", () => {
    const schedules = [
      {
        id: "a",
        teachers_responsibility: [
          { teacher: makeTeacher(1) },
          { teacher: makeTeacher(2) },
        ],
      },
      {
        id: "b",
        teachers_responsibility: [{ teacher: makeTeacher(3) }],
      },
    ];
    const result = addTeachersToSchedules(schedules);
    expect(result).toHaveLength(2);
    expect(result[0]!.teachers).toHaveLength(2);
    expect(result[1]!.teachers).toHaveLength(1);
    expect(result[0]!.teachers_responsibility).toBeDefined();
  });
});

describe("validateClassId", () => {
  it("returns true for a valid classId", () => {
    expect(validateClassId("TS-1-M1-1")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(validateClassId("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(validateClassId("   ")).toBe(false);
  });

  it("returns true for max-length string", () => {
    expect(validateClassId("a".repeat(100))).toBe(true);
  });

  it("returns false for string exceeding 100 chars", () => {
    expect(validateClassId("a".repeat(101))).toBe(false);
  });
});

describe("isScheduleLocked", () => {
  it("returns true when IsLocked is true", () => {
    expect(isScheduleLocked({ IsLocked: true })).toBe(true);
  });

  it("returns false when IsLocked is false", () => {
    expect(isScheduleLocked({ IsLocked: false })).toBe(false);
  });
});

describe("countSchedulesByTimeslot", () => {
  it("counts schedules per timeslot", () => {
    const schedules = [
      { TimeslotID: "TS-1" },
      { TimeslotID: "TS-1" },
      { TimeslotID: "TS-2" },
    ];
    const counts = countSchedulesByTimeslot(schedules);
    expect(counts.get("TS-1")).toBe(2);
    expect(counts.get("TS-2")).toBe(1);
  });

  it("returns empty map for empty array", () => {
    const counts = countSchedulesByTimeslot([]);
    expect(counts.size).toBe(0);
  });
});

describe("filterByLockedStatus", () => {
  const schedules = [
    { id: "a", IsLocked: true },
    { id: "b", IsLocked: false },
    { id: "c", IsLocked: true },
  ];

  it("filters locked schedules", () => {
    const result = filterByLockedStatus(schedules, true);
    expect(result).toHaveLength(2);
    expect(result.every((s) => s.IsLocked)).toBe(true);
  });

  it("filters unlocked schedules", () => {
    const result = filterByLockedStatus(schedules, false);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("b");
  });
});

describe("groupSchedulesByGrade", () => {
  it("groups schedules by GradeID", () => {
    const schedules = [
      { id: "a", GradeID: "M1-1" },
      { id: "b", GradeID: "M2-1" },
      { id: "c", GradeID: "M1-1" },
    ];
    const groups = groupSchedulesByGrade(schedules);
    expect(groups.size).toBe(2);
    expect(groups.get("M1-1")).toHaveLength(2);
    expect(groups.get("M2-1")).toHaveLength(1);
  });

  it("returns empty map for empty array", () => {
    const groups = groupSchedulesByGrade([]);
    expect(groups.size).toBe(0);
  });
});
