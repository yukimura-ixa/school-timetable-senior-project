/**
 * Unit Tests for Timeslot Repository
 * Tests new transaction wrapper method
 *
 * Note: Prisma is mocked globally in jest.setup.js
 */

import { timeslotRepository } from "@/features/timeslot/infrastructure/repositories/timeslot.repository";
import prisma from "@/lib/prisma";

// Get reference to the mocked Prisma client
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("Timeslot Repository - Transaction Method", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("transaction", () => {
    it("should execute callback in transaction", async () => {
      const mockResult = { created: 5 };
      mockPrisma.$transaction = jest.fn((callback) => {
        const mockTx = {
          table_config: {
            create: jest.fn().mockResolvedValue({ ConfigID: "1-2567" }),
          },
          timeslot: {
            createMany: jest.fn().mockResolvedValue({ count: 5 }),
          },
        };
        return callback(mockTx);
      });

      const result = await timeslotRepository.transaction(async (tx) => {
        await tx.table_config.create({ data: {} as any });
        await tx.timeslot.createMany({ data: [] });
        return mockResult;
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it("should handle complex transaction operations", async () => {
      const mockConfig = {
        ConfigID: "1-2567",
        AcademicYear: 2567,
        Semester: "SEMESTER_1",
      };

      mockPrisma.$transaction = jest.fn((callback) => {
        const mockTx = {
          table_config: {
            create: jest.fn().mockResolvedValue(mockConfig),
          },
          timeslot: {
            createMany: jest.fn().mockResolvedValue({ count: 30 }),
          },
        };
        return callback(mockTx);
      });

      const result = await timeslotRepository.transaction(async (tx) => {
        const config = await tx.table_config.create({
          data: mockConfig as any,
        });
        const timeslots = await tx.timeslot.createMany({
          data: [] as any,
        });
        return { config, timeslotCount: timeslots.count };
      });

      expect(result).toEqual({
        config: mockConfig,
        timeslotCount: 30,
      });
    });

    it("should rollback transaction on error", async () => {
      const error = new Error("Database constraint violation");
      mockPrisma.$transaction = jest.fn(() => Promise.reject(error));

      await expect(
        timeslotRepository.transaction(async (tx) => {
          await tx.table_config.create({ data: {} as any });
          throw error;
        }),
      ).rejects.toThrow("Database constraint violation");
    });
  });
});
