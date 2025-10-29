/**
 * E2E Tests for Public Homepage
 * 
 * Validates:
 * - Unauthenticated access to homepage
 * - Tab navigation (teachers ↔ classes)
 * - Search functionality
 * - Pagination
 * - Data privacy (no PII)
 */

import { test, expect } from "@playwright/test";

test.describe("Public Homepage - Unauthenticated Access", () => {
  test("should load homepage without authentication", async ({ page }) => {
    await page.goto("/");
    
    // Should not redirect to login
    await expect(page).toHaveURL("/");
    
    // Should show hero section
    await expect(page.locator("h1")).toContainText("ระบบตารางเรียนตารางสอน");
  });

  test("should display quick stats cards", async ({ page }) => {
    await page.goto("/");
    
    // Wait for stats to load
    await page.waitForSelector("text=ครูผู้สอนทั้งหมด", { timeout: 10000 });
    
    // Should show 4 stat cards
    const statCards = await page.locator('[role="region"]').count();
    expect(statCards).toBeGreaterThanOrEqual(4);
  });

  test("should display mini charts section", async ({ page }) => {
    await page.goto("/");
    
    // Should show charts section
    await expect(page.locator("h2")).toContainText("ภาพรวมการใช้งาน");
    
    // Should have at least one chart visible
    const charts = await page.locator('.recharts-wrapper, [role="img"]').count();
    expect(charts).toBeGreaterThan(0);
  });
});

test.describe("Tab Navigation", () => {
  test("should switch between teachers and classes tabs", async ({ page }) => {
    await page.goto("/");
    
    // Default should be teachers tab
    await expect(page).toHaveURL(/tab=teachers|^\/$|^\/$/);
    
    // Click classes tab
    await page.click("text=ชั้นเรียน");
    await expect(page).toHaveURL("/?tab=classes");
    
    // Should show classes table
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("th")).toContainText("ชั้นเรียน");
    
    // Switch back to teachers
    await page.click("text=ครูผู้สอน");
    await expect(page).toHaveURL("/?tab=teachers");
    
    // Should show teachers table
    await expect(page.locator("th")).toContainText("ชื่อ-นามสกุล");
  });

  test("should reset to page 1 when switching tabs", async ({ page }) => {
    await page.goto("/?tab=teachers&page=2");
    
    // Should be on page 2
    expect(page.url()).toContain("page=2");
    
    // Switch to classes tab
    await page.click("text=ชั้นเรียน");
    
    // Should reset to page 1 (no page param or page=1)
    await expect(page).toHaveURL(/tab=classes(?!.*page=2)/);
  });
});

test.describe("Search Functionality", () => {
  test("should search teachers by name", async ({ page }) => {
    await page.goto("/?tab=teachers");
    
    // Type search term (common Thai name prefix)
    await page.fill('input[placeholder*="ค้นหา"]', "นาย");
    
    // Wait for debounce and URL update
    await page.waitForTimeout(600);
    await expect(page).toHaveURL(/search=นาย/);
    
    // Should show filtered results
    const rows = await page.locator("tbody tr").count();
    expect(rows).toBeGreaterThan(0);
  });

  test("should search classes by grade", async ({ page }) => {
    await page.goto("/?tab=classes");
    
    // Search for M.1 (Mathayom 1)
    await page.fill('input[placeholder*="ค้นหา"]', "M.1");
    
    await page.waitForTimeout(600);
    await expect(page).toHaveURL(/search=M\.1/);
    
    // Should show M.1 classes only
    const table = await page.locator("table");
    await expect(table).toContainText("M.1");
  });

  test("should clear search with X button", async ({ page }) => {
    await page.goto("/?tab=teachers&search=test");
    
    // Should have search value
    const input = page.locator('input[placeholder*="ค้นหา"]');
    await expect(input).toHaveValue("test");
    
    // Click clear button
    await page.click('button[aria-label="Clear search"]');
    
    // Should clear input and URL
    await expect(input).toHaveValue("");
    await expect(page).toHaveURL(/^\/\?tab=teachers(?!.*search)/);
  });

  test("should show empty state for no results", async ({ page }) => {
    await page.goto("/?tab=teachers");
    
    // Search for something that won't exist
    await page.fill('input[placeholder*="ค้นหา"]', "XYZNONEXISTENT123");
    
    await page.waitForTimeout(600);
    
    // Should show empty message
    await expect(page.locator("text=/ไม่พบ|No results/i")).toBeVisible();
  });
});

