import { describe, it, expect } from "vitest";
import {
  calculateTeachHour,
  validateResponsibilityInput,
  computeResponsibilitiesDiff,
  expandAvailableSlots,
  validateSemester,
  hasResponsibilityConflict,
  calculateTotalTeachHours,
  calculateTotalAssignedSlots,
} from "./assign-validation.service";

type Resp = {
  RespID: number;
  TeacherID: number;
  SubjectCode: string;
  GradeID: string;
  AcademicYear: number;
  Semester: "SEMESTER_1" | "SEMESTER_2";
  TeachHour: number;
};

function makeResp(overrides: Partial<Resp> = {}): Resp {
  return {
    RespID: 1,
    TeacherID: 1,
    SubjectCode: "MATH101",
    GradeID: "M1-1",
    AcademicYear: 2567,
    Semester: "SEMESTER_1",
    TeachHour: 4,
    ...overrides,
  };
}

describe("calculateTeachHour", () => {
  it("returns 1 for credit 0.5", () => {
    expect(calculateTeachHour("0.5")).toBe(1);
  });

  it("returns 2 for credit 1.0", () => {
    expect(calculateTeachHour("1.0")).toBe(2);
  });

  it("returns 3 for credit 1.5", () => {
    expect(calculateTeachHour("1.5")).toBe(3);
  });

  it("returns 4 for credit 2.0", () => {
    expect(calculateTeachHour("2.0")).toBe(4);
  });

  it("returns 5 for credit 2.5", () => {
    expect(calculateTeachHour("2.5")).toBe(5);
  });

  it("returns 6 for credit 3.0", () => {
    expect(calculateTeachHour("3.0")).toBe(6);
  });

  it("throws on invalid credit value", () => {
    expect(() => calculateTeachHour("4.0")).toThrow("Invalid credit value: 4.0");
  });
});

