# Clean Architecture Migration Plan

## Executive Summary

**Goal**: Migrate all features from API Routes to Clean Architecture with Server Actions

**Current State**:
- ✅ 1 feature using Clean Architecture: `schedule-arrangement`
- ⚠️ 10 features using legacy API Routes pattern
- 📊 25+ API route files to convert

**Target State**:
- 11 features with feature-based Clean Architecture
- 0 API routes (except NextAuth)
- Type-safe Server Actions with Valibot validation
- React 19 `use()` for data fetching

---

## 📚 Evidence Panel

### Library Versions (from package.json + context7)

#### Core Framework
- **next@16.0.0**
  - APIs: App Router, Route Handlers, Server Actions, `revalidateTag`, `redirect`
  - Patterns: Server Components (default), Client Components (`'use client'`)
  - Server Actions: `'use server'` directive, inline or file-level
  - Streaming: React Suspense boundaries, progressive rendering

- **react@19.2.0**
  - APIs: `use()` for data fetching (recommended for async resources)
  - Hooks: `useState`, `useEffect`, `useMemo`, `useCallback`
  - Server Components: `async` components, direct data fetching

#### Validation & Types
- **valibot@1.1.0** ⚠️ (NOT Zod!)
  - APIs: `object`, `string`, `number`, `pipe`, `email`, `minLength`
  - Type inference: `InferOutput<typeof Schema>`, `InferInput<typeof Schema>`
  - Parsing: `parse(schema, data)` throws errors, `safeParse(schema, data)` returns result
  - Pattern: `v.object({ field: v.pipe(v.string(), v.email()) })`

#### Database
- **@prisma/client@6.18.0**
  - APIs: `findMany`, `findUnique`, `create`, `update`, `delete`, `upsert`
  - Transactions: `prisma.$transaction([...])`
  - Extensions: `@prisma/extension-accelerate` for caching

#### State Management
- **zustand@5.0.8**
  - Pattern: `create<State>()((set) => ({ ... }))`
  - Used in: presentation/stores layer only

#### UI
- **@mui/material@7.3.4**
  - Components: Material Design components
  - Theming: Emotion-based styling
  
#### Auth
- **next-auth@5.0.0-beta.29**
  - Pattern: Google OAuth provider
  - Route: `/api/auth/[...nextauth]` (keep as Route Handler)

### Deltas (Prior Knowledge vs. Context7)
- ❌ **Prior**: Assumed Zod → **Actual**: Using Valibot
- ✅ **Next.js**: Server Actions are first-class, preferred over Route Handlers for mutations
- ✅ **React 19**: `use()` hook is recommended for async data fetching in Client Components

---

## 🏗️ Clean Architecture Pattern (Reference: schedule-arrangement)

### Directory Structure
```
src/features/{feature-name}/
├── application/
│   ├── actions/
│   │   ├── {feature}.actions.ts       # Server Actions ('use server')
│   │   └── {feature}.actions.test.ts  # Unit tests
│   └── schemas/
│       └── {feature}.schemas.ts       # Valibot schemas
├── domain/
│   ├── models/
│   │   └── {entity}.model.ts          # TypeScript types/interfaces
│   └── services/
│       ├── {business-logic}.service.ts      # Pure functions
│       └── {business-logic}.service.test.ts # Table-driven tests
├── infrastructure/
│   └── repositories/
│       ├── {feature}.repository.ts          # Prisma queries
│       └── {feature}.repository.test.ts     # Repository tests
└── presentation/
    ├── components/                    # Feature-specific UI components
    ├── hooks/                         # React hooks for this feature
    └── stores/                        # Zustand stores (if needed)
```

### Layer Responsibilities

#### 1. Application Layer (`application/`)
**Purpose**: Entry points for external interactions (Server Actions)

**actions/{feature}.actions.ts**:
```typescript
'use server';

import { createAction } from '@/shared/lib/action-wrapper';
import { featureRepository } from '../../infrastructure/repositories/feature.repository';
import { createFeatureSchema, type CreateFeatureInput } from '../schemas/feature.schemas';

export const createFeatureAction = createAction(
  createFeatureSchema,
  async (input: CreateFeatureInput, userId: string) => {
    // 1. Call repository
    const result = await featureRepository.create(input);
    
    // 2. Revalidate cache if needed
    // revalidateTag('features');
    
    // 3. Return data
    return result;
  }
);
```

