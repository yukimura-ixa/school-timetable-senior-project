# Phase 2 Type Migration Plan — Schedule Arrangement Features

> **Status**: Ready for execution  
> **Last Updated**: 2025-01-20  
> **Depends On**: Phase 1 Type Safety foundation (schedule.types.ts)  
> **Estimated Duration**: 2-3 weeks (component-by-component)

---

## Executive Summary

Phase 1 successfully established a **strict type system** for schedule arrangement features and eliminated all explicit 'any' types from infrastructure components (TimeslotCell, Zustand store). However, the migration revealed **115 type errors** in `teacher-arrange/page.tsx` due to a **type system conflict** between legacy PascalCase types and new camelCase types.

This document provides a **gradual, low-risk migration strategy** for Phase 2 that allows the application to remain functional while migrating component-by-component.

### Phase 1 Achievements ✅

- Created `schedule.types.ts` with strict, required fields
- Migrated `TimeslotCell.tsx` (0 errors)
- Migrated `arrangement-ui.store.ts` (0 errors)
- Fixed critical typo: `isCilckToChangeSubject` → `isClickToChangeSubject`
- Added ESLint rule to prevent 'any' type regressions
- Added typecheck scripts to package.json

### Phase 2 Goals 🎯

- Resolve 115 type errors in `teacher-arrange/page.tsx`
- Migrate all schedule arrangement components to strict types
- Remove legacy type system (`ui-state.ts` PascalCase types)
- Maintain zero regressions in user functionality
- Establish patterns for future component migrations

---

## Type System Conflict Analysis

### Root Cause

Two incompatible `SubjectData` type definitions coexist:

**Legacy (ui-state.ts)** — PascalCase:
```typescript
export interface SubjectData {
  Year?: number;          // Optional
  Number?: number;        // Optional
  SubjectCode?: string;   // Optional
  GradeID?: string;       // Optional
  // ... all fields optional
}
```

**New (schedule.types.ts)** — camelCase, required fields:
```typescript
export interface SubjectData {
  itemID: number;            // Required
  subjectCode: string;       // Required
  subjectName: string;       // Required
  gradeID: string;           // Required
  year: number;              // Required (from grade level)
  number: number;            // Required (from grade level)
  teacherID: number;         // Required
  category: string;          // Required
  credit: number;            // Required
  teachHour: number;         // Required
  // ... all required fields
}
```

### Impact

- **115 type errors** in `teacher-arrange/page.tsx` (1050 lines)
- **Mixing both imports** causes type incompatibility
- **Empty objects `{}`** used instead of `null` for unassigned subjects
- **Grade level structure** conflict: `{ Year, Number }` vs `{ year, number }`

### Error Categories

| Category | Count | Example Error |
|----------|-------|---------------|
| Property casing conflicts | ~45 | `Property 'SubjectCode' does not exist. Did you mean 'subjectCode'?` |
| Type incompatibility | ~30 | `Type '{}' is not assignable to type 'SubjectData'` |
| Missing required fields | ~25 | `Property 'itemID' is missing in type but required` |
| Grade level structure | ~15 | `Property 'Year' does not exist on type 'gradelevel'` |

---

## Migration Strategy: Gradual Component-by-Component

### Philosophy

- **Zero downtime**: Application remains functional throughout migration
- **Incremental testing**: Verify each component before proceeding
- **Rollback-friendly**: Each migration is self-contained
- **Low risk**: Small, testable changes vs. big-bang rewrite

### Migration Phases

```
Phase 2.1: Data Transformation Layer (Week 1)
    ↓
Phase 2.2: Component Decomposition (Week 1-2)
    ↓
Phase 2.3: Component Migration (Week 2-3)
    ↓
Phase 2.4: Legacy Cleanup (Week 3)
```

---

## Phase 2.1: Data Transformation Layer

**Goal**: Create utilities to safely transform between old and new types

**Duration**: 2-3 days

### Step 1: Create Transformation Utilities

**File**: `src/utils/type-transformers.ts`

