import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const token = req.auth

  // SECURITY: Use server-only env variable to prevent bypass in production
  if (process.env.ENABLE_DEV_BYPASS === "true") {
    console.log("[AUTH] Dev bypass is enabled - allowing all requests")
    return NextResponse.next()
  }

  const pathname = req.nextUrl.pathname

  // Unauthenticated users: send to sign-in page for protected routes
  if (!token) {
    const signInUrl = new URL("/signin", req.url)
    // Avoid redirect loop if already on /signin
    if (pathname !== signInUrl.pathname) {
      return NextResponse.redirect(signInUrl)
    }
    return NextResponse.next()
  }

  // Teacher: allow teacher-table, student-table, and select-semester; otherwise funnel to select-semester
  if (token?.user?.role === "teacher") {
    const allowed = (
      pathname.endsWith("/teacher-table") ||
      pathname.endsWith("/student-table") ||
      pathname.endsWith("/select-semester")
    )
    if (!allowed) {
      const target = new URL("/dashboard/select-semester", req.url)
      if (pathname !== target.pathname) {
        return NextResponse.redirect(target)
      }
    }
  }

  // Admin: proceed
  if (token?.user?.role === "admin") {
    return NextResponse.next()
  }

  // Student: restrict to student-table within dashboard
  if (token?.user?.role === "student") {
    const allowed = pathname.endsWith("/student-table") || pathname.endsWith("/select-semester")
    if (!allowed) {
      const target = new URL("/signin", req.url)
      if (pathname !== target.pathname) {
        return NextResponse.redirect(target)
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  // Limit auth proxy to protected sections to avoid redirect loops on public pages and NextAuth routes
  matcher: [
    "/schedule/:path*",
    "/management/:path*",
    "/dashboard/:path*",
  ],
}

// If you need to limit matching paths, reintroduce a matcher here once verified for Next.js 16 proxy.
