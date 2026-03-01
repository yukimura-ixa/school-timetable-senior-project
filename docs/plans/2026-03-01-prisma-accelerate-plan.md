# Prisma Accelerate Caching Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable Prisma Accelerate caching + connection pooling on all public read queries, with tag-based invalidation on admin writes.

**Architecture:** Add environment-aware cache helper (`cacheStrategy()`) that returns Accelerate `cacheStrategy` config in production and `{}` locally. Spread into all public repository queries. Add `invalidatePublicCache()` calls after admin write actions.

**Tech Stack:** Prisma ORM v7, `@prisma/extension-accelerate`, Prisma Postgres, Next.js 16 Server Components, Vitest

---

### Task 1: Create cache config module

**Files:**
- Create: `src/lib/cache-config.ts`

**Step 1: Create the cache config file**

```typescript
// src/lib/cache-config.ts

/**
 * Prisma Accelerate cache tiers.
 *
 * - static: rarely changes (timeslots, grade lookups, term config)
 * - warm: changes on admin edits (stats, counts, lists)
 * - fresh: per-entity detail pages (individual schedules)
 */
export const CACHE_TIERS = {
  static: { ttl: 600, swr: 120 },
  warm: { ttl: 120, swr: 60 },
  fresh: { ttl: 60, swr: 30 },
} as const;

export type CacheTier = keyof typeof CACHE_TIERS;

/**
 * Check whether Prisma Accelerate is active in the current environment.
 */
export function isAccelerateEnabled(): boolean {
  const accelerateUrl = process.env.ACCELERATE_URL;
  if (accelerateUrl) return true;

  const dbUrl = process.env.DATABASE_URL;
  return !!(
    dbUrl &&
    (dbUrl.startsWith("prisma://") || dbUrl.startsWith("prisma+postgres://"))
  );
}

/**
 * Returns a `cacheStrategy` object to spread into Prisma read queries.
 * Returns `{}` when Accelerate is not active (local dev / tests).
 *
 * @example
 * ```ts
 * const teachers = await prisma.teacher.findMany({
 *   where: { ... },
 *   ...cacheStrategy("warm", ["teachers"]),
 * });
 * ```
 */
export function cacheStrategy(
  tier: CacheTier,
  tags?: string[],
): { cacheStrategy?: { ttl: number; swr: number; tags?: string[] } } {
  if (!isAccelerateEnabled()) return {};
  const config = CACHE_TIERS[tier];
  return {
    cacheStrategy: {
      ...config,
      ...(tags && tags.length > 0 ? { tags } : {}),
    },
  };
}
```

**Step 2: Commit**

```bash
git add src/lib/cache-config.ts
git commit -m "feat: add Prisma Accelerate cache config module"
```

---

### Task 2: Create cache invalidation utility

**Files:**
- Create: `src/lib/cache-invalidation.ts`

**Step 1: Create the invalidation utility**

```typescript
// src/lib/cache-invalidation.ts
"use server";

import prisma from "@/lib/prisma";
import { isAccelerateEnabled } from "@/lib/cache-config";

/**
 * Invalidate Prisma Accelerate cache for given tags.
 * No-op when Accelerate is not active (local dev / tests).
 * Non-fatal on failure — TTL is the safety net.
 */
export async function invalidatePublicCache(tags: string[]): Promise<void> {
  if (!isAccelerateEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        "[cache] Accelerate not active, skipping invalidation for:",
        tags,
      );
    }
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).$accelerate.invalidate({ tags });
  } catch (err) {
    console.warn("[cache] Invalidation failed:", err);
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/cache-invalidation.ts
git commit -m "feat: add cache invalidation utility"
```

---

### Task 3: Write unit tests for cache modules

**Files:**
- Create: `__test__/lib/cache-config.test.ts`
- Create: `__test__/lib/cache-invalidation.test.ts`

**Step 1: Write cache-config tests**