```typescript
import { SubjectData as NewSubjectData } from '@/types/schedule.types';

// Legacy types (for transformation only)
interface LegacySubjectData {
  Year?: number;
  Number?: number;
  SubjectCode?: string;
  SubjectName?: string;
  GradeID?: string;
  TeacherID?: number;
  Category?: string;
  Credit?: number;
  TeachHour?: number;
  [key: string]: unknown;
}

/**
 * Transform legacy PascalCase subject data to new camelCase format
 * @param legacy - Data from API/DB with PascalCase properties
 * @returns Strictly typed SubjectData or null if incomplete
 */
export function transformLegacySubject(
  legacy: LegacySubjectData | null | undefined
): NewSubjectData | null {
  if (!legacy) return null;
  
  // Validate required fields exist
  if (
    !legacy.SubjectCode ||
    !legacy.SubjectName ||
    !legacy.GradeID ||
    typeof legacy.TeacherID !== 'number' ||
    !legacy.Category ||
    typeof legacy.Credit !== 'number' ||
    typeof legacy.TeachHour !== 'number'
  ) {
    console.warn('Incomplete legacy subject data:', legacy);
    return null;
  }

  return {
    itemID: legacy.itemID ?? 0, // Assign during save
    subjectCode: legacy.SubjectCode,
    subjectName: legacy.SubjectName,
    gradeID: legacy.GradeID,
    year: legacy.Year ?? 0,
    number: legacy.Number ?? 0,
    teacherID: legacy.TeacherID,
    category: legacy.Category,
    credit: legacy.Credit,
    teachHour: legacy.TeachHour,
    roomID: legacy.RoomID ?? null,
    roomName: legacy.RoomName ?? null,
  };
}

/**
 * Transform array of legacy subjects
 */
export function transformLegacySubjects(
  legacyArray: LegacySubjectData[]
): NewSubjectData[] {
  return legacyArray
    .map(transformLegacySubject)
    .filter((s): s is NewSubjectData => s !== null);
}

/**
 * Transform grade level from PascalCase to camelCase
 */
export function transformGradeLevel(legacy: {
  Year?: number;
  Number?: number;
}): { year: number; number: number } {
  return {
    year: legacy.Year ?? 0,
    number: legacy.Number ?? 0,
  };
}
```

### Step 2: Add Unit Tests

**File**: `__test__/utils/type-transformers.test.ts`

```typescript
import { transformLegacySubject, transformGradeLevel } from '@/utils/type-transformers';

describe('Type Transformers', () => {
  describe('transformLegacySubject', () => {
    it('should transform complete legacy subject to new format', () => {
      const legacy = {
        SubjectCode: 'CS101',
        SubjectName: 'Computer Science',
        GradeID: 'M1-1',
        TeacherID: 5,
        Category: 'Core',
        Credit: 3,
        TeachHour: 3,
        Year: 1,
        Number: 1,
      };

      const result = transformLegacySubject(legacy);

      expect(result).toEqual({
        itemID: 0,
        subjectCode: 'CS101',
        subjectName: 'Computer Science',
        gradeID: 'M1-1',
        teacherID: 5,
        category: 'Core',
        credit: 3,
        teachHour: 3,
        year: 1,
        number: 1,
        roomID: null,
        roomName: null,
      });
    });

    it('should return null for incomplete data', () => {
      const incomplete = {
        SubjectCode: 'CS101',
        // Missing required fields
      };

      const result = transformLegacySubject(incomplete);
      expect(result).toBeNull();
    });

    it('should return null for null/undefined input', () => {
      expect(transformLegacySubject(null)).toBeNull();
      expect(transformLegacySubject(undefined)).toBeNull();
    });
  });

  describe('transformGradeLevel', () => {
    it('should transform grade level casing', () => {
      const legacy = { Year: 1, Number: 2 };
      const result = transformGradeLevel(legacy);
      
      expect(result).toEqual({ year: 1, number: 2 });
    });

    it('should handle missing fields with defaults', () => {
      const result = transformGradeLevel({});
      expect(result).toEqual({ year: 0, number: 0 });
    });
  });
});
```

**Run tests**:
```bash
pnpm test type-transformers
```

**Success Criteria**: All tests pass ✅

---

## Phase 2.2: Component Decomposition

**Goal**: Break `teacher-arrange/page.tsx` (1050 lines) into smaller, manageable components

**Duration**: 3-4 days

### Current Structure Analysis

`teacher-arrange/page.tsx` responsibilities:
1. Data fetching (teachers, timeslots, schedules, locked items)
2. State management (selected teacher, filters)
3. Grid rendering (day columns, timeslot rows)
4. Locked schedule display
5. Event handling (drag-drop, modal triggers)

