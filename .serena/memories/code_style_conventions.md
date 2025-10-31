# Code Style & Conventions - School Timetable System

**Last Updated:** October 31, 2025

## General Principles

1. **TypeScript First**: All files use `.ts` or `.tsx` extensions
2. **Server Components Default**: Use Client Components only when needed
3. **Clean Architecture**: Feature-based structure with clear layer separation
4. **Type Safety**: Minimize `any` usage; use explicit types
5. **Functional Programming**: Prefer pure functions, immutability
6. **Convention over Configuration**: Follow established patterns

## Feature Structure (Clean Architecture)

### Standard Layout ✅
```
features/{domain}/
├── application/         # Use cases & orchestration
│   ├── actions/        # Server Actions (primary API)
│   │   └── {domain}.actions.ts
│   └── schemas/        # Valibot validation schemas
│       └── {domain}.schemas.ts
├── domain/             # Business logic (pure)
│   └── services/
│       └── {domain}-validation.service.ts
├── infrastructure/     # External dependencies
│   └── repositories/   # Database access (Prisma)
│       └── {domain}.repository.ts
└── presentation/       # UI layer (optional)
    ├── components/
    ├── hooks/
    └── stores/
```

### Layer Responsibilities

**Application Layer**
- Server Actions (`createAction` wrapper)
- Input validation (Valibot schemas)
- Orchestration (call domain → infrastructure)
- Error handling (ActionResult pattern)

**Domain Layer**
- Pure business logic functions
- Validation services
- Type definitions
- NO external dependencies (Prisma, fetch, etc.)

**Infrastructure Layer**
- Prisma database operations
- Repository pattern
- External API calls
- File system access

**Presentation Layer**
- React components (Client/Server)
- Custom hooks
- Zustand stores
- UI state management

## Server Actions Pattern (✅ Primary API)

### 1. Repository (Infrastructure)
```typescript
// features/teacher/infrastructure/repositories/teacher.repository.ts
import prisma from "@/lib/prisma";

export const teacherRepository = {
  async findById(id: string) {
    return await prisma.teacher.findUnique({
      where: { TeacherID: id },
    });
  },

  async findByTerm(academicYear: string, semester: string) {
    return await prisma.teacher.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: semester,
      },
      orderBy: { Name: 'asc' },
    });
  },
};
```

**Conventions:**
- Export plain object (not class)
- One method per query pattern
- Use Prisma types (no manual typing)
- Include `orderBy` for consistent results

### 2. Schema (Application)
```typescript
// features/teacher/application/schemas/teacher.schemas.ts
import * as v from "valibot";

export const getTeacherByIdSchema = v.object({
  TeacherID: v.pipe(
    v.string(),
    v.minLength(1, 'รหัสครูห้ามว่าง')
  ),
});

export type GetTeacherByIdInput = v.InferInput<typeof getTeacherByIdSchema>;
```

**Conventions:**
- Use Valibot (not Zod)
- Export schema AND inferred type
- Thai error messages for user-facing errors
- English for developer errors
- Use `v.pipe()` for chained validations

### 3. Server Action (Application)
```typescript
// features/teacher/application/actions/teacher.actions.ts
'use server';

import { createAction } from "@/shared/lib/action-wrapper";
import { teacherRepository } from "../../infrastructure/repositories/teacher.repository";
import { getTeacherByIdSchema, type GetTeacherByIdInput } from "../schemas/teacher.schemas";

export const getTeacherByIdAction = createAction(
  getTeacherByIdSchema,
  async (input: GetTeacherByIdInput) => {
    const teacher = await teacherRepository.findById(input.TeacherID);
    return teacher;
  }
);
```

**Conventions:**
- File MUST start with `'use server';`
- Use `createAction` wrapper (handles ActionResult)
- Import schema and inferred type
- Async function body
- Return raw data (wrapper handles success/error)

### 4. ActionResult Type
```typescript
// shared/lib/action-wrapper.ts
export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function createAction<TInput, TOutput>(
  schema: any,
  handler: (input: TInput) => Promise<TOutput>
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      const validated = v.parse(schema, input);
      const result = await handler(validated);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };
}
```

