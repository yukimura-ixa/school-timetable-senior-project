import { getBaseUrl } from "@/utils/canonical-url";

/**
 * Origin for the headless self-render of a `/print/*` page.
 *
 * Order: trusted server-config `BASE_URL` first → canonical base in production →
 * same-origin in dev. `BASE_URL` is a **runtime** env (unlike build-inlined
 * `NEXT_PUBLIC_BASE_URL` that `getBaseUrl()` reads), and CI/E2E prod builds set
 * it to the local test server — without this, `getBaseUrl()` points puppeteer at
 * the live Vercel deployment, which 404s on the test's data/session. Never the
 * spoofable `Host` header (avoids SSRF / forwarding session cookies off-origin).
 */
export function resolveSelfRenderBase(req: Request): string {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  return process.env.NODE_ENV === "production"
    ? getBaseUrl()
    : new URL(req.url).origin;
}

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
