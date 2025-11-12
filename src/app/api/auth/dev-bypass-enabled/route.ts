import { NextResponse } from "next/server";

/**
 * API endpoint to check if dev bypass is enabled
 * This allows client components to conditionally show the bypass button
 * without embedding the security flag in the client bundle
 * 
 * SECURITY: This endpoint only reveals if bypass is enabled, but cannot
 * enable it - the actual bypass logic is server-side only
 */
export async function GET() {
  // Check both prefixed and non-prefixed versions for compatibility
  const nextPublic = process.env.NEXT_PUBLIC_ENABLE_DEV_BYPASS;
  const regular = process.env.ENABLE_DEV_BYPASS;
  const enabled = nextPublic === "true" || regular === "true";
  
  console.log('[DEV-BYPASS-API] Environment check:', {
    NEXT_PUBLIC_ENABLE_DEV_BYPASS: nextPublic,
    ENABLE_DEV_BYPASS: regular,
    enabled
  });
  
  return NextResponse.json({ enabled });
}
