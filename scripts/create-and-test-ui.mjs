import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login
    console.log("Logging in...");
    await page.goto("http://localhost:3000/signin");
    await page.getByLabel("อีเมล").type("admin@school.local", { delay: 50 });
    await page.getByLabel("รหัสผ่าน").type("admin123", { delay: 50 });
    await page.waitForTimeout(500); // Allow React state to sync
    console.log("Submit button click...");
    await page
      .getByRole("button", { name: "เข้าสู่ระบบ", exact: true })
      .click();
    console.log("Waiting for dashboard...");
    await page.waitForURL("**/dashboard**", { timeout: 60000 });
    console.log("Login successful.");

    console.log("Navigating to Assign page...");
    await page.goto("http://localhost:3000/schedule/1-2568/assign", {
      waitUntil: "networkidle",
    });

    // Wait for loading indicator to disappear
    await page
      .waitForSelector("text=กำลังโหลดข้อมูล...", {
        state: "hidden",
        timeout: 30000,
      })
      .catch(() => {});

    // Select Teacher (Test Teacher-B)
    console.log("Selecting Teacher...");
    const teacherInput = page.getByPlaceholder("ค้นหาครูผู้สอน");
    await teacherInput.click({ timeout: 15000 });
    await teacherInput.fill("Test Teacher-B");
    await page.waitForTimeout(1000);
    await page.getByRole("option", { name: "Test Teacher-B" }).first().click();

    // Wait for Teacher to be loaded (check if "วิชาที่รับผิดชอบปัจจุบัน" appears)
    await page
      .getByText("วิชาที่รับผิดชอบปัจจุบัน")
      .waitFor({ state: "visible", timeout: 10000 });

    // Select Subject (TEST-SUBJ-B or TEST-SUBJ)
    console.log("Selecting Subject...");
    const subjectInput = page.getByRole("combobox", { name: "วิชา" });
    await subjectInput.click();
    await subjectInput.fill("TEST-SUBJ");
    await page.waitForTimeout(1000);

    // Try to click TEST-SUBJ-B if available, else TEST-SUBJ
    const optionB = page.getByRole("option", { name: "TEST-SUBJ-B" });
    if ((await optionB.count()) > 0) {
      await optionB.first().click();
    } else {
      console.log("TEST-SUBJ-B not found, trying TEST-SUBJ");
      await page.getByRole("option", { name: "TEST-SUBJ" }).first().click();
    }

    // Select Grade (M.1/1)
    console.log("Selecting Grade...");
    await page.getByRole("combobox", { name: "ชั้นเรียน" }).click();
    await page.getByRole("option", { name: "ม.1/1" }).click();

    // Enter Hours
    console.log("Entering Hours...");
    await page.getByRole("spinbutton", { name: "ชั่วโมง/สัปดาห์" }).fill("2");

    // Click Add
    console.log("Clicking Add...");
    await page.getByRole("button", { name: "เพิ่ม" }).click();

    // Verify
    console.log("Verifying...");
    await page.waitForTimeout(3000);

    const row = page.getByRole("row", { name: /TEST-SUBJ.*ม\.1\/1/ });
    if ((await row.count()) > 0) {
      console.log("SUCCESS: Assignment created and visible in table!");
      console.log("Row Text:", await row.first().innerText());
    } else {
      console.error("FAILURE: Assignment row not found.");
    }
  } catch (error) {
    console.error("Error:", error);
    await page.screenshot({
      path: "test-results/screenshots/error-debug.png",
      fullPage: true,
    });
    console.log(
      "Error screenshot saved to test-results/screenshots/error-debug.png",
    );
  } finally {
    await browser.close();
  }
})();