```typescript
// __test__/lib/cache-config.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isAccelerateEnabled,
  cacheStrategy,
  CACHE_TIERS,
} from "@/lib/cache-config";

describe("cache-config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isAccelerateEnabled", () => {
    it("returns true when ACCELERATE_URL is set", () => {
      process.env.ACCELERATE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      expect(isAccelerateEnabled()).toBe(true);
    });

    it("returns true when DATABASE_URL starts with prisma://", () => {
      delete process.env.ACCELERATE_URL;
      process.env.DATABASE_URL = "prisma://accelerate.prisma-data.net/?api_key=test";
      expect(isAccelerateEnabled()).toBe(true);
    });

    it("returns true when DATABASE_URL starts with prisma+postgres://", () => {
      delete process.env.ACCELERATE_URL;
      process.env.DATABASE_URL = "prisma+postgres://localhost:51213/?api_key=test";
      expect(isAccelerateEnabled()).toBe(true);
    });

    it("returns false when DATABASE_URL is a direct postgres connection", () => {
      delete process.env.ACCELERATE_URL;
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
      expect(isAccelerateEnabled()).toBe(false);
    });

    it("returns false when no DB URL is set", () => {
      delete process.env.ACCELERATE_URL;
      delete process.env.DATABASE_URL;
      expect(isAccelerateEnabled()).toBe(false);
    });
  });

  describe("cacheStrategy", () => {
    it("returns empty object when Accelerate is disabled", () => {
      delete process.env.ACCELERATE_URL;
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
      expect(cacheStrategy("warm")).toEqual({});
    });

    it("returns cacheStrategy with correct tier values", () => {
      process.env.ACCELERATE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      expect(cacheStrategy("warm")).toEqual({
        cacheStrategy: { ttl: 120, swr: 60 },
      });
    });

    it("includes tags when provided", () => {
      process.env.ACCELERATE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      expect(cacheStrategy("fresh", ["teachers", "teacher_1"])).toEqual({
        cacheStrategy: { ttl: 60, swr: 30, tags: ["teachers", "teacher_1"] },
      });
    });

    it("omits tags key when empty array", () => {
      process.env.ACCELERATE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      const result = cacheStrategy("static", []);
      expect(result).toEqual({
        cacheStrategy: { ttl: 600, swr: 120 },
      });
    });

    it("covers all tiers", () => {
      process.env.ACCELERATE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
      expect(cacheStrategy("static")).toEqual({ cacheStrategy: CACHE_TIERS.static });
      expect(cacheStrategy("warm")).toEqual({ cacheStrategy: CACHE_TIERS.warm });
      expect(cacheStrategy("fresh")).toEqual({ cacheStrategy: CACHE_TIERS.fresh });
    });
  });
});
```

**Step 2: Write cache-invalidation tests**

```typescript
// __test__/lib/cache-invalidation.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock prisma before importing the module
const mockInvalidate = vi.fn();
vi.mock("@/lib/prisma", () => ({
  default: {
    $accelerate: { invalidate: mockInvalidate },
  },
}));

describe("invalidatePublicCache", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockInvalidate.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("calls $accelerate.invalidate with correct tags when Accelerate is active", async () => {
    process.env.ACCELERATE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
    mockInvalidate.mockResolvedValue(undefined);

    const { invalidatePublicCache } = await import("@/lib/cache-invalidation");
    await invalidatePublicCache(["stats", "teachers"]);

    expect(mockInvalidate).toHaveBeenCalledWith({
      tags: ["stats", "teachers"],
    });
  });

  it("is a no-op when Accelerate is not active", async () => {
    delete process.env.ACCELERATE_URL;
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";

    const { invalidatePublicCache } = await import("@/lib/cache-invalidation");
    await invalidatePublicCache(["stats"]);

    expect(mockInvalidate).not.toHaveBeenCalled();
  });

  it("does not throw when invalidation fails", async () => {
    process.env.ACCELERATE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=test";
    mockInvalidate.mockRejectedValue(new Error("Network error"));

    const { invalidatePublicCache } = await import("@/lib/cache-invalidation");
    await expect(invalidatePublicCache(["stats"])).resolves.toBeUndefined();
  });
});
```

**Step 3: Run tests**

```bash
pnpm vitest run __test__/lib/cache-config.test.ts __test__/lib/cache-invalidation.test.ts
```

Expected: All pass.

**Step 4: Commit**

```bash
git add __test__/lib/cache-config.test.ts __test__/lib/cache-invalidation.test.ts
git commit -m "test: add unit tests for cache config and invalidation"
```

---

### Task 4: Add cacheStrategy to public-data repository

**Files:**
- Modify: `src/lib/infrastructure/repositories/public-data.repository.ts`

**Step 1: Add import**

Add at the top of the file:

```typescript
import { cacheStrategy } from "@/lib/cache-config";
```

