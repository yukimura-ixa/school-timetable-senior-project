/**
 * Tests for TimeslotID utility functions
 *
 * @see src/utils/timeslot-id.ts
 */

import {
  extractPeriodFromTimeslotId,
  extractDayFromTimeslotId,
  extractYearFromTimeslotId,
  extractSemesterFromTimeslotId,
  parseTimeslotId,
  generateTimeslotId,
  extractConfigIdFromTimeslotId,
  isValidTimeslotId,
} from "@/utils/timeslot-id";

describe("TimeslotID Utilities", () => {
  describe("extractPeriodFromTimeslotId", () => {
    it("should extract period 1 from valid TimeslotID", () => {
      expect(extractPeriodFromTimeslotId("1-2567-MON1")).toBe(1);
    });

    it("should extract period 8 from valid TimeslotID", () => {
      expect(extractPeriodFromTimeslotId("1-2567-FRI8")).toBe(8);
    });

    it("should extract double-digit periods", () => {
      expect(extractPeriodFromTimeslotId("1-2567-WED10")).toBe(10);
      expect(extractPeriodFromTimeslotId("2-2568-THU12")).toBe(12);
    });

    it("should return 0 for invalid TimeslotID", () => {
      expect(extractPeriodFromTimeslotId("invalid")).toBe(0);
      expect(extractPeriodFromTimeslotId("")).toBe(0);
      expect(extractPeriodFromTimeslotId("1-2567-MON")).toBe(0);
    });

    it("should return 0 for null/undefined input", () => {
      expect(extractPeriodFromTimeslotId(null as unknown as string)).toBe(0);
      expect(extractPeriodFromTimeslotId(undefined as unknown as string)).toBe(
        0,
      );
    });

    it("should handle all days of week", () => {
      expect(extractPeriodFromTimeslotId("1-2567-MON3")).toBe(3);
      expect(extractPeriodFromTimeslotId("1-2567-TUE4")).toBe(4);
      expect(extractPeriodFromTimeslotId("1-2567-WED5")).toBe(5);
      expect(extractPeriodFromTimeslotId("1-2567-THU6")).toBe(6);
      expect(extractPeriodFromTimeslotId("1-2567-FRI7")).toBe(7);
    });
  });

  describe("extractDayFromTimeslotId", () => {
    it("should extract day from valid TimeslotID", () => {
      expect(extractDayFromTimeslotId("1-2567-MON1")).toBe("MON");
      expect(extractDayFromTimeslotId("1-2567-TUE3")).toBe("TUE");
      expect(extractDayFromTimeslotId("1-2567-FRI8")).toBe("FRI");
    });

    it("should return null for invalid TimeslotID", () => {
      expect(extractDayFromTimeslotId("invalid")).toBeNull();
      expect(extractDayFromTimeslotId("")).toBeNull();
    });
  });

  describe("extractYearFromTimeslotId", () => {
    it("should extract year from valid TimeslotID", () => {
      expect(extractYearFromTimeslotId("1-2567-MON1")).toBe(2567);
      expect(extractYearFromTimeslotId("2-2568-FRI8")).toBe(2568);
    });

    it("should return null for invalid year", () => {
      expect(extractYearFromTimeslotId("1-abc-MON1")).toBeNull();
      expect(extractYearFromTimeslotId("invalid")).toBeNull();
    });
  });

  describe("extractSemesterFromTimeslotId", () => {
    it("should extract semester from valid TimeslotID", () => {
      expect(extractSemesterFromTimeslotId("1-2567-MON1")).toBe(1);
      expect(extractSemesterFromTimeslotId("2-2568-FRI8")).toBe(2);
    });

    it("should return null for invalid semester", () => {
      expect(extractSemesterFromTimeslotId("3-2567-MON1")).toBeNull();
      expect(extractSemesterFromTimeslotId("invalid")).toBeNull();
    });
  });

  describe("parseTimeslotId", () => {
    it("should parse complete TimeslotID", () => {
      const result = parseTimeslotId("1-2567-MON1");
      expect(result).toEqual({
        semester: 1,
        academicYear: 2567,
        day: "MON",
        period: 1,
        raw: "1-2567-MON1",
      });
    });

    it("should return null for invalid TimeslotID", () => {
      expect(parseTimeslotId("invalid")).toBeNull();
      expect(parseTimeslotId("1-2567-MON")).toBeNull();
    });
  });

  describe("generateTimeslotId", () => {
    it("should generate valid TimeslotID from components", () => {
      expect(generateTimeslotId(1, 2567, "MON", 1)).toBe("1-2567-MON1");
      expect(generateTimeslotId(2, 2568, "FRI", 8)).toBe("2-2568-FRI8");
    });

    it("should handle semester enum", () => {
      expect(generateTimeslotId("SEMESTER_1", 2567, "TUE", 3)).toBe(
        "1-2567-TUE3",
      );
      expect(generateTimeslotId("SEMESTER_2", 2568, "WED", 5)).toBe(
        "2-2568-WED5",
      );
    });
  });

  describe("extractConfigIdFromTimeslotId", () => {
    it("should extract ConfigID from valid TimeslotID", () => {
      expect(extractConfigIdFromTimeslotId("1-2567-MON1")).toBe("1-2567");
      expect(extractConfigIdFromTimeslotId("2-2568-FRI8")).toBe("2-2568");
    });
  });

  describe("isValidTimeslotId", () => {
    it("should return true for valid TimeslotIDs", () => {
      expect(isValidTimeslotId("1-2567-MON1")).toBe(true);
      expect(isValidTimeslotId("2-2568-FRI8")).toBe(true);
      expect(isValidTimeslotId("1-2567-WED10")).toBe(true);
    });

    it("should return false for invalid TimeslotIDs", () => {
      expect(isValidTimeslotId("invalid")).toBe(false);
      expect(isValidTimeslotId("")).toBe(false);
      expect(isValidTimeslotId("1-2567-MON")).toBe(false);
    });
  });
});
