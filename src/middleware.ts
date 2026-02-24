import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Deny-by-default authentication middleware.
 *
 * Checks for a Better Auth session cookie on every matched request.
 * Public paths are explicitly allow-listed below; everything else
 * requires an active session cookie.
 *
 * NOTE: This is an *authentication* safety net (are you logged in?).
 * Authorization (are you admin?) is still enforced by layout guards
 * and per-route handlers.
 */

// ─── Public path patterns ────────────────────────────────────────────
// Paths that do NOT require authentication.
const PUBLIC_PATH_PREFIXES = [
  // Auth pages
  "/signin",
  "/forgot-password",
  "/reset-password",

  // Public timetable views — (public) route group maps to root
  "/classes",
  "/teachers",

  // Better Auth API handler
  "/api/auth",

  // Health / monitoring (skip per design doc)
  "/api/ping",
  "/api/health",
  "/api/telemetry",
];

/** The public landing page is at "/" exactly. */
function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ─── Middleware ──────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for Better Auth session cookie (optimistic — no DB call)
  const sessionToken = getSessionCookie(request);

  if (!sessionToken) {
    // API routes → 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Page routes → redirect to sign-in
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

// ─── Matcher ─────────────────────────────────────────────────────────
// Skip static assets, _next internals, and favicon
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets in /public folder
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
