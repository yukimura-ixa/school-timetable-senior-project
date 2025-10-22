# School Timetable Refactoring Plan V2 - UPDATED
> **Solo dev, hobby project, best practices mandatory, functional approach**

**Last Updated**: October 21, 2025
**Status**: Ready to implement

---

## 🎯 PROJECT CONSTRAINTS

### Developer Context
- **Solo Developer** - No team parallelization
- **Hobby Project** - No external deadlines
- **Quality First** - Take time to do it right
- **App Can Have Downtime** - Simplifies migration (no feature flags needed)

### Critical Requirements
- ✅ **Conflict Detection CANNOT Break** - 100% test coverage required
- ✅ **Best Practices MANDATORY** - No shortcuts
- ✅ **Functional Approach** - Avoid breaking changes where possible
- ✅ **Incremental TypeScript** - Enable strict mode gradually

### Technology Decisions
- **State Management**: Zustand (UI state only)
- **Server State**: SWR (already in use)
- **Server Actions**: Next.js 15 native (replace API routes)
- **Validation**: Valibot (instead of Zod - lighter, faster)
- **Drag & Drop**: @dnd-kit (instead of react-beautiful-dnd)
- **TypeScript**: Incremental strict mode enablement

---

## 📊 CURRENT PROBLEMS ANALYSIS

### 1. API Routes Mix Concerns
```typescript
// ❌ BAD: src/app/api/arrange/route.ts (140 lines)
export async function POST(req: Request) {
  const body = await req.json(); // No validation
  
  // Business logic mixed with HTTP
  const conflicts = /* ... detect conflicts ... */;
  
  // Direct Prisma calls
  await prisma.class_schedule.create(/* ... */);
  
  return NextResponse.json(/* ... */);
}
```

### 2. Components Have Too Much State
```typescript
// ❌ BAD: 34+ useState in TeacherArrangePage
const [teachers, setTeachers] = useState([]);
const [selectedTeacher, setSelectedTeacher] = useState(null);
const [draggedSubject, setDraggedSubject] = useState(null);
// ... 31 more useState declarations
```

### 3. TypeScript Safety Dialed Back
```json
// ❌ BAD: tsconfig.json
{
  "strict": false,  // Safety features disabled
  "noImplicitAny": false
}
```

### 4. Drag & Drop Library Deprecated
```json
// ❌ BAD: package.json
"react-beautiful-dnd": "^13.1.1"  // Unmaintained, no React 18+ support
```

---

## 🏗️ PROPOSED ARCHITECTURE

### Feature-Based + Clean Architecture

```
src/
├── features/                           # Business features
│   └── schedule-arrangement/          # Example feature
│       ├── domain/                    # Pure business logic
│       │   ├── models/               # TypeScript types/interfaces
│       │   │   ├── schedule.model.ts
│       │   │   └── conflict.model.ts
│       │   ├── services/             # Pure functions (business rules)
│       │   │   ├── conflict-detector.service.ts  ← 100% coverage
│       │   │   └── schedule-validator.service.ts
│       │   └── types/                # Shared types for this feature
│       ├── application/               # Use cases & orchestration
│       │   ├── actions/              # Server Actions
│       │   │   ├── arrange-schedule.action.ts
│       │   │   └── validate-timeslot.action.ts
│       │   └── schemas/              # Valibot validation schemas
│       │       └── arrangement.schema.ts
│       ├── infrastructure/            # External dependencies
│       │   └── repositories/         # Data access layer
│       │       └── schedule.repository.ts
│       └── presentation/              # UI components
│           ├── components/           # React components
│           │   ├── TimetableGrid.tsx
│           │   └── SubjectCard.tsx
│           ├── stores/               # Zustand stores (UI state)
│           │   └── arrangement-ui.store.ts
│           └── hooks/                # Custom hooks
│               └── use-arrangement.ts
│
├── shared/                            # Shared across features
│   ├── lib/                          # Core infrastructure
│   │   ├── prisma.ts                # Prisma client
│   │   ├── action-wrapper.ts        # Server Action helper
│   │   └── logger.ts                # Logging utility
│   ├── utils/                        # Pure utility functions
│   │   ├── date.utils.ts
│   │   ├── string.utils.ts
│   │   └── array.utils.ts
│   ├── types/                        # Global TypeScript types
│   │   └── common.types.ts
│   ├── schemas/                      # Reusable Valibot schemas
│   │   └── common.schemas.ts
│   └── constants/                    # App-wide constants
│       └── app.constants.ts
│
└── app/                              # Next.js App Router (thin layer)
    ├── schedule/[semesterAndyear]/
    │   └── arrange/
    │       └── teacher-arrange/
    │           └── page.tsx          # Thin wrapper, imports from features/
    └── api/                          # Will be phased out
        └── arrange/
            └── route.ts              # Mark deprecated, replace with Server Actions
```

