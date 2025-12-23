// Admin Journey Test Script for Assign Page
// Run with: npx playwright test scripts/admin-journey-test.mjs --project=chromium

import { chromium } from "playwright";

const BASE_URL = "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🔐 Navigating to signin page...");
  await page.goto(`${BASE_URL}/signin`);
  await page.waitForLoadState("networkidle");

  console.log("📝 Filling login credentials...");
  await page.fill(
    'input[type="text"], input[type="email"]',
    "admin@school.local",
  );
  await page.fill('input[type="password"]', "admin123");

  console.log("🚀 Submitting login form...");
  await page.click('button:has-text("เข้าสู่ระบบ")');
  await page.waitForURL("**/dashboard**", { timeout: 10000 });

  console.log("✅ Logged in successfully! Now at:", page.url());

  // Navigate to Assign page
  console.log("📋 Navigating to Assign page...");
  await page.goto(`${BASE_URL}/schedule/1-2568/assign`);
  await page.waitForLoadState("networkidle");

  console.log("✅ At Assign page:", page.url());

  // Take screenshot
  await page.screenshot({
    path: "admin-journey-assign-page.png",
    fullPage: true,
  });
  console.log("📸 Screenshot saved: admin-journey-assign-page.png");

  // Test: Select a teacher if available
  const teacherSelect = page
    .locator('[data-testid="teacher-select"], select, .MuiSelect-select')
    .first();
  if (await teacherSelect.isVisible()) {
    console.log(
      "👨‍🏫 Teacher select found, attempting to select first option...",
    );
    await teacherSelect.click();
    await page.waitForTimeout(500);
    const firstOption = page.locator('li[role="option"]').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      console.log("✅ Teacher selected");
    }
  }

  await page.waitForTimeout(2000);
  await page.screenshot({
    path: "admin-journey-teacher-selected.png",
    fullPage: true,
  });
  console.log("📸 Screenshot saved: admin-journey-teacher-selected.png");

  console.log("\n🎉 Admin Journey Test Complete!");
  await browser.close();
})();
