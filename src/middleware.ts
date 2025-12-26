import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware - Route Compatibility Layer
 *
 * Redirects new [academicYear]/[semester] URL format to existing [semesterAndyear] routes.
 * This allows users to use either URL format while routes remain in legacy structure.
 *
 * Examples:
 *   /schedule/2567/1/arrange → /schedule/1-2567/arrange
 *   /dashboard/2568/2/analytics → /dashboard/2-2568/analytics
 *
 * When the full migration is complete, this middleware can be removed.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Match new pattern: /{base}/{year}/{semester}/{...rest}
  // where year is 4 digits (Buddhist year 2500-2599) and semester is 1 or 2
  const newPattern = /^\/(schedule|dashboard)\/(25\d{2})\/([12])(\/.*)?$/;
  const match = pathname.match(newPattern);

  if (match) {
    const [, base, year, semester, rest = ""] = match;

    // Construct old URL format: /{base}/{semester}-{year}/{rest}
    const oldPath = `/${base}/${semester}-${year}${rest}`;

    const url = request.nextUrl.clone();
    url.pathname = oldPath;

    // Use 307 Temporary Redirect (preserves method, doesn't cache)
    // This allows us to change behavior later without browser cache issues
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run on schedule and dashboard routes for performance
    "/schedule/:path*",
    "/dashboard/:path*",
  ],
};