---

## 💻 CODE EXAMPLES

### 1. Domain Service (Pure Functions)

```typescript
// features/schedule-arrangement/domain/services/conflict-detector.service.ts

import type { ClassSchedule, Timeslot } from '../models';
import type { ConflictResult, ConflictType } from '../types';

/**
 * Check if teacher has scheduling conflict
 * PURE FUNCTION - No side effects, fully testable
 * TARGET: 100% test coverage (critical business logic)
 */
export function checkTeacherConflict(
  teacherId: string,
  timeslotId: string,
  existingSchedules: ClassSchedule[]
): ConflictResult {
  const conflicts: ConflictType[] = [];

  const teacherSchedule = existingSchedules.find(
    (s) => s.teacherId === teacherId && s.timeslotId === timeslotId
  );

  if (teacherSchedule) {
    conflicts.push({
      type: 'TEACHER_CONFLICT',
      message: `Teacher ${teacherId} already teaching at ${timeslotId}`,
      severity: 'ERROR',
    });
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Check if classroom has scheduling conflict
 * PURE FUNCTION
 */
export function checkRoomConflict(
  roomId: string,
  timeslotId: string,
  existingSchedules: ClassSchedule[]
): ConflictResult {
  // Implementation...
}

/**
 * Check if class has scheduling conflict
 * PURE FUNCTION
 */
export function checkClassConflict(
  gradeId: string,
  timeslotId: string,
  existingSchedules: ClassSchedule[]
): ConflictResult {
  // Implementation...
}

/**
 * Comprehensive conflict check
 * Composes all conflict checks
 */
export function checkAllConflicts(
  teacherId: string,
  roomId: string,
  gradeId: string,
  timeslotId: string,
  existingSchedules: ClassSchedule[]
): ConflictResult {
  const teacherConflict = checkTeacherConflict(teacherId, timeslotId, existingSchedules);
  const roomConflict = checkRoomConflict(roomId, timeslotId, existingSchedules);
  const classConflict = checkClassConflict(gradeId, timeslotId, existingSchedules);

  return {
    hasConflict: teacherConflict.hasConflict || roomConflict.hasConflict || classConflict.hasConflict,
    conflicts: [
      ...teacherConflict.conflicts,
      ...roomConflict.conflicts,
      ...classConflict.conflicts,
    ],
  };
}
```

### 2. Repository (Data Access)

```typescript
// features/schedule-arrangement/infrastructure/repositories/schedule.repository.ts

import { prisma } from '@/shared/lib/prisma';
import type { ClassSchedule } from '../../domain/models';

/**
 * Schedule Repository
 * Encapsulates all data access for schedules
 */
export const scheduleRepository = {
  /**
   * Get all schedules for a semester
   */
  async findBySemester(year: number, semester: number): Promise<ClassSchedule[]> {
    return await prisma.class_schedule.findMany({
      where: {
        timeslot: {
          academicYear: year,
          semester,
        },
      },
      include: {
        timeslot: true,
        subject: true,
        teacher: true,
        gradelevel: true,
        room: true,
      },
    });
  },

  /**
   * Create new schedule entry
   * Idempotent - safe to retry
   */
  async create(data: {
    teacherId: string;
    timeslotId: string;
    subjectCode: string;
    roomId: string;
    gradeId: string;
  }): Promise<ClassSchedule> {
    return await prisma.class_schedule.create({
      data: {
        teacherId: data.teacherId,
        timeslotId: data.timeslotId,
        subjectCode: data.subjectCode,
        roomId: data.roomId,
        gradeId: data.gradeId,
        isLocked: false,
      },
    });
  },

  /**
   * Delete schedule entry
   */
  async delete(classId: number): Promise<void> {
    await prisma.class_schedule.delete({
      where: { classId },
    });
  },

  /**
   * Bulk create schedules in transaction
   */
  async createMany(schedules: Array<{
    teacherId: string;
    timeslotId: string;
    subjectCode: string;
    roomId: string;
    gradeId: string;
  }>): Promise<number> {
    const result = await prisma.class_schedule.createMany({
      data: schedules.map(s => ({
        ...s,
        isLocked: false,
      })),
    });
    return result.count;
  },
};
```

