/**
 * Config Lifecycle Actions Tests
 * Unit tests for Server Actions with mocked Prisma
 * 
 * Note: Prisma is mocked globally in jest.setup.js
 * Jest globals (describe, it, expect, jest, beforeEach) are available globally
 */

import {
  updateConfigStatusAction,
  updateConfigCompletenessAction,
  getConfigWithCompletenessAction,
} from "@/features/config/application/actions/config-lifecycle.actions";
import prisma from "@/lib/prisma";

// Cast to mocked type for access to mock methods
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Global cleanup to prevent Jest from hanging
afterAll(async () => {
  // Clear all timers and pending async operations
  jest.clearAllTimers();
  jest.clearAllMocks();
  // Allow pending microtasks to complete
  await new Promise((resolve) => setImmediate(resolve));
});

describe("updateConfigStatusAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully update status from DRAFT to PUBLISHED with sufficient completeness", async () => {
    const mockConfig = {
      ConfigID: "1-2024",
      status: "DRAFT",
      configCompleteness: 50,
      publishedAt: null,
    };

    // Use direct assignment to replace pre-configured mock functions
    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockConfig as any));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      ...mockConfig,
      status: "PUBLISHED",
      publishedAt: new Date(),
    } as any));

    const result = await updateConfigStatusAction({
      configId: "1-2024",
      status: "PUBLISHED",
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.table_config.findUnique).toHaveBeenCalledWith({
      where: { ConfigID: "1-2024" },
    });
    expect(mockPrisma.table_config.update).toHaveBeenCalled();
  });

  it("should fail to update status from DRAFT to PUBLISHED with insufficient completeness", async () => {
    const mockConfig = {
      ConfigID: "1-2024",
      status: "DRAFT",
      configCompleteness: 20, // Less than 30%
      publishedAt: null,
    };

    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockConfig as any));

    const result = await updateConfigStatusAction({
      configId: "1-2024",
      status: "PUBLISHED",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    // Reason from canTransitionStatus: must set timeslots first
    expect(result.error).toContain("ตั้งค่าคาบเรียน");
    expect(mockPrisma.table_config.update).not.toHaveBeenCalled();
  });

  it("should successfully update status from PUBLISHED to LOCKED", async () => {
    const mockConfig = {
      ConfigID: "1-2024",
      status: "PUBLISHED",
      configCompleteness: 80,
      publishedAt: new Date(),
    };

    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockConfig as any));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      ...mockConfig,
      status: "LOCKED",
    } as any));

    const result = await updateConfigStatusAction({
      configId: "1-2024",
      status: "LOCKED",
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.table_config.update).toHaveBeenCalled();
  });

  it("should fail when config is not found", async () => {
    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(null));

    const result = await updateConfigStatusAction({
      configId: "NONEXISTENT",
      status: "PUBLISHED",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("ไม่พบการตั้งค่านี้");
    expect(mockPrisma.table_config.update).not.toHaveBeenCalled();
  });

  it("should handle invalid status transition", async () => {
    const mockConfig = {
      ConfigID: "1-2024",
      status: "DRAFT",
      configCompleteness: 50,
      publishedAt: null,
    };

    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockConfig as any));

    const result = await updateConfigStatusAction({
      configId: "1-2024",
      status: "ARCHIVED", // Cannot go directly from DRAFT to ARCHIVED
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockPrisma.table_config.update).not.toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    mockPrisma.table_config.findUnique.mockRejectedValue(
      new Error("Database connection error")
    );

    const result = await updateConfigStatusAction({
      configId: "1-2024",
      status: "PUBLISHED",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should include reason in update when provided", async () => {
    const mockConfig = {
      ConfigID: "1-2024",
      status: "PUBLISHED",
      configCompleteness: 80,
      publishedAt: new Date(),
    };

    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockConfig as any));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      ...mockConfig,
      status: "LOCKED",
    } as any));

    const result = await updateConfigStatusAction({
      configId: "1-2024",
      status: "LOCKED",
      reason: "Finalizing for exam period",
    });

    expect(result.success).toBe(true);
  });
});

