import { Page } from "@playwright/test";

/**
 * Vercel Integration Test Helpers
 *
 * Utilities for testing against live Vercel deployments,
 * including handling authentication and share links.
 */

/**
 * Gets a Vercel share link for accessing protected deployments.
 *
 * Vercel share links allow temporary access without authentication.
 * They expire after 23 hours.
 *
 * @param page - Playwright page
 * @param url - Vercel deployment URL
 * @returns Share URL with _vercel_share parameter
 */
export async function getVercelShareUrl(
  page: Page,
  url: string,
): Promise<string> {
  // If MCP is available, use it to get share link
  // Otherwise, construct manually (note: requires valid share token)

  // For now, return URL as-is
  // In production, you'd integrate with Vercel MCP or API
  return url;
}

/**
 * Checks if we can access a Vercel URL (public or authenticated).
 *
 * @param page - Playwright page
 * @param url - URL to check
 * @returns true if accessible, false if requires auth
 */
export async function canAccessVercelUrl(
  page: Page,
  url: string,
): Promise<boolean> {
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });

  if (!response) return false;

  // Check if redirected to login
  const currentUrl = page.url();
  const isLoginPage =
    currentUrl.includes("signin") ||
    currentUrl.includes("login") ||
    currentUrl.includes("auth");

  // Check response status
  const isSuccessful = response.status() >= 200 && response.status() < 400;

  return isSuccessful && !isLoginPage;
}

/**
 * Waits for Vercel deployment to be ready (handles cold starts).
 *
 * @param page - Playwright page
 * @param url - Vercel deployment URL
 * @param maxWaitMs - Maximum time to wait (default: 30s)
 */
export async function waitForVercelDeployment(
  page: Page,
  url: string,
  maxWaitMs: number = 30000,
): Promise<void> {
  const startTime = Date.now();
  let lastError: Error | null = null;

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      if (response && response.status() < 500) {
        // Deployment is ready
        return;
      }
    } catch (error) {
      lastError = error as Error;
      // Wait before retry
      await page.waitForTimeout(2000);
    }
  }

  throw new Error(
    `Vercel deployment not ready after ${maxWaitMs}ms: ${lastError?.message}`,
  );
}

/**
 * Gets Vercel deployment metadata from headers.
 *
 * @param page - Playwright page
 * @param url - Vercel deployment URL
 * @returns Deployment metadata (region, cache status, etc.)
 */
export async function getVercelDeploymentInfo(
  page: Page,
  url: string,
): Promise<{
  region?: string;
  cacheStatus?: string;
  deploymentId?: string;
  server?: string;
}> {
  const response = await page.goto(url);

  if (!response) {
    return {};
  }

  const headers = response.headers();

  return {
    region: headers["x-vercel-id"]?.split("-")[0],
    cacheStatus: headers["x-vercel-cache"],
    deploymentId: headers["x-vercel-id"],
    server: headers["server"],
  };
}

/**
 * Checks if Vercel edge caching is working.
 *
 * @param page - Playwright page
 * @param url - Vercel deployment URL
 * @returns true if edge cache is active
 */
export async function isVercelCacheActive(
  page: Page,
  url: string,
): Promise<boolean> {
  const response = await page.goto(url);

  if (!response) return false;

  const headers = response.headers();
  const cacheStatus = headers["x-vercel-cache"];

  return cacheStatus === "HIT" || cacheStatus === "STALE";
}

/**
 * Gets Vercel deployment Next.js version from page.
 *
 * @param page - Playwright page
 * @returns Next.js version string or null
 */
export async function getNextJsVersion(page: Page): Promise<string | null> {
  try {
    const version = await page.evaluate(() => {
      // Check for Next.js version in page
      const nextData = document.getElementById("__NEXT_DATA__");
      if (nextData) {
        const data = JSON.parse(nextData.textContent || "{}");
        return data.buildId || null;
      }
      return null;
    });

    return version;
  } catch {
    return null;
  }
}

/**
 * Checks if page is using Turbopack (Next.js 16+).
 *
 * @param page - Playwright page
 * @returns true if Turbopack is detected
 */
export async function isTurbopackEnabled(page: Page): Promise<boolean> {
  try {
    // Check for Turbopack indicators in page source
    const content = await page.content();
    return content.includes("turbopack") || content.includes("__turbopack__");
  } catch {
    return false;
  }
}

/**
 * Measures Vercel deployment performance metrics.
 *
 * @param page - Playwright page
 * @param url - Vercel deployment URL
 * @returns Performance metrics
 */
export async function measureVercelPerformance(
  page: Page,
  url: string,
): Promise<{
  ttfb: number; // Time to first byte
  fcp: number; // First contentful paint
  lcp: number; // Largest contentful paint
  loadTime: number; // Total load time
}> {
  const startTime = Date.now();

  await page.goto(url, { waitUntil: "load" });

  const loadTime = Date.now() - startTime;

  const metrics = await page.evaluate(() => {
    const perfEntries = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;

    return {
      ttfb: perfEntries.responseStart - perfEntries.requestStart,
      fcp: 0, // Would need PerformanceObserver for accurate FCP
      lcp: 0, // Would need PerformanceObserver for accurate LCP
    };
  });

  return {
    ...metrics,
    loadTime,
  };
}

/**
 * Checks for common Vercel deployment issues.
 *
 * @param page - Playwright page
 * @param url - Vercel deployment URL
 * @returns Array of detected issues
 */
export async function checkVercelDeploymentIssues(
  page: Page,
  url: string,
): Promise<string[]> {
  const issues: string[] = [];

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });

    if (!response) {
      issues.push("No response from deployment");
      return issues;
    }

    // Check status code
    if (response.status() >= 500) {
      issues.push(`Server error: ${response.status()}`);
    }

    // Check for errors in console
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      issues.push(`JavaScript errors: ${errors.join(", ")}`);
    }

    // Check for failed network requests
    const failedRequests: string[] = [];
    page.on("requestfailed", (request) => {
      failedRequests.push(request.url());
    });

    await page.waitForTimeout(2000);

    if (failedRequests.length > 0) {
      issues.push(`Failed requests: ${failedRequests.length}`);
    }
  } catch (error) {
    issues.push(`Deployment check failed: ${(error as Error).message}`);
  }

  return issues;
}
