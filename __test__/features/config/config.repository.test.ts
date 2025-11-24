/**
 * Unit Tests for Config Repository
 * Tests new repository methods added for lifecycle management
 *
 * Note: Prisma is mocked globally in jest.setup.js
 */

import * as configRepository from "@/features/config/infrastructure/repositories/config.repository";
import prisma from "@/lib/prisma";
import { semester } from "@/prisma/generated/client";

// Get reference to the mocked Prisma client
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("Config Repository - Lifecycle Methods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("updateStatus", () => {
    it("should update config status and publishedAt", async () => {
      const mockConfig = {
        ConfigID: "1-2567",
        status: "PUBLISHED",
        publishedAt: new Date("2024-01-15"),
        updatedAt: new Date(),
      };

      mockPrisma.table_config.update = jest.fn().mockResolvedValue(mockConfig);

      const result = await configRepository.updateStatus(
        "1-2567",
        "PUBLISHED",
        new Date("2024-01-15"),
      );

      expect(mockPrisma.table_config.update).toHaveBeenCalledWith({
        where: { ConfigID: "1-2567" },
        data: expect.objectContaining({
          status: "PUBLISHED",
          publishedAt: new Date("2024-01-15"),
        }),
      });
      expect(result).toEqual(mockConfig);
    });

    it("should update config status without publishedAt", async () => {
      const mockConfig = {
        ConfigID: "1-2567",
        status: "DRAFT",
        publishedAt: null,
        updatedAt: new Date(),
      };

      mockPrisma.table_config.update = jest.fn().mockResolvedValue(mockConfig);

      const result = await configRepository.updateStatus("1-2567", "DRAFT");

      expect(mockPrisma.table_config.update).toHaveBeenCalledWith({
        where: { ConfigID: "1-2567" },
        data: expect.objectContaining({
          status: "DRAFT",
        }),
      });
      expect(result).toEqual(mockConfig);
    });
  });

  describe("updateCompleteness", () => {
    it("should update config completeness percentage", async () => {
      const mockConfig = {
        ConfigID: "1-2567",
        configCompleteness: 75,
        updatedAt: new Date(),
      };

      mockPrisma.table_config.update = jest.fn().mockResolvedValue(mockConfig);

      const result = await configRepository.updateCompleteness("1-2567", 75);

      expect(mockPrisma.table_config.update).toHaveBeenCalledWith({
        where: { ConfigID: "1-2567" },
        data: expect.objectContaining({
          configCompleteness: 75,
        }),
      });
      expect(result).toEqual(mockConfig);
    });
  });

  describe("countEntitiesForCompleteness", () => {
    it("should count all entities for completeness calculation", async () => {
      mockPrisma.timeslot.count = jest.fn().mockResolvedValue(30);
      mockPrisma.teachers_responsibility.count = jest
        .fn()
        .mockResolvedValue(50);
      mockPrisma.subject.count = jest.fn().mockResolvedValue(25);
      mockPrisma.gradelevel.count = jest.fn().mockResolvedValue(12);
      mockPrisma.room.count = jest.fn().mockResolvedValue(20);

      const result = await configRepository.countEntitiesForCompleteness(
        2567,
        "SEMESTER_1" as semester,
      );

      expect(result).toEqual({
        timeslotCount: 30,
        teacherCount: 50,
        subjectCount: 25,
        classCount: 12,
        roomCount: 20,
      });

      expect(mockPrisma.timeslot.count).toHaveBeenCalledWith({
        where: {
          AcademicYear: 2567,
          Semester: "SEMESTER_1",
        },
      });
      expect(mockPrisma.teachers_responsibility.count).toHaveBeenCalledWith({
        where: {
          AcademicYear: 2567,
          Semester: "SEMESTER_1",
        },
      });
    });
  });

  describe("findByIdWithCounts", () => {
    it("should return config with schedule counts", async () => {
      const mockConfig = {
        ConfigID: "1-2567",
        AcademicYear: 2567,
        Semester: "SEMESTER_1" as semester,
        status: "PUBLISHED",
        configCompleteness: 100,
      };

      mockPrisma.table_config.findUnique = jest
        .fn()
        .mockResolvedValue(mockConfig);
      mockPrisma.timeslot.count = jest.fn().mockResolvedValue(30);
      mockPrisma.teachers_responsibility.count = jest
        .fn()
        .mockResolvedValue(50);
      mockPrisma.class_schedule.count = jest.fn().mockResolvedValue(120);

      const result = await configRepository.findByIdWithCounts(
        "1-2567",
        2567,
        "SEMESTER_1" as semester,
      );

      expect(result).toEqual({
        ...mockConfig,
        counts: {
          timeslots: 30,
          teachers: 50,
          schedules: 120,
        },
      });
    });

    it("should return null when config not found", async () => {
      mockPrisma.table_config.findUnique = jest.fn().mockResolvedValue(null);

      const result = await configRepository.findByIdWithCounts(
        "1-2567",
        2567,
        "SEMESTER_1" as semester,
      );

      expect(result).toBeNull();
    });
  });

  describe("transaction", () => {
    it("should execute callback in transaction", async () => {
      const mockResult = { success: true };
      mockPrisma.$transaction = jest.fn((callback) => {
        const mockTx = {
          table_config: {
            create: jest.fn().mockResolvedValue({ ConfigID: "1-2567" }),
          },
        };
        return callback(mockTx);
      });

      const result = await configRepository.transaction(async (tx) => {
        await tx.table_config.create({ data: {} as any });
        return mockResult;
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
