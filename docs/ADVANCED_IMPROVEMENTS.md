# Additional Architecture Improvements

> **Beyond the core refactoring: Advanced patterns and optimizations**

---

## 1. Advanced State Management Patterns

### 1.1 Separate Server State from UI State

**Current Problem**: Mixing server data with UI state

**Solution**: Use different tools for different concerns

```typescript
// ✅ Server State (use Server Actions + SWR or React Query)
const { data: teachers } = useSWR('/api/teachers', fetcher);

// ✅ UI State (use Zustand)
const { isModalOpen, selectedTeacher } = useTeacherUIStore();
```

### 1.2 Optimistic Updates with Zustand

```typescript
// features/teacher-management/presentation/stores/teacher.store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TeacherStore {
  teachers: Teacher[];
  optimisticTeachers: Teacher[];
  
  // Optimistic update
  addTeacherOptimistic: (teacher: Teacher) => void;
  
  // Rollback if server action fails
  rollback: () => void;
  
  // Commit if server action succeeds
  commit: (teachers: Teacher[]) => void;
}

export const useTeacherStore = create<TeacherStore>()(
  immer((set) => ({
    teachers: [],
    optimisticTeachers: [],

    addTeacherOptimistic: (teacher) =>
      set((state) => {
        state.optimisticTeachers.push(teacher);
      }),

    rollback: () =>
      set((state) => {
        state.optimisticTeachers = [];
      }),

    commit: (teachers) =>
      set((state) => {
        state.teachers = teachers;
        state.optimisticTeachers = [];
      }),
  }))
);
```

**Usage**:

```typescript
const { addTeacherOptimistic, rollback, commit } = useTeacherStore();

const handleAddTeacher = async (data) => {
  // 1. Optimistic update
  addTeacherOptimistic({ ...data, id: 'temp-' + Date.now() });

  // 2. Server action
  const result = await createTeacherAction(data);

  // 3. Rollback or commit
  if (result.success) {
    commit(result.teachers);
  } else {
    rollback();
  }
};
```

---

## 2. Advanced Server Action Patterns

### 2.1 Reusable Action Wrapper

**Create**: `shared/lib/action-wrapper.ts`

```typescript
import { z } from 'zod';
import { handleError } from '@/shared/utils/error.utils';
import { logger } from '@/shared/lib/logger';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export function createAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>
) {
  return async (input: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Validate
      const validated = schema.parse(input);

      // 2. Log
      logger.info('Action called', { input: validated });

      // 3. Execute
      const result = await handler(validated);

      // 4. Log success
      logger.info('Action succeeded', { result });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // 5. Log error
      logger.error('Action failed', { error });

      // 6. Handle error
      const errorInfo = handleError(error);

      return {
        success: false,
        error: errorInfo,
      };
    }
  };
}
```

**Usage**:

```typescript
// features/teacher-management/application/actions/create-teacher.action.ts
'use server';

import { createAction } from '@/shared/lib/action-wrapper';
import { createTeacherSchema } from '../schemas/teacher.schema';
import { teacherRepository } from '../../infrastructure/repositories/teacher.repository';

export const createTeacherAction = createAction(
  createTeacherSchema,
  async (input) => {
    // Just business logic - validation and error handling are automatic
    const teacher = await teacherRepository.create(input);
    return teacher;
  }
);
```

### 2.2 Transaction Pattern for Complex Operations

```typescript
'use server';

import { prisma } from '@/shared/lib/prisma';

export async function complexArrangementAction(input: any) {
  return await prisma.$transaction(async (tx) => {
    // All operations succeed or all fail
    
    // 1. Delete old schedules
    await tx.class_schedule.deleteMany({
      where: { /* ... */ }
    });

    // 2. Create new schedules
    const created = await tx.class_schedule.createMany({
      data: /* ... */
    });

    // 3. Update teacher workload
    await tx.teacher.update({
      where: { /* ... */ },
      data: { /* ... */ }
    });

    return { created };
  });
}
```

---

## 3. Advanced Domain Patterns

### 3.1 Value Objects for Type Safety

**Create**: `features/schedule-arrangement/domain/value-objects/timeslot-id.vo.ts`

