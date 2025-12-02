import { test, expect } from "./fixtures/admin.fixture";

/**
 * Security Test Suite: PII (Personally Identifiable Information) Exposure
 *
 * Ensures that sensitive user data is not exposed in public pages.
 * Related to Issue #64 - Email Address Exposure Vulnerability
 */

test.describe("Security: PII Exposure Prevention", () => {
  test("TC-SEC-001: Public homepage should not expose email addresses", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/");

    const htmlContent = await page.content();

    // Should not contain any email patterns
    const emailPattern = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = htmlContent.match(emailPattern);

    // Allow certain test/dev emails in development, but not production teacher emails
    const allowedPatterns = [
      /@example\.com/, // Test emails
      /@localhost/, // Dev emails
    ];

    if (emailMatches) {
      const forbiddenEmails = emailMatches.filter((email) => {
        return !allowedPatterns.some((pattern) => pattern.test(email));
      });

      expect(forbiddenEmails).toHaveLength(0);

      if (forbiddenEmails.length > 0) {
        console.error("❌ Forbidden emails found:", forbiddenEmails);
      }
    }

    // Specifically check for school domain emails
    expect(htmlContent).not.toContain("@school.ac.th");
  });

  test("TC-SEC-002: Teacher list page should not expose email addresses", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/?tab=teachers");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    const htmlContent = await page.content();

    // Should not contain school email addresses
    expect(htmlContent).not.toContain("@school.ac.th");

    // Should still show teacher names (verify data is present, just not emails)
    const teacherCards = page.locator(
      '[data-testid*="teacher"], .teacher-card, [class*="teacher"]',
    );
    const count = await teacherCards.count();

    // If teachers exist, verify structure is correct
    if (count > 0) {
      console.log(
        `✓ Found ${count} teacher cards (emails should not be visible)`,
      );
    }
  });

  test("TC-SEC-003: Teacher detail page should not expose email addresses", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Navigate to homepage to get a teacher ID
    await page.goto("/?tab=teachers");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    // Try to find a teacher link
    const teacherLink = page.locator('a[href*="/teachers/"]').first();
    const teacherLinkCount = await teacherLink.count();

    if (teacherLinkCount > 0) {
      await teacherLink.click();
      await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
        timeout: 15000,
      });

      const htmlContent = await page.content();

      // Should not contain email addresses
      expect(htmlContent).not.toContain("@school.ac.th");

      // Should show teacher name and schedule (verify page works)
      await expect(page.locator("h1")).toBeVisible();
    } else {
      test.skip();
    }
  });

  test("TC-SEC-004: API responses should not include email in public endpoints", async ({
    page,
    request,
  }) => {
    // Test public API endpoints if they exist
    const response = await request.get("/api/public/teachers");

    if (response.ok()) {
      const data = await response.json();
      const jsonString = JSON.stringify(data);

      // Check if response contains email addresses
      expect(jsonString).not.toContain("@school.ac.th");
      expect(jsonString).not.toMatch(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    }
  });

  test("TC-SEC-005: Network requests should not leak sensitive data", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    const sensitiveDataFound: string[] = [];

    // Monitor network responses for sensitive data
    page.on("response", async (response) => {
      const url = response.url();

      // Only check HTML and JSON responses
      const contentType = response.headers()["content-type"] || "";
      if (contentType.includes("html") || contentType.includes("json")) {
        try {
          const body = await response.text();

          // Check for email patterns
          if (body.includes("@school.ac.th")) {
            sensitiveDataFound.push(`Email found in: ${url}`);
          }
        } catch (error) {
          // Ignore errors reading response body
        }
      }
    });

    // Navigate through public pages
    await page.goto("/");
    await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
      timeout: 15000,
    });

    // Check teachers tab if it exists
    const teachersTab = page
      .locator(
        '[data-testid="tab-teachers"], button:has-text("ครู"), a:has-text("ครู")',
      )
      .first();
    if ((await teachersTab.count()) > 0) {
      await teachersTab.click();
      await expect(page.locator('main, [role="main"], body').first()).toBeVisible({
        timeout: 15000,
      });
    }

    // Assert no sensitive data was found
    expect(sensitiveDataFound).toHaveLength(0);

    if (sensitiveDataFound.length > 0) {
      console.error(
        "❌ Sensitive data found in network requests:",
        sensitiveDataFound,
      );
    }
  });
});
