/**
 * Unit Tests for Conflict Detection Repository
 * Tests all conflict detection logic including teacher, room, class, and unassigned conflicts
 */

// Mock both prisma paths since @/lib/prisma re-exports from @/libs/prisma
jest.mock("@/libs/prisma", () => ({
  __esModule: true,
  default: {
    class_schedule: {
      findMany: jest.fn(), // Updated table name: classschedule → class_schedule
    },
  },
}));

jest.mock("@/lib/prisma", () => jest.requireMock("@/libs/prisma"));

import { conflictRepository } from "@/features/conflict/infrastructure/repositories/conflict.repository";
import prisma from "@/lib/prisma";

// Get reference to the mocked function
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
    RoomID?: number;
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
    RoomID: overrides.RoomID || null,
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
      (mockPrisma.class_schedule.findMany as jest.Mock).mockResolvedValue([]);

      const result = await conflictRepository.findAllConflicts(2567, "1");

      expect(result).toEqual({
        teacherConflicts: [],
        roomConflicts: [],
        classConflicts: [],
        unassignedSchedules: [],
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

      (mockPrisma.class_schedule.findMany as jest.Mock).mockResolvedValue(mockSchedules as any);

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
        {
          ClassID: "1-1-MATH",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-1", GradeName: "ม.1/1" },
          subject: { SubjectCode: "MATH", SubjectName: "คณิตศาสตร์" },
          teacher: { TeacherID: 1, TitleName: "นาย", FirstName: "สมชาย", LastName: "ใจดี" },
          room: { RoomID: 101, RoomName: "ห้อง 101" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
        {
          ClassID: "1-2-SCI",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-2", GradeName: "ม.1/2" },
          subject: { SubjectCode: "SCI", SubjectName: "วิทยาศาสตร์" },
          teacher: { TeacherID: 2, TitleName: "นาง", FirstName: "สมหญิง", LastName: "รักเรียน" },
          room: { RoomID: 101, RoomName: "ห้อง 101" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
      ];

      (mockPrisma.classschedule.findMany as jest.Mock).mockResolvedValue(mockSchedules as any);

      const result = await conflictRepository.findAllConflicts(2567, "SEMESTER_1");

      expect(result.roomConflicts).toHaveLength(1);
      expect(result.roomConflicts[0]).toMatchObject({
        roomId: 101,
        roomName: "ห้อง 101",
        timeslotId: "1-MON-1",
      });
      expect(result.roomConflicts[0].conflictingSchedules).toHaveLength(2);
    });

    it("should detect class conflicts (same grade in multiple classes at same timeslot)", async () => {
      const mockSchedules = [
        {
          ClassID: "1-1-MATH",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-1", GradeName: "ม.1/1" },
          subject: { SubjectCode: "MATH", SubjectName: "คณิตศาสตร์" },
          teacher: { TeacherID: 1, TitleName: "นาย", FirstName: "สมชาย", LastName: "ใจดี" },
          room: { RoomID: 101, RoomName: "ห้อง 101" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
        {
          ClassID: "1-1-SCI",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-1", GradeName: "ม.1/1" },
          subject: { SubjectCode: "SCI", SubjectName: "วิทยาศาสตร์" },
          teacher: { TeacherID: 2, TitleName: "นาง", FirstName: "สมหญิง", LastName: "รักเรียน" },
          room: { RoomID: 102, RoomName: "ห้อง 102" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
      ];

      (mockPrisma.classschedule.findMany as jest.Mock).mockResolvedValue(mockSchedules as any);

      const result = await conflictRepository.findAllConflicts(2567, "SEMESTER_1");

      expect(result.classConflicts).toHaveLength(1);
      expect(result.classConflicts[0]).toMatchObject({
        gradeId: "1-1",
        gradeName: "ม.1/1",
        timeslotId: "1-MON-1",
      });
      expect(result.classConflicts[0].conflictingSchedules).toHaveLength(2);
    });

    it("should detect unassigned schedules (NULL teacher or room)", async () => {
      const mockSchedules = [
        {
          ClassID: "1-1-MATH",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-1", GradeName: "ม.1/1" },
          subject: { SubjectCode: "MATH", SubjectName: "คณิตศาสตร์" },
          teacher: null, // Unassigned teacher
          room: { RoomID: 101, RoomName: "ห้อง 101" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
        {
          ClassID: "1-2-SCI",
          TimeslotID: "1-MON-2",
          gradelevel: { GradeID: "1-2", GradeName: "ม.1/2" },
          subject: { SubjectCode: "SCI", SubjectName: "วิทยาศาสตร์" },
          teacher: { TeacherID: 1, TitleName: "นาย", FirstName: "สมชาย", LastName: "ใจดี" },
          room: null, // Unassigned room
          timeslot: { TimeslotID: "1-MON-2", Day: "MON", PeriodStart: 2 },
        },
      ];

      (mockPrisma.classschedule.findMany as jest.Mock).mockResolvedValue(mockSchedules as any);

      const result = await conflictRepository.findAllConflicts(2567, "SEMESTER_1");

      expect(result.unassignedSchedules).toHaveLength(2);
      expect(result.unassignedSchedules[0]).toMatchObject({
        classId: "1-1-MATH",
        gradeName: "ม.1/1",
        subjectName: "คณิตศาสตร์",
        missingTeacher: true,
        missingRoom: false,
      });
      expect(result.unassignedSchedules[1]).toMatchObject({
        classId: "1-2-SCI",
        gradeName: "ม.1/2",
        subjectName: "วิทยาศาสตร์",
        missingTeacher: false,
        missingRoom: true,
      });
    });

    it("should detect multiple conflict types simultaneously", async () => {
      const mockSchedules = [
        // Teacher conflict (Teacher 1 in two places)
        {
          ClassID: "1-1-MATH",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-1", GradeName: "ม.1/1" },
          subject: { SubjectCode: "MATH", SubjectName: "คณิตศาสตร์" },
          teacher: { TeacherID: 1, TitleName: "นาย", FirstName: "สมชาย", LastName: "ใจดี" },
          room: { RoomID: 101, RoomName: "ห้อง 101" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
        {
          ClassID: "1-2-MATH",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-2", GradeName: "ม.1/2" },
          subject: { SubjectCode: "MATH", SubjectName: "คณิตศาสตร์" },
          teacher: { TeacherID: 1, TitleName: "นาย", FirstName: "สมชาย", LastName: "ใจดี" },
          room: { RoomID: 102, RoomName: "ห้อง 102" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
        // Room conflict (Room 201 used twice)
        {
          ClassID: "2-1-SCI",
          TimeslotID: "1-MON-2",
          gradelevel: { GradeID: "2-1", GradeName: "ม.2/1" },
          subject: { SubjectCode: "SCI", SubjectName: "วิทยาศาสตร์" },
          teacher: { TeacherID: 2, TitleName: "นาง", FirstName: "สมหญิง", LastName: "รักเรียน" },
          room: { RoomID: 201, RoomName: "ห้อง 201" },
          timeslot: { TimeslotID: "1-MON-2", Day: "MON", PeriodStart: 2 },
        },
        {
          ClassID: "2-2-ENG",
          TimeslotID: "1-MON-2",
          gradelevel: { GradeID: "2-2", GradeName: "ม.2/2" },
          subject: { SubjectCode: "ENG", SubjectName: "ภาษาอังกฤษ" },
          teacher: { TeacherID: 3, TitleName: "นาง", FirstName: "สมศรี", LastName: "เก่งภาษา" },
          room: { RoomID: 201, RoomName: "ห้อง 201" },
          timeslot: { TimeslotID: "1-MON-2", Day: "MON", PeriodStart: 2 },
        },
        // Unassigned schedule
        {
          ClassID: "3-1-HIST",
          TimeslotID: "1-MON-3",
          gradelevel: { GradeID: "3-1", GradeName: "ม.3/1" },
          subject: { SubjectCode: "HIST", SubjectName: "ประวัติศาสตร์" },
          teacher: null,
          room: { RoomID: 301, RoomName: "ห้อง 301" },
          timeslot: { TimeslotID: "1-MON-3", Day: "MON", PeriodStart: 3 },
        },
      ];

      (mockPrisma.classschedule.findMany as jest.Mock).mockResolvedValue(mockSchedules as any);

      const result = await conflictRepository.findAllConflicts(2567, "SEMESTER_1");

      expect(result.teacherConflicts).toHaveLength(1);
      expect(result.roomConflicts).toHaveLength(1);
      expect(result.unassignedSchedules).toHaveLength(1);
    });

    it("should handle schedules with no conflicts correctly", async () => {
      const mockSchedules = [
        {
          ClassID: "1-1-MATH",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-1", GradeName: "ม.1/1" },
          subject: { SubjectCode: "MATH", SubjectName: "คณิตศาสตร์" },
          teacher: { TeacherID: 1, TitleName: "นาย", FirstName: "สมชาย", LastName: "ใจดี" },
          room: { RoomID: 101, RoomName: "ห้อง 101" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
        {
          ClassID: "1-2-SCI",
          TimeslotID: "1-MON-2", // Different timeslot
          gradelevel: { GradeID: "1-2", GradeName: "ม.1/2" },
          subject: { SubjectCode: "SCI", SubjectName: "วิทยาศาสตร์" },
          teacher: { TeacherID: 2, TitleName: "นาง", FirstName: "สมหญิง", LastName: "รักเรียน" },
          room: { RoomID: 102, RoomName: "ห้อง 102" },
          timeslot: { TimeslotID: "1-MON-2", Day: "MON", PeriodStart: 2 },
        },
      ];

      (mockPrisma.classschedule.findMany as jest.Mock).mockResolvedValue(mockSchedules as any);

      const result = await conflictRepository.findAllConflicts(2567, "SEMESTER_1");

      expect(result.teacherConflicts).toHaveLength(0);
      expect(result.roomConflicts).toHaveLength(0);
      expect(result.classConflicts).toHaveLength(0);
      expect(result.unassignedSchedules).toHaveLength(0);
    });

    it("should correctly filter by academic year and semester", async () => {
      (mockPrisma.classschedule.findMany as jest.Mock).mockResolvedValue([]);

      await conflictRepository.findAllConflicts(2567, "SEMESTER_2");

      expect((mockPrisma.classschedule.findMany as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AcademicYear: 2567,
            Semester: "SEMESTER_2",
          },
        })
      );
    });
  });
});
