import type { Page } from "@playwright/test";

type WaitOptions = {
  timeout?: number;
};

/**
 * Wait for the app to finish initial loading and render stable content.
 */
export async function waitForAppReady(
  page: Page,
  options: WaitOptions = {},
) {
  const timeout = options.timeout ?? 30000;

  await page.waitForLoadState("domcontentloaded");

  const loadingOverlay = page.getByText(/โปรดรอสักครู่|กำลังโหลด/);
  if (await loadingOverlay.isVisible().catch(() => false)) {
    await loadingOverlay
      .waitFor({ state: "hidden", timeout })
      .catch(() => {});
  }

  const spinner = page.locator('[role="progressbar"]').first();
  if (await spinner.isVisible().catch(() => false)) {
    await spinner.waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
  }

  await page
    .locator("main, [role='main'], table, body")
    .first()
    .waitFor({ state: "visible", timeout: 15000 });
}
