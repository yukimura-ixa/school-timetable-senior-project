/**
 * Tests for grade-display utility functions
 *
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";

import {
  extractGradeLevel,
  formatGradeDisplay,
  formatGradeIdDisplay,
  parseGradeId,
} from "@/utils/grade-display";

describe("extractGradeLevel", () => {
  it("extracts M1 from M1-1", () => {
    expect(extractGradeLevel("M1-1")).toBe("M1");
  });

  it("extracts M1 from M1-3", () => {
    expect(extractGradeLevel("M1-3")).toBe("M1");
  });

  it("extracts M2 from M2-5", () => {
    expect(extractGradeLevel("M2-5")).toBe("M2");
  });

  it("extracts M6 from M6-15", () => {
    expect(extractGradeLevel("M6-15")).toBe("M6");
  });

  it("returns original string for unexpected format", () => {
    expect(extractGradeLevel("INVALID")).toBe("INVALID");
  });

  it("returns original string for empty string", () => {
    expect(extractGradeLevel("")).toBe("");
  });

  it("same grade level sections match", () => {
    const level1 = extractGradeLevel("M1-1");
    const level2 = extractGradeLevel("M1-2");
    const level3 = extractGradeLevel("M1-10");
    expect(level1).toBe(level2);
    expect(level2).toBe(level3);
  });

  it("different grade levels do not match", () => {
    const m1 = extractGradeLevel("M1-1");
    const m2 = extractGradeLevel("M2-1");
    const m3 = extractGradeLevel("M3-1");
    expect(m1).not.toBe(m2);
    expect(m2).not.toBe(m3);
  });
});

describe("formatGradeDisplay", () => {
  it('formats year 1 section 1 as "ม.1/1"', () => {
    expect(formatGradeDisplay(1, 1)).toBe("ม.1/1");
  });

  it('formats year 6 section 15 as "ม.6/15"', () => {
    expect(formatGradeDisplay(6, 15)).toBe("ม.6/15");
  });
});

describe("formatGradeIdDisplay", () => {
  it('formats "M1-1" as "ม.1/1"', () => {
    expect(formatGradeIdDisplay("M1-1")).toBe("ม.1/1");
  });

  it('formats "M2-5" as "ม.2/5"', () => {
    expect(formatGradeIdDisplay("M2-5")).toBe("ม.2/5");
  });

  it("returns empty string for empty input", () => {
    expect(formatGradeIdDisplay("")).toBe("");
  });
});

describe("parseGradeId", () => {
  it("parses M1-1 correctly", () => {
    expect(parseGradeId("M1-1")).toEqual({ year: 1, section: 1 });
  });

  it("parses M6-15 correctly", () => {
    expect(parseGradeId("M6-15")).toEqual({ year: 6, section: 15 });
  });

  it("throws on invalid format", () => {
    expect(() => parseGradeId("INVALID")).toThrow("Invalid GradeID format");
  });
});
