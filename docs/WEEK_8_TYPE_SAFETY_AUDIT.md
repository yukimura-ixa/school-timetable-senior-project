# Week 8.1: Type Safety Audit - Complete Analysis

> **Mission**: Replace all `any` types with proper TypeScript types for type safety and IDE autocompletion

---

## Executive Summary

**Audit Date**: October 22, 2025  
**Total `any` Occurrences**: 137+ found (100+ in .tsx files alone)  
**Priority Distribution**:
- 🔴 **Critical**: 12 files (server actions, stores, repositories, hooks)
- 🟠 **High**: 15 files (UI components with business logic)
- 🟡 **Medium**: 1 file (legacy teacher-arrange page - 25+ `any` types)
- 🟢 **Low**: 4 files (test files - `expect.any(Object)` is acceptable)

---

## Priority Classification

### 🔴 Critical Priority (Fix First)

These files are core business logic and should NEVER use `any`:

#### 1. **Server Actions & Domain Logic**

| File | any Count | Lines | Impact |
|------|-----------|-------|--------|
| `schedule-arrangement.actions.ts` | 2 | 87, 245 | Error handling, schedule operations |
| `action-wrapper.ts` | 1 | 118 | Global error handling wrapper |
| `schedule.repository.ts` | 0* | 64 | *Comment only - "if any" |

**Issues Found**:
```typescript
// Line 87: Unsafe error extension
const error: any = new Error(conflictResult.message);
error.code = 'CONFLICT';
error.conflictDetails = conflictResult;

// Line 245: Untyped schedule return
schedule: any;
```

**Recommended Fix**: Create proper error types with discriminated unions

---

#### 2. **State Management (Zustand Store)**

| File | any Count | Lines | Impact |
|------|-----------|-------|--------|
| `arrangement-ui.store.ts` | 4 | 29, 35, 50, 120, 172 | Core UI state management |

**Issues Found**:
```typescript
export interface SubjectData {
  room?: any;  // Line 29 - Should be Room entity
  [key: string]: any;  // Line 35 - Index signature too broad
}

export interface TimeslotData {
  [key: string]: any;  // Line 50 - Index signature too broad
}

// Line 120, 172: Lock data untyped
lockData: any[];
setLockData: (data: any[]) => void;
```

**Recommended Fix**: Use Prisma-generated types (`room`, `class_schedule`, etc.)

---

#### 3. **Custom Hooks**

| File | any Count | Lines | Impact |
|------|-----------|-------|--------|
| `lockData.ts` | 1 | 7 | Lock schedule data fetching |

**Issues Found**:
```typescript
const { data, error, mutate } = useSWR<any>(path, fetcher)
```

**Recommended Fix**: Type with `class_schedule[]` from Prisma

---

#### 4. **Shared Utilities**

| File | any Count | Lines | Impact |
|------|-----------|-------|--------|
| `timeSlot.ts` (dashboard shared) | 2 | 27, 46 | Timeslot data transformation |

**Issues Found**:
```typescript
subject: Record<string, any>;
[key: string]: any;
```

**Recommended Fix**: Use proper Subject and Timeslot types

---

### 🟠 High Priority (UI Components with Business Logic)

#### 5. **Schedule Locking Components** (8 files, 39 `any` types)

| File | any Count | Critical Lines |
|------|-----------|---------------|
| `LockScheduleForm.tsx` | 7 | 16-17, 42, 149, 161, 255, 275, 297 |
| `AddLockScheduleModal.tsx` | 5 | 12-13, 17, 39, 50, 105 |
| `EditLockScheduleModal.tsx` | 7 | 15-17, 35, 45, 99, 117, 167, 184 |
| `DeleteLockScheduleModal.tsx` | 3 | 7-8, 21 |
| `SelectTeacher.tsx` | 5 | 8-14 |
| `SelectSubject.tsx` | 3 | 12, 38, 66 |
| `SelectRoomName.tsx` | 3 | 8-9, 24, 43 |
| `SelectMultipleTimeSlot.tsx` | 2 | 10-11 |
| `SelectedClassRoom.tsx` | 3 | 11-12, 14, 102 |
| `SelectDayOfWeek.tsx` | 2 | 6-7, 27 |

**Common Pattern** (needs fixing):
```typescript
// Event handlers
const handleSubjectChange = (value: any) => { ... }
const timeSlotHandleChange = (e: any) => { ... }

// Props
closeModal: any;  // Should be: () => void
confirmChange: any;  // Should be: (data: LockSchedule) => Promise<void>
data?: any;  // Should be: LockSchedule | undefined
```

---

#### 6. **Teacher Assignment Components** (4 files, 18 `any` types)

