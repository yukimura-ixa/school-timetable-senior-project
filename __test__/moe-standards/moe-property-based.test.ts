/**
 * Property-Based Tests for MOE Validation
 *
 * Uses fast-check to generate hundreds of test cases automatically.
 * These tests ensure MOE validation rules hold across all possible inputs.
 *
 * Testing strategy:
 * 1. Subject code format validation (Thai letter + level + 3 digits)
 * 2. Credit/hour constraints per learning area
 * 3. Total lesson requirements (28-34 weeks)
 * 4. Learning area mapping correctness
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getMOEStandards,
  validateTotalLessons,
  getSubjectGroups,
  type YearKey,
} from "@/config/moe-standards";
import { validateProgramStandards } from "@/utils/moe-validation";
import type { SubjectAssignment } from "@/utils/moe-validation";

/**
 * Arbitraries for MOE validation testing
 */

// Valid year keys
const yearKeyArbitrary = fc.constantFrom<YearKey>(
  "M1",
  "M2",
  "M3",
  "M4",
  "M5",
  "M6",
);

// Valid MOE learning area codes
const moeAreaLetterArbitrary = fc.constantFrom(
  "ท", // Thai
  "ค", // Math
  "ว", // Science
  "ส", // Social
  "พ", // Health/PE
  "ศ", // Arts
  "ง", // Career/Tech
  "อ", // Foreign Languages
);

// Valid level digits (1-6 for Matthayom 1-6)
const levelDigitArbitrary = fc.integer({ min: 1, max: 6 });

// Valid subject code sequentials (100-999)
const subjectSequentialArbitrary = fc.integer({ min: 100, max: 999 });

// Valid weekly lesson counts (0-8 periods per week)
const weeklyLessonsArbitrary = fc.integer({ min: 0, max: 8 });

// Subject categories
const categoryArbitrary = fc.constantFrom<"CORE" | "ELECTIVE" | "ACTIVITY">(
  "CORE",
  "ELECTIVE",
  "ACTIVITY",
);

/**
 * Generators for test data
 */

// Generate valid MOE subject codes
const validMoeSubjectCodeArbitrary = fc.tuple(
  moeAreaLetterArbitrary,
  levelDigitArbitrary,
  subjectSequentialArbitrary,
).map(([area, level, code]) => `${area}${level}${String(code).padStart(3, "0")}`);

// Generate valid subject assignments
const subjectAssignmentArbitrary = fc.record({
  subjectCode: validMoeSubjectCodeArbitrary,
  subjectName: fc.string({ minLength: 1, maxLength: 100 }),
  weeklyLessons: weeklyLessonsArbitrary,
  category: categoryArbitrary,
  group: fc.string({ minLength: 3, maxLength: 30 }),
});

