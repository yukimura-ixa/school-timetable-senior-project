/**
 * Unit Tests for Semester Repository
 * Tests new repository methods added for timeslot operations
 * 
 * Note: Prisma is mocked globally in jest.setup.js
 */

import { semesterRepository } from "@/features/semester/infrastructure/repositories/semester.repository";
import prisma from "@/lib/prisma";
import { semester } from '@/prisma/generated/client';;

// Get reference to the mocked Prisma client
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("Semester Repository - Timeslot Methods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findTimeslots", () => {
    it("should find all timeslots for a given term", async () => {
      const mockTimeslots = [
        {
          TimeslotID: "1-2567-MON1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          StartTime: "08:00",
          EndTime: "09:00",
          DayOfWeek: "MONDAY",
        },
        {
          TimeslotID: "1-2567-MON2",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          StartTime: "09:00",
          EndTime: "10:00",
          DayOfWeek: "MONDAY",
        },
      ];

      mockPrisma.timeslot.findMany = jest.fn().mockResolvedValue(mockTimeslots);

      const result = await semesterRepository.findTimeslots(
        2567,
        "SEMESTER_1" as semester
      );

      expect(mockPrisma.timeslot.findMany).toHaveBeenCalledWith({
        where: {
          AcademicYear: 2567,
          Semester: "SEMESTER_1",
        },
      });
      expect(result).toEqual(mockTimeslots);
    });
  });

  describe("copyTimeslots", () => {
    it("should copy timeslots from source to target semester", async () => {
      const sourceTimeslots = [
        {
          TimeslotID: "1-2566-MON1",
          AcademicYear: 2566,
          Semester: "SEMESTER_1" as semester,
          StartTime: "08:00",
          EndTime: "09:00",
          Breaktime: 0,
          DayOfWeek: "MONDAY",
        },
        {
          TimeslotID: "1-2566-TUE1",
          AcademicYear: 2566,
          Semester: "SEMESTER_1" as semester,
          StartTime: "08:00",
          EndTime: "09:00",
          Breaktime: 0,
          DayOfWeek: "TUESDAY",
        },
      ];

      mockPrisma.timeslot.findMany = jest.fn().mockResolvedValue(sourceTimeslots);
      mockPrisma.timeslot.createMany = jest.fn().mockResolvedValue({ count: 2 });

      const result = await semesterRepository.copyTimeslots(
        2566, // source year
        "SEMESTER_1" as semester, // source semester
        2567, // target year
        "SEMESTER_1" as semester, // target semester
        1, // source semester number
        1  // target semester number
      );

      expect(mockPrisma.timeslot.findMany).toHaveBeenCalledWith({
        where: {
          AcademicYear: 2566,
          Semester: "SEMESTER_1",
        },
      });

      expect(mockPrisma.timeslot.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            TimeslotID: "1-2567-MON1", // Replaced year/semester
            AcademicYear: 2567,
            Semester: "SEMESTER_1",
          }),
          expect.objectContaining({
            TimeslotID: "1-2567-TUE1",
            AcademicYear: 2567,
            Semester: "SEMESTER_1",
          }),
        ]),
        skipDuplicates: true,
      });

      expect(result).toEqual(sourceTimeslots);
    });

    it("should return empty array when no timeslots to copy", async () => {
      mockPrisma.timeslot.findMany = jest.fn().mockResolvedValue([]);

      const result = await semesterRepository.copyTimeslots(
        2566,
        "SEMESTER_1" as semester,
        2567,
        "SEMESTER_1" as semester,
        1,
        1
      );

      expect(result).toEqual([]);
      expect(mockPrisma.timeslot.createMany).not.toHaveBeenCalled();
    });
  });

  describe("createTimeslots", () => {
    it("should create multiple timeslots in bulk", async () => {
      const timeslotsToCreate = [
        {
          TimeslotID: "1-2567-MON1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          StartTime: "08:00",
          EndTime: "09:00",
          Breaktime: 0,
          DayOfWeek: "MONDAY",
        },
        {
          TimeslotID: "1-2567-TUE1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          StartTime: "08:00",
          EndTime: "09:00",
          Breaktime: 0,
          DayOfWeek: "TUESDAY",
        },
      ];

      mockPrisma.timeslot.createMany = jest.fn().mockResolvedValue({ count: 2 });

      await semesterRepository.createTimeslots(timeslotsToCreate);

      expect(mockPrisma.timeslot.createMany).toHaveBeenCalledWith({
        data: timeslotsToCreate,
        skipDuplicates: true,
      });
    });
  });

  describe("createWithTimeslots", () => {
    it("should create semester with timeslots in a transaction", async () => {
      const mockSemester = {
        ConfigID: "1-2567",
        AcademicYear: 2567,
        Semester: "SEMESTER_1" as semester,
        status: "DRAFT",
        configCompleteness: 25,
      };

      const timeslots = [
        {
          TimeslotID: "1-2567-MON1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          StartTime: "08:00",
          EndTime: "09:00",
          Breaktime: 0,
          DayOfWeek: "MONDAY",
        },
      ];

      // Mock transaction to execute callback with mock tx
      mockPrisma.$transaction = jest.fn((callback) => {
        const mockTx = {
          table_config: {
            create: jest.fn().mockResolvedValue(mockSemester),
            update: jest.fn().mockResolvedValue(mockSemester),
          },
          timeslot: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return callback(mockTx);
      });

      const result = await semesterRepository.createWithTimeslots({
        configId: "1-2567",
        academicYear: 2567,
        semester: "SEMESTER_1" as semester,
        config: {},
        timeslots,
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockSemester);
    });

    it("should create semester without timeslots", async () => {
      const mockSemester = {
        ConfigID: "1-2567",
        AcademicYear: 2567,
        Semester: "SEMESTER_1" as semester,
        status: "DRAFT",
        configCompleteness: 0,
      };

      mockPrisma.$transaction = jest.fn((callback) => {
        const mockTx = {
          table_config: {
            create: jest.fn().mockResolvedValue(mockSemester),
          },
        };
        return callback(mockTx);
      });

      const result = await semesterRepository.createWithTimeslots({
        configId: "1-2567",
        academicYear: 2567,
        semester: "SEMESTER_1" as semester,
        config: {},
      });

      expect(result).toEqual(mockSemester);
    });
  });

  describe("transaction", () => {
    it("should execute callback in transaction", async () => {
      const mockResult = { success: true };
      mockPrisma.$transaction = jest.fn((callback) => {
        const mockTx = {
          table_config: {
            create: jest.fn().mockResolvedValue({ ConfigID: '1-2567' }),
          },
        };
        return callback(mockTx);
      });

      const result = await semesterRepository.transaction(async (tx) => {
        await tx.table_config.create({ data: {} as any });
        return mockResult;
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