| File | any Count | Critical Lines |
|------|-----------|---------------|
| `teacher_responsibility/page.tsx` | 7 | 131, 286, 301, 322, 364, 397 |
| `ShowTeacherData.tsx` | 2 | 82, 90 |
| `SelectClassRoomModal.tsx` | 3 | 13, 17, 19 |
| `AddSubjectModal.tsx` | 6 | 12-16, 84, 124, 210, 223 |

**Issues**: Array mapping without types, event handlers, modal props

---

#### 7. **Schedule Configuration** (3 files, 8 `any` types)

| File | any Count | Critical Lines |
|------|-----------|---------------|
| `config/page.tsx` | 4 | 63, 294, 352, 373 |
| `ConfirmDeleteModal.tsx` | 1 | 8 |
| `CloneTimetableDataModal.tsx` | 3 | 14, 130, 136 |

---

#### 8. **UI Components (Generic)** (3 files, 5 `any` types)

| File | any Count | Critical Lines |
|------|-----------|---------------|
| `PrimaryButton.tsx` | 1 | 3 - `handleClick: any` |
| `CheckBox.tsx` | 1 | 6 - `handleClick: any` |
| `NumberField.tsx` | 1 | 10 - `handleChange?: any` |
| `signin/page.tsx` | 2 | 99, 119 - `onChange={(e: any) => ...` |

**Fix**: Use React event types (`MouseEvent`, `ChangeEvent<HTMLInputElement>`)

---

### 🟡 Medium Priority (Legacy Code - Large Refactor Needed)

#### 9. **Teacher Arrange Page** - 25+ `any` types

| File | any Count | Status |
|------|-----------|--------|
| `teacher-arrange/page.tsx` | 25+ | ⚠️ Legacy - needs architectural review |

**Issues**:
- 25+ inline `(item: any)` in map/filter operations
- State management without types
- Complex data transformations
- Should be broken into smaller components

**Lines with `any`**:
230, 285, 295-296, 301, 307, 314, 325, 331-332, 365, 367, 418, 426, 444, 469, 491-492, 503, 507, 536, 575, 658, 693, 710

**Recommendation**: 
1. Extract data transformation logic to typed utility functions
2. Break into smaller typed components
3. Use proper state management (Zustand store)
4. Add comprehensive types for all data structures

---

#### 10. **Arrange Components** (4 files, 15 `any` types)

| File | any Count | Critical Lines |
|------|-----------|---------------|
| `SubjectDragBox.tsx` | 2 | 14, 17 |
| `SubjectItem.tsx` | 3 | 24-26 |
| `TimeslotCell.tsx` | 3 | 18, 25, 27 |
| `TimeSlot.tsx` | 4 | 16-18, 26, 28 |
| `TimeSlot.refactored.tsx` | 4 | 17-19, 27, 29 |

---

### 🟢 Low Priority (Test Files - Acceptable)

#### 11. **Test Files** (4 occurrences)

| File | any Count | Status |
|------|-----------|--------|
| `schedule-arrangement.actions.test.ts` | 1 | ✅ OK - `as any` for test invalid input |
| `schedule.repository.test.ts` | 4 | ✅ OK - `expect.any(Object)` for Jest matchers |
| Domain service tests | 3 | ✅ OK - Comments "if any" not code |
| Hook tests | 3 | ✅ OK - Comments "any other" not code |

**Note**: `expect.any(Object)` is a Jest matcher and is appropriate in tests

---

## Available Type Sources

### Prisma Generated Types

We have access to these auto-generated types from `@prisma/client`:

```typescript
import type { 
  class_schedule,
  gradelevel, 
  room,
  subject,
  teacher,
  timeslot,
  teachers_responsibility,
  program,
  semester,
  day_of_week,
  breaktime,
  subject_credit
} from '@prisma/client';
```

### Relations (with include)

```typescript
// Schedule with relations
type ScheduleWithRelations = class_schedule & {
  gradelevel: gradelevel;
  room: room | null;
  subject: subject;
  timeslot: timeslot;
  teachers_responsibility: teachers_responsibility[];
};
```

---

## Recommended Type Definitions to Create

### 1. Error Types (`src/types/errors.ts`)

```typescript
export type ConflictError = {
  code: 'CONFLICT';
  conflictDetails: {
    hasConflict: true;
    conflictType: 'TEACHER_CONFLICT' | 'CLASS_CONFLICT' | 'ROOM_CONFLICT';
    message: string;
    conflictingSchedule: {
      classId: string;
      subjectCode: string;
      subjectName: string;
      gradeId: string;
      teacherId: number;
      teacherName: string;
      timeslotId: string;
    };
  };
};

export type ValidationError = {
  code: 'VALIDATION_ERROR';
  message: string;
  field?: string;
};

export type ServerActionError = ConflictError | ValidationError | {
  code: 'UNKNOWN_ERROR';
  message: string;
};
```