```typescript
/**
 * Value Object: TimeslotID
 * Ensures format: {year}/{semester}/{day}/{time}
 */
export class TimeslotID {
  private constructor(private readonly value: string) {}

  static create(
    year: number,
    semester: number,
    day: string,
    time: string
  ): TimeslotID {
    return new TimeslotID(`${year}/${semester}/${day}/${time}`);
  }

  static fromString(value: string): TimeslotID {
    // Validate format
    const parts = value.split('/');
    if (parts.length !== 4) {
      throw new Error('Invalid TimeslotID format');
    }
    return new TimeslotID(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: TimeslotID): boolean {
    return this.value === other.value;
  }

  get year(): number {
    return parseInt(this.value.split('/')[0]);
  }

  get semester(): number {
    return parseInt(this.value.split('/')[1]);
  }

  get day(): string {
    return this.value.split('/')[2];
  }

  get time(): string {
    return this.value.split('/')[3];
  }
}
```

**Usage**:

```typescript
// Instead of:
const timeslotId = '2024/1/Mon/08:00'; // String, no validation

// Use:
const timeslotId = TimeslotID.create(2024, 1, 'Mon', '08:00');
console.log(timeslotId.year); // 2024
console.log(timeslotId.toString()); // '2024/1/Mon/08:00'
```

### 3.2 Domain Events

**Create**: `features/schedule-arrangement/domain/events/schedule-arranged.event.ts`

```typescript
export interface ScheduleArrangedEvent {
  type: 'SCHEDULE_ARRANGED';
  payload: {
    teacherId: string;
    schedules: Array<{
      timeslotId: string;
      subjectCode: string;
      gradeId: string;
    }>;
    timestamp: Date;
  };
}

export interface ScheduleConflictEvent {
  type: 'SCHEDULE_CONFLICT';
  payload: {
    conflictType: string;
    message: string;
    timestamp: Date;
  };
}

export type DomainEvent = ScheduleArrangedEvent | ScheduleConflictEvent;

// Event bus
class EventBus {
  private handlers = new Map<string, Array<(event: any) => void>>();

  subscribe<T extends DomainEvent>(
    type: T['type'],
    handler: (event: T) => void
  ) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  publish<T extends DomainEvent>(event: T) {
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach((handler) => handler(event));
  }
}

export const eventBus = new EventBus();
```

**Usage**:

```typescript
// Subscribe to events
eventBus.subscribe('SCHEDULE_ARRANGED', (event) => {
  console.log('Schedule arranged:', event.payload);
  // Could trigger: notifications, analytics, etc.
});

// Publish events
eventBus.publish({
  type: 'SCHEDULE_ARRANGED',
  payload: {
    teacherId: 'T001',
    schedules: [...],
    timestamp: new Date(),
  },
});
```

---

## 4. Advanced Caching Strategies

### 4.1 React Query for Advanced Caching

**Install**:

```powershell
pnpm add @tanstack/react-query
```

**Setup**: `app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Usage**:

```typescript
// features/teacher-management/presentation/hooks/use-teachers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeachersAction, createTeacherAction } from '../../application/actions';

export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachersAction(),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeacherAction,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
}
```

### 4.2 Incremental Static Regeneration (ISR)

**For read-heavy pages**:

```typescript
// app/dashboard/[semesterAndyear]/all-timeslot/page.tsx
export const revalidate = 300; // Revalidate every 5 minutes

