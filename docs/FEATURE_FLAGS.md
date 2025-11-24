# Feature Flags with Vercel Edge Config

Complete guide for implementing feature flags using Vercel Edge Config for ultra-fast reads (<1ms latency).

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Setup](#setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

```typescript
// 1. Check feature in Server Component
import { isFeatureEnabled } from '@/lib/feature-flags';
import { auth } from '@/lib/auth';

const session = await auth();
const enabled = await isFeatureEnabled(
  'newScheduleUI',
  session?.user?.id,
  session?.user?.role,
  session?.user?.email
);

// 2. Use in Client Component
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function MyComponent() {
  const { enabled, loading } = useFeatureFlag('analyticsV2');
  return loading ? <Loading /> : enabled ? <NewUI /> : <OldUI />;
}

// 3. Use with Component
import { FeatureGate } from '@/components/feature-gate';

<FeatureGate feature="exportV2" fallback={<LegacyExport />}>
  <NewExport />
</FeatureGate>
```

## 🔧 Setup

### 1. Install Package

Already installed: `@vercel/edge-config@1.4.3`

### 2. Create Edge Config Store

**Via Vercel Dashboard:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project
2. Navigate to **Storage** → **Create Database**
3. Select **Edge Config**
4. Name it: `feature-flags` (or any name you prefer)
5. Click **Create**

**Via Vercel CLI:**

```bash
vercel env pull .env  # Get EDGE_CONFIG automatically
```

### 3. Configure Environment Variable

The `EDGE_CONFIG` environment variable is automatically injected by Vercel when you create an Edge Config store. No manual configuration needed in production.

**For local development:**

```bash
# .env.local
EDGE_CONFIG=https://edge-config.vercel.com/xxxxx?token=yyyyy
```

Get this from: **Vercel Dashboard** → **Storage** → **Edge Config** → **Connection String**

## ⚙️ Configuration

### Initial Feature Flags

Add these to your Edge Config store via the Vercel Dashboard:

```json
{
  "newScheduleUI": {
    "enabled": false,
    "rolloutPercent": 10,
    "allowedRoles": ["admin"],
    "description": "Gradual rollout of rebuilt schedule page"
  },
  "realTimeCollab": {
    "enabled": false,
    "allowedRoles": ["admin"],
    "description": "Enable WebSocket features (Issue #34)"
  },
  "analyticsV2": {
    "enabled": true,
    "allowedRoles": ["admin"],
    "description": "Dashboard improvements"
  },
  "exportV2": {
    "enabled": false,
    "description": "New export engine"
  },
  "betaFeatures": {
    "enabled": true,
    "allowedEmails": ["dev@example.com", "admin@school.ac.th"],
    "description": "General beta access control"
  },
  "advancedFilters": {
    "enabled": true,
    "rolloutPercent": 50,
    "description": "Advanced schedule filtering (A/B test)"
  },
  "notifications": {
    "enabled": false,
    "allowedRoles": ["admin", "teacher"],
    "description": "Email/SMS notifications"
  }
}
```

### Configuration Schema

```typescript
interface FlagConfig {
  // Master switch - if false, feature is disabled for everyone
  enabled: boolean;

  // Rollout percentage (0-100)
  // Uses consistent hashing on userId
  rolloutPercent?: number;

  // Role-based access control
  // Only these roles can access the feature
  allowedRoles?: string[]; // e.g., ['admin', 'teacher']

  // Email allowlist
  // Only these emails can access the feature
  allowedEmails?: string[]; // e.g., ['user@example.com']

  // Human-readable description (optional)
  description?: string;
}
```

### Evaluation Logic

Checks are performed in this order:

1. **Master Switch**: If `enabled: false`, returns `false` immediately
2. **Role Check**: If `allowedRoles` is set and user role not in list, returns `false`
3. **Email Check**: If `allowedEmails` is set and user email not in list, returns `false`
4. **Rollout Percent**: If `rolloutPercent` is set, uses consistent hash of `userId`
5. **Default**: Returns `true`

## 📖 Usage

### Server Components (Next.js App Router)

```typescript
import { isFeatureEnabled } from '@/lib/feature-flags';
import { auth } from '@/lib/auth';

export default async function SchedulePage() {
  const session = await auth();

  const useNewUI = await isFeatureEnabled(
    'newScheduleUI',
    session?.user?.id,
    session?.user?.role,
    session?.user?.email
  );

  return useNewUI ? <NewScheduleUI /> : <LegacyScheduleUI />;
}
```

### Client Components (React Hooks)

#### Single Flag

```typescript
'use client';

import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function ExportButton() {
  const { enabled, loading } = useFeatureFlag('exportV2');

  if (loading) return <ButtonSkeleton />;

  return enabled ? (
    <NewExportButton />
  ) : (
    <LegacyExportButton />
  );
}
```

#### Multiple Flags

```typescript
'use client';

import { useFeatureFlags } from '@/hooks/useFeatureFlag';

function AdminPanel() {
  const flags = useFeatureFlags(['analyticsV2', 'exportV2', 'notifications']);

  return (
    <div>
      {flags.get('analyticsV2')?.enabled && <AnalyticsSection />}
      {flags.get('exportV2')?.enabled && <ExportV2Section />}
      {flags.get('notifications')?.enabled && <NotificationSettings />}
    </div>
  );
}
```

### Feature Gate Component

#### Basic Usage

```typescript
import { FeatureGate } from '@/components/feature-gate';

<FeatureGate feature="realTimeCollab">
  <RealtimeScheduleView />
</FeatureGate>
```

#### With Fallback

```typescript
<FeatureGate
  feature="exportV2"
  fallback={<LegacyExport />}
>
  <NewExport />
</FeatureGate>
```

#### With Loading State

```typescript
<FeatureGate
  feature="analyticsV2"
  loading={<DashboardSkeleton />}
  fallback={<LegacyDashboard />}
>
  <AnalyticsV2Dashboard />
</FeatureGate>
```

#### Inverse Logic

```typescript
{/* Show banner when feature is OFF */}
<FeatureGate feature="betaFeatures" inverse>
  <div>Beta features are currently disabled</div>
</FeatureGate>
```

### Feature Toggle Component

```typescript
import { FeatureToggle } from '@/components/feature-gate';

<FeatureToggle
  feature="newScheduleUI"
  on={<ModernScheduleView />}
  off={<ClassicScheduleView />}
  loading={<ScheduleSkeleton />}
/>
```

### Higher-Order Component

```typescript
import { withFeatureFlag } from '@/components/feature-gate';
import { LegacyDashboard } from './legacy';
import { AnalyticsV2 } from './analytics-v2';

// Automatically switch between old/new based on flag
const AnalyticsDashboard = withFeatureFlag(
  'analyticsV2',
  LegacyDashboard
)(AnalyticsV2);

// Use as normal component
export default function DashboardPage() {
  return <AnalyticsDashboard />;
}
```

## 🔌 API Reference

### Server Functions

#### `isFeatureEnabled()`

```typescript
async function isFeatureEnabled(
  flag: FeatureFlag,
  userId?: string,
  userRole?: string,
  userEmail?: string,
): Promise<boolean>;
```

#### `getAllFeatureFlags()`

```typescript
async function getAllFeatureFlags(): Promise<Record<string, FlagConfig> | null>;
```

#### `hasFeatureFlag()`

```typescript
async function hasFeatureFlag(flag: FeatureFlag): Promise<boolean>;
```

#### `getFeatureFlagConfig()`

```typescript
async function getFeatureFlagConfig(
  flag: FeatureFlag,
): Promise<FlagConfig | null>;
```

### React Hooks

#### `useFeatureFlag()`

```typescript
function useFeatureFlag(
  flag: FeatureFlag,
  options?: { fallbackEnabled?: boolean },
): {
  enabled: boolean;
  loading: boolean;
  error: Error | null;
  revalidate: () => void;
};
```

#### `useFeatureFlags()`

```typescript
function useFeatureFlags(
  flags: FeatureFlag[],
): Map<FeatureFlag, UseFeatureFlagResult>;
```

### API Routes

#### GET `/api/feature-flags`

```
GET /api/feature-flags?flag=newScheduleUI&userId=123&userRole=admin&userEmail=user@example.com

Response: { enabled: boolean }
```

#### GET `/api/feature-flags/batch`

```
GET /api/feature-flags/batch?flags=newScheduleUI,analyticsV2&userId=123&userRole=admin

Response: { flags: { newScheduleUI: true, analyticsV2: false } }
```

## 💡 Examples

### Example 1: Gradual Rollout (10% → 50% → 100%)

```json
// Start: 10% of users
{
  "newScheduleUI": {
    "enabled": true,
    "rolloutPercent": 10
  }
}

// After 1 week: 50% of users
{
  "newScheduleUI": {
    "enabled": true,
    "rolloutPercent": 50
  }
}

// After 2 weeks: 100% of users
{
  "newScheduleUI": {
    "enabled": true
    // Remove rolloutPercent to enable for all
  }
}
```

### Example 2: A/B Testing

```typescript
const useExperimentalAlgorithm = await isFeatureEnabled(
  "advancedFilters",
  userId,
);

const results = useExperimentalAlgorithm
  ? await newFilterAlgorithm(data)
  : await legacyFilterAlgorithm(data);

// Track metrics for both groups
await trackMetric("filter_performance", {
  algorithm: useExperimentalAlgorithm ? "new" : "legacy",
  responseTime: results.elapsed,
});
```

### Example 3: Emergency Kill Switch

```json
// Feature is live in production
{
  "realTimeCollab": {
    "enabled": true
  }
}

// Bug discovered - disable immediately
{
  "realTimeCollab": {
    "enabled": false  // <-- Change in Edge Config takes <1 second
  }
}
```

### Example 4: Role-Based Beta Access

```json
{
  "analyticsV2": {
    "enabled": true,
    "allowedRoles": ["admin"]
  }
}
```

```typescript
// Only admins see new dashboard
const canAccessAnalytics = await isFeatureEnabled(
  "analyticsV2",
  session?.user?.id,
  session?.user?.role, // 'admin', 'teacher', 'student'
);
```

### Example 5: Email Allowlist for Internal Testing

```json
{
  "betaFeatures": {
    "enabled": true,
    "allowedEmails": ["dev@example.com", "qa@example.com", "admin@school.ac.th"]
  }
}
```

## ✅ Best Practices

### 1. Start Small, Scale Gradually

```
10% → Monitor errors → 25% → Monitor → 50% → Monitor → 100%
```

### 2. Use Consistent Hashing for Rollouts

The `rolloutPercent` uses FNV-1a hashing on `userId` to ensure:

- Same user always gets same experience (no flickering)
- Deterministic rollout (user in 10% will stay in 50% and 100%)

### 3. Fail Closed (Secure by Default)

If Edge Config is unavailable:

- Feature flags return `false`
- Application degrades gracefully to stable version

### 4. Clean Up Old Flags

After a feature is fully rolled out (100% for 2+ weeks):

1. Remove feature flag checks from code
2. Delete flag from Edge Config
3. Deploy code without flag logic

### 5. Document Flag Purpose

Always add `description` field to config:

```json
{
  "newScheduleUI": {
    "enabled": true,
    "description": "Gradual rollout of rebuilt schedule page (Issue #31)",
    "rolloutPercent": 50
  }
}
```

### 6. Monitor Flag Usage

```typescript
const enabled = await isFeatureEnabled("newScheduleUI", userId);

// Log for analytics
console.log(`[FeatureFlag] newScheduleUI: ${enabled} for user ${userId}`);
```

### 7. Test Both Paths

Always test both feature-enabled and feature-disabled paths:

```typescript
// __tests__/schedule-page.test.ts
describe("SchedulePage", () => {
  it("renders new UI when feature is enabled", async () => {
    // Mock flag as enabled
    // Test new UI
  });

  it("renders legacy UI when feature is disabled", async () => {
    // Mock flag as disabled
    // Test legacy UI
  });
});
```

## 🐛 Troubleshooting

### Flag Not Updating in Development

1. Check `EDGE_CONFIG` in `.env.local`
2. Restart dev server: `pnpm dev`
3. Clear Edge Config cache (wait 60 seconds or use `consistentRead: true`)

### Flag Always Returns False

1. Verify flag exists in Edge Config dashboard
2. Check `enabled: true` in config
3. Verify user meets role/email/rollout criteria
4. Check browser console for errors

### TypeScript Errors

Make sure to add new flags to the `FeatureFlag` type in `src/lib/feature-flags.ts`:

```typescript
export type FeatureFlag = "newScheduleUI" | "myNewFlag"; // Add new flag here
```

### API Route Returns 500

1. Check Edge Config connection string is valid
2. Verify `@vercel/edge-config` package installed
3. Check Vercel logs for error details

## 📊 Cost

- **Vercel Free Tier**: 10 Edge Config stores, unlimited reads
- **Vercel Pro**: Included, no additional cost
- **Read Latency**: <1ms globally
- **Update Latency**: <1 second (cache TTL: 30-60 seconds)

## 🔗 Related Documentation

- [Vercel Edge Config Docs](https://vercel.com/docs/storage/edge-config)
- [Feature Flags Best Practices](https://vercel.com/docs/workflow-collaboration/feature-flags)
- [GitHub Issue #38](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/38)
- [AGENTS.md - Infrastructure](../../AGENTS.md#13-future-implementation-ideas)

---

**Created**: 2025-01-11  
**Last Updated**: 2025-01-11  
**Maintainer**: Development Team
