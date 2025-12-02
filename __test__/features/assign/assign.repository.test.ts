import { vi, MockedObject, Mock } from "vitest";
/**
 * Unit Tests for Assign Repository
 * Tests new repository methods for responsibility management
 *
 * Note: Prisma is mocked globally in vitest.setup.ts
 */

import * as assignRepository from "@/features/assign/infrastructure/repositories/assign.repository";
import prisma from "@/lib/prisma";

// Get reference to the mocked Prisma client
const mockPrisma = prisma as MockedObject<typeof prisma>;

describe("Assign Repository - New Methods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findByRespId", () => {
    it("should find responsibility by RespID with relations", async () => {
      const mockResp = {
        RespID: 123,
        TeacherID: 1,
        SubjectCode: "MATH101",
        GradeID: "M11",
        AcademicYear: 2567,
        Semester: "SEMESTER_1",
        subject: {
          SubjectCode: "MATH101",
          SubjectName: "คณิตศาสตร์ 1",
          Credit: "1.0",
        },
        gradelevel: {
          GradeID: "M11",
          Year: 1,
          Number: 1,
        },
        teacher: {
          TeacherID: 1,
          Firstname: "สมชาย",
          Lastname: "ใจดี",
        },
      };

      mockPrisma.teachers_responsibility.findUnique = vi        .fn()
        .mockResolvedValue(mockResp);

      const result = await assignRepository.findByRespId(123);

      expect(
        mockPrisma.teachers_responsibility.findUnique,
      ).toHaveBeenCalledWith({
        where: { RespID: 123 },
        include: {
          subject: true,
          gradelevel: true,
          teacher: true,
        },
      });
      expect(result).toEqual(mockResp);
    });

    it("should return null when responsibility not found", async () => {
      mockPrisma.teachers_responsibility.findUnique = vi        .fn()
        .mockResolvedValue(null);

      const result = await assignRepository.findByRespId(999);

      expect(result).toBeNull();
    });
  });

  describe("transaction", () => {
    it("should execute callback in transaction", async () => {
      const mockResult = { deleted: 1, created: 2 };
      mockPrisma.$transaction = vi.fn((callback) => {
        const mockTx = {
          teachers_responsibility: {
            delete: vi.fn().mockResolvedValue({ RespID: 1 }),
            create: vi.fn().mockResolvedValue({ RespID: 2 }),
          },
        };
        return callback(mockTx);
      });

      const result = await assignRepository.transaction(async (tx) => {
        await tx.teachers_responsibility.delete({ where: { RespID: 1 } });
        await tx.teachers_responsibility.create({ data: {} as any });
        return mockResult;
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it("should rollback transaction on error", async () => {
      const error = new Error("Transaction failed");
      mockPrisma.$transaction = vi.fn((callback) => {
        return Promise.reject(error);
      });

      await expect(
        assignRepository.transaction(async (tx) => {
          throw error;
        }),
      ).rejects.toThrow("Transaction failed");
    });
  });
});
