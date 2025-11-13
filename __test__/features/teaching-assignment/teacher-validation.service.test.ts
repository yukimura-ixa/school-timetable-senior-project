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
// Access the teacherRepository object which contains findById
const mockTeacherRepoFindById = jest.fn();
(teacherRepository as any).teacherRepository = {
  findById: mockTeacherRepoFindById,
};

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

      expect(result.teacherId).toBe(1);
      expect(result.totalHours).toBe(14);
      expect(result.status).toBe("ok");
      expect(result.teacherName).toBeDefined();
      expect(result.assignments).toHaveLength(2);
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

      expect(result.teacherId).toBe(1);
      expect(result.totalHours).toBe(18);
      expect(result.status).toBe("warning");
      expect(result.teacherName).toBeDefined();
      expect(result.assignments).toHaveLength(2);
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

      expect(result.teacherId).toBe(1);
      expect(result.totalHours).toBe(22);
      expect(result.status).toBe("overload");
      expect(result.teacherName).toBeDefined();
      expect(result.assignments).toHaveLength(2);
    });

    it("should return 0 hours when teacher has no assignments", async () => {
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([]);

      const result = await calculateTeacherWorkload(
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(result.teacherId).toBe(1);
      expect(result.totalHours).toBe(0);
      expect(result.status).toBe("ok");
      expect(result.teacherName).toBeDefined();
      expect(result.assignments).toHaveLength(0);
    });
  });

  describe("validateAssignment", () => {
    it("should validate successfully when teacher workload is within limits", async () => {
      mockTeacherRepoFindById.mockResolvedValue({
        TeacherID: 1,
        Firstname: "John",
        Lastname: "Doe",
        Prefix: "Mr.",
        Department: "Math",
        Gender: "M",
      } as any);
      
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

      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "EN101",
        gradeId: "1",
        semester: "SEMESTER_1" as semester,
        year: 2567,
        additionalHours: 6,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should warn when new assignment causes warning status", async () => {
      mockTeacherRepoFindById.mockResolvedValue({
        TeacherID: 1,
        Firstname: "John",
        Lastname: "Doe",
        Prefix: "Mr.",
        Department: "Math",
        Gender: "M",
      } as any);
      
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

      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "EN101",
        gradeId: "1",
        semester: "SEMESTER_1" as semester,
        year: 2567,
        additionalHours: 6,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain("16");
    });

    it("should reject assignment when it causes overload", async () => {
      mockTeacherRepoFindById.mockResolvedValue({
        TeacherID: 1,
        Firstname: "John",
        Lastname: "Doe",
        Prefix: "Mr.",
        Department: "Math",
        Gender: "M",
      } as any);
      
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

      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "EN101",
        gradeId: "1",
        semester: "SEMESTER_1" as semester,
        year: 2567,
        additionalHours: 6,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("20");
    });

    it("should handle updating existing assignment correctly", async () => {
      mockTeacherRepoFindById.mockResolvedValue({
        TeacherID: 1,
        Firstname: "John",
        Lastname: "Doe",
        Gender: "M",
      } as any);
      
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
      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "EN101",
        gradeId: "1",
        semester: "SEMESTER_1" as semester,
        year: 2567,
        additionalHours: 8,
      });

      // Should add 8 hours to existing 10 hours = 18 total (warning status)
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
    });
  });

  describe("validateBulkAssignments", () => {
    it("should validate all assignments successfully", async () => {
      // Mock teacher lookups
      mockTeacherRepoFindById
        .mockResolvedValueOnce({ TeacherID: 1, Firstname: "John", Lastname: "Doe", Gender: "M" } as any)
        .mockResolvedValueOnce({ TeacherID: 2, Firstname: "Jane", Lastname: "Smith", Gender: "F" } as any);
      
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
        { teacherId: 1, subjectCode: "TH102", gradeId: "1", semester: "SEMESTER_1" as semester, year: 2567, hours: 4 },
        { teacherId: 2, subjectCode: "EN102", gradeId: "1", semester: "SEMESTER_1" as semester, year: 2567, hours: 5 },
      ];

      const result = await validateBulkAssignments(assignments);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeDefined();
    });

    it("should identify overloaded teachers", async () => {
      // Mock teacher lookups
      mockTeacherRepoFindById
        .mockResolvedValueOnce({ TeacherID: 1, Firstname: "John", Lastname: "Doe", Gender: "M" } as any)
        .mockResolvedValueOnce({ TeacherID: 2, Firstname: "Jane", Lastname: "Smith", Gender: "F" } as any);
      
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
        { teacherId: 1, subjectCode: "TH102", gradeId: "1", semester: "SEMESTER_1" as semester, year: 2567, hours: 4 },
        { teacherId: 2, subjectCode: "EN102", gradeId: "1", semester: "SEMESTER_1" as semester, year: 2567, hours: 5 },
      ];

      const result = await validateBulkAssignments(assignments);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("20");
    });

    it("should handle empty assignments array", async () => {
      const result = await validateBulkAssignments([]);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it("should warn about assignments that cause warning status", async () => {
      mockTeacherRepoFindById.mockResolvedValue({
        TeacherID: 1,
        Firstname: "John",
        Lastname: "Doe",
        Gender: "M",
      } as any);
      
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

      const assignments = [{ teacherId: 1, subjectCode: "TH102", gradeId: "1", semester: "SEMESTER_1" as semester, year: 2567, hours: 3 }];

      const result = await validateBulkAssignments(assignments);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain("16");
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative hours gracefully", async () => {
      mockTeacherRepoFindById.mockResolvedValue({
        TeacherID: 1,
        Firstname: "John",
        Lastname: "Doe",
        Gender: "M",
      } as any);
      
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([]);

      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "TH101",
        gradeId: "1",
        semester: "SEMESTER_1" as semester,
        year: 2567,
        additionalHours: -5,
      });

      // Should still calculate (negative hours won't trigger overload errors)
      expect(result.valid).toBe(true);
    });

    it("should handle extremely high hours", async () => {
      mockTeacherRepoFindById.mockResolvedValue({
        TeacherID: 1,
        Firstname: "John",
        Lastname: "Doe",
        Gender: "M",
      } as any);
      
      mockTeachingRepo.findTeacherWorkload.mockResolvedValue([]);

      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "TH101",
        gradeId: "1",
        semester: "SEMESTER_1" as semester,
        year: 2567,
        additionalHours: 100,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("20");
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
      expect(result.assignments).toHaveLength(10);
    });
  });
});

