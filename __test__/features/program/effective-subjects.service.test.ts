import { describe, it, expect } from "vitest";
import {
  getEffectiveProgramSubjects,
  toProgramSubjectShape,
} from "@/features/program/domain/services/effective-subjects.service";
import type {
  grade_fundamental,
  program_fundamental_override,
  program_subject,
  subject,
} from "@/prisma/generated/client";

const subj = (code: string, category = "CORE"): subject =>
  ({
    SubjectCode: code,
    SubjectName: code,
    Credit: "CREDIT_10",
    ActivityType: null,
    Description: null,
    IsGraded: true,
    LearningArea: "THAI",
    Category: category,
  } as unknown as subject);

const tmpl = (
  id: number,
  code: string,
  min: number,
  sort: number,
): grade_fundamental & { subject: subject } =>
  ({
    GradeFundamentalID: id,
    Year: 4,
    SubjectCode: code,
    MinCredits: min,
    MaxCredits: null,
    SortOrder: sort,
    subject: subj(code),
  } as unknown as grade_fundamental & { subject: subject });

const owned = (
  id: number,
  code: string,
  category: string,
  min: number,
  sort: number,
): program_subject & { subject: subject } =>
  ({
    ProgramSubjectID: id,
    ProgramID: 1,
    SubjectCode: code,
    Category: category,
    IsMandatory: category !== "ACTIVITY",
    MinCredits: min,
    MaxCredits: null,
    SortOrder: sort,
    subject: subj(code, category),
  } as unknown as program_subject & { subject: subject });

describe("getEffectiveProgramSubjects", () => {
  it("emits template rows as INHERITED CORE with synthetic mandatory flag", () => {
    const result = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [],
      programSubjects: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      SubjectCode: "ท31101",
      source: "INHERITED",
      Category: "CORE",
      IsMandatory: true,
      MinCredits: 1.0,
      overridden: false,
      ProgramSubjectID: -10,
      ProgramID: 1,
    });
  });

  it("skips an excluded template row", () => {
    const result = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [
        {
          ProgramFundamentalOverrideID: 1,
          ProgramID: 1,
          SubjectCode: "ท31101",
          Excluded: true,
          MinCredits: null,
          MaxCredits: null,
        } as program_fundamental_override,
      ],
      programSubjects: [],
    });
    expect(result).toHaveLength(0);
  });

  it("applies a credit override and marks overridden", () => {
    const result = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [
        {
          ProgramFundamentalOverrideID: 1,
          ProgramID: 1,
          SubjectCode: "ท31101",
          Excluded: false,
          MinCredits: 0.5,
          MaxCredits: null,
        } as program_fundamental_override,
      ],
      programSubjects: [],
    });
    expect(result[0]).toMatchObject({ MinCredits: 0.5, overridden: true });
  });

  it("emits owned rows and lets OWNED win the dedupe", () => {
    const result = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [],
      programSubjects: [
        owned(100, "ท31101", "CORE", 2.0, 1), // same code as template
        owned(101, "ค31201", "ADDITIONAL", 1.5, 2),
      ],
    });
    const byCode = Object.fromEntries(result.map((r) => [r.SubjectCode, r]));
    expect(result).toHaveLength(2); // template row suppressed by owned
    expect(byCode["ท31101"]).toMatchObject({ source: "OWNED", MinCredits: 2.0 });
    expect(byCode["ค31201"]).toMatchObject({ source: "OWNED", Category: "ADDITIONAL" });
  });

  it("returns empty for an empty template and no owned rows", () => {
    expect(
      getEffectiveProgramSubjects({
        programId: 1,
        year: 2,
        template: [],
        overrides: [],
        programSubjects: [],
      }),
    ).toEqual([]);
  });

  it("toProgramSubjectShape strips seam metadata to the validator shape", () => {
    const eff = getEffectiveProgramSubjects({
      programId: 1,
      year: 4,
      template: [tmpl(10, "ท31101", 1.0, 1)],
      overrides: [],
      programSubjects: [owned(101, "ค31201", "ADDITIONAL", 1.5, 2)],
    });
    const shaped = toProgramSubjectShape(eff);
    expect(shaped[0]).not.toHaveProperty("source");
    expect(shaped[0]).not.toHaveProperty("overridden");
    expect(shaped[0]).toHaveProperty("IsMandatory");
    expect(shaped[0]).toHaveProperty("subject");
  });
});
