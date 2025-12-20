import { test, expect } from "@playwright/test";

/**
 * [visual] Visual Inspection - Admin User Journey
 * Run with: pnpm playwright test e2e/visual/visual-inspection.spec.ts --headed --debug
 */

test.describe("Visual Inspection - Admin User Journey", () => {
  test("01. Home page and sign-in", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    const signInButton = page.locator("text=/sign in/i").first();
    if (await signInButton.isVisible().catch(() => false)) {
      console.log("✅ Sign-in button found");
    }
  });

  test("02. Navigate to dashboard (requires auth)", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("signin")) {
      console.log("⚠️ Waiting for manual sign-in...");
      await page.waitForURL((url) => !url.toString().includes("signin"), {
        timeout: 120000,
      });
    }
    await page.waitForTimeout(3000);
  });

  test("03. Semester selection", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("signin")) {
      await page.waitForURL((url) => !url.toString().includes("signin"), {
        timeout: 120000,
      });
    }
    const semesterSelector = page
      .locator('[data-testid="semester-selector"]')
      .or(
        page
          .locator('select, [role="combobox"]')
          .filter({ hasText: /2567|2568|ภาค/ }),
      );
    if (await semesterSelector.isVisible().catch(() => false)) {
      console.log("✅ Semester selector found");
    }
    await page.waitForTimeout(3000);
  });

  test("04. Management - Teachers", async ({ page }) => {
    await page.goto("/management/teacher");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("signin")) {
      await page.waitForURL((url) => !url.toString().includes("signin"), {
        timeout: 120000,
      });
    }
    await page.screenshot({
      path: "test-results/screenshots/admin-teacher-management.png",
      fullPage: true,
    });
    await page.waitForTimeout(3000);
  });

  test("05. Management - Subjects", async ({ page }) => {
    await page.goto("/management/subject");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("signin")) {
      await page.waitForURL((url) => !url.toString().includes("signin"), {
        timeout: 120000,
      });
    }
    await page.screenshot({
      path: "test-results/screenshots/admin-subject-management.png",
      fullPage: true,
    });
    await page.waitForTimeout(3000);
  });

  test("06. Schedule Configuration", async ({ page }) => {
    const semester = "1-2567";
    await page.goto(`/schedule/${semester}/config`);
    await page.waitForLoadState("networkidle");
    if (page.url().includes("signin")) {
      await page.waitForURL((url) => !url.toString().includes("signin"), {
        timeout: 120000,
      });
    }
    await page.screenshot({
      path: "test-results/screenshots/admin-schedule-config.png",
      fullPage: true,
    });
    await page.waitForTimeout(3000);
  });

  test("07. Teacher Arrangement Interface", async ({ page }) => {
    const semester = "1-2567";
    await page.goto(`/schedule/${semester}/arrange`);
    await page.waitForLoadState("networkidle");
    if (page.url().includes("signin")) {
      await page.waitForURL((url) => !url.toString().includes("signin"), {
        timeout: 120000,
      });
    }
    await page.screenshot({
      path: "test-results/screenshots/admin-teacher-arrange.png",
      fullPage: true,
    });
    await page.waitForTimeout(5000);
  });

  test("08. Analytics Dashboard", async ({ page }) => {
    await page.goto("/dashboard/analytics");
    await page.waitForLoadState("networkidle");
    if (page.url().includes("signin")) {
      await page.waitForURL((url) => !url.toString().includes("signin"), {
        timeout: 120000,
      });
    }
    await page.screenshot({
      path: "test-results/screenshots/admin-analytics.png",
      fullPage: true,
    });
    await page.waitForTimeout(3000);
  });
});

test.describe("Visual Inspection - Component Test IDs", () => {
  test("Verify presence of key test IDs", async ({ page }) => {
    const semester = "1-2567";
    await page.goto(`/schedule/${semester}/arrange`);
    await page.waitForLoadState("networkidle");
    if (page.url().includes("signin")) {
      await page.waitForURL((url) => !url.toString().includes("signin"), {
        timeout: 120000,
      });
    }
    const testIds = [
      "teacher-selector",
      "subject-list",
      "timeslot-grid",
      "save-button",
    ];
    for (const id of testIds) {
      const el = page.locator(`[data-testid="${id}"]`).first();
      const exists = (await el.count()) > 0;
      console.log(
        `${exists ? "✅" : "❌"} ${id}: ${exists ? "Found" : "Not Found"}`,
      );
      if (exists) {
        await el.evaluate((el) => {
          (el as HTMLElement).style.outline = "3px solid lime";
          (el as HTMLElement).style.outlineOffset = "3px";
        });
      }
    }
    await page.waitForTimeout(5000);
  });
});

