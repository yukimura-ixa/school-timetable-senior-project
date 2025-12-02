import { vi, MockedObject, Mock } from "vitest";
/**
 * Unit Tests for Lock Repository
 * Tests new repository methods added for multi-entity queries
 *
 * Note: Prisma is mocked globally in vitest.setup.ts
 */

import * as lockRepository from "@/features/lock/infrastructure/repositories/lock.repository";
import prisma from "@/lib/prisma";
import { semester } from "@/prisma/generated/client";

// Get reference to the mocked Prisma client
const mockPrisma = prisma as MockedObject<typeof prisma>;

describe("Lock Repository - Multi-Entity Query Methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAllGradeLevels", () => {
    it("should return all grade levels ordered by GradeID", async () => {
      const mockGrades = [
        { GradeID: "M11", Year: 1, Number: 1 },
        { GradeID: "M12", Year: 1, Number: 2 },
        { GradeID: "M21", Year: 2, Number: 1 },
      ];

      mockPrisma.gradelevel.findMany = vi.fn().mockResolvedValue(mockGrades);

      const result = await lockRepository.findAllGradeLevels();

      expect(mockPrisma.gradelevel.findMany).toHaveBeenCalledWith({
        orderBy: { GradeID: "asc" },
      });
      expect(result).toEqual(mockGrades);
    });
  });

  describe("findTimeslotsByTerm", () => {
    it("should return timeslots for academic year and semester ordered by day and time", async () => {
      const mockTimeslots = [
        {
          TimeslotID: "1-2567-MON1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          DayOfWeek: "MONDAY",
          StartTime: new Date("2024-01-01T08:00:00"),
        },
        {
          TimeslotID: "1-2567-MON2",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          DayOfWeek: "MONDAY",
          StartTime: new Date("2024-01-01T09:00:00"),
        },
      ];

      mockPrisma.timeslot.findMany = vi.fn().mockResolvedValue(mockTimeslots);

      const result = await lockRepository.findTimeslotsByTerm(
        2567,
        "SEMESTER_1" as semester,
      );

      expect(mockPrisma.timeslot.findMany).toHaveBeenCalledWith({
        where: {
          AcademicYear: 2567,
          Semester: "SEMESTER_1",
        },
        orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
      });
      expect(result).toEqual(mockTimeslots);
    });
  });

  describe("findAllRooms", () => {
    it("should return all rooms ordered by RoomID", async () => {
      const mockRooms = [
        { RoomID: 101, RoomName: "ห้อง 101", Building: "A" },
        { RoomID: 102, RoomName: "ห้อง 102", Building: "A" },
        { RoomID: 201, RoomName: "ห้อง 201", Building: "B" },
      ];

      mockPrisma.room.findMany = vi.fn().mockResolvedValue(mockRooms);

      const result = await lockRepository.findAllRooms();

      expect(mockPrisma.room.findMany).toHaveBeenCalledWith({
        orderBy: { RoomID: "asc" },
      });
      expect(result).toEqual(mockRooms);
    });
  });

  describe("findAllSubjects", () => {
    it("should return all subjects ordered by SubjectCode", async () => {
      const mockSubjects = [
        { SubjectCode: "MATH101", SubjectName: "คณิตศาสตร์ 1", Credit: "1.0" },
        { SubjectCode: "SCI101", SubjectName: "วิทยาศาสตร์ 1", Credit: "1.5" },
        { SubjectCode: "TH101", SubjectName: "ภาษาไทย 1", Credit: "1.0" },
      ];

      mockPrisma.subject.findMany = vi.fn().mockResolvedValue(mockSubjects);

      const result = await lockRepository.findAllSubjects();

      expect(mockPrisma.subject.findMany).toHaveBeenCalledWith({
        orderBy: { SubjectCode: "asc" },
      });
      expect(result).toEqual(mockSubjects);
    });
  });

  describe("findTeacherResponsibilitiesByTerm", () => {
    it("should return teacher responsibilities with teacher relations", async () => {
      const mockResponsibilities = [
        {
          RespID: 1,
          TeacherID: 100,
          SubjectCode: "MATH101",
          GradeID: "M11",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          teacher: {
            TeacherID: 100,
            Firstname: "สมชาย",
            Lastname: "ใจดี",
            Department: "คณิตศาสตร์",
          },
        },
        {
          RespID: 2,
          TeacherID: 101,
          SubjectCode: "SCI101",
          GradeID: "M11",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          teacher: {
            TeacherID: 101,
            Firstname: "สมหญิง",
            Lastname: "รักเรียน",
            Department: "วิทยาศาสตร์",
          },
        },
      ];

      mockPrisma.teachers_responsibility.findMany = vi        .fn()
        .mockResolvedValue(mockResponsibilities);

      const result = await lockRepository.findTeacherResponsibilitiesByTerm(
        2567,
        "SEMESTER_1" as semester,
      );

      expect(mockPrisma.teachers_responsibility.findMany).toHaveBeenCalledWith({
        where: {
          AcademicYear: 2567,
          Semester: "SEMESTER_1",
        },
        include: {
          teacher: true,
        },
      });
      expect(result).toEqual(mockResponsibilities);
    });
  });
});
