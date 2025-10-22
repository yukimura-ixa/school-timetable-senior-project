# Refactoring Quick Start Guide

> **Quick reference for implementing the comprehensive refactoring plan**

---

## Step-by-Step Implementation

### Phase 1: Foundation (Start Here!)

#### 1.1 Install Dependencies

```powershell
# Core dependencies
pnpm add zustand zod

# Development dependencies (if not already installed)
pnpm add -D @types/react@latest
```

#### 1.2 Update TypeScript Configuration

**Edit `tsconfig.json`**:

```jsonc
{
  "compilerOptions": {
    // Enable strict mode
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    
    // Add path aliases
    "paths": {
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/*": ["./src/*"]
    }
    
    // Keep existing settings...
  }
}
```

#### 1.3 Create New Folder Structure

```powershell
# Create main directories
New-Item -ItemType Directory -Path "src\features" -Force
New-Item -ItemType Directory -Path "src\shared\lib" -Force
New-Item -ItemType Directory -Path "src\shared\types" -Force
New-Item -ItemType Directory -Path "src\shared\utils" -Force
New-Item -ItemType Directory -Path "src\shared\constants" -Force
```

#### 1.4 Move Shared Utilities

```powershell
# Move existing shared code
Move-Item "src\libs\*" "src\shared\lib\"
Move-Item "src\types\*" "src\shared\types\"
Move-Item "src\functions\*" "src\shared\utils\"
Move-Item "src\models\*" "src\shared\constants\"
```

---

### Phase 2: First Feature (schedule-arrangement)

#### 2.1 Create Feature Structure

```powershell
# Create feature directories
$feature = "src\features\schedule-arrangement"
New-Item -ItemType Directory -Path "$feature\domain\entities" -Force
New-Item -ItemType Directory -Path "$feature\domain\services" -Force
New-Item -ItemType Directory -Path "$feature\domain\types" -Force
New-Item -ItemType Directory -Path "$feature\application\use-cases" -Force
New-Item -ItemType Directory -Path "$feature\application\actions" -Force
New-Item -ItemType Directory -Path "$feature\application\schemas" -Force
New-Item -ItemType Directory -Path "$feature\infrastructure\repositories" -Force
New-Item -ItemType Directory -Path "$feature\presentation\components" -Force
New-Item -ItemType Directory -Path "$feature\presentation\stores" -Force
New-Item -ItemType Directory -Path "$feature\presentation\hooks" -Force
```

#### 2.2 Create Conflict Detection Service (Domain Layer)

**Create file**: `src/features/schedule-arrangement/domain/services/conflict-detector.service.ts`

```typescript
export type ConflictType = 'TEACHER' | 'ROOM' | 'CLASS' | 'LOCKED' | 'BREAK';

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: ConflictType;
    message: string;
  }>;
}

export function checkTeacherConflict(
  timeslotId: string,
  teacherId: string,
  existingSchedules: any[]
): ConflictResult {
  // Extract existing logic from component/route
  const conflicts = existingSchedules.filter(
    s => s.TimeslotID === timeslotId && 
         s.teachers_responsibility.some(r => r.TeacherID === teacherId)
  );

  return {
    hasConflict: conflicts.length > 0,
    conflicts: conflicts.length > 0 ? [{
      type: 'TEACHER',
      message: 'ครูมีคาบสอนซ้ำในช่วงเวลานี้'
    }] : []
  };
}

// Add more conflict checks...
```

#### 2.3 Create Repository (Infrastructure Layer)

**Create file**: `src/features/schedule-arrangement/infrastructure/repositories/schedule.repository.ts`

