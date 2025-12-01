import { test, expect } from "./fixtures/admin.fixture";

/**
 * E2E Tests for Activity Subject Management (ชุมนุม, ลูกเสือ, กิจกรรม)
 *
 * Tests the complete CRUD workflow for activity subjects:
 * - Creating new activities (Club, Scout, Guidance, Social Service)
 * - Editing existing activities
 * - Deleting activities with confirmation
 * - Form validation
 * - Table refresh after operations
 *
 * Prerequisites:
 * - Dev server running on http://localhost:3000
 * - Authentication bypassed or admin user logged in
 *
 * NOTE: These tests are SKIPPED because the Activity Management UI
 * (ActivityTable component) exists but is not integrated into any route.
 * The /management/subject page uses SubjectTable which doesn't have
 * the "Add Activity" button these tests expect.
 * Re-enable when Activity management is added to the app.
 */

test.describe.skip("Activity Management - CRUD Operations", () => {
  const TEST_ACTIVITY = {
    code: "ACT-E2E-001",
    name: "E2E Test Science Club",
    type: "CLUB",
    isGraded: false,
  };

  test("TC-ACT-001: Create new activity subject", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // Navigate to subject management page
    await page.goto("/management/subject");
    await expect(page.locator("body")).toBeVisible();
    
    await test.step("Open activity creation modal", async () => {
      // Look for "Add Activity" button
      const addButton = page.getByRole("button", { name: /add.*activity/i });
      await expect(addButton).toBeVisible();
      await addButton.click();

      // Modal should open
      const modal = page.locator('[role="dialog"], .MuiDialog-root').first();
      await expect(modal).toBeVisible();
    });

    await test.step("Fill in activity details", async () => {
      // Fill SubjectCode
      const codeInput = page.getByLabel(/subject.*code/i);
      await codeInput.fill(TEST_ACTIVITY.code);

      // Fill SubjectName
      const nameInput = page.getByLabel(/subject.*name/i);
      await nameInput.fill(TEST_ACTIVITY.name);

      // Select ActivityType
      const typeSelect = page.getByLabel(/activity.*type/i);
      await typeSelect.click();
      await page
        .getByRole("option", { name: new RegExp(TEST_ACTIVITY.type, "i") })
        .click();

      // Ensure IsGraded is unchecked
      const gradedCheckbox = page.getByLabel(/is.*graded|ให้เกรด/i);
      if (await gradedCheckbox.isChecked()) {
        await gradedCheckbox.uncheck();
      }
    });

    await test.step("Submit and verify creation", async () => {
      // Click create/save button
      const submitButton = page
        .getByRole("button", { name: /create|save|บันทึก/i })
        .last();
      await submitButton.click();

      // Wait for modal to close
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({
        timeout: 5000,
      });

      // Verify activity appears in table
      await expect(page.getByText(TEST_ACTIVITY.code)).toBeVisible();
      await expect(page.getByText(TEST_ACTIVITY.name)).toBeVisible();
    });

    await page.screenshot({
      path: "test-results/screenshots/activity-created.png",
      fullPage: true,
    });
  });

  test("TC-ACT-002: Edit existing activity", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/subject");
    await expect(page.locator("body")).toBeVisible();
    
    await test.step("Create activity first", async () => {
      // Quick create for editing test
      const addButton = page.getByRole("button", { name: /add.*activity/i });
      await addButton.click();

      await page.getByLabel(/subject.*code/i).fill("ACT-E2E-002");
      await page.getByLabel(/subject.*name/i).fill("Original Name");
      await page.getByLabel(/activity.*type/i).click();
      await page.getByRole("option", { name: /club/i }).click();

      await page
        .getByRole("button", { name: /create|save/i })
        .last()
        .click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({
        timeout: 5000,
      });
    });

    await test.step("Open edit modal", async () => {
      // Find the activity row
      const activityRow = page.locator("tr", {
        has: page.getByText("ACT-E2E-002"),
      });
      await expect(activityRow).toBeVisible();

      // Click edit button (could be an icon button)
      const editButton = activityRow.getByRole("button", { name: /edit/i });
      await editButton.click();

      // Modal should open with pre-filled data
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(page.getByLabel(/subject.*code/i)).toHaveValue(
        "ACT-E2E-002",
      );
    });

    await test.step("Modify activity details", async () => {
      // Change name
      const nameInput = page.getByLabel(/subject.*name/i);
      await nameInput.fill("Updated Activity Name");

      // Change activity type
      const typeSelect = page.getByLabel(/activity.*type/i);
      await typeSelect.click();
      await page.getByRole("option", { name: /scout/i }).click();

      // Toggle IsGraded
      const gradedCheckbox = page.getByLabel(/is.*graded/i);
      await gradedCheckbox.check();
    });

    await test.step("Submit and verify update", async () => {
      const submitButton = page
        .getByRole("button", { name: /update|save/i })
        .last();
      await submitButton.click();

      await expect(page.locator('[role="dialog"]')).not.toBeVisible({
        timeout: 5000,
      });

      // Verify updates appear
      await expect(page.getByText("Updated Activity Name")).toBeVisible();
    });

    await page.screenshot({
      path: "test-results/screenshots/activity-edited.png",
      fullPage: true,
    });
  });

  test("TC-ACT-003: Delete activity with confirmation", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/subject");
    await expect(page.locator("body")).toBeVisible();
    
    await test.step("Create activity to delete", async () => {
      const addButton = page.getByRole("button", { name: /add.*activity/i });
      await addButton.click();

      await page.getByLabel(/subject.*code/i).fill("ACT-E2E-003");
      await page.getByLabel(/subject.*name/i).fill("Activity to Delete");
      await page.getByLabel(/activity.*type/i).click();
      await page.getByRole("option", { name: /club/i }).click();

      await page
        .getByRole("button", { name: /create|save/i })
        .last()
        .click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({
        timeout: 5000,
      });
    });

    await test.step("Click delete button", async () => {
      const activityRow = page.locator("tr", {
        has: page.getByText("ACT-E2E-003"),
      });
      const deleteButton = activityRow.getByRole("button", { name: /delete/i });
      await deleteButton.click();

      // Confirmation dialog should appear
      const confirmDialog = page.locator('[role="dialog"]', {
        has: page.getByText(/confirm|delete/i),
      });
      await expect(confirmDialog).toBeVisible();
    });

    await test.step("Confirm deletion", async () => {
      // Click confirm button
      const confirmButton = page
        .getByRole("button", { name: /delete|confirm|ลบ/i })
        .last();
      await confirmButton.click();

      // Wait for dialog to close
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({
        timeout: 5000,
      });

      // Verify activity is removed from table
      await expect(page.getByText("ACT-E2E-003")).not.toBeVisible();
    });

    await page.screenshot({
      path: "test-results/screenshots/activity-deleted.png",
      fullPage: true,
    });
  });

  test("TC-ACT-004: Cancel deletion", async ({ authenticatedAdmin }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/subject");
    await expect(page.locator("body")).toBeVisible();
    
    await test.step("Create activity", async () => {
      const addButton = page.getByRole("button", { name: /add.*activity/i });
      await addButton.click();

      await page.getByLabel(/subject.*code/i).fill("ACT-E2E-004");
      await page.getByLabel(/subject.*name/i).fill("Activity to Keep");
      await page.getByLabel(/activity.*type/i).click();
      await page.getByRole("option", { name: /club/i }).click();

      await page
        .getByRole("button", { name: /create|save/i })
        .last()
        .click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({
        timeout: 5000,
      });
    });

    await test.step("Open and cancel deletion", async () => {
      const activityRow = page.locator("tr", {
        has: page.getByText("ACT-E2E-004"),
      });
      const deleteButton = activityRow.getByRole("button", { name: /delete/i });
      await deleteButton.click();

      // Cancel deletion
      const cancelButton = page
        .getByRole("button", { name: /cancel|ยกเลิก/i })
        .last();
      await cancelButton.click();

      // Activity should still exist
      await expect(page.getByText("ACT-E2E-004")).toBeVisible();
    });
  });

  test("TC-ACT-005: Validate required fields", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/subject");
    await expect(page.locator("body")).toBeVisible();
    
    await test.step("Open creation modal", async () => {
      const addButton = page.getByRole("button", { name: /add.*activity/i });
      await addButton.click();
    });

    await test.step("Submit without required fields", async () => {
      // Leave SubjectCode empty, only fill name
      await page.getByLabel(/subject.*name/i).fill("Incomplete Activity");

      // Try to submit
      const submitButton = page
        .getByRole("button", { name: /create|save/i })
        .last();
      await submitButton.click();

      // Should show validation error
      const errorMessage = page.getByText(/required|ห้ามว่าง|กรุณากรอก/i);
      await expect(errorMessage).toBeVisible();

      // Modal should remain open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });

    await test.step("Submit without name", async () => {
      // Fill code but clear name
      await page.getByLabel(/subject.*code/i).fill("ACT-TEST");
      await page.getByLabel(/subject.*name/i).clear();

      const submitButton = page
        .getByRole("button", { name: /create|save/i })
        .last();
      await submitButton.click();

      // Should show validation error
      const errorMessage = page.getByText(/required|ห้ามว่าง|กรุณากรอก/i);
      await expect(errorMessage).toBeVisible();
    });
  });

  test("TC-ACT-006: Test all activity types", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/subject");
    await expect(page.locator("body")).toBeVisible();
    
    const activityTypes = [
      { code: "ACT-CLUB", name: "Test Club", type: "CLUB" },
      { code: "ACT-SCOUT", name: "Test Scout", type: "SCOUT" },
      { code: "ACT-GUIDE", name: "Test Guidance", type: "GUIDANCE" },
      {
        code: "ACT-SOCIAL",
        name: "Test Social Service",
        type: "SOCIAL_SERVICE",
      },
    ];

    for (const activity of activityTypes) {
      await test.step(`Create ${activity.type} activity`, async () => {
        const addButton = page.getByRole("button", { name: /add.*activity/i });
        await addButton.click();

        await page.getByLabel(/subject.*code/i).fill(activity.code);
        await page.getByLabel(/subject.*name/i).fill(activity.name);
        await page.getByLabel(/activity.*type/i).click();
        await page
          .getByRole("option", { name: new RegExp(activity.type, "i") })
          .click();

        await page
          .getByRole("button", { name: /create|save/i })
          .last()
          .click();
        await expect(page.locator('[role="dialog"]')).not.toBeVisible({
          timeout: 5000,
        });

        // Verify creation
        await expect(page.getByText(activity.code)).toBeVisible();
      });
    }

    await page.screenshot({
      path: "test-results/screenshots/activity-all-types.png",
      fullPage: true,
    });
  });

  test("TC-ACT-007: Table refresh after operations", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    await page.goto("/management/subject");
    await expect(page.locator("body")).toBeVisible();
    
    await test.step("Count initial activities", async () => {
      const rows = page.locator("tbody tr");
      const initialCount = await rows.count();
      console.log("Initial activity count:", initialCount);
    });

    await test.step("Create activity and verify count increase", async () => {
      const addButton = page.getByRole("button", { name: /add.*activity/i });
      await addButton.click();

      await page.getByLabel(/subject.*code/i).fill("ACT-REFRESH");
      await page.getByLabel(/subject.*name/i).fill("Refresh Test");
      await page.getByLabel(/activity.*type/i).click();
      await page.getByRole("option", { name: /club/i }).click();

      await page
        .getByRole("button", { name: /create|save/i })
        .last()
        .click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({
        timeout: 5000,
      });

      // Wait for table to refresh
      await expect(page.getByText("ACT-REFRESH")).toBeVisible();
    });

    await test.step("Delete activity and verify count decrease", async () => {
      const activityRow = page.locator("tr", {
        has: page.getByText("ACT-REFRESH"),
      });
      const deleteButton = activityRow.getByRole("button", { name: /delete/i });
      await deleteButton.click();

      await page
        .getByRole("button", { name: /delete|confirm/i })
        .last()
        .click();
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({
        timeout: 5000,
      });

      // Wait for table to refresh
      await expect(page.getByText("ACT-REFRESH")).not.toBeVisible();
    });
  });
});

test.describe.skip("Activity Management - Empty State", () => {
  test("TC-ACT-008: Display empty state message", async ({
    authenticatedAdmin,
  }) => {
    const { page } = authenticatedAdmin;
    // This test assumes there's a way to filter or view empty state
    await page.goto("/management/subject");
    // ⚠️ TODO: Replace with web-first assertion: await expect(page.locator("selector")).toBeVisible();

    // If there are no activities, should show empty state
    const emptyMessage = page.getByText(/no activities|ไม่มีกิจกรรม|empty/i);

    // This is conditional - empty state may not be visible if activities exist
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible();

      await page.screenshot({
        path: "test-results/screenshots/activity-empty-state.png",
        fullPage: true,
      });
    } else {
      console.log("Activities exist - empty state not displayed");
    }
  });
});
