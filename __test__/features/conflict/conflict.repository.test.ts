/**
 * Unit Tests for Conflict Detection Repository
 * Tests all conflict detection logic including teacher, room, class, and unassigned conflicts
 * 
 * Note: Prisma is mocked globally in jest.setup.js
 */

import { conflictRepository } from "@/features/conflict/infrastructure/repositories/conflict.repository";
import prisma from "@/lib/prisma";

// Get reference to the mocked Prisma client
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("Conflict Detection Repository", () => {
  /**
   * ✅ Tests updated for current schema:
   * - teachers_responsibility many-to-many junction table
   * - AcademicYear/Semester on timeslot table
   * - Updated field names (SubjectCode, RoomName, DayOfWeek, etc.)
   */
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Helper to create mock schedule with new schema structure
   */
  const createMockSchedule = (overrides: {
    ClassID: string;
    TimeslotID: string;
    GradeID: string;
    gradeYear: number;
    gradeNumber: number;
    SubjectCode: string;
    SubjectName: string;
    RoomID?: number | null;
    RoomName?: string;
    teachers: Array<{
      TeacherID: number;
      Prefix: string;
      Firstname: string;
      Lastname: string;
    }>;
    DayOfWeek: string;
  }) => ({
    ClassID: overrides.ClassID,
    TimeslotID: overrides.TimeslotID,
    SubjectCode: overrides.SubjectCode,
    RoomID: overrides.RoomID ?? null,
    GradeID: overrides.GradeID,
    IsLocked: false,
    gradelevel: {
      GradeID: overrides.GradeID,
      Year: overrides.gradeYear,
      Number: overrides.gradeNumber,
      StudentCount: 40,
      ProgramID: 1,
    },
    subject: {
      SubjectCode: overrides.SubjectCode,
      SubjectName: overrides.SubjectName,
      Credit: "1.0" as any,
      Hours: 1,
      Category: "MANDATORY" as any,
      IsActive: true,
      Description: "",
    },
    teachers_responsibility: overrides.teachers.map((t, idx) => ({
      RespID: idx + 1,
      TeacherID: t.TeacherID,
      GradeID: overrides.GradeID,
      SubjectCode: overrides.SubjectCode,
      AcademicYear: 2567,
      Semester: "1" as any,
      teacher: {
        TeacherID: t.TeacherID,
        Prefix: t.Prefix,
        Firstname: t.Firstname,
        Lastname: t.Lastname,
        Department: "คณิตศาสตร์",
        IsActive: true,
      },
    })),
    room: overrides.RoomID
      ? {
          RoomID: overrides.RoomID,
          RoomName: overrides.RoomName || `ห้อง ${overrides.RoomID}`,
          BuildingCode: "A",
          Floor: 1,
          Capacity: 40,
          RoomType: "CLASSROOM" as any,
        }
      : null,
    timeslot: {
      TimeslotID: overrides.TimeslotID,
      AcademicYear: 2567,
      Semester: "1" as any,
      StartTime: new Date('2024-01-01T08:00:00'),
      EndTime: new Date('2024-01-01T09:00:00'),
      Breaktime: "NONE" as any,
      DayOfWeek: overrides.DayOfWeek as any,
    },
  });

  describe("findAllConflicts", () => {
    it("should return empty arrays when no schedules exist", async () => {
      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve([]));

      const result = await conflictRepository.findAllConflicts(2567, "1");

      expect(result).toEqual({
        teacherConflicts: [],
        roomConflicts: [],
        classConflicts: [],
        unassignedSchedules: [],
        totalConflicts: 0,
      });
    });

    it("should detect teacher conflicts (same teacher in multiple classes at same timeslot)", async () => {
      const mockSchedules = [
        createMockSchedule({
          ClassID: "1-2567-M11-MATH",
          TimeslotID: "1-2567-MON1",
          GradeID: "M11",
          gradeYear: 1,
          gradeNumber: 1,
          SubjectCode: "MATH",
          SubjectName: "คณิตศาสตร์",
          RoomID: 101,
          RoomName: "101",
          teachers: [{ TeacherID: 1, Prefix: "นาย", Firstname: "สมชาย", Lastname: "ใจดี" }],
          DayOfWeek: "MONDAY",
        }),
        createMockSchedule({
          ClassID: "1-2567-M12-MATH",
          TimeslotID: "1-2567-MON1",
          GradeID: "M12",
          gradeYear: 1,
          gradeNumber: 2,
          SubjectCode: "MATH",
          SubjectName: "คณิตศาสตร์",
          RoomID: 102,
          RoomName: "102",
          teachers: [{ TeacherID: 1, Prefix: "นาย", Firstname: "สมชาย", Lastname: "ใจดี" }],
          DayOfWeek: "MONDAY",
        }),
      ];

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockSchedules as any));

      const result = await conflictRepository.findAllConflicts(2567, "1");

      expect(result.teacherConflicts).toHaveLength(1);
      expect(result.teacherConflicts[0]).toMatchObject({
        teacherId: 1,
        teacherName: "นายสมชาย ใจดี",
        timeslotId: "1-2567-MON1",
        day: "MONDAY",
        periodStart: 1,
      });
      expect(result.teacherConflicts[0].conflicts).toHaveLength(2);
    });

    it("should detect room conflicts (same room used by multiple classes at same timeslot)", async () => {
      const mockSchedules = [
        createMockSchedule({
          ClassID: "1-2567-M11-MATH",
          TimeslotID: "1-2567-MON1",
          GradeID: "M11",
          gradeYear: 1,
          gradeNumber: 1,
          SubjectCode: "MATH",
          SubjectName: "คณิตศาสตร์",
          RoomID: 101,
          RoomName: "ห้อง 101",
          teachers: [{ TeacherID: 1, Prefix: "นาย", Firstname: "สมชาย", Lastname: "ใจดี" }],
          DayOfWeek: "MONDAY",
        }),
        createMockSchedule({
          ClassID: "1-2567-M12-SCI",
          TimeslotID: "1-2567-MON1",
          GradeID: "M12",
          gradeYear: 1,
          gradeNumber: 2,
          SubjectCode: "SCI",
          SubjectName: "วิทยาศาสตร์",
          RoomID: 101,
          RoomName: "ห้อง 101",
          teachers: [{ TeacherID: 2, Prefix: "นาง", Firstname: "สมหญิง", Lastname: "รักเรียน" }],
          DayOfWeek: "MONDAY",
        }),
      ];

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockSchedules as any));

      const result = await conflictRepository.findAllConflicts(2567, "1");

      expect(result.roomConflicts).toHaveLength(1);
      expect(result.roomConflicts[0]).toMatchObject({
        roomId: 101,
        roomName: "ห้อง 101",
        timeslotId: "1-2567-MON1",
        day: "MONDAY",
        periodStart: 1,
      });
      expect(result.roomConflicts[0].conflicts).toHaveLength(2);
    });

    it("should detect class conflicts (same grade in multiple classes at same timeslot)", async () => {
      const mockSchedules = [
        createMockSchedule({
          ClassID: "1-2567-M11-MATH",
          TimeslotID: "1-2567-MON1",
          GradeID: "M11",
          gradeYear: 1,
          gradeNumber: 1,
          SubjectCode: "MATH",
          SubjectName: "คณิตศาสตร์",
          RoomID: 101,
          RoomName: "ห้อง 101",
          teachers: [{ TeacherID: 1, Prefix: "นาย", Firstname: "สมชาย", Lastname: "ใจดี" }],
          DayOfWeek: "MONDAY",
        }),
        createMockSchedule({
          ClassID: "1-2567-M11-SCI",
          TimeslotID: "1-2567-MON1",
          GradeID: "M11", // Same grade = conflict
          gradeYear: 1,
          gradeNumber: 1,
          SubjectCode: "SCI",
          SubjectName: "วิทยาศาสตร์",
          RoomID: 102,
          RoomName: "ห้อง 102",
          teachers: [{ TeacherID: 2, Prefix: "นาง", Firstname: "สมหญิง", Lastname: "รักเรียน" }],
          DayOfWeek: "MONDAY",
        }),
      ];

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockSchedules as any));

      const result = await conflictRepository.findAllConflicts(2567, "1");

      expect(result.classConflicts).toHaveLength(1);
      expect(result.classConflicts[0]).toMatchObject({
        gradeId: "M11",
        gradeName: "1/1",
        timeslotId: "1-2567-MON1",
        day: "MONDAY",
        periodStart: 1,
      });
      expect(result.classConflicts[0].conflicts).toHaveLength(2);
    });

    it("should detect unassigned schedules (NULL teacher or room)", async () => {
      const mockSchedules = [
        createMockSchedule({
          ClassID: "1-2567-M11-MATH",
          TimeslotID: "1-2567-MON1",
          GradeID: "M11",
          gradeYear: 1,
          gradeNumber: 1,
          SubjectCode: "MATH",
          SubjectName: "คณิตศาสตร์",
          teachers: [], // Unassigned teacher
          RoomID: 101,
          RoomName: "ห้อง 101",
          DayOfWeek: "MONDAY",
        }),
        createMockSchedule({
          ClassID: "1-2567-M12-SCI",
          TimeslotID: "1-2567-MON2",
          GradeID: "M12",
          gradeYear: 1,
          gradeNumber: 2,
          SubjectCode: "SCI",
          SubjectName: "วิทยาศาสตร์",
          teachers: [
            { TeacherID: 1, Prefix: "นาย", Firstname: "สมชาย", Lastname: "ใจดี" },
          ],
          RoomID: null, // Unassigned room
          DayOfWeek: "MONDAY",
        }),
      ];

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockSchedules as any));

      const result = await conflictRepository.findAllConflicts(2567, "1");

      expect(result.unassignedSchedules).toHaveLength(2);
      expect(result.unassignedSchedules[0]).toMatchObject({
        scheduleId: "1-2567-M11-MATH",
        gradeName: "1/1",
        subjectName: "คณิตศาสตร์",
        missingResource: "TEACHER",
      });
      expect(result.unassignedSchedules[1]).toMatchObject({
        scheduleId: "1-2567-M12-SCI",
        gradeName: "1/2",
        subjectName: "วิทยาศาสตร์",
        missingResource: "ROOM",
      });
    });

    it("should detect multiple conflict types simultaneously", async () => {
      const mockSchedules = [
        // Teacher conflict (Teacher 1 in two places)
        createMockSchedule({
          ClassID: "1-2567-M11-MATH",
          TimeslotID: "1-2567-MON1",
          GradeID: "M11",
          gradeYear: 1,
          gradeNumber: 1,
          SubjectCode: "MATH",
          SubjectName: "คณิตศาสตร์",
          teachers: [
            { TeacherID: 1, Prefix: "นาย", Firstname: "สมชาย", Lastname: "ใจดี" },
          ],
          RoomID: 101,
          RoomName: "ห้อง 101",
          DayOfWeek: "MONDAY",
        }),
        createMockSchedule({
          ClassID: "1-2567-M12-MATH",
          TimeslotID: "1-2567-MON1",
          GradeID: "M12",
          gradeYear: 1,
          gradeNumber: 2,
          SubjectCode: "MATH",
          SubjectName: "คณิตศาสตร์",
          teachers: [
            { TeacherID: 1, Prefix: "นาย", Firstname: "สมชาย", Lastname: "ใจดี" },
          ],
          RoomID: 102,
          RoomName: "ห้อง 102",
          DayOfWeek: "MONDAY",
        }),
        // Room conflict (Room 201 used twice)
        createMockSchedule({
          ClassID: "1-2567-M21-SCI",
          TimeslotID: "1-2567-MON2",
          GradeID: "M21",
          gradeYear: 2,
          gradeNumber: 1,
          SubjectCode: "SCI",
          SubjectName: "วิทยาศาสตร์",
          teachers: [
            { TeacherID: 2, Prefix: "นาง", Firstname: "สมหญิง", Lastname: "รักเรียน" },
          ],
          RoomID: 201,
          RoomName: "ห้อง 201",
          DayOfWeek: "MONDAY",
        }),
        createMockSchedule({
          ClassID: "1-2567-M22-ENG",
          TimeslotID: "1-2567-MON2",
          GradeID: "M22",
          gradeYear: 2,
          gradeNumber: 2,
          SubjectCode: "ENG",
          SubjectName: "ภาษาอังกฤษ",
          teachers: [
            { TeacherID: 3, Prefix: "นาง", Firstname: "สมศรี", Lastname: "เก่งภาษา" },
          ],
          RoomID: 201,
          RoomName: "ห้อง 201",
          DayOfWeek: "MONDAY",
        }),
        // Unassigned schedule
        createMockSchedule({
          ClassID: "1-2567-M31-HIST",
          TimeslotID: "1-2567-MON3",
          GradeID: "M31",
          gradeYear: 3,
          gradeNumber: 1,
          SubjectCode: "HIST",
          SubjectName: "ประวัติศาสตร์",
          teachers: [],
          RoomID: 301,
          RoomName: "ห้อง 301",
          DayOfWeek: "MONDAY",
        }),
      ];

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockSchedules as any));

      const result = await conflictRepository.findAllConflicts(2567, "1");

      expect(result.teacherConflicts).toHaveLength(1);
      expect(result.roomConflicts).toHaveLength(1);
      expect(result.unassignedSchedules).toHaveLength(1);
    });

    it("should handle schedules with no conflicts correctly", async () => {
      const mockSchedules = [
        createMockSchedule({
          ClassID: "1-2567-M11-MATH",
          TimeslotID: "1-2567-MON1",
          GradeID: "M11",
          gradeYear: 1,
          gradeNumber: 1,
          SubjectCode: "MATH",
          SubjectName: "คณิตศาสตร์",
          teachers: [
            { TeacherID: 1, Prefix: "นาย", Firstname: "สมชาย", Lastname: "ใจดี" },
          ],
          RoomID: 101,
          RoomName: "ห้อง 101",
          DayOfWeek: "MONDAY",
        }),
        createMockSchedule({
          ClassID: "1-2567-M12-SCI",
          TimeslotID: "1-2567-MON2", // Different timeslot
          GradeID: "M12",
          gradeYear: 1,
          gradeNumber: 2,
          SubjectCode: "SCI",
          SubjectName: "วิทยาศาสตร์",
          teachers: [
            { TeacherID: 2, Prefix: "นาง", Firstname: "สมหญิง", Lastname: "รักเรียน" },
          ],
          RoomID: 102,
          RoomName: "ห้อง 102",
          DayOfWeek: "MONDAY",
        }),
      ];

      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve(mockSchedules as any));

      const result = await conflictRepository.findAllConflicts(2567, "1");

      expect(result.teacherConflicts).toHaveLength(0);
      expect(result.roomConflicts).toHaveLength(0);
      expect(result.classConflicts).toHaveLength(0);
      expect(result.unassignedSchedules).toHaveLength(0);
    });

    it("should correctly filter by academic year and semester", async () => {
      mockPrisma.class_schedule.findMany = jest.fn(() => Promise.resolve([]));

      await conflictRepository.findAllConflicts(2567, "2");

      expect((mockPrisma.class_schedule.findMany as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            timeslot: {
              AcademicYear: 2567,
              Semester: "SEMESTER_2",
            },
          },
        })
      );
    });
  });
});