### Proposed Component Structure

```
teacher-arrange/
├── page.tsx (orchestrator, ~200 lines)
├── components/
│   ├── TeacherScheduleGrid.tsx (grid layout)
│   ├── TeacherSelector.tsx (teacher picker)
│   ├── LockedScheduleList.tsx (locked items display)
│   ├── DayColumn.tsx (single day column)
│   └── TimeslotRow.tsx (single timeslot row)
└── hooks/
    ├── useTeacherSchedule.ts (data fetching)
    ├── useLockedSchedules.ts (locked items logic)
    └── useScheduleFilters.ts (filter state)
```

### Step 1: Extract Data Fetching Hook

**File**: `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/hooks/useTeacherSchedule.ts`

```typescript
import { useState, useEffect } from 'react';
import { SubjectData } from '@/types/schedule.types';
import { transformLegacySubject } from '@/utils/type-transformers';

interface UseTeacherScheduleResult {
  teachers: Array<{ teacherID: number; teacherName: string }>;
  timeslots: TimeslotData[];
  schedules: SubjectData[];
  loading: boolean;
  error: string | null;
}

export function useTeacherSchedule(
  semesterAndYear: string,
  teacherID?: string
): UseTeacherScheduleResult {
  const [teachers, setTeachers] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch teachers
        const teachersRes = await fetch(`/api/teachers?semester=${semesterAndYear}`);
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.data || []);

        // Fetch timeslots
        const timeslotsRes = await fetch(`/api/timeslots?semester=${semesterAndYear}`);
        const timeslotsData = await timeslotsRes.json();
        setTimeslots(timeslotsData.data || []);

        // Fetch schedules for specific teacher
        if (teacherID) {
          const schedulesRes = await fetch(
            `/api/schedules/teacher/${teacherID}?semester=${semesterAndYear}`
          );
          const schedulesData = await schedulesRes.json();
          
          // Transform legacy data to new format
          const transformed = schedulesData.data?.map(transformLegacySubject) || [];
          setSchedules(transformed.filter(Boolean));
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [semesterAndYear, teacherID]);

  return { teachers, timeslots, schedules, loading, error };
}
```

### Step 2: Extract Locked Schedules Component

**File**: `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/components/LockedScheduleList.tsx`

```typescript
import React from 'react';

interface LockedScheduleItem {
  SubjectName: string;
  RoomName: string;
  GradeID: string | string[];
  DayOfWeek: string;
  TimePeriod: number;
}

interface LockedScheduleListProps {
  items: LockedScheduleItem[];
  onUnlock?: (item: LockedScheduleItem) => void;
}

export function LockedScheduleList({ items, onUnlock }: LockedScheduleListProps) {
  if (items.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        No locked schedules for this teacher
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">Locked Schedules</h3>
      <ul className="divide-y divide-gray-200">
        {items.map((item, index) => (
          <li key={index} className="py-2 flex justify-between items-center">
            <div>
              <span className="font-medium">{item.SubjectName}</span>
              <span className="text-gray-600 text-sm ml-2">
                ({Array.isArray(item.GradeID) ? item.GradeID.join(', ') : item.GradeID})
              </span>
              <span className="text-gray-500 text-xs ml-2">
                {item.DayOfWeek} P{item.TimePeriod} • {item.RoomName}
              </span>
            </div>
            {onUnlock && (
              <button
                onClick={() => onUnlock(item)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Unlock
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Step 3: Update Page to Use New Components

**File**: `teacher-arrange/page.tsx` (refactored orchestrator)

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useTeacherSchedule } from './hooks/useTeacherSchedule';
import { LockedScheduleList } from './components/LockedScheduleList';
import { TeacherScheduleGrid } from './components/TeacherScheduleGrid';

export default function TeacherArrangePage() {
  const params = useParams();
  const semesterAndYear = params.semesterAndyear as string;
  const teacherID = params.teacherID as string | undefined;

  const { teachers, timeslots, schedules, loading, error } = useTeacherSchedule(
    semesterAndYear,
    teacherID
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <TeacherScheduleGrid
        teachers={teachers}
        timeslots={timeslots}
        schedules={schedules}
      />
      
      <LockedScheduleList items={lockedItems} />
    </div>
  );
}
```

