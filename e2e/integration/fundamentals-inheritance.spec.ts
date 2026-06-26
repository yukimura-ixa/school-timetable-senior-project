/**
 * @file fundamentals-inheritance.spec.ts
 * @description cs0 — round-trips for the CORE fundamentals inheritance UI:
 *   1. Exclude an inherited CORE on one program → gone there, intact on a
 *      sibling program of the same grade.
 *   2. Override an inherited CORE credit → the program's credit ledger reflects
 *      it; clear → reverts to the template.
 *   3. Edit a grade's template in /management/fundamentals → the change
 *      propagates to non-overriding programs of that grade.
 *
 * Anchored on the seeded ม.4 grade, which has three sibling programs
 * (M4-SCI / M4-LANG-MATH / M4-LANG-ARTS) and a year-4 CORE template. ท31101
 * (Thai, ม.4) is a stable template member at 1.0 credit. programId is an
 * unstable auto-increment, so the editor is reached by program name via the
 * /management/program/year/4 grid.
 *
 * @note CI-only: needs `pnpm db:seed:demo` data + admin auth; verified against
 * the production build in CI, not locally. Mutations are reverted in-flow (and
 * the global template bump in finally) to keep seed state clean for the suite.
 */

import { test, expect } from "../fixtures/admin.fixture";
import type { Page, Locator } from "@playwright/test";

const CORE = "ท31101"; // Thai ม.4, seeded year-4 template member at 1.0 credit
const SCI = /วิทย์-คณิต ม\.4/; // M4-SCI program name
const LANG_MATH = /ศิลป์-คำนวณ ม\.4/; // M4-LANG-MATH sibling

async function num(loc: Locator): Promise<number> {
  const text = (await loc.textContent()) ?? "";
  return parseFloat(text.replace(/[^\d.]/g, ""));
}

/** Reach a program's assignment editor by name (programId is unstable). */
async function openProgramEditor(page: Page, name: RegExp): Promise<void> {
  await page.goto("/management/program/year/4");
  await page.waitForLoadState("networkidle");
  const row = page.getByRole("row", { name }).first();
  await expect(row).toBeVisible({ timeout: 20000 });
  await row.getByRole("button", { name: "จัดการหลักสูตร" }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId(`inherited-row-${CORE}`)).toBeVisible({
    timeout: 20000,
  });
}

async function openYear4Template(page: Page): Promise<void> {
  await page.goto("/management/fundamentals");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "ม.4", exact: true }).click();
  await expect(page.getByTestId(`template-row-${CORE}`)).toBeVisible({
    timeout: 20000,
  });
}

test.describe("CORE fundamentals inheritance round-trips", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000, retries: 2 });

  test("FI-01: excluding an inherited CORE affects only that program", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Exclude ท31101 on M4-SCI.
    await openProgramEditor(page, SCI);
    const sciRow = page.getByTestId(`inherited-row-${CORE}`);
    await sciRow.getByRole("button", { name: "ยกเว้น", exact: true }).click();
    await expect(page.getByText("ยกเว้นวิชานี้แล้ว")).toBeVisible({
      timeout: 15000,
    });
    await expect(sciRow.getByText("ยกเว้นแล้ว")).toBeVisible();

    // The sibling M4-LANG-MATH still carries ท31101 (not excluded).
    await openProgramEditor(page, LANG_MATH);
    const langRow = page.getByTestId(`inherited-row-${CORE}`);
    await expect(langRow.getByText("ยกเว้นแล้ว")).toHaveCount(0);
    await expect(
      langRow.getByRole("button", { name: "ยกเว้น", exact: true }),
    ).toBeVisible();

    // Revert: restore ท31101 on M4-SCI.
    await openProgramEditor(page, SCI);
    await page
      .getByTestId(`inherited-row-${CORE}`)
      .getByRole("button", { name: "คืนค่า", exact: true })
      .click();
    await expect(page.getByText("คืนค่าตามเทมเพลตแล้ว")).toBeVisible({
      timeout: 15000,
    });
  });

  test("FI-02: overriding an inherited CORE credit updates the ledger, then reverts", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await openProgramEditor(page, SCI);
    const row = page.getByTestId(`inherited-row-${CORE}`);
    const ledger = page.getByTestId("ledger-inherited-credits");
    const before = await num(ledger);

    // Reveal the stepper, bump +0.5.
    await row.getByRole("button", { name: "ปรับหน่วยกิต", exact: true }).click();
    await row.getByRole("button", { name: "เพิ่มหน่วยกิต" }).click();
    await expect(page.getByText("ปรับหน่วยกิตแล้ว")).toBeVisible({
      timeout: 15000,
    });
    await expect(row.getByText("ปรับแล้ว")).toBeVisible();
    await expect.poll(() => num(ledger), { timeout: 15000 }).toBeCloseTo(
      before + 0.5,
      1,
    );

    // Clear the override → ledger returns to the template baseline.
    await row.getByRole("button", { name: "ล้างค่า", exact: true }).click();
    await expect(page.getByText("คืนค่าตามเทมเพลตแล้ว")).toBeVisible({
      timeout: 15000,
    });
    await expect.poll(() => num(ledger), { timeout: 15000 }).toBeCloseTo(
      before,
      1,
    );
  });

  test("FI-03: editing a grade template propagates to non-overriding programs", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Baseline inherited credit for ท31101 on M4-SCI (non-overriding).
    await openProgramEditor(page, SCI);
    const baseline = await num(page.getByTestId(`inherited-credit-${CORE}`));

    let bumped = false;
    try {
      // Bump the year-4 template's ท31101 by +0.5.
      await openYear4Template(page);
      await page
        .getByTestId(`template-row-${CORE}`)
        .getByRole("button", { name: "เพิ่มหน่วยกิต" })
        .click();
      bumped = true;

      // The non-overriding program reflects the new template value.
      await openProgramEditor(page, SCI);
      await expect
        .poll(() => num(page.getByTestId(`inherited-credit-${CORE}`)), {
          timeout: 15000,
        })
        .toBeCloseTo(baseline + 0.5, 1);
    } finally {
      // Always restore the shared template so the rest of the suite is clean.
      if (bumped) {
        await openYear4Template(page);
        await page
          .getByTestId(`template-row-${CORE}`)
          .getByRole("button", { name: "ลดหน่วยกิต" })
          .click();
      }
    }
  });
});
