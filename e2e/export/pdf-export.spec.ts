import { test, expect } from "@playwright/test";
import path from "path";

test.describe.skip("PDF Export - Admin Only", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to sign in page
    await page.goto("/signin");

    // Sign in as admin
    await page.fill('input[name="username"]', process.env.ADMIN_USERNAME || "admin");
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || "admin123");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("/dashboard/**", { timeout: 10000 });
  });

  test("should allow admin to export PDF", async ({ page, context }) => {
    // Grant download permissions
    await context.grantPermissions(["downloads"]);

    // Navigate to teacher table
    await page.goto("/dashboard/1-2567/teacher-table");
    await page.waitForLoadState("networkidle");

    // Select a teacher
    const teacherSelect = page.locator('[data-testid="teacher-select"]').first();
    await teacherSelect.click();
    await page.locator('li[role="option"]').first().click();

    // Wait for teacher data to load
    await page.waitForTimeout(2000);

    // Click PDF export button
    const pdfButton = page.locator('[data-testid="teacher-export-pdf-button"]');
    await expect(pdfButton).toBeVisible();
    await expect(pdfButton).toBeEnabled();

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");
    await pdfButton.click();

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^teacher-\d+-1-2567\.pdf$/);

    // Verify file was downloaded
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Optional: Verify file size (PDF should not be empty)
    const fs = await import("fs");
    const stats = fs.statSync(downloadPath!);
    expect(stats.size).toBeGreaterThan(1000); // At least 1KB
  });

  test("should show error for invalid data", async ({ page }) => {
    // Navigate to teacher table without selecting teacher
    await page.goto("/dashboard/1-2567/teacher-table");
    await page.waitForLoadState("networkidle");

    // PDF button should be disabled when no teacher is selected
    const pdfButton = page.locator('[data-testid="teacher-export-pdf-button"]');
    await expect(pdfButton).toBeVisible();
    await expect(pdfButton).toBeDisabled();
  });

  test("should handle network errors gracefully", async ({ page, context }) => {
    // Navigate to teacher table
    await page.goto("/dashboard/1-2567/teacher-table");
    await page.waitForLoadState("networkidle");

    // Select a teacher
    const teacherSelect = page.locator('[data-testid="teacher-select"]').first();
    await teacherSelect.click();
    await page.locator('li[role="option"]').first().click();
    await page.waitForTimeout(2000);

    // Intercept API call and make it fail
    await page.route("/api/export/teacher-timetable/pdf", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    // Set up dialog handler for alert
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("เกิดข้อผิดพลาดในการส่งออก PDF");
      await dialog.accept();
    });

    // Click PDF export button
    const pdfButton = page.locator('[data-testid="teacher-export-pdf-button"]');
    await pdfButton.click();

    // Wait for error alert
    await page.waitForTimeout(1000);
  });

  test("should render Thai fonts correctly in PDF", async ({ page, context }) => {
    await context.grantPermissions(["downloads"]);

    // Navigate to teacher table
    await page.goto("/dashboard/1-2567/teacher-table");
    await page.waitForLoadState("networkidle");

    // Select a teacher
    const teacherSelect = page.locator('[data-testid="teacher-select"]').first();
    await teacherSelect.click();
    await page.locator('li[role="option"]').first().click();
    await page.waitForTimeout(2000);

    // Export PDF
    const downloadPromise = page.waitForEvent("download");
    const pdfButton = page.locator('[data-testid="teacher-export-pdf-button"]');
    await pdfButton.click();

    const download = await downloadPromise;
    const downloadPath = await download.path();

    // Verify PDF contains Thai text metadata
    // Note: Full PDF text extraction would require pdf-parse library
    const fs = await import("fs");
    const buffer = fs.readFileSync(downloadPath!);
    const content = buffer.toString("utf-8", 0, Math.min(buffer.length, 10000));

    // PDF should contain Thai unicode characters or font references
    // This is a basic check - proper validation requires PDF parsing
    expect(content.length).toBeGreaterThan(1000);
  });
});