### 5. Usage in Component
```typescript
// Component (Client Component)
'use client';

import useSWR from 'swr';
import { getTeacherByIdAction } from "@/features/teacher/application/actions/teacher.actions";

export default function TeacherProfile({ teacherId }: { teacherId: string }) {
  const { data, error, isLoading } = useSWR(
    ['teacher-by-id', teacherId],
    async ([, id]) => await getTeacherByIdAction({ TeacherID: id })
  );

  // Unwrap ActionResult
  if (data && 'success' in data && data.success && data.data) {
    const teacher = data.data;
    return <div>{teacher.Name}</div>;
  }

  if (error || (data && !data.success)) {
    return <div>Error loading teacher</div>;
  }

  return <div>Loading...</div>;
}
```

## ActionResult Unwrapping Patterns

### Pattern 1: Direct in Render
```typescript
if (data && 'success' in data && data.success && data.data) {
  const actualData = data.data;
  // Use actualData
}
```

### Pattern 2: In useMemo
```typescript
const processedData = useMemo(() => {
  if (data && 'success' in data && data.success && data.data) {
    return data.data.map(item => transform(item));
  }
  return [];
}, [data]);
```

### Pattern 3: In useEffect
```typescript
useEffect(() => {
  if (data && 'success' in data && data.success && data.data) {
    setState(data.data);
  }
}, [data]);
```

### Pattern 4: In Event Handler
```typescript
const handleExport = () => {
  if (teacherResponse && 'success' in teacherResponse && 
      teacherResponse.success && teacherResponse.data) {
    exportTeacherTable(teacherResponse.data);
  }
};
```

### Pattern 5: Helper Function
```typescript
function getSubjectsByCategory(category: string) {
  if (programData && 'success' in programData && 
      programData.success && programData.data) {
    return programData.data.subjects.filter(s => s.Category === category);
  }
  return [];
}
```

## Global State Management

### 1. Semester State (✅ Standard Pattern)
```typescript
// hooks/useSemesterSync.ts
import { useSemesterStore } from "@/stores/semester-store";

export function useSemesterSync(configId: string) {
  const { semester, academicYear, setSemester, setAcademicYear } = useSemesterStore();

  useEffect(() => {
    const [semesterPart, yearPart] = configId.split("-");
    if (semesterPart && yearPart) {
      setSemester(semesterPart);
      setAcademicYear(yearPart);
    }
  }, [configId]);

  return { semester, academicYear };
}

// Usage in ALL components with dynamic routes
const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
```

**DO NOT:**
```typescript
// ❌ Manual parsing (deprecated)
const [semester, academicYear] = params.semesterAndyear.split("-");
```

**DO:**
```typescript
// ✅ Use hook (standard)
const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
```

### 2. Zustand Store Pattern
```typescript
// stores/semester-store.ts
import { create } from 'zustand';

interface SemesterState {
  semester: string;
  academicYear: string;
  setSemester: (semester: string) => void;
  setAcademicYear: (year: string) => void;
}

export const useSemesterStore = create<SemesterState>((set) => ({
  semester: "",
  academicYear: "",
  setSemester: (semester) => set({ semester }),
  setAcademicYear: (academicYear) => set({ academicYear }),
}));
```

## Component Patterns

### Server Component (Default)
```typescript
// app/dashboard/[semesterAndyear]/page.tsx
import { getDataAction } from "@/features/domain/application/actions";

export default async function Page({ params }: { params: { semesterAndyear: string } }) {
  const [semester, year] = params.semesterAndyear.split("-");
  const result = await getDataAction({ semester, year });

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return <div>{JSON.stringify(result.data)}</div>;
}
```

**When to Use:**
- Default choice
- No interactive state
- No browser APIs needed
- Can fetch data directly

