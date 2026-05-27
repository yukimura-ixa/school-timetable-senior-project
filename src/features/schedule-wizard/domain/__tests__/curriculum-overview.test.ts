/**
 * Curriculum Overview Builder Tests
 *
 * The builder is thin: it delegates MOE math to validateProgramMOECredits
 * (tested elsewhere) and is responsible only for per-program display mapping
 * and the all-valid aggregate. So the MOE service is mocked here; we assert the
 * view-model shape, not the credit arithmetic.
 *
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildCurriculumOverview } from "../curriculum-overview";
import * as moeService from "@/features/program/domain/services/moe-validation.service";
import type { FullConfigData } from "@/features/config/types/config-types";

vi.mock("@/features/program/domain/services/moe-validation.service", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@/features/program/domain/services/moe-validation.service")
    >();
  return { ...actual, validateProgramMOECredits: vi.fn() };
});

const mockedValidate = vi.mocked(moeService.validateProgramMOECredits);

type ProgramArg = FullConfigData["programs"][number];

function makeProgram(overrides: Partial<ProgramArg> = {}): ProgramArg {
  return {
    ProgramID: 1,
    ProgramCode: "sci-math",
    ProgramName: "วิทย์-คณิต ม.4",
    Year: 4,
    IsActive: true,
    Track: "SCIENCE_MATH",
    Description: "",
    MinTotalCredits: 0,
    program_subject: [],
    ...overrides,
  } as ProgramArg;
}

afterEach(() => vi.resetAllMocks());

describe("buildCurriculumOverview", () => {
  it("returns an empty, valid overview when there are no programs", () => {
    const overview = buildCurriculumOverview([]);
    expect(overview.programs).toHaveLength(0);
    expect(overview.allValid).toBe(true);
  });

  it("maps each program to a view with Thai track label and validation result", () => {
    mockedValidate.mockReturnValue(
      moeService.createMOEValidationResult({
        isValid: true,
        totalCredits: 41,
        requiredCredits: 41,
        learningAreas: [
          {
            learningArea: "MATHEMATICS",
            required: 3,
            current: 3,
            isMet: true,
            deficit: 0,
          },
        ],
      }),
    );

    const overview = buildCurriculumOverview([makeProgram()]);

    expect(overview.programs).toHaveLength(1);
    const view = overview.programs[0]!;
    expect(view.programName).toBe("วิทย์-คณิต ม.4");
    expect(view.year).toBe(4);
    expect(view.trackLabel).toBe("แผนวิทย์-คณิต");
    expect(view.isValid).toBe(true);
    expect(view.totalCredits).toBe(41);
    expect(view.learningAreas[0]?.label).toBe("คณิตศาสตร์");
    expect(view.learningAreas[0]?.deficit).toBe(0);
  });

  it("aggregates allValid as false when any program fails MOE", () => {
    mockedValidate
      .mockReturnValueOnce(
        moeService.createMOEValidationResult({ isValid: true }),
      )
      .mockReturnValueOnce(
        moeService.createMOEValidationResult({
          isValid: false,
          errors: ["คณิตศาสตร์: ขาด 2 หน่วยกิต"],
        }),
      );

    const overview = buildCurriculumOverview([
      makeProgram({ ProgramID: 1 }),
      makeProgram({ ProgramID: 2, ProgramName: "ศิลป์-ภาษา ม.4" }),
    ]);

    expect(overview.allValid).toBe(false);
    expect(overview.programs[1]?.isValid).toBe(false);
    expect(overview.programs[1]?.errors).toContain("คณิตศาสตร์: ขาด 2 หน่วยกิต");
  });

  it("calls the MOE validator with each program's year, subjects, and track", () => {
    mockedValidate.mockReturnValue(
      moeService.createMOEValidationResult({ isValid: true }),
    );

    buildCurriculumOverview([makeProgram({ Year: 4, Track: "LANGUAGE_ARTS" })]);

    expect(mockedValidate).toHaveBeenCalledWith(4, [], "LANGUAGE_ARTS");
  });
});
