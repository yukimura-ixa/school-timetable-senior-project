import { test, expect } from "@playwright/test";

const GATE = process.env.E2E_PUBLISH_GATE === "true";

test.describe("Publish Readiness Gate", () => {
  test.beforeEach(async ({ page }) => {
    if (!GATE) test.skip();
    // Navigate to a DRAFT semester config page
    // Assumes E2E seed creates a DRAFT semester at year=2568, semester=1
    await page.goto("/schedule/2568/1/config");
    await page.waitForLoadState("networkidle");
  });

  test("shows readiness accordion on config page", async ({ page }) => {
    await expect(page.getByTestId("readiness-accordion-summary")).toBeVisible();
  });

  test("expands accordion and shows checklist", async ({ page }) => {
    await page.getByTestId("readiness-accordion-summary").click();
    await expect(page.getByTestId("checklist-grades")).toBeVisible();
    await expect(page.getByTestId("checklist-moe")).toBeVisible();
  });

  test("happy path: ready config publishes successfully", async ({ page }) => {
    if (process.env.E2E_PUBLISH_GATE_READY !== "true") test.skip();
    await page.getByTestId("readiness-accordion-summary").click();
    await page.getByTestId("open-publish-dialog-btn").click();
    await expect(page.getByText("ยืนยันการเผยแพร่")).toBeVisible();
    await page.getByTestId("confirm-publish-btn").click();
    await expect(page.getByText("เผยแพร่ตารางสำเร็จ")).toBeVisible();
  });

  test("blocked path: incomplete config shows override reason field", async ({ page }) => {
    if (process.env.E2E_PUBLISH_GATE_INCOMPLETE !== "true") test.skip();
    await page.getByTestId("readiness-accordion-summary").click();
    await page.getByTestId("open-publish-dialog-btn").click();
    await expect(page.getByText("เผยแพร่โดยมีปัญหาที่ยังไม่แก้ไข")).toBeVisible();
    const btn = page.getByTestId("force-publish-btn");
    await expect(btn).toBeDisabled();
    await page.getByTestId("override-reason-input").locator("input").fill("เหตุผลที่ยาวพอ123");
    await expect(btn).toBeEnabled();
    await btn.click();
    await expect(page.getByText("เผยแพร่ตารางสำเร็จ")).toBeVisible();
  });
});
