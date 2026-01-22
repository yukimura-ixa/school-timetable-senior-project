import { test, expect } from "@playwright/test";

/**
 * [journey] E2E: User Profile Management
 *
 * Tests the profile page functionality:
 * - Navigation from navbar to profile
 * - Profile information display (avatar, name)
 * - Name update functionality
 * - Password change functionality
 * - Email change functionality
 *
 * Uses authenticated session from auth.setup.ts
 */

test.describe("User Profile Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard first (requires auth)
    await page.goto("/dashboard", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");
  });

  test("should navigate to profile page from navbar", async ({ page }) => {
    // Click on user avatar/name in navbar to go to profile
    const profileLink = page.locator('a[href="/dashboard/profile"]');
    await expect(profileLink).toBeVisible({ timeout: 10000 });
    await profileLink.click();

    // Wait for navigation to complete
    await page.waitForURL("/dashboard/profile", { timeout: 30000 });

    // Page title should be visible
    await expect(page.getByText("โปรไฟล์ของฉัน")).toBeVisible({ timeout: 10000 });
  });

  test("should display profile information section", async ({ page }) => {
    await page.goto("/dashboard/profile", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");

    // Profile section should be visible
    await expect(page.getByText("ข้อมูลส่วนตัว")).toBeVisible();

    // Avatar should be displayed
    const avatar = page
      .locator('[data-testid="profile-avatar"]')
      .or(page.locator(".MuiAvatar-root").first());
    await expect(avatar).toBeVisible();

    // Name field should be visible
    const nameField = page.getByLabel("ชื่อ-นามสกุล");
    await expect(nameField).toBeVisible();

    // Save button should be disabled when no changes
    const saveButton = page.getByRole("button", { name: /บันทึก/ });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();
  });

  test("should display password change section", async ({ page }) => {
    await page.goto("/dashboard/profile", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");

    // Password section heading should be visible
    await expect(page.getByRole("heading", { name: "เปลี่ยนรหัสผ่าน" })).toBeVisible({ timeout: 15000 });

    // Password fields should be visible (use data-testid for MUI TextFields)
    await expect(page.getByTestId("current-password-field")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("new-password-field")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("confirm-password-field")).toBeVisible({ timeout: 10000 });

    // Checkbox for revoking other sessions
    await expect(
      page.getByLabel("ออกจากระบบในอุปกรณ์อื่นทั้งหมด"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should display email change section", async ({ page }) => {
    await page.goto("/dashboard/profile", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");

    // Email section heading should be visible
    await expect(page.getByRole("heading", { name: "เปลี่ยนอีเมล" })).toBeVisible({ timeout: 15000 });

    // Email fields should be visible
    await expect(page.getByLabel("อีเมลปัจจุบัน")).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel("อีเมลใหม่")).toBeVisible({ timeout: 10000 });

    // Info alert about verification
    await expect(
      page.getByText(/การเปลี่ยนอีเมลจะต้องยืนยันผ่านลิงก์/),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should enable save button when name is changed", async ({ page }) => {
    await page.goto("/dashboard/profile", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");

    const nameField = page.getByLabel("ชื่อ-นามสกุล");
    const saveButton = page.getByRole("button", { name: /บันทึก/ }).first();

    // Save button should be disabled initially
    await expect(saveButton).toBeDisabled();

    // Get current value
    const currentName = await nameField.inputValue();

    // Change the name
    await nameField.fill(currentName + " Test");

    // Save button should now be enabled
    await expect(saveButton).toBeEnabled();

    // Revert to original to keep database clean
    await nameField.fill(currentName);
    await expect(saveButton).toBeDisabled();
  });

  test("should validate password requirements", async ({ page }) => {
    await page.goto("/dashboard/profile", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");

    // Wait for password section heading to be visible first
    await expect(page.getByRole("heading", { name: "เปลี่ยนรหัสผ่าน" })).toBeVisible({ timeout: 15000 });

    // Use data-testid for the MUI TextField, then find the input inside it
    const newPasswordField = page.getByTestId("new-password-field").locator("input");
    await expect(newPasswordField).toBeVisible({ timeout: 10000 });

    // Enter a short password
    await newPasswordField.fill("short");
    await newPasswordField.blur();

    // Should show error about password length
    await expect(page.getByText(/รหัสผ่านสั้นเกินไป/)).toBeVisible({ timeout: 5000 });

    // Enter valid length password
    await newPasswordField.fill("validpassword123");
    await newPasswordField.blur();

    // Error should disappear
    await expect(page.getByText(/รหัสผ่านสั้นเกินไป/)).not.toBeVisible();
  });

  test("should validate password confirmation match", async ({ page }) => {
    await page.goto("/dashboard/profile", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");

    // Wait for password section heading to be visible first
    await expect(page.getByRole("heading", { name: "เปลี่ยนรหัสผ่าน" })).toBeVisible({ timeout: 15000 });

    // Use data-testid for MUI TextFields, then find inputs inside
    const newPasswordField = page.getByTestId("new-password-field").locator("input");
    const confirmPasswordField = page.getByTestId("confirm-password-field").locator("input");
    await expect(newPasswordField).toBeVisible({ timeout: 10000 });
    await expect(confirmPasswordField).toBeVisible({ timeout: 10000 });

    // Enter different passwords
    await newPasswordField.fill("password123");
    await confirmPasswordField.fill("different456");

    // Blur to trigger validation
    await confirmPasswordField.blur();

    // Should show mismatch error in helperText
    await expect(page.getByText("รหัสผ่านไม่ตรงกัน")).toBeVisible({ timeout: 5000 });

    // Enter matching password
    await confirmPasswordField.fill("password123");
    await confirmPasswordField.blur();

    // Error should disappear
    await expect(page.getByText("รหัสผ่านไม่ตรงกัน")).not.toBeVisible();
  });

  test("should navigate back using back button", async ({ page }) => {
    // Go to dashboard first
    await page.goto("/dashboard", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");

    // Then go to profile
    await page.goto("/dashboard/profile", { timeout: 60000 });
    await page.waitForLoadState("domcontentloaded");

    // Click back button
    const backButton = page.getByRole("button", { name: "กลับ" });
    await backButton.click();

    // Should navigate back to dashboard
    await expect(page).toHaveURL("/dashboard");
  });
});
