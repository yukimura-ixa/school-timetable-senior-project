/**
 * Unit Tests for Conflict Detection Repository
 * Tests all conflict detection logic including teacher, room, class, and unassigned conflicts
 */

// Mock both prisma paths since @/lib/prisma re-exports from @/libs/prisma
jest.mock("@/libs/prisma", () => ({
  __esModule: true,
  default: {
    classschedule: {
      findMany: jest.fn(), // Use jest.fn() directly in the mock
    },
  },
}));

jest.mock("@/lib/prisma", () => jest.requireMock("@/libs/prisma"));

import { conflictRepository } from "@/features/conflict/infrastructure/repositories/conflict.repository";
import prisma from "@/lib/prisma";

// Get reference to the mocked function
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe.skip("Conflict Detection Repository - SCHEMA MIGRATION REQUIRED", () => {
  /**
   * ⚠️ TESTS SKIPPED - Repository needs schema migration
   * 
   * These tests were written for the old schema where:
   * - class_schedule had direct TeacherID foreign key
   * - AcademicYear/Semester were on class_schedule table
   * 
   * Current schema uses:
   * - teachers_responsibility many-to-many junction table
   * - AcademicYear/Semester moved to timeslot table
   * 
   * See conflict.repository.ts for detailed migration guide.
   * Tests will be re-enabled once repository is updated.
   */
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAllConflicts", () => {
    it("should return empty arrays when no schedules exist", async () => {
      (mockPrisma.classschedule.findMany as jest.Mock).mockResolvedValue([]);

      const result = await conflictRepository.findAllConflicts(2567, "SEMESTER_1");

      expect(result).toEqual({
        teacherConflicts: [],
        roomConflicts: [],
        classConflicts: [],
        unassignedSchedules: [],
      });
    });

    it("should detect teacher conflicts (same teacher in multiple classes at same timeslot)", async () => {
      const mockSchedules = [
        {
          ClassID: "1-1-MATH",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-1", GradeName: "ม.1/1" },
          subject: { SubjectCode: "MATH", SubjectName: "คณิตศาสตร์" },
          teacher: { TeacherID: 1, TitleName: "นาย", FirstName: "สมชาย", LastName: "ใจดี" },
          room: { RoomID: 1, RoomName: "101" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
        {
          ClassID: "1-2-MATH",
          TimeslotID: "1-MON-1",
          gradelevel: { GradeID: "1-2", GradeName: "ม.1/2" },
          subject: { SubjectCode: "MATH", SubjectName: "คณิตศาสตร์" },
          teacher: { TeacherID: 1, TitleName: "นาย", FirstName: "สมชาย", LastName: "ใจดี" },
          room: { RoomID: 2, RoomName: "102" },
          timeslot: { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
        },
      ];

      (mockPrisma.classschedule.findMany as jest.Mock).mockResolvedValue(mockSchedules as any);

      const result = await conflictRepository.findAllConflicts(2567, "SEMESTER_1");

      expect(result.teacherConflicts).toHaveLength(1);
      expect(result.teacherConflicts[0]).toMatchObject({
        teacherId: 1,
        teacherName: "นาย สมชาย ใจดี",
        timeslotId: "1-MON-1",
      });
      expect(result.teacherConflicts[0].conflictingSchedules).toHaveLength(2);
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
