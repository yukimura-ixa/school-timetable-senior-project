import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: vi.fn(() => ({})) }));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
  cookies: vi.fn(() => Promise.resolve({ get: vi.fn(), set: vi.fn() })),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() =>
        Promise.resolve({
          user: { id: "test-user", email: "admin@test.com", role: "admin" },
        }),
      ),
    },
  },
}));

vi.mock("@/lib/cache-invalidation", () => ({
  invalidatePublicCache: vi.fn(),
}));

vi.mock("@/lib/prisma-transaction", () => ({
  withPrismaTransaction: vi.fn((cb: (tx: unknown) => unknown) => cb({})),
}));

vi.mock("../../infrastructure/repositories/config.repository", () => ({
  findAll: vi.fn(),
  findByTerm: vi.fn(),
  findByConfigId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteById: vi.fn(),
  count: vi.fn(),
  countTermData: vi.fn(),
}));

vi.mock("../../domain/services/config-validation.service", () => ({
  validateConfigExists: vi.fn(),
  validateNoDuplicateConfig: vi.fn(),
  validateCopyInput: vi.fn(),
}));

vi.mock("../../domain/services/copy-config.service", () => ({
  copyConfig: vi.fn(),
}));

import {
  getAllConfigsAction,
  createConfigAction,
  deleteConfigAction,
  copyConfigAction,
  getConfigCountAction,
  updateConfigWithTimeslotsAction,
} from "./config.actions";
import * as configRepository from "../../infrastructure/repositories/config.repository";
import { withPrismaTransaction } from "@/lib/prisma-transaction";
import {
  validateConfigExists,
  validateNoDuplicateConfig,
  validateCopyInput,
} from "../../domain/services/config-validation.service";
import { copyConfig } from "../../domain/services/copy-config.service";

const mockFindAll = configRepository.findAll as ReturnType<typeof vi.fn>;
const mockCreate = configRepository.create as ReturnType<typeof vi.fn>;
const mockDeleteById = configRepository.deleteById as ReturnType<typeof vi.fn>;
const mockCount = configRepository.count as ReturnType<typeof vi.fn>;
const mockCountTermData = configRepository.countTermData as ReturnType<typeof vi.fn>;
const mockFindByConfigId = configRepository.findByConfigId as ReturnType<typeof vi.fn>;
const mockWithPrismaTransaction = withPrismaTransaction as ReturnType<typeof vi.fn>;
const mockValidateExists = validateConfigExists as ReturnType<typeof vi.fn>;
const mockValidateNoDuplicate = validateNoDuplicateConfig as ReturnType<typeof vi.fn>;
const mockValidateCopyInput = validateCopyInput as ReturnType<typeof vi.fn>;
const mockCopyConfig = copyConfig as ReturnType<typeof vi.fn>;

const mockConfig = {
  ConfigID: "1-2567",
  AcademicYear: 2567,
  Semester: "SEMESTER_1",
  Config: { TimeslotPerDay: 8, StartTime: "08:30" },
};