describe("validateResponsibilityInput", () => {
  it("returns valid for correct input", () => {
    const result = validateResponsibilityInput({
      SubjectCode: "MATH101",
      GradeID: "M1-1",
      Credit: "1.0",
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for empty SubjectCode", () => {
    const result = validateResponsibilityInput({
      SubjectCode: "",
      GradeID: "M1-1",
      Credit: "1.0",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("SubjectCode is required");
  });

  it("returns error for SubjectCode exceeding 20 characters", () => {
    const result = validateResponsibilityInput({
      SubjectCode: "A".repeat(21),
      GradeID: "M1-1",
      Credit: "1.0",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("SubjectCode must be at most 20 characters");
  });

  it("returns error for invalid GradeID missing M prefix", () => {
    const result = validateResponsibilityInput({
      SubjectCode: "MATH101",
      GradeID: "1-1",
      Credit: "1.0",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("GradeID"))).toBe(true);
  });

  it("returns error for GradeID with no dash", () => {
    const result = validateResponsibilityInput({
      SubjectCode: "MATH101",
      GradeID: "M11",
      Credit: "1.0",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("GradeID"))).toBe(true);
  });

  it("returns error for GradeID with letters after M", () => {
    const result = validateResponsibilityInput({
      SubjectCode: "MATH101",
      GradeID: "Ma-1",
      Credit: "1.0",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("GradeID"))).toBe(true);
  });

  it("returns error for invalid credit value", () => {
    const result = validateResponsibilityInput({
      SubjectCode: "MATH101",
      GradeID: "M1-1",
      Credit: "9.9" as "0.5",
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Invalid credit value"))).toBe(true);
  });
});

describe("computeResponsibilitiesDiff", () => {
  it("marks all incoming without RespID as toCreate", () => {
    const existing = [makeResp({ RespID: 1 })];
    const incoming = [
      { SubjectCode: "SCI201", GradeID: "M2-1", Credit: "1.5" as const },
      { SubjectCode: "ENG301", GradeID: "M3-1", Credit: "1.0" as const },
    ];
    const diff = computeResponsibilitiesDiff(existing, incoming);
    expect(diff.toCreate).toHaveLength(2);
    expect(diff.toDelete).toHaveLength(1);
  });

  it("marks existing not referenced in incoming as toDelete", () => {
    const existing = [makeResp({ RespID: 1 }), makeResp({ RespID: 2, SubjectCode: "SCI201" })];
    const incoming = [{ RespID: 1, SubjectCode: "MATH101", GradeID: "M1-1", Credit: "2.0" as const }];
    const diff = computeResponsibilitiesDiff(existing, incoming);
    expect(diff.toCreate).toHaveLength(0);
    expect(diff.toDelete).toHaveLength(1);
    expect(diff.toDelete[0]!.RespID).toBe(2);
  });

  it("handles mixed create and delete", () => {
    const existing = [makeResp({ RespID: 1 }), makeResp({ RespID: 2 })];
    const incoming = [
      { RespID: 1, SubjectCode: "MATH101", GradeID: "M1-1", Credit: "2.0" as const },
      { SubjectCode: "NEW101", GradeID: "M1-2", Credit: "1.0" as const },
    ];
    const diff = computeResponsibilitiesDiff(existing, incoming);
    expect(diff.toCreate).toHaveLength(1);
    expect(diff.toCreate[0]!.SubjectCode).toBe("NEW101");
    expect(diff.toDelete).toHaveLength(1);
    expect(diff.toDelete[0]!.RespID).toBe(2);
  });

  it("returns empty arrays when both inputs are empty", () => {
    const diff = computeResponsibilitiesDiff([], []);
    expect(diff.toCreate).toHaveLength(0);
    expect(diff.toDelete).toHaveLength(0);
  });
});

describe("expandAvailableSlots", () => {
  const baseResp = {
    RespID: 1,
    TeacherID: 10,
    SubjectCode: "MATH101",
    GradeID: "M1-1",
    AcademicYear: 2567,
    Semester: "SEMESTER_1" as const,
    TeachHour: 4,
    subject: { SubjectName: "Mathematics", Credit: "CREDIT_20" as const, Category: "CORE" as const },
    gradelevel: { Year: 1, Number: 1 },
  };

  it("creates correct number of available slots", () => {
    const resps = [{ ...baseResp, class_schedule: [{}, {}] }];
    const slots = expandAvailableSlots(resps);
    expect(slots).toHaveLength(2);
    expect(slots[0]!.itemID).toBe(1);
    expect(slots[1]!.itemID).toBe(2);
    expect(slots[0]!.SubjectCode).toBe("MATH101");
  });

  it("returns empty array when fully assigned", () => {
    const resps = [{ ...baseResp, class_schedule: [{}, {}, {}, {}] }];
    const slots = expandAvailableSlots(resps);
    expect(slots).toHaveLength(0);
  });

  it("sequences itemID across multiple responsibilities", () => {
    const resps = [
      { ...baseResp, RespID: 1, TeachHour: 3, class_schedule: [{}] },
      { ...baseResp, RespID: 2, SubjectCode: "SCI201", TeachHour: 2, class_schedule: [] },
    ];
    const slots = expandAvailableSlots(resps);
    expect(slots).toHaveLength(4);
    expect(slots.map((s) => s.itemID)).toEqual([1, 2, 3, 4]);
    expect(slots[0]!.RespID).toBe(1);
    expect(slots[2]!.RespID).toBe(2);
  });
});

describe("validateSemester", () => {
  it("returns true for SEMESTER_1", () => {
    expect(validateSemester("SEMESTER_1")).toBe(true);
  });

  it("returns true for SEMESTER_2", () => {
    expect(validateSemester("SEMESTER_2")).toBe(true);
  });

  it("returns false for invalid semester", () => {
    expect(validateSemester("SEMESTER_3")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(validateSemester("")).toBe(false);
  });

  it("returns false for lowercase", () => {
    expect(validateSemester("semester_1")).toBe(false);
  });
});

describe("hasResponsibilityConflict", () => {
  it("returns false when no conflict", () => {
    const input = { SubjectCode: "ENG101", GradeID: "M1-1", Credit: "1.0" as const };
    const existing = [makeResp({ RespID: 1, SubjectCode: "MATH101", GradeID: "M1-1" })];
    expect(hasResponsibilityConflict(input, existing)).toBe(false);
  });

  it("returns true when conflict exists", () => {
    const input = { SubjectCode: "MATH101", GradeID: "M1-1", Credit: "1.0" as const };
    const existing = [makeResp({ RespID: 5, SubjectCode: "MATH101", GradeID: "M1-1" })];
    expect(hasResponsibilityConflict(input, existing)).toBe(true);
  });

  it("returns false when same RespID (same record)", () => {
    const input = { RespID: 5, SubjectCode: "MATH101", GradeID: "M1-1", Credit: "1.0" as const };
    const existing = [makeResp({ RespID: 5, SubjectCode: "MATH101", GradeID: "M1-1" })];
    expect(hasResponsibilityConflict(input, existing)).toBe(false);
  });
});

describe("calculateTotalTeachHours", () => {
  it("sums TeachHour values", () => {
    const resps = [{ TeachHour: 4 }, { TeachHour: 2 }, { TeachHour: 6 }];
    expect(calculateTotalTeachHours(resps)).toBe(12);
  });

  it("returns 0 for empty array", () => {
    expect(calculateTotalTeachHours([])).toBe(0);
  });
});

describe("calculateTotalAssignedSlots", () => {
  it("sums class_schedule lengths", () => {
    const resps = [{ class_schedule: [{}, {}, {}] }, { class_schedule: [{}] }];
    expect(calculateTotalAssignedSlots(resps)).toBe(4);
  });

  it("returns 0 for empty array", () => {
    expect(calculateTotalAssignedSlots([])).toBe(0);
  });
});
