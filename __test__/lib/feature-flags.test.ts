/**
 * Unit Tests for Feature Flags Service
 *
 * Tests the core feature flag evaluation logic:
 * - Master switch (enabled: true/false)
 * - Role-based access control
 * - Email allowlist checking
 * - Rollout percentage with consistent hashing
 * - Error handling and fail-closed behavior
 */

import {
  isFeatureEnabled,
  isValidFeatureFlag,
  type FlagConfig,
} from "@/lib/feature-flags";
import { get } from "@vercel/edge-config";

// Mock @vercel/edge-config
jest.mock("@vercel/edge-config", () => ({
  get: jest.fn(),
}));

const mockGet = get as jest.MockedFunction<typeof get>;

describe("Feature Flags Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isFeatureEnabled", () => {
    describe("Master Switch", () => {
      it("returns false when feature is disabled", async () => {
        mockGet.mockResolvedValue({ enabled: false } as FlagConfig);

        const result = await isFeatureEnabled("newScheduleUI");

        expect(result).toBe(false);
      });

      it("returns true when feature is enabled with no restrictions", async () => {
        mockGet.mockResolvedValue({ enabled: true } as FlagConfig);

        const result = await isFeatureEnabled("analyticsV2");

        expect(result).toBe(true);
      });

      it("returns false when flag does not exist", async () => {
        mockGet.mockResolvedValue(null);

        const result = await isFeatureEnabled("newScheduleUI");

        expect(result).toBe(false);
      });

      it("returns false when flag config is undefined", async () => {
        mockGet.mockResolvedValue(undefined);

        const result = await isFeatureEnabled("exportV2");

        expect(result).toBe(false);
      });
    });

    describe("Role-Based Access Control", () => {
      it("returns true when user role is in allowedRoles", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedRoles: ["admin", "teacher"],
        } as FlagConfig);

        const result = await isFeatureEnabled(
          "analyticsV2",
          "user123",
          "admin",
        );

        expect(result).toBe(true);
      });

      it("returns false when user role is not in allowedRoles", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedRoles: ["admin"],
        } as FlagConfig);

        const result = await isFeatureEnabled(
          "analyticsV2",
          "user123",
          "student",
        );

        expect(result).toBe(false);
      });

      it("returns false when userRole is undefined and allowedRoles is set", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedRoles: ["admin"],
        } as FlagConfig);

        const result = await isFeatureEnabled("analyticsV2", "user123");

        expect(result).toBe(false);
      });

      it("returns true when allowedRoles is empty array", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedRoles: [],
        } as FlagConfig);

        const result = await isFeatureEnabled(
          "newScheduleUI",
          "user123",
          "student",
        );

        expect(result).toBe(true);
      });
    });

    describe("Email Allowlist", () => {
      it("returns true when user email is in allowedEmails", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedEmails: ["dev@example.com", "admin@school.ac.th"],
        } as FlagConfig);

        const result = await isFeatureEnabled(
          "betaFeatures",
          "user123",
          undefined,
          "dev@example.com",
        );

        expect(result).toBe(true);
      });

      it("returns false when user email is not in allowedEmails", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedEmails: ["dev@example.com"],
        } as FlagConfig);

        const result = await isFeatureEnabled(
          "betaFeatures",
          "user123",
          undefined,
          "user@other.com",
        );

        expect(result).toBe(false);
      });

      it("returns false when userEmail is undefined and allowedEmails is set", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedEmails: ["dev@example.com"],
        } as FlagConfig);

        const result = await isFeatureEnabled("betaFeatures", "user123");

        expect(result).toBe(false);
      });

      it("returns true when allowedEmails is empty array", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedEmails: [],
        } as FlagConfig);

        const result = await isFeatureEnabled(
          "betaFeatures",
          "user123",
          undefined,
          "user@example.com",
        );

        expect(result).toBe(true);
      });
    });

    describe("Rollout Percentage", () => {
      it("returns true for userId in rollout percentage", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          rolloutPercent: 100, // Always include
        } as FlagConfig);

        const result = await isFeatureEnabled("newScheduleUI", "user123");

        expect(result).toBe(true);
      });

      it("returns false for userId outside rollout percentage", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          rolloutPercent: 0, // Never include
        } as FlagConfig);

        const result = await isFeatureEnabled("newScheduleUI", "user123");

        expect(result).toBe(false);
      });

      it("uses consistent hashing (same userId always gets same result)", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          rolloutPercent: 50,
        } as FlagConfig);

        const userId = "consistent-user-123";

        // Call multiple times with same userId
        const result1 = await isFeatureEnabled("advancedFilters", userId);
        const result2 = await isFeatureEnabled("advancedFilters", userId);
        const result3 = await isFeatureEnabled("advancedFilters", userId);

        // All results should be identical
        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });

      it("returns true when rolloutPercent is undefined", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          // No rolloutPercent
        } as FlagConfig);

        const result = await isFeatureEnabled("exportV2", "user123");

        expect(result).toBe(true);
      });

      it("returns true when userId is undefined and rolloutPercent is set", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          rolloutPercent: 50,
        } as FlagConfig);

        // No userId provided - skip rollout check
        const result = await isFeatureEnabled("newScheduleUI");

        expect(result).toBe(true);
      });
    });

    describe("Combined Conditions", () => {
      it("checks role before rollout percentage", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedRoles: ["admin"],
          rolloutPercent: 100,
        } as FlagConfig);

        // User not in allowed roles, even though rollout is 100%
        const result = await isFeatureEnabled(
          "analyticsV2",
          "user123",
          "student",
        );

        expect(result).toBe(false);
      });

      it("checks email before rollout percentage", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedEmails: ["dev@example.com"],
          rolloutPercent: 100,
        } as FlagConfig);

        // User email not in allowlist, even though rollout is 100%
        const result = await isFeatureEnabled(
          "betaFeatures",
          "user123",
          undefined,
          "user@other.com",
        );

        expect(result).toBe(false);
      });

      it("returns true when all conditions pass", async () => {
        mockGet.mockResolvedValue({
          enabled: true,
          allowedRoles: ["admin"],
          allowedEmails: ["admin@school.ac.th"],
          rolloutPercent: 100,
        } as FlagConfig);

        const result = await isFeatureEnabled(
          "realTimeCollab",
          "user123",
          "admin",
          "admin@school.ac.th",
        );

        expect(result).toBe(true);
      });
    });

    describe("Error Handling", () => {
      it("returns false when Edge Config throws error", async () => {
        mockGet.mockRejectedValue(new Error("Edge Config unavailable"));

        const result = await isFeatureEnabled("newScheduleUI");

        expect(result).toBe(false);
      });

      it("logs error when Edge Config fails", async () => {
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation();
        mockGet.mockRejectedValue(new Error("Network error"));

        await isFeatureEnabled("analyticsV2");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining("[FeatureFlags] Error checking flag"),
          expect.any(Error),
        );

        consoleErrorSpy.mockRestore();
      });

      it("fails closed (returns false) on any error", async () => {
        mockGet.mockRejectedValue(new Error("Timeout"));

        const result = await isFeatureEnabled("exportV2", "user123", "admin");

        expect(result).toBe(false);
      });
    });
  });

  describe("isValidFeatureFlag", () => {
    it("returns true for valid feature flags", () => {
      expect(isValidFeatureFlag("newScheduleUI")).toBe(true);
      expect(isValidFeatureFlag("analyticsV2")).toBe(true);
      expect(isValidFeatureFlag("exportV2")).toBe(true);
      expect(isValidFeatureFlag("realTimeCollab")).toBe(true);
      expect(isValidFeatureFlag("betaFeatures")).toBe(true);
      expect(isValidFeatureFlag("advancedFilters")).toBe(true);
      expect(isValidFeatureFlag("notifications")).toBe(true);
    });

    it("returns false for invalid feature flags", () => {
      expect(isValidFeatureFlag("unknownFlag")).toBe(false);
      expect(isValidFeatureFlag("random")).toBe(false);
      expect(isValidFeatureFlag("")).toBe(false);
    });
  });

  describe("Evaluation Order", () => {
    it("follows correct evaluation order: enabled → role → email → rollout", async () => {
      const mockConfig: FlagConfig = {
        enabled: true,
        allowedRoles: ["admin", "teacher"],
        allowedEmails: ["admin@school.ac.th"],
        rolloutPercent: 50,
      };
      mockGet.mockResolvedValue(mockConfig);

      // Test 1: enabled=false stops immediately
      mockGet.mockResolvedValue({ ...mockConfig, enabled: false });
      expect(
        await isFeatureEnabled("test", "user1", "admin", "admin@school.ac.th"),
      ).toBe(false);

      // Test 2: wrong role stops at role check
      mockGet.mockResolvedValue(mockConfig);
      expect(
        await isFeatureEnabled(
          "test",
          "user1",
          "student",
          "admin@school.ac.th",
        ),
      ).toBe(false);

      // Test 3: wrong email stops at email check
      mockGet.mockResolvedValue(mockConfig);
      expect(
        await isFeatureEnabled("test", "user1", "admin", "wrong@email.com"),
      ).toBe(false);

      // Test 4: all checks pass, reaches rollout
      mockGet.mockResolvedValue({ ...mockConfig, rolloutPercent: 100 });
      expect(
        await isFeatureEnabled("test", "user1", "admin", "admin@school.ac.th"),
      ).toBe(true);
    });
  });
});
