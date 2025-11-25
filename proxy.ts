import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const token = req.auth;

  const pathname = req.nextUrl.pathname;

  // Check if user is authenticated
  if (!token) {
    console.log("[PROXY] No token found, redirecting to /");
    const signInUrl = new URL("/", req.url);
    return NextResponse.redirect(signInUrl);
  }

  console.log("[PROXY] User role:", token?.user?.role);
  console.log("[PROXY] Pathname:", pathname);

  // Admin: allow access to everything
  if (token?.user?.role === "admin") {
    return NextResponse.next();
  }

  // Teacher: allow access to schedule, teacher-table, student-table, and select-semester
  if (token?.user?.role === "teacher") {
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
  if (token?.user?.role === "student") {
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
});

export const config = {
  matcher: [
    "/schedule/:path*",
    "/management/:path*",
    "/dashboard/:path*", // Allow all dashboard routes including select-semester, student-table, etc.
  ],
};
