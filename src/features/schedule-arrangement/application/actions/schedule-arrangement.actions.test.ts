import { vi, describe, it, expect, beforeEach } from "vitest";
/**
 * Integration Tests: Schedule Arrangement Server Actions
 *
 * Tests the complete flow of Server Actions with mocked Prisma client.
 * Verifies input validation, conflict detection, and database operations.
 *
 * @module schedule-arrangement.actions.test
 * @vitest-environment node
 */

// Mock ESM-only Auth adapter so Vitest doesn't try to parse it
vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: vi.fn(() => ({})) }));

// Mock Next.js headers for server action tests
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
  cookies: vi.fn(() => Promise.resolve({ get: vi.fn(), set: vi.fn() })),
}));

// Mock auth for server action tests - provide a mock session
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: { id: "test-user-id", email: "test@example.com", role: "admin" },
        }),
      ),
    },
  },
}));

import {
  arrangeScheduleAction,
  deleteScheduleAction,
  getSchedulesByTermAction,
  updateScheduleLockAction,
} from "./schedule-arrangement.actions";
import prisma from "@/lib/prisma";

// Prisma is already mocked globally in vitest.setup.ts
// Get typed mock references
// Get typed mock references
const mockClassSchedule = prisma.class_schedule;
const mockTeachersResp = prisma.teachers_responsibility;

