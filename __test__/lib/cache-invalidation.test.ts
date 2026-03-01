/**
 * Unit Tests for cache-invalidation utility
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Hoist mock setup before module imports
const { mockInvalidate } = vi.hoisted(() => ({
  mockInvalidate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    $accelerate: { invalidate: mockInvalidate },
  },
}));

// Import AFTER mocks are wired
import { invalidatePublicCache } from "@/lib/cache-invalidation";

describe("invalidatePublicCache", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ACCELERATE_URL;
    mockInvalidate.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("calls $accelerate.invalidate with correct tags when Accelerate is active", async () => {
    process.env.ACCELERATE_URL =
      "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
    mockInvalidate.mockResolvedValue(undefined);

    await invalidatePublicCache(["stats", "teachers"]);

    expect(mockInvalidate).toHaveBeenCalledOnce();
    expect(mockInvalidate).toHaveBeenCalledWith({ tags: ["stats", "teachers"] });
  });

  it("is a no-op when ACCELERATE_URL is not set and DATABASE_URL is direct postgres", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";

    await invalidatePublicCache(["stats"]);

    expect(mockInvalidate).not.toHaveBeenCalled();
  });

  it("is a no-op when DATABASE_URL is not set at all", async () => {
    delete process.env.DATABASE_URL;

    await invalidatePublicCache(["stats"]);

    expect(mockInvalidate).not.toHaveBeenCalled();
  });

  it("does not throw when invalidation fails", async () => {
    process.env.ACCELERATE_URL =
      "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
    mockInvalidate.mockRejectedValue(new Error("Network error"));

    await expect(invalidatePublicCache(["stats"])).resolves.toBeUndefined();
  });

  it("passes through multiple tags correctly", async () => {
    process.env.ACCELERATE_URL =
      "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
    mockInvalidate.mockResolvedValue(undefined);

    await invalidatePublicCache(["static_data", "term_1-2567", "stats", "teachers", "classes"]);

    expect(mockInvalidate).toHaveBeenCalledWith({
      tags: ["static_data", "term_1-2567", "stats", "teachers", "classes"],
    });
  });

  it("resolves undefined on success", async () => {
    process.env.ACCELERATE_URL =
      "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
    mockInvalidate.mockResolvedValue(undefined);

    const result = await invalidatePublicCache(["stats"]);
    expect(result).toBeUndefined();
  });
});
