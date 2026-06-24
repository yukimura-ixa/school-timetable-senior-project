// Vitest globals are available via globals: true in vitest.config.ts
import {
  validateProgramMOECredits,
  calculateLearningAreaCredits,
  validateTrackElectives,
  validateActivityCoverage,
} from "@/features/program/domain/services/moe-validation.service";
import { SubjectCategory, LearningArea, ActivityType } from "@/prisma/generated/client";
import type { program_subject, subject } from "@/prisma/generated/client";

describe("MOE Validation Service", () => {
  describe("validateProgramMOECredits", () => {
    it("should validate compliant junior program (M.1-M.3)", () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> =
        [
          {
            ProgramSubjectID: 1,
            ProgramID: 1,
            SubjectCode: "THAI01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 5,
            MaxCredits: 5,
            SortOrder: 1,
            subject: {
              SubjectCode: "THAI01",
              SubjectName: "ภาษาไทย",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.THAI,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 2,
            ProgramID: 1,
            SubjectCode: "MATH01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 5,
            MaxCredits: 5,
            SortOrder: 2,
            subject: {
              SubjectCode: "MATH01",
              SubjectName: "คณิตศาสตร์",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.MATHEMATICS,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 3,
            ProgramID: 1,
            SubjectCode: "SCI01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 5,
            MaxCredits: 5,
            SortOrder: 3,
            subject: {
              SubjectCode: "SCI01",
              SubjectName: "วิทยาศาสตร์",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.SCIENCE,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 4,
            ProgramID: 1,
            SubjectCode: "SOC01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 4,
            MaxCredits: 4,
            SortOrder: 4,
            subject: {
              SubjectCode: "SOC01",
              SubjectName: "สังคมศึกษา",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.SOCIAL,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 5,
            ProgramID: 1,
            SubjectCode: "HEALTH01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 2,
            MaxCredits: 2,
            SortOrder: 5,
            subject: {
              SubjectCode: "HEALTH01",
              SubjectName: "สุขศึกษาและพลศึกษา",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.HEALTH_PE,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 6,
            ProgramID: 1,
            SubjectCode: "ART01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 2,
            MaxCredits: 2,
            SortOrder: 6,
            subject: {
              SubjectCode: "ART01",
              SubjectName: "ศิลปะ",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.ARTS,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 7,
            ProgramID: 1,
            SubjectCode: "CAREER01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 2,
            MaxCredits: 2,
            SortOrder: 7,
            subject: {
              SubjectCode: "CAREER01",
              SubjectName: "การงานอาชีพ",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.CAREER,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 8,
            ProgramID: 1,
            SubjectCode: "ENG01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 3,
            MaxCredits: 3,
            SortOrder: 8,
            subject: {
              SubjectCode: "ENG01",
              SubjectName: "ภาษาอังกฤษ",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.FOREIGN_LANGUAGE,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 9,
            ProgramID: 1,
            SubjectCode: "ACT01",
            Category: SubjectCategory.ACTIVITY,
            IsMandatory: true,
            MinCredits: 1,
            MaxCredits: 1,
            SortOrder: 9,
            subject: {
              SubjectCode: "ACT01",
              SubjectName: "ชุมนุม",
              Credit: "CREDIT_10",
              Category: SubjectCategory.ACTIVITY,
              LearningArea: null,
              ActivityType: "CLUB",
              IsGraded: false,
              Description: "",
            },
          },
        ];

      const result = validateProgramMOECredits(1, mockProgramSubjects);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.totalCredits).toBe(28); // program credits provided by the mock (per term)
      expect(result.requiredCredits).toBe(11); // junior per-term floor: 22 นก./yr ÷ 2 terms
    });

    it("should detect insufficient credits for junior program", () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> =
        [
          {
            ProgramSubjectID: 1,
            ProgramID: 1,
            SubjectCode: "THAI01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 1, // below the per-term THAI floor (1.5)
            MaxCredits: 1,
            SortOrder: 1,
            subject: {
              SubjectCode: "THAI01",
              SubjectName: "ภาษาไทย",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.THAI,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
        ];

      const result = validateProgramMOECredits(1, mockProgramSubjects);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("ภาษาไทย");
      expect(result.errors[0]).toContain("1.5"); // per-term required (3 นก./yr ÷ 2)
      expect(result.errors[0]).toContain("(ขาด");
    });

    it("should validate compliant senior program (M.4-M.6)", () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> =
        [
          {
            ProgramSubjectID: 1,
            ProgramID: 2,
            SubjectCode: "THAI04",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 3,
            MaxCredits: 3,
            SortOrder: 1,
            subject: {
              SubjectCode: "THAI04",
              SubjectName: "ภาษาไทย ม.4",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.THAI,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 2,
            ProgramID: 2,
            SubjectCode: "MATH04",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 3,
            MaxCredits: 3,
            SortOrder: 2,
            subject: {
              SubjectCode: "MATH04",
              SubjectName: "คณิตศาสตร์ ม.4",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.MATHEMATICS,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 3,
            ProgramID: 2,
            SubjectCode: "SCI04",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 3,
            MaxCredits: 3,
            SortOrder: 3,
            subject: {
              SubjectCode: "SCI04",
              SubjectName: "วิทยาศาสตร์ ม.4",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.SCIENCE,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 4,
            ProgramID: 2,
            SubjectCode: "SOC04",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 2,
            MaxCredits: 2,
            SortOrder: 4,
            subject: {
              SubjectCode: "SOC04",
              SubjectName: "สังคมศึกษา ม.4",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.SOCIAL,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 5,
            ProgramID: 2,
            SubjectCode: "HEALTH04",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 2,
            MaxCredits: 2,
            SortOrder: 5,
            subject: {
              SubjectCode: "HEALTH04",
              SubjectName: "สุขศึกษาและพลศึกษา ม.4",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.HEALTH_PE,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 6,
            ProgramID: 2,
            SubjectCode: "ART04",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 1,
            MaxCredits: 1,
            SortOrder: 6,
            subject: {
              SubjectCode: "ART04",
              SubjectName: "ศิลปะ ม.4",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.ARTS,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 7,
            ProgramID: 2,
            SubjectCode: "CAREER04",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 1,
            MaxCredits: 1,
            SortOrder: 7,
            subject: {
              SubjectCode: "CAREER04",
              SubjectName: "การงานอาชีพ ม.4",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.CAREER,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 8,
            ProgramID: 2,
            SubjectCode: "ENG04",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 2,
            MaxCredits: 2,
            SortOrder: 8,
            subject: {
              SubjectCode: "ENG04",
              SubjectName: "ภาษาอังกฤษ ม.4",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.FOREIGN_LANGUAGE,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
        ];

      const result = validateProgramMOECredits(4, mockProgramSubjects);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.totalCredits).toBe(17); // program credits provided by the mock (per term)
      expect(result.requiredCredits).toBe(6.5); // senior per-term floor: 13 นก./yr ÷ 2 terms
    });

    it("should warn if activities are missing", () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> =
        [
          {
            ProgramSubjectID: 1,
            ProgramID: 1,
            SubjectCode: "THAI01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 5,
            MaxCredits: 5,
            SortOrder: 1,
            subject: {
              SubjectCode: "THAI01",
              SubjectName: "ภาษาไทย",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.THAI,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          // ... other core subjects (27 credits total)
        ];

      // Mock complete credits but no activities
      const completeSubjects = [...mockProgramSubjects];
      for (let i = 0; i < 7; i++) {
        completeSubjects.push({
          ProgramSubjectID: i + 10,
          ProgramID: 1,
          SubjectCode: `SUBJ${i}`,
          Category: SubjectCategory.CORE,
          IsMandatory: true,
          MinCredits: 3,
          MaxCredits: 3,
          SortOrder: i + 10,
          subject: {
            SubjectCode: `SUBJ${i}`,
            SubjectName: `Subject ${i}`,
            Credit: "CREDIT_10",
            Category: SubjectCategory.CORE,
            LearningArea: LearningArea.MATHEMATICS,
            ActivityType: null,
            IsGraded: true,
            Description: "",
          },
        });
      }

      const result = validateProgramMOECredits(1, completeSubjects);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("กิจกรรมพัฒนาผู้เรียน");
    });

    it("should reject invalid year", () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> =
        [];

      const result = validateProgramMOECredits(7, mockProgramSubjects);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("ปีต้องอยู่ระหว่าง 1-6");
    });

    it("should handle edge case with zero credits", () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> =
        [];

      const result = validateProgramMOECredits(1, mockProgramSubjects);

      expect(result.isValid).toBe(false);
      expect(result.totalCredits).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("calculateLearningAreaCredits", () => {
    it("should sum credits for specific learning area", () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> =
        [
          {
            ProgramSubjectID: 1,
            ProgramID: 1,
            SubjectCode: "MATH01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 2,
            MaxCredits: 2,
            SortOrder: 1,
            subject: {
              SubjectCode: "MATH01",
              SubjectName: "คณิตศาสตร์ 1",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.MATHEMATICS,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 2,
            ProgramID: 1,
            SubjectCode: "MATH02",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 2.5,
            MaxCredits: 2.5,
            SortOrder: 2,
            subject: {
              SubjectCode: "MATH02",
              SubjectName: "คณิตศาสตร์ 2",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.MATHEMATICS,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 3,
            ProgramID: 1,
            SubjectCode: "SCI01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 3,
            MaxCredits: 3,
            SortOrder: 3,
            subject: {
              SubjectCode: "SCI01",
              SubjectName: "วิทยาศาสตร์",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.SCIENCE,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
        ];

      const mathCredits = calculateLearningAreaCredits(
        mockProgramSubjects,
        LearningArea.MATHEMATICS,
      );
      const scienceCredits = calculateLearningAreaCredits(
        mockProgramSubjects,
        LearningArea.SCIENCE,
      );

      expect(mathCredits).toBe(4.5); // 2 + 2.5
      expect(scienceCredits).toBe(3);
    });

    it("should return 0 for learning area with no subjects", () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> =
        [];

      const artCredits = calculateLearningAreaCredits(
        mockProgramSubjects,
        LearningArea.ARTS,
      );

      expect(artCredits).toBe(0);
    });

    it("should exclude activity subjects from credit calculation", () => {
      const mockProgramSubjects: Array<program_subject & { subject: subject }> =
        [
          {
            ProgramSubjectID: 1,
            ProgramID: 1,
            SubjectCode: "MATH01",
            Category: SubjectCategory.CORE,
            IsMandatory: true,
            MinCredits: 2,
            MaxCredits: 2,
            SortOrder: 1,
            subject: {
              SubjectCode: "MATH01",
              SubjectName: "คณิตศาสตร์",
              Credit: "CREDIT_10",
              Category: SubjectCategory.CORE,
              LearningArea: LearningArea.MATHEMATICS,
              ActivityType: null,
              IsGraded: true,
              Description: "",
            },
          },
          {
            ProgramSubjectID: 2,
            ProgramID: 1,
            SubjectCode: "ACT01",
            Category: SubjectCategory.ACTIVITY,
            IsMandatory: true,
            MinCredits: 1,
            MaxCredits: 1,
            SortOrder: 2,
            subject: {
              SubjectCode: "ACT01",
              SubjectName: "ชุมนุม",
              Credit: "CREDIT_10",
              Category: SubjectCategory.ACTIVITY,
              LearningArea: null,
              ActivityType: "CLUB",
              IsGraded: false,
              Description: "",
            },
          },
        ];

      const mathCredits = calculateLearningAreaCredits(
        mockProgramSubjects,
        LearningArea.MATHEMATICS,
      );

      expect(mathCredits).toBe(2); // Only MATH01, ACT01 excluded
    });
  });

  // ─── Track Validation Tests ───────────────────────────────────────────────

  /**
   * Helper: Create a mock program_subject with subject
   */
  function createMockProgramSubject(
    overrides: {
      code?: string;
      name?: string;
      category?: SubjectCategory;
      learningArea?: LearningArea | null;
      minCredits?: number;
      programId?: number;
      sortOrder?: number;
    } = {},
  ): program_subject & { subject: subject } {
    const code = overrides.code ?? "TEST01";
    const cat = overrides.category ?? SubjectCategory.CORE;
    return {
      ProgramSubjectID: Math.floor(Math.random() * 100000),
      ProgramID: overrides.programId ?? 1,
      SubjectCode: code,
      Category: cat,
      IsMandatory: cat === SubjectCategory.CORE,
      MinCredits: overrides.minCredits ?? 2,
      MaxCredits: overrides.minCredits ?? 2,
      SortOrder: overrides.sortOrder ?? 1,
      subject: {
        SubjectCode: code,
        SubjectName: overrides.name ?? "Test Subject",
        Credit: "CREDIT_10",
        Category: cat,
        LearningArea: overrides.learningArea ?? null,
        ActivityType: cat === SubjectCategory.ACTIVITY ? "CLUB" : null,
        IsGraded: cat !== SubjectCategory.ACTIVITY,
        Description: "",
      },
    };
  }

  /**
   * Create a standard senior program with 8 core subjects (17 credits)
   * This is the baseline for all track validation tests.
   */
  function createSeniorCoreSubjects(): Array<
    program_subject & { subject: subject }
  > {
    return [
      createMockProgramSubject({
        code: "THAI04",
        name: "ภาษาไทย",
        category: SubjectCategory.CORE,
        learningArea: LearningArea.THAI,
        minCredits: 3,
      }),
      createMockProgramSubject({
        code: "MATH04",
        name: "คณิตศาสตร์",
        category: SubjectCategory.CORE,
        learningArea: LearningArea.MATHEMATICS,
        minCredits: 3,
      }),
      createMockProgramSubject({
        code: "SCI04",
        name: "วิทยาศาสตร์",
        category: SubjectCategory.CORE,
        learningArea: LearningArea.SCIENCE,
        minCredits: 3,
      }),
      createMockProgramSubject({
        code: "SOC04",
        name: "สังคมศึกษา",
        category: SubjectCategory.CORE,
        learningArea: LearningArea.SOCIAL,
        minCredits: 2,
      }),
      createMockProgramSubject({
        code: "HEALTH04",
        name: "สุขศึกษา",
        category: SubjectCategory.CORE,
        learningArea: LearningArea.HEALTH_PE,
        minCredits: 2,
      }),
      createMockProgramSubject({
        code: "ART04",
        name: "ศิลปะ",
        category: SubjectCategory.CORE,
        learningArea: LearningArea.ARTS,
        minCredits: 1,
      }),
      createMockProgramSubject({
        code: "CAREER04",
        name: "การงานอาชีพ",
        category: SubjectCategory.CORE,
        learningArea: LearningArea.CAREER,
        minCredits: 1,
      }),
      createMockProgramSubject({
        code: "ENG04",
        name: "ภาษาอังกฤษ",
        category: SubjectCategory.CORE,
        learningArea: LearningArea.FOREIGN_LANGUAGE,
        minCredits: 2,
      }),
      createMockProgramSubject({
        code: "ACT04",
        name: "ชุมนุม",
        category: SubjectCategory.ACTIVITY,
        learningArea: null,
        minCredits: 1,
      }),
    ];
  }

  describe("validateTrackElectives", () => {
    describe("SCIENCE_MATH track", () => {
      it("should error when zero science/math electives present", () => {
        // Senior program with only core subjects, no ADDITIONAL
        const subjects = createSeniorCoreSubjects();
        const result = validateTrackElectives("SCIENCE_MATH", 4, subjects);

        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain("แผนวิทย์-คณิต");
        expect(result.errors[0]).toContain("ขาดวิชาเพิ่มเติม");
      });

      it("should pass when student has both MATH and SCIENCE electives", () => {
        const subjects = [
          ...createSeniorCoreSubjects(),
          // ADDITIONAL: Advanced Math (covers MATHEMATICS area)
          createMockProgramSubject({
            code: "MA_ADV",
            name: "คณิตศาสตร์เพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.MATHEMATICS,
            minCredits: 3,
          }),
          // ADDITIONAL: Physics (covers SCIENCE area)
          createMockProgramSubject({
            code: "PH01",
            name: "ฟิสิกส์",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.SCIENCE,
            minCredits: 3,
          }),
        ];
        const result = validateTrackElectives("SCIENCE_MATH", 4, subjects);

        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should warn when only one of MATH/SCIENCE is covered", () => {
        const subjects = [
          ...createSeniorCoreSubjects(),
          // Only SCIENCE elective, no MATH elective
          createMockProgramSubject({
            code: "PH01",
            name: "ฟิสิกส์",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.SCIENCE,
            minCredits: 3,
          }),
        ];
        const result = validateTrackElectives("SCIENCE_MATH", 4, subjects);

        expect(result.errors).toHaveLength(0);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain("แผนวิทย์-คณิต");
      });

      it("should work for year 5 and 6 as well", () => {
        const subjects = createSeniorCoreSubjects();
        const resultY5 = validateTrackElectives("SCIENCE_MATH", 5, subjects);
        const resultY6 = validateTrackElectives("SCIENCE_MATH", 6, subjects);

        expect(resultY5.errors.length).toBeGreaterThan(0);
        expect(resultY6.errors.length).toBeGreaterThan(0);
      });
    });

    describe("LANGUAGE_ARTS track", () => {
      it("should error when zero language/arts electives present", () => {
        const subjects = createSeniorCoreSubjects();
        const result = validateTrackElectives("LANGUAGE_ARTS", 4, subjects);

        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain("แผนศิลป์-ภาษา");
      });

      it("should pass when all 3 required learning areas covered", () => {
        // LANGUAGE_ARTS requires: SOCIAL, FOREIGN_LANGUAGE, ARTS
        const subjects = [
          ...createSeniorCoreSubjects(),
          createMockProgramSubject({
            code: "SS_ADV",
            name: "สังคมศึกษาเพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.SOCIAL,
            minCredits: 2,
          }),
          createMockProgramSubject({
            code: "EN_ADV",
            name: "ภาษาอังกฤษเพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.FOREIGN_LANGUAGE,
            minCredits: 2,
          }),
          createMockProgramSubject({
            code: "AR_ADV",
            name: "ศิลปะเพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.ARTS,
            minCredits: 2,
          }),
        ];
        const result = validateTrackElectives("LANGUAGE_ARTS", 4, subjects);

        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should warn when only 2 of 3 required areas covered", () => {
        const subjects = [
          ...createSeniorCoreSubjects(),
          createMockProgramSubject({
            code: "SS_ADV",
            name: "สังคมศึกษาเพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.SOCIAL,
            minCredits: 2,
          }),
          createMockProgramSubject({
            code: "EN_ADV",
            name: "ภาษาอังกฤษเพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.FOREIGN_LANGUAGE,
            minCredits: 2,
          }),
          // Missing ARTS elective
        ];
        const result = validateTrackElectives("LANGUAGE_ARTS", 4, subjects);

        expect(result.errors).toHaveLength(0);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain("2/3");
      });
    });

    describe("LANGUAGE_MATH track", () => {
      it("should error when zero relevant electives present", () => {
        const subjects = createSeniorCoreSubjects();
        const result = validateTrackElectives("LANGUAGE_MATH", 4, subjects);

        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain("แผนศิลป์-คำนวณ");
      });

      it("should pass when all 3 required learning areas covered", () => {
        // LANGUAGE_MATH requires: MATHEMATICS, FOREIGN_LANGUAGE, SCIENCE
        const subjects = [
          ...createSeniorCoreSubjects(),
          createMockProgramSubject({
            code: "MA_ADV",
            name: "คณิตศาสตร์เพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.MATHEMATICS,
            minCredits: 3,
          }),
          createMockProgramSubject({
            code: "EN_ADV",
            name: "ภาษาอังกฤษเพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.FOREIGN_LANGUAGE,
            minCredits: 2,
          }),
          createMockProgramSubject({
            code: "CP_ADV",
            name: "วิทยาการคำนวณ",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.SCIENCE,
            minCredits: 2,
          }),
        ];
        const result = validateTrackElectives("LANGUAGE_MATH", 4, subjects);

        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should warn when only 1 of 3 required areas covered", () => {
        const subjects = [
          ...createSeniorCoreSubjects(),
          // Only MATH, missing FOREIGN_LANGUAGE and SCIENCE
          createMockProgramSubject({
            code: "MA_ADV",
            name: "คณิตศาสตร์เพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.MATHEMATICS,
            minCredits: 3,
          }),
        ];
        const result = validateTrackElectives("LANGUAGE_MATH", 4, subjects);

        expect(result.errors).toHaveLength(0);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain("1/3");
      });
    });

    describe("GENERAL track", () => {
      it("should have no track-specific errors or warnings", () => {
        const subjects = createSeniorCoreSubjects();
        const result = validateTrackElectives("GENERAL", 4, subjects);

        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe("Lower secondary with track", () => {
      it("should skip track validation via validateProgramMOECredits for M.1-M.3", () => {
        // Even with a track, year 1-3 should not get track errors
        const subjects = createSeniorCoreSubjects(); // reuse structure
        const result = validateProgramMOECredits(1, subjects, "SCIENCE_MATH");

        // Should have credit errors (wrong credits for junior) but NOT track errors
        const trackErrors = result.errors.filter((e) =>
          e.includes("แผนวิทย์-คณิต"),
        );
        expect(trackErrors).toHaveLength(0);
      });
    });

    describe("Integration: validateProgramMOECredits with track", () => {
      it("should include track errors in overall result for senior SCIENCE_MATH", () => {
        const subjects = createSeniorCoreSubjects();
        const result = validateProgramMOECredits(4, subjects, "SCIENCE_MATH");

        // Should have track-related error (no ADDITIONAL subjects)
        const trackErrors = result.errors.filter((e) =>
          e.includes("แผนวิทย์-คณิต"),
        );
        expect(trackErrors.length).toBeGreaterThan(0);
        expect(result.isValid).toBe(false);
      });

      it("should pass with valid senior SCIENCE_MATH program", () => {
        const subjects = [
          ...createSeniorCoreSubjects(),
          createMockProgramSubject({
            code: "MA_ADV",
            name: "คณิตศาสตร์เพิ่มเติม",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.MATHEMATICS,
            minCredits: 3,
          }),
          createMockProgramSubject({
            code: "PH01",
            name: "ฟิสิกส์",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.SCIENCE,
            minCredits: 3,
          }),
          createMockProgramSubject({
            code: "CH01",
            name: "เคมี",
            category: SubjectCategory.ADDITIONAL,
            learningArea: LearningArea.SCIENCE,
            minCredits: 3,
          }),
        ];
        const result = validateProgramMOECredits(4, subjects, "SCIENCE_MATH");

        // Should have no track errors
        const trackErrors = result.errors.filter((e) =>
          e.includes("แผนวิทย์-คณิต"),
        );
        expect(trackErrors).toHaveLength(0);
      });

      it("should not add track errors when track is undefined", () => {
        const subjects = createSeniorCoreSubjects();
        // No track passed (backward compatible)
        const result = validateProgramMOECredits(4, subjects);

        const trackErrors = result.errors.filter(
          (e) =>
            e.includes("แผน") &&
            (e.includes("วิทย์") ||
              e.includes("ศิลป์") ||
              e.includes("ทั่วไป")),
        );
        expect(trackErrors).toHaveLength(0);
      });
    });
  });

  describe("validateActivityCoverage", () => {
    function mkActivity(
      type: ActivityType | null,
      id = Math.floor(Math.random() * 100000),
    ): program_subject & { subject: subject } {
      return {
        ProgramSubjectID: id,
        ProgramID: 1,
        SubjectCode: `ACT${id}`,
        Category: SubjectCategory.ACTIVITY,
        IsMandatory: true,
        MinCredits: 1,
        MaxCredits: 1,
        SortOrder: id,
        subject: {
          SubjectCode: `ACT${id}`,
          SubjectName: "กิจกรรม",
          Credit: "CREDIT_10",
          Category: SubjectCategory.ACTIVITY,
          LearningArea: null,
          ActivityType: type,
          IsGraded: false,
          Description: "",
        },
      };
    }

    it("junior with GUIDANCE+SCOUT+CLUB has no warnings", () => {
      const subjects = [
        mkActivity("GUIDANCE"),
        mkActivity("SCOUT"),
        mkActivity("CLUB"),
      ];
      expect(validateActivityCoverage(1, subjects).warnings).toHaveLength(0);
    });

    it("junior missing CLUB warns about CLUB", () => {
      const subjects = [mkActivity("GUIDANCE"), mkActivity("SCOUT")];
      const { warnings } = validateActivityCoverage(2, subjects);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("CLUB");
    });

    it("junior missing SCOUT warns about SCOUT", () => {
      const subjects = [mkActivity("GUIDANCE"), mkActivity("CLUB")];
      const { warnings } = validateActivityCoverage(3, subjects);
      expect(warnings.some((w) => w.includes("SCOUT"))).toBe(true);
    });

    it("senior with GUIDANCE+CLUB has no warnings (SCOUT/SOCIAL_SERVICE optional)", () => {
      const subjects = [mkActivity("GUIDANCE"), mkActivity("CLUB")];
      expect(validateActivityCoverage(4, subjects).warnings).toHaveLength(0);
    });

    it("senior with SCOUT only warns about GUIDANCE and CLUB", () => {
      const { warnings } = validateActivityCoverage(5, [mkActivity("SCOUT")]);
      expect(warnings.some((w) => w.includes("GUIDANCE"))).toBe(true);
      expect(warnings.some((w) => w.includes("CLUB"))).toBe(true);
    });

    it("OTHER-only program still warns the full required set", () => {
      const { warnings } = validateActivityCoverage(4, [mkActivity("OTHER")]);
      expect(warnings.some((w) => w.includes("GUIDANCE"))).toBe(true);
      expect(warnings.some((w) => w.includes("CLUB"))).toBe(true);
    });

    it("zero activity subjects → single generic warning", () => {
      const { warnings } = validateActivityCoverage(1, []);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("กิจกรรมพัฒนาผู้เรียน");
    });

    it("out-of-range year returns no warnings", () => {
      expect(validateActivityCoverage(7, []).warnings).toHaveLength(0);
    });
  });
});