describe("Config Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllConfigsAction", () => {
    it("returns all configs", async () => {
      mockFindAll.mockResolvedValueOnce([mockConfig]);

      const result = await getAllConfigsAction({});

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockConfig]);
    });

    it("returns empty array when no configs", async () => {
      mockFindAll.mockResolvedValueOnce([]);

      const result = await getAllConfigsAction({});

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe("createConfigAction", () => {
    const validInput = {
      ConfigID: "1-2567",
      AcademicYear: 2567,
      Semester: "SEMESTER_1" as const,
      Config: { TimeslotPerDay: 8 },
    };

    it("creates config when no duplicate exists", async () => {
      mockValidateNoDuplicate.mockResolvedValueOnce(null);
      mockCreate.mockResolvedValueOnce(mockConfig);

      const result = await createConfigAction(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfig);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ConfigID: "1-2567",
          AcademicYear: 2567,
        }),
      );
    });

    it("rejects when duplicate config exists", async () => {
      mockValidateNoDuplicate.mockResolvedValueOnce(
        "มีการตั้งค่าสำหรับปีการศึกษาและภาคเรียนนี้อยู่แล้ว",
      );

      const result = await createConfigAction(validInput);

      expect(result.success).toBe(false);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("rejects invalid ConfigID format", async () => {
      const result = await createConfigAction({
        ...validInput,
        ConfigID: "",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("deleteConfigAction", () => {
    it("deletes existing config", async () => {
      mockValidateExists.mockResolvedValueOnce(null);
      mockDeleteById.mockResolvedValueOnce(mockConfig);

      const result = await deleteConfigAction("1-2567");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfig);
      expect(mockDeleteById).toHaveBeenCalledWith("1-2567");
    });

    it("rejects when config does not exist", async () => {
      mockValidateExists.mockResolvedValueOnce(
        "ไม่พบการตั้งค่านี้ กรุณาตรวจสอบอีกครั้ง",
      );

      const result = await deleteConfigAction("1-2567");

      expect(result.success).toBe(false);
      expect(mockDeleteById).not.toHaveBeenCalled();
    });

    it("rejects empty ConfigID", async () => {
      const result = await deleteConfigAction("");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("copyConfigAction", () => {
    const validInput = {
      from: "1-2567",
      to: "2-2567",
      assign: true,
      lock: true,
      timetable: false,
    };

    const mockCopyResult = {
      config: mockConfig,
      timeslots: 40,
      assignments: 20,
      locks: 10,
      timetables: 0,
    };

    it("copies config when validation passes", async () => {
      mockValidateCopyInput.mockResolvedValueOnce(null);
      mockCopyConfig.mockResolvedValueOnce(mockCopyResult);

      const result = await copyConfigAction(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCopyResult);
      expect(mockCopyConfig).toHaveBeenCalledWith(
        "1-2567",
        "2-2567",
        { assign: true, lock: true, timetable: false },
        expect.anything(),
      );
    });

    it("rejects when copying to same config", async () => {
      mockValidateCopyInput.mockResolvedValueOnce(
        "ไม่สามารถคัดลอกไปยังภาคเรียนเดียวกันได้",
      );

      const result = await copyConfigAction({
        ...validInput,
        from: "1-2567",
        to: "1-2567",
      });

      expect(result.success).toBe(false);
      expect(mockCopyConfig).not.toHaveBeenCalled();
    });

    it("rejects when source does not exist", async () => {
      mockValidateCopyInput.mockResolvedValueOnce(
        "ไม่พบการตั้งค่าต้นทาง (1-2567)",
      );

      const result = await copyConfigAction(validInput);

      expect(result.success).toBe(false);
    });

    it("passes all flags as false when set to false", async () => {
      mockValidateCopyInput.mockResolvedValueOnce(null);
      mockCopyConfig.mockResolvedValueOnce(mockCopyResult);

      await copyConfigAction({
        from: "1-2567",
        to: "2-2567",
        assign: false,
        lock: false,
        timetable: false,
      });

      expect(mockCopyConfig).toHaveBeenCalledWith(
        "1-2567",
        "2-2567",
        { assign: false, lock: false, timetable: false },
        expect.anything(),
      );
    });
  });

  describe("getConfigCountAction", () => {
    it("returns count", async () => {
      mockCount.mockResolvedValueOnce(5);

      const result = await getConfigCountAction({});

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(5);
    });

    it("returns zero count", async () => {
      mockCount.mockResolvedValueOnce(0);

      const result = await getConfigCountAction({});

      expect(result.success).toBe(true);
      expect(result.data?.count).toBe(0);
    });
  });

  describe("updateConfigWithTimeslotsAction", () => {
    const configData = {
      Days: ["MON", "TUE"],
      StartTime: "08:30",
      slots: [{ duration: 50 }, { duration: 50, breakGroups: ["junior"] }],
    };
    const input = { ConfigID: "1-2568", Config: configData };

    function mockTx() {
      return {
        teachers_responsibility: { deleteMany: vi.fn() },
        timeslot: { deleteMany: vi.fn(), createMany: vi.fn() },
        table_config: { update: vi.fn().mockResolvedValue({ ...mockConfig, ConfigID: "1-2568" }) },
      };
    }

    beforeEach(() => {
      mockValidateExists.mockResolvedValue(null);
      mockFindByConfigId.mockResolvedValue({
        ConfigID: "1-2568",
        AcademicYear: 2568,
        Semester: "SEMESTER_1",
        Config: configData,
      });
    });

    it("refuses to wipe a term that still has schedules unless confirmWipe is set", async () => {
      mockCountTermData.mockResolvedValueOnce({ scheduleCount: 648, responsibilityCount: 120 });
      const tx = mockTx();
      mockWithPrismaTransaction.mockImplementation((cb: (t: unknown) => unknown) => cb(tx));

      const result = await updateConfigWithTimeslotsAction(input);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("648");
      expect(result.error?.message).toContain("120");
      expect(tx.timeslot.deleteMany).not.toHaveBeenCalled();
      expect(tx.teachers_responsibility.deleteMany).not.toHaveBeenCalled();
    });

    it("regenerates when the term is empty", async () => {
      mockCountTermData.mockResolvedValueOnce({ scheduleCount: 0, responsibilityCount: 0 });
      const tx = mockTx();
      mockWithPrismaTransaction.mockImplementation((cb: (t: unknown) => unknown) => cb(tx));

      const result = await updateConfigWithTimeslotsAction(input);

      expect(result.success).toBe(true);
      expect(result.data?.timeslotCount).toBe(4);
      expect(tx.timeslot.deleteMany).toHaveBeenCalledTimes(1);
      expect(tx.timeslot.createMany).toHaveBeenCalledTimes(1);
    });

    it("regenerates a populated term when confirmWipe is true", async () => {
      mockCountTermData.mockResolvedValueOnce({ scheduleCount: 648, responsibilityCount: 120 });
      const tx = mockTx();
      mockWithPrismaTransaction.mockImplementation((cb: (t: unknown) => unknown) => cb(tx));

      const result = await updateConfigWithTimeslotsAction({ ...input, confirmWipe: true });

      expect(result.success).toBe(true);
      expect(tx.teachers_responsibility.deleteMany).toHaveBeenCalledTimes(1);
      expect(tx.timeslot.deleteMany).toHaveBeenCalledTimes(1);
    });
  });
});