### Client Component
```typescript
'use client';

import { useState } from 'react';
import { updateDataAction } from "@/features/domain/application/actions";

export default function InteractiveForm() {
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    const result = await updateDataAction({ value });
    if (result.success) {
      alert("Success!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**When to Use:**
- useState, useEffect, etc.
- Event handlers
- Browser APIs (localStorage, window, etc.)
- Third-party libraries requiring `window`

## Naming Conventions

### Files
- **Components**: `PascalCase.tsx` (e.g., `TeacherCard.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useSemesterSync.ts`)
- **Utils**: `kebab-case.ts` (e.g., `format-date.ts`)
- **Actions**: `{domain}.actions.ts` (e.g., `teacher.actions.ts`)
- **Schemas**: `{domain}.schemas.ts` (e.g., `teacher.schemas.ts`)
- **Repositories**: `{domain}.repository.ts` (e.g., `teacher.repository.ts`)

### Variables & Functions
- **Variables**: `camelCase` (e.g., `teacherId`, `semesterConfig`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_PERIODS`, `DEFAULT_DURATION`)
- **Functions**: `camelCase` (e.g., `formatTeacherName`, `validateTimeslot`)
- **Components**: `PascalCase` (e.g., `TeacherCard`, `ScheduleGrid`)
- **Types/Interfaces**: `PascalCase` (e.g., `Teacher`, `TimeslotConfig`)

### Database Fields
- **Primary Keys**: `{Entity}ID` (e.g., `TeacherID`, `SubjectID`)
- **Foreign Keys**: Match referenced PK (e.g., `TeacherID` references `teacher.TeacherID`)
- **Booleans**: Prefix with `is`, `has`, `can` (e.g., `isActive`, `hasConflict`)
- **Dates**: Suffix with `Date` or `At` (e.g., `CreatedAt`, `ExpiryDate`)

## TypeScript Patterns

### Type Imports
```typescript
// ✅ Use type-only imports when possible
import type { Teacher } from "@/prisma/generated";
import { type GetTeacherInput } from "../schemas/teacher.schemas";

// ❌ Avoid mixing types and values in one import
import { Teacher, getTeacherByIdSchema } from "...";
```

### Prisma Types
```typescript
// ✅ Use Prisma-generated types
import type { teacher, subject } from "@/prisma/generated";

// For complex queries with includes
type TeacherWithSubjects = teacher & {
  assigned_subject: (assigned_subject & {
    subject: subject;
  })[];
};

// ❌ Don't manually define DB entity types
interface Teacher {
  TeacherID: string;
  Name: string;
  // ... manual fields
}
```

### Function Types
```typescript
// ✅ Explicit return types for public functions
export async function getTeachers(): Promise<teacher[]> {
  return await teacherRepository.findAll();
}

// ✅ Inferred for simple internal functions
const formatName = (teacher: teacher) => `${teacher.Name} ${teacher.Surname}`;
```

## Error Handling

### Server Actions (Automatic)
```typescript
// ✅ Let createAction handle errors
export const getDataAction = createAction(
  schema,
  async (input) => {
    // Throws get caught by wrapper
    const data = await repository.findById(input.id);
    if (!data) throw new Error("ไม่พบข้อมูล");
    return data;
  }
);
```

### Client Components (Manual)
```typescript
// ✅ Handle ActionResult
const { data, error } = useSWR(['key'], async () => await action(input));

if (data && !data.success) {
  enqueueSnackbar(data.error || 'เกิดข้อผิดพลาด', { variant: 'error' });
  return;
}

if (error) {
  enqueueSnackbar('เกิดข้อผิดพลาดในการโหลดข้อมูล', { variant: 'error' });
  return;
}
```

## Validation Patterns

### Valibot Schemas
```typescript
// ✅ Comprehensive validation
export const createTeacherSchema = v.object({
  Name: v.pipe(
    v.string(),
    v.minLength(1, 'ชื่อห้ามว่าง'),
    v.maxLength(100, 'ชื่อยาวเกินไป')
  ),
  Email: v.pipe(
    v.string(),
    v.email('อีเมลไม่ถูกต้อง')
  ),
  MaxHours: v.pipe(
    v.number(),
    v.minValue(1, 'ชั่วโมงต้องมากกว่า 0'),
    v.maxValue(40, 'ชั่วโมงต้องไม่เกิน 40')
  ),
});
```

