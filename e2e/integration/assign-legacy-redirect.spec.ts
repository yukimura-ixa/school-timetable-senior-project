/**
 * @file assign-legacy-redirect.spec.ts
 * @description Phase B+C: legacy /schedule/.../assign routes 308-redirect to the
 * consolidated /management/teacher-assignment page (lyw).
 *
 * Asserts the canonical destination carries the term context so the redirect is
 * meaningful, not just a path change:
 *   - /schedule/2568/1/assign → ?mode=by-grade&year=2568&semester=1
 *   - /schedule/2568/1/assign/teacher_responsibility?TeacherID=5
 *       → ?mode=by-teacher&year=2568&semester=1&teacherId=5  (PascalCase→camelCase)
 *
 * @note Uses the seeded term 2568/1. The ScheduleSemesterLayout 404s terms that
 * don't exist in the DB *before* the page's redirect runs, so an unseeded year
 * (e.g. 2567) would notFound() instead of redirecting. The redirect itself is
 * year-agnostic — it forwards whatever the path carries.
 */

import { test, expect } from "../fixtures/admin.fixture";

test.describe("Legacy /schedule/.../assign redirects", () => {
  test("by-grade: /assign forwards term context", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto("/schedule/2568/1/assign");

    await expect(page).toHaveURL(
      /\/management\/teacher-assignment\?(?=.*\bmode=by-grade\b)(?=.*\byear=2568\b)(?=.*\bsemester=1\b)/,
    );
  });

  test("by-teacher: teacher_responsibility preserves teacher and maps TeacherID→teacherId", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(
      "/schedule/2568/1/assign/teacher_responsibility?TeacherID=5",
    );

    await expect(page).toHaveURL(
      /\/management\/teacher-assignment\?(?=.*\bmode=by-teacher\b)(?=.*\byear=2568\b)(?=.*\bsemester=1\b)(?=.*\bteacherId=5\b)/,
    );
  });
});
