import { vi, describe, it, expect, beforeEach } from "vitest";
import { LearningArea, SubjectCategory } from "@/prisma/generated/client";

vi.mock("@/config/moe-standards", () => ({
  getTrackElectives: vi.fn(() => []),
}));

import {
  MOE_MIN_CREDITS,
  calculateLearningAreaCredits,
  getLearningAreaNameThai,
  validateMandatorySubjects,
  validateProgramMOECredits,
  validateTrackElectives,
  generateMOEComplianceReport,
} from "./moe-validation.service";
import { getTrackElectives } from "@/config/moe-standards";

const mockGetTrackElectives = getTrackElectives as ReturnType<typeof vi.fn>;

const makeProgramSubject = (overrides: Record<string, unknown> = {}) => ({
  ProgramSubjectID: 1,
  ProgramID: 1,
  SubjectCode: "MATH101",
  MinCredits: 3,
  MaxCredits: 5,
  IsMandatory: true,
  Category: SubjectCategory.CORE,
  subject: {
    SubjectCode: "MATH101",
    SubjectName: "คณิตศาสตร์",
    Credit: "CREDIT_15",
    LearningArea: LearningArea.MATHEMATICS,
    Category: SubjectCategory.CORE,
    SubjectName_EN: null,
    Department: null,
  },
  ...overrides,
});

describe("MOE_MIN_CREDITS", () => {
  it("has correct junior Thai requirement", () => {
    expect(MOE_MIN_CREDITS.THAI.junior).toBe(5);
  });

  it("has correct senior Thai requirement", () => {
    expect(MOE_MIN_CREDITS.THAI.senior).toBe(3);
  });

  it("covers all 8 learning areas", () => {
    expect(Object.keys(MOE_MIN_CREDITS)).toHaveLength(8);
  });
});

describe("calculateLearningAreaCredits", () => {
  it("sums MinCredits for matching learning area", () => {
    const subjects = [
      makeProgramSubject({ MinCredits: 3 }),
      makeProgramSubject({
        ProgramSubjectID: 2,
        SubjectCode: "MATH201",
        MinCredits: 2,
        subject: {
          ...makeProgramSubject().subject,
          SubjectCode: "MATH201",
          LearningArea: LearningArea.MATHEMATICS,
        },
      }),
    ];
    expect(
      calculateLearningAreaCredits(subjects as never[], LearningArea.MATHEMATICS),
    ).toBe(5);
  });

  it("excludes ACTIVITY category", () => {
    const subjects = [
      makeProgramSubject({
        MinCredits: 3,
        Category: SubjectCategory.ACTIVITY,
        subject: {
          ...makeProgramSubject().subject,
          Category: SubjectCategory.ACTIVITY,
        },
      }),
    ];
    expect(
      calculateLearningAreaCredits(subjects as never[], LearningArea.MATHEMATICS),
    ).toBe(0);
  });

  it("returns 0 for non-matching learning area", () => {
    const subjects = [makeProgramSubject()];
    expect(
      calculateLearningAreaCredits(subjects as never[], LearningArea.THAI),
    ).toBe(0);
  });
});

describe("getLearningAreaNameThai", () => {
  it("returns ภาษาไทย for THAI", () => {
    expect(getLearningAreaNameThai(LearningArea.THAI)).toBe("ภาษาไทย");
  });

  it("returns คณิตศาสตร์ for MATHEMATICS", () => {
    expect(getLearningAreaNameThai(LearningArea.MATHEMATICS)).toBe(
      "คณิตศาสตร์",
    );
  });

  it("returns วิทยาศาสตร์ for SCIENCE", () => {
    expect(getLearningAreaNameThai(LearningArea.SCIENCE)).toBe("วิทยาศาสตร์");
  });

  it("returns สังคมศึกษา ศาสนา และวัฒนธรรม for SOCIAL", () => {
    expect(getLearningAreaNameThai(LearningArea.SOCIAL)).toBe(
      "สังคมศึกษา ศาสนา และวัฒนธรรม",
    );
  });

  it("returns a name for all 8 learning areas", () => {
    for (const la of Object.values(LearningArea)) {
      expect(getLearningAreaNameThai(la)).toBeTruthy();
    }
  });
});