**Success Criteria**:
- Component compiles with 0 errors
- All functionality preserved
- Page size reduced from 1050 → ~200 lines

---

## Phase 2.3: Component Migration (Iterative)

**Goal**: Migrate each decomposed component to strict types

**Duration**: 5-7 days

### Migration Order (Priority)

1. **useTeacherSchedule.ts** (data layer)
2. **LockedScheduleList.tsx** (simple component)
3. **TeacherSelector.tsx** (UI component)
4. **DayColumn.tsx** (grid component)
5. **TimeslotRow.tsx** (grid component)
6. **TeacherScheduleGrid.tsx** (complex component)
7. **page.tsx** (orchestrator)

### Migration Checklist (Per Component)

For each component:

- [ ] **Import new types** from `schedule.types.ts`
- [ ] **Remove legacy imports** from `ui-state.ts`
- [ ] **Apply transformers** to API data
- [ ] **Replace `{}` with `null`** for unassigned subjects
- [ ] **Fix property casing**: `SubjectCode` → `subjectCode`, `Year` → `year`
- [ ] **Update function signatures** to use strict types
- [ ] **Add type guards** where needed (e.g., `isCompleteSubjectData`)
- [ ] **Run typecheck**: `pnpm typecheck`
- [ ] **Run tests**: `pnpm test [component-name]`
- [ ] **Manual QA**: Test drag-drop, modals, filters

### Example Migration: DayColumn.tsx

**Before** (legacy types):
```typescript
import { SubjectData } from '@/types/ui-state'; // Legacy

interface DayColumnProps {
  day: string;
  subjects: SubjectData[]; // Optional fields, PascalCase
  onDrop: (subject: any) => void; // Loose typing
}

export function DayColumn({ day, subjects, onDrop }: DayColumnProps) {
  const handleDrop = (subject: any) => {
    if (subject.SubjectCode) { // PascalCase
      onDrop(subject);
    }
  };

  return (
    <div>
      {subjects.map((s) => (
        <div key={s.SubjectCode}>{s.SubjectName}</div>
      ))}
    </div>
  );
}
```

**After** (strict types):
```typescript
import { SubjectData, isCompleteSubjectData } from '@/types/schedule.types'; // New

interface DayColumnProps {
  day: string;
  subjects: (SubjectData | null)[]; // Explicit null handling
  onDrop: (subject: SubjectData) => void; // Strict typing
}

export function DayColumn({ day, subjects, onDrop }: DayColumnProps) {
  const handleDrop = (subject: SubjectData | null) => {
    if (subject && isCompleteSubjectData(subject)) { // Type guard
      onDrop(subject);
    }
  };

  return (
    <div>
      {subjects.map((s, idx) => 
        s ? (
          <div key={s.subjectCode}>{s.subjectName}</div> // camelCase
        ) : (
          <div key={idx}>Empty</div>
        )
      )}
    </div>
  );
}
```

**Changes**:
1. Import from `schedule.types.ts` instead of `ui-state.ts`
2. Subjects array now `(SubjectData | null)[]` to handle empty slots
3. Function signature uses strict `SubjectData` (not `any`)
4. Type guard `isCompleteSubjectData` ensures data validity
5. Property access uses camelCase: `subjectCode`, `subjectName`
6. Explicit null checks with conditional rendering

---

## Phase 2.4: Legacy Cleanup

**Goal**: Remove deprecated types and ensure no regressions

**Duration**: 1-2 days

### Step 1: Verify No Legacy Imports Remain

**Search command**:
```bash
pnpm grep "from '@/types/ui-state'" src/
```

**Expected**: No matches (or only re-export statement)

### Step 2: Remove Legacy Types from ui-state.ts

**File**: `src/types/ui-state.ts`

**Before**:
```typescript
/**
 * @deprecated Use SubjectData from schedule.types.ts instead
 */
export interface SubjectData {
  Year?: number;
  // ... legacy fields
}

// Re-export new types
export type { SubjectData as StrictSubjectData } from './schedule.types';
```

