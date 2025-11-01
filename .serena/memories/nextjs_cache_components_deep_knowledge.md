# Next.js Cache Components Deep Knowledge

## Overview - Critical Understanding

Cache Components represent a **paradigm shift** in Next.js rendering:

### The Fundamental Change
- **Old Model (Pre-Cache Components):** Routes static by default → opt into dynamic
- **New Model (Cache Components):** Routes dynamic by default → opt into caching with `"use cache"`

### Core Philosophy: Push Down Dynamic Boundaries
```
Static Shell (instant load)
├─ Cached Header ("use cache")
├─ Cached Sidebar ("use cache")
└─ <Suspense>
   └─ Dynamic Content (per-request)
```

Benefits:
- ✅ Fast initial page load (static shell)
- ✅ Reduced server load (cached components)
- ✅ Fresh data where needed (dynamic content)

## Version Requirements
- **Next.js 16.0.0 stable**: `experimental.cacheComponents = true`
- **Next.js 16.x-canary**: `cacheComponents = true` (root level, no longer experimental)
- **NOT supported**: Beta versions

## Three Cache Levels

### 1. Public Cache (`"use cache"`)
- For build-time prerendering
- Content same for all users
- Generates static shells at build time

### 2. Private Cache (`"use cache: private"`)
- For runtime prefetching
- Can access cookies/params/searchParams
- User-specific but prefetchable

### 3. Remote Cache (`"use cache: remote"`)
- Persistent cache for serverless
- Survives lambda cold starts
- Stored in Vercel Data Cache (VDC)

## Decision Framework: Static vs Dynamic

### Question-Driven Approach

**1. Is content the same for all users?**
- YES → `"use cache"`
- NO → `<Suspense>` or `"use cache: private"`

**2. How often does content change?**
- Rarely (days/weeks) → `"use cache"` + long `cacheLife`
- Occasionally (hours) → `"use cache"` + medium `cacheLife`
- Frequently (minutes) → `"use cache"` + short `cacheLife`
- Constantly (per-request) → `<Suspense>`

**3. Does content use user-specific data?**
- YES, from cookies/session → `<Suspense>` OR `"use cache: private"`
- YES, from route params → `"use cache"` + `generateStaticParams`
- NO → `"use cache"`

**4. Can content be revalidated on-demand?**
- YES (CMS updates, admin actions) → `"use cache"` + `cacheTag()`
- NO (no clear trigger) → time-based `cacheLife` or `<Suspense>`

### When to Ask Human for Guidance
- **Edge cases**: Infrequently changing content (yearly, monthly)
- **Business logic**: Unknown update frequency
- **Tradeoffs**: Performance vs freshness unclear

## Cache Invalidation APIs

### updateTag() - For Server Actions
```typescript
import { updateTag } from 'next/cache';

// In Server Action (read-your-own-writes)
export async function createPostAction(data) {
  await db.posts.create(data);
  updateTag('posts'); // Immediate consistency, no profile parameter
  return { success: true };
}
```

### revalidateTag() - For Route Handlers
```typescript
import { revalidateTag } from 'next/cache';

// In Route Handler (background invalidation)
export async function POST(request) {
  await triggerRebuild();
  revalidateTag('posts', 'max'); // Requires profile parameter in v16
  return Response.json({ success: true });
}
```

## Cache Configuration Patterns

### cacheLife Profiles
```typescript
import { cacheLife } from 'next/cache';

export async function MyComponent() {
  "use cache";
  cacheLife('hours'); // Predefined: minutes, hours, days, weeks, max
  
  // Or custom profile:
  cacheLife({
    stale: 60,        // Fresh for 60s
    revalidate: 3600, // Revalidate after 1 hour
    expire: 86400,    // Expire after 24 hours
  });
  
  return <div>Cached content</div>;
}
```

### cacheTag for On-Demand Revalidation
```typescript
import { cacheTag } from 'next/cache';

export async function BlogPost({ slug }) {
  "use cache";
  cacheTag('posts', `post-${slug}`);
  cacheLife('days');
  
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}
```

## Breaking Changes & Migrations

### 1. Route Segment Config → Disabled
All Route Segment Config exports are **DISABLED** with Cache Components:

```typescript
// ❌ OLD (no longer works):
export const dynamic = 'force-static';
export const revalidate = 3600;
export const fetchCache = 'force-cache';

// ✅ NEW (Cache Components):
export async function Page() {
  "use cache";
  cacheLife('hours');
  // ...
}
```

