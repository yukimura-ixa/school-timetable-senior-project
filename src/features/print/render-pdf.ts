import "server-only";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import type { PuppeteerCookie } from "./cookies";

export type RenderPdfOptions = {
  landscape: boolean;
  cookies?: PuppeteerCookie[];
};

export async function renderUrlToPdf(
  url: string,
  { landscape, cookies = [] }: RenderPdfOptions,
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
    // TimeslotGrid renders either schedule-grid (has data) or schedule-empty
    // (no schedule for this grade/term) — accept both so an empty timetable
    // still produces a PDF instead of failing the render. networkidle0 above
    // ensures data has loaded, so this reflects the settled state. Timeout
    // raised for headless-Chromium render latency under CI parallel load.
    await page.waitForSelector(
      '[data-testid="schedule-grid"], [data-testid="schedule-empty"]',
      { timeout: 30_000 },
    );
    const pdf = await page.pdf({
      format: "a4",
      landscape,
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