**schemas/{feature}.schemas.ts**:
```typescript
import * as v from 'valibot';

export const createFeatureSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  count: v.number(),
});

export type CreateFeatureInput = v.InferOutput<typeof createFeatureSchema>;
```

#### 2. Domain Layer (`domain/`)
**Purpose**: Business logic, rules, and domain models (pure functions, no I/O)

**models/{entity}.model.ts**:
```typescript
// Pure TypeScript types
export type ConflictType = 'TEACHER_OVERLAP' | 'CLASS_OVERLAP' | 'ROOM_UNAVAILABLE';

export interface ConflictResult {
  hasConflict: boolean;
  conflictType?: ConflictType;
  message?: string;
}
```

**services/{logic}.service.ts**:
```typescript
// Pure functions - no Prisma, no I/O
export function checkConflict(
  newSchedule: ScheduleData,
  existingSchedules: ScheduleData[]
): ConflictResult {
  // Business logic here
  // Return result
}
```

#### 3. Infrastructure Layer (`infrastructure/`)
**Purpose**: External dependencies (Prisma, APIs, file systems)

**repositories/{feature}.repository.ts**:
```typescript
import prisma from '@/libs/prisma';
import type { CreateInput, UpdateInput } from '../../application/schemas/feature.schemas';

export const featureRepository = {
  async findAll() {
    return prisma.feature.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: number) {
    return prisma.feature.findUnique({
      where: { id },
    });
  },

  async create(data: CreateInput) {
    return prisma.feature.create({ data });
  },

  async update(id: number, data: UpdateInput) {
    return prisma.feature.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.feature.delete({
      where: { id },
    });
  },
};
```

#### 4. Presentation Layer (`presentation/`)
**Purpose**: UI components, React hooks, client state

**hooks/useFeature.ts**:
```typescript
'use client';

import { useState, useTransition } from 'react';
import { createFeatureAction } from '../../application/actions/feature.actions';

export function useFeature() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const createFeature = async (data: CreateFeatureInput) => {
    startTransition(async () => {
      const result = await createFeatureAction(data);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return { createFeature, isPending, error };
}
```

---

## 📋 Feature Inventory & Migration Order

### Priority 1: Simple CRUD (No Business Logic)
These features have straightforward CRUD operations without complex validation.

| # | Feature | API Routes | Complexity | Est. Effort |
|---|---------|-----------|------------|-------------|
| 1 | **teacher** | `/api/teacher/route.ts` | Low | 2h |
| 2 | **room** | `/api/room/route.ts`, `/api/room/availableRooms/route.ts` | Low | 2h |
| 3 | **gradelevel** | `/api/gradelevel/route.ts`, `/api/gradelevel/getGradelevelForLock/route.ts` | Low | 2h |
| 4 | **program** | `/api/program/route.ts`, `/api/program/programOfGrade/route.ts` | Low | 2h |
| 5 | **timeslot** | `/api/timeslot/route.ts` | Low | 2h |

**Total Priority 1**: 10 hours

### Priority 2: Moderate Complexity (Some Business Logic)
These features have conditional logic or derived data.

| # | Feature | API Routes | Complexity | Est. Effort |
|---|---------|-----------|------------|-------------|
| 6 | **subject** | `/api/subject/route.ts`, `/api/subject/notInPrograms/route.ts`, `/api/subject/subjectsOfGrade/route.ts` | Medium | 3h |
| 7 | **lock** | `/api/lock/route.ts`, `/api/lock/listlocked/route.ts` | Medium | 3h |
| 8 | **config** | `/api/config/route.ts`, `/api/config/copy/route.ts`, `/api/config/getConfig/route.ts` | Medium | 4h |

**Total Priority 2**: 10 hours

### Priority 3: Complex Features (Business Logic + Relations)
These features have complex validation and multiple entity relationships.

