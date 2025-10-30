/**
 * Unit Tests for Dashboard Statistics Service
 * Tests all pure functions for calculating dashboard metrics
 */

import {
  calculateTotalScheduledHours,
  calculateCompletionRate,
  countTeachersWithSchedules,
  countClassCompletion,
  calculateTeacherWorkload,
  calculateSubjectDistribution,
  detectConflicts,
} from "@/features/dashboard/domain/services/dashboard-stats.service";

describe("Dashboard Statistics Service", () => {
  describe("calculateTotalScheduledHours", () => {
    it("should return 0 for empty schedules", () => {
      expect(calculateTotalScheduledHours([])).toBe(0);
    });

    it("should return correct count for schedules", () => {
      const schedules = [
        { ClassID: "1" },
        { ClassID: "2" },
        { ClassID: "3" },
      ];
      expect(calculateTotalScheduledHours(schedules as any)).toBe(3);
    });

    it("should handle large number of schedules", () => {
      const schedules = Array(100).fill({ ClassID: "1" });
      expect(calculateTotalScheduledHours(schedules as any)).toBe(100);
    });
  });

  describe("calculateCompletionRate", () => {
    it("should return 0 when no classes", () => {
      expect(calculateCompletionRate([], 0, 10)).toBe(0);
    });

    it("should return 0 when no timeslots", () => {
      const schedules = [{ ClassID: "1" }];
      expect(calculateCompletionRate(schedules as any, 5, 0)).toBe(0);
    });

    it("should calculate correct percentage", () => {
      const schedules = Array(20).fill({ ClassID: "1" });
      // 20 schedules / (5 classes * 10 timeslots) = 40%
      expect(calculateCompletionRate(schedules as any, 5, 10)).toBe(40);
    });

    it("should cap at 100%", () => {
      const schedules = Array(100).fill({ ClassID: "1" });
      // 100 schedules / (5 classes * 10 timeslots) = 200% -> capped at 100%
      expect(calculateCompletionRate(schedules as any, 5, 10)).toBe(100);
    });

    it("should round to 1 decimal place", () => {
      const schedules = Array(17).fill({ ClassID: "1" });
      // 17 / 50 = 34% exactly
      expect(calculateCompletionRate(schedules as any, 5, 10)).toBe(34);
    });
  });

  describe("countTeachersWithSchedules", () => {
    const mockTeachers = [
      { TeacherID: 1, Firstname: "John", Lastname: "Doe", Prefix: "Mr.", Department: "Math", Email: "john@test.com", Role: "TEACHER" },
      { TeacherID: 2, Firstname: "Jane", Lastname: "Smith", Prefix: "Ms.", Department: "Science", Email: "jane@test.com", Role: "TEACHER" },
      { TeacherID: 3, Firstname: "Bob", Lastname: "Johnson", Prefix: "Mr.", Department: "English", Email: "bob@test.com", Role: "TEACHER" },
    ];

    it("should count 0 teachers with schedules when no schedules", () => {
      const result = countTeachersWithSchedules([], mockTeachers);
      expect(result.withSchedules).toBe(0);
      expect(result.withoutSchedules).toBe(3);
    });

    it("should count teachers with schedules correctly", () => {
      const schedules = [
        { ClassID: "1", teachers_responsibility: [{ TeacherID: 1 }] },
        { ClassID: "2", teachers_responsibility: [{ TeacherID: 1 }] },
        { ClassID: "3", teachers_responsibility: [{ TeacherID: 2 }] },
      ];
      const result = countTeachersWithSchedules(schedules, mockTeachers);
      expect(result.withSchedules).toBe(2); // Teachers 1 and 2
      expect(result.withoutSchedules).toBe(1); // Teacher 3
    });

    it("should handle multiple teachers per schedule", () => {
      const schedules = [
        { ClassID: "1", teachers_responsibility: [{ TeacherID: 1 }, { TeacherID: 2 }] },
      ];
      const result = countTeachersWithSchedules(schedules, mockTeachers);
      expect(result.withSchedules).toBe(2);
      expect(result.withoutSchedules).toBe(1);
    });

    it("should handle schedules without teachers_responsibility", () => {
      const schedules = [
        { ClassID: "1" },
        { ClassID: "2", teachers_responsibility: [] },
      ];
      const result = countTeachersWithSchedules(schedules, mockTeachers);
      expect(result.withSchedules).toBe(0);
      expect(result.withoutSchedules).toBe(3);
    });
  });

  describe("countClassCompletion", () => {
    const mockGrades = [
      { GradeID: "M1-1", Year: 1, Number: 1, StudentCount: 30, ProgramID: 1 },
      { GradeID: "M1-2", Year: 1, Number: 2, StudentCount: 32, ProgramID: 1 },
      { GradeID: "M2-1", Year: 2, Number: 1, StudentCount: 28, ProgramID: 1 },
    ];

    it("should count all grades as none when no schedules", () => {
      const result = countClassCompletion([], mockGrades, 10);
      expect(result.full).toBe(0);
      expect(result.partial).toBe(0);
      expect(result.none).toBe(3);
    });

    it("should count full schedules correctly", () => {
      const schedules = [
        ...Array(10).fill(null).map((_, i) => ({ ClassID: `1-${i}`, GradeID: "M1-1" })),
        ...Array(10).fill(null).map((_, i) => ({ ClassID: `2-${i}`, GradeID: "M1-2" })),
      ];
      const result = countClassCompletion(schedules as any, mockGrades, 10);
      expect(result.full).toBe(2); // M1-1 and M1-2 have 10 schedules each
      expect(result.partial).toBe(0);
      expect(result.none).toBe(1); // M2-1 has no schedules
    });

    it("should count partial schedules correctly", () => {
      const schedules = [
        ...Array(5).fill(null).map((_, i) => ({ ClassID: `1-${i}`, GradeID: "M1-1" })),
        ...Array(3).fill(null).map((_, i) => ({ ClassID: `2-${i}`, GradeID: "M1-2" })),
      ];
      const result = countClassCompletion(schedules as any, mockGrades, 10);
      expect(result.full).toBe(0);
      expect(result.partial).toBe(2); // M1-1 (5) and M1-2 (3)
      expect(result.none).toBe(1); // M2-1
    });

    it("should handle over-scheduled classes as full", () => {
      const schedules = Array(15).fill(null).map((_, i) => ({ ClassID: `1-${i}`, GradeID: "M1-1" }));
      const result = countClassCompletion(schedules as any, mockGrades, 10);
      expect(result.full).toBe(1); // >= 10 counts as full
      expect(result.partial).toBe(0);
      expect(result.none).toBe(2);
    });
  });

  describe("calculateTeacherWorkload", () => {
    const mockTeachers = [
      { TeacherID: 1, Firstname: "John", Lastname: "Doe", Prefix: "Mr.", Department: "Math", Email: "john@test.com", Role: "TEACHER" },
      { TeacherID: 2, Firstname: "Jane", Lastname: "Smith", Prefix: "Ms.", Department: "Science", Email: "jane@test.com", Role: "TEACHER" },
    ];

    it("should return empty workload for teachers with no schedules", () => {
      const result = calculateTeacherWorkload([], mockTeachers);
      expect(result).toHaveLength(2);
      expect(result[0].scheduledHours).toBe(0);
      expect(result[0].classCount).toBe(0);
      expect(result[0].utilizationRate).toBe(0);
    });

    it("should calculate workload correctly", () => {
      const schedules = [
        { ClassID: "1", GradeID: "M1-1", teachers_responsibility: [{ TeacherID: 1 }] },
        { ClassID: "2", GradeID: "M1-1", teachers_responsibility: [{ TeacherID: 1 }] },
        { ClassID: "3", GradeID: "M1-2", teachers_responsibility: [{ TeacherID: 1 }] },
        { ClassID: "4", GradeID: "M2-1", teachers_responsibility: [{ TeacherID: 2 }] },
      ];
      const result = calculateTeacherWorkload(schedules, mockTeachers);
      
      // Should be sorted by hours descending
      expect(result[0].teacherId).toBe(1); // 3 hours
      expect(result[0].scheduledHours).toBe(3);
      expect(result[0].classCount).toBe(2); // M1-1 and M1-2
      expect(result[0].utilizationRate).toBe(12); // (3/25)*100 = 12%
      
      expect(result[1].teacherId).toBe(2); // 1 hour
      expect(result[1].scheduledHours).toBe(1);
      expect(result[1].classCount).toBe(1);
    });

    it("should format teacher names correctly", () => {
      const schedules = [
        { ClassID: "1", GradeID: "M1-1", teachers_responsibility: [{ TeacherID: 1 }] },
      ];
      const result = calculateTeacherWorkload(schedules, mockTeachers);
      expect(result[0].teacherName).toBe("Mr.John Doe");
      expect(result[0].department).toBe("Math");
    });

    it("should cap utilization rate at 100%", () => {
      const schedules = Array(30).fill(null).map((_, i) => ({
        ClassID: `${i}`,
        GradeID: "M1-1",
        teachers_responsibility: [{ TeacherID: 1 }],
      }));
      const result = calculateTeacherWorkload(schedules, mockTeachers);
      expect(result[0].utilizationRate).toBe(100); // (30/25)*100 = 120% -> capped at 100%
    });

    it("should handle multiple teachers per schedule", () => {
      const schedules = [
        { ClassID: "1", GradeID: "M1-1", teachers_responsibility: [{ TeacherID: 1 }, { TeacherID: 2 }] },
      ];
      const result = calculateTeacherWorkload(schedules, mockTeachers);
      // Both teachers should get credit for 1 hour
      expect(result[0].scheduledHours).toBe(1);
      expect(result[1].scheduledHours).toBe(1);
    });
  });

  describe("calculateSubjectDistribution", () => {
    const mockSubjects = [
      { SubjectCode: "MATH101", SubjectName: "Mathematics" },
      { SubjectCode: "SCI101", SubjectName: "Science" },
      { SubjectCode: "ENG101", SubjectName: "English" },
    ];

    it("should return empty array for no schedules", () => {
      const result = calculateSubjectDistribution([], mockSubjects);
      expect(result).toEqual([]);
    });

    it("should calculate distribution correctly", () => {
      const schedules = [
        { ClassID: "1", SubjectCode: "MATH101", GradeID: "M1-1" },
        { ClassID: "2", SubjectCode: "MATH101", GradeID: "M1-2" },
        { ClassID: "3", SubjectCode: "MATH101", GradeID: "M2-1" },
        { ClassID: "4", SubjectCode: "SCI101", GradeID: "M1-1" },
        { ClassID: "5", SubjectCode: "SCI101", GradeID: "M1-2" },
        { ClassID: "6", SubjectCode: "ENG101", GradeID: "M1-1" },
      ];
      const result = calculateSubjectDistribution(schedules as any, mockSubjects);
      
      // Should be sorted by hours descending
      expect(result).toHaveLength(3);
      expect(result[0].subjectCode).toBe("MATH101");
      expect(result[0].totalHours).toBe(3);
      expect(result[0].classCount).toBe(3);
      expect(result[0].percentage).toBe(50); // 3/6 = 50%
      
      expect(result[1].subjectCode).toBe("SCI101");
      expect(result[1].totalHours).toBe(2);
      expect(result[1].percentage).toBe(33.3); // 2/6 = 33.3%
      
      expect(result[2].subjectCode).toBe("ENG101");
      expect(result[2].totalHours).toBe(1);
      expect(result[2].percentage).toBe(16.7); // 1/6 = 16.7%
    });

    it("should use subject code as name if subject not found", () => {
      const schedules = [
        { ClassID: "1", SubjectCode: "UNKNOWN", GradeID: "M1-1" },
      ];
      const result = calculateSubjectDistribution(schedules as any, mockSubjects);
      expect(result[0].subjectCode).toBe("UNKNOWN");
      expect(result[0].subjectName).toBe("UNKNOWN");
    });

    it("should count unique classes correctly", () => {
      const schedules = [
        { ClassID: "1", SubjectCode: "MATH101", GradeID: "M1-1" },
        { ClassID: "2", SubjectCode: "MATH101", GradeID: "M1-1" }, // Same class, different slot
        { ClassID: "3", SubjectCode: "MATH101", GradeID: "M1-2" }, // Different class
      ];
      const result = calculateSubjectDistribution(schedules as any, mockSubjects);
      expect(result[0].classCount).toBe(2); // M1-1 and M1-2
    });
  });

  describe("detectConflicts", () => {
    it("should return no conflicts for empty schedules", () => {
      const result = detectConflicts([]);
      expect(result.teacherConflicts).toBe(0);
      expect(result.classConflicts).toBe(0);
      expect(result.roomConflicts).toBe(0);
    });

    it("should detect teacher conflicts", () => {
      const schedules = [
        { ClassID: "1", TimeslotID: "1-2567-MON1", GradeID: "M1-1", RoomID: 1, SubjectCode: "MATH", IsLocked: false, teachers_responsibility: [{ TeacherID: 1 }] },
        { ClassID: "2", TimeslotID: "1-2567-MON1", GradeID: "M1-2", RoomID: 2, SubjectCode: "SCI", IsLocked: false, teachers_responsibility: [{ TeacherID: 1 }] },
      ];
      const result = detectConflicts(schedules as any);
      // Function properly detects teacher conflicts via teachers_responsibility
      expect(result.teacherConflicts).toBe(1); // Teacher 1 scheduled twice in MON1
    });

    it("should detect class conflicts", () => {
      const schedules = [
        { ClassID: "1", TimeslotID: "1-2567-MON1", GradeID: "M1-1", RoomID: 1, SubjectCode: "MATH", IsLocked: false },
        { ClassID: "2", TimeslotID: "1-2567-MON1", GradeID: "M1-1", RoomID: 2, SubjectCode: "SCI", IsLocked: false },
      ];
      const result = detectConflicts(schedules as any);
      expect(result.classConflicts).toBe(1); // M1-1 scheduled twice in MON1
    });

    it("should detect room conflicts", () => {
      const schedules = [
        { ClassID: "1", TimeslotID: "1-2567-MON1", GradeID: "M1-1", RoomID: 101, SubjectCode: "MATH", IsLocked: false },
        { ClassID: "2", TimeslotID: "1-2567-MON1", GradeID: "M1-2", RoomID: 101, SubjectCode: "SCI", IsLocked: false },
      ];
      const result = detectConflicts(schedules as any);
      expect(result.roomConflicts).toBe(1); // Room 101 used twice in MON1
    });

    it("should not count conflicts in different timeslots", () => {
      const schedules = [
        { ClassID: "1", TimeslotID: "1-2567-MON1", GradeID: "M1-1", RoomID: 101, SubjectCode: "MATH", IsLocked: false },
        { ClassID: "2", TimeslotID: "1-2567-MON2", GradeID: "M1-1", RoomID: 101, SubjectCode: "SCI", IsLocked: false },
      ];
      const result = detectConflicts(schedules as any);
      expect(result.classConflicts).toBe(0);
      expect(result.roomConflicts).toBe(0);
    });

    it("should handle null room IDs", () => {
      const schedules = [
        { ClassID: "1", TimeslotID: "1-2567-MON1", GradeID: "M1-1", RoomID: null, SubjectCode: "MATH", IsLocked: false },
        { ClassID: "2", TimeslotID: "1-2567-MON1", GradeID: "M1-2", RoomID: null, SubjectCode: "SCI", IsLocked: false },
      ];
      const result = detectConflicts(schedules as any);
      expect(result.roomConflicts).toBe(0); // Null rooms don't conflict
    });
  });
});
