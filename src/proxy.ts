import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Next.js Proxy — combines URL migration redirects with auth safety net.
 *
 * 1. URL redirects: old [semesterAndyear] → new [academicYear]/[semester]
 * 2. Auth: deny-by-default session cookie check for protected routes
 *
 * Redirects (OLD → NEW):
 * - /schedule/1-2567/arrange → /schedule/2567/1/arrange
 * - /dashboard/2-2568/analytics → /dashboard/2568/2/analytics
 * - /classes/M1-1/1-2567 → /classes/M1-1/2567/1
 * - /teachers/1/1-2567 → /teachers/1/2567/1
 *
 * Uses 301 (Permanent Redirect) to signal this is the new canonical URL.
 * Preserves query parameters and hash fragments.
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Step 1: URL migration redirects ─────────────────────────────

  // Pattern 1: /schedule or /dashboard routes
  // Match: /{base}/{semester}-{year}/{...rest}
  const mainPattern = /^\/(schedule|dashboard)\/(\d)-(25\d{2})(\/.*)?$/;
  let match = pathname.match(mainPattern);

  if (match) {
    const [, base, semester, year, rest = ""] = match;
    const newPath = `/${base}/${year}/${semester}${rest}`;

    const url = request.nextUrl.clone();
    url.pathname = newPath;

    return NextResponse.redirect(url, 301);
  }

  // Pattern 2: Public class routes
  // Match: /classes/{gradeId}/{semester}-{year}
  const classPattern = /^\/classes\/([^/]+)\/(\d)-(25\d{2})$/;
  match = pathname.match(classPattern);

  if (match) {
    const [, gradeId, semester, year] = match;
    const newPath = `/classes/${gradeId}/${year}/${semester}`;

    const url = request.nextUrl.clone();
    url.pathname = newPath;

    return NextResponse.redirect(url, 301);
  }

  // Pattern 3: Public teacher routes
  // Match: /teachers/{id}/{semester}-{year}
  const teacherPattern = /^\/teachers\/(\d+)\/(\d)-(25\d{2})$/;
  match = pathname.match(teacherPattern);

  if (match) {
    const [, id, semester, year] = match;
    const newPath = `/teachers/${id}/${year}/${semester}`;

    const url = request.nextUrl.clone();
    url.pathname = newPath;

    return NextResponse.redirect(url, 301);
  }

  // ── Step 2: Authentication safety net ───────────────────────────

  // Allow public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for Better Auth session cookie (optimistic — no DB call)
  const sessionToken = getSessionCookie(request);

  if (!sessionToken) {
    // API routes → 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Page routes → redirect to sign-in
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // No redirect needed, continue to route
  return NextResponse.next();
}

/**
 * Matcher configuration
 * Run proxy on all routes except static assets and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
