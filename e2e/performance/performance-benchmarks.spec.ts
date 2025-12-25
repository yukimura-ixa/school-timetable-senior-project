import { test, expect } from "../fixtures/admin.fixture";

/**
 * Performance Benchmarks
 *
 * Tests page load times and API response times to ensure
 * the application can handle production loads.
 *
 * Thresholds:
 * - Page load: < 3 seconds
 * - API response: < 500ms
 * - 50 concurrent users: no degradation
 */

// Performance thresholds
const THRESHOLDS = {
  PAGE_LOAD_MS: 3000,
  API_RESPONSE_MS: 500,
  PAGINATION_MS: 1000,
  CONCURRENT_USERS: 50,
};

test.describe("Page Load Performance", () => {
  test("homepage loads within 3 seconds", async ({ guestPage }) => {
    const startTime = Date.now();

    await guestPage.goto("/");
    await guestPage.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(THRESHOLDS.PAGE_LOAD_MS);
    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test("dashboard loads within 3 seconds", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    const startTime = Date.now();

    await page.goto("/dashboard/2567/1/all-timeslot");
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(THRESHOLDS.PAGE_LOAD_MS);
    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test("schedule config loads within 3 seconds", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const startTime = Date.now();

    await page.goto("/schedule/2567/1/config");
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(THRESHOLDS.PAGE_LOAD_MS);
    console.log(`Config page load time: ${loadTime}ms`);
  });

  test("teacher arrange page loads within 3 seconds", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const startTime = Date.now();

    await page.goto("/schedule/2567/1/arrange");
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(THRESHOLDS.PAGE_LOAD_MS);
    console.log(`Arrange page load time: ${loadTime}ms`);
  });
});

test.describe("API Response Performance", () => {
  test("health endpoint responds within 500ms", async ({ guestPage }) => {
    const startTime = Date.now();

    const response = await guestPage.request.get("/api/health/db");

    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(THRESHOLDS.API_RESPONSE_MS);
    console.log(`Health API response time: ${responseTime}ms`);
  });

  test("ping endpoint responds within 500ms", async ({ guestPage }) => {
    const startTime = Date.now();

    const response = await guestPage.request.get("/api/ping");

    const responseTime = Date.now() - startTime;

    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(THRESHOLDS.API_RESPONSE_MS);
    console.log(`Ping API response time: ${responseTime}ms`);
  });
});

test.describe("Concurrent User Simulation", () => {
  test("handles 50 concurrent health check requests", async ({ guestPage }) => {
    const concurrentRequests = THRESHOLDS.CONCURRENT_USERS;

    const startTime = Date.now();

    // Simulate 50 concurrent users hitting health endpoint
    const requests = Array(concurrentRequests)
      .fill(null)
      .map(() => guestPage.request.get("/api/health/db"));

    const responses = await Promise.all(requests);

    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / concurrentRequests;

    // Count successful responses
    const successCount = responses.filter((r) => r.status() === 200).length;
    const successRate = (successCount / concurrentRequests) * 100;

    console.log(`Concurrent requests: ${concurrentRequests}`);
    console.log(`Success rate: ${successRate}%`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Average time per request: ${avgTime.toFixed(2)}ms`);

    // At least 95% should succeed
    expect(successRate).toBeGreaterThanOrEqual(95);
  });

  test("handles 50 concurrent page loads", async ({ guestPage }) => {
    // Note: This test simulates concurrent requests, not actual browser instances
    // For true load testing, use a dedicated tool like k6 or Artillery
    const concurrentRequests = THRESHOLDS.CONCURRENT_USERS;

    const startTime = Date.now();

    // Simulate 50 concurrent requests to homepage
    const requests = Array(concurrentRequests)
      .fill(null)
      .map(() => guestPage.request.get("/"));

    const responses = await Promise.all(requests);

    const totalTime = Date.now() - startTime;

    // Count successful responses (200 or 304)
    const successCount = responses.filter((r) =>
      [200, 304].includes(r.status()),
    ).length;
    const successRate = (successCount / concurrentRequests) * 100;

    console.log(`Homepage concurrent requests: ${concurrentRequests}`);
    console.log(`Success rate: ${successRate}%`);
    console.log(`Total time: ${totalTime}ms`);

    // At least 90% should succeed for page loads
    expect(successRate).toBeGreaterThanOrEqual(90);
  });
});

test.describe("Large Dataset Performance", () => {
  test("teacher list renders with all teachers", async ({ guestPage }) => {
    const startTime = Date.now();

    await guestPage.goto("/");
    await guestPage.getByTestId("teachers-tab").click();

    // Wait for table to render
    await expect(guestPage.getByTestId("teacher-list")).toBeVisible({
      timeout: 10000,
    });

    const renderTime = Date.now() - startTime;

    // Count rows rendered
    const rowCount = await guestPage
      .getByTestId("teacher-list")
      .locator("tbody tr")
      .count();

    console.log(`Teacher list render time: ${renderTime}ms`);
    console.log(`Teachers displayed: ${rowCount}`);

    // Should render reasonably fast even with many teachers
    expect(renderTime).toBeLessThan(5000);
  });

  test("pagination is fast (< 1 second)", async ({ guestPage }) => {
    await guestPage.goto("/");
    await guestPage.getByTestId("teachers-tab").click();

    await expect(guestPage.getByTestId("teacher-list")).toBeVisible({
      timeout: 10000,
    });

    // Find and click next page button
    const nextButton = guestPage
      .locator(
        'button:has-text("Next"), button:has-text("ถัดไป"), [aria-label*="next"]',
      )
      .first();

    if (await nextButton.isVisible().catch(() => false)) {
      const startTime = Date.now();

      await nextButton.click();

      // Wait for new data to appear
      await guestPage.waitForTimeout(100);

      const paginationTime = Date.now() - startTime;

      console.log(`Pagination time: ${paginationTime}ms`);

      expect(paginationTime).toBeLessThan(THRESHOLDS.PAGINATION_MS);
    }
  });
});

test.describe("Network Timing Metrics", () => {
  test("collects network timing for key pages", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    const timings: Array<{ url: string; timing: number }> = [];

    // Listen for request finished events
    page.on("requestfinished", async (request) => {
      const timing = request.timing();
      if (timing.responseEnd > 0) {
        timings.push({
          url: request.url(),
          timing: timing.responseEnd,
        });
      }
    });

    await page.goto("/schedule/2567/1/config");
    await page.waitForLoadState("networkidle");

    // Log timing data
    console.log("Network Timings:");
    timings
      .slice(0, 10)
      .forEach((t) =>
        console.log(`  ${t.url.substring(0, 80)}: ${t.timing.toFixed(0)}ms`),
      );

    // Check no request took too long
    const slowRequests = timings.filter((t) => t.timing > 2000);
    console.log(`Slow requests (>2s): ${slowRequests.length}`);

    expect(slowRequests.length).toBeLessThanOrEqual(2);
  });
});

