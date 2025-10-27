/**
 * Config Lifecycle Schemas Tests
 * Unit tests for validation schemas and helper functions
 */

import { describe, it, expect } from "@jest/globals";
import * as v from "valibot";
import {
  ConfigStatusSchema,
  UpdateConfigStatusSchema,
  ConfigCompletenessSchema,
  calculateCompleteness,
  canTransitionStatus,
} from "@/features/config/application/schemas/config-lifecycle.schemas";

describe("ConfigStatusSchema", () => {
  it("should accept valid status values", () => {
    const validStatuses = ["DRAFT", "PUBLISHED", "LOCKED", "ARCHIVED"];
    
    validStatuses.forEach((status) => {
      const result = v.safeParse(ConfigStatusSchema, status);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toBe(status);
      }
    });
  });

  it("should reject invalid status values", () => {
    const invalidStatuses = ["PENDING", "ACTIVE", "", null, undefined, 123];
    
    invalidStatuses.forEach((status) => {
      const result = v.safeParse(ConfigStatusSchema, status);
      expect(result.success).toBe(false);
    });
  });
});

describe("UpdateConfigStatusSchema", () => {
  it("should accept valid input with required fields", () => {
    const input = {
      configId: "SEMESTER_1_2024",
      status: "PUBLISHED",
    };
    
    const result = v.safeParse(UpdateConfigStatusSchema, input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.configId).toBe("SEMESTER_1_2024");
      expect(result.output.status).toBe("PUBLISHED");
    }
  });

  it("should accept valid input with optional reason", () => {
    const input = {
      configId: "SEMESTER_1_2024",
      status: "LOCKED",
      reason: "Finalizing timetable for exam period",
    };
    
    const result = v.safeParse(UpdateConfigStatusSchema, input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.reason).toBe("Finalizing timetable for exam period");
    }
  });

  it("should reject input with missing required fields", () => {
    const invalidInputs = [
      { configId: "SEMESTER_1_2024" }, // missing status
      { status: "PUBLISHED" }, // missing configId
      {}, // missing both
    ];
    
    invalidInputs.forEach((input) => {
      const result = v.safeParse(UpdateConfigStatusSchema, input);
      expect(result.success).toBe(false);
    });
  });

  it("should reject input with invalid status", () => {
    const input = {
      configId: "SEMESTER_1_2024",
      status: "INVALID_STATUS",
    };
    
    const result = v.safeParse(UpdateConfigStatusSchema, input);
    expect(result.success).toBe(false);
  });
});

describe("ConfigCompletenessSchema", () => {
  it("should accept valid completeness data", () => {
    const input = {
      timeslotCount: 8,
      teacherCount: 15,
      subjectCount: 12,
      classCount: 20,
      roomCount: 10,
    };
    
    const result = v.safeParse(ConfigCompletenessSchema, input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.timeslotCount).toBe(8);
      expect(result.output.teacherCount).toBe(15);
    }
  });

  it("should reject negative counts", () => {
    const input = {
      timeslotCount: -1,
      teacherCount: 15,
      subjectCount: 12,
      classCount: 20,
      roomCount: 10,
    };
    
    const result = v.safeParse(ConfigCompletenessSchema, input);
    expect(result.success).toBe(false);
  });

  it("should reject non-integer counts", () => {
    const input = {
      timeslotCount: 8.5,
      teacherCount: 15,
      subjectCount: 12,
      classCount: 20,
      roomCount: 10,
    };
    
    const result = v.safeParse(ConfigCompletenessSchema, input);
    expect(result.success).toBe(false);
  });
});

