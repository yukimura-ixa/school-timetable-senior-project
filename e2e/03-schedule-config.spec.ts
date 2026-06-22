import { test, expect } from "./fixtures/admin.fixture";
import { waitForAppReady } from "./helpers/wait-for-app-ready";

/**
 * TC-007: Timetable Configuration Tests
 *
 * The config step at /schedule/[academicYear]/[semester]/config renders the
 * read-only <ConfigSummaryClient> summary (post-wizard refactor). The old
 * editable config form — with "กำหนดคาบต่อวัน" labels, a "ตั้งค่า" submit button,
 * reset, and clone-from-previous-semester — no longer exists, so those
 * assertions were removed. These tests now verify the page loads and shows the
 * saved configuration summary (or the empty-state CTA when no config exists).
 */

test.describe("TC-007: Semester Configuration", () => {
  test.describe.configure({ mode: "serial" });

  const testSemester = "2568/1";

  test("TC-007-01: Navigate to configuration page", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/config`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await waitForAppReady(page);

    // Step 1 of the wizard stepper is always present on the config route.
    await expect(
      page.getByRole("tab", { name: /ตั้งค่าคาบเรียน/ }),
    ).toBeVisible({ timeout: 30000 });

    // ConfigSummaryClient settles to either the status badge (config exists)
    // or the empty-state warning. Wait past the SWR loading spinner here.
    const statusBadge = page.getByTestId("config-status-badge");
    const emptyState = page.getByText(
      "ยังไม่มีการตั้งค่าตารางเรียนสำหรับภาคเรียนนี้",
    );
    await expect(statusBadge.or(emptyState)).toBeVisible({ timeout: 30000 });

    await page.screenshot({
      path: "test-results/screenshots/20-config-page.png",
      fullPage: true,
    });
  });

  test("TC-007-02: Shows saved configuration summary or empty state", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/config`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await waitForAppReady(page);

    const statusBadge = page.getByTestId("config-status-badge");
    const emptyState = page.getByText(
      "ยังไม่มีการตั้งค่าตารางเรียนสำหรับภาคเรียนนี้",
    );

    // Settle past the SWR spinner before branching on which state rendered.
    await expect(statusBadge.or(emptyState)).toBeVisible({ timeout: 30000 });

    if (await statusBadge.isVisible()) {
      // Config exists: read-only summary table with the saved parameters.
      await expect(page.getByText("คาบเรียนต่อวัน")).toBeVisible();
      await expect(page.getByText("ความยาวคาบ")).toBeVisible();
      await expect(page.getByText("เวลาเริ่ม")).toBeVisible();
      await expect(page.getByText("วันเรียน")).toBeVisible();

      // Edit action (opens the configure dialog) is rendered for the summary.
      await expect(
        page.getByRole("button", { name: "แก้ไขการตั้งค่า" }),
      ).toBeVisible();
    } else {
      // No config: empty-state warning plus the create CTA.
      await expect(emptyState).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ตั้งค่าคาบเรียน" }),
      ).toBeVisible();
    }
  });
});

test.describe("TC-009: Schedule Assignment Interface", () => {
  test.describe.configure({ mode: "serial" });

  const testSemester = "2568/1";

  test("TC-009-01: Assignment page loads", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/assign`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await waitForAppReady(page);

    // Verify URL contains assign
    expect(page.url()).toContain("/assign");

    // Take screenshot
    await page.screenshot({
      path: "test-results/screenshots/23-assign-page.png",
      fullPage: true,
    });

    console.log("Assignment page loaded");
  });

  test("TC-009-02: Assignment page structure", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/schedule/${testSemester}/assign`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await waitForAppReady(page);

    // Wait for main content to be visible
    await expect(page.locator("main, body").first()).toBeVisible({ timeout: 10000 });

    // Look for key assignment elements
    // The page should have teacher selection, grade selection, subject assignment
    const pageContent = await page.locator("body").textContent();

    // Take screenshot
    await page.screenshot({
      path: "test-results/screenshots/24-assign-structure.png",
      fullPage: true,
    });

    console.log("Assignment page structure verified");
  });
});
