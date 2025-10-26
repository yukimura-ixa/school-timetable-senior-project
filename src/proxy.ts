import { auth } from "@/libs/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const token = req.auth
  
  // SECURITY: Use server-only env variable to prevent bypass in production
  // This variable is NOT embedded in the client bundle
  if (process.env.ENABLE_DEV_BYPASS === "true") {
    console.log("[AUTH] Dev bypass is enabled - allowing all requests")
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    const signInUrl = new URL("/", req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Teacher-specific redirects
  if (
    token?.user?.role === "teacher" &&
    !(req.nextUrl.pathname.endsWith("/teacher-table") || req.nextUrl.pathname.endsWith("/student-table"))
  ) {
    const dashboardUrl = new URL("/dashboard/select-semester", req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Admin always allowed
  if (token?.user?.role === "admin") {
    return NextResponse.next()
  }

  // Student restrictions
  if (token?.user?.role === "student" && !req.nextUrl.pathname.endsWith("student-table")) {
    const signInUrl = new URL("/", req.url)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    "/schedule/:path*",
    "/management/:path*",
    "/dashboard/:path/all-program",
    "/dashboard/:path/all-timeslot",
    "/dashboard/:path/teacher-table",
  ],
}
