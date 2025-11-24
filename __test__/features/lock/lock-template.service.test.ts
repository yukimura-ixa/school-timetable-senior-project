/**
 * Unit Tests for Lock Template Service
 * Tests template resolution, grade filtering, timeslot filtering, and warning generation
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  resolveTemplate,
  validateTemplate,
  getTemplateSummary,
} from "@/features/lock/domain/services/lock-template.service";
import {
  LOCK_TEMPLATES,
  getTemplateById,
} from "@/features/lock/domain/models/lock-template.model";

describe("Lock Template Service", () => {
  // Mock data fixtures - match service interface
  const mockGrades = [
    { GradeID: "1-1", GradeName: "ม.1/1", Level: 1 },
    { GradeID: "1-2", GradeName: "ม.1/2", Level: 1 },
    { GradeID: "2-1", GradeName: "ม.2/1", Level: 2 },
    { GradeID: "3-1", GradeName: "ม.3/1", Level: 3 },
    { GradeID: "4-1", GradeName: "ม.4/1", Level: 4 },
    { GradeID: "5-1", GradeName: "ม.5/1", Level: 5 },
    { GradeID: "6-1", GradeName: "ม.6/1", Level: 6 },
  ];

  const mockTimeslots = [
    { TimeslotID: "1-MON-1", Day: "MON", PeriodStart: 1 },
    { TimeslotID: "1-MON-4", Day: "MON", PeriodStart: 4 },
    { TimeslotID: "1-MON-5", Day: "MON", PeriodStart: 5 },
    { TimeslotID: "1-TUE-4", Day: "TUE", PeriodStart: 4 },
    { TimeslotID: "1-WED-4", Day: "WED", PeriodStart: 4 },
    { TimeslotID: "1-THU-4", Day: "THU", PeriodStart: 4 },
    { TimeslotID: "1-FRI-4", Day: "FRI", PeriodStart: 4 },
    { TimeslotID: "1-FRI-8", Day: "FRI", PeriodStart: 8 },
    { TimeslotID: "1-FRI-9", Day: "FRI", PeriodStart: 9 },
  ];

  const mockRooms = [
    { RoomID: 1, Name: "โรงอาหาร" },
    { RoomID: 2, Name: "สนามหน้าเสาธง" },
  ];

  const mockSubjects = [
    { SubjectID: "LUNCH-JR", Name_TH: "พักกลางวัน (ม.ต้น)" },
    { SubjectID: "ACT-MORNING", Name_TH: "กิจกรรมหน้าเสาธง" },
  ];

  const mockResponsibilities = [
    { RespID: 100, SubjectCode: "LUNCH-JR", TeacherID: 1 },
    { RespID: 101, SubjectCode: "ACT-MORNING", TeacherID: 2 },
  ];

  // Helper function to create test input with optional overrides
  const createTestInput = (
    template: ReturnType<typeof getTemplateById>,
    overrides?: Partial<{
      availableGrades: typeof mockGrades;
      availableTimeslots: typeof mockTimeslots;
      availableRooms: typeof mockRooms;
      availableSubjects: typeof mockSubjects;
      availableResponsibilities: typeof mockResponsibilities;
    }>,
  ) => ({
    template: template!,
    academicYear: 2567,
    semester: "SEMESTER_1" as const,
    configId: "1-2567",
    availableGrades: mockGrades,
    availableTimeslots: mockTimeslots,
    availableRooms: mockRooms,
    availableSubjects: mockSubjects,
    availableResponsibilities: mockResponsibilities,
    ...overrides,
  });

  describe("resolveTemplate", () => {
    it("should resolve lunch-junior template correctly", () => {
      const template = getTemplateById("lunch-junior");
      expect(template).toBeDefined();

      const result = resolveTemplate(createTestInput(template));

      // Should filter to junior grades (1-3)
      const uniqueGrades = new Set(result.locks.map((l) => l.GradeID));
      expect(uniqueGrades.size).toBe(4); // 1-1, 1-2, 2-1, 3-1

      // Should filter to period 4, Mon-Fri
      const uniqueTimeslots = new Set(result.locks.map((l) => l.TimeslotID));
      expect(uniqueTimeslots.has("1-MON-4")).toBe(true);
      expect(uniqueTimeslots.has("1-TUE-4")).toBe(true);
      expect(uniqueTimeslots.has("1-FRI-4")).toBe(true);
      expect(uniqueTimeslots.has("1-MON-5")).toBe(false); // Wrong period

      // Should have correct subject
      expect(result.locks[0].SubjectCode).toBe("LUNCH-JR");

      // Should have no errors for valid data
      expect(result.errors.length).toBe(0);
    });

    it("should resolve lunch-senior template correctly", () => {
      const template = getTemplateById("lunch-senior")!;
      expect(template).toBeDefined();

      const result = resolveTemplate(createTestInput(template));

      // Should filter to senior grades (4-6)
      const gradeIds = result.locks.map((l) => l.GradeID);
      expect(gradeIds.some((id) => id.startsWith("4-"))).toBe(true);
      expect(gradeIds.some((id) => id.startsWith("5-"))).toBe(true);
      expect(gradeIds.some((id) => id.startsWith("6-"))).toBe(true);
      expect(gradeIds.some((id) => id.startsWith("1-"))).toBe(false);
      expect(gradeIds.some((id) => id.startsWith("2-"))).toBe(false);
      expect(gradeIds.some((id) => id.startsWith("3-"))).toBe(false);
    });

    it("should resolve activity-morning template for all grades", () => {
      const template = getTemplateById("activity-morning")!;
      expect(template).toBeDefined();

      const result = resolveTemplate(createTestInput(template));

      // Should include all grades
      const uniqueGrades = new Set(result.locks.map((l) => l.GradeID));
      expect(uniqueGrades.size).toBe(mockGrades.length);

      // Should filter to Monday, Period 1
      const uniqueTimeslots = new Set(result.locks.map((l) => l.TimeslotID));
      expect(uniqueTimeslots.has("1-MON-1")).toBe(true);
      expect(uniqueTimeslots.has("1-TUE-4")).toBe(false);
    });

    it("should resolve activity-club template with multiple periods", () => {
      const template = getTemplateById("activity-club")!;
      expect(template).toBeDefined();

      const result = resolveTemplate(createTestInput(template));

      // Should filter to Friday, Periods 8-9
      const timeslotIds = result.locks.map((l) => l.TimeslotID);
      const fridayPeriods = timeslotIds.filter(
        (id) => id === "1-FRI-8" || id === "1-FRI-9",
      );
      expect(fridayPeriods.length).toBeGreaterThan(0);
    });

    it("should generate warning when room not found", () => {
      const template = getTemplateById("lunch-junior")!;
      const roomsWithoutMatch = [{ RoomID: 99, RoomName: "ห้องอื่น" }];

      const result = resolveTemplate(
        createTestInput(template, { availableRooms: roomsWithoutMatch }),
      );

      expect(result.warnings.some((w) => w.includes("ห้อง"))).toBe(true);
    });

    it("should generate warning when subject not found", () => {
      const template = getTemplateById("lunch-junior")!;
      const emptySubjects: typeof mockSubjects = [];

      const result = resolveTemplate(
        createTestInput(template, { availableSubjects: emptySubjects }),
      );

      // Service generates warning (not error) when subject not found
      expect(result.warnings.some((w) => w.includes("วิชา"))).toBe(true);
    });

    it("should generate error when no responsibility found", () => {
      const template = getTemplateById("lunch-junior")!;
      const emptyResp: typeof mockResponsibilities = [];

      const result = resolveTemplate(
        createTestInput(template, {
          availableResponsibilities: emptyResp,
        }),
      );

      // Service generates error (not warning) when NO responsibilities exist at all
      expect(result.errors.some((e: string) => e.includes("ครู"))).toBe(true);
    });

    it("should return empty locks when no matching timeslots", () => {
      const template = getTemplateById("lunch-junior")!;
      const wrongTimeslots = [
        { TimeslotID: "1-SAT-1", Day: "SAT", PeriodStart: 1 },
      ];

      const result = resolveTemplate(
        createTestInput(template, {
          availableTimeslots: wrongTimeslots,
        }),
      );

      // When no timeslots match, the Cartesian product is empty
      expect(result.locks.length).toBe(0);
    });

    it("should generate error when no matching grades", () => {
      const template = getTemplateById("lunch-junior")!;
      const seniorOnlyGrades = mockGrades.filter((g) => g.Level >= 4);

      const result = resolveTemplate({
        template,
        academicYear: 2567,
        semester: "SEMESTER_1" as const,
        configId: "1-2567",
        availableGrades: seniorOnlyGrades,
        availableTimeslots: mockTimeslots,
        availableRooms: mockRooms,
        availableSubjects: mockSubjects,
        availableResponsibilities: mockResponsibilities,
      });

      expect(result.errors.some((e) => e.includes("ชั้นเรียน"))).toBe(true);
    });

    it("should calculate correct Cartesian product", () => {
      const template = getTemplateById("lunch-junior")!;

      const result = resolveTemplate(createTestInput(template));

      // Junior grades: 4 (1-1, 1-2, 2-1, 3-1)
      // Matching timeslots (MON-FRI, Period 4): 5
      // Expected locks: 4 * 5 = 20
      const expectedCount = 4 * 5;
      expect(result.locks.length).toBe(expectedCount);
    });
  });

  describe("validateTemplate", () => {
    it("should validate template with all required data", () => {
      const template = getTemplateById("lunch-junior")!;

      const result = validateTemplate(createTestInput(template));

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should still validate when missing subject (generates warning only)", () => {
      const template = getTemplateById("lunch-junior")!;

      const result = validateTemplate(
        createTestInput(template, {
          availableSubjects: [],
        }),
      );

      // Missing subject generates warning, not error - template is still valid
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should invalidate when no matching grades", () => {
      const template = getTemplateById("lunch-junior")!;

      const result = validateTemplate(
        createTestInput(template, {
          availableGrades: [],
        }),
      );

      expect(result.valid).toBe(false);
    });

    it("should invalidate when no matching timeslots", () => {
      const template = getTemplateById("lunch-junior")!;

      const result = validateTemplate(
        createTestInput(template, {
          availableTimeslots: [],
        }),
      );

      expect(result.valid).toBe(false);
    });
  });

  describe("getTemplateSummary", () => {
    it("should generate correct summary for lunch-junior template", () => {
      const template = getTemplateById("lunch-junior")!;

      const summary = getTemplateSummary(createTestInput(template));

      // Service returns: totalLocks, gradeCount, timeslotCount, affectedGrades, affectedTimeslots
      expect(summary.gradeCount).toBe(4); // ม.1/1, ม.1/2, ม.2/1, ม.3/1 (junior grades)
      expect(summary.timeslotCount).toBe(5); // MON-FRI Period 4
      expect(summary.totalLocks).toBe(20); // 4 grades * 5 timeslots
    });

    it("should generate correct summary for activity-club template", () => {
      const template = getTemplateById("activity-club")!;

      const summary = getTemplateSummary(createTestInput(template));

      expect(summary.gradeCount).toBe(mockGrades.length); // All grades
      expect(summary.timeslotCount).toBe(2); // FRI Periods 8-9
      expect(summary.totalLocks).toBe(mockGrades.length * 2);
    });

    it("should show zero counts when no matches", () => {
      const template = getTemplateById("lunch-junior")!;

      const summary = getTemplateSummary(
        createTestInput(template, {
          availableGrades: [],
          availableTimeslots: [],
        }),
      );

      expect(summary.gradeCount).toBe(0);
      expect(summary.timeslotCount).toBe(0);
      expect(summary.totalLocks).toBe(0);
    });
  });

  describe("Template Models", () => {
    it("should have all 9 predefined templates", () => {
      expect(LOCK_TEMPLATES.length).toBe(9);

      const templateIds = [
        "lunch-junior",
        "lunch-senior",
        "activity-morning",
        "activity-club",
        "activity-sport",
        "assembly-weekly",
        "assembly-junior",
        "exam-midterm",
      ];

      templateIds.forEach((id) => {
        const template = getTemplateById(id);
        expect(template).toBeDefined();
      });
    });

    it("should have proper category assignments", () => {
      const lunchTemplates = LOCK_TEMPLATES.filter(
        (t) => t.category === "lunch",
      );
      const activityTemplates = LOCK_TEMPLATES.filter(
        (t) => t.category === "activity",
      );
      const assemblyTemplates = LOCK_TEMPLATES.filter(
        (t) => t.category === "assembly",
      );
      const examTemplates = LOCK_TEMPLATES.filter((t) => t.category === "exam");

      expect(lunchTemplates.length).toBe(2);
      expect(activityTemplates.length).toBe(3);
      expect(assemblyTemplates.length).toBe(2);
      expect(examTemplates.length).toBe(2);
    });

    it("should have required fields in all templates", () => {
      LOCK_TEMPLATES.forEach((template) => {
        expect(template.id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.nameEn).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.icon).toBeTruthy();
        expect(template.category).toBeTruthy();
        expect(template.config).toBeDefined();
        expect(template.config.subjectCode).toBeTruthy();
        expect(template.config.gradeFilter).toBeDefined();
        expect(template.config.timeslotFilter).toBeDefined();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle template with allDay timeslot filter", () => {
      const template = getTemplateById("exam-midterm")!;
      expect(template.config.timeslotFilter.allDay).toBe(true);

      // Should match all periods for specified days
      const result = resolveTemplate(
        createTestInput(template, {
          availableSubjects: [{ SubjectID: "EXAM-MID", Name_TH: "สอบกลางภาค" }],
          availableResponsibilities: [
            { RespID: 200, SubjectCode: "EXAM-MID", TeacherID: 1 },
          ],
        }),
      );

      expect(result.locks.length).toBeGreaterThan(0);
    });

    it("should handle template with null roomId", () => {
      const template = getTemplateById("activity-morning")!;
      expect(template.config.roomId).toBeNull();

      const result = resolveTemplate(createTestInput(template));

      // Should still work with roomName matching
      expect(result.locks.length).toBeGreaterThan(0);
    });

    it("should handle multiple periods in timeslot filter", () => {
      const template = getTemplateById("activity-club")!;
      expect(template.config.timeslotFilter.periods.length).toBe(2); // Periods 8-9

      const result = resolveTemplate(
        createTestInput(template, {
          availableSubjects: [{ SubjectID: "ACT-CLUB", Name_TH: "ชุมนุม" }],
          availableResponsibilities: [
            { RespID: 300, SubjectCode: "ACT-CLUB", TeacherID: 1 },
          ],
        }),
      );

      const uniqueTimeslots = new Set(result.locks.map((l) => l.TimeslotID));
      expect(uniqueTimeslots.has("1-FRI-8")).toBe(true);
      expect(uniqueTimeslots.has("1-FRI-9")).toBe(true);
    });
  });
});
