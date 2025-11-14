/**
 * E2E Tests for Dashboard Page
 * Tests complete user flows and page functionality
 */

import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto("/");
  });

  test("should redirect to semester selection when no semester provided", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to select-semester or show error
    await expect(page).toHaveURL(/\/(dashboard\/select-semester|dashboard\/\d-\d{4})/);
  });

  test("should load dashboard with valid semester", async ({ page }) => {
    // Navigate to a valid semester (use current academic year)
    await page.goto("/dashboard/1-2567");
    
    // Check page title/header
    await expect(page.locator("h1, h2").filter({ hasText: /ภาคเรียนที่/ })).toBeVisible();
    
    // Verify main sections exist
    await expect(page.locator("text=สถิติรวม")).toBeVisible(); // Quick stats
    await expect(page.locator("text=เมนูลัด")).toBeVisible(); // Quick actions
  });

  test("should display all 4 stat cards", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Check for stat card labels
    await expect(page.locator("text=จำนวนครู")).toBeVisible();
    await expect(page.locator("text=จำนวนชั้นเรียน")).toBeVisible();
    await expect(page.locator("text=ชั่วโมงสอนทั้งหมด")).toBeVisible();
    await expect(page.locator("text=ความสำเร็จ")).toBeVisible();
  });

  test("should display stat card values as numbers", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Find all stat values (they should be numbers)
    const statValues = page.locator("[class*='text-2xl'], [class*='text-3xl']").filter({ hasText: /^\d+/ });
    const count = await statValues.count();
    expect(count).toBeGreaterThanOrEqual(4); // At least 4 stat values
  });

  test("should display all 4 quick action buttons", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Check for quick action buttons
    await expect(page.locator("a").filter({ hasText: "ตารางครู" })).toBeVisible();
    await expect(page.locator("a").filter({ hasText: "ตารางนักเรียน" })).toBeVisible();
    await expect(page.locator("a").filter({ hasText: "ตารางเวลา" })).toBeVisible();
    await expect(page.locator("a").filter({ hasText: "หลักสูตร" })).toBeVisible();
  });

  test("should navigate to teacher table when clicking quick action", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Click teacher table button
    const teacherButton = page.locator("a").filter({ hasText: "ตารางครู" });
    await teacherButton.click();
    
    // Should navigate to teacher schedule page
    await expect(page).toHaveURL(/\/schedule\/1-2567\/teacher/);
  });

  test("should navigate to student table when clicking quick action", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Click student table button
    const studentButton = page.locator("a").filter({ hasText: "ตารางนักเรียน" });
    await studentButton.click();
    
    // Should navigate to student schedule page
    await expect(page).toHaveURL(/\/schedule\/1-2567\/student/);
  });

  test("should display teacher workload chart", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Check for teacher workload section
    const workloadSection = page.locator("text=ภาระงานสอนของครู");
    await expect(workloadSection).toBeVisible();
    
    // Should have at least one teacher row or empty state
    const hasTeacherRows = await page.locator("text=/ชั่วโมง|ไม่พบข้อมูล/").isVisible();
    expect(hasTeacherRows).toBeTruthy();
  });

  test("should display subject distribution chart", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Check for subject distribution section
    const subjectSection = page.locator("text=การกระจายวิชา");
    await expect(subjectSection).toBeVisible();
    
    // Should have at least one subject row or empty state
    const hasSubjectRows = await page.locator("text=/ชั่วโมง|ไม่พบข้อมูล/").isVisible();
    expect(hasSubjectRows).toBeTruthy();
  });

  test("should show health indicators when there are issues", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Check if health indicators section exists
    // It may or may not be visible depending on data
    const healthSection = page.locator("text=ตัวชี้วัดสุขภาพของตาราง");
    const isVisible = await healthSection.isVisible();
    
    if (isVisible) {
      // If visible, should have at least one indicator
      const indicators = page.locator("[class*='bg-yellow-50'], [class*='bg-red-50']");
      const count = await indicators.count();
      expect(count).toBeGreaterThan(0);
    }
    // If not visible, that's also valid (no issues found)
  });

  test("should display summary info section", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Check for summary section
    const summarySection = page.locator("text=สรุปข้อมูล");
    await expect(summarySection).toBeVisible();
    
    // Should display key metrics
    await expect(page.locator("text=ครูทั้งหมด")).toBeVisible();
    await expect(page.locator("text=ชั้นเรียนทั้งหมด")).toBeVisible();
    await expect(page.locator("text=วิชาทั้งหมด")).toBeVisible();
  });

  test("should handle empty semester gracefully", async ({ page }) => {
    // Navigate to a semester that likely has no data
    await page.goto("/dashboard/2-2599");
    
    // Page should load without errors
    await expect(page.locator("h1, h2")).toBeVisible();
    
    // Stats should show zeros
    const statValues = page.locator("[class*='text-2xl'], [class*='text-3xl']");
    const hasZeros = await statValues.filter({ hasText: "0" }).count();
    expect(hasZeros).toBeGreaterThanOrEqual(1);
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto("/dashboard/1-2567");
    
    // Check that main elements are still visible
    await expect(page.locator("h1, h2").first()).toBeVisible();
    
    // Stats should stack vertically
    const statCards = page.locator("[class*='grid']").first();
    await expect(statCards).toBeVisible();
  });

  test("should be responsive on tablet", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto("/dashboard/1-2567");
    
    // Check that main elements are visible
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.locator("text=สถิติรวม")).toBeVisible();
  });

  test("should display semester badge", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Check for semester badge/indicator
    const badgeText = await page.locator("[class*='bg-blue'], [class*='bg-green']").filter({ hasText: /ภาคเรียนที่/ }).textContent();
    expect(badgeText).toBeTruthy();
  });

  test("should handle invalid semester format", async ({ page }) => {
    // Navigate with invalid format
    await page.goto("/dashboard/invalid-format");
    
    // Should either redirect or show error
    
    // Check if redirected or error shown
    const url = page.url();
    const hasError = await page.locator("text=/error|ข้อผิดพลาด|ไม่พบ/i").isVisible();
    
    expect(url.includes("select-semester") || hasError).toBeTruthy();
  });

  test("should load within reasonable time", async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto("/dashboard/1-2567");
    await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("should not have console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto("/dashboard/1-2567");
    await expect(page.locator('main, body')).toBeVisible({ timeout: 10000 });
    
    // Filter out expected errors (e.g., network errors in test environment)
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes("Failed to load resource") && !err.includes("404")
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Should have h1 or h2 for main title
    const mainHeading = page.locator("h1, h2").first();
    await expect(mainHeading).toBeVisible();
    
    // Section headings should use appropriate levels
    const sectionHeadings = page.locator("h2, h3");
    const count = await sectionHeadings.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display utilization bars in teacher workload", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Check if teacher workload section has data
    const workloadSection = page.locator("text=ภาระงานสอนของครู");
    await expect(workloadSection).toBeVisible();
    
    // If there are teachers, should show utilization bars
    const hasTeachers = await page.locator("text=/\\d+\\s*ชั่วโมง/").isVisible();
    
    if (hasTeachers) {
      // Should have visual bars (divs with background colors)
      const bars = page.locator("[class*='bg-blue'], [class*='bg-green'], [class*='bg-yellow']");
      const count = await bars.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should display percentage bars in subject distribution", async ({ page }) => {
    await page.goto("/dashboard/1-2567");
    
    // Check if subject distribution section has data
    const subjectSection = page.locator("text=การกระจายวิชา");
    await expect(subjectSection).toBeVisible();
    
    // If there are subjects, should show percentage bars
    const hasSubjects = await page.locator("text=/\\d+\\s*ชั่วโมง/").isVisible();
    
    if (hasSubjects) {
      // Should show percentages
      const percentages = page.locator("text=/%/");
      const count = await percentages.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
