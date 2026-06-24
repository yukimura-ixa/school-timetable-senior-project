/**
 * @file full-user-journey.spec.ts
 * @description Deep behavioral end-to-end journey that drives every major feature
 * as a real user — derived from the 2026-06-07 live walkthrough.
 *
 * Unlike the presence-only smoke suite, every step here is action -> state change
 * -> assert, and persistence is re-verified after reload where it matters:
 *   1. Auth (wrong + correct credentials, session role, logout)
 *   2. Semester creation wizard (persists after reload)
 *   3. Management CRUD: teacher, subject, room (counts change + persist)
 *   4. Wizard: config summary, 8 MOE learning areas, arrange drag-drop
 *      (place -> persist across reload -> delete -> restored), publish gate
 *   5. Analytics (no hydration error — regression guard for gjt), conflicts
 *   6. Exports (real .xlsx / .pdf downloads)
 *   7. Public pages (homepage search, teacher + class schedules)
 *   8. Access denial for unauthenticated users
 *
 * Auth: most blocks use the shared admin storageState (admin.fixture). Fresh
 * contexts are used only where a clean/unauthenticated session is required
 * (login, logout, access-denial) so the shared session is never destroyed.
 */

import { test, expect } from "./fixtures/admin.fixture";
import { testAdmin, testTeacher } from "./fixtures/seed-data.fixture";
import { getE2ETeacherId } from "./helpers/teacher-id";
import { waitForAppReady } from "./helpers/wait-for-app-ready";
import { dragAndDrop } from "./helpers/drag-drop.helper";

const SEMESTER = "2568/1";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const uniq = () => Date.now().toString().slice(-7);

const credsLoginButton = (page: import("@playwright/test").Page) =>
  page
    .locator('button:not([data-testid="google-signin-button"])', {
      hasText: /เข้าสู่ระบบ|sign in|login|submit/i,
    })
    .first();

