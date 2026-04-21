import { test, expect } from "./fixtures/admin.fixture";
import { testSemester, testTeacher } from "./fixtures/seed-data.fixture";

const RUN_CONFLICT_EXTENDED = process.env.E2E_CONFLICT_EXTENDED === "true";

test.describe("Arrange grid: conflict resolution modal", () => {
  test.skip(
    !RUN_CONFLICT_EXTENDED,
    "Set E2E_CONFLICT_EXTENDED=true to run conflict-resolution e2e",
  );

  test("opens modal with suggestions and applies first suggestion", async ({
    arrangePage,
    page,
  }) => {
    await arrangePage.navigateTo(
      String(testSemester.semester),
      String(testSemester.academicYear),
    );
    await arrangePage.waitForPageReady();

    const teacherName = `${testTeacher.Prefix}${testTeacher.Firstname} ${testTeacher.Lastname}`;
    await arrangePage.selectTeacher(teacherName);

    const availableSubjects = await arrangePage.getAvailableSubjects();
    const subjectCode = availableSubjects[0]!;
    await arrangePage.dragSubjectToTimeslot(subjectCode, 1, 1);

    await expect(page.getByTestId("conflict-modal")).toBeVisible({
      timeout: 15_000,
    });

    const rows = page.getByTestId("conflict-suggestion-row");
    await expect(rows.first()).toBeVisible({ timeout: 15_000 });

    const firstApply = page.getByTestId("conflict-suggestion-apply").first();
    await firstApply.click();

    await expect(page.getByTestId("conflict-modal")).toBeHidden({
      timeout: 15_000,
    });
  });
});
