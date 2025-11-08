import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  let token = req.auth
  
  // SECURITY: Use server-only env variable to prevent bypass in production
  // This variable is NOT embedded in the client bundle
  if (process.env.ENABLE_DEV_BYPASS === "true") {
    console.log("[AUTH] Dev bypass is enabled - injecting mock admin session")
    // Inject mock admin session for E2E tests
    token = {
      user: {
        id: process.env.DEV_USER_ID || "1",
        email: process.env.DEV_USER_EMAIL || "admin@test.local",
        name: process.env.DEV_USER_NAME || "E2E Admin",
        role: process.env.DEV_USER_ROLE || "admin",
      },
    } as any
    // Set the auth on the request for downstream handlers
    req.auth = token
  }

  const pathname = req.nextUrl.pathname

  // Check if user is authenticated
  if (!token) {
    const signInUrl = new URL("/", req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Admin: allow access to everything
  if (token?.user?.role === "admin") {
    return NextResponse.next()
  }

  // Teacher: allow access to schedule, teacher-table, student-table, and select-semester
  if (token?.user?.role === "teacher") {
    const allowedPaths = (
      pathname.includes("/schedule/") ||
      pathname.endsWith("/teacher-table") ||
      pathname.endsWith("/student-table") ||
      pathname.endsWith("/select-semester")
    )
    
    if (!allowedPaths) {
      const dashboardUrl = new URL("/dashboard/select-semester", req.url)
      return NextResponse.redirect(dashboardUrl)
    }
    return NextResponse.next()
  }

  // Student: restrict to student-table and select-semester only
  if (token?.user?.role === "student") {
    const allowedPaths = (
      pathname.endsWith("/student-table") ||
      pathname.endsWith("/select-semester")
    )
    
    if (!allowedPaths) {
      const signInUrl = new URL("/", req.url)
      return NextResponse.redirect(signInUrl)
    }
    return NextResponse.next()
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/schedule/:path*",
    "/management/:path*",
    "/dashboard/:path*", // Allow all dashboard routes including select-semester, student-table, etc.
  ],
}
