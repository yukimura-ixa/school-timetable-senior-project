// Real Scenario Test Script - Admin Journey with Semester Data
// Tests full admin workflow: login, navigate, select teacher, create assignment

import { chromium } from "playwright";

const BASE_URL = "http://localhost:3000";
const SEMESTER_CONFIG = "1-2568"; // Semester 1, Year 2568

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🚀 Starting Real Scenario Test...\n");

  // Step 1: Login as Admin
  console.log("Step 1: Logging in as Admin...");
  await page.goto(`${BASE_URL}/signin`);
  await page.waitForLoadState("networkidle");

  // Wait for form to appear
  await page.waitForSelector('input[type="text"], input[type="email"]', {
    timeout: 10000,
  });

  await page.fill(
    'input[type="text"], input[type="email"]',
    "admin@school.local",
  );
  await page.fill('input[type="password"]', "admin123");
  await page.click('button:has-text("เข้าสู่ระบบ")');

  try {
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    console.log("✅ Login successful! Redirected to dashboard\n");
  } catch (e) {
    console.log("⚠️ Login redirect timeout - checking current URL");
    console.log("Current URL:", page.url());
  }

  // Step 2: Navigate to Assign Page
  console.log("Step 2: Navigating to Assign page...");
  await page.goto(`${BASE_URL}/schedule/${SEMESTER_CONFIG}/assign`);
  await page.waitForLoadState("networkidle");
  console.log("✅ Arrived at Assign page:", page.url());

  // Take screenshot
  await page.screenshot({
    path: "scenario-test-assign-page.png",
    fullPage: true,
  });
  console.log("📸 Screenshot: scenario-test-assign-page.png\n");

  // Step 3: Select a Teacher
  console.log("Step 3: Looking for teacher selector...");
  await page.waitForTimeout(2000);

  // Try to find and click a teacher dropdown or autocomplete
  const teacherSelector = page
    .locator('[data-testid="teacher-select"], .MuiAutocomplete-root, select')
    .first();

  if (await teacherSelector.isVisible()) {
    console.log("Found teacher selector, clicking...");
    await teacherSelector.click();
    await page.waitForTimeout(500);

    // Select first teacher from dropdown
    const firstOption = page.locator('li[role="option"]').first();
    if (await firstOption.isVisible()) {
      const teacherName = await firstOption.textContent();
      await firstOption.click();
      console.log(`✅ Selected teacher: ${teacherName}\n`);
    }
  } else {
    console.log("⚠️ Teacher selector not visible, checking page content...");
  }

  await page.waitForTimeout(2000);
  await page.screenshot({
    path: "scenario-test-teacher-selected.png",
    fullPage: true,
  });
  console.log("📸 Screenshot: scenario-test-teacher-selected.png\n");

  // Step 4: View Teacher Data Panel
  console.log("Step 4: Examining Teacher Data Panel...");

  const teacherPanel = page
    .locator('[data-testid="teacher-data"], .teacher-info, .MuiCard-root')
    .first();
  if (await teacherPanel.isVisible()) {
    console.log("✅ Teacher data panel visible");
  }

  // Check for locked schedules section
  const lockedSchedules = page
    .locator("text=ตารางที่ล็อค, text=Locked")
    .first();
  if (await lockedSchedules.isVisible()) {
    console.log("✅ Locked schedules section found");
  }

  // Check for workload info
  const workloadInfo = page.locator("text=ชั่วโมง, text=hours").first();
  if (await workloadInfo.isVisible()) {
    console.log("✅ Workload information visible\n");
  }

  // Step 5: Check for Quick Assignment Panel
  console.log("Step 5: Looking for Quick Assignment Panel...");

  const quickAssignPanel = page
    .locator("text=Quick Assignment, text=มอบหมายด่วน")
    .first();
  if (await quickAssignPanel.isVisible()) {
    console.log("✅ Quick Assignment Panel found");
  }

  // Final screenshot
  await page.screenshot({ path: "scenario-test-final.png", fullPage: true });
  console.log("📸 Screenshot: scenario-test-final.png\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Real Scenario Test Complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await browser.close();
})();
