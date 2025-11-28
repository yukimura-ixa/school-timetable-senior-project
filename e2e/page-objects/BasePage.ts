/**
 * BasePage - Base Page Object Model
 *
 * Provides common functionality for all page objects:
 * - Navigation helpers
 * - Wait utilities
 * - Error handling
 * - Snackbar/notification assertions
 *
 * @module page-objects/BasePage
 */

import { Page, Locator, expect } from "@playwright/test";

export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  // Common UI elements
  readonly loadingSpinner: Locator;
  readonly snackbar: Locator;
  readonly snackbarMessage: Locator;

  // Semester selector elements
  readonly semesterButtonWithText: Locator;
  readonly semesterSelectButton: Locator;

  constructor(page: Page, baseUrl: string = "") {
    this.page = page;
    this.baseUrl = baseUrl;

    // Common selectors
    this.loadingSpinner = page.locator('[role="progressbar"]');
    this.snackbar = page.locator('.notistack-Snackbar, [role="alert"]');
    this.snackbarMessage = this.snackbar.locator(
      ".notistack-MuiContent-default, .MuiAlert-message",
    );

    // Semester selector - button that shows semester info (not the "Select Semester" button)
    this.semesterButtonWithText = page
      .locator("button")
      .filter({ has: page.locator("text=ภาคเรียน") })
      .first();
    this.semesterSelectButton = page.getByRole("button", {
      name: "เลือกภาคเรียน",
    });
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string) {
    await this.page.goto(`${this.baseUrl}${path}`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
  }

  /**
   * Wait for page to be fully loaded (no loading spinners)
   */
  async waitForPageLoad() {
    // Prefer 'domcontentloaded' to avoid waiting on third-party assets
    await this.page.waitForLoadState("domcontentloaded");
    await expect(this.loadingSpinner)
      .toBeHidden({ timeout: 10000 })
      .catch(() => {
        // Spinner might not exist, that's ok
      });
  }

  /**
   * Wait for semester to be synced from URL params to global store
   * This is critical for pages that use useSemesterSync hook
   *
   * @param expectedSemester - Expected semester text like "1/2567"
   */
  async waitForSemesterSync(expectedSemester: string) {
    // Extract configId and parts from expected semester (e.g., "1/2567" -> configId "1-2567")
    const [semStr, yearStr] = expectedSemester.split("/");
    const semesterNum = Number(semStr);
    const academicYearNum = Number(yearStr);
    const configId = `${semesterNum}-${academicYearNum}`;

    // Check if localStorage already has the correct semester
    const currentStored = await this.page.evaluate(() =>
      window.localStorage.getItem("semester-selection"),
    );
    let needsUpdate = true;
    try {
      if (currentStored) {
        const parsed = JSON.parse(currentStored);
        needsUpdate = !(
          parsed?.state?.selectedSemester === configId &&
          parsed?.state?.academicYear === academicYearNum &&
          parsed?.state?.semester === semesterNum
        );
      }
    } catch {
      needsUpdate = true;
    }

    if (needsUpdate) {
      // Force semester into localStorage and reload to apply
      await this.page.evaluate(
        ({ configId, academicYearNum, semesterNum }) => {
          window.localStorage.setItem(
            "semester-selection",
            JSON.stringify({
              state: {
                selectedSemester: configId,
                academicYear: academicYearNum,
                semester: semesterNum,
              },
              version: 0,
            }),
          );
          // If zustand store is already mounted, update directly to avoid extra reload cost
          const store: any = (window as any).__semesterStore;
          if (store?.getState && store?.setState) {
            store.setState({
              selectedSemester: configId,
              academicYear: academicYearNum,
              semester: semesterNum,
            });
          }
        },
        { configId, academicYearNum, semesterNum },
      );

      await this.page.reload({ waitUntil: "domcontentloaded" });

      // Verify localStorage was set correctly after reload
      const stored = await this.page.evaluate(() =>
        window.localStorage.getItem("semester-selection"),
      );
      let valid = false;
      try {
        if (stored) {
          const parsed = JSON.parse(stored);
          valid =
            parsed?.state?.selectedSemester === configId &&
            parsed?.state?.academicYear === academicYearNum &&
            parsed?.state?.semester === semesterNum;
        }
      } catch {
        valid = false;
      }
      if (!valid) {
        throw new Error(
          `Semester sync failed: localStorage not set correctly to ${configId}`,
        );
      }
    }

    // Readiness heuristic:
    // Some pages (e.g. arrange page) do NOT render a <main> or table immediately.
    // We accept the page as ready when ANY of these stable root markers are present:
    //  - main / [role="main"] / table (generic content containers)
    //  - [role="combobox"] (teacher selection dropdown on arrange page)
    //  - [role="tablist"] (arrange tabs)
    //  - h4 heading with text "จัดตารางสอน" (Thai heading on arrange page)
    // This avoids false timeouts waiting for elements that are not part of certain routes.
    const readySelectors =
      'main,[role="main"],table,[role="combobox"],[role="tablist"],h4';
    await this.page.waitForFunction(
      (sel) => {
        // Check presence of any selector AND that it is visible in the viewport
        const nodes = Array.from(document.querySelectorAll(sel));
        return nodes.some((n) => {
          const style = window.getComputedStyle(n);
          const rect = n.getBoundingClientRect();
          return (
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            rect.width > 0 &&
            rect.height > 0
          );
        });
      },
      readySelectors,
      { timeout: 10000 },
    );

    // Defensive: ensure downstream code relying on useSemesterStore sees correct state
    await this.page.evaluate(
      ({ configId, academicYearNum, semesterNum }) => {
        const store: any = (window as any).__semesterStore;
        if (store?.getState) {
          const s = store.getState();
          if (s.selectedSemester !== configId) {
            store.setState({
              selectedSemester: configId,
              academicYear: academicYearNum,
              semester: semesterNum,
            });
          }
        }
      },
      { configId, academicYearNum, semesterNum },
    );
  }

  /**
   * Assert success notification appears
   */
  async assertSuccessNotification(message?: string) {
    await expect(this.snackbar).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.snackbarMessage).toContainText(message);
    }
  }

  /**
   * Assert error notification appears
   */
  async assertErrorNotification(message?: string) {
    await expect(this.snackbar).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.snackbarMessage).toContainText(message);
    }
  }

  /**
   * Wait for notification to disappear
   */
  async waitForNotificationToDisappear() {
    await expect(this.snackbar).toBeHidden({ timeout: 10000 });
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for specific element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 10000) {
    await expect(locator).toBeVisible({ timeout });
  }
}
