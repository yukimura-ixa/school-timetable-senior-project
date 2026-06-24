/**
 * Unit Tests for MOE Standards and Validation
 */

import {
  getMOEStandards,
  getMinCoreLessons,
  getMaxCoreLessons,
  validateTotalLessons,
  getSubjectGroups,
  getTrackElectives,
  type YearKey,
} from "@/config/moe-standards";

describe("MOE Standards Configuration", () => {
  describe("getMOEStandards", () => {
    it("should return standards for all grade levels", () => {
      const years: YearKey[] = ["M1", "M2", "M3", "M4", "M5", "M6"];

      years.forEach((year) => {
        const standard = getMOEStandards(year);
        expect(standard).toBeDefined();
        expect(standard.year).toBe(year);
        expect(standard.coreSubjects.length).toBeGreaterThan(0);
        expect(standard.minTotalLessons).toBeGreaterThan(0);
        expect(standard.maxTotalLessons).toBeGreaterThanOrEqual(
          standard.minTotalLessons,
        );
      });
    });

    it("should have correct lesson ranges for lower secondary", () => {
      const m1 = getMOEStandards("M1");
      expect(m1.minTotalLessons).toBe(28);
      expect(m1.maxTotalLessons).toBe(32);
    });

    it("should have correct lesson ranges for upper secondary", () => {
      const m4 = getMOEStandards("M4");
      expect(m4.minTotalLessons).toBe(30);
      expect(m4.maxTotalLessons).toBe(34);
    });

    it("should include all 8 core subjects for lower secondary", () => {
      const m1 = getMOEStandards("M1");
      const coreGroups = new Set(m1.coreSubjects.map((s) => s.subjectCode));

      expect(coreGroups.has("TH")).toBe(true); // Thai
      expect(coreGroups.has("MA")).toBe(true); // Math
      expect(coreGroups.has("SC")).toBe(true); // Science
      expect(coreGroups.has("SS")).toBe(true); // Social Studies
      expect(coreGroups.has("PE")).toBe(true); // PE
      expect(coreGroups.has("AR")).toBe(true); // Arts
      expect(coreGroups.has("CT")).toBe(true); // Career & Tech
      expect(coreGroups.has("EN")).toBe(true); // English
    });

    it("should have reduced core subjects for upper secondary", () => {
      const m4 = getMOEStandards("M4");
      expect(m4.coreSubjects.length).toBeLessThan(
        getMOEStandards("M1").coreSubjects.length,
      );
    });
  });

  describe("getMinCoreLessons and getMaxCoreLessons", () => {
    it("should calculate correct minimum core lessons", () => {
      const minM1 = getMinCoreLessons("M1");
      expect(minM1).toBeGreaterThan(0);

      // Lower secondary should have higher minimum core than upper
      const minM4 = getMinCoreLessons("M4");
      expect(minM1).toBeGreaterThan(minM4);
    });

    it("should calculate correct maximum core lessons", () => {
      const maxM1 = getMaxCoreLessons("M1");
      const minM1 = getMinCoreLessons("M1");
      expect(maxM1).toBeGreaterThanOrEqual(minM1);
    });
  });

  describe("validateTotalLessons", () => {
    it("should pass for valid lesson count", () => {
      const result = validateTotalLessons("M1", 30);
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("should fail for too few lessons", () => {
      const result = validateTotalLessons("M1", 20);
      expect(result.valid).toBe(false);
      expect(result.message).toContain("ต่ำกว่ามาตรฐาน");
    });

    it("should fail for too many lessons", () => {
      const result = validateTotalLessons("M1", 40);
      expect(result.valid).toBe(false);
      expect(result.message).toContain("เกินมาตรฐาน");
    });

    it("should accept minimum boundary", () => {
      const result = validateTotalLessons("M1", 28);
      expect(result.valid).toBe(true);
    });

    it("should accept maximum boundary", () => {
      const result = validateTotalLessons("M1", 32);
      expect(result.valid).toBe(true);
    });
  });

  describe("getSubjectGroups", () => {
    it("should return all subject groups", () => {
      const groups = getSubjectGroups("M1");
      expect(groups.length).toBeGreaterThan(0);
      expect(groups).toContain("คณิตศาสตร์");
      expect(groups).toContain("วิทยาศาสตร์");
    });
  });

  describe("getTrackElectives", () => {
    it("should return same electives for all lower secondary", () => {
      const m1 = getTrackElectives("M1", "GENERAL");
      const m2 = getTrackElectives("M2", "SCIENCE_MATH");
      expect(m1.length).toBe(m2.length);
    });

    it("should return science-math electives for science track", () => {
      const electives = getTrackElectives("M4", "SCIENCE_MATH");
      const codes = electives.map((e) => e.subjectCode);
      expect(codes).toContain("PH"); // Physics
      expect(codes).toContain("CH_SCI"); // Chemistry
      expect(codes).toContain("BI"); // Biology
    });

    it("should return arts-language electives for arts track", () => {
      const electives = getTrackElectives("M4", "LANGUAGE_ARTS");
      const codes = electives.map((e) => e.subjectCode);
      expect(codes).toContain("SS_ADV"); // Advanced Social Studies
      expect(codes).toContain("EN_ADV"); // Advanced English
    });

    it("should return language-math electives for LANGUAGE_MATH track", () => {
      const electives = getTrackElectives("M4", "LANGUAGE_MATH");
      const codes = electives.map((e) => e.subjectCode);
      expect(codes).toContain("MA_ADV"); // Advanced Mathematics
      expect(codes).toContain("EN_ADV"); // Advanced English
      expect(codes).toContain("CP_ADV"); // Computer Science
      expect(electives.length).toBe(5);
    });

    it("should return general electives for GENERAL track", () => {
      const electives = getTrackElectives("M4", "GENERAL");
      // GENERAL returns the standard electiveSubjects from the year config
      expect(electives.length).toBeGreaterThan(0);
    });

    it("should have distinct electives per track for upper secondary", () => {
      const sciMath = getTrackElectives("M4", "SCIENCE_MATH");
      const langArts = getTrackElectives("M4", "LANGUAGE_ARTS");
      const langMath = getTrackElectives("M4", "LANGUAGE_MATH");

      // Science-math should have physics, arts-language should not
      const sciCodes = sciMath.map((e) => e.subjectCode);
      const artsCodes = langArts.map((e) => e.subjectCode);
      expect(sciCodes).toContain("PH");
      expect(artsCodes).not.toContain("PH");

      // Language-math should share MA_ADV with science-math
      const langMathCodes = langMath.map((e) => e.subjectCode);
      expect(langMathCodes).toContain("MA_ADV");
      expect(sciCodes).toContain("MA_ADV");
    });
  });
});
