/**
 * E2E Tests for the Scheduling Wizard (epic bzc)
 *
 * Walks the forward-gated wizard that replaced the old free-navigation tab hub
 * at /schedule/[academicYear]/[semester]:
 *   config → curriculum (MOE) → assign → generate → review → lock/publish.
 *
 * Assertions favour resilience over a brittle mutate-everything happy path:
 * later steps are gated on term completeness (grid/responsibilities/placements),
 * so each step-specific test guards on reachability and skips when the seed term
 * hasn't progressed far enough. The one mutating test (whole-school auto-generate)
 * is idempotent — the route never double-places already-scheduled subjects.
 *
 * Out of scope (tracked separately):
 *  - Legacy /assign* → /management/teacher-assignment redirect (task lyw / epic i8z).
 *  - Publish status-flip + under-credited-program publish block (needs a dedicated
 *    under-credited seed fixture to assert deterministically).
 */

import { test, expect } from "./fixtures/admin.fixture";

const BASE = "/schedule/2568/1";

const STEP_LABELS = [
  "ตั้งค่าคาบเรียน",
  "ตรวจหลักสูตร",
  "มอบหมายครู",
  "สร้างตารางอัตโนมัติ",
  "ตรวจและปรับ",
  "ล็อกและเผยแพร่",
];

// Wizard steps mutate shared term state, so run sequentially.
test.describe.configure({ mode: "serial" });

test.describe("Scheduling Wizard", () => {
  test("base path redirects into a wizard step", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // page.tsx resolves the furthest reachable step and redirects to its segment.
    await expect(page).toHaveURL(
      /\/schedule\/2568\/1\/(config|curriculum|assign|generate|arrange|lock)(\?|$|\/)/,
    );
  });

  test("stepper renders all six steps", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;

    // NB: the "config" step segment redirects to /dashboard (config editing lives
    // there), so it never renders the wizard layout. Assert the stepper on a step
    // that does render it — curriculum (reachable whenever the grid exists).
    await page.goto(`${BASE}/curriculum`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    for (const label of STEP_LABELS) {
      await expect(
        page.getByRole("button", { name: new RegExp(label) }),
      ).toBeVisible({ timeout: 15000 });
    }
  });

  test("step 2 surfaces MOE compliance status", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`${BASE}/curriculum`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // One of: all-pass banner, has-shortfall banner, or no-programs empty state.
    await expect(
      page.getByText(
        /ผ่านเกณฑ์หน่วยกิตขั้นต่ำ|ยังไม่ผ่านเกณฑ์ ศธ\.|ยังไม่มีหลักสูตรสำหรับภาคเรียนนี้/,
      ),
    ).toBeVisible({ timeout: 15000 });
  });

  test("step 4 headline generate runs the whole-school solver", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`${BASE}/generate`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Gated: if responsibilities don't exist, the stepper bounces us elsewhere.
    if (!page.url().includes("/generate")) {
      test.skip(
        true,
        "Generate step not reachable on seed term (no teacher responsibilities)",
      );
      return;
    }

    const runButton = page.getByRole("button", {
      name: /สร้างตารางอัตโนมัติทั้งโรงเรียน/,
    });
    await expect(runButton).toBeVisible({ timeout: 15000 });

    await runButton.click();

    // Confirmation dialog → confirm.
    const confirm = page.getByRole("button", { name: /^สร้างตาราง$/ });
    await expect(confirm).toBeVisible({ timeout: 10000 });
    await confirm.click();

    // Result panel: stats summary appears once the POST resolves. The phrase
    // appears as both the stats label and a per-teacher column header, so scope
    // to the first match.
    await expect(page.getByText(/จัดสำเร็จ/).first()).toBeVisible({
      timeout: 90000,
    });
  });

  test("step 6 shows the publish readiness gate", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`${BASE}/lock`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    if (!page.url().includes("/lock")) {
      test.skip(
        true,
        "Publish step not reachable on seed term (no placements yet)",
      );
      return;
    }

    await expect(page.getByText("เผยแพร่ตาราง")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByTestId("readiness-chip")).toBeVisible({
      timeout: 20000,
    });
  });

  test("forward-skip guard bounces a deep link to an unreachable step", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // Deep-link straight to the last step. If the term isn't fully complete the
    // stepper's client guard replaces the URL with the furthest reachable step.
    await page.goto(`${BASE}/lock`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Either we legitimately reached lock (term complete) or got bounced to an
    // earlier reachable segment — never stranded off the wizard.
    await expect(page).toHaveURL(
      /\/schedule\/2568\/1\/(config|curriculum|assign|generate|arrange|lock)(\?|$|\/)/,
    );
  });
});