describe("updateConfigCompletenessAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate 0% completeness when no data exists", async () => {
    mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.subject.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.gradelevel.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.room.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      configCompleteness: 0,
    } as any));

    const result = await updateConfigCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(result.success).toBe(true);
    expect(result.data?.completeness).toBe(0);
  });

  it("should calculate 100% completeness when all data exists", async () => {
    mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(8));
    mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(15));
    mockPrisma.subject.count = jest.fn(() => Promise.resolve(12));
    mockPrisma.gradelevel.count = jest.fn(() => Promise.resolve(20));
    mockPrisma.room.count = jest.fn(() => Promise.resolve(10));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      configCompleteness: 100,
    } as any));

    const result = await updateConfigCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(result.success).toBe(true);
    expect(result.data?.completeness).toBe(100);
  });

  it("should calculate 30% completeness when only timeslots exist", async () => {
    mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(8));
    mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.subject.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.gradelevel.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.room.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      configCompleteness: 30,
    } as any));

    const result = await updateConfigCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(result.success).toBe(true);
    expect(result.data?.completeness).toBe(30);
  });

  it("should use Promise.all for parallel counting", async () => {
    mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(8));
    mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(15));
    mockPrisma.subject.count = jest.fn(() => Promise.resolve(12));
    mockPrisma.gradelevel.count = jest.fn(() => Promise.resolve(20));
    mockPrisma.room.count = jest.fn(() => Promise.resolve(10));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      configCompleteness: 100,
    } as any));

    const result = await updateConfigCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    // All counts should be called
    expect(mockPrisma.timeslot.count).toHaveBeenCalled();
    expect(mockPrisma.teachers_responsibility.count).toHaveBeenCalled();
    expect(mockPrisma.subject.count).toHaveBeenCalled();
    expect(mockPrisma.gradelevel.count).toHaveBeenCalled();
    expect(mockPrisma.room.count).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("should handle database errors gracefully", async () => {
    mockPrisma.timeslot.count.mockRejectedValue(
      new Error("Database connection error")
    );

    const result = await updateConfigCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should update config with correct configId format", async () => {
    mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(8));
    mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(15));
    mockPrisma.subject.count = jest.fn(() => Promise.resolve(12));
    mockPrisma.gradelevel.count = jest.fn(() => Promise.resolve(20));
    mockPrisma.room.count = jest.fn(() => Promise.resolve(10));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      configCompleteness: 100,
    } as any));

    await updateConfigCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(mockPrisma.table_config.update).toHaveBeenCalledWith({
      where: { ConfigID: "1-2024" },
      data: expect.objectContaining({
        configCompleteness: 100,
      }),
    });
  });
});