| # | Feature | API Routes | Complexity | Est. Effort |
|---|---------|-----------|------------|-------------|
| 9 | **assign** | `/api/assign/route.ts`, `/api/assign/getAvailableResp/route.ts`, `/api/assign/getLockedResp/route.ts` | High | 4h |
| 10 | **class** | `/api/class/route.ts`, `/api/class/checkConflict/route.ts`, `/api/class/summary/route.ts` | High | 4h |

**Total Priority 3**: 8 hours

### Already Complete ✅
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 11 | **schedule-arrangement** | ✅ Done | Reference implementation |

**Total Migration Effort**: ~28 hours across 10 features

---

## 🔄 Migration Strategy

### Phase 1: Create Feature Structure (Per Feature)
For each feature:

1. **Create directory structure**
   ```bash
   mkdir -p src/features/{feature-name}/{application/actions,application/schemas,domain/models,domain/services,infrastructure/repositories,presentation/hooks}
   ```

2. **Create Valibot schemas** (`application/schemas`)
   - Analyze existing API route request/response
   - Define input schemas with validation
   - Export TypeScript types using `InferOutput`

3. **Create repository** (`infrastructure/repositories`)
   - Extract Prisma queries from API routes
   - Create repository object with methods
   - Add JSDoc comments

4. **Create Server Actions** (`application/actions`)
   - Add `'use server'` directive
   - Import schemas and repository
   - Use `createAction` wrapper for auth/validation
   - Add JSDoc with examples

5. **Create domain models** (if needed)
   - Define TypeScript types/interfaces
   - Extract business logic to pure functions in `services/`

### Phase 2: Update Frontend Components
For each feature's consumers:

1. **Replace SWR with Server Actions**
   ```typescript
   // Before: SWR hook
   const { data, error, mutate } = useSWR('/api/teacher', fetcher);
   
   // After: Server Action + cache tag
   const teachers = await getTeachersAction();
   ```

2. **Update forms to use Server Actions**
   ```typescript
   // Before: Axios POST
   await axios.post('/api/teacher', data);
   
   // After: Server Action
   const result = await createTeacherAction(data);
   if (!result.success) {
     // Handle error
   }
   ```

3. **Add loading states with useTransition**
   ```typescript
   const [isPending, startTransition] = useTransition();
   
   startTransition(async () => {
     await createTeacherAction(data);
   });
   ```

### Phase 3: Deprecate API Routes
1. Move Route Handler to `_deprecated/` folder
2. Add deprecation comment
3. Test all features thoroughly
4. Delete after 1 sprint of stability

---

## 🧪 Testing Strategy

### 1. Repository Tests
```typescript
// infrastructure/repositories/*.repository.test.ts
describe('teacherRepository', () => {
  it('should find all teachers ordered by firstname', async () => {
    const teachers = await teacherRepository.findAll();
    expect(teachers[0].Firstname).toBeLessThanOrEqual(teachers[1].Firstname);
  });
});
```

### 2. Domain Service Tests (Table-Driven)
```typescript
// domain/services/*.service.test.ts
describe('checkConflict', () => {
  const testCases = [
    { input: { ... }, expected: { hasConflict: false } },
    { input: { ... }, expected: { hasConflict: true, type: 'TEACHER_OVERLAP' } },
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should return ${JSON.stringify(expected)} for ${JSON.stringify(input)}`, () => {
      expect(checkConflict(input)).toEqual(expected);
    });
  });
});
```

### 3. Server Action Tests
```typescript
// application/actions/*.actions.test.ts
describe('createTeacherAction', () => {
  it('should create teacher and return ID', async () => {
    const input = { Firstname: 'John', ... };
    const result = await createTeacherAction(input);
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('TeacherID');
  });
  
  it('should fail validation for invalid email', async () => {
    const input = { Email: 'invalid', ... };
    const result = await createTeacherAction(input);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('email');
  });
});
```

### 4. E2E Tests (Playwright)
```typescript
// e2e/teacher-management.spec.ts
test('Admin can create teacher', async ({ page }) => {
  await page.goto('/management/teacher');
  await page.click('button:has-text("Add Teacher")');
  await page.fill('input[name="Firstname"]', 'John');
  // ... fill form
  await page.click('button:has-text("Save")');
  
  await expect(page.locator('text=John')).toBeVisible();
});
```

---

## 📦 Shared Utilities

### Action Wrapper (Already Exists)
Located at: `src/shared/lib/action-wrapper.ts`

Provides:
- ✅ Authentication check
- ✅ Valibot schema validation
- ✅ Error handling
- ✅ Type-safe return values

Usage:
```typescript
export const myAction = createAction(
  mySchema,
  async (validatedInput, userId) => {
    // Business logic here
    // userId is guaranteed to exist (authenticated)
  }
);
```

### Error Types (Already Exists)
Located at: `src/types/index.ts`

```typescript
import { createConflictError, createValidationError } from '@/types';