### 3. Valibot Validation Schema

```typescript
// features/schedule-arrangement/application/schemas/arrangement.schema.ts

import * as v from 'valibot'; // Only ~1.31 KB!

/**
 * Arrange schedule input schema
 * Valibot provides runtime validation + TypeScript type inference
 */
export const arrangeScheduleSchema = v.object({
  teacherId: v.pipe(
    v.string('Teacher ID is required'),
    v.nonEmpty('Teacher ID cannot be empty'),
    v.minLength(1, 'Teacher ID must be at least 1 character')
  ),
  timeslotId: v.pipe(
    v.string('Timeslot ID is required'),
    v.nonEmpty('Timeslot ID cannot be empty')
  ),
  subjectCode: v.pipe(
    v.string('Subject code is required'),
    v.nonEmpty('Subject code cannot be empty')
  ),
  roomId: v.pipe(
    v.string('Room ID is required'),
    v.nonEmpty('Room ID cannot be empty')
  ),
  gradeId: v.pipe(
    v.string('Grade ID is required'),
    v.nonEmpty('Grade ID cannot be empty')
  ),
  academicYear: v.pipe(
    v.number('Academic year must be a number'),
    v.minValue(2000, 'Year must be 2000 or later'),
    v.maxValue(2100, 'Year must be 2100 or earlier')
  ),
  semester: v.pipe(
    v.number('Semester must be a number'),
    v.minValue(1, 'Semester must be 1 or 2'),
    v.maxValue(2, 'Semester must be 1 or 2')
  ),
});

// Infer TypeScript type from schema
export type ArrangeScheduleInput = v.InferOutput<typeof arrangeScheduleSchema>;
```

### 4. Server Action with Action Wrapper

```typescript
// shared/lib/action-wrapper.ts (REUSABLE HELPER)

import * as v from 'valibot';
import { auth } from '@/auth';

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

/**
 * Create type-safe Server Action with automatic:
 * - Authentication check
 * - Validation
 * - Error handling
 * - Logging
 */
export function createAction<TInput, TOutput>(
  schema: v.GenericSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>
) {
  return async (input: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Auth check
      const session = await auth();
      if (!session || !session.user) {
        return {
          success: false,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        };
      }

      // 2. Validate input
      const result = v.safeParse(schema, input);
      if (!result.success) {
        return {
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: result.issues,
          },
        };
      }

      // 3. Execute business logic
      const data = await handler(result.output);

      // 4. Return success
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Action failed:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
        },
      };
    }
  };
}
```

```typescript
// features/schedule-arrangement/application/actions/arrange-schedule.action.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createAction } from '@/shared/lib/action-wrapper';
import { arrangeScheduleSchema } from '../schemas/arrangement.schema';
import { scheduleRepository } from '../../infrastructure/repositories/schedule.repository';
import { checkAllConflicts } from '../../domain/services/conflict-detector.service';

/**
 * Server Action: Arrange schedule
 * Uses action wrapper for DRY code
 */
export const arrangeScheduleAction = createAction(
  arrangeScheduleSchema,
  async (input) => {
    // 1. Get existing schedules
    const existingSchedules = await scheduleRepository.findBySemester(
      input.academicYear,
      input.semester
    );

    // 2. Check conflicts (pure function)
    const conflictResult = checkAllConflicts(
      input.teacherId,
      input.roomId,
      input.gradeId,
      input.timeslotId,
      existingSchedules
    );

    if (conflictResult.hasConflict) {
      throw new Error(
        `Cannot arrange schedule: ${conflictResult.conflicts.map(c => c.message).join(', ')}`
      );
    }

    // 3. Create schedule
    const schedule = await scheduleRepository.create(input);

    // 4. Revalidate cache
    revalidatePath(`/schedule/${input.academicYear}/${input.semester}`);

    return schedule;
  }
);
```

### 5. Zustand Store (UI State Only)