### Domain Validation (Business Rules)
```typescript
// features/timeslot/domain/services/timeslot-validation.service.ts

export function validateTimeslotNotOverlap(
  timeslots: timeslot[],
  newTimeslot: timeslot
): { valid: boolean; error?: string } {
  const overlap = timeslots.find(t => 
    t.Day === newTimeslot.Day &&
    t.PeriodStart === newTimeslot.PeriodStart
  );

  if (overlap) {
    return { 
      valid: false, 
      error: `ช่วงเวลาซ้ำกับ ${overlap.TimeslotID}` 
    };
  }

  return { valid: true };
}
```

## Testing Patterns

### Unit Tests (Jest)
```typescript
// __test__/features/teacher/teacher-validation.test.ts
import { validateTeacherNotOverbooked } from "@/features/teacher/domain/services/teacher-validation.service";

describe('validateTeacherNotOverbooked', () => {
  it('should return valid when teacher has no conflicts', () => {
    const result = validateTeacherNotOverbooked(mockTeacher, mockTimeslots);
    expect(result.valid).toBe(true);
  });

  it('should return invalid when teacher has scheduling conflict', () => {
    const result = validateTeacherNotOverbooked(mockTeacher, overlappingTimeslots);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('ซ้ำซ้อน');
  });
});
```

### E2E Tests (Playwright)
```typescript
// e2e/teacher-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Teacher Management', () => {
  test('should create new teacher', async ({ page }) => {
    await page.goto('/dashboard/1-2567/teacher');
    await page.click('button:has-text("เพิ่มครู")');
    await page.fill('input[name="Name"]', 'สมชาย');
    await page.fill('input[name="Surname"]', 'ใจดี');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=บันทึกสำเร็จ')).toBeVisible();
  });
});
```

## Code Organization

### Import Order
```typescript
// 1. React & Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import useSWR from 'swr';
import { useSnackbar } from 'notistack';

// 3. MUI components
import { Box, Button, TextField } from '@mui/material';

// 4. Internal features (Server Actions)
import { getTeacherAction } from '@/features/teacher/application/actions/teacher.actions';

// 5. Shared utilities & hooks
import { useSemesterSync } from '@/hooks';
import { formatDate } from '@/lib/utils/format-date';

// 6. Types
import type { teacher } from '@prisma/client';

// 7. Relative imports
import { TeacherCard } from './TeacherCard';
import styles from './page.module.css';
```

### File Size Guidelines
- **Components**: < 300 lines (split if larger)
- **Repository methods**: < 50 lines each
- **Domain services**: < 200 lines per file
- **Server Actions**: < 100 lines per file

## Common Anti-Patterns (❌ AVOID)

### 1. Direct API Routes
```typescript
// ❌ Don't create API routes for internal data
export async function GET(request: Request) {
  const data = await prisma.teacher.findMany();
  return Response.json(data);
}

// ✅ Use Server Actions instead
export const getTeachersAction = createAction(
  getTeachersSchema,
  async () => await teacherRepository.findAll()
);
```

### 2. Fetcher Pattern
```typescript
// ❌ axios/fetcher (deprecated - removed Oct 2025)
import { fetcher } from '@/libs/axios';
const { data } = useSWR('/api/teachers', fetcher);

// ✅ Server Actions
import { getTeachersAction } from '@/features/teacher/application/actions/teacher.actions';
const { data } = useSWR(['teachers'], async () => await getTeachersAction());
```

### 3. Manual ConfigID Parsing
```typescript
// ❌ Manual split() everywhere
const [semester, year] = params.semesterAndyear.split("-");

// ✅ Use useSemesterSync hook
const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
```

