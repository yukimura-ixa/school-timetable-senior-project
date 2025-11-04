/**
 * Feature Flags Service using Vercel Edge Config
 * 
 * Ultra-fast feature flag reads (<1ms latency) for:
 * - Gradual rollouts (10% → 50% → 100%)
 * - A/B testing
 * - Emergency kill switches
 * - Role-based features
 * - Email allowlists
 * 
 * @see https://vercel.com/docs/storage/edge-config
 * @see Issue #38
 */

import { get } from '@vercel/edge-config';

/**
 * Feature flag identifiers
 * Add new flags here as they're created
 */
export type FeatureFlag =
  | 'newScheduleUI'      // Gradual rollout of rebuilt schedule page
  | 'realTimeCollab'     // Enable WebSocket features (Issue #34)
  | 'analyticsV2'        // Dashboard improvements
  | 'exportV2'           // New export engine
  | 'betaFeatures'       // General beta access control
  | 'advancedFilters'    // Advanced schedule filtering
  | 'notifications';     // Email/SMS notifications

/**
 * Feature flag configuration structure
 */
export interface FlagConfig {
  /** Master switch - if false, feature is disabled for everyone */
  enabled: boolean;
  
  /** Rollout percentage (0-100). If set, uses consistent hashing on userId */
  rolloutPercent?: number;
  
  /** Role-based access control. If set, only these roles can access the feature */
  allowedRoles?: string[];
  
  /** Email allowlist. If set, only these emails can access the feature */
  allowedEmails?: string[];
  
  /** Description for admin dashboard (optional) */
  description?: string;
}

/**
 * Check if a feature flag is enabled for a specific user
 * 
 * Evaluation order:
 * 1. Master switch (enabled: false → returns false)
 * 2. Role-based access (if set and user role not in list → returns false)
 * 3. Email allowlist (if set and user email not in list → returns false)
 * 4. Rollout percentage (if set, uses consistent hash of userId)
 * 5. Default: returns true
 * 
 * @param flag - Feature flag identifier
 * @param userId - User ID for consistent rollout hashing (optional)
 * @param userRole - User role for role-based access (optional)
 * @param userEmail - User email for allowlist checking (optional)
 * @returns Promise<boolean> - true if feature is enabled for this user
 * 
 * @example
 * ```typescript
 * // Check if analytics v2 is enabled for admin
 * const enabled = await isFeatureEnabled('analyticsV2', userId, 'admin');
 * 
 * // Check with session data
 * const session = await auth();
 * const canUseNewUI = await isFeatureEnabled(
 *   'newScheduleUI',
 *   session?.user?.id,
 *   session?.user?.role,
 *   session?.user?.email
 * );
 * ```
 */
export async function isFeatureEnabled(
  flag: FeatureFlag,
  userId?: string,
  userRole?: string,
  userEmail?: string
): Promise<boolean> {
  try {
    // Fetch flag configuration from Edge Config
    const config = await get<FlagConfig>(flag);
    
    // If flag doesn't exist or is disabled, return false
    if (!config?.enabled) {
      return false;
    }
    
    // Check role-based access control
    if (config.allowedRoles && config.allowedRoles.length > 0) {
      if (!userRole || !config.allowedRoles.includes(userRole)) {
        return false;
      }
    }
    
    // Check email allowlist
    if (config.allowedEmails && config.allowedEmails.length > 0) {
      if (!userEmail || !config.allowedEmails.includes(userEmail)) {
        return false;
      }
    }
    
    // Check rollout percentage (consistent hashing)
    if (config.rolloutPercent !== undefined && userId) {
      const hash = simpleHash(userId);
      const inRollout = (hash % 100) < config.rolloutPercent;
      return inRollout;
    }
    
    // All checks passed
    return true;
  } catch (error) {
    console.error(`[FeatureFlags] Error checking flag "${flag}":`, error);
    // Fail closed - return false if Edge Config is unavailable
    return false;
  }
}

/**
 * Get all feature flags and their configurations
 * Useful for admin dashboards
 * 
 * @returns Promise<Record<string, FlagConfig> | null>
 * 
 * @example
 * ```typescript
 * const allFlags = await getAllFeatureFlags();
 * console.log(allFlags);
 * // {
 * //   newScheduleUI: { enabled: true, rolloutPercent: 50, ... },
 * //   analyticsV2: { enabled: true, allowedRoles: ['admin'], ... }
 * // }
 * ```
 */
export async function getAllFeatureFlags(): Promise<Record<string, FlagConfig> | null> {
  try {
    // Get all items from Edge Config
    const allConfig = await get<Record<string, FlagConfig>>('__all__');
    return allConfig || null;
  } catch (error) {
    console.error('[FeatureFlags] Error fetching all flags:', error);
    return null;
  }
}

/**
 * Check if a feature flag exists in Edge Config
 * 
 * @param flag - Feature flag identifier
 * @returns Promise<boolean>
 */
export async function hasFeatureFlag(flag: FeatureFlag): Promise<boolean> {
  try {
    const config = await get<FlagConfig>(flag);
    return config !== undefined && config !== null;
  } catch (error) {
    console.error(`[FeatureFlags] Error checking existence of flag "${flag}":`, error);
    return false;
  }
}

/**
 * Simple hash function for consistent rollout percentage
 * Uses FNV-1a algorithm for fast, consistent hashing
 * 
 * @param str - String to hash (typically userId)
 * @returns number - Hash value
 * 
 * @internal
 */
function simpleHash(str: string): number {
  let hash = 2166136261; // FNV offset basis
  
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
  }
  
  return Math.abs(hash);
}

/**
 * Helper to get feature flag config for debugging
 * Should only be used in development/admin contexts
 * 
 * @param flag - Feature flag identifier
 * @returns Promise<FlagConfig | null>
 */
export async function getFeatureFlagConfig(flag: FeatureFlag): Promise<FlagConfig | null> {
  try {
    const config = await get<FlagConfig>(flag);
    return config || null;
  } catch (error) {
    console.error(`[FeatureFlags] Error fetching config for flag "${flag}":`, error);
    return null;
  }
}

/**
 * Type guard to check if a string is a valid FeatureFlag
 * 
 * @param flag - String to check
 * @returns boolean
 */
export function isValidFeatureFlag(flag: string): flag is FeatureFlag {
  const validFlags: FeatureFlag[] = [
    'newScheduleUI',
    'realTimeCollab',
    'analyticsV2',
    'exportV2',
    'betaFeatures',
    'advancedFilters',
    'notifications',
  ];
  
  return validFlags.includes(flag as FeatureFlag);
}