// In Server Action
if (conflict) {
  return createConflictError('Teacher already has a class at this time');
}
```

---

## 🎯 Success Criteria

### Per-Feature Checklist
- [ ] Feature directory structure created
- [ ] Valibot schemas defined with TypeScript types
- [ ] Repository created with all Prisma queries
- [ ] Server Actions created with `createAction` wrapper
- [ ] Domain models/services created (if applicable)
- [ ] Unit tests written for repository
- [ ] Unit tests written for services (table-driven)
- [ ] Unit tests written for Server Actions
- [ ] Frontend components updated to use Server Actions
- [ ] Loading states added with `useTransition`
- [ ] Error handling implemented
- [ ] E2E tests updated
- [ ] API route moved to `_deprecated/`
- [ ] Manual testing complete

### Global Success Criteria
- [ ] All 10 features migrated
- [ ] 0 API routes (except `/api/auth/[...nextauth]`)
- [ ] All tests passing (unit + E2E)
- [ ] No regression in functionality
- [ ] Type safety improved (fewer `any` types)
- [ ] Bundle size reduced (no axios, less SWR)
- [ ] Documentation updated

---

## 🚨 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing features | High | Incremental migration; keep API routes until frontend updated |
| Authentication issues | High | Use existing `createAction` wrapper; test auth early |
| Data fetching performance | Medium | Use `revalidateTag` for cache invalidation; measure before/after |
| Type safety regressions | Medium | Strict Valibot schemas; comprehensive tests |
| Missing business logic | High | Cross-reference API routes carefully; add domain service tests |
| State management conflicts | Low | Use Zustand only in presentation layer; Server Actions for data |

---

## 🛠️ Runbook

### Commands

```bash
# Development
pnpm dev

# Generate Prisma client (after schema changes)
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Run tests
pnpm test                  # Unit tests
pnpm test:watch           # Watch mode
pnpm test:e2e             # E2E tests
pnpm test:e2e:ui          # E2E with UI

# Linting
pnpm lint
```

### Environment Variables
```env
# Database
DATABASE_URL="mysql://..."

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Development
DEV_BYPASS_AUTH="true"  # For local development only
```

### Migration Workflow (Per Feature)
```bash
# 1. Create feature structure
pnpm run create-feature teacher  # (if script exists)
# Or manually create directories

# 2. Implement layers
# - Write schemas first (defines contract)
# - Write repository (Prisma queries)
# - Write Server Actions (uses schemas + repository)
# - Write domain services if needed

# 3. Write tests
pnpm test -- teacher

# 4. Update frontend
# - Replace SWR with Server Actions
# - Add loading states
# - Test manually

# 5. Run E2E
pnpm test:e2e -- teacher-management

# 6. Move API route to _deprecated
mv src/app/api/teacher src/app/api/_deprecated/teacher

