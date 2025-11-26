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

  // Admin: allow access to everything
  if (role === "admin") {
    return NextResponse.next();
  }

  // Teacher: allow access to schedule, teacher-table, student-table, and select-semester
  if (role === "teacher") {
    const allowedPaths =
      pathname.includes("/schedule/") ||
      pathname.endsWith("/teacher-table") ||
      pathname.endsWith("/student-table") ||
      pathname.endsWith("/select-semester");

    if (!allowedPaths) {
      const dashboardUrl = new URL("/dashboard/select-semester", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // Student: restrict to student-table and select-semester only
  if (role === "student") {
    const allowedPaths =
      pathname.endsWith("/student-table") ||
      pathname.endsWith("/select-semester");

    if (!allowedPaths) {
      const signInUrl = new URL("/", req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/schedule/:path*",
    "/management/:path*",
    "/dashboard/:path*", // Allow all dashboard routes including select-semester, student-table, etc.
  ],
};