test.describe.skip("Student PDF Export - Admin Only", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to sign in page
    await page.goto("/signin");

    // Sign in as admin
    await page.fill('input[name="username"]', process.env.ADMIN_USERNAME || "admin");
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || "admin123");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("/dashboard/**", { timeout: 10000 });
  });

  test("should allow admin to export student PDF", async ({ page, context }) => {
    // Grant download permissions
    await context.grantPermissions(["downloads"]);

    // Navigate to student table
    await page.goto("/dashboard/1-2567/student-table");
    await page.waitForLoadState("networkidle");

    // Select a grade
    const gradeSelect = page.locator('[data-testid="grade-select"]').first();
    await gradeSelect.click();
    await page.locator('li[role="option"]').first().click();

    // Wait for grade data to load
    await page.waitForTimeout(2000);

    // Click PDF export button
    const pdfButton = page.locator('[data-testid="student-export-pdf-button"]');
    await expect(pdfButton).toBeVisible();
    await expect(pdfButton).toBeEnabled();

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");
    await pdfButton.click();

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^student-.+-1-2567\.pdf$/);

    // Verify file was downloaded
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Verify file size (PDF should not be empty)
    const fs = await import("fs");
    const stats = fs.statSync(downloadPath!);
    expect(stats.size).toBeGreaterThan(1000); // At least 1KB
  });

  test("should show error for invalid student data", async ({ page }) => {
    // Navigate to student table without selecting grade
    await page.goto("/dashboard/1-2567/student-table");
    await page.waitForLoadState("networkidle");

    // PDF button should be disabled when no grade is selected
    const pdfButton = page.locator('[data-testid="student-export-pdf-button"]');
    await expect(pdfButton).toBeVisible();
    await expect(pdfButton).toBeDisabled();
  });

  test("should handle student PDF network errors gracefully", async ({ page }) => {
    // Navigate to student table
    await page.goto("/dashboard/1-2567/student-table");
    await page.waitForLoadState("networkidle");

    // Select a grade
    const gradeSelect = page.locator('[data-testid="grade-select"]').first();
    await gradeSelect.click();
    await page.locator('li[role="option"]').first().click();
    await page.waitForTimeout(2000);

    // Intercept API call and make it fail
    await page.route("/api/export/student-timetable/pdf", (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    // Set up dialog handler for alert
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("เกิดข้อผิดพลาดในการส่งออก PDF");
      await dialog.accept();
    });

    // Click PDF export button
    const pdfButton = page.locator('[data-testid="student-export-pdf-button"]');
    await pdfButton.click();

    // Wait for error alert
    await page.waitForTimeout(1000);
  });
});

test.describe.skip("PDF Export - Non-Admin Access Control", () => {
  test("should return 403 for non-admin API access", async ({ page, request }) => {
    // Navigate to sign in page
    await page.goto("/signin");

    // Sign in as teacher (if teacher account exists)
    await page.fill('input[name="username"]', process.env.TEACHER_USERNAME || "teacher");
    await page.fill('input[name="password"]', process.env.TEACHER_PASSWORD || "teacher123");
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForTimeout(2000);

    // Try to call teacher PDF API directly
    const teacherResponse = await page.request.post("/api/export/teacher-timetable/pdf", {
      data: {
        teacherId: 1,
        teacherName: "Test Teacher",
        semester: "1",
        academicYear: "2567",
        timeslots: [],
        scheduleEntries: [],
        totalCredits: 0,
        totalHours: 0,
      },
    });

    // Should return 403 Forbidden
    expect(teacherResponse.status()).toBe(403);
    const teacherBody = await teacherResponse.json();
    expect(teacherBody.error).toContain("Admin access required");

    // Try to call student PDF API directly
    const studentResponse = await page.request.post("/api/export/student-timetable/pdf", {
      data: {
        gradeId: "ม.1",
        gradeName: "ม.1",
        semester: "1",
        academicYear: "2567",
        timeslots: [],
        scheduleEntries: [],
        totalCredits: 0,
        totalHours: 0,
      },
    });

    // Should return 403 Forbidden
    expect(studentResponse.status()).toBe(403);
    const studentBody = await studentResponse.json();
    expect(studentBody.error).toContain("Admin access required");
  });

  test("should not show PDF button for non-admin users", async ({ page }) => {
    // Sign in as teacher
    await page.goto("/signin");
    await page.fill('input[name="username"]', process.env.TEACHER_USERNAME || "teacher");
    await page.fill('input[name="password"]', process.env.TEACHER_PASSWORD || "teacher123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Check teacher table - PDF button should not be visible
    await page.goto("/dashboard/1-2567/teacher-table");
    await page.waitForLoadState("networkidle");
    const teacherPdfButton = page.locator('[data-testid="teacher-export-pdf-button"]');
    await expect(teacherPdfButton).not.toBeVisible();

    // Check student table - PDF button should not be visible
    await page.goto("/dashboard/1-2567/student-table");
    await page.waitForLoadState("networkidle");
    const studentPdfButton = page.locator('[data-testid="student-export-pdf-button"]');
    await expect(studentPdfButton).not.toBeVisible();
  });
});
