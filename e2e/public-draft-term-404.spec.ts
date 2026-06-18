/**
 * E2E Tests: DRAFT terms are hidden from public routes (issue 5ka)
 *
 * The public class schedule page must never expose an unpublished (DRAFT) term
 * via direct URL access. The page gates on
 * `publicDataRepository.isTermPublished()` and calls `notFound()` when the term's
 * `table_config.status` is not "PUBLISHED".
 *
 * Test seed (pnpm test:db:seed): 2-2568 is explicitly DRAFT, so semester 2 /
 * 2568 is the reliable unpublished term to exercise here.
 *
 * Note on assertions: this app's dev server renders the Next.js not-found UI
 * with a 200 status (see the `expectNotFound` helper in
 * public-schedule-pages.spec.ts), so these tests assert the not-found UI is
 * shown rather than checking the HTTP status code.
 *
 * Related Files:
 * - src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx
 * - src/lib/infrastructure/repositories/public-data.repository.ts (isTermPublished)
 */

import { test, expect } from "./fixtures/admin.fixture";
import { testGradeLevel, testSemesters } from "./fixtures/seed-data.fixture";

test.describe.configure({ mode: "parallel" });

// DRAFT term from the test seed: semester 2 / 2568, never published.
const draftTerm = testSemesters.semester2_2568;
const draftTermPath = `${draftTerm.Year}/${draftTerm.Semester}`; // "2568/2"

const expectNotFound = async (page: import("@playwright/test").Page) => {
  // notFound() renders the 404 UI; this app may serve it with a 200 status,
  // so assert the visible not-found indicator rather than the response code.
  await expect(
    page.locator("text=/\\b404\\b|not found|ไม่พบ/i").first(),
  ).toBeVisible({ timeout: 15000 });
};

test.describe("Public routes — DRAFT term is not exposed (issue 5ka)", () => {
  test("class schedule for a DRAFT term is not found", async ({
    guestPage,
  }) => {
    const page = guestPage;
    // M1-1 is term-independent seed data, so the only reason this is hidden is
    // the DRAFT gate — removing the gate would render the grid and fail this.
    await page.goto(`/classes/${testGradeLevel.GradeID}/${draftTermPath}`, {
      timeout: 60000,
      waitUntil: "domcontentloaded",
    });

    await expectNotFound(page);
  });
});
