/**
 * React Hook for Feature Flags
 * 
 * Client-side hook for checking feature flags with automatic session integration.
 * Uses SWR for caching and revalidation.
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { enabled, loading } = useFeatureFlag('newScheduleUI');
 *   
 *   if (loading) return <Skeleton />;
 *   if (!enabled) return <LegacyUI />;
 *   return <NewUI />;
 * }
 * ```
 */

'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import type { FeatureFlag } from '@/lib/feature-flags';

/**
 * Hook return type
 */
export interface UseFeatureFlagResult {
  /** Whether the feature is enabled for current user */
  enabled: boolean;
  
  /** Whether the check is still loading */
  loading: boolean;
  
  /** Error if flag check failed */
  error: Error | null;
  
  /** Force recheck the flag */
  revalidate: () => void;
}

/**
 * React hook to check if a feature flag is enabled for the current user
 * 
 * Automatically uses session data (userId, role, email) from NextAuth.
 * Caches results and revalidates on session change.
 * 
 * @param flag - Feature flag identifier
 * @param options - Optional configuration
 * @param options.fallbackEnabled - Value to return while loading (default: false)
 * @returns UseFeatureFlagResult
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { enabled, loading } = useFeatureFlag('analyticsV2');
 * 
 * // With loading fallback
 * const { enabled } = useFeatureFlag('exportV2', { fallbackEnabled: true });
 * 
 * // Conditional rendering
 * const { enabled, loading, error } = useFeatureFlag('realTimeCollab');
 * if (loading) return <Loading />;
 * if (error) return <ErrorBoundary />;
 * return enabled ? <RealtimeView /> : <StaticView />;
 * ```
 */
export function useFeatureFlag(
  flag: FeatureFlag,
  options: { fallbackEnabled?: boolean } = {}
): UseFeatureFlagResult {
  const { data: session, status } = useSession();
  const [enabled, setEnabled] = useState(options.fallbackEnabled ?? false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [revalidationKey, setRevalidationKey] = useState(0);

  useEffect(() => {
    // Don't check if session is still loading
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    let isMounted = true;
    
    async function checkFlag(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        // Call API route to check feature flag
        const params = new URLSearchParams({
          flag,
          ...(session?.user?.id && { userId: session.user.id }),
          ...(session?.user?.role && { userRole: session.user.role }),
          ...(session?.user?.email && { userEmail: session.user.email }),
        });

        const response = await fetch(`/api/feature-flags?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to check feature flag: ${response.statusText}`);
        }

        const data = (await response.json()) as { enabled: boolean };
        
        if (isMounted) {
          setEnabled(data.enabled);
        }
      } catch (err) {
        console.error(`[useFeatureFlag] Error checking flag "${flag}":`, err);
        if (isMounted) {
          setError(err as Error);
          // Fail closed - disable feature on error
          setEnabled(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void checkFlag();

    return () => {
      isMounted = false;
    };
  }, [flag, session?.user?.id, session?.user?.role, session?.user?.email, status, revalidationKey]);

  const revalidate = (): void => {
    setRevalidationKey((k) => k + 1);
  };

  return { enabled, loading, error, revalidate };
}

/**
 * Hook to check multiple feature flags at once
 * More efficient than calling useFeatureFlag multiple times
 * 
 * @param flags - Array of feature flag identifiers
 * @returns Map of flag names to their enabled status and loading state
 * 
 * @example
 * ```typescript
 * const flags = useFeatureFlags(['newScheduleUI', 'analyticsV2', 'exportV2']);
 * 
 * if (flags.get('newScheduleUI')?.enabled) {
 *   // Show new UI
 * }
 * ```
 */
export function useFeatureFlags(
  flags: FeatureFlag[]
): Map<FeatureFlag, UseFeatureFlagResult> {
  const { data: session, status } = useSession();
  const [results, setResults] = useState<Map<FeatureFlag, UseFeatureFlagResult>>(new Map());
  const [revalidationKey, setRevalidationKey] = useState(0);

  useEffect(() => {
    // Don't check if session is still loading
    if (status === 'loading') {
      // Keep loading state
      return;
    }

    let isMounted = true;
    
    async function checkFlags(): Promise<void> {
      try {
        // Call API route with multiple flags
        const params = new URLSearchParams({
          flags: flags.join(','),
          ...(session?.user?.id && { userId: session.user.id }),
          ...(session?.user?.role && { userRole: session.user.role }),
          ...(session?.user?.email && { userEmail: session.user.email }),
        });

        const response = await fetch(`/api/feature-flags/batch?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to check feature flags: ${response.statusText}`);
        }

        const data = (await response.json()) as { flags: Record<string, boolean> };
        
        if (isMounted) {
          const newResults = new Map<FeatureFlag, UseFeatureFlagResult>();
          
          for (const flag of flags) {
            newResults.set(flag, {
              enabled: data.flags[flag] ?? false,
              loading: false,
              error: null,
              revalidate: () => setRevalidationKey((k) => k + 1),
            });
          }
          
          setResults(newResults);
        }
      } catch (err) {
        console.error('[useFeatureFlags] Error checking flags:', err);
        if (isMounted) {
          // Set all flags to disabled with error
          const newResults = new Map<FeatureFlag, UseFeatureFlagResult>();
          for (const flag of flags) {
            newResults.set(flag, {
              enabled: false,
              loading: false,
              error: err as Error,
              revalidate: () => setRevalidationKey((k) => k + 1),
            });
          }
          setResults(newResults);
        }
      }
    }

    // Initialize with loading state
    const loadingResults = new Map<FeatureFlag, UseFeatureFlagResult>();
    for (const flag of flags) {
      loadingResults.set(flag, {
        enabled: false,
        loading: true,
        error: null,
        revalidate: () => setRevalidationKey((k) => k + 1),
      });
    }
    setResults(loadingResults);

    void checkFlags();

    return () => {
      isMounted = false;
    };
  }, [flags.join(','), session?.user?.id, session?.user?.role, session?.user?.email, status, revalidationKey]);

  return results;
}
