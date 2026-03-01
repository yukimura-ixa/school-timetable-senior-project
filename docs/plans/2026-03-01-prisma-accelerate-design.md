# Prisma Accelerate: Caching & Connection Pooling

**Date:** 2026-03-01
**Status:** Approved
**Approach:** A — Fix env + Accelerate with `cacheStrategy`

---

## Problem

The project has Prisma Accelerate configured (packages installed, client code written) but it is **never activated** due to an environment variable name mismatch:

- Vercel env has `PRISMA_DATABASE_URL` with a valid `prisma+postgres://accelerate.prisma-data.net/...` URL
- `src/lib/prisma.ts` reads `ACCELERATE_URL` — which is never set

The public homepage fires ~60+ DB queries per uncached visit (stats, full teacher list, full class list, N+1 chart queries). All data is read-only between admin edits.

## Goals

1. **Enable Prisma Accelerate** in production (fix env var mismatch)
2. **Add query caching** with `cacheStrategy` on all public read queries
3. **Add cache invalidation** on admin write operations
4. **Keep local dev/test working** with direct DB connections (no caching)

## Non-goals

- Refactoring N+1 queries (getRoomOccupancy, getPeriodLoadPerDay) — caching makes this low priority
- Changing the Prisma client singleton structure
- Adding Accelerate to authenticated/admin queries

---

## Design

### 1. Environment Fix

Rename `PRISMA_DATABASE_URL` → `ACCELERATE_URL` in Vercel Project Settings dashboard. No code change for this — the existing `src/lib/prisma.ts` already reads `ACCELERATE_URL` correctly.

### 2. Cache Tiers

Centralized in `src/lib/cache-config.ts`:

```ts
export const CACHE_TIERS = {
  static: { ttl: 600, swr: 120 },  // timeslots, grade lookups, term config
  warm:   { ttl: 120, swr: 60 },   // stats, counts, teacher/class lists
  fresh:  { ttl: 60,  swr: 30 },   // individual schedule grids
} as const;
```

### 3. Environment-Aware Cache Helper

```ts
export function cacheStrategy(tier: keyof typeof CACHE_TIERS, tags?: string[]) {
  if (!isAccelerateEnabled()) return {};
  return { cacheStrategy: { ...CACHE_TIERS[tier], tags } };
}
```

Returns `{}` when Accelerate is not active — safe to spread into any query in any environment.

### 4. Cache Tags

| Tag pattern | Used on |
|---|---|
| `static_data` | Timeslots, grade lookups |
| `term_{configId}` | Current term config |
| `stats` | Homepage quick stats, counts |
| `teachers` | Teacher list, teacher count |
| `classes` | Class list, class count |
| `teacher_{id}` | Individual teacher schedule |
| `class_{gradeId}` | Individual class schedule |

### 5. Query-to-Tier Mapping

| Query | Tier | Tags |
|---|---|---|
| `getCurrentTerm()` | static | `static_data`, `term_{configId}` |
| `timeslot.findMany` (grid) | static | `static_data` |
| `gradelevel.findFirst` (lookup) | static | `static_data` |
| `getQuickStats()` (7 counts) | warm | `stats` |
| `getPeriodLoadPerDay()` | warm | `stats` |
| `getRoomOccupancy()` | warm | `stats` |
| `getPublicTeachers()` | warm | `teachers` |
| `getTeacherCount()` | warm | `teachers` |
| `getTopTeachersByUtilization()` | warm | `teachers` |
| `getPublicClasses()` | warm | `classes` |
| `getClassCount()` | warm | `classes` |
| `getPublicTeacherById()` | fresh | `teachers`, `teacher_{id}` |
| `getTeacherSchedule()` | fresh | `teacher_{id}` |
| `findTeacherResponsibilities()` | fresh | `teacher_{id}` |
| `findByGrade()` (class schedule) | fresh | `class_{gradeId}` |

### 6. Cache Invalidation

Utility in `src/lib/cache-invalidation.ts`:

```ts
export async function invalidatePublicCache(tags: string[]): Promise<void> {
  if (!isAccelerateEnabled()) {
    console.debug("[cache] Accelerate not active, skipping invalidation");
    return;
  }
  try {
    await (prisma as any).$accelerate.invalidate({ tags });
  } catch (err) {
    console.warn("[cache] Invalidation failed:", err);
  }
}
```

Fire-and-forget after successful writes. Non-fatal on failure — TTL is the safety net.

| Admin action | Tags to invalidate |
|---|---|
| Schedule CRUD | `stats`, `teachers`, `classes`, `teacher_{id}`, `class_{gradeId}` |
| Teacher CRUD | `teachers`, `teacher_{id}` |
| Room CRUD | `stats` |
| Subject CRUD | `stats`, `classes` |
| Timeslot/Config changes | `static_data`, `term_{configId}`, `stats` |
| Program CRUD | `classes` |

### 7. Local Development & Testing

| Mode | Config | Behavior |
|---|---|---|
| Default local dev | `DATABASE_URL=postgresql://...` | `cacheStrategy()` returns `{}`, no caching |
| Local with Accelerate | Set `ACCELERATE_URL` in `.env.local` | Full caching active |
| E2E tests (Docker) | `DATABASE_URL=postgresql://localhost:5433/...` | No caching, deterministic |
| CI | Same as E2E | No caching |

Add to `.env.local.example`:
```env
# Optional: Enable Prisma Accelerate caching locally
# ACCELERATE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"
```

---

## Files to Create/Modify

### New files
- `src/lib/cache-config.ts` — cache tiers + `cacheStrategy()` helper + `isAccelerateEnabled()`
- `src/lib/cache-invalidation.ts` — `invalidatePublicCache()` utility
- `__test__/lib/cache-config.test.ts` — unit tests for cache helper
- `__test__/lib/cache-invalidation.test.ts` — unit tests for invalidation

### Modified files
- `src/lib/infrastructure/repositories/public-data.repository.ts` — add `cacheStrategy()` to all public queries
- `src/features/class/infrastructure/repositories/class.repository.ts` — add `cacheStrategy()` to `findByGrade()`
- `src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx` — move direct Prisma calls to repository
- `src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx` — move direct Prisma calls to repository
- Admin server actions (schedule, teacher, room, subject, config, program) — add `invalidatePublicCache()` calls
- `.env.local.example` — add `ACCELERATE_URL` comment

### Vercel dashboard (manual)
- Rename `PRISMA_DATABASE_URL` → `ACCELERATE_URL`

---

## Testing Strategy

| Test | Type | File |
|---|---|---|
| `cacheStrategy()` returns config per env | Unit | `__test__/lib/cache-config.test.ts` |
| `cacheStrategy()` returns `{}` without Accelerate | Unit | Same |
| `invalidatePublicCache()` no-ops without Accelerate | Unit | `__test__/lib/cache-invalidation.test.ts` |
| `invalidatePublicCache()` calls correct tags | Unit | Same |
| Existing tests pass (no behavior change locally) | Existing suite | CI |
| Production cache metrics | Manual | Prisma Data Platform dashboard |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Stale data after admin edit | Invalidation on writes + TTL backstop (60-600s max) |
| Accelerate API key expires | Falls back to direct `pg` adapter, no downtime |
| `cacheStrategy` spread breaks types | Helper returns `{}` which spreads cleanly; TypeScript catches issues |
| Cost (query-based pricing) | School app has low traffic; free tier likely sufficient |

## Rollback

Remove `ACCELERATE_URL` from Vercel env vars. Immediate fallback to direct connection, no code deploy needed.