### 4. Mixing Layers
```typescript
// ❌ Domain service calling Prisma directly
export function validateTeacher(teacherId: string) {
  const teacher = await prisma.teacher.findUnique({ where: { TeacherID: teacherId } });
  return teacher !== null;
}

// ✅ Domain calls repository (injected)
export function validateTeacher(teacher: teacher | null) {
  return teacher !== null && teacher.isActive;
}

// Repository handles Prisma
export const teacherRepository = {
  async findById(id: string) {
    return await prisma.teacher.findUnique({ where: { TeacherID: id } });
  }
};
```

### 5. Client State for Server Data
```typescript
// ❌ useState for server data
const [teachers, setTeachers] = useState([]);
useEffect(() => {
  fetch('/api/teachers').then(r => r.json()).then(setTeachers);
}, []);

// ✅ useSWR with Server Action
const { data } = useSWR(['teachers'], async () => await getTeachersAction());
```

## Performance Best Practices

### 1. Server Component Data Fetching
```typescript
// ✅ Parallel fetching in Server Components
export default async function Page() {
  const [teachers, subjects] = await Promise.all([
    getTeachersAction(),
    getSubjectsAction()
  ]);

  return <div>...</div>;
}
```

### 2. Client Component Caching
```typescript
// ✅ Proper SWR configuration
const { data } = useSWR(
  ['cache-key', dependency],
  async ([, dep]) => await action({ dep }),
  {
    revalidateOnFocus: false,  // Stable data
    dedupingInterval: 5000,     // Prevent duplicate requests
  }
);
```

### 3. Prisma Query Optimization
```typescript
// ✅ Select only needed fields
async findTeacherNames() {
  return await prisma.teacher.findMany({
    select: {
      TeacherID: true,
      Name: true,
      Surname: true,
    },
  });
}

// ❌ Avoid fetching entire entities when not needed
async findTeacherNames() {
  return await prisma.teacher.findMany(); // Returns ALL fields
}
```

## Migration Patterns (Oct 2025 Standard)

### Adding New Feature
1. ✅ Create feature folder structure
2. ✅ Write repository methods (Prisma)
3. ✅ Write Valibot schemas
4. ✅ Write Server Actions with `createAction`
5. ✅ Write domain services (pure functions)
6. ✅ Create components using Server Actions
7. ✅ Add unit tests
8. ✅ Add E2E tests

### Refactoring Legacy Code
1. ✅ Identify API route usage
2. ✅ Create Server Action equivalent
3. ✅ Replace `fetcher` with `useSWR` + Server Action
4. ✅ Replace manual parsing with `useSemesterSync`
5. ✅ Add ActionResult unwrapping
6. ✅ Remove API route file
7. ✅ Test thoroughly
8. ✅ Update documentation

## Documentation Standards

### JSDoc for Public Functions
```typescript
/**
 * Validates if teacher is available for the given timeslot
 * @param teacher - Teacher to validate
 * @param timeslot - Timeslot to check availability
 * @returns Validation result with error message if invalid
 */
export function validateTeacherAvailability(
  teacher: teacher,
  timeslot: timeslot
): { valid: boolean; error?: string } {
  // Implementation
}
```

### Inline Comments for Complex Logic
```typescript
// Check if teacher already has a class during this timeslot
const existingClass = assignments.find(a => 
  a.Day === timeslot.Day && 
  a.PeriodStart === timeslot.PeriodStart
);

// Allow same teacher for different sections of same subject
if (existingClass && existingClass.SubjectID !== newAssignment.SubjectID) {
  return { valid: false, error: 'ครูสอนวิชาอื่นอยู่ในช่วงเวลานี้' };
}
```

### README for Features
```markdown
# Teacher Management Feature

## Structure
- `application/actions/` - Server Actions
- `domain/services/` - Business logic
- `infrastructure/repositories/` - Database access

## Key Actions
- `getTeachersAction` - Get all teachers for term
- `getTeacherByIdAction` - Get single teacher
- `createTeacherAction` - Create new teacher

## Usage
See `app/dashboard/[semesterAndyear]/teacher/page.tsx`
```

---

**Summary:** Follow these conventions rigorously. When in doubt, look at existing code in `features/` for examples. All new code MUST use Server Actions (not API routes) and useSemesterSync (not manual parsing).