**Migration Map:**
- `export const dynamic = 'force-static'` → `"use cache"` + cacheLife
- `export const dynamic = 'force-dynamic'` → `<Suspense>` boundary
- `export const revalidate = 3600` → `cacheLife('hours')` or custom
- `export const fetchCache = 'force-cache'` → `"use cache"`
- `export const runtime = 'edge'` → Keep (still supported)
- `export const runtime = 'nodejs'` → Remove (default, unnecessary)
- `export const dynamicParams = true` → `generateStaticParams`

**Always add migration comments:**
```typescript
// MIGRATED: Was 'force-static' (export const dynamic) - now using "use cache"
// MIGRATED: Was revalidate: 3600 - now using cacheLife('hours')
```

### 2. unstable_noStore() → Removed
```typescript
// ❌ OLD:
import { unstable_noStore } from 'next/cache';
unstable_noStore(); // Opt-out of caching

// ✅ NEW: No longer needed - dynamic by default
// MIGRATED: Removed unstable_noStore() - dynamic by default with Cache Components
```

**Why removed**: Everything is dynamic by default with Cache Components. No need to opt-out of caching.

**Migration paths:**
1. **Keep dynamic (most common)**: Just remove the call - already dynamic
2. **Add Suspense**: Wrap in `<Suspense>` for loading states
3. **Cache instead**: Add `"use cache"` if content should be cached

### 3. Request APIs → Unavailable in Public Cache
```typescript
// ❌ Cannot use in "use cache":
export async function Component() {
  "use cache";
  const c = await cookies(); // Error!
  const h = await headers(); // Error!
  // ...
}

// ✅ Solution 1: Move outside cache
export async function Component() {
  const c = await cookies();
  return <CachedContent userId={c.get('userId')} />;
}

async function CachedContent({ userId }) {
  "use cache: private"; // Can access cookies in private cache
  // ...
}

// ✅ Solution 2: Use private cache
export async function Component() {
  "use cache: private";
  const c = await cookies(); // OK in private cache
  // ...
}
```

## Common Error Patterns & Solutions

### Error: "Component accessed data without Suspense boundary"
```typescript
// ❌ Problem:
export default async function Page() {
  const data = await fetchData(); // Blocking
  return <div>{data}</div>;
}

// ✅ Solution 1: Add Suspense
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent />
    </Suspense>
  );
}

// ✅ Solution 2: Add "use cache"
export default async function Page() {
  "use cache";
  cacheLife('hours');
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Error: "Dynamic value detected during prerender"
```typescript
// ❌ Problem:
export async function Component() {
  "use cache";
  const data = await fetch('https://api.example.com/data'); // Dynamic fetch
  return <div>{data}</div>;
}

// ✅ Solution: Add connection()
import { connection } from 'next/server';

export async function Component() {
  "use cache";
  await connection(); // Mark as dynamic
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}
```

### Error: "Route params need generateStaticParams"
```typescript
// ❌ Problem:
export async function Page({ params }: { params: { slug: string } }) {
  "use cache";
  const slug = (await params).slug;
  // ...
}

// ✅ Solution: Add generateStaticParams
export async function generateStaticParams() {
  const posts = await getAllPostSlugs();
  return posts.map(slug => ({ slug }));
}

