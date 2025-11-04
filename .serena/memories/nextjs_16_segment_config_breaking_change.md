# Next.js 16 Segment Config Breaking Change

## Critical Discovery (November 4, 2025)

**Issue**: Next.js 16.0.1 build fails with cryptic error: "Invalid segment configuration export detected" during page data collection phase, with NO details shown in logs.

## Root Cause

**Next.js 16 Breaking Change**: You **CANNOT** export route segment configs (`dynamic`, `runtime`, `revalidate`, `fetchCache`, etc.) in files that use async `params` or `searchParams`.

### Why This Happens

In Next.js 16, when a layout/page has async params/searchParams, the component is **already dynamic by default**. Explicitly exporting segment configs creates a conflict that Next.js detects during the "Collecting page data" phase.

## Affected Files in This Project

### Files Fixed (3 total)

1. **`src/app/dashboard/[semesterAndyear]/layout.tsx`**
   - **Had**: `export const dynamic = "force-dynamic"`
   - **Has async**: `params: Promise<{ semesterAndyear: string }>`
   - **Fix**: Removed export, added comment explaining why

2. **`src/app/schedule/[semesterAndyear]/layout.tsx`**
   - **Had**: `export const dynamic = "force-dynamic"`
   - **Has async**: `params: Promise<{ semesterAndyear: string }>`
   - **Fix**: Removed export, added comment explaining why

3. **`src/app/(public)/page.tsx`**
   - **Had**: `export const revalidate = 60 * 60 * 24 * 30`
   - **Has async**: `searchParams: Promise<{ tab?: string, page?: string, ... }>`
   - **Fix**: Removed export, explained alternative (use `fetch()` with `next: { revalidate }`)

### Files That Are OK

API routes can still export segment configs because they don't have params/searchParams:
- `src/app/api/sentry-example-api/route.ts` - `export const dynamic = "force-dynamic"` ✅
- `src/app/api/feature-flags/route.ts` - `export const runtime = 'edge'` ✅
- `src/app/api/feature-flags/batch/route.ts` - `export const runtime = 'edge'` ✅
- `src/app/api/admin/seed-semesters/route.ts` - `export const runtime = "nodejs"` ✅

## The Fix Pattern

### ❌ Before (Causes Build Failure)
```typescript
import { ReactNode } from "react";

export const dynamic = "force-dynamic"; // ERROR in Next.js 16!

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>; // Async params
}) {
  const { slug } = await params;
  // ...
}
```

### ✅ After (Works)
```typescript
import { ReactNode } from "react";

// NOTE: Cannot export segment configs (dynamic, runtime, etc.) in Next.js 16
// when using async params. The layout is already dynamic due to async params.

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>; // Async params
}) {
  const { slug } = await params;
  // ...
}
```

## Error Signature

**Build Output**:
```
✓ Compiled successfully in 36s
  Skipping validation of types
  Collecting page data ...
⨯ Invalid segment configuration export detected. This can cause unexpected 
behavior from the configs not being applied. You should see the relevant 
failures in the logs above. Please fix them to continue.
ELIFECYCLE Command failed with exit code 1.
```

**Key Indicators**:
1. Build compiles successfully ✅
2. Fails at "Collecting page data" step ❌
3. Error message claims "relevant failures in the logs above" but shows NONE 🐛
4. Affects both local builds and Vercel deployments

## Alternative Solutions

### For Dynamic Behavior
If you need to force dynamic rendering, just use async params - it's already dynamic!

### For Revalidation
Instead of:
```typescript
export const revalidate = 3600;

export default async function Page({ searchParams }: { searchParams: Promise<...> }) {
  const data = await fetch('...');
  // ...
}
```

Use fetch-level revalidation:
```typescript
export default async function Page({ searchParams }: { searchParams: Promise<...> }) {
  const data = await fetch('...', {
    next: { revalidate: 3600 }
  });
  // ...
}
```

### For Runtime Selection
For API routes without params, you can still export:
```typescript
export const runtime = 'edge'; // OK in route handlers
export const dynamic = 'force-dynamic'; // OK in route handlers
```

## Impact on This Project

**Before Fix**:
- ❌ Build failed on Vercel (all 20 recent deployments ERROR state)
- ❌ Local builds failed at page data collection
- ❌ Production deployment blocked

**After Fix**:
- ✅ Build succeeds in 35-36s
- ✅ All 403 tests passing
- ✅ Production deployment unblocked
- ✅ No functional changes (layouts already were dynamic)

## Why This Is Confusing

1. **No Error Details**: Next.js says "see relevant failures above" but shows nothing
2. **Not in Upgrade Guide**: Official Next.js 16 upgrade guide doesn't mention this clearly
3. **Compiler Accepts It**: TypeScript and Next.js compiler both accept the syntax
4. **Runtime Detection Only**: Error only appears during build's page data collection phase

## Related Next.js 16 Changes

- Async params/searchParams are mandatory (can't be sync)
- Components with async props are automatically dynamic
- Segment configs on dynamic components create conflicts
- API routes are unaffected (different execution model)

## Prevention

**Rule of Thumb for Next.js 16**:
```
IF file has async params/searchParams
THEN do NOT export segment configs (dynamic, runtime, revalidate, etc.)
ELSE you CAN export segment configs
```

## Verification

After fix, verify with:
```bash
pnpm build  # Should complete successfully
pnpm test   # All tests should pass
```

## References

- GitHub Issue #59: MUI Box TypeScript limitation (separate issue)
- Vercel deployment history: 20 consecutive ERROR states before fix
- Next.js 16.0.1 stable - documented via experience, not official docs
- Fixed: November 4, 2025

## Related Memories

- `nextjs_16_upgrade_knowledge` - General Next.js 16 migration guide
- `current_lint_and_type_status_nov2025` - TypeScript error tracking
