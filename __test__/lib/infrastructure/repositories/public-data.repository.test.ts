import { vi, MockedObject, Mock } from "vitest";
/**
 * Unit tests for Public Data Repository
 *
 * Tests all repository methods using mocked Prisma Client.
 * Uses global Prisma mock from vitest.setup.ts.
 */

// Vitest globals are available via globals: true in vitest.config.ts
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
import type {
  PublicTeacherFilters,
  PublicGradeLevelFilters,
} from "@/lib/infrastructure/repositories/public-data.repository";
import { semester } from "@/prisma/generated/client";
import prisma from "@/lib/prisma";

// Use the globally mocked Prisma Client (from vitest.setup.ts)
const mockPrisma = prisma as MockedObject<typeof prisma>;

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// ===========================================================================
// Tests - Teachers
// ===========================================================================

describe("publicDataRepository - Teachers", () => {
  describe("findPublicTeachers", () => {
    test("should return teachers with calculated utilization", async () => {
      const mockTeachers = [
        {
          TeacherID: 1,
          Prefix: "Mr.",
          Firstname: "John",
          Lastname: "Doe",
          Department: "Mathematics",
          Email: "john.doe@school.com",
          Role: "teacher",
          teachers_responsibility: [
            { SubjectCode: "MATH101", TeachHour: 5 },
            { SubjectCode: "MATH201", TeachHour: 3 },
          ],
        },
      ];

      mockPrisma.teacher.findMany = vi        .fn()
        .mockResolvedValue(mockTeachers as any);

      const filters: PublicTeacherFilters = {
        academicYear: 2567,
        semester: "1", // Use string semester "1" or "2", not enum
        searchQuery: undefined,
        sortBy: "name",
        sortOrder: "asc",
      };

      const result = await publicDataRepository.findPublicTeachers(filters);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);

      const teacher = result[0];
      expect(teacher.teacherId).toBe(1);
      expect(teacher.name).toBe("Mr.John Doe"); // Repository concatenates without space
      expect(teacher.department).toBe("Mathematics");
      expect(teacher.subjectCount).toBe(2);
      expect(teacher.weeklyHours).toBe(8);
      expect(teacher.utilization).toBe(20); // 8 hours / 40 MAX_WEEKLY_HOURS * 100 = 20%
      expect("email" in teacher).toBe(false);
    });

    test("should filter teachers by search query", async () => {
      mockPrisma.teacher.findMany = vi.fn().mockResolvedValue([]);

      const filters: PublicTeacherFilters = {
        academicYear: 2567,
        semester: "1", // Use string semester "1" or "2", not enum
        searchQuery: "John",
        sortBy: "name",
        sortOrder: "asc",
      };

      await publicDataRepository.findPublicTeachers(filters);

      expect(mockPrisma.teacher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe("countTeachers", () => {
    test("should return total count of teachers", async () => {
      mockPrisma.teacher.count = vi.fn().mockResolvedValue(42);

      const count = await publicDataRepository.countTeachers();

      expect(count).toBe(42);
    });
  });
});

// ===========================================================================
// Tests - Statistics
// ===========================================================================

describe("publicDataRepository - Statistics", () => {
  describe("getQuickStats", () => {
    test("should return comprehensive system statistics", async () => {
      const mockConfig = {
        AcademicYear: 2567,
        Semester: semester.SEMESTER_1,
        updatedAt: new Date("2024-01-15"),
      };

      mockPrisma.table_config.findFirst = vi        .fn()
        .mockResolvedValue(mockConfig as any);
      mockPrisma.teacher.count = vi.fn().mockResolvedValue(50);
      mockPrisma.gradelevel.count = vi.fn().mockResolvedValue(15);
      mockPrisma.room.count = vi.fn().mockResolvedValue(20);
      mockPrisma.subject.count = vi.fn().mockResolvedValue(30);
      mockPrisma.program.count = vi.fn().mockResolvedValue(5);
      mockPrisma.timeslot.count = vi.fn().mockResolvedValue(8);

      const result = await publicDataRepository.getQuickStats();

      expect(result.totalTeachers).toBe(50);
      expect(result.totalClasses).toBe(15);
      expect(result.totalRooms).toBe(20);
      expect(result.totalSubjects).toBe(30);
    });

    test("should handle missing config gracefully", async () => {
      mockPrisma.table_config.findFirst = vi.fn().mockResolvedValue(null);

      const result = await publicDataRepository.getQuickStats();

      expect(result.currentTerm).toBe("N/A");
      expect(result.totalTeachers).toBe(0);
    });
  });

  describe("getPeriodLoad", () => {
    test("should return period load for weekdays", async () => {
      mockPrisma.table_config.findFirst = vi.fn().mockResolvedValue({
        AcademicYear: 2567,
        Semester: semester.SEMESTER_1,
      } as any);

      mockPrisma.class_schedule.count = vi        .fn()
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(48)
        .mockResolvedValueOnce(52)
        .mockResolvedValueOnce(45)
        .mockResolvedValueOnce(40);

      const result = await publicDataRepository.getPeriodLoad(
        2567,
        semester.SEMESTER_1,
      );

      expect(result).toHaveLength(5);
      expect(result[0].periods).toBe(50);
    });
  });

  describe("getRoomOccupancy", () => {
    test("should calculate room occupancy", async () => {
      mockPrisma.table_config.findFirst = vi.fn().mockResolvedValue({
        AcademicYear: 2567,
        Semester: semester.SEMESTER_1,
      } as any);
      mockPrisma.room.count = vi.fn().mockResolvedValue(20);
      mockPrisma.timeslot.findMany = vi        .fn()
        .mockResolvedValue([
          { TimeslotID: "T1", DayOfWeek: "MON", Period: 1 },
        ] as any);
      mockPrisma.class_schedule.findMany = vi        .fn()
        .mockResolvedValue([{ RoomID: "R1", TimeslotID: "T1" }] as any);

      const result = await publicDataRepository.getRoomOccupancy(
        2567,
        semester.SEMESTER_1,
      );

      expect(result.length).toBeGreaterThan(0);
      result.forEach((occ) => {
        expect(occ).toHaveProperty("day");
        expect(occ).toHaveProperty("occupancyPercent");
      });
    });
  });
});

// ===========================================================================
// Tests - Grade Levels
// ===========================================================================

describe("publicDataRepository - Grade Levels", () => {
  describe("findPublicGradeLevels", () => {
    test("should return grade levels with counts", async () => {
      const mockGradeLevels = [
        {
          GradeID: "G1",
          Year: 1,
          Number: 1,
          StudentCount: 2, // Correct field name from schema
          ProgramID: 1,
          class_schedule: [
            { SubjectCode: "MATH101" },
            { SubjectCode: "SCI101" },
          ],
        },
      ];

      mockPrisma.gradelevel.findMany = vi        .fn()
        .mockResolvedValue(mockGradeLevels as any);

      const filters: PublicGradeLevelFilters = {
        academicYear: 2567,
        semester: "1", // Use string semester "1" or "2", not enum
      };

      const result = await publicDataRepository.findPublicGradeLevels(filters);

      expect(result).toHaveLength(1);
      expect(result[0].gradeId).toBe("G1");
      expect(result[0].studentCount).toBe(2);
      expect(result[0].subjectCount).toBe(2);
    });
  });

  describe("countGradeLevels", () => {
    test("should return grade level count", async () => {
      mockPrisma.gradelevel.count = vi.fn().mockResolvedValue(24);

      const result = await publicDataRepository.countGradeLevels();

      expect(result).toBe(24);
    });
  });
});

// ===========================================================================
// Tests - Error Handling
// ===========================================================================

describe("publicDataRepository - Error Handling", () => {
  test("should handle database errors in findPublicTeachers", async () => {
    mockPrisma.teacher.findMany = vi      .fn()
      .mockRejectedValue(new Error("DB error"));

    const filters: PublicTeacherFilters = {
      academicYear: 2567,
      semester: "1", // Use string semester "1" or "2", not enum
    };

    await expect(
      publicDataRepository.findPublicTeachers(filters),
    ).rejects.toThrow("DB error");
  });
});
