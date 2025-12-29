import { test, expect } from "./fixtures/admin.fixture";

test.describe("Home Page Tests", () => {
  test("TC-HOME-001: Homepage loads successfully", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Navigate to homepage
    await page.goto("/");

    // Check for main heading or logo
    const heading = page.locator('h1, h2, [role="banner"]').first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Take screenshot
    await page.screenshot({
      path: "test-results/screenshots/01-homepage.png",
      fullPage: true,
    });
  });

  test("TC-HOME-002: Navigation menu is visible", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/");

    // Look for navigation menu
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible({ timeout: 15000 });

  });

  test("TC-HOME-003: Protected routes redirect to signin", async ({
    guestPage,
  }) => {
    const page = guestPage;

    const protectedRoutes = ["/dashboard", "/management/teacher"];

    for (const route of protectedRoutes) {
      // Navigate to protected route
      await page.goto(route);

      // ✅ IMPROVED: Use web-first assertion instead of waitForTimeout
      // Middleware redirects unauthenticated users to signin page
      await expect(async () => {
        const url = page.url();
        const pathname = new URL(url).pathname;
        // Protected routes are handled by the proxy guard. Unauthenticated users
        // are redirected to the public landing page (or /signin in some flows).
        const isPublicLanding = pathname === "/";
        const isSignin = pathname === "/signin" || pathname.includes("signin");
        expect(isPublicLanding || isSignin).toBe(true);
      }).toPass({ timeout: 15000 });

      // Take screenshot
      await page.screenshot({
        path: `test-results/screenshots/03-protected-${route.replace(/\//g, "-")}.png`,
        fullPage: true,
      });

    }
  });
});
