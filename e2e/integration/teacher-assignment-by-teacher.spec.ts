/**
 * @file teacher-assignment-by-teacher.spec.ts
 * @description By-teacher mode of the consolidated assignment page (dn3 slice 5d).
 *
 * Exercises /management/teacher-assignment?mode=by-teacher end to end:
 *   - by-teacher mode loads with the teacher picker (grade selector hidden)
 *   - pick the seed-pinned E2E teacher at the seeded term (1/2568)
 *   - the teacher-centric editor shows the pinned classroom (ม.1/1)
 *   - saving persists via syncAssignmentsAction and reports success
 *
 * The page defaults to academic year 2567, but the seed data lives at 2568,
 * so the year selector is switched first. The E2E teacher is pinned to
 * ค21201 / M1-1 / S1-2568 in seedDemoData(), making ม.1/1 deterministic.
 *
 * @note CI-RECOMMENDED: slow in dev mode due to SSR compilation; CI runs the
 * production build. Requires `pnpm db:seed:demo` data.
 */

import { test, expect } from "../fixtures/admin.fixture";
import { waitForAppReady } from "../helpers/wait-for-app-ready";
import type { Page } from "@playwright/test";
import { testTeacher, testSemester } from "../fixtures/seed-data.fixture";

const BY_TEACHER_URL = "/management/teacher-assignment?mode=by-teacher";
const SEED_YEAR = String(testSemester.Year); // "2568"

async function selectAcademicYear(page: Page, year: string): Promise<void> {
  // MUI Select rendered with InputLabel "ปีการศึกษา".
  await page.getByLabel("ปีการศึกษา").click();
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible({ timeout: 10000 });
  await listbox.getByRole("option", { name: year, exact: true }).click();
  await expect(listbox).toHaveCount(0, { timeout: 5000 });
}

async function pickTeacher(page: Page, query: string): Promise<void> {
  // The teacher Autocomplete input carries aria-label "ค้นหาครูผู้สอน".
  const input = page.getByLabel("ค้นหาครูผู้สอน");
  await expect(input).toBeVisible({ timeout: 20000 });
  await input.click();
  await input.fill(query);
  const option = page.getByRole("option", { name: new RegExp(query, "i") });
  await expect(option.first()).toBeVisible({ timeout: 15000 });
  await option.first().click();
  await page.waitForLoadState("networkidle");
}

test.describe("Teacher Assignment — by-teacher mode", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000, retries: 2 });

  // Warm up the route so the first real test does not eat cold SSR compilation.
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(BY_TEACHER_URL, { timeout: 90000 });
      await page.waitForLoadState("networkidle", { timeout: 60000 });
      await page.waitForSelector('[aria-label="ค้นหาครูผู้สอน"]', {
        timeout: 30000,
      });
    } catch {
      // Warmup is best-effort; tests carry their own waits.
    } finally {
      await context.close();
    }
  });

  test("BT-01: by-teacher mode loads with the teacher picker", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(BY_TEACHER_URL);
    await page.waitForLoadState("networkidle");
    await waitForAppReady(page);

    // Teacher picker is present; the grade selector is hidden in by-teacher mode.
    await expect(page.getByLabel("ค้นหาครูผู้สอน")).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByLabel("ระดับชั้น")).toHaveCount(0);
  });

  test("BT-02: pick teacher, see pinned classroom, save succeeds", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(BY_TEACHER_URL);
    await page.waitForLoadState("networkidle");
    await waitForAppReady(page);

    // Seed data is at 2568; the page defaults to 2567.
    await selectAcademicYear(page, SEED_YEAR);

    // The E2E teacher's Firstname is "E2E" (label "ครูE2E ทดสอบ").
    await pickTeacher(page, testTeacher.Firstname);

    // Pinned responsibility ค21201 / M1-1 → the editor renders the ม.1/1 room.
    await expect(page.getByText("ม.1/1").first()).toBeVisible({
      timeout: 20000,
    });

    // Save the (idempotent) assignment and confirm success feedback.
    await page.getByRole("button", { name: /บันทึก/ }).click();
    await expect(page.getByText("บันทึกข้อมูลสำเร็จ")).toBeVisible({
      timeout: 30000,
    });
  });
});