# 7. Commit
git add .
git commit -m "feat(teacher): migrate to Clean Architecture with Server Actions"
```

---

## 📚 MCP Usage Recap

### Context7 Queries
- ✅ `/vercel/next.js/v15.1.8` → Server Actions, App Router patterns
- ✅ `/fabian-hiller/valibot` → Schema validation, type inference
- ✅ `/prisma/prisma` → ORM patterns, transactions
- ⏭️ `/reactjs/react.dev` → `use()` hook for async data (when needed)

### Serena Tools Used
- ✅ `list_dir` → Feature inventory, API route discovery
- ✅ `read_file` → Analyze current API routes and reference implementation
- ⏭️ `create_directory` → Create feature structure
- ⏭️ `create_file` → Generate layer files
- ⏭️ `replace_symbol_body` → Update frontend components
- ⏭️ `rename_symbol` → Refactor if needed

---

## 🎓 Training Resources

### For Team Members
1. **Clean Architecture Primer**: Read schedule-arrangement implementation
2. **Valibot Docs**: https://valibot.dev
3. **Next.js Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
4. **Prisma Best Practices**: https://www.prisma.io/docs/orm/prisma-client/queries/crud

### Code Examples
- See: `src/features/schedule-arrangement/` for full reference
- See: `src/shared/lib/action-wrapper.ts` for auth/validation pattern

---

## 📅 Rollback Plan

### If Migration Fails Mid-Feature

1. **Restore API route** from `_deprecated/` folder
2. **Revert frontend changes** (git revert)
3. **Keep completed layers** for future use
4. **Document blockers** in issue tracker

### If Production Issues After Migration

1. **Hot fix**: Restore API route endpoint
2. **Update frontend** to use API route again (temporary)
3. **Debug Server Action** in staging
4. **Re-deploy** corrected version
5. **Post-mortem**: Document what went wrong

---

## ✅ Next Steps

1. **Review this plan** with team
2. **Start with Priority 1** (teacher feature)
3. **Create shared feature template** (optional script)
4. **Set up monitoring** for Server Action errors
5. **Begin migration** following the per-feature workflow

**Estimated Total Time**: 28-35 hours (includes testing, debugging, documentation)

**Suggested Sprint Allocation**: 2-3 sprints (3-4 features per sprint)

---

## 📎 Appendices

### A. Valibot vs. Zod Migration Note
⚠️ **Important**: This project uses **Valibot**, not Zod.

**Key Differences**:
| Feature | Zod | Valibot |
|---------|-----|---------|
| Import | `import { z } from 'zod'` | `import * as v from 'valibot'` |
| Object | `z.object({ ... })` | `v.object({ ... })` |
| String | `z.string()` | `v.string()` |
| Pipe | `z.string().email()` | `v.pipe(v.string(), v.email())` |
| Type inference | `z.infer<typeof schema>` | `v.InferOutput<typeof schema>` |
| Parse | `schema.parse(data)` | `v.parse(schema, data)` |
| Safe parse | `schema.safeParse(data)` | `v.safeParse(schema, data)` |

**Do not** use Zod examples - always use Valibot syntax!

### B. Server Actions vs. Route Handlers Decision Matrix

| Use Case | Use Server Actions | Use Route Handlers |
|----------|-------------------|-------------------|
| Form submission | ✅ Yes | ❌ No |
| Mutation (create/update/delete) | ✅ Yes | ❌ No |
| Called from Client Component | ✅ Yes | ⚠️ Rarely |
| Called from Server Component | ✅ Yes | ❌ No |
| Webhook endpoint | ❌ No | ✅ Yes |
| External API (non-browser) | ❌ No | ✅ Yes |
| NextAuth callbacks | ❌ No | ✅ Yes |

**Rule of Thumb**: If it's user-initiated and browser-based, use Server Actions. If it's server-to-server, use Route Handlers.

### C. File Naming Conventions

| Layer | File Pattern | Example |
|-------|-------------|---------|
| Actions | `{feature}.actions.ts` | `teacher.actions.ts` |
| Schemas | `{feature}.schemas.ts` | `teacher.schemas.ts` |
| Repository | `{feature}.repository.ts` | `teacher.repository.ts` |
| Service | `{logic}.service.ts` | `conflict-detector.service.ts` |
| Model | `{entity}.model.ts` | `schedule.model.ts` |
| Hook | `use{Feature}.ts` | `useTeacher.ts` |
| Store | `{feature}-ui.store.ts` | `teacher-ui.store.ts` |
| Test | `{source}.test.ts` | `teacher.actions.test.ts` |

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-25  
**Author**: AI Agent (GitHub Copilot)  
**Status**: Ready for Review