**Step 2: Add cacheStrategy to each query**

Apply `...cacheStrategy(tier, tags)` to every Prisma read call in the repository. Specific changes:

- `getCurrentTerm()` → `prisma.table_config.findFirst({ ..., ...cacheStrategy("static", ["static_data"]) })`
- `findPublicTeachers()` → `prisma.teacher.findMany({ ..., ...cacheStrategy("warm", ["teachers"]) })`
- `countTeachers()` → `prisma.teacher.count({ ...cacheStrategy("warm", ["teachers"]) })`
- `findPublicTeacherById()` → `prisma.teacher.findUnique({ ..., ...cacheStrategy("fresh", ["teachers", \`teacher_${teacherId}\`]) })`
- `findTeacherResponsibilities()` → `prisma.teachers_responsibility.findMany({ ..., ...cacheStrategy("fresh", [\`teacher_${teacherId}\`]) })`
- `findClassSchedule()` → `prisma.class_schedule.findMany({ ..., ...cacheStrategy("fresh", [\`class_${gradeId}\`]) })`
- `getQuickStats()` — each count in the `Promise.all` gets `...cacheStrategy("warm", ["stats"])`
- `getPeriodLoad()` — each `class_schedule.count` gets `...cacheStrategy("warm", ["stats"])`
- `getRoomOccupancy()` — `room.count` + `timeslot.findMany` + each `class_schedule.count` gets `...cacheStrategy("warm", ["stats"])`
- `findPublicGradeLevels()` → `prisma.gradelevel.findMany({ ..., ...cacheStrategy("warm", ["classes"]) })`
- `countGradeLevels()` → `prisma.gradelevel.count({ ...cacheStrategy("warm", ["classes"]) })`

**Step 3: Verify no type errors**

```bash
pnpm tsc --noEmit --project tsconfig.typecheck.json
```

Expected: No new errors.

**Step 4: Commit**

```bash
git add src/lib/infrastructure/repositories/public-data.repository.ts
git commit -m "feat: add Accelerate cacheStrategy to public data repository"
```

---

### Task 5: Add cacheStrategy to class repository (findByGrade)

**Files:**
- Modify: `src/features/class/infrastructure/repositories/class.repository.ts`

**Step 1: Add import**

```typescript
import { cacheStrategy } from "@/lib/cache-config";
```

**Step 2: Add cacheStrategy to findByGrade**

```typescript
export async function findByGrade(
  gradeId: string,
  academicYear: number,
  sem: semester,
): Promise<ClassScheduleWithRelations[]> {
  return prisma.class_schedule.findMany({
    where: {
      timeslot: { AcademicYear: academicYear, Semester: sem },
      GradeID: gradeId,
    },
    include: {
      teachers_responsibility: { include: { teacher: true } },
      subject: true,
      gradelevel: true,
      timeslot: true,
      room: true,
    },
    ...cacheStrategy("fresh", [`class_${gradeId}`]),
  });
}
```

**Step 3: Commit**

```bash
git add src/features/class/infrastructure/repositories/class.repository.ts
git commit -m "feat: add cacheStrategy to class repository findByGrade"
```

---

### Task 6: Move direct Prisma calls from public pages to repositories

**Files:**
- Modify: `src/lib/infrastructure/repositories/public-data.repository.ts` — add `findTimeslotsByTerm` and `findGradeById`
- Modify: `src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx` — use repository
- Modify: `src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx` — use repository

**Step 1: Add two methods to public-data repository**

```typescript
// In publicDataRepository object:

findTimeslotsByTerm: async (academicYear: number, semesterValue: semester) => {
  return prisma.timeslot.findMany({
    where: { AcademicYear: academicYear, Semester: semesterValue },
    orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
    ...cacheStrategy("static", ["static_data"]),
  });
},

findGradeById: async (gradeId: string) => {
  return prisma.gradelevel.findFirst({
    where: { GradeID: gradeId },
    ...cacheStrategy("static", ["static_data"]),
  });
},
```

**Step 2: Update teacher schedule page**

Replace `import prisma from "@/lib/prisma"` and the direct `prisma.timeslot.findMany(...)` call with:

```typescript
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
// ...
const timeslots = await publicDataRepository.findTimeslotsByTerm(academicYear, semesterValue);
```

**Step 3: Update class schedule page**