**After** (final state):
```typescript
// Re-export all types from schedule.types.ts
export type {
  SubjectData,
  TimeslotData,
  TimeSlotGridData,
  BreakSlotData,
  DayOfWeekDisplay,
  CheckBreakTimeCallback,
  TimeSlotCssClassNameCallback,
  AddRoomModalCallback,
  AddBreakModalCallback,
  OpenArrangeModalCallback,
  HandleItemDoubleClickCallback,
} from './schedule.types';

// Type guards
export {
  isCompleteSubjectData,
  hasSubjectAssigned,
  isBreakTime,
} from './schedule.types';
```

### Step 3: Run Full Type Check

```bash
pnpm typecheck
```

**Expected**: 0 errors (all 115 previous errors resolved)

### Step 4: Run Full Test Suite

```bash
pnpm test
pnpm test:e2e
```

**Expected**: All tests pass ✅

### Step 5: Update Documentation

Update `COMPLETE_MIGRATION_SUMMARY.md`:

```markdown
## Phase 2 Type Safety Migration — COMPLETE ✅

**Date**: [Today's date]
**Duration**: 2-3 weeks

### Achievements

- ✅ Resolved 115 type errors in teacher-arrange feature
- ✅ Decomposed 1050-line monolith into 7 focused components
- ✅ Migrated all schedule arrangement components to strict types
- ✅ Removed legacy PascalCase type system
- ✅ Zero functionality regressions
- ✅ Test coverage maintained at 80%+

### Migration Statistics

- **Files migrated**: 15
- **Components decomposed**: 7
- **Lines of code refactored**: ~2000
- **Type errors resolved**: 115
- **'any' types eliminated**: 100%
- **Test coverage**: 82% → 85%

### Next Steps

Phase 3: Apply same patterns to:
- student-arrange feature
- class-arrange feature
- export features (PDF/Excel generation)
```

---

## Common Migration Patterns

### Pattern 1: API Response Transformation

**Problem**: API returns PascalCase data

**Solution**: Transform at boundary

```typescript
// Bad: Use API data directly
const subjects = await fetch('/api/subjects').then(r => r.json());
grid.subjects = subjects.data; // Type error: PascalCase vs camelCase

// Good: Transform at boundary
const response = await fetch('/api/subjects').then(r => r.json());
const subjects = transformLegacySubjects(response.data);
grid.subjects = subjects; // ✅ Strict types
```

### Pattern 2: Empty Slot Handling

**Problem**: Empty objects `{}` used for unassigned slots

**Solution**: Use `null` explicitly

```typescript
// Bad: Empty object
const emptySlot: SubjectData = {}; // Type error: missing required fields

// Good: Explicit null
const emptySlot: SubjectData | null = null; // ✅ Clear intent

// Rendering
{slot ? (
  <SubjectCard subject={slot} />
) : (
  <EmptySlotPlaceholder />
)}
```

### Pattern 3: Type Guards for Validation

**Problem**: Unsafe access to optional properties

**Solution**: Use type guards from schedule.types.ts

```typescript
import { isCompleteSubjectData, hasSubjectAssigned } from '@/types/schedule.types';

// Bad: No validation
function saveSchedule(subject: SubjectData) {
  api.save(subject.teacherID); // Runtime error if teacherID is missing
}

// Good: Type guard ensures completeness
function saveSchedule(subject: SubjectData | null) {
  if (subject && isCompleteSubjectData(subject)) {
    api.save(subject.teacherID); // ✅ Safe access
  } else {
    console.error('Incomplete subject data:', subject);
  }
}
```

### Pattern 4: Grade Level Casing

**Problem**: Grade level mixing `{ Year, Number }` and `{ year, number }`

**Solution**: Transform at read/write boundaries

```typescript
import { transformGradeLevel } from '@/utils/type-transformers';

// Reading from API (PascalCase)
const apiGrade = { Year: 1, Number: 2 };
const grade = transformGradeLevel(apiGrade); // { year: 1, number: 2 }

// Writing to UI (camelCase)
<GradePicker gradeLevel={grade} /> // ✅ Strict types
```

---

## Testing Strategy

### Unit Tests

**Focus**: Data transformations, type guards, business logic

**Files to test**:
- `type-transformers.ts`
- `useTeacherSchedule.ts`
- `useLockedSchedules.ts`
- Individual components (LockedScheduleList, DayColumn)

**Run**:
```bash
pnpm test:unit
```

### Integration Tests

**Focus**: Component interactions, API mocking, state management