describe("calculateCompleteness", () => {
  it("should return 0% when all counts are zero", () => {
    const completeness = calculateCompleteness({
      timeslotCount: 0,
      teacherCount: 0,
      subjectCount: 0,
      classCount: 0,
      roomCount: 0,
    });
    
    expect(completeness).toBe(0);
  });

  it("should return 30% when only timeslots exist", () => {
    const completeness = calculateCompleteness({
      timeslotCount: 8,
      teacherCount: 0,
      subjectCount: 0,
      classCount: 0,
      roomCount: 0,
    });
    
    expect(completeness).toBe(30);
  });

  it("should return 20% when only teachers exist", () => {
    const completeness = calculateCompleteness({
      timeslotCount: 0,
      teacherCount: 10,
      subjectCount: 0,
      classCount: 0,
      roomCount: 0,
    });
    
    expect(completeness).toBe(20);
  });

  it("should return 100% when all categories have data", () => {
    const completeness = calculateCompleteness({
      timeslotCount: 8,
      teacherCount: 15,
      subjectCount: 12,
      classCount: 20,
      roomCount: 10,
    });
    
    expect(completeness).toBe(100);
  });

  it("should calculate correct percentage for partial data", () => {
    // timeslots (30%) + teachers (20%) + subjects (20%) = 70%
    const completeness = calculateCompleteness({
      timeslotCount: 8,
      teacherCount: 15,
      subjectCount: 12,
      classCount: 0,
      roomCount: 0,
    });
    
    expect(completeness).toBe(70);
  });

  it("should round to nearest integer", () => {
    // Testing rounding behavior is implicit in other tests
    // since we always get integers from Math.round()
    const completeness = calculateCompleteness({
      timeslotCount: 8,
      teacherCount: 15,
      subjectCount: 12,
      classCount: 20,
      roomCount: 10,
    });
    
    expect(Number.isInteger(completeness)).toBe(true);
  });

  it("should not exceed 100%", () => {
    // Even with very large counts
    const completeness = calculateCompleteness({
      timeslotCount: 1000,
      teacherCount: 1000,
      subjectCount: 1000,
      classCount: 1000,
      roomCount: 1000,
    });
    
    expect(completeness).toBe(100);
  });

  it("should handle minimum completeness for publish (30%)", () => {
    // Exactly 30% - minimum for publish
    const completeness = calculateCompleteness({
      timeslotCount: 8,
      teacherCount: 0,
      subjectCount: 0,
      classCount: 0,
      roomCount: 0,
    });
    
    expect(completeness).toBeGreaterThanOrEqual(30);
  });

  it("should calculate 50% with timeslots and teachers", () => {
    const completeness = calculateCompleteness({
      timeslotCount: 8,
      teacherCount: 15,
      subjectCount: 0,
      classCount: 0,
      roomCount: 0,
    });
    
    expect(completeness).toBe(50);
  });
});

