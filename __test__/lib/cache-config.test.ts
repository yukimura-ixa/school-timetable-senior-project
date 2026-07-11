import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isAccelerateEnabled,
  cacheStrategy,
  CACHE_TIERS,
} from "@/lib/cache-config";

describe("cache-config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // clone env to allow mutation per test
    process.env = { ...originalEnv };
    delete process.env.ACCELERATE_URL;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isAccelerateEnabled", () => {
    it("returns true when ACCELERATE_URL is set", () => {
      process.env.ACCELERATE_URL =
        "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      expect(isAccelerateEnabled()).toBe(true);
    });

    it("returns true when DATABASE_URL starts with prisma://", () => {
      process.env.DATABASE_URL =
        "prisma://accelerate.prisma-data.net/?api_key=test";
      expect(isAccelerateEnabled()).toBe(true);
    });

    it("returns true when DATABASE_URL starts with prisma+postgres://", () => {
      process.env.DATABASE_URL =
        "prisma+postgres://localhost:51213/?api_key=test";
      expect(isAccelerateEnabled()).toBe(true);
    });

    it("returns false when DATABASE_URL is a direct postgres connection", () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
      expect(isAccelerateEnabled()).toBe(false);
    });

    it("returns false when no relevant env vars are set", () => {
      delete process.env.DATABASE_URL;
      expect(isAccelerateEnabled()).toBe(false);
    });
  });

  describe("cacheStrategy", () => {
    it("returns empty object when Accelerate is disabled", () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
      expect(cacheStrategy("warm")).toEqual({});
    });

    it("returns empty object without tags when Accelerate is disabled", () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
      expect(cacheStrategy("fresh", ["teachers"])).toEqual({});
    });

    it("returns cacheStrategy with correct warm tier values", () => {
      process.env.ACCELERATE_URL =
        "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      expect(cacheStrategy("warm")).toEqual({
        cacheStrategy: { ttl: 120, swr: 60 },
      });
    });

    it("returns cacheStrategy with correct static tier values", () => {
      process.env.ACCELERATE_URL =
        "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      expect(cacheStrategy("static")).toEqual({
        cacheStrategy: { ttl: 600, swr: 120 },
      });
    });

    it("returns cacheStrategy with correct fresh tier values", () => {
      process.env.ACCELERATE_URL =
        "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      expect(cacheStrategy("fresh")).toEqual({
        cacheStrategy: { ttl: 60, swr: 30 },
      });
    });

    it("includes tags when provided", () => {
      process.env.ACCELERATE_URL =
        "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      expect(cacheStrategy("fresh", ["teachers", "teacher_1"])).toEqual({
        cacheStrategy: { ttl: 60, swr: 30, tags: ["teachers", "teacher_1"] },
      });
    });

    it("omits tags key when empty array is provided", () => {
      process.env.ACCELERATE_URL =
        "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      const result = cacheStrategy("static", []);
      expect(result).toEqual({
        cacheStrategy: { ttl: 600, swr: 120 },
      });
      expect((result as { cacheStrategy?: { tags?: unknown } }).cacheStrategy?.tags).toBeUndefined();
    });

    it("all tier values match CACHE_TIERS constants", () => {
      process.env.ACCELERATE_URL =
        "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      for (const tier of ["static", "warm", "fresh"] as const) {
        const result = cacheStrategy(tier);
        expect(result).toEqual({ cacheStrategy: CACHE_TIERS[tier] });
      }
    });

    it("can be safely spread into a query options object", () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
      // Should produce a clean object with no unexpected keys
      const opts = { where: { id: 1 }, ...cacheStrategy("warm") };
      expect(opts).toEqual({ where: { id: 1 } });
    });

    it("sanitizes tag values to Accelerate's [A-Za-z0-9_] charset", () => {
      process.env.ACCELERATE_URL =
        "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      // Accelerate P6011: tags may only contain alphanumerics + underscore.
      // GradeIDs/ConfigIDs are hyphenated (M1-1, 1-2568) and Thai text is
      // possible — both must be mapped, not passed through.
      expect(cacheStrategy("fresh", ["class_M1-1"])).toEqual({
        cacheStrategy: { ttl: 60, swr: 30, tags: ["class_M1_1"] },
      });
    });

    it("truncates sanitized tags to 64 chars", () => {
      process.env.ACCELERATE_URL =
        "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      const long = `class_${"x".repeat(100)}`;
      const result = cacheStrategy("fresh", [long]) as {
        cacheStrategy: { tags: string[] };
      };
      expect(result.cacheStrategy.tags[0]).toHaveLength(64);
    });
  });
});
