import { describe, it, expect } from "vitest";
import {
  groupSchedulesBySubject,
  validateLockInput,
  calculateTotalSchedules,
} from "./lock-validation.service";
import type { RawLockedSchedule } from "../../infrastructure/repositories/lock.repository";

const makeSchedule = (
  overrides: Partial<RawLockedSchedule> = {},
): RawLockedSchedule => ({
  ClassID: 1,
  TimeslotID: "1-2567-MON1",
  SubjectCode: "MATH101",
  RoomID: 1,
  GradeID: "M1-1",
  IsLocked: true,
  subject: {
    SubjectName: "คณิตศาสตร์",
    teachers_responsibility: [
      {
        RespID: 1,
        teacher: {
          TeacherID: 1,
          Firstname: "สมชาย",
          Lastname: "ใจดี",
          Department: "คณิตศาสตร์",
          Email: "somchai@school.ac.th",
          Role: "TEACHER",
        },
      },
    ],
  },
  room: { RoomID: 1, RoomName: "101", Building: "A", Floor: 1 },
  timeslot: {
    TimeslotID: "1-2567-MON1",
    DayOfWeek: "MON",
    AcademicYear: 2567,
    Semester: "SEMESTER_1",
    StartTime: new Date("2024-05-01T08:30:00"),
    EndTime: new Date("2024-05-01T09:20:00"),
    BreakTime: "NOT_BREAK",
  },
  ...overrides,
});

describe("lock-validation.service", () => {
  describe("validateLockInput", () => {
    it("returns null for valid input", () => {
      expect(
        validateLockInput({
          timeslots: ["T1"],
          GradeIDs: ["M1-1"],
          RespIDs: [1],
        }),
      ).toBeNull();
    });

    it("rejects empty timeslots", () => {
      expect(
        validateLockInput({ timeslots: [], GradeIDs: ["M1-1"], RespIDs: [1] }),
      ).toBe("ต้องระบุคาบเรียนอย่างน้อย 1 คาบ");
    });

    it("rejects empty GradeIDs", () => {
      expect(
        validateLockInput({ timeslots: ["T1"], GradeIDs: [], RespIDs: [1] }),
      ).toBe("ต้องระบุระดับชั้นอย่างน้อย 1 ระดับ");
    });

    it("rejects empty RespIDs", () => {
      expect(
        validateLockInput({ timeslots: ["T1"], GradeIDs: ["M1-1"], RespIDs: [] }),
      ).toBe("ต้องระบุความรับผิดชอบอย่างน้อย 1 รายการ");
    });

    it("checks timeslots first when multiple fields empty", () => {
      const result = validateLockInput({
        timeslots: [],
        GradeIDs: [],
        RespIDs: [],
      });
      expect(result).toBe("ต้องระบุคาบเรียนอย่างน้อย 1 คาบ");
    });
  });

  describe("calculateTotalSchedules", () => {
    it("returns cartesian product", () => {
      expect(calculateTotalSchedules(2, 3)).toBe(6);
    });

    it("returns 1 for single timeslot and grade", () => {
      expect(calculateTotalSchedules(1, 1)).toBe(1);
    });

    it("returns 0 when timeslots is 0", () => {
      expect(calculateTotalSchedules(0, 5)).toBe(0);
    });

    it("returns 0 when grades is 0", () => {
      expect(calculateTotalSchedules(5, 0)).toBe(0);
    });

    it("handles large inputs", () => {
      expect(calculateTotalSchedules(100, 20)).toBe(2000);
    });
  });

  describe("groupSchedulesBySubject", () => {
    it("returns empty array for empty input", () => {
      expect(groupSchedulesBySubject([])).toEqual([]);
    });

    it("groups a single schedule correctly", () => {
      const schedule = makeSchedule();
      const result = groupSchedulesBySubject([schedule]);

      expect(result).toHaveLength(1);
      expect(result[0]!.SubjectCode).toBe("MATH101");
      expect(result[0]!.SubjectName).toBe("คณิตศาสตร์");
      expect(result[0]!.GradeIDs).toEqual(["M1-1"]);
      expect(result[0]!.ClassIDs).toEqual([1]);
      expect(result[0]!.timeslots).toHaveLength(1);
    });

    it("groups schedules with same SubjectCode together", () => {
      const schedules = [
        makeSchedule({ ClassID: 1, GradeID: "M1-1" }),
        makeSchedule({ ClassID: 2, GradeID: "M1-2" }),
      ];
      const result = groupSchedulesBySubject(schedules);

      expect(result).toHaveLength(1);
      expect(result[0]!.GradeIDs).toEqual(["M1-1", "M1-2"]);
      expect(result[0]!.ClassIDs).toEqual([1, 2]);
    });

    it("separates schedules with different SubjectCodes", () => {
      const schedules = [
        makeSchedule({ SubjectCode: "MATH101" }),
        makeSchedule({
          SubjectCode: "SCI201",
          ClassID: 2,
          subject: {
            SubjectName: "วิทยาศาสตร์",
            teachers_responsibility: [],
          },
        }),
      ];
      const result = groupSchedulesBySubject(schedules);

      expect(result).toHaveLength(2);
      const codes = result.map((r) => r.SubjectCode).sort();
      expect(codes).toEqual(["MATH101", "SCI201"]);
    });

    it("deduplicates GradeIDs within a group", () => {
      const schedules = [
        makeSchedule({ ClassID: 1, GradeID: "M1-1", TimeslotID: "1-2567-MON1" }),
        makeSchedule({
          ClassID: 2,
          GradeID: "M1-1",
          TimeslotID: "1-2567-MON2",
          timeslot: {
            TimeslotID: "1-2567-MON2",
            DayOfWeek: "MON",
            AcademicYear: 2567,
            Semester: "SEMESTER_1",
            StartTime: new Date("2024-05-01T09:20:00"),
            EndTime: new Date("2024-05-01T10:10:00"),
            BreakTime: "NOT_BREAK",
          },
        }),
      ];
      const result = groupSchedulesBySubject(schedules);

      expect(result[0]!.GradeIDs).toEqual(["M1-1"]);
    });

    it("deduplicates timeslots within a group", () => {
      const schedules = [
        makeSchedule({ ClassID: 1, GradeID: "M1-1" }),
        makeSchedule({ ClassID: 2, GradeID: "M1-2" }),
      ];
      const result = groupSchedulesBySubject(schedules);

      expect(result[0]!.timeslots).toHaveLength(1);
    });

    it("collects all ClassIDs without deduplication", () => {
      const schedules = [
        makeSchedule({ ClassID: 10 }),
        makeSchedule({ ClassID: 20, GradeID: "M1-2" }),
        makeSchedule({ ClassID: 30, GradeID: "M1-3" }),
      ];
      const result = groupSchedulesBySubject(schedules);

      expect(result[0]!.ClassIDs).toEqual([10, 20, 30]);
    });

    it("handles null subject gracefully", () => {
      const schedule = makeSchedule({ subject: null });
      const result = groupSchedulesBySubject([schedule]);

      expect(result[0]!.SubjectName).toBeNull();
      expect(result[0]!.teachers).toEqual([]);
    });
  });
});