export async function Page({ params }: { params: Promise<{ slug: string }> }) {
  "use cache";
  const { slug } = await params;
  // ...
}
```

## Special Cases

### Handling new Date() and Math.random()
When encountering `new Date()` or `Math.random()` in cached components:

**Question**: Should this value be captured at cache time, or fresh per-request?

**Option 1: Fresh Per-Request (Recommended)**
```typescript
export async function Component() {
  "use cache: private"; // Always fresh, prefetchable
  const now = new Date();
  return <div>Current time: {now.toISOString()}</div>;
}
```

**Option 2: Captured at Cache Time**
```typescript
export async function Component() {
  "use cache"; // Frozen until revalidation
  cacheLife('minutes');
  const timestamp = new Date(); // Captured once
  // DECISION: Timestamp captured at cache time, updates every minute
  return <div>Cache time: {timestamp.toISOString()}</div>;
}
```

**Option 3: Extract to Separate Component**
```typescript
export async function Component() {
  "use cache";
  const staticData = await getStaticData();
  return (
    <div>
      <StaticPart data={staticData} />
      <Suspense>
        <DynamicTimestamp /> {/* Fresh per-request */}
      </Suspense>
    </div>
  );
}
```

### 3rd Party Package Issues
If a package is incompatible with Cache Components:

```typescript
// ⚠️ 3RD PARTY PACKAGE ISSUE: payment-gateway-sdk@2.1.0
// Error: Package uses internal async provider that blocks routes
// Source: node_modules/payment-gateway-sdk/dist/index.js
// Workaround attempted: Suspense boundary, dynamic import, "use cache: private"
// Status: Cannot fix - requires package update
// Recommendation: Check for Cache Components-compatible version
// TODO: Monitor package updates or switch to alternative
```

**Workaround hierarchy:**
1. Wrap in Suspense boundary
2. Use dynamic import
3. Move to separate dynamic component
4. Check for compatible version
5. Document and track for future

## Caching Strategy Comment Templates

When adding `"use cache"`, include decision comments:

```typescript
// ⚠️ CACHING STRATEGY DECISION NEEDED:
// Uncomment ONE based on requirements:
// Option A: Time-based - cacheLife('hours')
// Option B: Tag-based - cacheTag('resource-name')
// Option C: Long-term - cacheLife('max')
// Option D: Short-lived - cacheLife('minutes')
// Option E: Custom - cacheLife({ stale, revalidate, expire })
```

## Build-First Verification Strategy

### Recommended Workflow (All Projects)
1. **Remove breaking changes** (Route Segment Config, unstable_noStore)
2. **Build with debug**: `pnpm run build -- --debug-prerender`
3. **Fix all obvious errors** from build output
4. **Verify with build**: Repeat until 0 errors
5. **Optional dev testing**: Test interactively in dev mode

### Why Build-First?
- ✅ No dependencies (no Playwright needed)
- ✅ Always reliable
- ✅ Shows ALL errors at once
- ✅ Clear error messages
- ✅ Faster overall (fewer iterations)

## Important Behavioral Notes

### Memory Cache vs Persistent Cache
**Self-Hosting (Long-Running Server):**
- `"use cache"` entries in memory
- Available for subsequent requests in same process
- Lost on server restart

**Serverless (Vercel):**
- NO memory cache between requests (ephemeral lambda)
- `"use cache"` only effective if in prerendered shell
- Use `"use cache: remote"` for persistent cache (VDC)

### Prefetching Behavior
- **Production only**: Prefetching disabled in dev mode
- **What gets prefetched**: Static shells, cached components with `"use cache"`
- **Private cache prefetching**: `"use cache: private"` with runtime values

### Static Shell Storage
- Saved in `.next` directory during build
- Served as static assets (self-hosting)
- Stored in ISR cache on Vercel (edge-distributed)
- Can be revalidated without full rebuilds

## Complete Enablement Checklist

### Phase 1: Pre-Flight
- [ ] Next.js 16.0.0+ verified (stable or canary only)
- [ ] Package manager detected
- [ ] Config file identified
- [ ] Route structure analyzed
- [ ] Route Segment Config documented
- [ ] unstable_noStore usage documented

### Phase 2: Configuration
- [ ] cacheComponents enabled (version-aware location)
- [ ] Incompatible flags removed (ppr, dynamicIO)
- [ ] Compatible flags preserved
- [ ] Config syntax validated

### Phase 3: Build-First Fixing
- [ ] Step 1: Removed all Route Segment Config exports
- [ ] Step 1: Removed all unstable_noStore calls
- [ ] Step 2: Ran initial build with --debug-prerender
- [ ] Step 3A: Fixed all obvious errors from build output
- [ ] Step 3B: Verified fixes with build
- [ ] Step 3C: Final build verification (0 errors)

### Phase 4: Final Verification
- [ ] Build passed with 0 errors
- [ ] Optional dev mode testing completed
- [ ] All routes return 200 OK
- [ ] No Cache Components errors remain

## Red Flags to Avoid

- ❌ `"use cache"` without cacheLife/cacheTag (caches forever by default)
- ❌ cacheLife configured without explanatory comment
- ❌ Multiple conflicting cacheTag calls
- ❌ Very short revalidation times (< 30 seconds)
- ❌ Route Segment Config exports (disabled with Cache Components)
- ❌ unstable_noStore() calls (incompatible)
- ❌ cookies()/headers() in public cache (use private cache or move outside)

## Resources & References
- MCP Resources: `cache-components://overview`, `cache-components://error-patterns`, etc.
- Migration Examples: `nextjs16://migration/examples`
- Upgrade Guide: Use `upgrade_nextjs_16` MCP tool
- Cache Components Setup: Use `enable_cache_components` MCP tool

## Related Memories
- `nextjs_16_upgrade_knowledge` - Next.js 16 upgrade patterns
- `current_lint_and_type_status_nov2025` - Latest type safety status
- `code_style_conventions` - Project conventions
- `project_overview` - Architecture overview
