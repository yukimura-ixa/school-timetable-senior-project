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

vi.mock("../../infrastructure/repositories/conflict.repository", () => ({
  conflictRepository: {
    findAllConflicts: vi.fn(),
    checkTeacherConflict: vi.fn(),
    checkRoomConflict: vi.fn(),
  },
}));

import {
  getConflictsAction,
  checkTeacherConflictAction,
  checkRoomConflictAction,
} from "./conflict.actions";
import { conflictRepository } from "../../infrastructure/repositories/conflict.repository";

/* eslint-disable @typescript-eslint/unbound-method -- vitest mocks extract
   method references; binding is not needed because we only stub return values. */
const mockFindAll = conflictRepository.findAllConflicts as ReturnType<typeof vi.fn>;
const mockCheckTeacher = conflictRepository.checkTeacherConflict as ReturnType<typeof vi.fn>;
const mockCheckRoom = conflictRepository.checkRoomConflict as ReturnType<typeof vi.fn>;
/* eslint-enable @typescript-eslint/unbound-method */

describe("Conflict Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getConflictsAction", () => {
    it("returns conflict summary for valid input", async () => {
      const mockSummary = {
        teacherConflicts: [],
        roomConflicts: [],
        classConflicts: [],
        unassignedSchedules: [],
        totalConflicts: 0,
      };
      mockFindAll.mockResolvedValueOnce(mockSummary);

      const result = await getConflictsAction({
        AcademicYear: 2567,
        Semester: "SEMESTER_1",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSummary);
      expect(mockFindAll).toHaveBeenCalledWith(2567, "SEMESTER_1");
    });

    it("returns conflicts when they exist", async () => {
      const mockSummary = {
        teacherConflicts: [
          {
            TeacherID: 1,
            teacherName: "นายสมชาย ใจดี",
            timeslotId: "1-2567-MON1",
            day: "MON",
            periodStart: 1,
            conflicts: [
              {
                scheduleId: 1,
                gradeId: "M1-1",
                gradeName: "1/1",
                subjectCode: "MATH101",
                subjectName: "คณิตศาสตร์",
                roomId: 1,
                roomName: "101",
              },
            ],
          },
        ],
        roomConflicts: [],
        classConflicts: [],
        unassignedSchedules: [],
        totalConflicts: 1,
      };
      mockFindAll.mockResolvedValueOnce(mockSummary);

      const result = await getConflictsAction({
        AcademicYear: 2567,
        Semester: "SEMESTER_1",
      });

      expect(result.success).toBe(true);
      expect(result.data?.totalConflicts).toBe(1);
      expect(result.data?.teacherConflicts).toHaveLength(1);
    });

    it("rejects academic year below 2500", async () => {
      const result = await getConflictsAction({
        AcademicYear: 2499,
        Semester: "SEMESTER_1",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("rejects invalid semester", async () => {
      const result = await getConflictsAction({
        AcademicYear: 2567,
        Semester: "SEMESTER_4" as any,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("checkTeacherConflictAction", () => {
    const mockSchedule = {
      ClassID: 1,
      TimeslotID: "1-2567-MON1",
      SubjectCode: "MATH101",
      GradeID: "M1-1",
      RoomID: 1,
      teachers_responsibility: [
        {
          teacher: {
            TeacherID: 1,
            Prefix: "นาย",
            Firstname: "สมชาย",
            Lastname: "ใจดี",
          },
        },
      ],
      subject: { SubjectName: "คณิตศาสตร์" },
      gradelevel: { Year: 1, Number: 1 },
      room: { RoomName: "101" },
      timeslot: {
        DayOfWeek: "MON",
        StartTime: new Date("2024-05-01T08:30:00"),
        EndTime: new Date("2024-05-01T09:20:00"),
      },
    };

    it("returns hasConflict: false when no conflict", async () => {
      mockCheckTeacher.mockResolvedValueOnce({ hasConflict: false });

      const result = await checkTeacherConflictAction({
        teacherId: 1,
        timeslotId: "1-2567-MON1",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ hasConflict: false });
    });

    it("returns conflict details when conflict exists", async () => {
      mockCheckTeacher.mockResolvedValueOnce({
        hasConflict: true,
        conflictingSchedule: mockSchedule,
      });

      const result = await checkTeacherConflictAction({
        teacherId: 1,
        timeslotId: "1-2567-MON1",
      });

      expect(result.success).toBe(true);
      expect(result.data?.hasConflict).toBe(true);
      expect(result.data?.teacherName).toBe("นายสมชาย ใจดี");
      expect(result.data?.subjectName).toBe("คณิตศาสตร์");
      expect(result.data?.gradeName).toBe("ม.1/1");
      expect(result.data?.roomName).toBe("101");
    });

    it("formats teacher name with fallback when missing", async () => {
      mockCheckTeacher.mockResolvedValueOnce({
        hasConflict: true,
        conflictingSchedule: {
          ...mockSchedule,
          teachers_responsibility: [],
        },
      });

      const result = await checkTeacherConflictAction({
        teacherId: 1,
        timeslotId: "1-2567-MON1",
      });

      expect(result.data?.teacherName).toBe("ไม่ทราบชื่อ");
    });

    it("returns error when repository returns null", async () => {
      mockCheckTeacher.mockResolvedValueOnce(null);

      const result = await checkTeacherConflictAction({
        teacherId: 1,
        timeslotId: "1-2567-MON1",
      });

      expect(result.success).toBe(false);
    });

    it("rejects teacherId below 1", async () => {
      const result = await checkTeacherConflictAction({
        teacherId: 0,
        timeslotId: "1-2567-MON1",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("rejects empty timeslotId", async () => {
      const result = await checkTeacherConflictAction({
        teacherId: 1,
        timeslotId: "",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("checkRoomConflictAction", () => {
    const mockSchedule = {
      ClassID: 2,
      TimeslotID: "1-2567-MON1",
      SubjectCode: "SCI201",
      GradeID: "M2-1",
      RoomID: 5,
      teachers_responsibility: [
        {
          teacher: {
            TeacherID: 2,
            Prefix: "นาง",
            Firstname: "สมหญิง",
            Lastname: "รักเรียน",
          },
        },
      ],
      subject: { SubjectName: "วิทยาศาสตร์" },
      gradelevel: { Year: 2, Number: 1 },
      room: { RoomName: "Lab1" },
      timeslot: {
        DayOfWeek: "MON",
        StartTime: new Date("2024-05-01T08:30:00"),
        EndTime: new Date("2024-05-01T09:20:00"),
      },
    };

    it("returns hasConflict: false when no conflict", async () => {
      mockCheckRoom.mockResolvedValueOnce({ hasConflict: false });

      const result = await checkRoomConflictAction({
        roomId: 5,
        timeslotId: "1-2567-MON1",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ hasConflict: false });
    });

    it("returns conflict details when room occupied", async () => {
      mockCheckRoom.mockResolvedValueOnce({
        hasConflict: true,
        conflictingSchedule: mockSchedule,
      });

      const result = await checkRoomConflictAction({
        roomId: 5,
        timeslotId: "1-2567-MON1",
      });

      expect(result.success).toBe(true);
      expect(result.data?.hasConflict).toBe(true);
      expect(result.data?.roomName).toBe("Lab1");
      expect(result.data?.teacherName).toBe("นางสมหญิง รักเรียน");
      expect(result.data?.subjectName).toBe("วิทยาศาสตร์");
      expect(result.data?.gradeName).toBe("ม.2/1");
    });

    it("handles missing room name gracefully", async () => {
      mockCheckRoom.mockResolvedValueOnce({
        hasConflict: true,
        conflictingSchedule: { ...mockSchedule, room: null },
      });

      const result = await checkRoomConflictAction({
        roomId: 5,
        timeslotId: "1-2567-MON1",
      });

      expect(result.data?.roomName).toBe("ไม่ทราบชื่อห้อง");
    });

    it("returns error when repository returns null", async () => {
      mockCheckRoom.mockResolvedValueOnce(null);

      const result = await checkRoomConflictAction({
        roomId: 5,
        timeslotId: "1-2567-MON1",
      });

      expect(result.success).toBe(false);
    });

    it("rejects roomId below 1", async () => {
      const result = await checkRoomConflictAction({
        roomId: 0,
        timeslotId: "1-2567-MON1",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });
});