export default async function AllTimeslotPage({ params }: PageProps) {
  const { semesterAndyear } = await params;
  
  // Fetch data server-side
  const data = await getTimeslotData(semesterAndyear);
  
  return <AllTimeslotView data={data} />;
}
```

---

## 5. Performance Optimizations

### 5.1 Virtual Scrolling for Large Lists

```powershell
pnpm add @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function TeacherList({ teachers }: { teachers: Teacher[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: teachers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <TeacherRow teacher={teachers[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 5.2 Memoization with Zustand Selectors

```typescript
// ❌ Bad: Re-renders on any state change
const store = useArrangementUIStore();

// ✅ Good: Only re-renders when selectedSubject changes
const selectedSubject = useArrangementUIStore((s) => s.selectedSubject);

// ✅ Even better: Memoize computed values
const selectedSubjectId = useArrangementUIStore(
  (s) => s.selectedSubject?.id,
  shallow // Import from 'zustand/shallow'
);
```

### 5.3 Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const TimetableGrid = dynamic(
  () => import('@/features/schedule-arrangement/presentation/components/TimetableGrid'),
  {
    loading: () => <TimetableGridSkeleton />,
    ssr: false, // Disable SSR if component uses browser-only APIs
  }
);
```

---

## 6. Developer Experience Improvements

### 6.1 VSCode Snippets

**Create**: `.vscode/snippets.code-snippets`

```json
{
  "Feature Action": {
    "prefix": "feature-action",
    "body": [
      "'use server';",
      "",
      "import { z } from 'zod';",
      "import { revalidatePath } from 'next/cache';",
      "",
      "const schema = z.object({",
      "  $1",
      "});",
      "",
      "export async function ${2:actionName}(input: z.infer<typeof schema>) {",
      "  try {",
      "    const validated = schema.parse(input);",
      "    ",
      "    // TODO: Implement logic",
      "    ",
      "    revalidatePath('$3');",
      "    ",
      "    return { success: true };",
      "  } catch (error) {",
      "    return { success: false, error: error.message };",
      "  }",
      "}"
    ]
  }
}
```

### 6.2 Pre-commit Hooks

```powershell
pnpm add -D husky lint-staged
```

**Setup**:

```powershell
pnpm husky install
pnpm husky add .husky/pre-commit "pnpm lint-staged"
```

**package.json**:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## 7. Monitoring & Observability

### 7.1 Error Tracking with Sentry

```powershell
pnpm add @sentry/nextjs
```

### 7.2 Analytics Events

```typescript
// shared/lib/analytics.ts
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties);
    }
  },
};

// Usage:
analytics.track('schedule_arranged', {
  teacherId: 'T001',
  scheduleCount: 5,
});
```

---

## 8. Documentation as Code

### 8.1 JSDoc with TypeScript

```typescript
/**
 * Checks if a teacher has a scheduling conflict
 * 
 * @param teacherId - The unique identifier of the teacher
 * @param timeslotId - The timeslot to check
 * @param existingSchedules - Current schedules to check against
 * 
 * @returns ConflictResult indicating if conflict exists
 * 
 * @example
 * ```typescript
 * const result = checkTeacherConflict('T001', 'TS-001', schedules);
 * if (result.hasConflict) {
 *   console.log(result.conflicts[0].message);
 * }
 * ```
 */
export function checkTeacherConflict(
  teacherId: string,
  timeslotId: string,
  existingSchedules: ClassSchedule[]
): ConflictResult {
  // Implementation...
}
```

### 8.2 Architecture Decision Records (ADRs)

**Create**: `docs/adr/001-feature-based-architecture.md`

```markdown
# ADR 001: Feature-Based Architecture

## Status
Accepted

## Context
Current codebase organizes code by technical layer (components, api, hooks),
making it hard to understand features and maintain code.

## Decision
Reorganize codebase by business feature using Clean Architecture principles.

## Consequences
- Easier to understand and maintain
- Clear boundaries between features
- Better testability
- Requires team training on new structure
```

---

## 9. CI/CD Improvements

### 9.1 GitHub Actions Workflow

**Create**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

---

## 10. Future Considerations

### 10.1 Micro-frontends (if app grows significantly)

- Split into independent applications
- Share common libraries
- Deploy independently

### 10.2 GraphQL (if API becomes complex)

```powershell
pnpm add @apollo/client graphql
```

### 10.3 Internationalization (i18n)

```powershell
pnpm add next-intl
```

---

## Summary

These advanced patterns and optimizations complement the core refactoring:

1. ✅ **State Management**: Clear separation of concerns
2. ✅ **Server Actions**: Reusable, type-safe patterns
3. ✅ **Domain Patterns**: Value Objects and Events
4. ✅ **Caching**: React Query for advanced needs
5. ✅ **Performance**: Virtual scrolling, code splitting
6. ✅ **DX**: Snippets, hooks, documentation
7. ✅ **Monitoring**: Error tracking and analytics
8. ✅ **CI/CD**: Automated testing and deployment

Choose what fits your needs and implement incrementally!