```typescript
import { prisma } from '@/shared/lib/prisma';

export class ScheduleRepository {
  async findMany(filter: {
    teacherId?: string;
    academicYear: number;
    semester: number;
  }) {
    return prisma.class_schedule.findMany({
      where: {
        timeslot: {
          AcademicYear: filter.academicYear,
          Semester: filter.semester,
        },
        ...(filter.teacherId && {
          teachers_responsibility: {
            some: { TeacherID: filter.teacherId }
          }
        })
      },
      include: {
        teachers_responsibility: true,
        timeslot: true,
        subject: true,
        room: true,
      }
    });
  }

  async create(data: any) {
    return prisma.class_schedule.create({ data });
  }

  async delete(classId: string) {
    return prisma.class_schedule.delete({
      where: { ClassID: classId }
    });
  }
}

export const scheduleRepository = new ScheduleRepository();
```

#### 2.4 Create Validation Schema

**Create file**: `src/features/schedule-arrangement/application/schemas/arrange-schedule.schema.ts`

```typescript
import { z } from 'zod';

export const arrangeScheduleSchema = z.object({
  teacherId: z.string().min(1),
  academicYear: z.number().int().positive(),
  semester: z.number().int().min(1).max(2),
  schedules: z.array(
    z.object({
      timeslotId: z.string(),
      subject: z.object({
        subjectCode: z.string().optional(),
        gradeId: z.string().optional(),
        respId: z.string().optional(),
        roomId: z.number().nullable().optional(),
      }).optional(),
    })
  ),
});

export type ArrangeScheduleInput = z.infer<typeof arrangeScheduleSchema>;
```

#### 2.5 Create Server Action

**Create file**: `src/features/schedule-arrangement/application/actions/arrange-schedule.action.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { arrangeScheduleSchema } from '../schemas/arrange-schedule.schema';
import { scheduleRepository } from '../../infrastructure/repositories/schedule.repository';
import { checkTeacherConflict } from '../../domain/services/conflict-detector.service';

export async function arrangeScheduleAction(input: unknown) {
  try {
    // 1. Validate
    const validated = arrangeScheduleSchema.parse(input);

    // 2. Fetch existing
    const existing = await scheduleRepository.findMany({
      teacherId: validated.teacherId,
      academicYear: validated.academicYear,
      semester: validated.semester,
    });

    // 3. Process changes
    const deleted: string[] = [];
    const added: string[] = [];

    for (const schedule of validated.schedules) {
      // Your existing logic, but using repository and conflict checker
    }

    // 4. Revalidate cache
    revalidatePath('/schedule/[semesterAndyear]/arrange/teacher-arrange');

    return { success: true, deleted, added };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to arrange schedule' };
  }
}
```

#### 2.6 Create Zustand Store

**Create file**: `src/features/schedule-arrangement/presentation/stores/arrangement-ui.store.ts`

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ArrangementUIState {
  isSaving: boolean;
  selectedSubject: any | null;
  errors: Map<string, string>;
  
  setIsSaving: (isSaving: boolean) => void;
  selectSubject: (subject: any | null) => void;
  setError: (timeslotId: string, error: string) => void;
  clearError: (timeslotId: string) => void;
}

export const useArrangementUIStore = create<ArrangementUIState>()(
  devtools(
    (set) => ({
      isSaving: false,
      selectedSubject: null,
      errors: new Map(),

      setIsSaving: (isSaving) => set({ isSaving }),
      selectSubject: (subject) => set({ selectedSubject: subject }),
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
    }),
    { name: 'ArrangementUI' }
  )
);
```

#### 2.7 Create Custom Hook

**Create file**: `src/features/schedule-arrangement/presentation/hooks/use-arrange-schedule.ts`

```typescript
import { useTransition } from 'react';
import { useArrangementUIStore } from '../stores/arrangement-ui.store';
import { arrangeScheduleAction } from '../../application/actions/arrange-schedule.action';

export function useArrangeSchedule() {
  const [isPending, startTransition] = useTransition();
  const { setIsSaving, setError } = useArrangementUIStore();

  const arrangeSchedule = async (input: any) => {
    setIsSaving(true);

    startTransition(async () => {
      const result = await arrangeScheduleAction(input);

      if (!result.success && result.error) {
        setError('general', result.error);
      }

      setIsSaving(false);
    });
  };

  return { arrangeSchedule, isPending };
}
```

#### 2.8 Refactor Component

**Update**: `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`

```typescript
'use client';

