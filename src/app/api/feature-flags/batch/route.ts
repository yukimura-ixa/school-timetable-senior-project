/**
 * Feature Flags Batch API Route
 * 
 * GET /api/feature-flags/batch?flags=newScheduleUI,analyticsV2&userId=123&userRole=admin
 * 
 * Returns enabled status for multiple feature flags in a single request.
 * More efficient than making individual calls for each flag.
 * 
 * @see src/lib/feature-flags.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { isFeatureEnabled, isValidFeatureFlag, type FeatureFlag } from '@/lib/feature-flags';

export const runtime = 'edge'; // Use Edge runtime for ultra-fast responses

/**
 * GET /api/feature-flags/batch
 * 
 * Query parameters:
 * - flags (required): Comma-separated list of feature flag identifiers
 * - userId (optional): User ID for consistent rollout hashing
 * - userRole (optional): User role for role-based access
 * - userEmail (optional): User email for allowlist checking
 * 
 * Response:
 * - 200: { flags: { [flagName]: boolean } }
 * - 400: { error: string } - Invalid flags or missing required params
 * - 500: { error: string } - Server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const flagsParam = searchParams.get('flags');
    const userId = searchParams.get('userId') ?? undefined;
    const userRole = searchParams.get('userRole') ?? undefined;
    const userEmail = searchParams.get('userEmail') ?? undefined;

    // Validate required parameters
    if (!flagsParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: flags' },
        { status: 400 }
      );
    }

    // Parse comma-separated flags
    const flagNames = flagsParam.split(',').map((f) => f.trim());
    
    // Validate all flags are known
    const invalidFlags = flagNames.filter((f) => !isValidFeatureFlag(f));
    if (invalidFlags.length > 0) {
      return NextResponse.json(
        { error: `Invalid feature flags: ${invalidFlags.join(', ')}` },
        { status: 400 }
      );
    }

    // Check all flags in parallel
    const results = await Promise.all(
      flagNames.map(async (flag) => {
        const enabled = await isFeatureEnabled(
          flag as FeatureFlag,
          userId,
          userRole,
          userEmail
        );
        return [flag, enabled] as const;
      })
    );

    // Convert to object
    const flags: Record<string, boolean> = Object.fromEntries(results);

    return NextResponse.json({ flags });
  } catch (error) {
    console.error('[API] Error checking feature flags:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
