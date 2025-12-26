import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware (proxy) for redirecting old [semesterAndyear] URLs
 * to new [academicYear]/[semester] structure
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
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pattern 1: /schedule or /dashboard routes
  // Match: /{base}/{semester}-{year}/{...rest}
  const mainPattern = /^\/(schedule|dashboard)\/(\d)-(25\d{2})(\/.*)?$/;
  let match = pathname.match(mainPattern);

  if (match) {
    const [, base, semester, year, rest = ""] = match;
    const newPath = `/${base}/${year}/${semester}${rest}`;

    const url = request.nextUrl.clone();
    url.pathname = newPath;

    console.log(`[Proxy] Redirecting: ${pathname} → ${newPath}`);
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

    console.log(`[Proxy] Redirecting: ${pathname} → ${newPath}`);
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

    console.log(`[Proxy] Redirecting: ${pathname} → ${newPath}`);
    return NextResponse.redirect(url, 301);
  }

  // No redirect needed, continue to route
  return NextResponse.next();
}

/**
 * Matcher configuration
 * Run proxy on schedule, dashboard, classes, and teachers routes
 */
export const config = {
  matcher: [
    "/schedule/:path*",
    "/dashboard/:path*",
    "/classes/:path*",
    "/teachers/:path*",
  ],
};
