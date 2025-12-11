import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
    asResponse: false,
  });

  const pathname = req.nextUrl.pathname;

  // Check if user is authenticated
  if (!session || !session.user) {
    console.log("[PROXY] No session found, redirecting to /");
    const signInUrl = new URL("/", req.url);
    return NextResponse.redirect(signInUrl);
  }

  const role = session.user.role;
  console.log("[PROXY] User role:", role);
  console.log("[PROXY] Pathname:", pathname);

  // Admin-only: only admins can access protected routes
  if (role === "admin") {
    console.log("[PROXY] Admin access granted");
    return NextResponse.next();
  }

  // Non-admin authenticated users (teacher/student) are treated as guests
  // Redirect them to homepage
  console.log("[PROXY] Non-admin user, redirecting to /");
  const homeUrl = new URL("/", req.url);
  return NextResponse.redirect(homeUrl);
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/schedule/:path*",
    "/management/:path*",
    "/dashboard/:path*", // Allow all dashboard routes including select-semester, student-table, etc.
  ],
};