import { useArrangementUIStore } from '@/features/schedule-arrangement/presentation/stores/arrangement-ui.store';
import { useArrangeSchedule } from '@/features/schedule-arrangement/presentation/hooks/use-arrange-schedule';

export default function TeacherArrangePage() {
  const { arrangeSchedule, isPending } = useArrangeSchedule();
  const selectedSubject = useArrangementUIStore((s) => s.selectedSubject);
  const errors = useArrangementUIStore((s) => s.errors);

  const handleSave = async () => {
    await arrangeSchedule({
      teacherId: 'T001',
      academicYear: 2024,
      semester: 1,
      schedules: [/* ... */],
    });
  };

  return (
    <div>
      {/* Simplified UI - state is in Zustand */}
      <button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
```

---

### Phase 3: Testing

#### 3.1 Test Domain Services

**Create file**: `src/features/schedule-arrangement/domain/services/__tests__/conflict-detector.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { checkTeacherConflict } from '../conflict-detector.service';

describe('checkTeacherConflict', () => {
  it('should detect conflict', () => {
    const result = checkTeacherConflict('T1', 'TEACHER001', [
      {
        TimeslotID: 'T1',
        teachers_responsibility: [{ TeacherID: 'TEACHER001' }]
      }
    ]);

    expect(result.hasConflict).toBe(true);
  });

  it('should not detect conflict for different timeslot', () => {
    const result = checkTeacherConflict('T2', 'TEACHER001', [
      {
        TimeslotID: 'T1',
        teachers_responsibility: [{ TeacherID: 'TEACHER001' }]
      }
    ]);

    expect(result.hasConflict).toBe(false);
  });
});
```

#### 3.2 Run Tests

```powershell
pnpm test
```

---

## Checklist

### Foundation Phase
- [ ] Install dependencies (zustand, zod)
- [ ] Update tsconfig.json with strict mode
- [ ] Create new folder structure
- [ ] Move shared utilities
- [ ] Fix TypeScript errors

### First Feature Phase
- [ ] Create feature structure
- [ ] Extract domain logic (conflict detection)
- [ ] Create repository
- [ ] Create validation schema
- [ ] Create Server Action
- [ ] Create Zustand store
- [ ] Create custom hook
- [ ] Refactor component
- [ ] Write tests
- [ ] Remove old API route

### Validation
- [ ] All tests pass
- [ ] TypeScript compiles with no errors
- [ ] Feature works as before
- [ ] Performance is acceptable
- [ ] Code is cleaner and more maintainable

---

## Common Issues & Solutions

### Issue: "Cannot find module '@/features/...'"

**Solution**: Make sure you restarted the Next.js dev server after updating `tsconfig.json`.

```powershell
# Stop the server (Ctrl+C), then:
pnpm dev
```

### Issue: TypeScript errors everywhere

**Solution**: Fix them incrementally. Use `// @ts-expect-error` temporarily if needed:

```typescript
// @ts-expect-error - Will fix in next iteration
const value = someUntypedFunction();
```

### Issue: Server Action not working

**Solution**: Make sure the file has `'use server'` at the top and is being called from a Client Component.

---

## Next Steps

1. ✅ Complete Phase 1 (Foundation)
2. ✅ Complete Phase 2 (First Feature)
3. 🚀 Move to next feature (teacher-management)
4. 🚀 Repeat pattern for all features
5. 🚀 Phase 5: Polish & Optimization

---

## Need Help?

- Review the full plan: `docs/COMPREHENSIVE_REFACTORING_PLAN.md`
- Check Next.js docs: https://nextjs.org/docs
- Check Zustand docs: https://docs.pmnd.rs/zustand
- Check Zod docs: https://zod.dev