```typescript
// features/schedule-arrangement/presentation/stores/arrangement-ui.store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Subject {
  code: string;
  name: string;
}

interface ArrangementUIState {
  // UI state
  selectedTeacher: string | null;
  selectedSubject: Subject | null;
  draggedSubject: Subject | null;
  isModalOpen: boolean;
  
  // Actions
  setSelectedTeacher: (teacherId: string | null) => void;
  setSelectedSubject: (subject: Subject | null) => void;
  setDraggedSubject: (subject: Subject | null) => void;
  openModal: () => void;
  closeModal: () => void;
  reset: () => void;
}

/**
 * Zustand store for UI state
 * DO NOT put server data here - use SWR for that
 */
export const useArrangementUIStore = create<ArrangementUIState>()(
  devtools(
    (set) => ({
      // Initial state
      selectedTeacher: null,
      selectedSubject: null,
      draggedSubject: null,
      isModalOpen: false,

      // Actions
      setSelectedTeacher: (teacherId) =>
        set({ selectedTeacher: teacherId }, false, 'setSelectedTeacher'),

      setSelectedSubject: (subject) =>
        set({ selectedSubject: subject }, false, 'setSelectedSubject'),

      setDraggedSubject: (subject) =>
        set({ draggedSubject: subject }, false, 'setDraggedSubject'),

      openModal: () =>
        set({ isModalOpen: true }, false, 'openModal'),

      closeModal: () =>
        set({ isModalOpen: false }, false, 'closeModal'),

      reset: () =>
        set(
          {
            selectedTeacher: null,
            selectedSubject: null,
            draggedSubject: null,
            isModalOpen: false,
          },
          false,
          'reset'
        ),
    }),
    { name: 'ArrangementUI' }
  )
);
```

### 6. @dnd-kit Implementation

```typescript
// features/schedule-arrangement/presentation/components/TimetableGrid.tsx

import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SubjectCardProps {
  id: string;
  subject: string;
}

/**
 * Draggable subject card using @dnd-kit
 */
function SubjectCard({ id, subject }: SubjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {subject}
    </div>
  );
}

/**
 * Timetable grid with drag & drop
 */
export function TimetableGrid() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Handle drop logic
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SubjectCard key={item.id} id={item.id} subject={item.subject} />
        ))}
      </SortableContext>

      <DragOverlay>
        {activeId ? <SubjectCard id={activeId} subject="..." /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### 7. Component Using Store + Server Action

```typescript
// app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx

'use client';

import { useArrangementUIStore } from '@/features/schedule-arrangement/presentation/stores/arrangement-ui.store';
import { arrangeScheduleAction } from '@/features/schedule-arrangement/application/actions/arrange-schedule.action';
import useSWR from 'swr';

export default function TeacherArrangePage() {
  // Server state (SWR)
  const { data: teachers } = useSWR('/api/teachers');

  // UI state (Zustand)
  const {
    selectedTeacher,
    selectedSubject,
    setSelectedTeacher,
    setSelectedSubject,
  } = useArrangementUIStore();

  // Server action
  const handleArrange = async () => {
    const result = await arrangeScheduleAction({
      teacherId: selectedTeacher!,
      subjectCode: selectedSubject!.code,
      // ... other fields
    });

    if (result.success) {
      toast.success('Schedule arranged successfully');
    } else {
      toast.error(result.error?.message);
    }
  };

  return (
    <div>
      {/* UI uses Zustand for local state */}
      {/* Server data comes from SWR */}
      {/* Mutations use Server Actions */}
    </div>
  );
}
```

---

## 📅 MIGRATION PHASES (14 Weeks)

### **Phase 1: Foundation** (Weeks 1-2)

**Goal**: Set up infrastructure without breaking existing code

**Tasks**:
1. ✅ Install new dependencies
2. ✅ Create folder structure
3. ✅ Add path aliases to tsconfig.json (NOT strict mode yet)
4. ✅ Create shared utilities and helpers
5. ✅ Set up testing infrastructure
6. ✅ Create ADRs (Architecture Decision Records)

**Commands**:
```powershell
# Install dependencies
pnpm add zustand valibot @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Install dev dependencies
pnpm add -D immer

# Create folder structure
mkdir -p src/features src/shared/lib src/shared/utils src/shared/types src/shared/schemas src/shared/constants

