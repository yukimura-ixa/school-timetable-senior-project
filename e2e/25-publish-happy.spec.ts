/**
 * E2E: clean-publish happy path (task kjm).
 *
 * Runs ONLY under playwright.config.publish-happy.ts, whose globalSetup seeds a
 * tiny, globally MOE-compliant world (1 Year-4 GENERAL program at the senior
 * credit minimums, 1 grade scheduled 100%, DRAFT config 1-2568). That makes
 * checkPublishReadiness return status="ready", so the gate offers the clean
 * confirm path — impossible against the 18-grade demo seed (see task z45 for
 * the companion "blocked" test).
 *
 * Flow: lock step → readiness chip "พร้อมเผยแพร่" → open publish dialog →
 * confirm → success snackbar → config status badge flips to PUBLISHED.
 */

import { test, expect } from "@playwright/test";
import { TEACHER_HAPPY, loginAsViaApi } from "./helpers/login";

const BASE = "/schedule/2568/1";
const PUBLISHED_LABEL = "เผยแพร่แล้ว";

test("publishes a ready config to PUBLISHED through the readiness gate", async ({
  page,
}) => {
  await page.goto(`${BASE}/lock`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  // Sanity: the wizard guard must not bounce us off the lock step.
  expect(page.url()).toContain("/lock");

  // Readiness resolves to the clean "ready" state.
  const chip = page.getByTestId("readiness-chip");
  await expect(chip).toBeVisible({ timeout: 20000 });
  await expect(chip).toContainText("พร้อมเผยแพร่");

  // Expand the accordion and open the publish dialog.
  await page.getByTestId("readiness-accordion-summary").click();
  await page.getByTestId("open-publish-dialog-btn").click();

  // Ready dialog: confirmation title + clean confirm button (no force path).
  await expect(page.getByText("ยืนยันการเผยแพร่")).toBeVisible({
    timeout: 10000,
  });
  const confirm = page.getByTestId("confirm-publish-btn");
  await expect(confirm).toBeVisible();
  await confirm.click();

  // Success feedback from the publish action.
  await expect(page.getByText("เผยแพร่ตารางสำเร็จ")).toBeVisible({
    timeout: 15000,
  });

  // The config status badge reflects PUBLISHED on the config page.
  await page.goto(`${BASE}/config`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("config-status-badge")).toHaveText(
    PUBLISHED_LABEL,
    { timeout: 15000 },
  );
});

test.describe("cross-role verification after publish", () => {
  test("teacher UI login is rejected (signin is admin-only)", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      await page.goto("/signin");
      await page.waitForLoadState("domcontentloaded");
      await page.fill('input[type="email"]', TEACHER_HAPPY.email);
      await page.fill('input[type="password"]', TEACHER_HAPPY.password);
      await page
        .locator('button:not([data-testid="google-signin-button"])', {
          hasText: /เข้าสู่ระบบ|sign in|login|submit|continue/i,
        })
        .first()
        .click();
      // Admin-only gate: must NOT land on the dashboard.
      await page.waitForTimeout(3000); // allow the role check to resolve
      expect(page.url()).not.toMatch(/\/dashboard/);
      // An error/denied message is surfaced to the user.
      // SignInForm sets formError: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าสู่ระบบได้"
      await expect(
        page.getByText(/ไม่ได้รับอนุญาต|admin|ผู้ดูแลระบบ|denied|ไม่สามารถ/i).first(),
      ).toBeVisible({ timeout: 10000 });
    } finally {
      await context.close();
    }
  });

  test("public teacher page shows the published schedule without auth", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      // Mini-seed truncates with RESTART IDENTITY -> TeacherID 1.
      await page.goto("/teachers/1");
      await expect(page.getByText(/ทดสอบ\s*เผยแพร่/).first()).toBeVisible({ timeout: 15000 });
      // Must show actual published schedule content (no empty-state fallback —
      // that would make the test pass when the schedule is missing).
      await expect(page.getByText(/ท31101|ภาษาไทย/).first()).toBeVisible({ timeout: 15000 });
    } finally {
      await context.close();
    }
  });

  test("public class page shows the published schedule without auth", async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    try {
      await page.goto("/classes/M4-HAPPY-1/2568/1");
      await expect(page.getByText(/ท31101|ภาษาไทย/).first()).toBeVisible({ timeout: 15000 });
    } finally {
      await context.close();
    }
  });

  test("API-established teacher session gets 403 from admin layouts", async ({ browser }) => {
    // Defense-in-depth: even if the signin UI gate were bypassed, the
    // dashboard and management layouts must reject non-admin sessions.
    // The layouts call forbidden() below a streamed root-layout flush, so
    // the HTTP status can stay 200 — assert the rendered 403 boundary.
    const { context, page } = await loginAsViaApi(browser, TEACHER_HAPPY);
    try {
      await page.goto("/dashboard");
      await expect(
        page.getByText(/403|forbidden|ไม่ได้รับอนุญาต/i).first(),
      ).toBeVisible({ timeout: 15000 });
      await page.goto("/management/teacher");
      await expect(
        page.getByText(/403|forbidden|ไม่ได้รับอนุญาต/i).first(),
      ).toBeVisible({ timeout: 15000 });
    } finally {
      await context.close();
    }
  });
});
