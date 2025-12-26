import { test, expect } from "./fixtures/admin.fixture";
import { waitForAppReady } from "./helpers/wait-for-app-ready";

/**
 * TC-018: All Timeslot Page UX
 *
 * Verifies UX expectations for the All Timeslot page:
 * - Read-only banner presence
 * - Export controls visibility based on role
 * - Guest access behavior (redirect to sign-in)
 */

test.describe("All Timeslot Page UX", () => {
  const testSemester = "2567/1";

  test("TC-018-01: Admin sees export controls and banner", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`/dashboard/${testSemester}/all-timeslot`);
    await page.waitForLoadState("networkidle");
    await waitForAppReady(page, { timeout: 30000 });

    // Read-only banner (always shown)
    await expect(page.getByText("มุมมองอ่านอย่างเดียว")).toBeVisible({
      timeout: 15000,
    });

    // Admin link shown only for admin users
    await expect(
      page.getByRole("button", { name: "ไปยังหน้าตั้งค่าตาราง" }),
    ).toBeVisible();

    // Export button enabled for admins
    const exportBtn = page.getByRole("button", { name: "ส่งออก Excel" });
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toBeEnabled();

    // Export menu enabled for admins
    const menuBtn = page.getByLabel("ตัวเลือกส่งออกเพิ่มเติม");
    await expect(menuBtn).toBeEnabled();
  });

  test("TC-018-02: Guest is redirected to sign-in", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();

    await page.goto(`/dashboard/${testSemester}/all-timeslot`);
    await expect(page).toHaveURL(/\/signin/);

    await context.close();
  });
});