Replace direct `prisma.gradelevel.findFirst(...)` and `prisma.timeslot.findMany(...)` calls with:

```typescript
import { publicDataRepository } from "@/lib/infrastructure/repositories/public-data.repository";
// ...
const gradeLevel = await publicDataRepository.findGradeById(gradeId);
const timeslots = await publicDataRepository.findTimeslotsByTerm(academicYear, semesterValue);
```

Remove the `import prisma from "@/lib/prisma"` if no other direct calls remain.

**Step 4: Verify**

```bash
pnpm tsc --noEmit --project tsconfig.typecheck.json
```

**Step 5: Commit**

```bash
git add src/lib/infrastructure/repositories/public-data.repository.ts \
  "src/app/(public)/teachers/[id]/[academicYear]/[semester]/page.tsx" \
  "src/app/(public)/classes/[gradeId]/[academicYear]/[semester]/page.tsx"
git commit -m "refactor: move direct prisma calls to public-data repository with caching"
```

---

### Task 7: Add cache invalidation to admin write actions

**Files:**
- Modify: `src/features/schedule-arrangement/application/actions/schedule-arrangement.actions.ts`
- Modify: `src/features/arrange/application/actions/arrange.actions.ts`
- Modify: `src/features/arrange/application/actions/auto-arrange.action.ts`
- Modify: `src/features/teacher/application/actions/teacher.actions.ts`
- Modify: `src/features/teaching-assignment/application/actions/teaching-assignment.actions.ts`
- Modify: `src/features/room/application/actions/room.actions.ts`
- Modify: `src/features/subject/application/actions/subject.actions.ts`
- Modify: `src/features/config/application/actions/config.actions.ts`
- Modify: `src/features/config/application/actions/config-lifecycle.actions.ts`
- Modify: `src/features/semester/application/actions/semester.actions.ts`
- Modify: `src/features/program/application/actions/program.actions.ts`
- Modify: `src/features/assign/application/actions/assign.actions.ts`
- Modify: `src/features/class/application/actions/class.actions.ts`
- Modify: `src/features/lock/application/actions/lock.actions.ts`
- Modify: `src/features/gradelevel/application/actions/gradelevel.actions.ts`
- Modify: `src/features/timeslot/application/actions/timeslot.actions.ts`

**Pattern:** Add `invalidatePublicCache()` call after the `handler` succeeds in each write action. The best place is right before `return` in the handler function.

**Step 1: Add import to each file**

```typescript
import { invalidatePublicCache } from "@/lib/cache-invalidation";
```

**Step 2: Add invalidation calls**

Invalidation tag mapping per action file:

| File | Write actions | Tags |
|---|---|---|
| `schedule-arrangement.actions.ts` | `arrangeScheduleAction`, `deleteScheduleAction`, `updateScheduleLockAction` | `["stats", "teachers", "classes"]` |
| `arrange.actions.ts` | `syncTeacherScheduleAction` | `["stats", "teachers", "classes"]` |
| `auto-arrange.action.ts` | `autoArrangeAction` | `["stats", "teachers", "classes"]` |
| `teacher.actions.ts` | `createTeacherAction`, `createTeachersAction`, `updateTeacherAction`, `updateTeachersAction`, `deleteTeachersAction` | `["stats", "teachers"]` |
| `teaching-assignment.actions.ts` | `assignTeacherAction`, `unassignTeacherAction`, `bulkAssignTeachersAction`, `copyAssignmentsAction`, `clearAllAssignmentsAction` | `["teachers", "classes"]` |
| `room.actions.ts` | `createRoomAction`, `createRoomsAction`, `updateRoomAction`, `updateRoomsAction`, `deleteRoomsAction` | `["stats"]` |
| `subject.actions.ts` | `createSubjectAction`, `createSubjectsAction`, `updateSubjectAction`, `updateSubjectsAction`, `deleteSubjectsAction` | `["stats", "classes"]` |
| `config.actions.ts` | `createConfigAction`, `updateConfigAction`, `deleteConfigAction`, `copyConfigAction`, `updateConfigWithTimeslotsAction` | `["static_data", "stats"]` |
| `config-lifecycle.actions.ts` | `updateConfigStatusAction` | `["static_data", "stats"]` |
| `semester.actions.ts` | `createSemesterAction`, `createSemesterWithTimeslotsAction`, `updateSemesterStatusAction`, `copySemesterAction` | `["static_data", "stats"]` |
| `program.actions.ts` | `createProgramAction`, `updateProgramAction`, `assignSubjectsToProgramAction`, `deleteProgramAction` | `["classes"]` |
| `assign.actions.ts` | `syncAssignmentsAction`, `deleteAssignmentAction` | `["stats", "teachers", "classes"]` |
| `class.actions.ts` | `createClassScheduleAction`, `updateClassScheduleAction`, `deleteClassScheduleAction` | `["stats", "teachers", "classes"]` |
| `lock.actions.ts` | `createLockAction`, `deleteLocksAction`, `createBulkLocksAction`, `applyLockTemplateAction` | `["stats"]` |
| `gradelevel.actions.ts` | `createGradeLevelAction`, `createGradeLevelsAction`, `updateGradeLevelAction`, `updateGradeLevelsAction`, `deleteGradeLevelsAction` | `["stats", "classes"]` |
| `timeslot.actions.ts` | `createTimeslotsAction`, `deleteTimeslotsByTermAction` | `["static_data", "stats"]` |

