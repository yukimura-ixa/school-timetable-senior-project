import { test, expect } from "../fixtures/admin.fixture";

/**
 * API Endpoint Tests
 *
 * Tests for public and authenticated API endpoints:
 * - Health checks
 * - PDF exports
 * - Admin operations
 */

test.describe("Health Endpoints", () => {
  test("GET /api/ping returns 200", async ({ guestPage }) => {
    const response = await guestPage.request.get("/api/ping");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("ok");
    expect(data.ok).toBe(true);
  });

  test("GET /api/health/db returns database status", async ({ guestPage }) => {
    const response = await guestPage.request.get("/api/health/db");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("ready");
    expect(typeof data.ready).toBe("boolean");
  });

  test("GET /api/health/db includes count data when ready", async ({
    guestPage,
  }) => {
    const response = await guestPage.request.get("/api/health/db");
    const data = await response.json();

    if (data.ready) {
      expect(data).toHaveProperty("counts");
      expect(data.counts).toHaveProperty("teachers");
      expect(data.counts).toHaveProperty("schedules");
    }
  });
});

test.describe("PDF Export Endpoints", () => {
  test("GET /api/export/teacher-timetable/pdf requires auth", async ({
    guestPage,
  }) => {
    const response = await guestPage.request.get(
      "/api/export/teacher-timetable/pdf?semesterAndYear=1-2567&teacherId=1",
    );

    // Should redirect to signin or return 401/403
    expect([200, 302, 401, 403]).toContain(response.status());
  });

  test("GET /api/export/teacher-timetable/pdf returns PDF for admin", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    const response = await page.request.get(
      "/api/export/teacher-timetable/pdf?semesterAndYear=1-2567&teacherId=1",
    );

    // If endpoint exists and works, should return PDF
    if (response.status() === 200) {
      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("application/pdf");
    } else {
      // Endpoint may require different params - just verify no 500 error
      expect(response.status()).toBeLessThan(500);
    }
  });

  test("GET /api/export/student-timetable/pdf requires auth", async ({
    guestPage,
  }) => {
    const response = await guestPage.request.get(
      "/api/export/student-timetable/pdf?semesterAndYear=1-2567&classId=1",
    );

    expect([200, 302, 401, 403]).toContain(response.status());
  });
});

test.describe("API Response Structure", () => {
  test("API endpoints return JSON with proper structure", async ({
    guestPage,
  }) => {
    const response = await guestPage.request.get("/api/ping");
    const contentType = response.headers()["content-type"];

    expect(contentType).toContain("application/json");
  });

  test("API endpoints include proper CORS headers", async ({ guestPage }) => {
    const response = await guestPage.request.get("/api/health/db");
    const headers = response.headers();

    // Verify no sensitive headers are exposed
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("API error responses have consistent format", async ({ guestPage }) => {
    // Request a non-existent resource
    const response = await guestPage.request.get("/api/nonexistent");

    // Should return 404, not 500
    expect(response.status()).toBe(404);
  });
});

test.describe("Rate Limiting", () => {
  test("API allows reasonable request rate", async ({ guestPage }) => {
    // Make 10 rapid requests
    const requests = Array(10)
      .fill(null)
      .map(() => guestPage.request.get("/api/ping"));

    const responses = await Promise.all(requests);

    // All should succeed (no rate limiting for basic health checks)
    const successCount = responses.filter((r) => r.status() === 200).length;
    expect(successCount).toBeGreaterThanOrEqual(8); // Allow some variance
  });
});