describe("Schedule Arrangement Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("arrangeScheduleAction", () => {
    it("should create new schedule when no conflicts exist", async () => {
      const input = {
        classId: "C_M1-1_T1_MATH101",
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: 101,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1" as const,
        isLocked: false,
      };

      mockClassSchedule.findMany = vi.fn(() => Promise.resolve([])) as any;
      mockTeachersResp.findMany = vi.fn(() =>
        Promise.resolve([
          {
            RespID: 1,
            TeacherID: 1,
            GradeID: "M1-1",
            SubjectCode: "MATH101",
            AcademicYear: 2566,
            Semester: "SEMESTER_1",
            TeachHour: 4,
          },
        ]),
      ) as any;
      mockClassSchedule.findUnique = vi.fn(() =>
        Promise.resolve(null),
      ) as any; // No existing schedule
      mockClassSchedule.create = vi.fn(() =>
        Promise.resolve({} as any),
      ) as any;
      mockTeachersResp.update = vi.fn(() =>
        Promise.resolve({} as any),
      ) as any;

      const result = await arrangeScheduleAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ classId: input.classId, created: true });
      expect(prisma.class_schedule.create).toHaveBeenCalled();
    });

    it("should throw error when teacher conflict exists", async () => {
      const input = {
        classId: "C_M1-1_T1_MATH101",
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: 101,
        gradeId: "M1-1",
        teacherId: 1,
        academicYear: 2566,
        semester: "SEMESTER_1" as const,
        isLocked: false,
      };

      mockClassSchedule.findMany = vi.fn(() =>
        Promise.resolve([
          {
            ClassID: "C_M2-1_T1_ENG101",
            TimeslotID: "T1",
            SubjectCode: "ENG101",
            RoomID: 102,
            GradeID: "M2-1",
            IsLocked: false,
            subject: { SubjectName: "English" },
            room: { RoomName: "102" },
            gradelevel: { Year: 1, Number: 1 },
            timeslot: {
              AcademicYear: 2566,
              Semester: "SEMESTER_1",
            },
            teachers_responsibility: [
              {
                RespID: 2,
                TeacherID: 1,
                teacher: {
                  TeacherID: 1,
                  Firstname: "John",
                  Lastname: "Doe",
                },
              },
            ],
          },
        ] as any),
      ) as any;
      mockTeachersResp.findMany = vi.fn(() =>
        Promise.resolve([
          {
            RespID: 1,
            TeacherID: 1,
            GradeID: "M1-1",
            SubjectCode: "MATH101",
            AcademicYear: 2566,
            Semester: "SEMESTER_1",
            TeachHour: 4,
          },
        ] as any),
      ) as any;

      const result = await arrangeScheduleAction(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CONFLICT");
      expect(result.error?.message).toContain("Teacher");
    });

    it("should reject invalid input", async () => {
      const invalidInput = {
        classId: "",
        timeslotId: "T1",
        subjectCode: "MATH101",
        roomId: 101,
        gradeId: "M1-1",
        academicYear: 2566,
        semester: "SEMESTER_1" as const,
      };

      const result = await arrangeScheduleAction(invalidInput as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("deleteScheduleAction", () => {
    it("should delete schedule when not locked", async () => {
      const input = { classId: "C_M1-1_T1_MATH101" };

      mockClassSchedule.findUnique = vi.fn(() =>
        Promise.resolve({
          ClassID: input.classId,
          IsLocked: false,
        } as any),
      ) as any;
      mockClassSchedule.delete = vi.fn(() =>
        Promise.resolve({} as any),
      ) as any;

      const result = await deleteScheduleAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ classId: input.classId, deleted: true });
    });

    it("should throw error when schedule is locked", async () => {
      const input = { classId: "C_M1-1_T1_MATH101" };

      mockClassSchedule.findUnique = vi.fn(() =>
        Promise.resolve({
          ClassID: input.classId,
          IsLocked: true,
        } as any),
      ) as any;

      const result = await deleteScheduleAction(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("FORBIDDEN");
    });

    it("should throw error when schedule not found", async () => {
      const input = { classId: "C_M1-1_T1_MATH101" };

      mockClassSchedule.findUnique = vi.fn(() =>
        Promise.resolve(null),
      ) as any;

      const result = await deleteScheduleAction(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NOT_FOUND");
    });
  });

  describe("getSchedulesByTermAction", () => {
    it("should return schedules for given term", async () => {
      const input = {
        academicYear: 2566,
        semester: "SEMESTER_1" as const,
      };

      mockClassSchedule.findMany = vi.fn(() =>
        Promise.resolve([
          {
            ClassID: "C_M1-1_T1_MATH101",
            TimeslotID: "T1",
            SubjectCode: "MATH101",
            RoomID: 101,
            GradeID: "M1-1",
            IsLocked: false,
            subject: { SubjectName: "Math" },
            room: { RoomName: "101" },
            gradelevel: { Year: 1, Number: 1 },
            timeslot: {
              AcademicYear: 2566,
              Semester: "SEMESTER_1",
            },
            teachers_responsibility: [
              {
                RespID: 1,
                TeacherID: 1,
                teacher: {
                  TeacherID: 1,
                  Firstname: "John",
                  Lastname: "Doe",
                },
              },
            ],
          },
        ] as any),
      ) as any;

      const result = await getSchedulesByTermAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it("should return empty array when no schedules exist", async () => {
      const input = {
        academicYear: 2566,
        semester: "SEMESTER_1" as const,
      };

      mockClassSchedule.findMany = vi.fn(() => Promise.resolve([])) as any;

      const result = await getSchedulesByTermAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe("updateScheduleLockAction", () => {
    it("should lock schedule", async () => {
      const input = {
        classId: "C_M1-1_T1_MATH101",
        isLocked: true,
      };

      mockClassSchedule.findUnique = vi.fn(() =>
        Promise.resolve({
          ClassID: input.classId,
          IsLocked: false,
        } as any),
      ) as any;
      mockClassSchedule.update = vi.fn(() =>
        Promise.resolve({} as any),
      ) as any;

      const result = await updateScheduleLockAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ classId: input.classId, locked: true });
    });

    it("should unlock schedule", async () => {
      const input = {
        classId: "C_M1-1_T1_MATH101",
        isLocked: false,
      };

      mockClassSchedule.findUnique = vi.fn(() =>
        Promise.resolve({
          ClassID: input.classId,
          IsLocked: true,
        } as any),
      ) as any;
      mockClassSchedule.update = vi.fn(() =>
        Promise.resolve({} as any),
      ) as any;

      const result = await updateScheduleLockAction(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ classId: input.classId, locked: false });
    });

    it("should throw error when schedule not found", async () => {
      const input = {
        classId: "C_M1-1_T1_MATH101",
        isLocked: true,
      };

      mockClassSchedule.findUnique = vi.fn(() =>
        Promise.resolve(null),
      ) as any;

      const result = await updateScheduleLockAction(input);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NOT_FOUND");
    });
  });
});
