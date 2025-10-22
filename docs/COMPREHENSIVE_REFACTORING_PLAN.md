# Comprehensive Refactoring Plan: Feature-Based Clean Architecture

> **Generated**: October 21, 2025  
> **Project**: School Timetable Management System  
> **Objective**: Reorganize codebase using Feature-Based Architecture with Clean Architecture principles

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Proposed Architecture](#proposed-architecture)
4. [New Folder Structure](#new-folder-structure)
5. [Technology Stack Updates](#technology-stack-updates)
6. [Implementation Examples](#implementation-examples)
7. [Migration Strategy](#migration-strategy)
8. [Testing Strategy](#testing-strategy)
9. [Success Metrics](#success-metrics)
10. [Additional Improvements](#additional-improvements)

---

## Executive Summary

### Current Problems

1. **API Routes**: Mix HTTP concerns with Prisma queries and business logic (e.g., POST /api/arrange: 140 lines)
2. **Frontend Components**: Tightly coupled UI state, data fetching, and domain logic (34+ useState in teacher-arrange)
3. **Inconsistent Patterns**: Scattered SWR calls, no centralized state management
4. **Weak TypeScript**: `strict: false`, widespread `any` usage
5. **Poor Testability**: Business logic embedded in routes/components

### Proposed Solution

**Feature-Based Clean Architecture** with:
- **Domain Layer**: Pure business logic (conflict checks, validation)
- **Application Layer**: Use cases and orchestration (Server Actions)
- **Infrastructure Layer**: Data access (Prisma repositories)
- **Presentation Layer**: UI components with Zustand state management

**Benefits**:
- ✅ Clear separation of concerns
- ✅ Highly testable (pure functions)
- ✅ Easier to maintain and extend
- ✅ Better TypeScript safety
- ✅ Consistent patterns across codebase

---

## Current Architecture Analysis

### Current API Route Example (`/api/arrange`)

```typescript
// ❌ CURRENT: Everything mixed together
export async function POST(request: NextRequest) {
    try {
        const { TeacherID, AcademicYear, Semester, Schedule } = await request.json()
        let response = { deleted: [], added: [] }

        // Direct Prisma calls
        const existing = await prisma.class_schedule.findMany({...})
        
        // Business logic mixed with data access
        const existingMap = new Map(existing.map(schedule => [...]))
        
        for (const schedule of Schedule) {
            if (schedule.subject.IsLocked) continue
            // More business logic...
            if (Object.keys(schedule.subject).length == 0) {
                const deletedSchedule = await prisma.class_schedule.delete({...})
            }
            // 100+ more lines...
        }
        return NextResponse.json({ ...response, Schedule: Schedule })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
```

**Problems**:
- HTTP handling + data access + business logic in one function
- No validation
- Difficult to test
- No type safety for input/output
- Poor error handling

### Current Component Example (`teacher-arrange/page.tsx`)

```typescript
// ❌ CURRENT: Too many concerns
export default function TeacherArrange() {
  const [teacherData, setTeacherData] = useState()
  const [timeSlotData, setTimeSlotData] = useState()
  const [showErrorMsgByTimeslotID, setShowErrorMsgByTimeslotID] = useState()
  const [isSaving, setIsSaving] = useState(false)
  const [isSelectedToAdd, setIsSelectedToAdd] = useState(false)
  const [storeSelectedSubject, setStoreSelectedSubject] = useState()
  // ... 28+ more useState calls
  
  // Manual data fetching
  const fetchTeacherDatabyID = async () => {
    const response = await axios.get(`/api/teacher`)
    setTeacherData(response.data)
  }
  
  // Business logic in component
  const checkBreakTime = (timeslot) => {
    // conflict checking logic...
  }
  
  // Complex state updates
  const changeTimeSlotSubject = async () => {
    setIsSaving(true)
    // ... complex logic
  }
  
  return <div>{/* 500+ lines of JSX */}</div>
}
```

**Problems**:
- UI state + server state + business logic all mixed
- No separation between presentation and domain
- Difficult to test
- Poor performance (too many re-renders)

---

## Proposed Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (React)          │
│  Components, Pages, Zustand Stores (UI)    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│       Application Layer (Use Cases)         │
│   Server Actions, Business Orchestration   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Domain Layer (Pure Logic)           │
│  Entities, Value Objects, Domain Services   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│    Infrastructure Layer (External)          │
│    Prisma, APIs, Storage, Email, etc.      │
└─────────────────────────────────────────────┘
```

### Feature-Based Organization

Instead of organizing by type (components, hooks, api), organize by **feature/domain**:

```
src/features/
  ├── schedule-arrangement/
  │   ├── domain/           # Pure business logic
  │   ├── application/      # Server Actions & use cases
  │   ├── infrastructure/   # Data access
  │   └── presentation/     # UI components & state
  ├── teacher-management/
  ├── room-management/
  └── conflict-detection/
```

---

## New Folder Structure

### Complete Structure

```
src/
├── features/                      # Feature-based modules
│   ├── schedule-arrangement/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── schedule.entity.ts          # Schedule domain model
│   │   │   │   ├── timeslot.entity.ts
│   │   │   │   └── responsibility.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── class-id.vo.ts              # Value objects
│   │   │   │   ├── timeslot-id.vo.ts
│   │   │   │   └── academic-period.vo.ts
│   │   │   ├── services/
│   │   │   │   ├── conflict-detector.service.ts # Pure conflict logic
│   │   │   │   ├── schedule-differ.service.ts   # Diffing logic
│   │   │   │   └── schedule-validator.service.ts
│   │   │   └── types/
│   │   │       ├── schedule.types.ts
│   │   │       └── conflict.types.ts
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── arrange-schedule.usecase.ts  # Business orchestration
│   │   │   │   ├── validate-arrangement.usecase.ts
│   │   │   │   └── lock-timeslot.usecase.ts
│   │   │   ├── actions/
│   │   │   │   ├── arrange-schedule.action.ts   # Server Actions
│   │   │   │   ├── validate-arrangement.action.ts
│   │   │   │   └── lock-timeslot.action.ts
│   │   │   ├── dto/
│   │   │   │   ├── arrange-schedule.dto.ts      # Data Transfer Objects
│   │   │   │   └── validation-result.dto.ts
│   │   │   └── schemas/
│   │   │       ├── arrange-schedule.schema.ts   # Zod validation schemas
│   │   │       └── lock-timeslot.schema.ts
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   │   ├── schedule.repository.ts       # Data access
│   │   │   │   ├── timeslot.repository.ts
│   │   │   │   └── responsibility.repository.ts
│   │   │   ├── mappers/
│   │   │   │   ├── schedule.mapper.ts           # Prisma ↔ Domain
│   │   │   │   └── timeslot.mapper.ts
│   │   │   └── cache/
│   │   │       └── schedule.cache.ts
│   │   └── presentation/
│   │       ├── components/
│   │       │   ├── TeacherArrangeView.tsx       # Main view
│   │       │   ├── TimetableGrid.tsx
│   │       │   ├── SubjectDragBox.tsx
│   │       │   └── TimeSlotCell.tsx
│   │       ├── stores/
│   │       │   ├── arrangement-ui.store.ts      # Zustand UI state
│   │       │   └── drag-drop.store.ts
│   │       ├── hooks/
│   │       │   ├── use-arrange-schedule.ts      # Custom hooks
│   │       │   ├── use-timeslot-data.ts
│   │       │   └── use-conflict-check.ts
│   │       └── utils/
│   │           ├── timeslot.utils.ts
│   │           └── drag-drop.utils.ts
│   │
│   ├── teacher-management/
│   │   ├── domain/
│   │   │   ├── entities/teacher.entity.ts
│   │   │   ├── services/teacher-validator.service.ts
│   │   │   └── types/teacher.types.ts
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── create-teacher.usecase.ts
│   │   │   │   ├── update-teacher.usecase.ts
│   │   │   │   └── delete-teacher.usecase.ts
│   │   │   ├── actions/
│   │   │   │   ├── create-teacher.action.ts
│   │   │   │   └── update-teacher.action.ts
│   │   │   └── schemas/teacher.schema.ts
│   │   ├── infrastructure/
│   │   │   └── repositories/teacher.repository.ts
│   │   └── presentation/
│   │       ├── components/TeacherTable.tsx
│   │       ├── stores/teacher-ui.store.ts
│   │       └── hooks/use-teachers.ts
│   │
│   ├── room-management/
│   │   └── [similar structure]
│   │
│   ├── conflict-detection/
│   │   ├── domain/
│   │   │   ├── rules/
│   │   │   │   ├── teacher-conflict.rule.ts     # Pure conflict rules
│   │   │   │   ├── room-conflict.rule.ts
│   │   │   │   └── class-conflict.rule.ts
│   │   │   ├── services/
│   │   │   │   └── conflict-engine.service.ts
│   │   │   └── types/conflict.types.ts
│   │   └── [other layers]
│   │
│   └── authentication/
│       └── [similar structure]
│
├── shared/                        # Shared utilities
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client
│   │   ├── auth.ts               # Auth utilities
│   │   └── axios.ts              # HTTP client
│   ├── types/
│   │   ├── common.types.ts       # Common types
│   │   └── prisma.types.ts       # Generated Prisma types
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── validation.utils.ts
│   │   └── error.utils.ts
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── error-messages.ts
│   │   └── api-endpoints.ts
│   └── components/               # Truly shared UI components
│       ├── Button.tsx
│       ├── TextField.tsx
│       └── ErrorBoundary.tsx
│
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── signin/
│   │       └── page.tsx          # Auth pages
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       └── [semesterAndyear]/
│   │           ├── page.tsx      # Uses features
│   │           └── layout.tsx
│   ├── (management)/
│   │   └── management/
│   │       ├── teacher/
│   │       │   └── page.tsx      # Uses teacher-management feature
│   │       └── rooms/
│   │           └── page.tsx
│   ├── (schedule)/
│   │   └── schedule/
│   │       └── [semesterAndyear]/
│   │           ├── arrange/
│   │           │   └── teacher-arrange/
│   │           │       └── page.tsx  # Uses schedule-arrangement feature
│   │           └── config/
│   │               └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
└── middleware.ts
```

### Key Principles

1. **Feature Isolation**: Each feature is self-contained with all its layers
2. **Dependency Rule**: Inner layers don't depend on outer layers
3. **Shared Module**: Only truly reusable code goes here
4. **App Directory**: Only routing and page composition

---

## Technology Stack Updates

### 1. Zustand for Client State Management

**Installation**:
```bash
pnpm add zustand
```

**Use Cases**:
- UI state (modals, dropdowns, selected items)
- Client-side caching of server data
- Optimistic updates
- Form state
- Drag-and-drop state

### 2. Server Actions for Mutations

**Use Cases**:
- All data mutations (Create, Update, Delete)
- Form submissions
- Complex business operations

**Benefits**:
- Type-safe end-to-end
- No API route boilerplate
- Automatic caching integration
- Progressive enhancement

### 3. Strong TypeScript

**Changes**:
```jsonc
{
  "compilerOptions": {
    "strict": true,              // Enable all strict checks
    "noUnusedLocals": true,      // Error on unused variables
    "noUnusedParameters": true,  // Error on unused parameters
    "noImplicitReturns": true,   // All code paths must return
    "noFallthroughCasesInSwitch": true
  }
}
```

### 4. Zod for Validation

**Installation**:
```bash
pnpm add zod
```

**Use Cases**:
- Server Action input validation
- Form validation
- API response validation
- Type generation

### 5. React Query (Optional, for Server State)

**Installation** (if needed for advanced caching):
```bash
pnpm add @tanstack/react-query
```

---

## Implementation Examples

### Example 1: Schedule Arrangement Feature

#### 1.1 Domain Layer (Pure Business Logic)

**`features/schedule-arrangement/domain/services/conflict-detector.service.ts`**

```typescript
import type { ClassSchedule, Timeslot, Teacher } from '@prisma/client';

export type ConflictType = 'TEACHER' | 'ROOM' | 'CLASS' | 'LOCKED' | 'BREAK';

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: ConflictType;
    message: string;
    affectedEntities: string[];
  }>;
}

export interface ScheduleArrangement {
  timeslotId: string;
  subjectCode: string;
  gradeId: string;
  teacherId: string;
  roomId: number | null;
}

/**
 * Pure function: Checks if a teacher is already assigned to another class in the same timeslot
 */
export function checkTeacherConflict(
  arrangement: ScheduleArrangement,
  existingSchedules: ClassSchedule[],
  teachers: Teacher[],
): ConflictResult {
  const conflicts: ConflictResult['conflicts'] = [];

  // Find existing schedules for this teacher in the same timeslot
  const teacherSchedules = existingSchedules.filter(
    (schedule) =>
      schedule.TimeslotID === arrangement.timeslotId &&
      schedule.teachers_responsibility.some(
        (resp) => resp.TeacherID === arrangement.teacherId
      )
  );

  if (teacherSchedules.length > 0) {
    const teacher = teachers.find((t) => t.TeacherID === arrangement.teacherId);
    conflicts.push({
      type: 'TEACHER',
      message: `ครู ${teacher?.Firstname} ${teacher?.Lastname} มีคาบสอนซ้ำในช่วงเวลานี้`,
      affectedEntities: teacherSchedules.map((s) => s.ClassID),
    });
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Pure function: Checks if a class already has a subject in the same timeslot
 */
export function checkClassConflict(
  arrangement: ScheduleArrangement,
  existingSchedules: ClassSchedule[],
): ConflictResult {
  const conflicts: ConflictResult['conflicts'] = [];

  const classSchedules = existingSchedules.filter(
    (schedule) =>
      schedule.TimeslotID === arrangement.timeslotId &&
      schedule.GradeID === arrangement.gradeId
  );

  if (classSchedules.length > 0) {
    conflicts.push({
      type: 'CLASS',
      message: `ชั้น ${arrangement.gradeId} มีรายวิชาในช่วงเวลานี้แล้ว`,
      affectedEntities: classSchedules.map((s) => s.ClassID),
    });
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Pure function: Checks if a room is already occupied in the same timeslot
 */
export function checkRoomConflict(
  arrangement: ScheduleArrangement,
  existingSchedules: ClassSchedule[],
): ConflictResult {
  const conflicts: ConflictResult['conflicts'] = [];

  if (arrangement.roomId === null) {
    return { hasConflict: false, conflicts: [] };
  }

  const roomSchedules = existingSchedules.filter(
    (schedule) =>
      schedule.TimeslotID === arrangement.timeslotId &&
      schedule.RoomID === arrangement.roomId
  );

  if (roomSchedules.length > 0) {
    conflicts.push({
      type: 'ROOM',
      message: `ห้อง ${arrangement.roomId} ถูกใช้งานในช่วงเวลานี้แล้ว`,
      affectedEntities: roomSchedules.map((s) => s.ClassID),
    });
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Pure function: Checks if the timeslot is locked
 */
export function checkLockedTimeslot(
  arrangement: ScheduleArrangement,
  existingSchedules: ClassSchedule[],
): ConflictResult {
  const conflicts: ConflictResult['conflicts'] = [];

  const lockedSchedule = existingSchedules.find(
    (schedule) =>
      schedule.TimeslotID === arrangement.timeslotId &&
      schedule.IsLocked === true
  );

  if (lockedSchedule) {
    conflicts.push({
      type: 'LOCKED',
      message: 'ช่วงเวลานี้ถูกล็อกไว้แล้ว',
      affectedEntities: [lockedSchedule.ClassID],
    });
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Pure function: Checks if the timeslot is a break time
 */
export function checkBreakTime(
  arrangement: ScheduleArrangement,
  timeslots: Timeslot[],
): ConflictResult {
  const conflicts: ConflictResult['conflicts'] = [];

  const timeslot = timeslots.find((t) => t.TimeslotID === arrangement.timeslotId);

  if (timeslot?.BreakTime) {
    conflicts.push({
      type: 'BREAK',
      message: 'ไม่สามารถจัดคาบเรียนในช่วงพักได้',
      affectedEntities: [],
    });
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Main conflict checker: Combines all conflict checks
 */
export function checkAllConflicts(
  arrangement: ScheduleArrangement,
  existingSchedules: ClassSchedule[],
  teachers: Teacher[],
  timeslots: Timeslot[],
): ConflictResult {
  const allConflicts: ConflictResult['conflicts'] = [];

  // Run all conflict checks
  const checks = [
    checkTeacherConflict(arrangement, existingSchedules, teachers),
    checkClassConflict(arrangement, existingSchedules),
    checkRoomConflict(arrangement, existingSchedules),
    checkLockedTimeslot(arrangement, existingSchedules),
    checkBreakTime(arrangement, timeslots),
  ];

  // Collect all conflicts
  checks.forEach((check) => {
    if (check.hasConflict) {
      allConflicts.push(...check.conflicts);
    }
  });

  return {
    hasConflict: allConflicts.length > 0,
    conflicts: allConflicts,
  };
}
```

**Benefits**:
- ✅ Pure functions (easy to test)
- ✅ No dependencies on external systems
- ✅ Reusable across different contexts
- ✅ Clear, focused responsibility

#### 1.2 Infrastructure Layer (Data Access)

**`features/schedule-arrangement/infrastructure/repositories/schedule.repository.ts`**

```typescript
import { prisma } from '@/shared/lib/prisma';
import type { ClassSchedule, Prisma } from '@prisma/client';

export interface ScheduleFilter {
  teacherId?: string;
  gradeId?: string;
  academicYear: number;
  semester: number;
  isLocked?: boolean;
}

export interface ScheduleWithRelations extends ClassSchedule {
  teachers_responsibility: Array<{
    TeacherID: string;
    RespID: string;
  }>;
  timeslot: {
    TimeslotID: string;
    DayOfWeek: string;
    StartTime: string;
    EndTime: string;
    BreakTime: boolean;
  };
  subject: {
    SubjectCode: string;
    SubjectName: string;
  };
  room: {
    RoomID: number;
    RoomName: string;
  } | null;
}

/**
 * Repository for schedule data access
 */
export class ScheduleRepository {
  /**
   * Find schedules with filters
   */
  async findMany(filter: ScheduleFilter): Promise<ScheduleWithRelations[]> {
    const where: Prisma.class_scheduleWhereInput = {
      timeslot: {
        AcademicYear: filter.academicYear,
        Semester: filter.semester,
      },
    };

    if (filter.teacherId) {
      where.teachers_responsibility = {
        some: {
          TeacherID: filter.teacherId,
        },
      };
    }

    if (filter.gradeId) {
      where.GradeID = filter.gradeId;
    }

    if (filter.isLocked !== undefined) {
      where.IsLocked = filter.isLocked;
    }

    return prisma.class_schedule.findMany({
      where,
      include: {
        teachers_responsibility: {
          select: {
            TeacherID: true,
            RespID: true,
          },
        },
        timeslot: {
          select: {
            TimeslotID: true,
            DayOfWeek: true,
            StartTime: true,
            EndTime: true,
            BreakTime: true,
          },
        },
        subject: {
          select: {
            SubjectCode: true,
            SubjectName: true,
          },
        },
        room: {
          select: {
            RoomID: true,
            RoomName: true,
          },
        },
      },
    });
  }

  /**
   * Create a new schedule
   */
  async create(data: {
    classId: string;
    timeslotId: string;
    subjectCode: string;
    gradeId: string;
    roomId: number | null;
    respId: string;
  }): Promise<ClassSchedule> {
    return prisma.class_schedule.create({
      data: {
        ClassID: data.classId,
        TimeslotID: data.timeslotId,
        SubjectCode: data.subjectCode,
        GradeID: data.gradeId,
        RoomID: data.roomId,
        IsLocked: false,
        teachers_responsibility: {
          connect: {
            RespID: data.respId,
          },
        },
      },
    });
  }

  /**
   * Delete a schedule by ClassID
   */
  async delete(classId: string): Promise<ClassSchedule> {
    return prisma.class_schedule.delete({
      where: {
        ClassID: classId,
      },
    });
  }

  /**
   * Delete multiple schedules
   */
  async deleteMany(classIds: string[]): Promise<{ count: number }> {
    return prisma.class_schedule.deleteMany({
      where: {
        ClassID: {
          in: classIds,
        },
      },
    });
  }

  /**
   * Update a schedule
   */
  async update(
    classId: string,
    data: Partial<{
      timeslotId: string;
      roomId: number | null;
    }>
  ): Promise<ClassSchedule> {
    return prisma.class_schedule.update({
      where: {
        ClassID: classId,
      },
      data: {
        ...(data.timeslotId && { TimeslotID: data.timeslotId }),
        ...(data.roomId !== undefined && { RoomID: data.roomId }),
      },
    });
  }
}

// Export singleton instance
export const scheduleRepository = new ScheduleRepository();
```

#### 1.3 Application Layer (Server Actions)

**`features/schedule-arrangement/application/schemas/arrange-schedule.schema.ts`**

```typescript
import { z } from 'zod';

export const arrangeScheduleSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  academicYear: z.number().int().positive(),
  semester: z.number().int().min(1).max(2),
  schedules: z.array(
    z.object({
      timeslotId: z.string(),
      subject: z
        .object({
          subjectCode: z.string().optional(),
          gradeId: z.string().optional(),
          respId: z.string().optional(),
          roomId: z.number().nullable().optional(),
          classId: z.string().optional(),
          isLocked: z.boolean().optional(),
        })
        .optional(),
    })
  ),
});

export type ArrangeScheduleInput = z.infer<typeof arrangeScheduleSchema>;
```

**`features/schedule-arrangement/application/actions/arrange-schedule.action.ts`**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { arrangeScheduleSchema } from '../schemas/arrange-schedule.schema';
import { scheduleRepository } from '../../infrastructure/repositories/schedule.repository';
import { checkAllConflicts } from '../../domain/services/conflict-detector.service';
import { prisma } from '@/shared/lib/prisma';

export interface ArrangeScheduleResult {
  success: boolean;
  deleted: string[];
  added: string[];
  errors?: Array<{ message: string; field?: string }>;
}

/**
 * Server Action: Arrange teacher schedule
 * 
 * This replaces the POST /api/arrange route
 */
export async function arrangeScheduleAction(
  input: z.infer<typeof arrangeScheduleSchema>
): Promise<ArrangeScheduleResult> {
  try {
    // 1. Validate input
    const validated = arrangeScheduleSchema.parse(input);

    // 2. Fetch existing schedules (for conflict checking)
    const existingSchedules = await scheduleRepository.findMany({
      teacherId: validated.teacherId,
      academicYear: validated.academicYear,
      semester: validated.semester,
      isLocked: false,
    });

    // 3. Fetch all teachers and timeslots for conflict checking
    const [teachers, timeslots] = await Promise.all([
      prisma.teacher.findMany(),
      prisma.timeslot.findMany({
        where: {
          AcademicYear: validated.academicYear,
          Semester: validated.semester,
        },
      }),
    ]);

    const deleted: string[] = [];
    const added: string[] = [];
    const errors: Array<{ message: string; field?: string }> = [];

    // 4. Create a map for quick lookup
    const existingMap = new Map(
      existingSchedules.map((s) => [s.TimeslotID, s])
    );

    // 5. Process each schedule change
    for (const schedule of validated.schedules) {
      const existingSchedule = existingMap.get(schedule.timeslotId);

      // Case 1: Empty subject = delete
      if (!schedule.subject || Object.keys(schedule.subject).length === 0) {
        if (existingSchedule) {
          await scheduleRepository.delete(existingSchedule.ClassID);
          deleted.push(existingSchedule.ClassID);
        }
        continue;
      }

      // Case 2: New subject = create
      if (!schedule.subject.classId) {
        // Check for conflicts
        const conflictCheck = checkAllConflicts(
          {
            timeslotId: schedule.timeslotId,
            subjectCode: schedule.subject.subjectCode!,
            gradeId: schedule.subject.gradeId!,
            teacherId: validated.teacherId,
            roomId: schedule.subject.roomId ?? null,
          },
          existingSchedules,
          teachers,
          timeslots
        );

        if (conflictCheck.hasConflict) {
          errors.push({
            message: conflictCheck.conflicts[0].message,
            field: schedule.timeslotId,
          });
          continue;
        }

        // Create new schedule
        const classId = `${schedule.timeslotId}-${schedule.subject.subjectCode}-${schedule.subject.gradeId}`;
        await scheduleRepository.create({
          classId,
          timeslotId: schedule.timeslotId,
          subjectCode: schedule.subject.subjectCode!,
          gradeId: schedule.subject.gradeId!,
          roomId: schedule.subject.roomId ?? null,
          respId: schedule.subject.respId!,
        });
        added.push(classId);
        continue;
      }

      // Case 3: Move to new timeslot
      if (schedule.subject.classId && existingSchedule) {
        // Delete old
        await scheduleRepository.delete(existingSchedule.ClassID);
        deleted.push(existingSchedule.ClassID);

        // Create new
        const classId = `${schedule.timeslotId}-${schedule.subject.subjectCode}-${schedule.subject.gradeId}`;
        await scheduleRepository.create({
          classId,
          timeslotId: schedule.timeslotId,
          subjectCode: schedule.subject.subjectCode!,
          gradeId: schedule.subject.gradeId!,
          roomId: schedule.subject.roomId ?? null,
          respId: schedule.subject.respId!,
        });
        added.push(classId);
      }
    }

    // 6. Revalidate cache
    revalidatePath('/schedule/[semesterAndyear]/arrange/teacher-arrange', 'page');

    return {
      success: errors.length === 0,
      deleted,
      added,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        deleted: [],
        added: [],
        errors: error.errors.map((e) => ({
          message: e.message,
          field: e.path.join('.'),
        })),
      };
    }

    console.error('Arrange schedule error:', error);
    return {
      success: false,
      deleted: [],
      added: [],
      errors: [{ message: 'เกิดข้อผิดพลาดในการจัดตาราง' }],
    };
  }
}
```

**Benefits of Server Actions**:
- ✅ Type-safe from client to server
- ✅ Automatic caching integration
- ✅ Progressive enhancement
- ✅ No API route boilerplate
- ✅ Validation with Zod
- ✅ Clear error handling

#### 1.4 Presentation Layer (UI Components + Zustand)

**`features/schedule-arrangement/presentation/stores/arrangement-ui.store.ts`**

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Subject {
  subjectCode: string;
  subjectName: string;
  gradeId: string;
  respId: string;
  roomId: number | null;
  roomName: string | null;
  classId?: string;
}

interface ArrangementUIState {
  // UI state
  isSaving: boolean;
  selectedSubject: Subject | null;
  isAddMode: boolean;
  isChangeMode: boolean;
  targetTimeslotId: string | null;
  
  // Error handling
  errors: Map<string, string>;
  
  // Modal state
  isRoomModalOpen: boolean;
  
  // Actions
  setIsSaving: (isSaving: boolean) => void;
  selectSubject: (subject: Subject | null) => void;
  setAddMode: (isAdd: boolean) => void;
  setChangeMode: (isChange: boolean) => void;
  setTargetTimeslot: (timeslotId: string | null) => void;
  setError: (timeslotId: string, error: string) => void;
  clearError: (timeslotId: string) => void;
  clearAllErrors: () => void;
  openRoomModal: () => void;
  closeRoomModal: () => void;
  reset: () => void;
}

export const useArrangementUIStore = create<ArrangementUIState>()(
  devtools(
    (set) => ({
      // Initial state
      isSaving: false,
      selectedSubject: null,
      isAddMode: false,
      isChangeMode: false,
      targetTimeslotId: null,
      errors: new Map(),
      isRoomModalOpen: false,

      // Actions
      setIsSaving: (isSaving) => set({ isSaving }),
      
      selectSubject: (subject) =>
        set({
          selectedSubject: subject,
          isAddMode: false,
          isChangeMode: false,
        }),
        
      setAddMode: (isAdd) =>
        set({
          isAddMode: isAdd,
          isChangeMode: false,
        }),
        
      setChangeMode: (isChange) =>
        set({
          isChangeMode: isChange,
          isAddMode: false,
        }),
        
      setTargetTimeslot: (timeslotId) =>
        set({ targetTimeslotId: timeslotId }),
        
      setError: (timeslotId, error) =>
        set((state) => {
          const newErrors = new Map(state.errors);
          newErrors.set(timeslotId, error);
          return { errors: newErrors };
        }),
        
      clearError: (timeslotId) =>
        set((state) => {
          const newErrors = new Map(state.errors);
          newErrors.delete(timeslotId);
          return { errors: newErrors };
        }),
        
      clearAllErrors: () => set({ errors: new Map() }),
      
      openRoomModal: () => set({ isRoomModalOpen: true }),
      closeRoomModal: () => set({ isRoomModalOpen: false }),
      
      reset: () =>
        set({
          isSaving: false,
          selectedSubject: null,
          isAddMode: false,
          isChangeMode: false,
          targetTimeslotId: null,
          errors: new Map(),
          isRoomModalOpen: false,
        }),
    }),
    { name: 'ArrangementUI' }
  )
);
```

**`features/schedule-arrangement/presentation/hooks/use-arrange-schedule.ts`**

```typescript
import { useTransition } from 'react';
import { useArrangementUIStore } from '../stores/arrangement-ui.store';
import { arrangeScheduleAction } from '../../application/actions/arrange-schedule.action';
import type { ArrangeScheduleInput } from '../../application/schemas/arrange-schedule.schema';

export function useArrangeSchedule() {
  const [isPending, startTransition] = useTransition();
  const { setIsSaving, setError, clearAllErrors } = useArrangementUIStore();

  const arrangeSchedule = async (input: ArrangeScheduleInput) => {
    setIsSaving(true);
    clearAllErrors();

    startTransition(async () => {
      const result = await arrangeScheduleAction(input);

      if (!result.success && result.errors) {
        result.errors.forEach((error) => {
          if (error.field) {
            setError(error.field, error.message);
          }
        });
      }

      setIsSaving(false);
    });
  };

  return {
    arrangeSchedule,
    isPending: isPending || useArrangementUIStore((s) => s.isSaving),
  };
}
```

**`app/(schedule)/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`**

```typescript
'use client';

import { useArrangementUIStore } from '@/features/schedule-arrangement/presentation/stores/arrangement-ui.store';
import { useArrangeSchedule } from '@/features/schedule-arrangement/presentation/hooks/use-arrange-schedule';
import { TimetableGrid } from '@/features/schedule-arrangement/presentation/components/TimetableGrid';
import { SubjectDragBox } from '@/features/schedule-arrangement/presentation/components/SubjectDragBox';

export default function TeacherArrangePage() {
  const { arrangeSchedule, isPending } = useArrangeSchedule();
  const selectedSubject = useArrangementUIStore((s) => s.selectedSubject);
  const errors = useArrangementUIStore((s) => s.errors);

  // Much simpler component - all state management is in Zustand
  // All business logic is in Server Actions
  // All conflict checking is in domain services

  return (
    <div className="flex h-screen">
      <div className="w-1/4">
        <SubjectDragBox />
      </div>
      <div className="flex-1">
        <TimetableGrid />
      </div>
      {isPending && <div>กำลังบันทึก...</div>}
    </div>
  );
}
```

**Benefits**:
- ✅ Clear separation: UI state (Zustand) vs Server state (Server Actions)
- ✅ Component is thin - just composition
- ✅ Easy to test each part independently
- ✅ Reusable stores and hooks

---

## Migration Strategy

### Phase 1: Foundation (Weeks 1-2)

**Goals**: Set up infrastructure and enable strict TypeScript

**Tasks**:
1. Create new folder structure (`src/features`, `src/shared`)
2. Install dependencies:
   ```bash
   pnpm add zustand zod
   pnpm add -D @types/react@latest
   ```
3. Update `tsconfig.json`:
   ```jsonc
   {
     "compilerOptions": {
       "strict": true,
       "paths": {
         "@/features/*": ["./src/features/*"],
         "@/shared/*": ["./src/shared/*"],
         "@/*": ["./src/*"]
       }
     }
   }
   ```
4. Fix existing TypeScript errors gradually
5. Create shared utilities and types

**Success Criteria**:
- ✅ New folder structure in place
- ✅ TypeScript strict mode enabled
- ✅ No blocking compilation errors

### Phase 2: First Feature Migration (Weeks 3-4)

**Goals**: Migrate one feature completely to validate architecture

**Feature**: `schedule-arrangement`

**Tasks**:
1. Extract domain logic (conflict detection) to pure functions
2. Create domain services with unit tests
3. Create infrastructure layer (repositories)
4. Create Server Actions to replace API routes
5. Create Zustand stores for UI state
6. Refactor components to use new architecture
7. Write comprehensive tests

**Success Criteria**:
- ✅ All conflict checks are pure, tested functions
- ✅ Server Actions replace `/api/arrange` route
- ✅ UI state managed by Zustand
- ✅ Components are thin, testable
- ✅ 80%+ test coverage for domain layer

### Phase 3: Core Features Migration (Weeks 5-8)

**Goals**: Migrate remaining core features

**Features**:
- `teacher-management`
- `room-management`
- `subject-management`
- `gradelevel-management`

**Tasks**:
1. Apply same architecture pattern to each feature
2. Create domain models and services
3. Create Server Actions
4. Create Zustand stores
5. Refactor components
6. Write tests

**Success Criteria**:
- ✅ All CRUD operations use Server Actions
- ✅ All features follow same structure
- ✅ No more `/api/` routes for these features
- ✅ Consistent error handling across features

### Phase 4: Advanced Features (Weeks 9-10)

**Goals**: Migrate complex features

**Features**:
- `timeslot-configuration`
- `lock-timeslot`
- `export-schedules`

**Tasks**:
1. Extract complex business logic to domain layer
2. Create use cases for orchestration
3. Implement Server Actions
4. Create specialized Zustand stores
5. Write comprehensive tests

**Success Criteria**:
- ✅ Complex operations are well-tested
- ✅ Clear separation of concerns
- ✅ Maintainable codebase

### Phase 5: Polish & Optimization (Weeks 11-12)

**Goals**: Improve performance and developer experience

**Tasks**:
1. Optimize Zustand store selectors
2. Implement optimistic updates where appropriate
3. Add React Query if needed for advanced caching
4. Improve error handling UI
5. Add loading skeletons
6. Performance profiling and optimization
7. Documentation updates
8. Code review and refactoring

**Success Criteria**:
- ✅ Fast, responsive UI
- ✅ Clear error messages
- ✅ Good developer experience
- ✅ Complete documentation

---

## Testing Strategy

### Domain Layer Testing

**Pure functions are easy to test!**

**`features/schedule-arrangement/domain/services/__tests__/conflict-detector.test.ts`**

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  checkTeacherConflict,
  checkClassConflict,
  checkRoomConflict,
} from '../conflict-detector.service';

describe('Conflict Detector Service', () => {
  describe('checkTeacherConflict', () => {
    it('should detect teacher conflict', () => {
      const arrangement = {
        timeslotId: 'T1',
        subjectCode: 'MATH101',
        gradeId: '4/1',
        teacherId: 'T001',
        roomId: 1,
      };

      const existingSchedules = [
        {
          ClassID: 'existing-1',
          TimeslotID: 'T1',
          teachers_responsibility: [{ TeacherID: 'T001', RespID: 'R1' }],
        },
      ];

      const teachers = [
        { TeacherID: 'T001', Firstname: 'John', Lastname: 'Doe' },
      ];

      const result = checkTeacherConflict(arrangement, existingSchedules, teachers);

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].type).toBe('TEACHER');
    });

    it('should not detect conflict for different timeslot', () => {
      const arrangement = {
        timeslotId: 'T2',
        subjectCode: 'MATH101',
        gradeId: '4/1',
        teacherId: 'T001',
        roomId: 1,
      };

      const existingSchedules = [
        {
          ClassID: 'existing-1',
          TimeslotID: 'T1',
          teachers_responsibility: [{ TeacherID: 'T001', RespID: 'R1' }],
        },
      ];

      const teachers = [
        { TeacherID: 'T001', Firstname: 'John', Lastname: 'Doe' },
      ];

      const result = checkTeacherConflict(arrangement, existingSchedules, teachers);

      expect(result.hasConflict).toBe(false);
    });
  });

  // More tests for other conflict types...
});
```

### Server Action Testing

**`features/schedule-arrangement/application/actions/__tests__/arrange-schedule.action.test.ts`**

```typescript
import { describe, it, expect, vi } from '@jest/globals';
import { arrangeScheduleAction } from '../arrange-schedule.action';

// Mock dependencies
vi.mock('../../infrastructure/repositories/schedule.repository');
vi.mock('@/shared/lib/prisma');

describe('arrangeScheduleAction', () => {
  it('should validate input', async () => {
    const result = await arrangeScheduleAction({
      teacherId: '',  // Invalid
      academicYear: 2024,
      semester: 1,
      schedules: [],
    });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should create new schedule', async () => {
    const result = await arrangeScheduleAction({
      teacherId: 'T001',
      academicYear: 2024,
      semester: 1,
      schedules: [
        {
          timeslotId: 'T1',
          subject: {
            subjectCode: 'MATH101',
            gradeId: '4/1',
            respId: 'R1',
            roomId: 1,
          },
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.added).toHaveLength(1);
  });

  // More tests...
});
```

### Component Testing

**`features/schedule-arrangement/presentation/components/__tests__/TimetableGrid.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react';
import { TimetableGrid } from '../TimetableGrid';

describe('TimetableGrid', () => {
  it('should render timeslots', () => {
    render(<TimetableGrid />);
    
    expect(screen.getByText('Monday')).toBeInTheDocument();
    // More assertions...
  });

  // More tests...
});
```

---

## Success Metrics

### Code Quality

- ✅ TypeScript strict mode enabled with no errors
- ✅ 80%+ test coverage for domain layer
- ✅ 60%+ test coverage for application layer
- ✅ Zero `any` types in new code
- ✅ ESLint passing with no warnings

### Architecture

- ✅ Clear separation of concerns (4 layers)
- ✅ Domain logic is pure and testable
- ✅ No business logic in components
- ✅ Consistent patterns across features
- ✅ DRY (Don't Repeat Yourself) achieved

### Performance

- ✅ Initial page load < 2s
- ✅ Time to Interactive < 3s
- ✅ No unnecessary re-renders
- ✅ Optimistic updates where appropriate
- ✅ Smooth drag-and-drop (60 FPS)

### Developer Experience

- ✅ Clear folder structure
- ✅ Easy to find code
- ✅ Easy to add new features
- ✅ Fast feedback loop (tests, dev server)
- ✅ Good error messages

---

## Additional Improvements

### 1. Error Handling

**Centralized Error Handler**

**`shared/utils/error.utils.ts`**

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export function handleError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  console.error('Unexpected error:', error);
  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}
```

### 2. Logging

**Structured Logging**

```bash
pnpm add pino pino-pretty
```

**`shared/lib/logger.ts`**

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }
      : undefined,
});
```

### 3. API Response Format

**Standardized Response**

**`shared/types/api-response.types.ts`**

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

### 4. Feature Flags

**For gradual rollout**

```bash
pnpm add @vercel/flags
```

**Usage**:

```typescript
import { flag } from '@vercel/flags/next';

const useNewScheduleArrangement = flag({
  key: 'new-schedule-arrangement',
  decide: () => process.env.ENABLE_NEW_ARRANGEMENT === 'true',
});

// In component:
if (useNewScheduleArrangement()) {
  // Use new feature
} else {
  // Use old feature
}
```

### 5. Performance Monitoring

```bash
pnpm add @vercel/analytics @vercel/speed-insights
```

### 6. Documentation

**Storybook for Components**

```bash
pnpm add -D @storybook/nextjs storybook
pnpm storybook init
```

**API Documentation with OpenAPI** (if keeping some API routes)

```bash
pnpm add swagger-jsdoc swagger-ui-react
```

---

## Conclusion

This comprehensive refactoring plan will transform the codebase from a tightly-coupled, hard-to-maintain structure into a clean, modular, and highly testable architecture.

**Key Takeaways**:

1. **Feature-Based Architecture**: Organize by business domain, not technical layer
2. **Clean Architecture**: Clear separation of concerns with dependency rule
3. **Zustand**: Simple, powerful state management for UI
4. **Server Actions**: Modern, type-safe way to handle mutations
5. **Strong TypeScript**: Catch errors at compile time, not runtime
6. **Pure Functions**: Testable business logic
7. **Progressive Migration**: Start small, validate, then expand

**Next Steps**:

1. Review and approve this plan
2. Start with Phase 1 (Foundation)
3. Implement first feature migration (schedule-arrangement)
4. Iterate and improve based on learnings
5. Continue with remaining features

**Questions? Adjustments?** Let me know what you'd like to modify or clarify!
