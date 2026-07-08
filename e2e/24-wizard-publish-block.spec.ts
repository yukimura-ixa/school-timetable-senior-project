/**
 * E2E: Publish gate blocks a deliberately under-credited program (task z45)
 *
 * Deferred from 23-wizard-flow.spec.ts. Covers the "under-credited program
 * must block publish AND show as failing in the step-2 curriculum panel" case.
 *
 * Why a DB fixture instead of the demo seed alone:
 *   checkPublishReadiness + findFullConfigData query programs/gradelevels
 *   UNFILTERED, so MOE readiness is a GLOBAL property of the whole school.
 *   We add one isolated, deliberately-failing program (Year 4 / GENERAL — a
 *   (Year, Track) combo the demo seed leaves free, so the insert is purely
 *   additive and never collides with the real M4-SCI) with zero subjects, then
 *   assert it surfaces as failing. Teardown deletes it.
 *
 * The companion clean happy-path (status flip to PUBLISHED through a "ready"
 * gate) needs a dedicated minimal-seed mode + its own Playwright project — see
 * follow-up task kjm. It cannot run here because all 18 demo programs already
 * fail MOE on missing learning areas, not just low credits.
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { test, expect } from "./fixtures/admin.fixture";
import { PrismaClient } from "../prisma/generated/client";

const BASE = "/schedule/2568/1";

// Distinctive name so it can be located in the curriculum panel and the
// publish dialog issue list without matching any real program.
const FIXTURE_PROGRAM_CODE = "M4-GEN-UNDERCREDIT-E2E";
const FIXTURE_PROGRAM_NAME = "หลักสูตรทดสอบขาดหน่วยกิต E2E";

// Both tests read shared global program state; keep them ordered.
test.describe.configure({ mode: "serial" });

let pool: Pool;
let prisma: PrismaClient;

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Idempotent: clear any leftover from a crashed run, then insert fresh.
  await prisma.program.deleteMany({ where: { ProgramCode: FIXTURE_PROGRAM_CODE } });
  const fixture = await prisma.program.create({
    data: {
      ProgramCode: FIXTURE_PROGRAM_CODE,
      ProgramName: FIXTURE_PROGRAM_NAME,
      Year: 4,
      Track: "GENERAL",
      IsActive: true,
    },
  });
  // Programs inherit the full Year-4 CORE template (grade_fundamental), which
  // now satisfies every learning-area minimum on its own — so exclude Thai to
  // make this program genuinely under-credited. Cascade-deleted with the
  // program in teardown.
  await prisma.program_fundamental_override.create({
    data: {
      ProgramID: fixture.ProgramID,
      SubjectCode: "ท31101",
      Excluded: true,
    },
  });
});

test.afterAll(async () => {
  try {
    await prisma.program.deleteMany({
      where: { ProgramCode: FIXTURE_PROGRAM_CODE },
    });
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
});

test.describe("Publish gate — under-credited program", () => {
  test("step 2 curriculum panel marks the program as failing", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await page.goto(`${BASE}/curriculum`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Top banner reflects at-least-one shortfall across the school.
    await expect(
      page.getByText("มีหลักสูตรที่ยังไม่ผ่านเกณฑ์ ศธ. — แก้ไขก่อนเผยแพร่ตาราง"),
    ).toBeVisible({ timeout: 15000 });

    // The fixture program's own card must carry the "ไม่ผ่านเกณฑ์" chip.
    const card = page
      .locator(".MuiPaper-root")
      .filter({ hasText: FIXTURE_PROGRAM_NAME });
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card.getByText("ไม่ผ่านเกณฑ์")).toBeVisible();
  });

  test("publish dialog lists the program as a blocking issue", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    // d3d86c1a moved the publish readiness UI from /lock to its own /publish step.
    await page.goto(`${BASE}/publish`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Wizard client guard may bounce a deep link if the term isn't far enough.
    if (!page.url().includes("/publish")) {
      test.skip(true, "Publish step not reachable on seed term");
      return;
    }

    // Readiness chip resolves to the blocked state (never "พร้อมเผยแพร่").
    const chip = page.getByTestId("readiness-chip");
    await expect(chip).toBeVisible({ timeout: 20000 });
    await expect(chip).toContainText("มีปัญหา");

    // Expand the accordion, open the publish dialog.
    await page.getByTestId("readiness-accordion-summary").click();
    await page.getByTestId("open-publish-dialog-btn").click();

    // Blocked dialog: warning title, force-publish path, no clean confirm.
    await expect(
      page.getByText("เผยแพร่โดยมีปัญหาที่ยังไม่แก้ไข"),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("force-publish-btn")).toBeVisible();
    await expect(page.getByTestId("confirm-publish-btn")).toHaveCount(0);

    // The fixture program appears by name in the dialog's issue list.
    await expect(page.getByText(FIXTURE_PROGRAM_NAME)).toBeVisible();

    // Do not force-publish — that would mutate the shared 2568/1 config.
  });
});
