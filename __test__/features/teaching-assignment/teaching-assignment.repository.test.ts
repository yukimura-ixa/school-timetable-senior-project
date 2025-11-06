/**
 * Unit Tests for Teaching Assignment Repository
 * Tests repository methods for teacher-subject assignments
 * 
 * Note: Prisma is mocked globally in jest.setup.js
 */

import * as teachingAssignmentRepository from "@/features/teaching-assignment/infrastructure/repositories/teaching-assignment.repository";
import prisma from "@/lib/prisma";
import { semester } from "@/prisma/generated";

// Get reference to the mocked Prisma client
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("Teaching Assignment Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findAssignmentsByContext", () => {
    it("should find all assignments for given grade, semester, and year", async () => {
      const mockAssignments = [
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 4,
          GradeID: 1,
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
          teacher: {
            TeacherID: 1,
            Prefix: "นาง",
            Firstname: "สมหญิง",
            Lastname: "ใจดี",
            Email: "teacher1@school.ac.th",
            Department: "ภาษาไทย",
            Role: "teacher",
          },
        },
      ];

      mockPrisma.teachers_responsibility.findMany = jest
        .fn()
        .mockResolvedValue(mockAssignments);

      const result = await teachingAssignmentRepository.findAssignmentsByContext(
        "1",
        "SEMESTER_1" as semester,
        2567
      );

      expect(mockPrisma.teachers_responsibility.findMany).toHaveBeenCalledWith({
        where: {
          GradeID: "1",
          Semester: "SEMESTER_1",
          AcademicYear: 2567,
        },
        include: expect.objectContaining({
          teacher: expect.anything(),
        }),
      });
      expect(result).toEqual(mockAssignments);
    });

    it("should return empty array when no assignments found", async () => {
      mockPrisma.teachers_responsibility.findMany = jest
        .fn()
        .mockResolvedValue([]);

      const result = await teachingAssignmentRepository.findAssignmentsByContext(
        "1",
        "SEMESTER_1" as semester,
        2567
      );

      expect(result).toEqual([]);
    });
  });

  describe("findTeacherWorkload", () => {
    it("should calculate total teaching hours for a teacher in a semester", async () => {
      const mockResponsibilities = [
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 4,
          GradeID: 1,
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
        {
          RespID: 2,
          TeacherID: 1,
          SubjectCode: "TH102",
          TeachHour: 6,
          GradeID: 2,
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ];

      mockPrisma.teachers_responsibility.findMany = jest
        .fn()
        .mockResolvedValue(mockResponsibilities);

      const result = await teachingAssignmentRepository.findTeacherWorkload(
        1,
        "SEMESTER_1" as semester,
        2567
      );

      expect(mockPrisma.teachers_responsibility.findMany).toHaveBeenCalledWith({
        where: {
          TeacherID: 1,
          Semester: "SEMESTER_1",
          AcademicYear: 2567,
        },
      });
      expect(result).toEqual(mockResponsibilities);
    });
  });

  describe("findSubjectsByGrade", () => {
    it("should find all subjects for a given grade", async () => {
      const mockSubjects = [
        {
          SubjectCode: "TH101",
          SubjectName: "ภาษาไทยพื้นฐาน 1",
          Credit: 2,
          GradeID: 1,
        },
        {
          SubjectCode: "EN101",
          SubjectName: "ภาษาอังกฤษพื้นฐาน 1",
          Credit: 2,
          GradeID: 1,
        },
      ];

      mockPrisma.subject.findMany = jest.fn().mockResolvedValue(mockSubjects);

      const result = await teachingAssignmentRepository.findSubjectsByGrade("1");

      expect(mockPrisma.subject.findMany).toHaveBeenCalledWith({
        where: {
          GradeID: "1",
        },
        orderBy: {
          SubjectCode: "asc",
        },
      });
      expect(result).toEqual(mockSubjects);
    });
  });

  describe("findAllTeachers", () => {
    it("should find all teachers", async () => {
      const mockTeachers = [
        {
          TeacherID: 1,
          Prefix: "นาง",
          Firstname: "สมหญิง",
          Lastname: "ใจดี",
          Email: "teacher1@school.ac.th",
          Department: "ภาษาไทย",
          Role: "teacher",
        },
        {
          TeacherID: 2,
          Prefix: "นาย",
          Firstname: "สมชาย",
          Lastname: "ดีงาม",
          Email: "teacher2@school.ac.th",
          Department: "คณิตศาสตร์",
          Role: "teacher",
        },
      ];

      mockPrisma.teacher.findMany = jest.fn().mockResolvedValue(mockTeachers);

      const result = await teachingAssignmentRepository.findAllTeachers();

      expect(mockPrisma.teacher.findMany).toHaveBeenCalledWith({
        orderBy: {
          Firstname: "asc",
        },
      });
      expect(result).toEqual(mockTeachers);
    });
  });

  describe("assignTeacherToSubject", () => {
    it("should create new assignment when none exists", async () => {
      const newAssignment = {
        RespID: 1,
        TeacherID: 1,
        SubjectCode: "TH101",
        TeachHour: 4,
        GradeID: 1,
        AcademicYear: 2567,
        Semester: "SEMESTER_1" as semester,
      };

      mockPrisma.teachers_responsibility.findFirst = jest
        .fn()
        .mockResolvedValue(null);
      mockPrisma.teachers_responsibility.create = jest
        .fn()
        .mockResolvedValue(newAssignment);

      const result = await teachingAssignmentRepository.assignTeacherToSubject(
        1,
        "TH101",
        "1",
        "SEMESTER_1" as semester,
        2567,
        4
      );

      expect(mockPrisma.teachers_responsibility.create).toHaveBeenCalledWith({
        data: {
          TeacherID: 1,
          SubjectCode: "TH101",
          GradeID: "1",
          Semester: "SEMESTER_1",
          AcademicYear: 2567,
          TeachHour: 4,
        },
      });
      expect(result).toEqual(newAssignment);
    });

    it("should update existing assignment", async () => {
      const existingAssignment = {
        RespID: 1,
        TeacherID: 2,
        SubjectCode: "TH101",
        TeachHour: 3,
        GradeID: 1,
        AcademicYear: 2567,
        Semester: "SEMESTER_1" as semester,
      };

      const updatedAssignment = {
        ...existingAssignment,
        TeacherID: 1,
        TeachHour: 4,
      };

      mockPrisma.teachers_responsibility.findFirst = jest
        .fn()
        .mockResolvedValue(existingAssignment);
      mockPrisma.teachers_responsibility.update = jest
        .fn()
        .mockResolvedValue(updatedAssignment);

      const result = await teachingAssignmentRepository.assignTeacherToSubject(
        1,
        "TH101",
        "1",
        "SEMESTER_1" as semester,
        2567,
        4
      );

      expect(mockPrisma.teachers_responsibility.update).toHaveBeenCalledWith({
        where: { RespID: 1 },
        data: {
          TeacherID: 1,
          TeachHour: 4,
        },
      });
      expect(result).toEqual(updatedAssignment);
    });
  });

  describe("unassignTeacherFromSubject", () => {
    it("should delete assignment when it exists", async () => {
      const assignment = {
        RespID: 1,
        TeacherID: 1,
        SubjectCode: "TH101",
        TeachHour: 4,
        GradeID: 1,
        AcademicYear: 2567,
        Semester: "SEMESTER_1" as semester,
      };

      mockPrisma.teachers_responsibility.findFirst = jest
        .fn()
        .mockResolvedValue(assignment);
      mockPrisma.teachers_responsibility.delete = jest
        .fn()
        .mockResolvedValue(assignment);

      const result =
        await teachingAssignmentRepository.unassignTeacherFromSubject(
          "TH101",
          "1",
          "SEMESTER_1" as semester,
          2567
        );

      expect(mockPrisma.teachers_responsibility.delete).toHaveBeenCalledWith({
        where: { RespID: 1 },
      });
      expect(result).toEqual(assignment);
    });

    it("should return null when assignment does not exist", async () => {
      mockPrisma.teachers_responsibility.findFirst = jest
        .fn()
        .mockResolvedValue(null);

      const result =
        await teachingAssignmentRepository.unassignTeacherFromSubject(
          "TH101",
          "1",
          "SEMESTER_1" as semester,
          2567
        );

      expect(mockPrisma.teachers_responsibility.delete).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("bulkAssignTeachers", () => {
    it("should create multiple assignments in transaction", async () => {
      const assignments = [
        {
          teacherId: 1,
          subjectCode: "TH101",
          hours: 4,
        },
        {
          teacherId: 2,
          subjectCode: "EN101",
          hours: 3,
        },
      ];

      const mockResults = [
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 4,
          GradeID: 1,
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
        {
          RespID: 2,
          TeacherID: 2,
          SubjectCode: "EN101",
          TeachHour: 3,
          GradeID: 1,
          AcademicYear: 2567,
          Semester: "SEMESTER_1" as semester,
        },
      ];

      mockPrisma.$transaction = jest.fn().mockResolvedValue(mockResults);

      const result = await teachingAssignmentRepository.bulkAssignTeachers(
        assignments,
        "1",
        "SEMESTER_1" as semester,
        2567
      );

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockResults);
    });
  });

  describe("clearAllAssignments", () => {
    it("should delete all assignments for given context", async () => {
      mockPrisma.teachers_responsibility.deleteMany = jest
        .fn()
        .mockResolvedValue({ count: 5 });

      const result = await teachingAssignmentRepository.clearAllAssignments(
        "1",
        "SEMESTER_1" as semester,
        2567
      );

      expect(mockPrisma.teachers_responsibility.deleteMany).toHaveBeenCalledWith({
        where: {
          GradeID: "1",
          Semester: "SEMESTER_1",
          AcademicYear: 2567,
        },
      });
      expect(result).toEqual({ count: 5 });
    });
  });

  describe("copyAssignmentsFromPreviousSemester", () => {
    it("should copy assignments from previous semester", async () => {
      const previousAssignments = [
        {
          RespID: 1,
          TeacherID: 1,
          SubjectCode: "TH101",
          TeachHour: 4,
          GradeID: 1,
          AcademicYear: 2566,
          Semester: "SEMESTER_2" as semester,
        },
        {
          RespID: 2,
          TeacherID: 2,
          SubjectCode: "EN101",
          TeachHour: 3,
          GradeID: 1,
          AcademicYear: 2566,
          Semester: "SEMESTER_2" as semester,
        },
      ];

      mockPrisma.teachers_responsibility.findMany = jest
        .fn()
        .mockResolvedValue(previousAssignments);
      mockPrisma.$transaction = jest
        .fn()
        .mockResolvedValue(previousAssignments.map((a) => ({ ...a, RespID: a.RespID + 10 })));

      const result =
        await teachingAssignmentRepository.copyAssignmentsFromPreviousSemester(
          "1",
          "SEMESTER_1" as semester,
          2567,
          "SEMESTER_2" as semester,
          2566
        );

      expect(mockPrisma.teachers_responsibility.findMany).toHaveBeenCalledWith({
        where: {
          GradeID: "1",
          Semester: "SEMESTER_2",
          AcademicYear: 2566,
        },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no previous assignments exist", async () => {
      mockPrisma.teachers_responsibility.findMany = jest
        .fn()
        .mockResolvedValue([]);

      const result =
        await teachingAssignmentRepository.copyAssignmentsFromPreviousSemester(
          "1",
          "SEMESTER_1" as semester,
          2567,
          "SEMESTER_2" as semester,
          2566
        );

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