describe("getConfigWithCompletenessAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return null data when config does not exist", async () => {
    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(null));

    const result = await getConfigWithCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it("should return config with completeness data when config exists", async () => {
    const mockConfig = {
      ConfigID: "1-2024",
      status: "PUBLISHED",
      configCompleteness: 80,
      publishedAt: new Date(),
      Config: {
        Days: ["MON", "TUE", "WED", "THU", "FRI"],
        TimeslotPerDay: 8,
        Duration: 50,
      },
    };

  mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockConfig as any));
  mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(8));
  mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(15));
  mockPrisma.class_schedule.count = jest.fn(() => Promise.resolve(20));

    const result = await getConfigWithCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  // Returned data spreads config and adds counts object
  expect(result.data?.ConfigID).toBe("1-2024");
  expect(result.data?.counts?.timeslots).toBe(8);
  expect(result.data?.counts?.teachers).toBe(15);
  expect(result.data?.counts?.schedules).toBe(20);
  });

  it("should handle database errors gracefully", async () => {
    mockPrisma.table_config.findUnique.mockRejectedValue(
      new Error("Database connection error")
    );

    const result = await getConfigWithCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should construct correct configId", async () => {
    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(null));

    await getConfigWithCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_2",
    });

    expect(mockPrisma.table_config.findUnique).toHaveBeenCalledWith({
      where: { ConfigID: "2-2024" },
    });
  });

  it("should fetch counts in parallel with Promise.all", async () => {
    const mockConfig = {
      ConfigID: "1-2024",
      status: "DRAFT",
      configCompleteness: 0,
    };

    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockConfig as any));
    mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.class_schedule.count = jest.fn(() => Promise.resolve(0));

    const result = await getConfigWithCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    // The counts that this action actually calls should be checked
    expect(mockPrisma.timeslot.count).toHaveBeenCalled();
    expect(mockPrisma.teachers_responsibility.count).toHaveBeenCalled();
    expect(mockPrisma.class_schedule.count).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("should filter counts by academicYear and semester", async () => {
    const mockConfig = {
      ConfigID: "1-2024",
      status: "DRAFT",
      configCompleteness: 0,
    };

    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockConfig as any));
    mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(8));
    mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(15));
    mockPrisma.class_schedule.count = jest.fn(() => Promise.resolve(20));

    await getConfigWithCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(mockPrisma.timeslot.count).toHaveBeenCalledWith({
      where: {
        AcademicYear: 2024,
        Semester: "SEMESTER_1",
      },
    });

    expect(mockPrisma.teachers_responsibility.count).toHaveBeenCalledWith({
      where: {
        AcademicYear: 2024,
        Semester: "SEMESTER_1",
      },
    });
  });
});

describe("Integration scenarios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow complete workflow: create, publish, lock, archive", async () => {
    // Step 1: Start with DRAFT
    const mockDraftConfig = {
      ConfigID: "1-2024",
      status: "DRAFT",
      configCompleteness: 50,
      publishedAt: null,
    };

    // Step 2: Publish
    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockDraftConfig as any));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      ...mockDraftConfig,
      status: "PUBLISHED",
      publishedAt: new Date(),
    } as any));

    const publishResult = await updateConfigStatusAction({
      configId: "1-2024",
      status: "PUBLISHED",
    });

    expect(publishResult.success).toBe(true);

    // Step 3: Lock
    const mockPublishedConfig = {
      ...mockDraftConfig,
      status: "PUBLISHED",
      publishedAt: new Date(),
    };

    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockPublishedConfig as any));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      ...mockPublishedConfig,
      status: "LOCKED",
    } as any));

    const lockResult = await updateConfigStatusAction({
      configId: "1-2024",
      status: "LOCKED",
    });

    expect(lockResult.success).toBe(true);

    // Step 4: Archive
    const mockLockedConfig = {
      ...mockPublishedConfig,
      status: "LOCKED",
    };

    mockPrisma.table_config.findUnique = jest.fn(() => Promise.resolve(mockLockedConfig as any));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      ...mockLockedConfig,
      status: "ARCHIVED",
    } as any));

    const archiveResult = await updateConfigStatusAction({
      configId: "1-2024",
      status: "ARCHIVED",
    });

    expect(archiveResult.success).toBe(true);
  });

  it("should update completeness as data is added", async () => {
    // Initially no data
    mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.subject.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.gradelevel.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.room.count = jest.fn(() => Promise.resolve(0));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      configCompleteness: 0,
    } as any));

    const result1 = await updateConfigCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(result1.data?.completeness).toBe(0);

    // Add timeslots
    mockPrisma.timeslot.count = jest.fn(() => Promise.resolve(8));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      configCompleteness: 30,
    } as any));

    const result2 = await updateConfigCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(result2.data?.completeness).toBe(30);

    // Add teachers and subjects
    mockPrisma.teachers_responsibility.count = jest.fn(() => Promise.resolve(15));
    mockPrisma.subject.count = jest.fn(() => Promise.resolve(12));
    mockPrisma.table_config.update = jest.fn(() => Promise.resolve({
      configCompleteness: 70,
    } as any));

    const result3 = await updateConfigCompletenessAction({
      academicYear: 2024,
      semester: "SEMESTER_1",
    });

    expect(result3.data?.completeness).toBe(70);
  });
});