# Create docs folder for ADRs
mkdir -p docs/adr
```

**TypeScript Config Updates** (Phase 1 - Path aliases only):
```json
{
  "compilerOptions": {
    // Add path aliases (safe - won't break code)
    "paths": {
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/app/*": ["./src/app/*"]
    }
    // Do NOT enable strict mode yet
  }
}
```

**Deliverables**:
- ✅ New dependencies installed
- ✅ Folder structure created
- ✅ Path aliases configured
- ✅ Action wrapper helper created
- ✅ Testing setup verified
- ✅ ADR template created

**Testing**: Run `pnpm test` and `pnpm build` to ensure nothing broke

---

### **Phase 2: Schedule Arrangement Feature** (Weeks 3-6)

**Goal**: Migrate most complex feature as proof-of-concept

**Priority**: CONFLICT DETECTION - 100% test coverage

**Tasks**:
1. ✅ Extract conflict detection to pure domain services
2. ✅ Write comprehensive tests for conflict rules (table-driven)
3. ✅ Create schedule repository
4. ✅ Create Valibot schemas
5. ✅ Implement Server Actions
6. ✅ Create Zustand store for UI state
7. ✅ Migrate to @dnd-kit
8. ✅ Refactor TeacherArrangePage
9. ✅ Test thoroughly
10. ✅ Remove old API route

**TypeScript Config Updates** (Phase 2 - strictNullChecks):
```json
{
  "compilerOptions": {
    "strictNullChecks": true,  // Enable first strict flag
    "paths": { /* ... */ }
  }
}
```

**Testing Checklist**:
```
Conflict Detection Tests (100% coverage):
- ✅ Teacher conflict detection
- ✅ Room conflict detection  
- ✅ Class conflict detection
- ✅ Multiple simultaneous conflicts
- ✅ Edge cases (empty schedules, locked slots)

Integration Tests:
- ✅ Server Actions with valid/invalid input
- ✅ Repository CRUD operations
- ✅ Full arrange flow

E2E Tests:
- ✅ User can arrange schedule via UI
- ✅ Conflicts are prevented
- ✅ UI shows appropriate error messages
```

**Deliverables**:
- ✅ Conflict detector with 100% test coverage
- ✅ Schedule repository
- ✅ Server Actions replacing /api/arrange
- ✅ @dnd-kit implementation
- ✅ Refactored component with Zustand
- ✅ Old API route removed

---

### **Phase 3: Core CRUD Features** (Weeks 7-10)

**Goal**: Migrate simpler CRUD features

**Features**:
1. teacher-management
2. room-management
3. subject-management
4. gradelevel-management

**Note**: These are simpler - can use simplified 3-layer architecture:
```
features/teacher-management/
├── application/
│   ├── actions/
│   └── schemas/
├── infrastructure/
│   └── repositories/
└── presentation/
    ├── components/
    └── stores/
```

**TypeScript Config Updates** (Phase 3 - noImplicitAny):
```json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true,  // Enable second strict flag
    "paths": { /* ... */ }
  }
}
```

**Per Feature Tasks**:
1. Create repository
2. Create Valibot schemas
3. Create Server Actions
4. Refactor components
5. Write tests (80% coverage target)
6. Remove old API routes

**Deliverables**:
- ✅ 4 CRUD features migrated
- ✅ 80%+ test coverage per feature
- ✅ Old API routes removed

---

### **Phase 4: Advanced Features** (Weeks 11-13)

**Goal**: Migrate complex features

**Features**:
1. timeslot-configuration
2. lock-timeslot
3. export-schedules (PDF/Excel)

**TypeScript Config Updates** (Phase 4 - strictFunctionTypes):
```json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictFunctionTypes": true,  // Enable third strict flag
    "paths": { /* ... */ }
  }
}
```

**Special Considerations**:
- Export features need server-side rendering
- PDF generation requires careful testing
- Excel generation must be deterministic

**Deliverables**:
- ✅ 3 advanced features migrated
- ✅ Export functionality working correctly
- ✅ 85%+ test coverage

---

### **Phase 5: Polish & Production** (Week 14)

**Goal**: Production-ready application

**Tasks**:
1. ✅ Enable full TypeScript strict mode
2. ✅ Fix all TypeScript errors
3. ✅ Performance optimization
4. ✅ Error handling improvements
5. ✅ Loading states and skeletons
6. ✅ Documentation updates
7. ✅ Final E2E test suite
8. ✅ Deployment preparation

**TypeScript Config Updates** (Phase 5 - Full strict mode):
```json
{
  "compilerOptions": {
    "strict": true,  // Enable ALL strict flags
    "paths": { /* ... */ }
  }
}
```

**Performance Checklist**:
- ✅ Lazy load heavy components
- ✅ Optimize bundle size
- ✅ Add React.memo where needed
- ✅ Optimize database queries
- ✅ Add proper loading states

**Deliverables**:
- ✅ Full TypeScript strict mode enabled
- ✅ Zero TypeScript errors
- ✅ Performance optimized
- ✅ All tests passing
- ✅ Production deployment ready

---

## 🧪 TESTING STRATEGY

### Coverage Targets
```
Domain Services:        95%+ (critical business logic)
Repositories:          80%+ (data access)
Server Actions:        85%+ (user-facing operations)
UI Components:         70%+ (visual elements)

