import "server-only";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import type { PuppeteerCookie } from "./cookies";

export type RenderPdfOptions = {
  cookies?: PuppeteerCookie[];
};

export async function renderUrlToPdf(
  url: string,
  { cookies = [] }: RenderPdfOptions = {},
): Promise<Buffer> {
  const isProd = process.env.NODE_ENV === "production";
  const browser = await puppeteer.launch(
    isProd
      ? {
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        }
      : {
          executablePath: process.env.CHROME_PATH,
          headless: true,
        },
  );
  try {
    const page = await browser.newPage();
    if (cookies.length) await page.setCookie(...cookies);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });
    // Wait for the grid OR the empty-state marker — an empty timetable renders
    // schedule-empty (not schedule-grid); waiting only for the grid would time
    // out and 500 the PDF route.
    await page.waitForSelector(
      '[data-testid="schedule-grid"], [data-testid="schedule-empty"]',
      { timeout: 15_000 },
    );
    // Orientation is declared per page via PrintShell's `@page { size: A4 ... }`;
    // preferCSSPageSize lets that win, so landscape print pages aren't forced to
    // portrait (which clipped the wide timetable grid).
    const pdf = await page.pdf({
      format: "a4",
      preferCSSPageSize: true,
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