describe("validateMandatorySubjects", () => {
  it("passes when mandatory CORE subject exists", () => {
    const subjects = [
      makeProgramSubject({ IsMandatory: true, Category: SubjectCategory.CORE }),
    ];
    const result = validateMandatorySubjects(subjects as never[]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when no CORE subjects", () => {
    const subjects = [
      makeProgramSubject({
        IsMandatory: true,
        Category: SubjectCategory.ADDITIONAL,
      }),
    ];
    const result = validateMandatorySubjects(subjects as never[]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it("fails when empty array", () => {
    const result = validateMandatorySubjects([]);
    expect(result.isValid).toBe(false);
  });
});

describe("validateProgramMOECredits", () => {
  it("rejects year 0", () => {
    const result = validateProgramMOECredits(0, []);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("1-6");
  });

  it("rejects year 7", () => {
    const result = validateProgramMOECredits(7, []);
    expect(result.isValid).toBe(false);
  });

  it("uses junior requirements for year 1", () => {
    const result = validateProgramMOECredits(1, []);
    const mathArea = result.learningAreas.find(
      (la) => la.learningArea === LearningArea.MATHEMATICS,
    );
    expect(mathArea!.required).toBe(5);
  });

  it("uses senior requirements for year 4", () => {
    const result = validateProgramMOECredits(4, []);
    const mathArea = result.learningAreas.find(
      (la) => la.learningArea === LearningArea.MATHEMATICS,
    );
    expect(mathArea!.required).toBe(3);
  });

  it("returns isValid true when all areas meet requirements", () => {
    const subjects = Object.entries(MOE_MIN_CREDITS).map(
      ([area, req], idx) =>
        makeProgramSubject({
          ProgramSubjectID: idx + 1,
          SubjectCode: `SUB${idx}`,
          MinCredits: req.senior,
          subject: {
            ...makeProgramSubject().subject,
            SubjectCode: `SUB${idx}`,
            LearningArea: area,
          },
        }),
    );
    subjects.push(
      makeProgramSubject({
        ProgramSubjectID: 100,
        SubjectCode: "ACT01",
        MinCredits: 0,
        Category: SubjectCategory.ACTIVITY,
        subject: {
          ...makeProgramSubject().subject,
          SubjectCode: "ACT01",
          Category: SubjectCategory.ACTIVITY,
          LearningArea: null,
        },
      }),
    );
    const result = validateProgramMOECredits(4, subjects as never[]);
    expect(result.isValid).toBe(true);
  });

  it("returns errors when credits are insufficient", () => {
    const subjects = [
      makeProgramSubject({ MinCredits: 1 }),
    ];
    const result = validateProgramMOECredits(1, subjects as never[]);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("warns when no ACTIVITY subjects", () => {
    const result = validateProgramMOECredits(1, []);
    expect(result.warnings.some((w) => w.includes("กิจกรรม"))).toBe(true);
  });

  it("checks all 8 learning areas", () => {
    const result = validateProgramMOECredits(1, []);
    expect(result.learningAreas).toHaveLength(8);
  });

  it("calculates correct deficit", () => {
    const result = validateProgramMOECredits(1, []);
    const mathArea = result.learningAreas.find(
      (la) => la.learningArea === LearningArea.MATHEMATICS,
    );
    expect(mathArea!.deficit).toBe(5);
    expect(mathArea!.isMet).toBe(false);
  });
});

describe("validateTrackElectives", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty errors for GENERAL track", () => {
    const result = validateTrackElectives("GENERAL", 4, []);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("checks track electives for non-GENERAL tracks", () => {
    mockGetTrackElectives.mockReturnValue([
      { group: "คณิตศาสตร์", minCredits: 6 },
      { group: "วิทยาศาสตร์", minCredits: 6 },
    ]);
    const result = validateTrackElectives("SCIENCE_MATH", 4, []);
    expect(result.errors.length + result.warnings.length).toBeGreaterThan(0);
  });
});

describe("generateMOEComplianceReport", () => {
  it("generates a report containing program name", () => {
    const report = generateMOEComplianceReport("โปรแกรมทดสอบ", 1, []);
    expect(report).toContain("โปรแกรมทดสอบ");
  });

  it("includes learning area statuses", () => {
    const report = generateMOEComplianceReport("Test", 1, []);
    expect(report).toContain("ภาษาไทย");
    expect(report).toContain("คณิตศาสตร์");
  });

  it("shows non-compliance for empty program", () => {
    const report = generateMOEComplianceReport("Test", 1, []);
    expect(report).toContain("ไม่สอดคล้อง");
  });
});
