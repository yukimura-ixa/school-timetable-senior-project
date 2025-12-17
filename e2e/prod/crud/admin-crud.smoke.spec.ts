import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectAdminSession } from "../helpers/session";
import { goToRooms, goToSubjects, goToTeachers } from "../helpers/navigation";

test.describe.configure({ mode: "serial", timeout: 120_000 });

test.skip(
  process.env.E2E_ALLOW_MUTATIONS !== "true",
  "Set E2E_ALLOW_MUTATIONS=true to enable production CRUD smoke tests.",
);

const successToast = (page: Page) =>
  page
    .locator(".notistack-SnackbarContainer, .MuiSnackbar-root")
    .locator("[role='alert'], .MuiAlert-root, .notistack-MuiContent")
    .filter({ hasText: /สำเร็จ|เรียบร้อย|success/i })
    .first();

async function confirmDialogIfPresent(page: Page) {
  const dialog = page.getByRole("dialog").first();
  if (!(await dialog.isVisible({ timeout: 1500 }).catch(() => false))) return;

  const preferredConfirm = dialog
    .locator(
      [
        "button[type='submit']",
        "button:has([data-testid*='confirm' i])",
        "button:has([data-testid*='delete' i])",
        "button[aria-label*='delete' i]",
        "button[class*='MuiButton-containedError']",
        "button[class*='MuiButton-colorError']",
        "button:has-text('Delete')",
        "button:has-text('Confirm')",
        "button:has-text('Yes')",
        "button:has-text('ตกลง')",
        "button:has-text('ยืนยัน')",
        "button:has-text('ลบ')",
      ].join(","),
    )
    .first();

  if (await preferredConfirm.isVisible({ timeout: 1500 }).catch(() => false)) {
    await preferredConfirm.click();
    return;
  }

  const fallback = dialog.getByRole("button").last();
  if (await fallback.isVisible({ timeout: 1500 }).catch(() => false)) {
    await fallback.click();
  }
}

async function selectRowByText(page: Page, text: string) {
  const row = page.locator("tbody tr").filter({ hasText: text }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });
  const checkbox = row.locator('input[type="checkbox"]').first();
  if (await checkbox.isVisible({ timeout: 2000 }).catch(() => false)) {
    await checkbox.check();
  } else {
    await row.click();
  }
}

async function cancelEditingIfPresent(page: Page) {
  const cancel = page.locator('button[aria-label="cancel"]').first();
  if (!(await cancel.isVisible({ timeout: 1500 }).catch(() => false))) return;
  await cancel.click();
  await confirmDialogIfPresent(page);
}

async function findFirstVisibleLocator(locators: Locator[]): Promise<Locator> {
  for (const locator of locators) {
    if (await locator.isVisible({ timeout: 5000 }).catch(() => false)) {
      return locator;
    }
  }
  throw new Error("[PROD E2E] Unable to find a visible search input");
}

async function fillSearch(page: Page, value: string) {
  await page
    .locator("table")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {});

  const candidates = [
    page.getByRole("textbox", { name: "ค้นหารหัสวิชา หรือชื่อวิชา" }).first(),
    page.getByRole("textbox", { name: /ค้นหารหัสวิชา|ค้นหา/i }).first(),
    page.getByRole("textbox", { name: /ค้นหาชื่อ|ค้นหา/i }).first(),
    page.getByRole("textbox", { name: /ค้นหา/i }).first(),
    page.locator("input[type='search']").first(),
    page.locator("input[placeholder*='ค้นหา']").first(),
  ];
  const input = await findFirstVisibleLocator(candidates);
  await input.fill(value);
  await expect(input).toHaveValue(value);
  await page.waitForTimeout(300);
}

