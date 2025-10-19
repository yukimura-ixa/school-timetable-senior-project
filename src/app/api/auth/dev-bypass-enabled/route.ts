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
  const enabled = process.env.ENABLE_DEV_BYPASS === "true";
  
  return NextResponse.json({ enabled });
}
