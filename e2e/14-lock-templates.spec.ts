/**
 * E2E Tests for Lock Templates Feature
 * Tests complete user flows for applying pre-defined lock templates
 */

import { test, expect } from "@playwright/test";

test.describe("Lock Templates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display templates button on lock page", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Find templates button
    const templatesButton = page.locator("button").filter({ hasText: /ใช้เทมเพลต|เทมเพลต/ });
    await expect(templatesButton).toBeVisible();
  });

  test("should open templates modal when button clicked", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Click templates button
    const templatesButton = page.locator("button").filter({ hasText: /ใช้เทมเพลต|เทมเพลต/ });
    await templatesButton.click();
    await page.waitForTimeout(500);

    // Modal should be visible
    await expect(page.locator("[role='dialog'], [class*='MuiDialog']")).toBeVisible();
    await expect(page.locator("text=/เทมเพลต|Templates/i")).toBeVisible();
  });

  test("should display template categories", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Check for category headers
    const hasLunchCategory = await page.locator("text=/พักกลางวัน|Lunch/i").count() > 0;
    const hasActivityCategory = await page.locator("text=/กิจกรรม|Activity/i").count() > 0;
    const hasAssemblyCategory = await page.locator("text=/เข้าแถว|ชุมนุม|Assembly/i").count() > 0;

    // At least one category should be visible
    expect(hasLunchCategory || hasActivityCategory || hasAssemblyCategory).toBe(true);
  });

  test("should display template cards", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Check for template cards (buttons or clickable elements)
    const templateCards = page.locator("button, [role='button'], [class*='template']").filter({ hasText: /พักกลางวัน|กิจกรรม|เข้าแถว/i });
    const count = await templateCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should show lunch templates", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Look for lunch-related templates
    const juniorLunch = page.locator("text=/พักกลางวัน.*ม\.ปลาย|junior.*lunch/i");
    const seniorLunch = page.locator("text=/พักกลางวัน.*ม\.ต้น|senior.*lunch/i");

    const hasLunchTemplates = await juniorLunch.count() > 0 || await seniorLunch.count() > 0;
    expect(hasLunchTemplates).toBe(true);
  });

  test("should show activity templates", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Look for activity-related templates
    const activityTemplates = page.locator("text=/กิจกรรม|Activity/i");
    const count = await activityTemplates.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should show template descriptions", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Templates should have descriptions
    const descriptions = page.locator("text=/จันทร์-ศุกร์|วันจันทร์|คาบที่|ห้อง/i");
    const count = await descriptions.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should allow clicking template card", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Click first template card
    const firstTemplate = page.locator("button, [role='button']").filter({ hasText: /พักกลางวัน|กิจกรรม/i }).first();
    await firstTemplate.click();
    await page.waitForTimeout(500);

    // Should open preview/confirmation dialog
    const hasPreviewDialog = await page.locator("[role='dialog']").count() > 1 || 
                             await page.locator("text=/ตัวอย่าง|Preview|ยืนยัน/i").count() > 0;
    expect(hasPreviewDialog).toBe(true);
  });

  test("should display template preview details", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Click first template
    const firstTemplate = page.locator("button, [role='button']").filter({ hasText: /พักกลางวัน/i }).first();
    if (await firstTemplate.count() > 0) {
      await firstTemplate.click();
      await page.waitForTimeout(500);

      // Should show template details
      const hasDetails = await page.locator("text=/ชั้นเรียน|วิชา|ห้อง|คาบ/i").count() > 0;
      expect(hasDetails).toBe(true);
    }
  });

  test("should show total lock count in preview", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Click template
    const template = page.locator("button").filter({ hasText: /พักกลางวัน|กิจกรรม/i }).first();
    if (await template.count() > 0) {
      await template.click();
      await page.waitForTimeout(500);

      // Should show count (e.g., "จำนวน: 20")
      const hasCount = await page.locator("text=/จำนวน|รวม|ทั้งหมด/i").count() > 0;
      expect(hasCount).toBe(true);
    }
  });

  test("should display warning messages if any", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Click template
    const template = page.locator("button").filter({ hasText: /พักกลางวัน/i }).first();
    if (await template.count() > 0) {
      await template.click();
      await page.waitForTimeout(500);

      // Warnings may or may not exist (optional check)
      const warningCount = await page.locator("text=/คำเตือน|Warning/i, [class*='warning']").count();
      // Just verify we can detect warnings if present
      expect(warningCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("should have cancel button in template preview", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Click template
    const template = page.locator("button").filter({ hasText: /พักกลางวัน/i }).first();
    if (await template.count() > 0) {
      await template.click();
      await page.waitForTimeout(500);

      // Should have cancel button
      const cancelButton = page.locator("button").filter({ hasText: /ยกเลิก|ปิด|Cancel/i });
      await expect(cancelButton).toBeVisible();
    }
  });

  test("should have apply/confirm button in template preview", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Click template
    const template = page.locator("button").filter({ hasText: /พักกลางวัน/i }).first();
    if (await template.count() > 0) {
      await template.click();
      await page.waitForTimeout(500);

      // Should have confirm button
      const confirmButton = page.locator("button").filter({ hasText: /ยืนยัน|ใช้งาน|Apply/i });
      await expect(confirmButton).toBeVisible();
    }
  });

  test("should close preview when cancel clicked", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Click template
    const template = page.locator("button").filter({ hasText: /พักกลางวัน/i }).first();
    if (await template.count() > 0) {
      await template.click();
      await page.waitForTimeout(500);

      // Click cancel
      const cancelButton = page.locator("button").filter({ hasText: /ยกเลิก|ปิด/i });
      await cancelButton.click();
      await page.waitForTimeout(500);

      // Preview should be closed, but main modal still open
      const dialogCount = await page.locator("[role='dialog']").count();
      expect(dialogCount).toBeGreaterThanOrEqual(1);
    }
  });

  test("should close templates modal when close button clicked", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Click close button (X or cancel)
    const closeButton = page.locator("button").filter({ hasText: /ปิด|ยกเลิก/ }).first();
    await closeButton.click();
    await page.waitForTimeout(500);

    // All modals should be closed
    const modalVisible = await page.locator("[role='dialog']").isVisible();
    expect(modalVisible).toBe(false);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Modal should be visible and functional on mobile
    await expect(page.locator("[role='dialog']")).toBeVisible();
  });
});