test.describe("CRUD (mutating) – Teachers", () => {
  test("create → edit → delete teacher", async ({ page }, testInfo) => {
    await expectAdminSession(page);
    await goToTeachers(page);

    const id = `${Date.now()}-${testInfo.retry}`;
    const firstName = `E2E-Teacher-${id}`;
    const lastName = `E2E-${id}`;
    const email = `e2e_teacher_${id}@test.local`;
    let currentFirstName = firstName;

    // Create
    await page.getByTestId("add-teacher-button").click();
    await page.getByTestId("firstname-0").fill(firstName);
    await page.getByTestId("lastname-0").fill(lastName);
    const emailInput = page.getByTestId("email-0");
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill(email);
    }
    await page.getByTestId("add-teacher-submit").click();
    await expect(successToast(page)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(firstName).first()).toBeVisible({
      timeout: 20_000,
    });

    // Edit (inline)
    const search = page.getByTestId("teacher-search");
    if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
      await search.fill(firstName);
      await page.waitForTimeout(300);
    }
    await selectRowByText(page, firstName);
    const editButton = page.locator('button[aria-label="edit"]').first();
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click();
      const rowInput = page
        .locator("tbody tr input:not([type='checkbox']):visible")
        .first();
      const candidateEditedName = `${firstName}-Edited`;
      if (await rowInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await rowInput.fill(candidateEditedName);
      }
      await page.locator('button[aria-label="save"]').first().click();
      await expect(successToast(page)).toBeVisible({ timeout: 20_000 });

      const editedVisible = await page
        .getByText(candidateEditedName)
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (editedVisible) currentFirstName = candidateEditedName;
    }

    // Delete
    if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
      await search.fill(currentFirstName);
      await page.waitForTimeout(300);
    }
    await selectRowByText(page, currentFirstName);
    await page.locator('button[aria-label="delete"]').first().click();
    await confirmDialogIfPresent(page);
    await expect(page.getByText(currentFirstName).first()).not.toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("CRUD (mutating) – Subjects", () => {
  test("create → edit → delete subject", async ({ page }, testInfo) => {
    await expectAdminSession(page);
    await goToSubjects(page);

    const id = `${Date.now()}-${testInfo.retry}`;
    const uniqueSuffix = `${Date.now()}${testInfo.retry}`.slice(-9);
    const subjectCode = `E2E${uniqueSuffix}`;
    const subjectName = `E2E Subject ${id}`;

    await cancelEditingIfPresent(page);

    // Create (inline)
    const addButton = page
      .getByRole("button", { name: /เพิ่ม|add/i })
      .first();
    await expect(addButton).toBeVisible({ timeout: 20_000 });
    await expect(addButton).toBeEnabled({ timeout: 20_000 });
    await addButton.click();

    const editingRow = page
      .locator("tbody tr")
      .filter({ has: page.locator('input[type="text"]') })
      .first();
    await expect(editingRow).toBeVisible({ timeout: 20_000 });

    const textInputs = editingRow.locator('input[type="text"]');
    await textInputs.first().fill(subjectCode);
    if ((await textInputs.count()) > 1) {
      await textInputs.nth(1).fill(subjectName);
    }

    // Some environments require LearningArea when Category defaults to CORE.
    const comboboxes = editingRow.locator('[role="combobox"]');
    const comboboxCount = await comboboxes.count();
    if (comboboxCount > 0) {
      const byName = editingRow
        .getByRole("combobox", { name: /สาระการเรียนรู้/i })
        .first();
      const learningAreaSelect =
        (await byName.isVisible({ timeout: 800 }).catch(() => false))
          ? byName
          : comboboxCount >= 3
            ? comboboxes.nth(2)
            : comboboxes.last();
      if (await learningAreaSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await learningAreaSelect.click();
        const thai = page.getByRole("option", { name: "ภาษาไทย" }).first();
        if (await thai.isVisible({ timeout: 2000 }).catch(() => false)) {
          await thai.click();
        } else {
          const firstRealOption = page
            .getByRole("option")
            .filter({ hasText: /^(?!-).+/ })
            .first();
          if (await firstRealOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await firstRealOption.click();
          }
        }
      }
    }

    const save = page.locator('button[aria-label="save"]').first();
    await save.click();
    const saved = await save
      .waitFor({ state: "hidden", timeout: 30_000 })
      .then(() => true)
      .catch(() => false);

    if (!saved) {
      const validation = page
        .getByText(/กรุณาเลือกสาระการเรียนรู้|โปรดเลือก/i)
        .first();
      if (await validation.isVisible({ timeout: 1000 }).catch(() => false)) {
        const fallbackLearningArea =
          comboboxCount >= 3 ? comboboxes.nth(2) : comboboxes.last();
        await fallbackLearningArea.click();
        await page.getByRole("option").first().click();
        await save.click();
      }
      await expect(save).toBeHidden({ timeout: 30_000 });
    }

    // Hard-confirm persistence.
    await goToSubjects(page);

    // Filter to ensure the new row is visible even if it's not on the first page.
    await fillSearch(page, subjectCode);
    const createdRow = page.locator("tbody tr").filter({ hasText: subjectCode }).first();
    await expect(createdRow).toBeVisible({ timeout: 60_000 });

    // Edit
    await fillSearch(page, subjectCode);
    await selectRowByText(page, subjectCode);
    const editButton = page.locator('button[aria-label="edit"]').first();
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click();
      const editRow = page
        .locator("tbody tr")
        .filter({ hasText: subjectCode })
        .first();
      const inputs = editRow.locator('input[type="text"]:visible');
      if ((await inputs.count()) > 1) {
        await inputs.nth(1).fill(`${subjectName} (Edited)`);
      }
      const save = page.locator('button[aria-label="save"]').first();
      await save.click();
      await expect(save).toBeHidden({ timeout: 30_000 });
    }

    // Delete
    await goToSubjects(page);
    await fillSearch(page, subjectCode);
    await selectRowByText(page, subjectCode);
    await page.locator('button[aria-label="delete"]').first().click();
    await confirmDialogIfPresent(page);
    await expect(page.getByText(subjectCode).first()).not.toBeVisible({
      timeout: 20_000,
    });
  });
});

