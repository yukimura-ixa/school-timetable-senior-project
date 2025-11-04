/**
 * Feature Flags API Route
 * 
 * GET /api/feature-flags?flag=newScheduleUI&userId=123&userRole=admin&userEmail=user@example.com
 * 
 * Returns whether a feature flag is enabled for the given user.
 * Uses Vercel Edge Config for <1ms latency.
 * 
 * @see src/lib/feature-flags.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { isFeatureEnabled, isValidFeatureFlag, type FeatureFlag } from '@/lib/feature-flags';

export const runtime = 'edge'; // Use Edge runtime for ultra-fast responses

/**
 * GET /api/feature-flags
 * 
 * Query parameters:
 * - flag (required): Feature flag identifier
 * - userId (optional): User ID for consistent rollout hashing
 * - userRole (optional): User role for role-based access
 * - userEmail (optional): User email for allowlist checking
 * 
 * Response:
 * - 200: { enabled: boolean }
 * - 400: { error: string } - Invalid flag or missing required params
 * - 500: { error: string } - Server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const flag = searchParams.get('flag');
    const userId = searchParams.get('userId') ?? undefined;
    const userRole = searchParams.get('userRole') ?? undefined;
    const userEmail = searchParams.get('userEmail') ?? undefined;

    // Validate required parameters
    if (!flag) {
      return NextResponse.json(
        { error: 'Missing required parameter: flag' },
        { status: 400 }
      );
    }

    // Validate flag is a known feature flag
    if (!isValidFeatureFlag(flag)) {
      return NextResponse.json(
        { error: `Invalid feature flag: ${flag}` },
        { status: 400 }
      );
    }

    // Check if feature is enabled
    const enabled = await isFeatureEnabled(
      flag,
      userId,
      userRole,
      userEmail
    );

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('[API] Error checking feature flag:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
