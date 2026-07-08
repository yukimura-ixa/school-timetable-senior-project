/**
 * E2E: CreateSemesterWizard copyAssignments toggle (task clr / follow-up to a77)
 *
 * Asserts the wizard's "คัดลอกการมอบหมายครู" checkbox carries teacher
 * assignments from the source semester to the new one when on, and leaves the
 * target empty when off. End-to-end proof that:
 *   wizard → createSemesterWithTimeslotsAction → teachers_responsibility rows
 *   → /management/teacher-assignment shows assigned-teacher cells without any
 *   manual click.
 *
 * Source: 1-2568 (default seed; M1-1 has guaranteed responsibility rows for
 * ค21201 + ท21101 in prisma/seed.ts).
 *
 * Targets (within year-picker range currentYear±2; today=2569 Buddhist):
 *   - copy=true  → 1-2569
 *   - copy=false → 2-2569
 *
 * Retry safety: tests can leave behind a table_config row that turns a retry
 * into a CONFLICT error for the wrong reason. beforeAll/afterAll wipe both
 * target configs via direct Prisma against the test DB.
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { test, expect } from "./fixtures/admin.fixture";
import { PrismaClient } from "../prisma/generated/client";
import type { Page } from "@playwright/test";

const SOURCE_LABEL = /ภาคเรียนที่ 1\/2568/;
// AssignmentFilters' grade Select lists grade YEARS ("ม.1"…"ม.6") since the
// coverage-matrix redesign (59b2b1dd); sections (ม.1/1, …) are matrix columns.
const TARGET_GRADE_LABEL = "ม.1";

const TARGETS = [
  { configId: "1-2569", year: 2569, sem: 1 },
  { configId: "2-2569", year: 2569, sem: 2 },
];

// Both tests mutate shared DB state; run them sequentially.
test.describe.configure({ mode: "serial" });

let pool: Pool;
let prisma: PrismaClient;

async function wipeTargets() {
  for (const { year, sem } of TARGETS) {
    const semEnum = sem === 1 ? "SEMESTER_1" : "SEMESTER_2";
    await prisma.teachers_responsibility.deleteMany({
      where: { AcademicYear: year, Semester: semEnum },
    });
    await prisma.class_schedule.deleteMany({
      where: { timeslot: { AcademicYear: year, Semester: semEnum } },
    });
    await prisma.timeslot.deleteMany({
      where: { AcademicYear: year, Semester: semEnum },
    });
    await prisma.table_config.deleteMany({
      where: { ConfigID: `${sem}-${year}` },
    });
  }
}

test.beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  await wipeTargets();
});

test.afterAll(async () => {
  try {
    await wipeTargets();
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
});

async function createSemesterViaWizard(
  page: Page,
  { year, sem, copyAssignments }: { year: number; sem: number; copyAssignments: boolean },
) {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: /สร้างภาคเรียนใหม่/ }).first().click();

  const dialog = page.getByRole("dialog");

  // Step 1: Basic info — set year + sem.
  // The wizard pre-fills current Buddhist year; overwrite to be explicit.
  const yearField = dialog.getByLabel("ปีการศึกษา", { exact: true });
  await expect(yearField).toBeVisible({ timeout: 10000 });
  await yearField.fill(String(year));

  // MUI Select renders the selected value as the combobox's accessible text,
  // so we scope to the wizard dialog (step 1 has only the semester combobox)
  // and pick the visible Select rather than chasing the label.
  await dialog.getByRole("combobox").click();
  await page
    .getByRole("option", { name: new RegExp(`^ภาคเรียนที่ ${sem}$`) })
    .click();

  await page.getByRole("button", { name: "ถัดไป" }).click();

  // Step 2: CopyPrevious — pick source 1-2568, toggle copyAssignments.
  // Step 2 also has exactly one combobox visible (source semester picker).
  await dialog.getByRole("combobox").click();
  await page.getByRole("option", { name: SOURCE_LABEL }).first().click();

  const assignCheckbox = page.getByRole("checkbox", {
    name: /คัดลอกการมอบหมายครู/,
  });
  await expect(assignCheckbox).toBeVisible({ timeout: 10000 });
  if (copyAssignments) {
    await assignCheckbox.check();
  } else {
    // Default-off; keep it that way but assert state to avoid flakiness.
    await expect(assignCheckbox).not.toBeChecked();
  }

  // copyTimeslots default=true → handleNext jumps step 1 → step 3 (review).
  await page.getByRole("button", { name: "ถัดไป" }).click();

  // Step 4 (Review) → Create. The dashboard's outer button is
  // "สร้างภาคเรียนใหม่"; scope to dialog to avoid an ambiguous match.
  await dialog.getByRole("button", { name: "สร้างภาคเรียน", exact: true }).click();

  // On success the wizard fires a snackbar then calls handleSelectSemester
  // which router.pushes /dashboard/{year}/{sem}/student-table. We wait for the
  // snackbar (cheap) and then for either the URL change or the dialog close.
  await expect(page.getByText("สร้างภาคเรียนสำเร็จ")).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10000 });
}

async function openTeacherAssignmentForTarget(
  page: Page,
  { year, sem }: { year: number; sem: number },
) {
  await page.goto("/management/teacher-assignment", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForLoadState("networkidle");

  // AssignmentFilters renders 3 MUI Selects in order: grade, semester, year.
  const filters = page.locator("main, body").first();
  const filterCombos = filters.getByRole("combobox");
  await expect(filterCombos.nth(2)).toBeVisible({ timeout: 15000 });

  // Year first so semester/grade options re-fetch against the new year.
  await filterCombos.nth(2).click();
  await page.getByRole("option", { name: String(year), exact: true }).click();

  await filterCombos.nth(1).click();
  await page
    .getByRole("option", { name: new RegExp(`^ภาคเรียนที่ ${sem}$`) })
    .click();

  await filterCombos.nth(0).click();
  await page
    .getByRole("option", { name: TARGET_GRADE_LABEL, exact: true })
    .click();

  // Wait for the coverage-matrix table to settle (seed guarantees M1 has subjects).
  await expect(page.locator("table tbody tr").first()).toBeVisible({
    timeout: 20000,
  });
}

test.describe("CreateSemesterWizard — copyAssignments toggle", () => {
  test("copyAssignments=true carries teacher assignments to target semester", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await createSemesterViaWizard(page, {
      year: 2569,
      sem: 1,
      copyAssignments: true,
    });

    await openTeacherAssignmentForTarget(page, { year: 2569, sem: 1 });

    // GradeCoverageMatrix renders a teacher-name Chip inside a cell only when a
    // persisted assignment exists; unassigned cells render an "เพิ่มครู" Button
    // and the legend Chips live outside the table, so scope to table Chips.
    const assignedChips = page.locator("table .MuiChip-root");
    await expect(assignedChips.first()).toBeVisible({ timeout: 15000 });
  });

  test("copyAssignments=false leaves target semester without assignments", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;

    await createSemesterViaWizard(page, {
      year: 2569,
      sem: 2,
      copyAssignments: false,
    });

    await openTeacherAssignmentForTarget(page, { year: 2569, sem: 2 });

    // Subject rows still render (program_subject is not semester-scoped) but
    // every in-program cell must be an unassigned "เพิ่มครู" gap — no
    // teacher-name Chip anywhere in the matrix table.
    const assignedChips = page.locator("table .MuiChip-root");
    await expect(assignedChips).toHaveCount(0, { timeout: 15000 });
  });
});