test.describe("CRUD (mutating) – Rooms", () => {
  test("create → edit → delete room", async ({ page }, testInfo) => {
    await expectAdminSession(page);
    await goToRooms(page);

    const id = `${Date.now()}-${testInfo.retry}`;
    const roomName = `E2E${Date.now().toString().slice(-8)}${testInfo.retry}`;
    const building = `E2E-Building-${(Date.now() % 1000).toString().padStart(3, "0")}`;
    const floor = "1";

    // Create (inline)
    const addButton = page
      .getByRole("button", { name: /เพิ่ม|add/i })
      .first();
    await expect(addButton).toBeVisible({ timeout: 20_000 });
    await addButton.click();

    const editingRow = page
      .locator("tbody tr")
      .filter({ has: page.locator('input[type="text"]') })
      .first();
    await expect(editingRow).toBeVisible({ timeout: 20_000 });

    const textInputs = editingRow.locator('input[type="text"]');
    await textInputs.first().fill(roomName);
    if ((await textInputs.count()) > 1) {
      await textInputs.nth(1).fill(building);
    }
    if ((await textInputs.count()) > 2) {
      await textInputs.nth(2).fill(floor);
    }

    await page.locator('button[aria-label="save"]').first().click();
    await expect(successToast(page)).toBeVisible({ timeout: 20_000 });
    await goToRooms(page);
    await fillSearch(page, roomName);
    await expect(page.getByText(roomName).first()).toBeVisible({ timeout: 60_000 });

    // Edit (optional; depends on EditableTable columns)
    await fillSearch(page, roomName);
    await selectRowByText(page, roomName);
    const editButton = page.locator('button[aria-label="edit"]').first();
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click();
      const editRow = page
        .locator("tbody tr")
        .filter({ hasText: roomName })
        .first();
      const inputs = editRow.locator('input[type="text"]:visible');
      if ((await inputs.count()) > 1) {
        await inputs.nth(1).fill(`${building}-Edited`);
      }
      await page.locator('button[aria-label="save"]').first().click();
      await expect(successToast(page)).toBeVisible({ timeout: 20_000 });
    }

    // Delete
    await goToRooms(page);
    await fillSearch(page, roomName);
    await selectRowByText(page, roomName);
    await page.locator('button[aria-label="delete"]').first().click();
    await confirmDialogIfPresent(page);
    await goToRooms(page);
    await fillSearch(page, roomName);
    await expect(page.getByText(roomName).first()).not.toBeVisible({
      timeout: 60_000,
    });
  });
});
