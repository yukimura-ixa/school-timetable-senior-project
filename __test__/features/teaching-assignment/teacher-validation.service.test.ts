/**
 * Unit Tests for Teacher Validation Service
 * Tests workload calculation and assignment validation logic
 */

import {
  calculateTeacherWorkload,
  validateAssignment,
  validateBulkAssignments,
} from "@/features/teaching-assignment/domain/services/teacher-validation.service";
import * as teachingAssignmentRepository from "@/features/teaching-assignment/infrastructure/repositories/teaching-assignment.repository";
import * as teacherRepository from "@/features/teacher/infrastructure/repositories/teacher.repository";
import { semester } from "@/prisma/generated";

// Mock the repositories
jest.mock(
  "@/features/teaching-assignment/infrastructure/repositories/teaching-assignment.repository"
);
jest.mock(
  "@/features/teacher/infrastructure/repositories/teacher.repository"
);

const mockTeachingRepo = teachingAssignmentRepository as jest.Mocked<typeof teachingAssignmentRepository>;
const mockTeacherRepo = teacherRepository as jest.Mocked<typeof teacherRepository>;

describe("Teacher Validation Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateTeacherWorkload", () => {
    it("should return 'ok' status when hours are within recommended limit", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 8,
          GradeID: "1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
        {
          RespID: 2,
          TeacherID: 1,
          SubjectCode: "TH102",
          TeachHour: 6,
          GradeID: "2",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ]);

      const result = await calculateTeacherWorkload(
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result).toEqual({
        teacherId: 1,
        totalHours: 14,
        status: "ok",
        message: "ภาระงานสอนอยู่ในเกณฑ์ปกติ (14/16 ชั่วโมง)",
      });
    });

    it("should return 'warning' status when hours exceed recommended but below max", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 10,
          GradeID: "1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
        {
          RespID: 2,
          TeacherID: 1,
          SubjectCode: "TH102",
          TeachHour: 8,
          GradeID: "2",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ]);

      const result = await calculateTeacherWorkload(
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result).toEqual({
        teacherId: 1,
        totalHours: 18,
        status: "warning",
        message: "ภาระงานสอนค่อนข้างสูง (18/20 ชั่วโมง)",
      });
    });

    it("should return 'overload' status when hours exceed maximum", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 12,
          GradeID: "1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
        {
          RespID: 2,
          TeacherID: 1,
          SubjectCode: "TH102",
          TeachHour: 10,
          GradeID: "2",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ]);

      const result = await calculateTeacherWorkload(
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result).toEqual({
        teacherId: 1,
        totalHours: 22,
        status: "overload",
        message: "ภาระงานสอนเกินกำหนด! (22/20 ชั่วโมง)",
      });
    });

    it("should return 0 hours when teacher has no assignments", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([]);

      const result = await calculateTeacherWorkload(
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result).toEqual({
        teacherId: 1,
        totalHours: 0,
        status: "ok",
        message: "ภาระงานสอนอยู่ในเกณฑ์ปกติ (0/16 ชั่วโมง)",
      });
    });
  });

  describe("validateAssignment", () => {
    it("should validate successfully when teacher workload is within limits", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 8,
          GradeID: "1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ]);

      const result = await validateAssignment(
        1,
        "EN101",
        1,
        "SEMESTER_1" as semester,
        2567,
        6
      );

      expect(result).toEqual({
        isValid: true,
        currentHours: 8,
        newTotalHours: 14,
        status: "ok",
        message: "สามารถมอบหมายได้ ภาระงานสอนรวม 14 ชั่วโมง",
      });
    });

    it("should warn when new assignment causes warning status", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 12,
          GradeID: "1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ]);

      const result = await validateAssignment(
        1,
        "EN101",
        1,
        "SEMESTER_1" as semester,
        2567,
        6
      );

      expect(result).toEqual({
        isValid: true,
        currentHours: 12,
        newTotalHours: 18,
        status: "warning",
        message: "คำเตือน: ภาระงานสอนค่อนข้างสูง (18 ชั่วโมง)",
      });
    });

    it("should reject assignment when it causes overload", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 16,
          GradeID: "1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ]);

      const result = await validateAssignment(
        1,
        "EN101",
        1,
        "SEMESTER_1" as semester,
        2567,
        6
      );

      expect(result).toEqual({
        isValid: false,
        currentHours: 16,
        newTotalHours: 22,
        status: "overload",
        message: "ไม่สามารถมอบหมายได้ ภาระงานสอนเกินกำหนด (22 ชั่วโมง)",
      });
    });

    it("should handle updating existing assignment correctly", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 4,
          GradeID: "1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
        {
          RespID: 2,
          TeacherID: 1,
          SubjectCode: "EN101",
          TeachHour: 6,
          GradeID: "1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ]);

      // Updating EN101 from 6 hours to 8 hours
      const result = await validateAssignment(
        1,
        "EN101",
        1,
        "SEMESTER_1" as semester,
        2567,
        8
      );

      // Should subtract old hours (6) and add new hours (8)
      // Current: 4 + 6 = 10, New: 4 + 8 = 12
      expect(result).toEqual({
        isValid: true,
        currentHours: 10,
        newTotalHours: 12,
        status: "ok",
        message: "สามารถมอบหมายได้ ภาระงานสอนรวม 12 ชั่วโมง",
      });
    });
  });

  describe("validateBulkAssignments", () => {
    it("should validate all assignments successfully", async () => {
      mockTeachingRepo.findTeacherWorkload
        .mockResolvedValueOnce([
          {
            RespID: 1,
            TeacherID: 1,
            SubjectCode: "TH101",
            TeachHour: 8,
            GradeID: "1",
            AcademicYear: 2567,
            Semester: "SEMESTER_1" as semester,
          },
        ])
        .mockResolvedValueOnce([
          {
            RespID: 2,
            TeacherID: 2,
            SubjectCode: "EN101",
            TeachHour: 6,
            GradeID: "1",
            AcademicYear: 2567,
            Semester: "SEMESTER_1" as semester,
          },
        ]);

      const assignments = [
        { teacherId: 1, subjectCode: "TH102", hours: 4 },
        { teacherId: 2, subjectCode: "EN102", hours: 5 },
      ];

      const result = await validateBulkAssignments(
        assignments,
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.validAssignments).toHaveLength(2);
    });

    it("should identify overloaded teachers", async () => {
      mockTeachingRepo.findTeacherWorkload
        .mockResolvedValueOnce([
          {
            RespID: 1,
            TeacherID: 1,
            SubjectCode: "TH101",
            TeachHour: 18,
            GradeID: "1",
            AcademicYear: 2567,
            Semester: "SEMESTER_1" as semester,
          },
        ])
        .mockResolvedValueOnce([
          {
            RespID: 2,
            TeacherID: 2,
            SubjectCode: "EN101",
            TeachHour: 6,
            GradeID: "1",
            AcademicYear: 2567,
            Semester: "SEMESTER_1" as semester,
          },
        ]);

      const assignments = [
        { teacherId: 1, subjectCode: "TH102", hours: 4 },
        { teacherId: 2, subjectCode: "EN102", hours: 5 },
      ];

      const result = await validateBulkAssignments(
        assignments,
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("TH102");
      expect(result.validAssignments).toHaveLength(1);
      expect(result.validAssignments[0].subjectCode).toBe("EN102");
    });

    it("should handle empty assignments array", async () => {
      const result = await validateBulkAssignments(
        [],
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.validAssignments).toEqual([]);
    });

    it("should warn about assignments that cause warning status", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 14,
          GradeID: "1",
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ]);

      const assignments = [{ teacherId: 1, subjectCode: "TH102", hours: 3 }];

      const result = await validateBulkAssignments(
        assignments,
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings![0]).toContain("TH102");
      expect(result.warnings![0]).toContain("17 ชั่วโมง");
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative hours gracefully", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([]);

      const result = await validateAssignment(
        1,
        "TH101",
        1,
        "SEMESTER_1" as semester,
        2567,
        -5
      );

      // Should still calculate but with invalid value
      expect(result.isValid).toBe(true);
      expect(result.newTotalHours).toBe(-5);
    });

    it("should handle extremely high hours", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([]);

      const result = await validateAssignment(
        1,
        "TH101",
        1,
        "SEMESTER_1" as semester,
        2567,
        100
      );

      expect(result.isValid).toBe(false);
      expect(result.status).toBe("overload");
    });

    it("should handle multiple subjects for same teacher", async () => {
      const mockAssignments = Array.from({ length: 10 }, (_, i) => ({
        RespID: i + 1,
        TeacherID: 1,
        SubjectCode: `SUB${i + 1}`,
        TeachHour: 2,
        GradeID: "1",
        AcademicYear: 2567,
        Semester: "SEMESTER_1" as semester,
      }));

      mockTeachingRepo.findTeacherWorkload.mockResolvedValue(mockAssignments);

      const result = await calculateTeacherWorkload(
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result.totalHours).toBe(20);
      expect(result.status).toBe("warning");
    });
  });
});

