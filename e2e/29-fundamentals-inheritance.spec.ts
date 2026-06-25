import { test, expect } from "./fixtures/admin.fixture";
import type { Page } from "@playwright/test";
import { waitForAppReady } from "./helpers/wait-for-app-ready";

/**
 * E2E: Fundamental-subject reference-inheritance UI (0e5, issue cs0).
 *
 * Covers the two new surfaces:
 * - Admin grade-fundamental template editor (/management/fundamentals)
 * - The inherited-fundamentals section of the program subject editor, with an
 *   exclude → restore round-trip (immediate per-row writes via the override
 *   actions). Per-program scoping is covered by the integration + unit tests;
 *   here we verify the UI round-trip end-to-end.
 */

const INHERITED_HEADER = /สืบทอดจากเทมเพลตชั้น/;
const SUBJECT_CODE = /[ก-ฮ]\d{5}/;

/** Open the first program's subject editor (read its ID from the year grid). */
async function openFirstProgramEditor(page: Page): Promise<void> {
  // The program grid lives on the per-year page; /management/program is just a
  // year-card overview. Read the ProgramID cell and navigate to the editor
  // directly — the grid's manage action is an icon-only/hover-gated cell.
  await page.goto("/management/program/year/4");
  await waitForAppReady(page);
  const idCell = page
    .locator('[role="gridcell"][data-field="ProgramID"]')
    .first();
  await idCell.waitFor({ state: "visible", timeout: 25000 });
  const id = (await idCell.innerText()).trim();
  expect(id).toMatch(/^\d+$/);
  await page.goto(`/management/program/${id}`);
  await waitForAppReady(page);
}

test.describe("Fundamentals inheritance — admin template editor", () => {
  test("CS0-01: template editor loads with year tabs, warning, rows and add control", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/fundamentals");
    await waitForAppReady(page);

    await expect(
      page.getByRole("heading", { name: /วิชาพื้นฐาน ม\./ }),
    ).toBeVisible({ timeout: 20000 });

    // Year tabs ม.1, ม.4, ม.6 present
    for (const y of [1, 4, 6]) {
      await expect(
        page.getByText(`ม.${y}`, { exact: true }).first(),
      ).toBeVisible();
    }

    // "affects all programs" warning
    await expect(page.getByText(/มีผลกับทุกหลักสูตร/)).toBeVisible();

    // At least one template subject code row + the add control
    await expect(page.locator(`text=${SUBJECT_CODE}`).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("button", { name: /เพิ่มวิชาพื้นฐาน/ }),
    ).toBeVisible();
  });

  test("CS0-02: switching year tabs changes the template heading", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/fundamentals");
    await waitForAppReady(page);
    await expect(
      page.getByRole("heading", { name: /วิชาพื้นฐาน ม\./ }),
    ).toBeVisible({ timeout: 20000 });

    await page.getByText("ม.4", { exact: true }).first().click();
    await expect(
      page.getByRole("heading", { name: /วิชาพื้นฐาน ม\.4/ }),
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Fundamentals inheritance — program editor inherited section", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000, retries: 1 });

  test("CS0-03: program editor shows an inherited fundamentals section", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await openFirstProgramEditor(page);

    await expect(page.getByText(INHERITED_HEADER)).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText(/เฉพาะหลักสูตรนี้/).first()).toBeVisible();
    // An inherited row exposes an exclude control
    await expect(
      page.getByRole("button", { name: "ยกเว้น", exact: true }).first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("CS0-04: exclude → restore round-trip on an inherited fundamental", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await openFirstProgramEditor(page);
    await expect(page.getByText(INHERITED_HEADER)).toBeVisible({
      timeout: 20000,
    });

    const excludeCount = await page
      .getByRole("button", { name: "ยกเว้น", exact: true })
      .count();
    expect(excludeCount).toBeGreaterThan(0);

    // Exclude the first inherited subject → row flips to the excluded state.
    await page.getByRole("button", { name: "ยกเว้น", exact: true }).first().click();
    await expect(page.getByText(/ยกเว้นแล้ว/).first()).toBeVisible({
      timeout: 15000,
    });
    const restore = page.getByRole("button", { name: /คืนค่า/ }).first();
    await expect(restore).toBeVisible();

    // Restore → back to a normal inherited row (and leaves the seed clean).
    await restore.click();
    await expect(
      page.getByRole("button", { name: "ยกเว้น", exact: true }).first(),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/ยกเว้นแล้ว/)).toHaveCount(0);
  });
});