### 2. Lock Schedule Types (`src/types/lock-schedule.ts`)

```typescript
export type LockScheduleFormData = {
  timeslots: string[];
  grades: string[];
  subject: string | null;
  room: number | null;
  teachers: number[];
  dayOfWeek: day_of_week;
};

export type LockSchedule = class_schedule & {
  subject: subject;
  room: room | null;
  gradelevel: gradelevel;
  timeslot: timeslot;
  teachers_responsibility: (teachers_responsibility & { teacher: teacher })[];
};
```

### 3. UI State Types (`src/types/ui-state.ts`)

```typescript
export type SubjectData = {
  itemID: number;
  SubjectCode: string;
  SubjectName: string;
  GradeID: string;
  RoomName: string;
  room: room | null;
  ClassID: string;
  gradelevel: {
    Year: number;
  };
  Scheduled: boolean;
};

export type TimeslotData = timeslot & {
  subject?: SubjectData;
};

export type TimeSlotGridData = {
  DayOfWeek: day_of_week[];
  AllData: TimeslotData[];
  SlotAmount: number[];
};
```

### 4. Event Handler Types (`src/types/events.ts`)

```typescript
import type { ChangeEvent, MouseEvent } from 'react';

export type ModalCloseHandler = () => void;
export type ModalConfirmHandler<T> = (data: T) => Promise<void> | void;
export type SelectChangeHandler<T> = (value: T) => void;
export type InputChangeHandler = ChangeEvent<HTMLInputElement>;
export type ButtonClickHandler = MouseEvent<HTMLButtonElement>;
```

---

## Refactoring Strategy

### Phase 1: Foundation (Week 8.2)
1. Create type definition files in `src/types/`
2. Import Prisma types where needed
3. Define discriminated union types for errors
4. Define event handler types

### Phase 2: Critical Fixes (Week 8.3)
1. Fix server actions error handling
2. Type Zustand store completely
3. Type custom hooks with proper return types
4. Fix action-wrapper error typing

### Phase 3: UI Components (Week 8.4)
1. Type all lock schedule components
2. Type assignment components
3. Type configuration components
4. Type generic UI elements
5. Use proper React event types everywhere

### Phase 4: Legacy Refactor (Week 8.5)
1. Extract teacher-arrange data transformations
2. Create typed utility functions
3. Break into smaller typed components
4. Integrate with typed Zustand store

### Phase 5: Validation (Week 8.6)
1. Enable strict TypeScript mode (if not already)
2. Run `tsc --noEmit` to check for errors
3. Run test suite (must remain 88/88 passing)
4. Verify 0 build errors
5. Test IDE autocompletion

---

## Expected Benefits

### Type Safety
- ✅ Catch errors at compile time, not runtime
- ✅ Prevent `undefined` is not a function errors
- ✅ Eliminate `Cannot read property 'x' of null`

### Developer Experience
- ✅ Full IDE autocompletion
- ✅ Inline documentation from types
- ✅ Refactoring confidence (find all references)
- ✅ Self-documenting code

### Maintainability
- ✅ Easier to understand data flow
- ✅ Safer refactoring
- ✅ Better code review experience
- ✅ Reduced cognitive load

### Performance
- ✅ TypeScript can optimize better with types
- ✅ Bundle size may decrease (tree-shaking)

---

## Risks & Mitigation

### Risk 1: Breaking Changes
- **Mitigation**: Run tests after each file refactoring
- **Rollback**: Git commit after each phase completion

### Risk 2: Complex Type Inference
- **Mitigation**: Use explicit types where inference fails
- **Solution**: Add `as const` assertions where appropriate

### Risk 3: Time Investment
- **Mitigation**: Prioritize critical files first
- **Strategy**: Can spread over multiple weeks if needed

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| `any` types in critical files | 12 | 0 |
| `any` types in UI components | 70+ | 0 |
| `any` types in legacy page | 25+ | 0 |
| TypeScript errors | 0 | 0 |
| Test passing | 88/88 | 88/88 |
| Build errors | 0 | 0 |

---

## Next Step

**Begin Week 8.2**: Create comprehensive type definitions in `src/types/` directory.

Create these files:
1. `errors.ts` - Error types with discriminated unions
2. `lock-schedule.ts` - Lock schedule form and data types
3. `ui-state.ts` - UI state types (subjects, timeslots, grids)
4. `events.ts` - React event handler types
5. `index.ts` - Re-export all types

Then proceed to Week 8.3 to refactor critical files.
