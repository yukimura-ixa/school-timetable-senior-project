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
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("should navigate to profile page from navbar", async ({ page }) => {
    // Click on user avatar/name in navbar to go to profile
    const profileLink = page.locator('a[href="/dashboard/profile"]');
    await expect(profileLink).toBeVisible({ timeout: 10000 });
    await profileLink.click();

    // Should be on profile page
    await expect(page).toHaveURL("/dashboard/profile");

    // Page title should be visible
    await expect(page.getByText("โปรไฟล์ของฉัน")).toBeVisible();
  });

  test("should display profile information section", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await page.waitForLoadState("networkidle");

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
    await page.goto("/dashboard/profile");
    await page.waitForLoadState("networkidle");

    // Password section should be visible
    await expect(page.getByText("เปลี่ยนรหัสผ่าน")).toBeVisible();

    // Password fields should be visible
    await expect(page.getByLabel("รหัสผ่านปัจจุบัน")).toBeVisible();
    await expect(page.getByLabel("รหัสผ่านใหม่")).toBeVisible();
    await expect(page.getByLabel("ยืนยันรหัสผ่านใหม่")).toBeVisible();

    // Checkbox for revoking other sessions
    await expect(
      page.getByLabel("ออกจากระบบในอุปกรณ์อื่นทั้งหมด"),
    ).toBeVisible();
  });

  test("should display email change section", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await page.waitForLoadState("networkidle");

    // Email section should be visible
    await expect(page.getByText("เปลี่ยนอีเมล")).toBeVisible();

    // Email fields should be visible
    await expect(page.getByLabel("อีเมลปัจจุบัน")).toBeVisible();
    await expect(page.getByLabel("อีเมลใหม่")).toBeVisible();

    // Info alert about verification
    await expect(
      page.getByText(/การเปลี่ยนอีเมลจะต้องยืนยันผ่านลิงก์/),
    ).toBeVisible();
  });

  test("should enable save button when name is changed", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await page.waitForLoadState("networkidle");

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
    await page.goto("/dashboard/profile");
    await page.waitForLoadState("networkidle");

    const newPasswordField = page.getByLabel("รหัสผ่านใหม่");

    // Enter a short password
    await newPasswordField.fill("short");

    // Should show error about password length
    await expect(page.getByText(/รหัสผ่านสั้นเกินไป/)).toBeVisible();

    // Enter valid length password
    await newPasswordField.fill("validpassword123");

    // Error should disappear
    await expect(page.getByText(/รหัสผ่านสั้นเกินไป/)).not.toBeVisible();
  });

  test("should validate password confirmation match", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await page.waitForLoadState("networkidle");

    const newPasswordField = page.getByLabel("รหัสผ่านใหม่");
    const confirmPasswordField = page.getByLabel("ยืนยันรหัสผ่านใหม่");

    // Enter different passwords
    await newPasswordField.fill("password123");
    await confirmPasswordField.fill("different456");

    // Should show mismatch error
    await expect(page.getByText("รหัสผ่านไม่ตรงกัน")).toBeVisible();

    // Enter matching password
    await confirmPasswordField.fill("password123");

    // Error should disappear
    await expect(page.getByText("รหัสผ่านไม่ตรงกัน")).not.toBeVisible();
  });

  test("should navigate back using back button", async ({ page }) => {
    // Go to dashboard first
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Then go to profile
    await page.goto("/dashboard/profile");
    await page.waitForLoadState("networkidle");

    // Click back button
    const backButton = page.getByRole("button", { name: "กลับ" });
    await backButton.click();

    // Should navigate back to dashboard
    await expect(page).toHaveURL("/dashboard");
  });
});
