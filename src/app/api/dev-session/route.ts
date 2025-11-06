import { NextRequest, NextResponse } from "next/server"

/**
 * Custom session endpoint for E2E testing
 * When ENABLE_DEV_BYPASS is true, returns a mock admin session
 * Otherwise, proxies to the real NextAuth session endpoint
 */
export async function GET(request: NextRequest) {
  // Check if dev bypass is enabled
  if (process.env.ENABLE_DEV_BYPASS === "true") {
    console.log("[DEV-SESSION] Returning mock admin session")
    
    return NextResponse.json({
      user: {
        id: process.env.DEV_USER_ID || "1",
        email: process.env.DEV_USER_EMAIL || "admin@test.local",
        name: process.env.DEV_USER_NAME || "E2E Admin",
        role: process.env.DEV_USER_ROLE || "admin",
        image: null,
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }
  
  // If bypass not enabled, fetch real session from NextAuth
  const sessionUrl = new URL("/api/auth/session", request.url)
  const response = await fetch(sessionUrl.toString())
  const session = await response.json()
  
  return NextResponse.json(session)
}