SPECIAL: Conflict Detection = 100% (cannot break)
```

### Testing Pyramid

```
       E2E Tests (10%)
     ───────────────
    Integration Tests (30%)
   ───────────────────────
  Unit Tests (60%)
 ───────────────────────────
```

### Example: Conflict Detector Tests

```typescript
// features/schedule-arrangement/domain/services/__tests__/conflict-detector.test.ts

import { describe, it, expect } from '@jest/globals';
import { checkTeacherConflict, checkAllConflicts } from '../conflict-detector.service';

describe('Conflict Detector', () => {
  describe('checkTeacherConflict', () => {
    it('should detect teacher conflict', () => {
      const existingSchedules = [
        {
          teacherId: 'T001',
          timeslotId: 'TS-MON-08:00',
          // ... other fields
        },
      ];

      const result = checkTeacherConflict('T001', 'TS-MON-08:00', existingSchedules);

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].type).toBe('TEACHER_CONFLICT');
    });

    it('should not detect conflict when teacher is free', () => {
      const existingSchedules = [
        {
          teacherId: 'T001',
          timeslotId: 'TS-MON-08:00',
        },
      ];

      const result = checkTeacherConflict('T001', 'TS-MON-09:00', existingSchedules);

      expect(result.hasConflict).toBe(false);
      expect(result.conflicts).toHaveLength(0);
    });

    // Table-driven tests for edge cases
    it.each([
      { teacherId: 'T001', timeslotId: 'TS-MON-08:00', schedules: [], expected: false },
      { teacherId: '', timeslotId: 'TS-MON-08:00', schedules: [], expected: false },
      { teacherId: 'T001', timeslotId: '', schedules: [], expected: false },
    ])('should handle edge case: $teacherId, $timeslotId', ({ teacherId, timeslotId, schedules, expected }) => {
      const result = checkTeacherConflict(teacherId, timeslotId, schedules);
      expect(result.hasConflict).toBe(expected);
    });
  });

  describe('checkAllConflicts', () => {
    it('should detect multiple conflicts', () => {
      const existingSchedules = [
        { teacherId: 'T001', roomId: 'R001', gradeId: 'G1', timeslotId: 'TS-MON-08:00' },
      ];

      const result = checkAllConflicts('T001', 'R001', 'G2', 'TS-MON-08:00', existingSchedules);

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts.length).toBeGreaterThan(1);
    });
  });
});
```

---

## 📊 SUCCESS METRICS

### Code Quality
- ✅ TypeScript strict mode enabled
- ✅ Zero `any` types in new code
- ✅ 85%+ overall test coverage
- ✅ 100% conflict detection coverage
- ✅ Zero ESLint errors
- ✅ All Prettier formatted

### Performance
- ✅ Page load < 3s
- ✅ API response < 500ms
- ✅ Bundle size < 500KB (main)
- ✅ Lighthouse score > 90

### Architecture
- ✅ Clear separation of concerns
- ✅ Pure functions in domain layer
- ✅ No business logic in components
- ✅ No Prisma calls in Server Actions (use repositories)
- ✅ UI state in Zustand, server state in SWR

---

## 🎯 BEST PRACTICES CHECKLIST

### Must Follow
- ✅ **Pure Functions**: Domain services have no side effects
- ✅ **Single Responsibility**: Each module does one thing
- ✅ **Dependency Inversion**: Depend on abstractions, not concretions
- ✅ **Type Safety**: Use Valibot for runtime validation
- ✅ **Error Handling**: Graceful error handling with user-friendly messages
- ✅ **Idempotency**: Database operations safe to retry
- ✅ **Testing**: Test-first for critical business logic
- ✅ **Documentation**: JSDoc for public functions

### Code Style
- ✅ **Functional**: Prefer pure functions over classes
- ✅ **Immutable**: Use const, avoid let where possible
- ✅ **Explicit**: Explicit return types on functions
- ✅ **Minimal**: Remove unused code progressively
- ✅ **Consistent**: Follow existing patterns

---

## 🚀 GETTING STARTED

### Next Steps
1. Review this plan
2. Ask questions/clarifications
3. Start Phase 1 implementation
4. Commit early and often
5. Test continuously

### Ready to Begin?
Let's start with Phase 1! 🎉
