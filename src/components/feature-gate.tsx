/**
 * Feature Gate Components
 * 
 * React components for conditional feature rendering based on feature flags.
 * Integrates with NextAuth session and Vercel Edge Config.
 * 
 * @example
 * ```typescript
 * // Basic usage
 * <FeatureGate feature="newScheduleUI">
 *   <NewScheduleUI />
 * </FeatureGate>
 * 
 * // With fallback
 * <FeatureGate feature="analyticsV2" fallback={<LegacyDashboard />}>
 *   <AnalyticsV2 />
 * </FeatureGate>
 * 
 * // With loading state
 * <FeatureGate 
 *   feature="exportV2" 
 *   fallback={<OldExport />}
 *   loading={<Skeleton />}
 * >
 *   <NewExport />
 * </FeatureGate>
 * ```
 */

'use client';

import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import type { FeatureFlag } from '@/lib/feature-flags';
import type { ReactNode } from 'react';

/**
 * Props for FeatureGate component
 */
export interface FeatureGateProps {
  /** Feature flag to check */
  feature: FeatureFlag;
  
  /** Content to render if feature is enabled */
  children: ReactNode;
  
  /** Content to render if feature is disabled (default: null) */
  fallback?: ReactNode;
  
  /** Content to render while loading (default: null) */
  loading?: ReactNode;
  
  /** Content to render if there's an error (default: fallback) */
  error?: ReactNode;
  
  /** Invert the logic - show children when feature is disabled */
  inverse?: boolean;
}

/**
 * Component that conditionally renders children based on a feature flag
 * 
 * Uses NextAuth session to automatically check user role/email/id.
 * Renders different content based on flag state (enabled/disabled/loading/error).
 * 
 * @example
 * ```typescript
 * // Show new UI only when feature is enabled
 * <FeatureGate feature="newScheduleUI">
 *   <NewScheduleComponent />
 * </FeatureGate>
 * 
 * // Show different content based on flag
 * <FeatureGate 
 *   feature="realTimeCollab"
 *   fallback={<StaticScheduleView />}
 * >
 *   <RealtimeScheduleView />
 * </FeatureGate>
 * 
 * // Show loading skeleton
 * <FeatureGate 
 *   feature="analyticsV2"
 *   loading={<DashboardSkeleton />}
 *   fallback={<LegacyDashboard />}
 * >
 *   <AnalyticsV2Dashboard />
 * </FeatureGate>
 * 
 * // Inverse: show legacy UI when feature is disabled
 * <FeatureGate feature="betaFeatures" inverse>
 *   <BetaWarningBanner />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
  loading: loadingComponent = null,
  error: errorComponent,
  inverse = false,
}: FeatureGateProps): ReactNode {
  const { enabled, loading, error } = useFeatureFlag(feature);

  // Show loading state
  if (loading) {
    return loadingComponent;
  }

  // Show error state
  if (error) {
    return errorComponent ?? fallback;
  }

  // Normal: show children if enabled, fallback if disabled
  // Inverse: show children if disabled, fallback if enabled
  const shouldShowChildren = inverse ? !enabled : enabled;
  
  return shouldShowChildren ? children : fallback;
}

/**
 * Props for FeatureToggle component
 */
export interface FeatureToggleProps {
  /** Feature flag to check */
  feature: FeatureFlag;
  
  /** Content to render when feature is enabled */
  on: ReactNode;
  
  /** Content to render when feature is disabled */
  off: ReactNode;
  
  /** Content to render while loading (default: off content) */
  loading?: ReactNode;
}

/**
 * Component that renders different content based on feature flag state
 * 
 * More explicit than FeatureGate - always shows either 'on' or 'off' content.
 * Useful for A/B testing scenarios.
 * 
 * @example
 * ```typescript
 * <FeatureToggle
 *   feature="exportV2"
 *   on={<NewExportButton />}
 *   off={<LegacyExportButton />}
 * />
 * 
 * // With loading state
 * <FeatureToggle
 *   feature="newScheduleUI"
 *   on={<ModernScheduleView />}
 *   off={<ClassicScheduleView />}
 *   loading={<ScheduleSkeleton />}
 * />
 * ```
 */
export function FeatureToggle({
  feature,
  on,
  off,
  loading: loadingComponent,
}: FeatureToggleProps): ReactNode {
  const { enabled, loading } = useFeatureFlag(feature);

  if (loading) {
    return loadingComponent ?? off;
  }

  return enabled ? on : off;
}

/**
 * HOC that wraps a component with feature flag checking
 * 
 * @param feature - Feature flag to check
 * @param fallbackComponent - Component to render if feature is disabled
 * @returns Higher-order component
 * 
 * @example
 * ```typescript
 * const AnalyticsDashboard = withFeatureFlag(
 *   'analyticsV2',
 *   LegacyDashboard
 * )(AnalyticsV2Component);
 * ```
 */
export function withFeatureFlag<P extends object>(
  feature: FeatureFlag,
  FallbackComponent?: React.ComponentType<P>
) {
  return function (Component: React.ComponentType<P>) {
    return function FeatureFlaggedComponent(props: P) {
      const { enabled, loading } = useFeatureFlag(feature);

      if (loading) {
        return FallbackComponent ? <FallbackComponent {...props} /> : null;
      }

      if (!enabled) {
        return FallbackComponent ? <FallbackComponent {...props} /> : null;
      }

      return <Component {...props} />;
    };
  };
}
