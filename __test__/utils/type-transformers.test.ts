/**
 * Unit tests for type transformation utilities
 *
 * @module type-transformers.test
 */

import {
  transformLegacySubject,
  transformLegacySubjects,
  transformGradeLevel,
  toLegacyGradeLevel,
  transformAPIResponse,
  isCompleteLegacyData,
} from "@/utils/type-transformers";

describe("Type Transformers", () => {
  describe("transformLegacySubject", () => {
    it("should transform complete legacy subject to new format", () => {
      const legacy = {
        SubjectCode: "CS101",
        SubjectName: "Computer Science",
        GradeID: "M1-1",
        TeacherID: 5,
        Category: "CORE",
        Credit: 3,
        TeachHour: 3,
        Year: 1,
        Number: 1,
        RoomID: 10,
        RoomName: "Lab 1",
      };

      const result = transformLegacySubject(legacy);

      expect(result).toEqual({
        itemID: 0,
        subjectCode: "CS101",
        subjectName: "Computer Science",
        gradeID: "M1-1",
        teacherID: 5,
        category: "CORE",
        credit: 3,
        teachHour: 3,
        roomID: 10,
        roomName: "Lab 1",
        gradelevel: { year: 1, number: 1 },
      });
    });

    it("should handle subject without room assignment", () => {
      const legacy = {
        SubjectCode: "MATH101",
        SubjectName: "Mathematics",
        GradeID: "M2-1",
        TeacherID: 3,
        Category: "CORE",
        Credit: 4,
        TeachHour: 4,
        Year: 2,
        Number: 1,
      };

      const result = transformLegacySubject(legacy);

      expect(result).toEqual({
        itemID: 0,
        subjectCode: "MATH101",
        subjectName: "Mathematics",
        gradeID: "M2-1",
        teacherID: 3,
        category: "CORE",
        credit: 4,
        teachHour: 4,
        roomID: null,
        roomName: null,
        gradelevel: { year: 2, number: 1 },
      });
    });

    it("should handle subject without grade level", () => {
      const legacy = {
        SubjectCode: "ENG101",
        SubjectName: "English",
        GradeID: "M3-1",
        TeacherID: 7,
        Category: "CORE",
        Credit: 2,
        TeachHour: 2,
      };

      const result = transformLegacySubject(legacy);

      expect(result).toEqual({
        itemID: 0,
        subjectCode: "ENG101",
        subjectName: "English",
        gradeID: "M3-1",
        teacherID: 7,
        category: "CORE",
        credit: 2,
        teachHour: 2,
        roomID: null,
        roomName: null,
        gradelevel: undefined,
      });
    });

    it("should return null for incomplete data (missing SubjectCode)", () => {
      const incomplete = {
        SubjectName: "Incomplete",
        GradeID: "M1-1",
        TeacherID: 1,
        Category: "CORE",
        Credit: 1,
        TeachHour: 1,
      };

      const result = transformLegacySubject(incomplete);
      expect(result).toBeNull();
    });

    it("should return null for incomplete data (missing TeacherID)", () => {
      const incomplete = {
        SubjectCode: "CS101",
        SubjectName: "Computer Science",
        GradeID: "M1-1",
        Category: "CORE",
        Credit: 3,
        TeachHour: 3,
      };

      const result = transformLegacySubject(incomplete);
      expect(result).toBeNull();
    });

    it("should return null for invalid category", () => {
      const invalidCategory = {
        SubjectCode: "CS101",
        SubjectName: "Computer Science",
        GradeID: "M1-1",
        TeacherID: 5,
        Category: "INVALID_CATEGORY", // Not a valid SubjectCategory
        Credit: 3,
        TeachHour: 3,
      };

      const result = transformLegacySubject(invalidCategory);
      expect(result).toBeNull();
    });

    it("should return null for null input", () => {
      expect(transformLegacySubject(null)).toBeNull();
    });

    it("should return null for undefined input", () => {
      expect(transformLegacySubject(undefined)).toBeNull();
    });

    it("should handle all valid SubjectCategory values", () => {
      const categories = ["CORE", "ADDITIONAL", "ACTIVITY"];

      categories.forEach((cat) => {
        const legacy = {
          SubjectCode: `TEST${cat}`,
          SubjectName: `Test ${cat}`,
          GradeID: "M1-1",
          TeacherID: 1,
          Category: cat,
          Credit: 1,
          TeachHour: 1,
        };

        const result = transformLegacySubject(legacy);
        expect(result).not.toBeNull();
        expect(result?.category).toBe(cat);
      });
    });
  });

  describe("transformLegacySubjects", () => {
    it("should transform array of legacy subjects", () => {
      const legacyArray = [
        {
          SubjectCode: "CS101",
          SubjectName: "Computer Science",
          GradeID: "M1-1",
          TeacherID: 5,
          Category: "CORE",
          Credit: 3,
          TeachHour: 3,
          Year: 1,
          Number: 1,
        },
        {
          SubjectCode: "MATH101",
          SubjectName: "Mathematics",
          GradeID: "M2-1",
          TeacherID: 3,
          Category: "CORE",
          Credit: 4,
          TeachHour: 4,
          Year: 2,
          Number: 1,
        },
      ];

      const result = transformLegacySubjects(legacyArray);

      expect(result).toHaveLength(2);
      expect(result[0].subjectCode).toBe("CS101");
      expect(result[1].subjectCode).toBe("MATH101");
    });

    it("should filter out incomplete subjects", () => {
      const mixedArray = [
        {
          SubjectCode: "CS101",
          SubjectName: "Computer Science",
          GradeID: "M1-1",
          TeacherID: 5,
          Category: "CORE",
          Credit: 3,
          TeachHour: 3,
        },
        {
          SubjectCode: "INCOMPLETE",
          // Missing required fields
        },
        {
          SubjectCode: "MATH101",
          SubjectName: "Mathematics",
          GradeID: "M2-1",
          TeacherID: 3,
          Category: "CORE",
          Credit: 4,
          TeachHour: 4,
        },
      ];

      const result = transformLegacySubjects(mixedArray);

      expect(result).toHaveLength(2); // Only complete items
      expect(result[0].subjectCode).toBe("CS101");
      expect(result[1].subjectCode).toBe("MATH101");
    });

    it("should return empty array for empty input", () => {
      const result = transformLegacySubjects([]);
      expect(result).toEqual([]);
    });

    it("should return empty array if all items are incomplete", () => {
      const allIncomplete = [
        { SubjectCode: "CS101" }, // Incomplete
        { SubjectName: "Math" }, // Incomplete
      ];

      const result = transformLegacySubjects(allIncomplete);
      expect(result).toEqual([]);
    });
  });

  describe("transformGradeLevel", () => {
    it("should transform grade level from PascalCase to camelCase", () => {
      const legacy = { Year: 1, Number: 2 };
      const result = transformGradeLevel(legacy);

      expect(result).toEqual({ year: 1, number: 2 });
    });

    it("should handle missing Year with default 0", () => {
      const legacy = { Number: 3 };
      const result = transformGradeLevel(legacy);

      expect(result).toEqual({ year: 0, number: 3 });
    });

    it("should handle missing Number with default 0", () => {
      const legacy = { Year: 2 };
      const result = transformGradeLevel(legacy);

      expect(result).toEqual({ year: 2, number: 0 });
    });

    it("should handle empty object with all defaults", () => {
      const result = transformGradeLevel({});
      expect(result).toEqual({ year: 0, number: 0 });
    });
  });

  describe("toLegacyGradeLevel", () => {
    it("should transform grade level from camelCase to PascalCase", () => {
      const modern = { year: 1, number: 2 };
      const result = toLegacyGradeLevel(modern);

      expect(result).toEqual({ Year: 1, Number: 2 });
    });

    it("should handle zero values", () => {
      const modern = { year: 0, number: 0 };
      const result = toLegacyGradeLevel(modern);

      expect(result).toEqual({ Year: 0, Number: 0 });
    });
  });

  describe("transformAPIResponse", () => {
    it("should transform API response with subjects array", () => {
      const apiResponse = {
        success: true,
        message: "Success",
        data: [
          {
            SubjectCode: "CS101",
            SubjectName: "Computer Science",
            GradeID: "M1-1",
            TeacherID: 5,
            Category: "CORE",
            Credit: 3,
            TeachHour: 3,
          },
        ],
      };

      const result = transformAPIResponse(apiResponse);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Success");
      expect(result.data).toHaveLength(1);
      expect(result.data[0].subjectCode).toBe("CS101");
    });

    it("should handle response without data", () => {
      const apiResponse = {
        success: false,
        message: "No data",
      };

      const result = transformAPIResponse(apiResponse);

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });

    it("should filter incomplete items in response", () => {
      const apiResponse = {
        success: true,
        data: [
          {
            SubjectCode: "CS101",
            SubjectName: "Computer Science",
            GradeID: "M1-1",
            TeacherID: 5,
            Category: "CORE",
            Credit: 3,
            TeachHour: 3,
          },
          {
            SubjectCode: "INCOMPLETE",
            // Missing required fields
          },
        ],
      };

      const result = transformAPIResponse(apiResponse);

      expect(result.data).toHaveLength(1); // Only complete item
    });
  });

  describe("isCompleteLegacyData", () => {
    it("should return true for complete legacy data", () => {
      const complete = {
        SubjectCode: "CS101",
        SubjectName: "Computer Science",
        GradeID: "M1-1",
        TeacherID: 5,
        Category: "CORE",
        Credit: 3,
        TeachHour: 3,
      };

      expect(isCompleteLegacyData(complete)).toBe(true);
    });

    it("should return false for incomplete data (missing SubjectCode)", () => {
      const incomplete = {
        SubjectName: "Computer Science",
        GradeID: "M1-1",
        TeacherID: 5,
        Category: "CORE",
        Credit: 3,
        TeachHour: 3,
      };

      expect(isCompleteLegacyData(incomplete)).toBe(false);
    });

    it("should return false for incomplete data (missing TeacherID)", () => {
      const incomplete = {
        SubjectCode: "CS101",
        SubjectName: "Computer Science",
        GradeID: "M1-1",
        Category: "CORE",
        Credit: 3,
        TeachHour: 3,
      };

      expect(isCompleteLegacyData(incomplete)).toBe(false);
    });

    it("should return false for TeacherID as string instead of number", () => {
      const invalid = {
        SubjectCode: "CS101",
        SubjectName: "Computer Science",
        GradeID: "M1-1",
        TeacherID: "5", // String instead of number
        Category: "CORE",
        Credit: 3,
        TeachHour: 3,
      };

      expect(isCompleteLegacyData(invalid)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isCompleteLegacyData(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isCompleteLegacyData(undefined)).toBe(false);
    });
  });
});