test.describe.serial("Full user journey (deep behavioral)", () => {
  test.describe("1. Authentication", () => {
    test("rejects wrong password, accepts correct credentials", async ({
      browser,
    }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();
      try {
        await page.goto("/signin");
        await page.waitForLoadState("domcontentloaded");

        // Wrong password: stays on signin, shows error.
        await page.fill('input[type="email"]', testAdmin.email);
        await page.fill('input[type="password"]', "wrong-password-zzz");
        await credsLoginButton(page).click();
        await expect(
          page.getByText("อีเมลหรือรหัสผ่านไม่ถูกต้อง"),
        ).toBeVisible({ timeout: 15000 });
        await expect(page).toHaveURL(/\/signin/);

        // Correct password: redirect to dashboard, session role=admin.
        await page.fill('input[type="password"]', ADMIN_PASSWORD);
        await credsLoginButton(page).click();
        await page.waitForURL(/\/dashboard/, { timeout: 15000 });

        const session = await page.request
          .get("/api/auth/get-session")
          .then((r) => r.json());
        expect(session?.user?.role).toBe("admin");
        expect(session?.user?.email).toBe(testAdmin.email);
      } finally {
        await context.close();
      }
    });

    test("logout clears the session", async ({ browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const page = await context.newPage();
      try {
        await page.goto("/signin");
        await page.fill('input[type="email"]', testAdmin.email);
        await page.fill('input[type="password"]', ADMIN_PASSWORD);
        await credsLoginButton(page).click();
        await page.waitForURL(/\/dashboard/, { timeout: 15000 });

        await page.locator('button[aria-label="ออกจากระบบ"]').click();
        await expect(page).toHaveURL(/\/signin/, { timeout: 15000 });

        const after = await page.request
          .get("/api/auth/get-session")
          .then((r) => r.json().catch(() => null));
        expect(after?.user).toBeFalsy();
      } finally {
        await context.close();
      }
    });
  });

  test.describe("2. Semester management", () => {
    test("create-semester wizard persists a new semester", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      // Far-future year avoids collision with seeded 2568 on local reruns.
      const year = 2571 + (Date.now() % 25);

      await page.goto("/dashboard");
      await waitForAppReady(page);

      await page.getByRole("button", { name: "สร้างภาคเรียนใหม่" }).click();
      const dialog = page.getByRole("dialog", { name: "สร้างภาคเรียนใหม่" });
      await expect(dialog).toBeVisible();

      await dialog
        .getByRole("spinbutton", { name: "ปีการศึกษา" })
        .fill(String(year));

      // Step 1 -> 2 -> 3 -> 4, then create.
      await dialog.getByRole("button", { name: "ถัดไป" }).click(); // copy-from
      await dialog.getByRole("button", { name: "ถัดไป" }).click(); // config
      await dialog.getByRole("button", { name: "ถัดไป" }).click(); // review
      await dialog.getByRole("button", { name: "สร้างภาคเรียน" }).click();
      await expect(dialog).toBeHidden({ timeout: 20000 });

      // Persistence: the new term card is present after a reload.
      await page.goto("/dashboard");
      await waitForAppReady(page);
      await expect(
        page.getByRole("heading", { name: new RegExp(`/ ?${year}`) }).first(),
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("3. Management CRUD", () => {
    const paginationTotal = async (page: import("@playwright/test").Page) => {
      const txt = await page
        .locator("p", { hasText: /of \d+/ })
        .first()
        .textContent();
      return Number(txt?.match(/of (\d+)/)?.[1] ?? "0");
    };

    // Re-fetch on each poll iteration: the create's server commit + Next
    // revalidation can lag behind the submit's success signal, so a single
    // post-reload read may still observe the pre-create total. Reload until the
    // new row lands. No other spec in the parallel shard mutates these tables
    // (role-access-control is read-only), so before+1 is exact, not racy.
    const expectTotalAfterCreate = async (
      page: import("@playwright/test").Page,
      url: string,
      gridSelector: string,
      before: number,
    ) => {
      await expect
        .poll(
          async () => {
            await page.goto(url);
            await page.waitForSelector(gridSelector, { timeout: 15000 });
            return paginationTotal(page);
          },
          { timeout: 30000, intervals: [500, 1000, 2000, 3000, 5000] },
        )
        .toBe(before + 1);
    };

    test("teacher create persists (count increments)", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      await page.goto("/management/teacher");
      await page.waitForSelector('[role="grid"], .MuiDataGrid-root', {
        timeout: 15000,
      });
      const before = await paginationTotal(page);

      await page.getByTestId("add-teacher-button").click();
      const id = uniq();
      await page.getByTestId("firstname-0").fill(`Walk${id}`);
      await page.getByTestId("lastname-0").fill(`Test${id}`);
      await page.getByTestId("add-teacher-submit").click();
      await expect(
        page.locator("text=/เพิ่มครู|สำเร็จ|Success/i").first(),
      ).toBeVisible({ timeout: 20000 });

      await expectTotalAfterCreate(
        page,
        "/management/teacher",
        '[role="grid"], .MuiDataGrid-root',
        before,
      );
    });

    test("subject create persists (count increments)", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      await page.goto("/management/subject");
      await page.waitForSelector('[role="grid"], .MuiDataGrid-root', {
        timeout: 15000,
      });
      const before = await paginationTotal(page);

      await page.getByRole("button", { name: "เพิ่มวิชา" }).first().click();
      const id = uniq();
      await page.getByTestId("subject-code-0").fill(`WALK${id}`);
      await page.getByTestId("subject-name-0").fill(`วิชาทดสอบ ${id}`);
      await page.getByRole("combobox", { name: "หน่วยกิต" }).click();
      await page.getByRole("option", { name: "1.0" }).click();
      await page
        .getByRole("button", { name: /เพิ่มวิชา \(1 รายการ\)/ })
        .click();

      await expectTotalAfterCreate(
        page,
        "/management/subject",
        '[role="grid"], .MuiDataGrid-root',
        before,
      );
    });

    test("room inline-create persists (count increments)", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      await page.goto("/management/rooms");
      await page.waitForSelector("table", { timeout: 15000 });
      const before = await paginationTotal(page);

      await page.getByRole("button", { name: "เพิ่ม", exact: true }).click();
      await page
        .locator('input[placeholder="ชื่อห้อง *"]')
        .fill(`ห้อง WALK-${uniq()}`);
      await page.getByRole("button", { name: "บันทึก" }).click();

      await expectTotalAfterCreate(page, "/management/rooms", "table", before);
    });
  });

  test.describe("4. Schedule wizard", () => {
    test("config summary + 8 MOE learning areas render", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;

      await page.goto(`/schedule/${SEMESTER}/config`);
      await waitForAppReady(page);
      await expect(page.getByTestId("config-status-badge")).toBeVisible({
        timeout: 30000,
      });
      await expect(page.getByText("คาบเรียนต่อวัน")).toBeVisible();

      await page.goto(`/schedule/${SEMESTER}/curriculum`);
      await waitForAppReady(page);
      const areas = [
        "ภาษาไทย",
        "คณิตศาสตร์",
        "วิทยาศาสตร์",
        "สังคม",
        "สุขศึกษา",
        "ศิลปะ",
        "การงาน",
        "ต่างประเทศ",
      ];
      const body = await page.locator("body").innerText();
      for (const area of areas) expect(body).toContain(area);
    });

    // QUARANTINED (ed1): dnd-kit's drop rarely registers under headless
    // chromium in CI (passes ~1/6 runs; pre-existing — fails on main too).
    // The room-picker handling below is correct; the drag harness itself needs
    // a local repro to fix. Restore to `test(` once the drop is reliable.
    test.fixme("arrange: drag-drop places a class, persists, then delete restores", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      const teacherId = await getE2ETeacherId(page);

      await page.goto(
        `/schedule/${SEMESTER}/arrange?teacher=${teacherId}&tab=teacher`,
      );
      await waitForAppReady(page);
      await expect(page.getByTestId("timetable-grid")).toBeVisible({
        timeout: 20000,
      });

      const emptyCount = () =>
        page
          .getByTestId("timeslot-card")
          .filter({ hasText: "คาบว่าง" })
          .count();
      const baseline = await emptyCount();
      test.skip(baseline === 0, "No empty slot for the E2E teacher");

      // Tag the first empty slot so we can target it precisely.
      await page.evaluate(() => {
        const card = [
          ...document.querySelectorAll('[data-testid="timeslot-card"]'),
        ].find((c) => /คาบว่าง/.test(c.textContent ?? ""));
        card?.setAttribute("data-journey-target", "1");
      });

      // dnd-kit's PointerSensor needs intermediate mouse moves to trip its
      // activation constraint; Playwright's dragTo (single down→up) doesn't,
      // so the drop never fires. Use the manual-pointer helper instead.
      await dragAndDrop(
        page,
        page.getByTestId("subject-item").first(),
        page.locator('[data-journey-target="1"]'),
      );

      // The drop either opens the room picker, or — when the teacher+subject's
      // default room is free at this timeslot — auto-assigns it and skips the
      // picker (see ArrangeDndProvider). Which path runs depends on seed/data
      // state, so handle both; the placement assertion below is the invariant
      // that proves the drop landed either way.
      const roomDialog = page.getByTestId("room-selection-dialog");
      const pickerOpened = await roomDialog
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      if (pickerOpened) {
        await roomDialog
          .locator('[data-testid^="room-option-"]:not([aria-disabled="true"])')
          .first()
          .click();
        const confirm = roomDialog.getByTestId("room-confirm");
        if (await confirm.isVisible().catch(() => false)) await confirm.click();
        await expect(roomDialog).toBeHidden({ timeout: 10000 });
      }

      // Placed: one fewer empty slot.
      await expect.poll(emptyCount, { timeout: 10000 }).toBe(baseline - 1);

      // Capture the exact slot we placed into (stable across reload) so the
      // delete below targets THIS class — not another of the teacher's
      // same-subject placements (the seed gives ค21201 multiple cells, which
      // made the old global remove-button locator a strict-mode violation).
      const placedTimeslotId = await page
        .locator('[data-journey-target="1"]')
        .getAttribute("data-timeslot-id");

      // Persistence across reload.
      await page.goto(
        `/schedule/${SEMESTER}/arrange?teacher=${teacherId}&tab=teacher`,
      );
      await waitForAppReady(page);
      await expect(page.getByTestId("timetable-grid")).toBeVisible({
        timeout: 20000,
      });
      await expect.poll(emptyCount, { timeout: 15000 }).toBe(baseline - 1);

      // Delete the placed class -> back to baseline (restores seed state).
      await page
        .locator(`[data-timeslot-id="${placedTimeslotId}"]`)
        .getByTestId("timeslot-remove")
        .click();
      await expect.poll(emptyCount, { timeout: 10000 }).toBe(baseline);
    });

    test("publish gate blocks an incomplete schedule", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      await page.goto(`/schedule/${SEMESTER}/lock`);
      await waitForAppReady(page);

      // The publish CTA lives inside the readiness accordion (collapsed by
      // default) — expand it, then scroll the button into view before clicking.
      const accordion = page.getByTestId("readiness-accordion-summary");
      if (await accordion.isVisible().catch(() => false)) {
        await accordion.click();
      }
      const publishBtn = page.getByTestId("open-publish-dialog-btn");
      await publishBtn.scrollIntoViewIfNeeded();
      await expect(publishBtn).toBeVisible({ timeout: 15000 });
      await publishBtn.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible({ timeout: 10000 });
      // Incomplete schedule: per-class shortfalls listed, force-publish disabled.
      await expect(dialog.getByText(/ยังไม่ครบ/).first()).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "บังคับเผยแพร่" }),
      ).toBeDisabled();
      await dialog.getByRole("button", { name: "ยกเลิก" }).click();
    });
  });

  test.describe("5. Analytics & conflicts", () => {
    test("analytics renders charts WITHOUT a hydration error", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      const hydrationErrors: string[] = [];
      page.on("console", (msg) => {
        if (
          msg.type() === "error" &&
          /hydrat/i.test(msg.text())
        ) {
          hydrationErrors.push(msg.text());
        }
      });

      await page.goto(`/dashboard/${SEMESTER}/analytics`);
      await waitForAppReady(page);
      await expect(page.locator("svg").first()).toBeVisible({ timeout: 20000 });
      // Let client hydrate so any mismatch would surface.
      await page.waitForTimeout(1500);

      expect(
        hydrationErrors,
        `Hydration errors on analytics: ${hydrationErrors.join("\n")}`,
      ).toEqual([]);
    });

    test("conflicts page reports categorized conflict counts", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      await page.goto(`/dashboard/${SEMESTER}/conflicts`);
      await waitForAppReady(page);
      await expect(page.getByText(/Conflict/i).first()).toBeVisible({
        timeout: 15000,
      });
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/ครูซ้ำ|ห้องซ้ำ|ชั้นซ้ำ|ไม่ได้กำหนด/);
    });
  });

  test.describe("6. Exports (real downloads)", () => {
    test("student table exports Excel and PDF", async ({
      authenticatedAdmin,
    }) => {
      const { page } = authenticatedAdmin;
      // PDF render is heavy under CI parallel load; CI runs --timeout=90000 and
      // test.slow() triples it so the render + both downloads fit. The actual
      // robustness fix is render-side in render-pdf.ts (grid-or-empty selector).
      test.slow();
      await page.goto(`/dashboard/${SEMESTER}/student-table`);
      await waitForAppReady(page);

      // Select first grade.
      await page.getByRole("combobox").first().click();
      await page.getByRole("option").first().click();
      await expect(
        page.getByRole("button", { name: "นำออก Excel" }),
      ).toBeEnabled({ timeout: 15000 });

      const xlsx = page.waitForEvent("download");
      await page.getByRole("button", { name: "นำออก Excel" }).click();
      expect((await xlsx).suggestedFilename()).toMatch(/\.xlsx$/);

      // The real flake is render-side (render-pdf.ts now waits for grid-or-empty
      // + 30s); the download only fires after that render completes. 60s fits
      // under the test.slow() budget. Issues: 8fm / d9t / 4i3.
      const pdf = page.waitForEvent("download", { timeout: 60_000 });
      await page.getByRole("button", { name: "นำออก PDF" }).click();
      expect((await pdf).suggestedFilename()).toMatch(/\.pdf$/);
    });

    test("teacher table exports Excel", async ({ authenticatedAdmin }) => {
      const { page } = authenticatedAdmin;
      await page.goto(`/dashboard/${SEMESTER}/teacher-table`);
      await waitForAppReady(page);

      await page.getByTestId("teacher-select").click();
      await page.getByRole("option").first().click();
      await expect(
        page.getByRole("button", { name: "นำออก Excel" }),
      ).toBeEnabled({ timeout: 15000 });

      const xlsx = page.waitForEvent("download");
      await page.getByRole("button", { name: "นำออก Excel" }).click();
      expect((await xlsx).suggestedFilename()).toMatch(/\.xlsx$/);
    });
  });

  test.describe("7. Public pages", () => {
    test("homepage search filters classes", async ({ guestPage }) => {
      await guestPage.goto("/");
      await waitForAppReady(guestPage);
      const linkCount = () =>
        guestPage.locator('a[href*="/classes/"]').count();
      const before = await linkCount();
      expect(before).toBeGreaterThan(1);

      await guestPage
        .locator('input[placeholder*="ค้นหาชั้นเรียน"]')
        .fill("1/1");
      await expect.poll(linkCount, { timeout: 10000 }).toBeLessThan(before);
    });

    test("public class schedule renders", async ({ guestPage }) => {
      // Target a class page (stable GradeID); public teacher pages were removed.
      await guestPage.goto(`/classes/${testTeacher.GradeID}/${SEMESTER}`);
      await waitForAppReady(guestPage);
      await expect(
        guestPage.getByText(/ม\.1\/1|จันทร์/).first(),
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("8. Access control", () => {
    for (const path of [
      "/management/teacher",
      `/schedule/${SEMESTER}/config`,
      `/dashboard/${SEMESTER}/analytics`,
    ]) {
      test(`unauthenticated ${path} -> /signin`, async ({ guestPage }) => {
        await guestPage.goto(path);
        await expect(guestPage).toHaveURL(/\/signin/, { timeout: 15000 });
      });
    }
  });
});