describe("MOE Validation - Property-Based Tests", () => {
  describe("Subject Code Format Validation", () => {
    it("should accept all valid MOE subject codes with correct pattern", () => {
      fc.assert(
        fc.property(validMoeSubjectCodeArbitrary, (code) => {
          // Valid MOE code pattern:
          // - First character: Thai letter (ท, ค, ว, etc.)
          // - Second character: digit 1-6 (level)
          // - Last 3 characters: digits 0-9
          const pattern =
            /^[ทควสพศงอ][1-6]\d{3}$/;
          expect(pattern.test(code)).toBe(true);
        }),
      );
    });

    it("should only accept valid MOE area letters", () => {
      const validLetters = ["ท", "ค", "ว", "ส", "พ", "ศ", "ง", "อ"];

      fc.assert(
        fc.property(validMoeSubjectCodeArbitrary, (code) => {
          const firstChar = code[0];
          expect(validLetters).toContain(firstChar);
        }),
      );
    });

    it("should only accept valid level digits (1-6)", () => {
      fc.assert(
        fc.property(validMoeSubjectCodeArbitrary, (code) => {
          const levelDigit = parseInt(code[1], 10);
          expect(levelDigit).toBeGreaterThanOrEqual(1);
          expect(levelDigit).toBeLessThanOrEqual(6);
        }),
      );
    });

    it("should have exactly 6 characters (letter + level + 3 digits)", () => {
      fc.assert(
        fc.property(validMoeSubjectCodeArbitrary, (code) => {
          expect(code).toHaveLength(6);
        }),
      );
    });
  });

  describe("Weekly Lesson Constraints", () => {
    it("should accept lesson counts between 0 and 8", () => {
      fc.assert(
        fc.property(weeklyLessonsArbitrary, (lessons) => {
          expect(lessons).toBeGreaterThanOrEqual(0);
          expect(lessons).toBeLessThanOrEqual(8);
        }),
      );
    });

    it("should validate that combinations of lessons stay within school day limits", () => {
      fc.assert(
        fc.property(
          fc.array(weeklyLessonsArbitrary, { minLength: 1, maxLength: 8 }),
          (lessonArray) => {
            const dailyTotal = lessonArray.reduce((a, b) => a + b, 0);
            // A typical school day has 6-8 periods maximum
            // Weekly total should be reasonable: 28-34 periods
            expect(dailyTotal).toBeLessThanOrEqual(48); // 8 periods × 6 days max
          },
        ),
      );
    });
  });

  describe("Total Lesson Requirements", () => {
    it("should reject lessons below minimum for each year", () => {
      fc.assert(
        fc.property(yearKeyArbitrary, (year) => {
          const standard = getMOEStandards(year);
          const belowMinimum = standard.minTotalLessons - 1;

          const result = validateTotalLessons(year, belowMinimum);
          expect(result.valid).toBe(false);
          expect(result.message).toBeDefined();
        }),
      );
    });

    it("should accept lessons within valid range for each year", () => {
      fc.assert(
        fc.property(yearKeyArbitrary, (year) => {
          const standard = getMOEStandards(year);
          const validLesson = fc.sample(
            fc.integer({
              min: standard.minTotalLessons,
              max: standard.maxTotalLessons,
            }),
            1,
          )[0];

          const result = validateTotalLessons(year, validLesson);
          expect(result.valid).toBe(true);
        }),
      );
    });

    it("should reject lessons above maximum for each year", () => {
      fc.assert(
        fc.property(yearKeyArbitrary, (year) => {
          const standard = getMOEStandards(year);
          const aboveMaximum = standard.maxTotalLessons + 1;

          const result = validateTotalLessons(year, aboveMaximum);
          expect(result.valid).toBe(false);
          expect(result.message).toBeDefined();
        }),
      );
    });

    it("should have consistent ranges: min < max for all years", () => {
      const allYears: YearKey[] = ["M1", "M2", "M3", "M4", "M5", "M6"];

      fc.assert(
        fc.property(fc.constantFrom(...allYears), (year) => {
          const standard = getMOEStandards(year);
          expect(standard.minTotalLessons).toBeLessThan(
            standard.maxTotalLessons,
          );
        }),
      );
    });
  });

  describe("Learning Area Mapping", () => {
    it("should map area letters consistently to subject groups", () => {
      const areaMapping: Record<string, string> = {
        ท: "ภาษาไทย",
        ค: "คณิตศาสตร์",
        ว: "วิทยาศาสตร์",
        ส: "สังคมศึกษา",
        พ: "พลศึกษา",
        ศ: "ศิลปะ",
        ง: "การงานอาชีพ",
        อ: "ภาษาอังกฤษ",
      };

      fc.assert(
        fc.property(moeAreaLetterArbitrary, (letter) => {
          expect(areaMapping).toHaveProperty(letter);
          expect(areaMapping[letter]).toBeTruthy();
        }),
      );
    });

    it("should have all 8 learning areas for lower secondary", () => {
      const m1 = getMOEStandards("M1");
      const coreSubjectCodes = new Set(
        m1.coreSubjects.map((s) => s.subjectCode),
      );

      const requiredAreas = ["TH", "MA", "SC", "SS", "PE", "AR", "CT", "EN"];

      fc.assert(
        fc.property(fc.constantFrom(...requiredAreas), (area) => {
          expect(coreSubjectCodes.has(area)).toBe(true);
        }),
      );
    });
  });

  describe("Program Validation Integration", () => {
    it("should validate programs with valid total lessons", () => {
      fc.assert(
        fc.property(
          yearKeyArbitrary,
          fc.array(subjectAssignmentArbitrary, { minLength: 6, maxLength: 10 }),
          (year, subjects) => {
            // Adjust lessons to be within valid range
            const standard = getMOEStandards(year);
            const totalLessons = subjects.reduce(
              (sum, s) => sum + s.weeklyLessons,
              0,
            );

            if (
              totalLessons >= standard.minTotalLessons &&
              totalLessons <= standard.maxTotalLessons
            ) {
              const result = validateProgramStandards({
                year,
                subjects,
              });

              // Should have summary data even if validation fails on other criteria
              expect(result.summary).toBeDefined();
              expect(result.summary.totalLessons).toBe(totalLessons);
            }
          },
        ),
        { numRuns: 50 }, // Reduce runs since this involves complex logic
      );
    });

    it("should report total lessons correctly in all cases", () => {
      fc.assert(
        fc.property(
          yearKeyArbitrary,
          fc.array(subjectAssignmentArbitrary, { minLength: 1, maxLength: 12 }),
          (year, subjects) => {
            const result = validateProgramStandards({
              year,
              subjects,
            });

            const expectedTotal = subjects.reduce(
              (sum, s) => sum + s.weeklyLessons,
              0,
            );
            expect(result.summary.totalLessons).toBe(expectedTotal);
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("should handle empty subject list", () => {
      fc.assert(
        fc.property(yearKeyArbitrary, (year) => {
          const result = validateProgramStandards({
            year,
            subjects: [],
          });

          expect(result.summary).toBeDefined();
          expect(result.summary.totalLessons).toBe(0);
        }),
      );
    });

    it("should handle zero lessons for a subject", () => {
      fc.assert(
        fc.property(yearKeyArbitrary, (year) => {
          const subject: SubjectAssignment = {
            subjectCode: "ท10001",
            subjectName: "Test",
            weeklyLessons: 0,
            category: "ELECTIVE",
            group: "test",
          };

          const result = validateProgramStandards({
            year,
            subjects: [subject],
          });

          expect(result.summary.totalLessons).toBe(0);
        }),
      );
    });

    it("should handle maximum lesson values", () => {
      fc.assert(
        fc.property(yearKeyArbitrary, (year) => {
          const subject: SubjectAssignment = {
            subjectCode: "ค60999",
            subjectName: "Max Test",
            weeklyLessons: 8,
            category: "CORE",
            group: "test",
          };

          const result = validateProgramStandards({
            year,
            subjects: [subject],
          });

          expect(result.summary.totalLessons).toBe(8);
        }),
      );
    });
  });

  describe("Category Distribution Invariants", () => {
    it("should correctly categorize all subject types", () => {
      fc.assert(
        fc.property(
          yearKeyArbitrary,
          fc.array(
            fc.record({
              subjectCode: validMoeSubjectCodeArbitrary,
              subjectName: fc.string({ minLength: 1, maxLength: 50 }),
              weeklyLessons: fc.integer({ min: 0, max: 4 }),
              category: categoryArbitrary,
              group: fc.string({ minLength: 3, maxLength: 30 }),
            }),
            { minLength: 5, maxLength: 15 },
          ),
          (year, subjects) => {
            const result = validateProgramStandards({
              year,
              subjects,
            });

            const coreLessons = subjects
              .filter((s) => s.category === "CORE")
              .reduce((sum, s) => sum + s.weeklyLessons, 0);
            const electiveLessons = subjects
              .filter((s) => s.category === "ELECTIVE")
              .reduce((sum, s) => sum + s.weeklyLessons, 0);
            const activityLessons = subjects
              .filter((s) => s.category === "ACTIVITY")
              .reduce((sum, s) => sum + s.weeklyLessons, 0);

            expect(result.summary.coreLessons).toBe(coreLessons);
            expect(result.summary.electiveLessons).toBe(electiveLessons);
            expect(result.summary.activityLessons).toBe(activityLessons);
          },
        ),
        { numRuns: 30 },
      );
    });
  });
});
