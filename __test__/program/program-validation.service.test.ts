/**
 * Unit tests for Program Validation Service
 *
 * Covers:
 * - Duplicate detection on create (ProgramName + Semester + AcademicYear)
 * - Duplicate detection on update (excluding current ProgramID)
 * - Existence check by ProgramID
 * - Thai error messages
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";

import {
  validateNoDuplicateProgram,
  validateNoDuplicateProgramForUpdate,
  validateProgramExists,
} from "@/features/program/domain/services/program-validation.service";

import { programRepository } from "@/features/program/infrastructure/repositories/program.repository";

describe("Program Validation Service", () => {
  const semester = "SEMESTER_1";
  const academicYear = 2568;
  const programName = "หลักสูตรแกนกลาง ม.ต้น";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateNoDuplicateProgram (create)", () => {
    test("returns null when no duplicate exists", async () => {
      jest
        .spyOn(programRepository, "findByNameAndTerm")
        .mockResolvedValue(null as any);

      const result = await validateNoDuplicateProgram(
        programName,
        semester,
        academicYear
      );

      expect(programRepository.findByNameAndTerm).toHaveBeenCalledWith(
        programName,
        semester,
        academicYear
      );
      expect(result).toBeNull();
    });

    test("returns Thai error message when duplicate exists", async () => {
      jest
        .spyOn(programRepository, "findByNameAndTerm")
        .mockResolvedValue({
        ProgramID: 101,
        ProgramName: programName,
        Semester: semester,
        AcademicYear: academicYear,
        } as any);

      const result = await validateNoDuplicateProgram(
        programName,
        semester,
        academicYear
      );

      expect(result).toBe(
        "มีชื่อหลักสูตรนี้สำหรับภาคเรียนและปีการศึกษาที่ระบุแล้ว กรุณาตรวจสอบอีกครั้ง"
      );
    });
  });

  describe("validateNoDuplicateProgramForUpdate (update)", () => {
    test("returns null when no duplicate exists", async () => {
      jest
        .spyOn(programRepository, "findByNameAndTerm")
        .mockResolvedValue(null as any);

      const result = await validateNoDuplicateProgramForUpdate(
        101,
        programName,
        semester,
        academicYear
      );
      expect(result).toBeNull();
    });

    test("returns null when existing record is the same ProgramID", async () => {
      jest
        .spyOn(programRepository, "findByNameAndTerm")
        .mockResolvedValue({
        ProgramID: 101,
        ProgramName: programName,
        Semester: semester,
        AcademicYear: academicYear,
        } as any);

      const result = await validateNoDuplicateProgramForUpdate(
        101,
        programName,
        semester,
        academicYear
      );
      expect(result).toBeNull();
    });

    test("returns Thai error message when another program has same name/term/year", async () => {
      jest
        .spyOn(programRepository, "findByNameAndTerm")
        .mockResolvedValue({
        ProgramID: 202, // different program
        ProgramName: programName,
        Semester: semester,
        AcademicYear: academicYear,
        } as any);

      const result = await validateNoDuplicateProgramForUpdate(
        101,
        programName,
        semester,
        academicYear
      );
      expect(result).toBe(
        "มีชื่อหลักสูตรนี้สำหรับภาคเรียนและปีการศึกษาที่ระบุแล้ว กรุณาตรวจสอบอีกครั้ง"
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
      jest
        .spyOn(programRepository, "findById")
        .mockResolvedValue(null as any);

      const result = await validateProgramExists(999);
      expect(result).toBe("ไม่พบหลักสูตรที่ระบุ");
    });
  });
});
