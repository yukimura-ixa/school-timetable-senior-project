import { expect, type Locator, type Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stabilityCss = path.join(__dirname, "visual-stability.css");

export function mainRegion(page: Page): Locator {
  return page
    .locator(
      [
        // Prefer a dedicated content wrapper when available (future-proof).
        "[data-testid='app-content']",
        // Semantic containers when present.
        "main",
        "[role='main']",
        // Current app layout uses content <span> wrappers (Tailwind classes).
        "span.flex.flex-col.px-16.py-2",
        "span.flex.flex-col.px-5.py-2",
        // Last-resort app roots.
        "#__next",
      ].join(","),
    )
    .first();
}

export function transientMasks(page: Page): Locator[] {
  return [
    page.locator("[data-testid='toast']"),
    page.locator(".MuiSnackbar-root"),
    page.locator("[data-testid='user-menu']"),
  ];
}

export async function expectLocatorScreenshot(
  page: Page,
  locator: Locator,
  name: string,
  opts: {
    mask?: Locator[];
    maxDiffPixels?: number;
    maxDiffPixelRatio?: number;
    timeoutMs?: number;
  } = {},
) {
  await expect(locator).toBeVisible();
  await expect(locator).toHaveScreenshot(name, {
    stylePath: stabilityCss,
    mask: opts.mask ?? transientMasks(page),
    maxDiffPixels: opts.maxDiffPixels,
    maxDiffPixelRatio: opts.maxDiffPixelRatio,
    timeout: opts.timeoutMs ?? 15_000,
  });
}

export async function expectMainScreenshot(
  page: Page,
  name: string,
  opts: {
    mask?: Locator[];
    maxDiffPixels?: number;
    maxDiffPixelRatio?: number;
    timeoutMs?: number;
  } = {},
) {
  const target = mainRegion(page);

  await expect(target).toBeVisible();
  await expect(target).toHaveScreenshot(name, {
    stylePath: stabilityCss,
    mask: opts.mask ?? transientMasks(page),
    maxDiffPixels: opts.maxDiffPixels,
    maxDiffPixelRatio: opts.maxDiffPixelRatio,
    timeout: opts.timeoutMs ?? 15_000,
  });
}