**Scenarios**:
- Teacher selection updates schedule grid
- Drag-drop assigns subject to timeslot
- Locked schedules prevent modifications
- Grade level filters work correctly

**Run**:
```bash
pnpm test:integration
```

### E2E Tests

**Focus**: Full user workflows across pages

**Scenarios** (existing E2E suite):
- Admin arranges teacher schedule
- Admin locks timeslot for assembly
- Teacher views own schedule
- Student views class schedule

**Run**:
```bash
pnpm test:e2e
```

### Type Check

**Run after every component migration**:
```bash
pnpm typecheck
```

**Goal**: 0 errors at all times

---

## Rollback Plan

If migration causes critical issues:

### Emergency Rollback (Immediate)

1. **Revert last commit**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Redeploy previous version**:
   ```bash
   vercel rollback
   ```

3. **Notify team**: Post incident in Slack/email

### Component-Level Rollback (Surgical)

1. **Identify problematic component**:
   ```bash
   git log --oneline -- src/app/schedule/.../ComponentName.tsx
   ```

2. **Revert specific component**:
   ```bash
   git checkout <previous-commit-hash> -- ComponentName.tsx
   git commit -m "Rollback ComponentName migration"
   ```

3. **Run tests**:
   ```bash
   pnpm test ComponentName
   ```

### Prevention

- Migrate one component at a time
- Test thoroughly before moving to next component
- Deploy to staging first
- Keep feature flags for new components (if possible)

---

## Success Metrics

### Code Quality Metrics

- [ ] **Type errors**: 115 → 0
- [ ] **Explicit 'any' types**: 0 (enforced by ESLint)
- [ ] **Component size**: Max 300 lines per file
- [ ] **Test coverage**: Maintain 80%+ overall
- [ ] **TypeScript strict mode**: Enabled (future goal)

### Functional Metrics

- [ ] **Zero regressions**: All existing features work
- [ ] **Performance**: No degradation in page load times
- [ ] **Drag-drop**: Timeslot assignment still smooth
- [ ] **PDF/Excel exports**: Still generate correctly
- [ ] **Auth**: Google sign-in unaffected

### Developer Experience Metrics

- [ ] **Build time**: No significant increase
- [ ] **IntelliSense**: Autocomplete works for all types
- [ ] **Error messages**: Clear, actionable TypeScript errors
- [ ] **Onboarding**: New devs can understand type system in < 1 hour

---

## Timeline & Resource Allocation

### Week 1: Foundation + Decomposition

**Days 1-2**: Data transformation layer
- Create `type-transformers.ts`
- Write unit tests
- Verify transformations work

**Days 3-5**: Component decomposition
- Extract hooks: `useTeacherSchedule`, `useLockedSchedules`
- Extract components: `LockedScheduleList`, `TeacherSelector`
- Update page.tsx to use new structure

### Week 2: Component Migration (Batch 1)

**Days 1-2**: Data layer
- Migrate `useTeacherSchedule.ts`
- Migrate `useLockedSchedules.ts`
- Test API integrations

**Days 3-5**: Simple components
- Migrate `LockedScheduleList.tsx`
- Migrate `TeacherSelector.tsx`
- Run integration tests

### Week 3: Component Migration (Batch 2) + Cleanup

**Days 1-3**: Complex components
- Migrate `DayColumn.tsx`
- Migrate `TimeslotRow.tsx`
- Migrate `TeacherScheduleGrid.tsx`

**Days 4-5**: Cleanup + verification
- Remove legacy types from `ui-state.ts`
- Full type check: `pnpm typecheck`
- Full test suite: `pnpm test && pnpm test:e2e`
- Update documentation

---

## Communication Plan

### Daily Updates

**To**: Development team  
**Format**: Slack message or standup  
**Content**:
- Components migrated today
- Test results
- Issues encountered
- Next day's plan

### Weekly Summary

**To**: Product owner + stakeholders  
**Format**: Email or project management tool  
**Content**:
- Progress percentage
- Metrics (errors resolved, components migrated)
- Risks or blockers
- Adjusted timeline (if needed)

### Phase Completion

**To**: Entire team + management  
**Format**: Presentation or detailed doc  
**Content**:
- Phase 2 achievements summary
- Before/after code quality metrics
- Lessons learned
- Recommendations for Phase 3

---

## Risks & Mitigation

