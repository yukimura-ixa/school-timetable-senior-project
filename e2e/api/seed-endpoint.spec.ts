import { test, expect } from "@playwright/test";

/**
 * Seed Semesters API - End-to-End Tests
 *
 * Tests the seed API endpoint with live dev server.
 * Converted from integration tests to proper E2E tests using Playwright request fixture.
 *
 * SKIP: These tests require SEED_SECRET which is not available in CI by default.
 * The seed API is a protected admin endpoint - these tests verify it works correctly.
 * To run locally: SEED_SECRET=your-secret pnpm test:e2e e2e/api/seed-endpoint.spec.ts
 */

// Skip if SEED_SECRET is not available (CI environment)
const SKIP_REASON = !process.env.SEED_SECRET
  ? "SEED_SECRET not available - skipping seed API tests"
  : undefined;

test.describe("Seed Semesters API (E2E)", () => {
  test.skip(!!SKIP_REASON, SKIP_REASON || "");

  // SEED_SECRET is required for these tests
  const SEED_SECRET = process.env.SEED_SECRET!;

  test("should require authentication", async ({ request }) => {
    // Call API without secret
    const response = await request.post("/api/admin/seed-semesters", {
      params: { years: "2567" },
    });
    const data = await response.json();

    expect(response.status()).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Unauthorized");
  });

  test("should create semesters when authenticated", async ({ request }) => {
    // Call API with valid secret
    const response = await request.post("/api/admin/seed-semesters", {
      params: {
        years: "2567",
      },
      headers: { "x-seed-secret": SEED_SECRET },
    });
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results).toBeDefined();
    expect(data.results.length).toBe(2); // 2 semesters per year

    // Verify semester structure
    data.results.forEach((result: any) => {
      expect(result.semester).toBeGreaterThan(0);
      expect(result.year).toBe(2567);
      expect(result.configId).toBeDefined();
      // ConfigID can be either format:
      // - Seed format: "YEAR-SEMESTER_N" (e.g., "2567-SEMESTER_1")
      // - Repository format: "SEMESTER-YEAR" (e.g., "1-2567")
      expect(result.configId).toMatch(/^(\d{4}-SEMESTER_[12]|[12]-\d{4})$/);
    });
  });

  test("should be idempotent (can run multiple times)", async ({ request }) => {
    // First call
    const response1 = await request.post("/api/admin/seed-semesters", {
      params: {
        years: "2567",
      },
      headers: { "x-seed-secret": SEED_SECRET },
    });
    const data1 = await response1.json();

    expect(response1.status()).toBe(200);
    expect(data1.ok).toBe(true);

    // Second call - should succeed without errors
    const response2 = await request.post("/api/admin/seed-semesters", {
      params: {
        years: "2567",
      },
      headers: { "x-seed-secret": SEED_SECRET },
    });
    const data2 = await response2.json();

    expect(response2.status()).toBe(200);
    expect(data2.ok).toBe(true);
    expect(data2.results.length).toBe(data1.results.length);
  });

  test("should seed multiple years", async ({ request }) => {
    // Seed years 2567 and 2568
    const response = await request.post("/api/admin/seed-semesters", {
      params: {
        years: "2567,2568",
      },
      headers: { "x-seed-secret": SEED_SECRET },
    });
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results.length).toBe(4); // 2 years × 2 semesters

    // Verify both years exist
    const years = new Set(data.results.map((r: any) => r.year));
    expect(years.has(2567)).toBe(true);
    expect(years.has(2568)).toBe(true);
  });

  test("should seed timeslots and config when seedData=true", async ({
    request,
  }) => {
    const response = await request.post("/api/admin/seed-semesters", {
      params: {
        years: "2569",
        seedData: "true",
      },
      headers: { "x-seed-secret": SEED_SECRET },
    });
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results.length).toBe(2);

    // Check that timeslots and tableConfig were created
    data.results.forEach((result: any) => {
      expect(result.timeslots).toBeDefined();
      expect(result.timeslots).toBeGreaterThan(0); // Should have timeslots
      expect(result.tableConfig).toBe(true);
    });
  });

  test("should default to years 2567,2568 if not specified", async ({
    request,
  }) => {
    const response = await request.post("/api/admin/seed-semesters", {
      headers: { "x-seed-secret": SEED_SECRET },
    });
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.results.length).toBe(4); // 2 years × 2 semesters

    const years = new Set(data.results.map((r: any) => r.year));
    expect(years.has(2567)).toBe(true);
    expect(years.has(2568)).toBe(true);
  });

  test("should validate ConfigID format (SEMESTER-YEAR)", async ({
    request,
  }) => {
    const response = await request.post("/api/admin/seed-semesters", {
      params: {
        years: "2567",
      },
      headers: { "x-seed-secret": SEED_SECRET },
    });
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.ok).toBe(true);

    // Check ConfigID format - can be either:
    // - Seed format: "YEAR-SEMESTER_N" (e.g., "2567-SEMESTER_1")
    // - Repository format: "SEMESTER-YEAR" (e.g., "1-2567")
    data.results.forEach((result: any) => {
      expect(result.configId).toMatch(/^(\d{4}-SEMESTER_[12]|[12]-\d{4})$/);
      // Verify it contains the year and semester info
      expect(result.configId).toContain(String(result.year));
    });
  });

  test("GET method should not be allowed", async ({ request }) => {
    const response = await request.get("/api/admin/seed-semesters");
    expect(response.status()).toBe(405);
  });
});
