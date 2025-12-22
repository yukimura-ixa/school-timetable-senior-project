import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateAssignment } from "./teacher-validation.service";
import { teacherRepository } from "@/features/teacher/infrastructure/repositories/teacher.repository";
import { subjectRepository } from "@/features/subject/infrastructure/repositories/subject.repository";
import * as repo from "../../infrastructure/repositories/teaching-assignment.repository";

// Mock the repositories
vi.mock(
  "@/features/teacher/infrastructure/repositories/teacher.repository",
  () => ({
    teacherRepository: {
      findById: vi.fn(),
    },
  }),
);

vi.mock(
  "@/features/subject/infrastructure/repositories/subject.repository",
  () => ({
    subjectRepository: {
      findByCode: vi.fn(),
    },
  }),
);

vi.mock(
  "../../infrastructure/repositories/teaching-assignment.repository",
  () => ({
    findTeacherWorkload: vi.fn(),
  }),
);

describe("Teacher Validation Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateAssignment", () => {
    it("should return error if teacher not found", async () => {
      vi.mocked(teacherRepository.findById).mockResolvedValue(null);

      const result = await validateAssignment({
        teacherId: 999,
        subjectCode: "TH101",
        gradeId: "M1",
        semester: "SEMESTER_1",
        year: 2568,
        additionalHours: 2,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("ไม่พบข้อมูลครู");
    });

    it("should return warning for specialization mismatch", async () => {
      // Teacher in Mathematics
      vi.mocked(teacherRepository.findById).mockResolvedValue({
        TeacherID: 1,
        Prefix: "Mr.",
        Firstname: "Math",
        Lastname: "Expert",
        Department: "คณิตศาสตร์",
        Email: "math@example.com",
        Role: "teacher",
        IsActive: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });

      // Subject in Thai Language
      vi.mocked(subjectRepository.findByCode).mockResolvedValue({
        SubjectCode: "ท21101",
        SubjectName: "ภาษาไทย 1",
        Credit: "CREDIT_15",
        LearningArea: "THAI",
        Category: "CORE",
        IsGraded: true,
        IsActive: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });

      // No current workload
      vi.mocked(repo.findTeacherWorkload).mockResolvedValue([]);

      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "ท21101",
        gradeId: "M1",
        semester: "SEMESTER_1",
        year: 2568,
        additionalHours: 3,
      });

      expect(result.valid).toBe(true); // Still valid (it's just a warning)
      expect(result.warnings[0]).toContain("กลุ่มสาระไม่ตรงกัน");
      expect(result.warnings[0]).toContain("ภาษาไทย");
      expect(result.warnings[0]).toContain("คณิตศาสตร์");
    });

    it("should return error for exceeding max workload (20+ hours)", async () => {
      vi.mocked(teacherRepository.findById).mockResolvedValue({
        TeacherID: 1,
        Prefix: "Mr.",
        Firstname: "Busy",
        Lastname: "Teacher",
        Department: "คณิตศาสตร์",
        Email: "busy@example.com",
        Role: "teacher",
        IsActive: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });

      vi.mocked(subjectRepository.findByCode).mockResolvedValue({
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์ 1",
        Credit: "CREDIT_15",
        LearningArea: "MATHEMATICS",
        Category: "CORE",
        IsGraded: true,
        IsActive: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });

      // Current workload is 18 hours
      vi.mocked(repo.findTeacherWorkload).mockResolvedValue([
        {
          TeachHour: 18,
          SubjectCode: "OLD1",
          GradeID: "G1",
          AcademicYear: 2568,
          Semester: "SEMESTER_1",
          teacher: { Prefix: "Mr.", Firstname: "Busy", Lastname: "Teacher" },
          subject: {
            SubjectName: "Old Subj",
            SubjectCode: "OLD1",
            Credit: "CREDIT_15",
          },
          gradelevel: { GradeID: "G1" },
        } as any,
      ]);

      // Adding 4 more hours -> 22 hours (> 20 limit)
      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "ค21101",
        gradeId: "M1",
        semester: "SEMESTER_1",
        year: 2568,
        additionalHours: 4,
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("ครูจะสอนเกิน 20 ชม./สัปดาห์");
    });

    it("should return warning for exceeding recommended workload (18+ hours)", async () => {
      vi.mocked(teacherRepository.findById).mockResolvedValue({
        TeacherID: 1,
        Prefix: "Mr.",
        Firstname: "Busy",
        Lastname: "Teacher",
        Department: "คณิตศาสตร์",
        Email: "busy@example.com",
        Role: "teacher",
        IsActive: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });

      vi.mocked(subjectRepository.findByCode).mockResolvedValue({
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์ 1",
        Credit: "CREDIT_15",
        LearningArea: "MATHEMATICS",
        Category: "CORE",
        IsGraded: true,
        IsActive: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });

      // Current workload is 16 hours
      vi.mocked(repo.findTeacherWorkload).mockResolvedValue([
        {
          TeachHour: 16,
          SubjectCode: "OLD1",
          GradeID: "G1",
          AcademicYear: 2568,
          Semester: "SEMESTER_1",
          teacher: { Prefix: "Mr.", Firstname: "Busy", Lastname: "Teacher" },
          subject: {
            SubjectName: "Old Subj",
            SubjectCode: "OLD1",
            Credit: "CREDIT_15",
          },
          gradelevel: { GradeID: "G1" },
        } as any,
      ]);

      // Adding 3 more hours -> 19 hours (> 16 recommended limit)
      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "ค21101",
        gradeId: "M1",
        semester: "SEMESTER_1",
        year: 2568,
        additionalHours: 3,
      });

      expect(result.valid).toBe(true);
      expect(result.warnings[0]).toContain(
        "ครูจะสอนเกิน 16 ชม./สัปดาห์ที่แนะนำ",
      );
    });

    it("should return success for valid assignment within limits and same specialization", async () => {
      vi.mocked(teacherRepository.findById).mockResolvedValue({
        TeacherID: 1,
        Prefix: "Mr.",
        Firstname: "Pro",
        Lastname: "Teacher",
        Department: "คณิตศาสตร์",
        Email: "pro@example.com",
        Role: "teacher",
        IsActive: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });

      vi.mocked(subjectRepository.findByCode).mockResolvedValue({
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์ 1",
        Credit: "CREDIT_15",
        LearningArea: "MATHEMATICS",
        Category: "CORE",
        IsGraded: true,
        IsActive: true,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      });

      vi.mocked(repo.findTeacherWorkload).mockResolvedValue([]);

      const result = await validateAssignment({
        teacherId: 1,
        subjectCode: "ค21101",
        gradeId: "M1",
        semester: "SEMESTER_1",
        year: 2568,
        additionalHours: 3,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });
});