test.describe("Pagination", () => {
  test("should paginate through teachers", async ({ page }) => {
    await page.goto("/?tab=teachers");
    
    // Check if pagination exists (only if more than 25 teachers)
    const nextButton = page.locator('button:has-text("Next"), button[aria-label="Next page"]');
    
    if (await nextButton.isVisible()) {
      // Click next page
      await nextButton.click();
      await expect(page).toHaveURL("/?tab=teachers&page=2");
      
      // Should show page 2 results
      await expect(page.locator("tbody tr").first()).toBeVisible();
      
      // Click previous
      const prevButton = page.locator('button:has-text("Previous"), button[aria-label="Previous page"]');
      await prevButton.click();
      await expect(page).toHaveURL(/page=1|^\/?tab=teachers$/);
    }
  });

  test("should show correct pagination info", async ({ page }) => {
    await page.goto("/?tab=teachers");
    
    // Should show "แสดง X ถึง Y จาก Z รายการ"
    const paginationInfo = page.locator("text=/แสดง.*ถึง.*จาก.*รายการ/");
    await expect(paginationInfo).toBeVisible();
  });

  test("should disable previous button on first page", async ({ page }) => {
    await page.goto("/?tab=teachers&page=1");
    
    const prevButton = page.locator('button:has-text("Previous"), button[aria-label="Previous page"]').first();
    await expect(prevButton).toBeDisabled();
  });
});

test.describe("Table Interactions", () => {
  test("should have clickable view schedule links", async ({ page }) => {
    await page.goto("/?tab=teachers");
    
    // Should have at least one "View schedule" link
    const viewLinks = page.locator('a:has-text("View schedule"), a:has-text("ดูตารางสอน")');
    await expect(viewLinks.first()).toBeVisible();
    
    // Link should have href to dashboard
    const href = await viewLinks.first().getAttribute("href");
    expect(href).toContain("/dashboard");
  });

  test("should have clickable view timetable links for classes", async ({ page }) => {
    await page.goto("/?tab=classes");
    
    const viewLinks = page.locator('a:has-text("View timetable"), a:has-text("ดูตารางเรียน")');
    await expect(viewLinks.first()).toBeVisible();
    
    const href = await viewLinks.first().getAttribute("href");
    expect(href).toContain("/dashboard");
  });

  test("should display teacher utilization badges", async ({ page }) => {
    await page.goto("/?tab=teachers");
    
    // Should show utilization badges (color-coded)
    const badges = page.locator('span:has-text("%")');
    await expect(badges.first()).toBeVisible();
  });

  test("should display subject count badges", async ({ page }) => {
    await page.goto("/?tab=classes");
    
    // Should show subject count badges
    const badges = page.locator('span.bg-purple-100, span:has-text("วิชา")');
    expect(await badges.count()).toBeGreaterThan(0);
  });
});

test.describe("Data Privacy & Security", () => {
  test("should not expose email addresses in HTML", async ({ page }) => {
    await page.goto("/?tab=teachers");
    
    // Get full page HTML
    const html = await page.content();
    
    // Should not contain email patterns
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = html.match(emailPattern);
    
    expect(matches).toBeNull();
  });

  test("should not expose email addresses in network responses", async ({ page }) => {
    const responseBodies: string[] = [];
    
    // Capture all API responses
    page.on("response", async (response) => {
      if (response.url().includes("/api/") || response.url().includes("/_next/data/")) {
        try {
          const body = await response.text();
          responseBodies.push(body);
        } catch (e) {
          // Some responses might not be text
        }
      }
    });
    
    await page.goto("/?tab=teachers");
    await page.waitForLoadState("networkidle");
    
    // Check all responses for email patterns
    const allResponses = responseBodies.join(" ");
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = allResponses.match(emailPattern);
    
    expect(matches).toBeNull();
  });
});

test.describe("Responsive Design", () => {
  test("should display correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    // Hero should be visible
    await expect(page.locator("h1")).toBeVisible();
    
    // Stats cards should stack vertically (check layout)
    const cards = page.locator('[role="region"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("should display correctly on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    
    // All sections should be visible
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=ภาพรวมการใช้งาน")).toBeVisible();
  });

  test("should display correctly on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    
    // All sections should be visible
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
  });
});

test.describe("Performance", () => {
  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;
    
    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("should have no console errors", async ({ page }) => {
    const errors: string[] = [];
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Filter out known false positives if any
    const criticalErrors = errors.filter(
      (err) => !err.includes("favicon") && !err.includes("_next/static")
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
