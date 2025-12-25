import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware for redirecting old [semesterAndyear] URLs to new [academicYear]/[semester] structure
 *
 * Redirects:
 * - /schedule/1-2567/arrange → /schedule/2567/1/arrange
 * - /dashboard/2-2568/analytics → /dashboard/2568/2/analytics
 *
 * Uses 301 (Permanent Redirect) to signal this is the new canonical URL.
 * Preserves query parameters and hash fragments.
 */
export function middleware(request: NextRequest) {
  const { pathname, search, hash } = request.nextUrl;

  // Match old pattern: /{base}/{semester}-{year}/{...rest}
  // Examples:
  //   /schedule/1-2567/arrange
  //   /dashboard/2-2568/analytics
  const oldPattern = /^\/(schedule|dashboard)\/(\d)-(\d{4})(\/.*)?$/;
  const match = pathname.match(oldPattern);

  if (match) {
    const [, base, semester, year, rest = ""] = match;

    // Construct new URL: /{base}/{year}/{semester}/{rest}
    const newPath = `/${base}/${year}/${semester}${rest}`;

    const url = request.nextUrl.clone();
    url.pathname = newPath;
    // search and hash are automatically preserved

    console.log(`[Middleware] Redirecting: ${pathname} → ${newPath}`);

    // 301 Permanent Redirect
    // - Tells browsers to update bookmarks
    // - Tells search engines this is the new canonical URL
    // - Caches the redirect (subsequent visits go directly to new URL)
    return NextResponse.redirect(url, 301);
  }

  // No redirect needed, continue to route
  return NextResponse.next();
}

/**
 * Matcher configuration
 * Only run middleware on schedule and dashboard routes for performance
 */
export const config = {
  matcher: ["/schedule/:path*", "/dashboard/:path*"],
};
