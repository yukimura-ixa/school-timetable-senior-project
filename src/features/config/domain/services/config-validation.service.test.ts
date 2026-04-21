import { vi, describe, it, expect } from "vitest";

vi.mock("../../infrastructure/repositories/config.repository", () => ({
  findByConfigId: vi.fn(),
  findByTerm: vi.fn(),
}));

import {
  generateConfigID,
  parseConfigID,
  validateConfigIDFormat,
  replaceConfigIDInString,
  getSemesterNumber,
  parseSemesterEnum,
  validateConfigExists,
  validateNoDuplicateConfig,
  validateCopyInput,
} from "./config-validation.service";
import * as configRepository from "../../infrastructure/repositories/config.repository";

const mockFindByConfigId = configRepository.findByConfigId as ReturnType<typeof vi.fn>;
const mockFindByTerm = configRepository.findByTerm as ReturnType<typeof vi.fn>;

describe("config-validation.service", () => {
  describe("generateConfigID", () => {
    it("generates correct format", () => {
      expect(generateConfigID("1", 2567)).toBe("1-2567");
    });

    it("handles semester 2", () => {
      expect(generateConfigID("2", 2568)).toBe("2-2568");
    });
  });

  describe("parseConfigID", () => {
    it("parses valid ConfigID", () => {
      expect(parseConfigID("1-2567")).toEqual({
        semester: "1",
        academicYear: 2567,
      });
    });

    it("parses semester 2", () => {
      expect(parseConfigID("2-2568")).toEqual({
        semester: "2",
        academicYear: 2568,
      });
    });

    it("throws on missing hyphen", () => {
      expect(() => parseConfigID("12567")).toThrow("รูปแบบ ConfigID ไม่ถูกต้อง");
    });

    it("throws on too many parts", () => {
      expect(() => parseConfigID("1-2567-extra")).toThrow(
        "รูปแบบ ConfigID ไม่ถูกต้อง",
      );
    });

    it("throws on non-numeric year", () => {
      expect(() => parseConfigID("1-abcd")).toThrow("ปีการศึกษาต้องเป็นตัวเลข");
    });
  });

  describe("validateConfigIDFormat", () => {
    it("returns null for valid format", () => {
      expect(validateConfigIDFormat("1-2567")).toBeNull();
      expect(validateConfigIDFormat("2-2568")).toBeNull();
      expect(validateConfigIDFormat("3-2569")).toBeNull();
    });

    it("rejects semester 0", () => {
      expect(validateConfigIDFormat("0-2567")).not.toBeNull();
    });

    it("rejects semester 4", () => {
      expect(validateConfigIDFormat("4-2567")).not.toBeNull();
    });

    it("rejects short year", () => {
      expect(validateConfigIDFormat("1-99")).not.toBeNull();
    });

    it("rejects long year", () => {
      expect(validateConfigIDFormat("1-99999")).not.toBeNull();
    });

    it("rejects empty string", () => {
      expect(validateConfigIDFormat("")).not.toBeNull();
    });
  });

  describe("replaceConfigIDInString", () => {
    it("replaces config pattern in timeslot ID", () => {
      expect(
        replaceConfigIDInString("MON-1/2566-1", "1/2566", "2/2567"),
      ).toBe("MON-2/2567-1");
    });

    it("returns original when no match", () => {
      expect(
        replaceConfigIDInString("MON-1/2566-1", "3/2570", "2/2567"),
      ).toBe("MON-1/2566-1");
    });

    it("replaces only first occurrence", () => {
      expect(
        replaceConfigIDInString("1-2567-1-2567", "1-2567", "2-2568"),
      ).toBe("2-2568-1-2567");
    });
  });

  describe("getSemesterNumber", () => {
    it("converts SEMESTER_1 to '1'", () => {
      expect(getSemesterNumber("SEMESTER_1" as any)).toBe("1");
    });

    it("converts SEMESTER_2 to '2'", () => {
      expect(getSemesterNumber("SEMESTER_2" as any)).toBe("2");
    });
  });

  describe("parseSemesterEnum", () => {
    it("converts '1' to SEMESTER_1", () => {
      expect(parseSemesterEnum("1")).toBe("SEMESTER_1");
    });

    it("converts '2' to SEMESTER_2", () => {
      expect(parseSemesterEnum("2")).toBe("SEMESTER_2");
    });

    it("throws on invalid input", () => {
      expect(() => parseSemesterEnum("3")).toThrow("ภาคเรียนต้องเป็น 1 หรือ 2");
    });

    it("throws on non-numeric input", () => {
      expect(() => parseSemesterEnum("abc")).toThrow(
        "ภาคเรียนต้องเป็น 1 หรือ 2",
      );
    });
  });

  describe("validateConfigExists", () => {
    it("returns null when config exists", async () => {
      mockFindByConfigId.mockResolvedValueOnce({ ConfigID: "1-2567" });
      expect(await validateConfigExists("1-2567")).toBeNull();
    });

    it("returns error when config not found", async () => {
      mockFindByConfigId.mockResolvedValueOnce(null);
      expect(await validateConfigExists("1-2567")).toBe(
        "ไม่พบการตั้งค่านี้ กรุณาตรวจสอบอีกครั้ง",
      );
    });
  });

  describe("validateNoDuplicateConfig", () => {
    it("returns null when no duplicate exists", async () => {
      mockFindByTerm.mockResolvedValueOnce(null);
      expect(
        await validateNoDuplicateConfig(2567, "SEMESTER_1" as any),
      ).toBeNull();
    });

    it("returns error when duplicate exists", async () => {
      mockFindByTerm.mockResolvedValueOnce({ ConfigID: "1-2567" });
      expect(
        await validateNoDuplicateConfig(2567, "SEMESTER_1" as any),
      ).toBe("มีการตั้งค่าสำหรับปีการศึกษาและภาคเรียนนี้อยู่แล้ว");
    });

    it("allows same ConfigID when excluded", async () => {
      mockFindByTerm.mockResolvedValueOnce({ ConfigID: "1-2567" });
      expect(
        await validateNoDuplicateConfig(2567, "SEMESTER_1" as any, "1-2567"),
      ).toBeNull();
    });

    it("returns error when different ConfigID exists even with excludeConfigId", async () => {
      mockFindByTerm.mockResolvedValueOnce({ ConfigID: "1-2567" });
      expect(
        await validateNoDuplicateConfig(2567, "SEMESTER_1" as any, "2-2567"),
      ).toBe("มีการตั้งค่าสำหรับปีการศึกษาและภาคเรียนนี้อยู่แล้ว");
    });
  });

  describe("validateCopyInput", () => {
    it("rejects copying to same config", async () => {
      expect(await validateCopyInput("1-2567", "1-2567")).toBe(
        "ไม่สามารถคัดลอกไปยังภาคเรียนเดียวกันได้",
      );
    });

    it("rejects when source does not exist", async () => {
      mockFindByConfigId.mockResolvedValueOnce(null);
      expect(await validateCopyInput("1-2567", "2-2567")).toBe(
        "ไม่พบการตั้งค่าต้นทาง (1-2567)",
      );
    });

    it("rejects when target already exists", async () => {
      mockFindByConfigId
        .mockResolvedValueOnce({ ConfigID: "1-2567" })
        .mockResolvedValueOnce({ ConfigID: "2-2567" });
      expect(await validateCopyInput("1-2567", "2-2567")).toBe(
        "มีการตั้งค่าปลายทางอยู่แล้ว (2-2567) กรุณาลบก่อนคัดลอก",
      );
    });

    it("returns null for valid copy operation", async () => {
      mockFindByConfigId
        .mockResolvedValueOnce({ ConfigID: "1-2567" })
        .mockResolvedValueOnce(null);
      expect(await validateCopyInput("1-2567", "2-2567")).toBeNull();
    });
  });
});