**Example of adding invalidation inside a handler:**

```typescript
// In teacher.actions.ts, inside createTeacherAction handler:
const teacher = await teacherRepository.create(input);
await invalidatePublicCache(["stats", "teachers"]);
return teacher;
```

**Step 3: Verify build**

```bash
pnpm tsc --noEmit --project tsconfig.typecheck.json
```

**Step 4: Commit**

```bash
git add src/features/*/application/actions/*.ts
git commit -m "feat: add cache invalidation to all admin write actions"
```

---

### Task 8: Update env files

**Files:**
- Modify: `.env.local.example`
- Modify: `.env.production.example`

**Step 1: Add ACCELERATE_URL to .env.local.example**

Add after the DATABASE_URL section:

```env
# Optional: Enable Prisma Accelerate caching locally
# Get URL from Prisma Data Platform dashboard
# ACCELERATE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"
```

**Step 2: Update .env.production.example**

Replace the existing Prisma Accelerate comment block:

```env
# Prisma Accelerate (connection pooling + query caching)
# Set in Vercel dashboard as ACCELERATE_URL
# ACCELERATE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=${PRISMA_ACCELERATE_API_KEY}"
```

**Step 3: Commit**

```bash
git add .env.local.example .env.production.example
git commit -m "docs: update env examples with ACCELERATE_URL"
```

---

### Task 9: Manual Vercel config (no code)

**Step 1:** Go to Vercel Project Settings > Environment Variables

**Step 2:** Rename `PRISMA_DATABASE_URL` → `ACCELERATE_URL` (copy the value, create new var, delete old)

**Step 3:** Redeploy to pick up the new env var

---

### Task 10: Run full test suite and verify

**Step 1: Run unit tests**

```bash
pnpm vitest run
```

Expected: All pass. Cache helpers return `{}` in test environment, so no behavior change.

**Step 2: Run type check**

```bash
pnpm tsc --noEmit --project tsconfig.typecheck.json
```

Expected: No errors.

**Step 3: Run lint**

```bash
pnpm lint
```

Expected: Clean.

**Step 4: Final commit if any fixes needed, then push**

```bash
git push origin main
```

---

### Task 11: Post-deploy verification (manual)

After Vercel redeploy with `ACCELERATE_URL` set:

1. Visit homepage — should load normally
2. Check Prisma Data Platform dashboard for cache hits
3. Reload homepage — second load should show cache hits
4. Make an admin edit (e.g., toggle a schedule lock) — verify cache invalidation fires
5. Reload public page — should reflect the edit

---

## Summary

| Task | Description | Effort |
|------|-------------|--------|
| 1 | Create `cache-config.ts` | 5 min |
| 2 | Create `cache-invalidation.ts` | 5 min |
| 3 | Write unit tests | 15 min |
| 4 | Add cacheStrategy to public-data repository | 20 min |
| 5 | Add cacheStrategy to class repository | 5 min |
| 6 | Move direct Prisma calls to repository | 15 min |
| 7 | Add invalidation to admin write actions | 30 min |
| 8 | Update env files | 5 min |
| 9 | Vercel env var rename (manual) | 5 min |
| 10 | Full test suite | 10 min |
| 11 | Post-deploy verification | 10 min |
| **Total** | | **~2 hours** |
