/**
 * Unit tests for Program Validation Service
 *
 * Covers:
 * - Duplicate detection on create (ProgramName + Semester + AcademicYear)
 * - Duplicate detection on update (excluding current ProgramID)
 * - Existence check by ProgramID
 * - Thai error messages
 *
 * Jest globals (describe, test, expect, beforeEach, jest) are available globally
 */

import {
  validateNoDuplicateProgram,
  validateNoDuplicateProgramForUpdate,
  validateProgramExists,
} from "@/features/program/domain/services/program-validation.service";

import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";

describe("Program Validation Service", () => {
  const year = 1; // ม.1
  const track: "GENERAL" | "MINI_ENGLISH" = "GENERAL";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateNoDuplicateProgram (create)", () => {
    test("returns null when no duplicate exists", async () => {
      jest
        .spyOn(programRepository, "findByYearAndTrack")
        .mockResolvedValue(null as any);

      const result = await validateNoDuplicateProgram(year, track);

      expect(programRepository.findByYearAndTrack).toHaveBeenCalledWith(
        year,
        track,
      );
      expect(result).toBeNull();
    });

    test("returns Thai error message when duplicate exists", async () => {
      jest.spyOn(programRepository, "findByYearAndTrack").mockResolvedValue({
        ProgramID: 101,
        Year: year,
        Track: track,
      } as any);

      const result = await validateNoDuplicateProgram(year, track);

      expect(result).toBe(
        "มีหลักสูตรสำหรับ ม.1 แผนการเรียนGENERAL อยู่แล้ว กรุณาตรวจสอบอีกครั้ง",
      );
    });
  });

  describe("validateNoDuplicateProgramForUpdate (update)", () => {
    test("returns null when no duplicate exists", async () => {
      jest
        .spyOn(programRepository, "findByYearAndTrack")
        .mockResolvedValue(null as any);

      const result = await validateNoDuplicateProgramForUpdate(
        101,
        year,
        track,
      );
      expect(result).toBeNull();
    });

    test("returns null when existing record is the same ProgramID", async () => {
      jest.spyOn(programRepository, "findByYearAndTrack").mockResolvedValue({
        ProgramID: 101,
        Year: year,
        Track: track,
      } as any);

      const result = await validateNoDuplicateProgramForUpdate(
        101,
        year,
        track,
      );
      expect(result).toBeNull();
    });

    test("returns Thai error message when another program has same year/track", async () => {
      jest.spyOn(programRepository, "findByYearAndTrack").mockResolvedValue({
        ProgramID: 202, // different program
        Year: year,
        Track: track,
      } as any);

      const result = await validateNoDuplicateProgramForUpdate(
        101,
        year,
        track,
      );
      expect(result).toBe(
        "มีหลักสูตรสำหรับ ม.1 แผนการเรียนGENERAL อยู่แล้ว กรุณาตรวจสอบอีกครั้ง",
      );
    });
  });

  describe("validateProgramExists", () => {
    test("returns null when program exists", async () => {
      jest
        .spyOn(programRepository, "findById")
        .mockResolvedValue({ ProgramID: 1 } as any);

      const result = await validateProgramExists(1);
      expect(programRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });

    test("returns Thai error message when program not found", async () => {
      jest.spyOn(programRepository, "findById").mockResolvedValue(null as any);

      const result = await validateProgramExists(999);
      expect(result).toBe("ไม่พบหลักสูตรที่ระบุ");
    });
  });
});
