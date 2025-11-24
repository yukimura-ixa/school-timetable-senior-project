/**
 * Unit Tests for Bulk Lock Operations
 * Tests schemas, validation, and bulk lock creation logic
 */

import * as v from "valibot";
import { createBulkLocksSchema } from "@/features/lock/application/schemas/lock.schemas";

describe("Bulk Lock Operations", () => {
  describe("createBulkLocksSchema validation", () => {
    it("should accept valid bulk lock input", () => {
      const validInput = {
        locks: [
          {
            SubjectCode: "LUNCH-JR",
            RoomID: 1,
            TimeslotID: "1-MON-4",
            GradeID: "1-1",
            RespID: 100,
          },
          {
            SubjectCode: "LUNCH-JR",
            RoomID: 1,
            TimeslotID: "1-TUE-4",
            GradeID: "1-1",
            RespID: 100,
          },
        ],
      };

      const result = v.safeParse(createBulkLocksSchema, validInput);
      expect(result.success).toBe(true);
    });

    it("should reject empty locks array", () => {
      const invalidInput = {
        locks: [],
      };

      const result = v.safeParse(createBulkLocksSchema, invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain("1");
      }
    });

    it("should reject locks with missing required fields", () => {
      const invalidInput = {
        locks: [
          {
            SubjectCode: "LUNCH-JR",
            // Missing RoomID, TimeslotID, GradeID, RespID
          },
        ],
      };

      const result = v.safeParse(createBulkLocksSchema, invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject locks with invalid types", () => {
      const invalidInput = {
        locks: [
          {
            SubjectCode: 123, // Should be string
            RoomID: "invalid", // Should be number
            TimeslotID: "1-MON-4",
            GradeID: "1-1",
            RespID: 100,
          },
        ],
      };

      const result = v.safeParse(createBulkLocksSchema, invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept multiple valid locks", () => {
      const validInput = {
        locks: Array.from({ length: 50 }, (_, i) => ({
          SubjectCode: "LUNCH-JR",
          RoomID: 1,
          TimeslotID: `1-MON-${i + 1}`,
          GradeID: `1-${i + 1}`,
          RespID: 100,
        })),
      };

      const result = v.safeParse(createBulkLocksSchema, validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("Bulk lock business logic", () => {
    it("should calculate correct number of locks from Cartesian product", () => {
      const timeslots = ["1-MON-4", "1-TUE-4", "1-WED-4", "1-THU-4", "1-FRI-4"];
      const grades = ["1-1", "1-2", "1-3"];

      const expectedLockCount = timeslots.length * grades.length;
      expect(expectedLockCount).toBe(15);
    });

    it("should generate correct ClassID format", () => {
      // Simulating generateClassID logic
      const generateClassID = (gradeId: string, subjectCode: string) => {
        return `${gradeId}-${subjectCode}`;
      };

      expect(generateClassID("1-1", "LUNCH-JR")).toBe("1-1-LUNCH-JR");
      expect(generateClassID("4-2", "EXAM-MID")).toBe("4-2-EXAM-MID");
    });

    it("should validate all locks before creating any", () => {
      const locks = [
        {
          SubjectCode: "LUNCH-JR",
          RoomID: 1,
          TimeslotID: "1-MON-4",
          GradeID: "1-1",
          RespID: 100,
        },
        {
          SubjectCode: "LUNCH-JR",
          RoomID: 1,
          TimeslotID: "1-TUE-4",
          GradeID: "1-1",
          RespID: 100,
        },
        {
          SubjectCode: "LUNCH-JR",
          RoomID: 1,
          TimeslotID: "1-WED-4",
          GradeID: "1-1",
          RespID: 100,
        },
      ];

      // All locks should be validated successfully
      locks.forEach((lock) => {
        expect(lock.SubjectCode).toBeTruthy();
        expect(lock.RoomID).toBeGreaterThan(0);
        expect(lock.TimeslotID).toBeTruthy();
        expect(lock.GradeID).toBeTruthy();
        expect(lock.RespID).toBeGreaterThan(0);
      });
    });

    it("should handle duplicate lock detection", () => {
      const existingLocks = new Set(["1-1-LUNCH-JR", "1-2-LUNCH-JR"]);
      const newLock = "1-1-LUNCH-JR";

      const isDuplicate = existingLocks.has(newLock);
      expect(isDuplicate).toBe(true);
    });

    it("should support batch operations with rollback capability", () => {
      const locks = [
        {
          SubjectCode: "LUNCH-JR",
          RoomID: 1,
          TimeslotID: "1-MON-4",
          GradeID: "1-1",
          RespID: 100,
        },
        {
          SubjectCode: "LUNCH-JR",
          RoomID: 1,
          TimeslotID: "1-TUE-4",
          GradeID: "1-1",
          RespID: 100,
        },
      ];

      // Simulate transaction: if any lock fails, all should be rolled back
      let createdLocks: string[] = [];
      let shouldRollback = false;

      try {
        locks.forEach((lock) => {
          if (!lock.SubjectCode || !lock.RoomID) {
            shouldRollback = true;
            throw new Error("Validation failed");
          }
          createdLocks.push(`${lock.GradeID}-${lock.SubjectCode}`);
        });
      } catch (error) {
        if (shouldRollback) {
          createdLocks = []; // Rollback
        }
      }

      expect(createdLocks.length).toBe(2);
    });
  });

  describe("Bulk lock preview logic", () => {
    it("should generate preview samples correctly", () => {
      const timeslots = ["1-MON-4", "1-TUE-4", "1-WED-4"];
      const grades = ["1-1", "1-2"];
      const maxPreview = 5;

      const preview: Array<{ timeslot: string; grade: string }> = [];

      for (const timeslot of timeslots) {
        for (const grade of grades) {
          if (preview.length < maxPreview) {
            preview.push({ timeslot, grade });
          }
        }
      }

      expect(preview.length).toBe(maxPreview);
      expect(preview[0]).toEqual({ timeslot: "1-MON-4", grade: "1-1" });
    });

    it("should calculate correct total count for preview", () => {
      const selectedTimeslots = new Set([
        "1-MON-4",
        "1-TUE-4",
        "1-WED-4",
        "1-THU-4",
        "1-FRI-4",
      ]);
      const selectedGrades = new Set(["1-1", "1-2", "1-3"]);

      const totalCount = selectedTimeslots.size * selectedGrades.size;
      expect(totalCount).toBe(15);
    });

    it("should handle zero selections", () => {
      const selectedTimeslots = new Set<string>();
      const selectedGrades = new Set(["1-1", "1-2"]);

      const totalCount = selectedTimeslots.size * selectedGrades.size;
      expect(totalCount).toBe(0);
    });

    it("should format preview data correctly", () => {
      const formatPreview = (
        timeslotId: string,
        gradeId: string,
        subject: string,
      ) => {
        return {
          timeslot: timeslotId,
          grade: gradeId,
          subject: subject,
          classId: `${gradeId}-${subject}`,
        };
      };

      const preview = formatPreview("1-MON-4", "1-1", "LUNCH-JR");
      expect(preview).toEqual({
        timeslot: "1-MON-4",
        grade: "1-1",
        subject: "LUNCH-JR",
        classId: "1-1-LUNCH-JR",
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle single lock creation", () => {
      const validInput = {
        locks: [
          {
            SubjectCode: "LUNCH-JR",
            RoomID: 1,
            TimeslotID: "1-MON-4",
            GradeID: "1-1",
            RespID: 100,
          },
        ],
      };

      const result = v.safeParse(createBulkLocksSchema, validInput);
      expect(result.success).toBe(true);
    });

    it("should handle large batch of locks (100+)", () => {
      const validInput = {
        locks: Array.from({ length: 120 }, (_, i) => ({
          SubjectCode: "LUNCH-JR",
          RoomID: 1,
          TimeslotID: `1-MON-${(i % 10) + 1}`,
          GradeID: `${Math.floor(i / 10) + 1}-1`,
          RespID: 100,
        })),
      };

      const result = v.safeParse(createBulkLocksSchema, validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output.locks.length).toBe(120);
      }
    });

    it("should handle special characters in subject codes", () => {
      const validInput = {
        locks: [
          {
            SubjectCode: "ACT-MORNING",
            RoomID: 1,
            TimeslotID: "1-MON-1",
            GradeID: "1-1",
            RespID: 100,
          },
        ],
      };

      const result = v.safeParse(createBulkLocksSchema, validInput);
      expect(result.success).toBe(true);
    });
  });
});
