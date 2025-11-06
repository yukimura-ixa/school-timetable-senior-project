import { handlers } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// Override GET handler to inject dev bypass session
async function getHandler(req: NextRequest) {
  // Check if dev bypass is enabled and this is a session request
  if (process.env.ENABLE_DEV_BYPASS === "true") {
    const url = new URL(req.url)
    const isSessionRequest = url.pathname.endsWith("/session")
    
    if (isSessionRequest) {
      // eslint-disable-next-line no-console
      console.log("[AUTH] Dev bypass - returning mock session")
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
  }
  
  // Use original NextAuth handler
  return handlers.GET(req)
}

export const GET = getHandler
export const { POST } = handlers
