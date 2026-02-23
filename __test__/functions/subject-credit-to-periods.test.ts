/**
 * Tests for the credit enum → periods conversion used in auto-arrange.
 *
 * This verifies that the fix for the critical NaN bug works correctly:
 * `subject_credit` enum values like "CREDIT_15" must be converted to numbers
 * via `subjectCreditToNumber`, not `Number()`.
 */
import { describe, expect, it } from "vitest";

import { subjectCreditToNumber } from "@/features/teaching-assignment/domain/utils/subject-credit";

describe("subjectCreditToNumber → periodsPerWeek", () => {
  const cases: [string, number, number][] = [
    // [creditEnum, expectedCredit, expectedPeriods]
    ["CREDIT_05", 0.5, 1],
    ["CREDIT_10", 1.0, 1],
    ["CREDIT_15", 1.5, 2],
    ["CREDIT_20", 2.0, 2],
  ];

  it.each(cases)(
    "%s → credit=%s → periodsPerWeek=%s",
    (creditEnum, expectedCredit, expectedPeriods) => {
      const credit = subjectCreditToNumber(creditEnum);
      expect(credit).toBe(expectedCredit);

      const periodsPerWeek = Math.ceil(credit);
      expect(periodsPerWeek).toBe(expectedPeriods);
    },
  );

  it("demonstrates the bug: Number(enum) returns NaN", () => {
    // This is the old broken code path
    const broken = Number("CREDIT_15");
    expect(broken).toBeNaN();

    // Math.ceil(NaN) is NaN
    expect(Math.ceil(broken)).toBeNaN();

    // NaN > 0 is false, so all subjects would be filtered out
    expect(broken > 0).toBe(false);
  });

  it("handles fallback for unknown values gracefully", () => {
    const credit = subjectCreditToNumber("UNKNOWN_VALUE");
    expect(credit).toBe(0);

    const periodsPerWeek = Math.ceil(credit);
    expect(periodsPerWeek).toBe(0);
  });
});
