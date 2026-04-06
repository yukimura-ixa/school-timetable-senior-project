import { expect, type Page } from "@playwright/test";
import { getAdminCredentials, getSemesterId } from "./env";

export async function loginAsAdmin(
  page: Page,
  opts: { semesterId?: string } = {},
) {
  const { email, password } = getAdminCredentials();
  const semesterId = opts.semesterId ?? getSemesterId();

  console.log(`[PROD E2E] Attempting login with email: ${email}`);
  
  // Enable request/response logging
  page.on('request', request => {
    if (request.url().includes('/api/auth/sign-in')) {
      console.log(`[PROD E2E] Request headers:`, JSON.stringify(request.headers()));
    }
  });
  page.on('response', response => {
    if (response.url().includes('/api/auth/')) {
      console.log(`[PROD E2E] Auth API response: ${response.url()} -> ${response.status()}`);
      response.text().then(text => {
        console.log(`[PROD E2E] Response body: ${text.substring(0, 500)}`);
      }).catch(() => {});
    }
  });
  
  await page.goto("/signin", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await expect(page).toHaveURL(/\/signin/i);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    console.log(`[PROD E2E] Login attempt ${attempt + 1}/2`);
    
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
    
    // Wait a moment for any error messages to appear
    await page.waitForTimeout(2000);
    
    // Check for error message
    const errorAlert = page.locator('text=อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    if (await errorAlert.isVisible()) {
      console.log(`[PROD E2E] Login error: Invalid credentials shown on attempt ${attempt + 1}`);
      // Take screenshot for debugging
      await page.screenshot({ path: `test-results/login-error-attempt-${attempt + 1}.png` });
    }

    const reachedDashboard = await page
      .waitForURL(/\/dashboard/i, { timeout: attempt === 0 ? 15_000 : 60_000 })
      .then(() => true)
      .catch(() => false);
    if (reachedDashboard) {
      console.log(`[PROD E2E] Login successful, reached dashboard`);
      break;
    }

    if (attempt === 0) {
      console.log(`[PROD E2E] Did not reach dashboard, reloading...`);
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