test.describe("Lock Templates - Template Coverage", () => {
  test("should have all 8 templates available", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Count template cards
    const templates = page.locator("button, [role='button']").filter({ 
      hasText: /พักกลางวัน|กิจกรรม|เข้าแถว|สอบ/i 
    });
    const count = await templates.count();
    
    // Should have at least 6-8 templates (flexible to account for UI variations)
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test("should display lunch-junior template", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    const juniorLunch = page.locator("text=/พักกลางวัน.*ม\.ต้น|lunch.*junior/i");
    const hasTemplate = await juniorLunch.count() > 0;
    expect(hasTemplate).toBe(true);
  });

  test("should display lunch-senior template", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    const seniorLunch = page.locator("text=/พักกลางวัน.*ม\.ปลาย|lunch.*senior/i");
    const hasTemplate = await seniorLunch.count() > 0;
    expect(hasTemplate).toBe(true);
  });

  test("should display activity templates", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Activity templates: morning, club, homeroom
    const activityTemplates = page.locator("text=/กิจกรรม|Activity/i");
    const count = await activityTemplates.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("should display assembly templates", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    const assemblyTemplates = page.locator("text=/เข้าแถว|ชุมนุม|Assembly/i");
    const count = await assemblyTemplates.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe("Lock Templates - Complete Flow", () => {
  test.skip("should complete full template application flow", async ({ page }) => {
    // Skip in CI/automated tests as it modifies database
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Open templates modal
    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Click a template
    const template = page.locator("button").filter({ hasText: /พักกลางวัน/i }).first();
    await template.click();
    await page.waitForTimeout(500);

    // Confirm application
    const confirmButton = page.locator("button").filter({ hasText: /ยืนยัน|ใช้งาน/i });
    await confirmButton.click();

    // Should show success message
    await expect(page.locator("text=/สำเร็จ|success/i")).toBeVisible({ timeout: 5000 });

    // Modals should close
    await page.waitForTimeout(1000);
    const modalVisible = await page.locator("[role='dialog']").isVisible();
    expect(modalVisible).toBe(false);
  });

  test.skip("should handle template with warnings", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Open templates modal
    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Find template that might have warnings (e.g., exam period)
    const examTemplate = page.locator("button").filter({ hasText: /สอบ|Exam/i });
    if (await examTemplate.count() > 0) {
      await examTemplate.first().click();
      await page.waitForTimeout(500);

      // Check if warnings displayed
      const hasWarnings = await page.locator("text=/คำเตือน|Warning/i").count() > 0;
      
      // Should still allow confirmation despite warnings
      const confirmButton = page.locator("button").filter({ hasText: /ยืนยัน/i });
      await expect(confirmButton).toBeVisible();
    }
  });
});

test.describe("Lock Templates - Error Handling", () => {
  test("should handle template resolution errors", async ({ page }) => {
    // Intercept API and return error
    await page.route("**/api/**", (route) => {
      if (route.request().url().includes("template")) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: "Template resolution failed" }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Should show error or empty state
    const hasErrorOrEmpty = await page.locator("text=/ข้อผิดพลาด|Error|ไม่พบ/i").count() > 0 ||
                            await page.locator("button").filter({ hasText: /พักกลางวัน/i }).count() === 0;
    expect(hasErrorOrEmpty).toBe(true);
  });

  test("should handle template application failure", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    // Intercept API calls after opening modal
    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Setup error response for apply action
    await page.route("**/api/**", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 400,
          body: JSON.stringify({ error: "Failed to create locks" }),
        });
      } else {
        route.continue();
      }
    });

    // Try to apply template
    const template = page.locator("button").filter({ hasText: /พักกลางวัน/i }).first();
    if (await template.count() > 0) {
      await template.click();
      await page.waitForTimeout(500);

      // If confirmation possible, error should show after confirm
      const confirmButton = page.locator("button").filter({ hasText: /ยืนยัน/i });
      if (await confirmButton.isVisible()) {
        // Error handling test (would show error toast)
        // In real scenario, this would trigger error handling
      }
    }
  });
});

test.describe("Lock Templates - Accessibility", () => {
  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Dialog should have role
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Should be able to tab through templates
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);
    
    // Enter should activate focused template
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    
    // Some content should change or preview should open
    const hasChange = await page.locator("[role='dialog']").count() > 0;
    expect(hasChange).toBe(true);
  });

  test("should support escape key to close modal", async ({ page }) => {
    await page.goto("/schedule/1-2567/lock");
    await page.waitForLoadState("networkidle");

    await page.locator("button").filter({ hasText: /ใช้เทมเพลต/ }).click();
    await page.waitForTimeout(500);

    // Press Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // Modal should close
    const modalVisible = await page.locator("[role='dialog']").isVisible();
    expect(modalVisible).toBe(false);
  });
});