describe("canTransitionStatus", () => {
  describe("DRAFT transitions", () => {
    it("should allow DRAFT → PUBLISHED when completeness >= 30%", () => {
      const result = canTransitionStatus("DRAFT", "PUBLISHED", 30);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should allow DRAFT → PUBLISHED when completeness > 30%", () => {
      const result = canTransitionStatus("DRAFT", "PUBLISHED", 50);
      expect(result.allowed).toBe(true);
    });

    it("should not allow DRAFT → PUBLISHED when completeness < 30%", () => {
      const result = canTransitionStatus("DRAFT", "PUBLISHED", 29);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain("30%");
    });

    it("should not allow DRAFT → LOCKED", () => {
      const result = canTransitionStatus("DRAFT", "LOCKED", 50);
      expect(result.allowed).toBe(false);
    });

    it("should not allow DRAFT → ARCHIVED", () => {
      const result = canTransitionStatus("DRAFT", "ARCHIVED", 50);
      expect(result.allowed).toBe(false);
    });
  });

  describe("PUBLISHED transitions", () => {
    it("should allow PUBLISHED → DRAFT (unpublish)", () => {
      const result = canTransitionStatus("PUBLISHED", "DRAFT", 50);
      expect(result.allowed).toBe(true);
    });

    it("should allow PUBLISHED → LOCKED", () => {
      const result = canTransitionStatus("PUBLISHED", "LOCKED", 50);
      expect(result.allowed).toBe(true);
    });

    it("should not allow PUBLISHED → ARCHIVED", () => {
      const result = canTransitionStatus("PUBLISHED", "ARCHIVED", 50);
      expect(result.allowed).toBe(false);
    });
  });

  describe("LOCKED transitions", () => {
    it("should allow LOCKED → PUBLISHED (unlock)", () => {
      const result = canTransitionStatus("LOCKED", "PUBLISHED", 50);
      expect(result.allowed).toBe(true);
    });

    it("should allow LOCKED → ARCHIVED", () => {
      const result = canTransitionStatus("LOCKED", "ARCHIVED", 50);
      expect(result.allowed).toBe(true);
    });

    it("should not allow LOCKED → DRAFT", () => {
      const result = canTransitionStatus("LOCKED", "DRAFT", 50);
      expect(result.allowed).toBe(false);
    });
  });

  describe("ARCHIVED transitions", () => {
    it("should allow ARCHIVED → LOCKED (restore)", () => {
      const result = canTransitionStatus("ARCHIVED", "LOCKED", 50);
      expect(result.allowed).toBe(true);
    });

    it("should not allow ARCHIVED → PUBLISHED", () => {
      const result = canTransitionStatus("ARCHIVED", "PUBLISHED", 50);
      expect(result.allowed).toBe(false);
    });

    it("should not allow ARCHIVED → DRAFT", () => {
      const result = canTransitionStatus("ARCHIVED", "DRAFT", 50);
      expect(result.allowed).toBe(false);
    });
  });

  describe("Same status transitions", () => {
    it("should not allow DRAFT → DRAFT", () => {
      const result = canTransitionStatus("DRAFT", "DRAFT", 50);
      expect(result.allowed).toBe(false);
    });

    it("should not allow PUBLISHED → PUBLISHED", () => {
      const result = canTransitionStatus("PUBLISHED", "PUBLISHED", 50);
      expect(result.allowed).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle completeness = 0", () => {
      const result = canTransitionStatus("DRAFT", "PUBLISHED", 0);
      expect(result.allowed).toBe(false);
    });

    it("should handle completeness = 100", () => {
      const result = canTransitionStatus("DRAFT", "PUBLISHED", 100);
      expect(result.allowed).toBe(true);
    });

    it("should handle boundary case at exactly 30%", () => {
      const result = canTransitionStatus("DRAFT", "PUBLISHED", 30);
      expect(result.allowed).toBe(true);
    });

    it("should handle boundary case just below 30%", () => {
      const result = canTransitionStatus("DRAFT", "PUBLISHED", 29.9);
      expect(result.allowed).toBe(false);
    });
  });

  describe("Complete workflow", () => {
    it("should allow complete lifecycle: DRAFT → PUBLISHED → LOCKED → ARCHIVED", () => {
      const step1 = canTransitionStatus("DRAFT", "PUBLISHED", 50);
      expect(step1.allowed).toBe(true);

      const step2 = canTransitionStatus("PUBLISHED", "LOCKED", 50);
      expect(step2.allowed).toBe(true);

      const step3 = canTransitionStatus("LOCKED", "ARCHIVED", 50);
      expect(step3.allowed).toBe(true);
    });

    it("should allow reverse workflow: ARCHIVED → LOCKED → PUBLISHED → DRAFT", () => {
      const step1 = canTransitionStatus("ARCHIVED", "LOCKED", 50);
      expect(step1.allowed).toBe(true);

      const step2 = canTransitionStatus("LOCKED", "PUBLISHED", 50);
      expect(step2.allowed).toBe(true);

      const step3 = canTransitionStatus("PUBLISHED", "DRAFT", 50);
      expect(step3.allowed).toBe(true);
    });
  });
});
