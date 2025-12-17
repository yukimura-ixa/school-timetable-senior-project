import { expect, type Page } from "@playwright/test";
import { getAdminCredentials, getSemesterId } from "./env";

export async function loginAsAdmin(
  page: Page,
  opts: { semesterId?: string } = {},
) {
  const { email, password } = getAdminCredentials();
  const semesterId = opts.semesterId ?? getSemesterId();

  await page.goto("/signin", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await expect(page).toHaveURL(/\/signin/i);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    // Login form fields (confirmed via Playwright MCP on 2025-12-17).
    await page.getByRole("textbox", { name: "อีเมล" }).fill(email);
    await page.getByRole("textbox", { name: "รหัสผ่าน" }).fill(password);

    // Avoid strict-mode collisions with the Google button.
    const submit = page
      .locator('button:not([data-testid="google-signin-button"])')
      .filter({ hasText: /^เข้าสู่ระบบ$/ })
      .first();
    await expect(submit).toBeVisible();
    await expect(submit).toBeEnabled();
    await submit.click();

    const reachedDashboard = await page
      .waitForURL(/\/dashboard/i, { timeout: attempt === 0 ? 15_000 : 60_000 })
      .then(() => true)
      .catch(() => false);
    if (reachedDashboard) break;

    if (attempt === 0) {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
      await expect(page).toHaveURL(/\/signin/i);
      continue;
    }

    throw new Error("[PROD E2E] Login did not reach /dashboard");
  }

  // Ensure semester-scoped routes don't loop on selection.
  await page.evaluate((sem) => {
    const [semesterPart, yearPart] = sem.split("-");
    const numericSemester = Number(semesterPart);
    const numericYear = Number(yearPart);
    window.localStorage.setItem(
      "semester-selection",
      JSON.stringify({
        state: {
          selectedSemester: sem,
          academicYear: numericYear,
          semester: numericSemester,
        },
        version: 0,
      }),
    );
  }, semesterId);
}
