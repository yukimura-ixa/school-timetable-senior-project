export type PuppeteerCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
};

/**
 * Turn a request Cookie header into puppeteer cookie objects scoped to `domain`.
 *
 * Under HTTPS (`secure: true`), Better-Auth issues `__Secure-`prefixed session
 * cookies, and Chromium's `page.setCookie` silently drops a `__Secure-*` cookie
 * unless `secure: true` is set — which would fail the headless print page's
 * admin auth check. Mark forwarded cookies Secure + Lax in that case. The
 * default (`false`) keeps the plain-http/localhost path unchanged.
 */
export function parseCookieHeader(
  header: string | null,
  domain: string,
  secure = false,
): PuppeteerCookie[] {
  if (!header) return [];
  return header
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      const cookie: PuppeteerCookie = { name, value, domain, path: "/" };
      if (secure) {
        cookie.secure = true;
        cookie.sameSite = "Lax";
      }
      return cookie;
    })
    .filter((c) => c.name.length > 0);
}