### Risk 1: Data Transformation Bugs

**Probability**: Medium  
**Impact**: High (data loss/corruption)

**Mitigation**:
- Write comprehensive unit tests for transformers
- Test with production data snapshots (anonymized)
- Add runtime validation logs
- Deploy to staging first

### Risk 2: Regression in Drag-Drop Functionality

**Probability**: Low  
**Impact**: High (core feature broken)

**Mitigation**:
- Test drag-drop after each component migration
- Use existing E2E tests
- Manual QA checklist
- Keep rollback plan ready

### Risk 3: Timeline Overrun

**Probability**: Medium  
**Impact**: Medium (delayed Phase 3)

**Mitigation**:
- Build buffer time into estimates (20%)
- Prioritize critical paths
- Timebox each component migration
- Escalate blockers early

### Risk 4: API Contract Changes

**Probability**: Low  
**Impact**: High (frontend-backend mismatch)

**Mitigation**:
- Coordinate with backend team
- Document expected API response format
- Use transformers to isolate changes
- Test with real API (not just mocks)

---

## Phase 3 Preview

After Phase 2 completes, apply same patterns to:

1. **student-arrange feature** (~500 lines)
2. **class-arrange feature** (~600 lines)
3. **Export features** (PDF/Excel generation)
4. **Dashboard components** (analytics, reports)

**Estimated Duration**: 2-3 weeks  
**Prerequisite**: Phase 2 complete with 0 regressions

---

## Appendix A: File Inventory

### Files to Migrate (Phase 2)

| File | Lines | Priority | Estimated Time |
|------|-------|----------|----------------|
| teacher-arrange/page.tsx | 1050 | High | 2-3 days |
| useTeacherSchedule.ts | NEW | High | 1 day |
| LockedScheduleList.tsx | NEW | Medium | 0.5 day |
| TeacherSelector.tsx | NEW | Medium | 0.5 day |
| DayColumn.tsx | NEW | Medium | 1 day |
| TimeslotRow.tsx | NEW | Medium | 1 day |
| TeacherScheduleGrid.tsx | NEW | High | 2 days |

**Total Estimated Time**: 8-10 days

### Files Already Migrated (Phase 1)

- ✅ `src/types/schedule.types.ts` (381 lines)
- ✅ `src/types/ui-state.ts` (updated with deprecations)
- ✅ `TimeslotCell.tsx` (268 lines)
- ✅ `arrangement-ui.store.ts` (565 lines)

---

## Appendix B: Type Reference Quick Guide

### SubjectData (New Format)

```typescript
interface SubjectData {
  // Required fields
  itemID: number;          // Unique identifier
  subjectCode: string;     // e.g., "CS101"
  subjectName: string;     // e.g., "Computer Science"
  gradeID: string;         // e.g., "M1-1"
  year: number;            // Grade year (1-6)
  number: number;          // Class number (1-20)
  teacherID: number;       // Assigned teacher
  category: string;        // "Core" | "Elective"
  credit: number;          // Credit hours
  teachHour: number;       // Teaching hours per week
  
  // Optional fields
  roomID?: number | null;
  roomName?: string | null;
}
```

### Type Guards

```typescript
// Check if subject has all required fields
isCompleteSubjectData(subject: unknown): subject is SubjectData

// Check if timeslot has subject assigned
hasSubjectAssigned(timeslot: unknown): boolean

// Check if timeslot is a break period
isBreakTime(item: unknown): item is BreakSlotData
```

### Callback Types

```typescript
type CheckBreakTimeCallback = (period: number) => boolean;
type AddRoomModalCallback = (args: { timeslotID: number; selectedSubject: SubjectData }) => void;
type HandleItemDoubleClickCallback = (item: SubjectData | null) => void;
```

---

## Questions & Support

**For migration questions**:
- Slack: #type-safety-migration channel
- Email: dev-team@school.edu
- Office hours: Daily 2-3 PM (sync call)

**For technical issues**:
- Create GitHub issue with label `type-migration`
- Tag: @senior-dev for urgent blockers

**For documentation updates**:
- Submit PR to update this doc
- Request review from migration lead

---

**Document Owner**: AI Agent (with human review)  
**Last Review**: 2025-01-20  
**Next Review**: After Phase 2.1 completion  
**Version**: 1.0
