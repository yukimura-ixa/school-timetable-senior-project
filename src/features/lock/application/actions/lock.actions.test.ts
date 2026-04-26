import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: vi.fn(() => ({})) }));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
  cookies: vi.fn(() => Promise.resolve({ get: vi.fn(), set: vi.fn() })),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: { id: "test-user", email: "admin@test.com", role: "admin" },
        }),
      ),
    },
  },
}));

vi.mock("@/lib/cache-invalidation", () => ({
  invalidatePublicCache: vi.fn(),
}));

vi.mock("../../infrastructure/repositories/lock.repository", () => ({
  findLockedSchedules: vi.fn(),
  createLock: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
}));

import {
  getLockedSchedulesAction,
  createLockAction,
  deleteLocksAction,
  getLockedScheduleCountAction,
} from "./lock.actions";
import * as lockRepository from "../../infrastructure/repositories/lock.repository";

const mockFindLockedSchedules = lockRepository.findLockedSchedules as ReturnType<typeof vi.fn>;
const mockCreateLock = lockRepository.createLock as ReturnType<typeof vi.fn>;
const mockDeleteMany = lockRepository.deleteMany as ReturnType<typeof vi.fn>;
const mockCount = lockRepository.count as ReturnType<typeof vi.fn>;

const makeRawSchedule = (overrides = {}) => ({
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
          Email: null,
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

describe("Lock Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLockedSchedulesAction", () => {
    it("returns grouped schedules for valid input", async () => {
      mockFindLockedSchedules.mockResolvedValueOnce([
        makeRawSchedule(),
        makeRawSchedule({ ClassID: 2, GradeID: "M1-2" }),
      ]);

      const result = await getLockedSchedulesAction({
        AcademicYear: 2567,
        Semester: "SEMESTER_1",
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]!.SubjectCode).toBe("MATH101");
      expect(result.data![0]!.GradeIDs).toEqual(["M1-1", "M1-2"]);
    });

    it("returns empty array when no locked schedules", async () => {
      mockFindLockedSchedules.mockResolvedValueOnce([]);

      const result = await getLockedSchedulesAction({
        AcademicYear: 2567,
        Semester: "SEMESTER_1",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("rejects academic year below 2500", async () => {
      const result = await getLockedSchedulesAction({
        AcademicYear: 2499,
        Semester: "SEMESTER_1",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("createLockAction", () => {
    const validInput = {
      SubjectCode: "MATH101",
      RoomID: 1,
      timeslots: ["1-2567-MON1", "1-2567-MON2"],
      GradeIDs: ["M1-1", "M1-2"],
      RespIDs: [1],
    };

    it("creates cartesian product of timeslots × grades", async () => {
      mockCreateLock.mockImplementation(async (data: Record<string, unknown>) => ({
        ClassID: Math.floor(Math.random() * 1000),
        ...data,
      }));

      const result = await createLockAction(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(4); // 2 timeslots × 2 grades
      expect(mockCreateLock).toHaveBeenCalledTimes(4);
    });

    it("passes IsLocked: true to repository", async () => {
      mockCreateLock.mockResolvedValue({ ClassID: 1 });

      await createLockAction({
        SubjectCode: "MATH101",
        RoomID: 1,
        timeslots: ["T1"],
        GradeIDs: ["M1-1"],
        RespIDs: [1],
      });

      expect(mockCreateLock).toHaveBeenCalledWith(
        expect.objectContaining({ IsLocked: true }),
      );
    });

    it("connects teacher responsibilities", async () => {
      mockCreateLock.mockResolvedValue({ ClassID: 1 });

      await createLockAction({
        SubjectCode: "MATH101",
        RoomID: 1,
        timeslots: ["T1"],
        GradeIDs: ["M1-1"],
        RespIDs: [10, 20],
      });

      expect(mockCreateLock).toHaveBeenCalledWith(
        expect.objectContaining({
          RespIDs: [{ RespID: 10 }, { RespID: 20 }],
        }),
      );
    });

    it("rejects empty timeslots via schema validation", async () => {
      const result = await createLockAction({
        SubjectCode: "MATH101",
        RoomID: 1,
        timeslots: [],
        GradeIDs: ["M1-1"],
        RespIDs: [1],
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("rejects empty GradeIDs via schema validation", async () => {
      const result = await createLockAction({
        SubjectCode: "MATH101",
        RoomID: 1,
        timeslots: ["T1"],
        GradeIDs: [],
        RespIDs: [1],
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("rejects empty SubjectCode", async () => {
      const result = await createLockAction({
        SubjectCode: "",
        RoomID: 1,
        timeslots: ["T1"],
        GradeIDs: ["M1-1"],
        RespIDs: [1],
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("deleteLocksAction", () => {
    it("deletes schedules by ClassIDs", async () => {
      mockDeleteMany.mockResolvedValueOnce({ count: 3 });

      const result = await deleteLocksAction([1, 2, 3]);

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(3);
      expect(result.data?.deletedClassIds).toEqual([1, 2, 3]);
      expect(mockDeleteMany).toHaveBeenCalledWith([1, 2, 3]);
    });

    it("handles single ClassID deletion", async () => {
      mockDeleteMany.mockResolvedValueOnce({ count: 1 });

      const result = await deleteLocksAction([42]);

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(1);
    });

    it("rejects empty ClassIDs array", async () => {
      const result = await deleteLocksAction([]);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("getLockedScheduleCountAction", () => {
    it("returns count for valid input", async () => {
      mockCount.mockResolvedValueOnce(15);

      const result = await getLockedScheduleCountAction({
        AcademicYear: 2567,
        Semester: "SEMESTER_1",
      });

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(15);
    });

    it("returns zero count", async () => {
      mockCount.mockResolvedValueOnce(0);

      const result = await getLockedScheduleCountAction({
        AcademicYear: 2567,
        Semester: "SEMESTER_1",
      });

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(0);
    });
  });
});
