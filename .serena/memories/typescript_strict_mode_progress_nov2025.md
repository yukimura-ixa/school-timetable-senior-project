# TypeScript Strict Mode Migration Progress

**Status**: Active - Session 3 Complete (62% reduction overall)
**Issue**: #50
**Branch**: main

## Progress Overview

### Session 3 (Nov 4, 2025) - Arrange & Management Fixes
- **Starting**: 241 errors
- **Ending**: 205 errors
- **Fixed**: 36 errors (-15%)
- **Time**: ~15 minutes
- **Commit**: `ae6e925`

### Overall Progress
- **Original**: 543 TypeScript strict errors
- **Current**: 205 errors
- **Reduction**: 338 errors fixed (62% complete)
- **Velocity**: ~120 errors/hour with patterns

## Key Discovery: Fast Iteration Workflow

Using `pnpm typecheck` instead of full builds:
```bash
# 10x faster than pnpm build
pnpm typecheck

# Watch mode for continuous feedback
pnpm typecheck:watch

# Count remaining errors
$output = pnpm typecheck 2>&1 | Out-String; ($output -split "`n" | Select-String "error TS").Count
```

Benefits:
- **Speed**: Seconds vs minutes per iteration
- **Focus**: Only TypeScript errors, no build overhead
- **Batch Processing**: Fix 5-10 errors, verify, repeat

## Fix Patterns (8 patterns established)

### Pattern 1: Dropdown Component Type Fix
```typescript
// OLD (causes TS2322)
handleChange={(value: string) => {
  setState(value);
}}

// NEW (correct Dropdown signature)
handleChange={(value: unknown) => {
  setState(value as string);
}}

// Applies to all Dropdown components in codebase
```

### Pattern 2: Optional Chaining for Undefined Guards
```typescript
// OLD
const duplicate = allData.find((r) => r.RoomName.toLowerCase() === ...);

// NEW
const duplicate = allData.find((r) => r.RoomName?.toLowerCase() === ...);
```

### Pattern 3: Boolean Prop Explicit Values
```typescript
// OLD
<Component disabled={disabled} />

// NEW
<Component disabled={disabled === true} />
```

### Pattern 4: SWR Mutate Type Annotation
```typescript
// OLD
const handleUpdate = async (updatedItem) => { ... }

// NEW
const handleUpdate = async (updatedItem: MyType) => { ... }
```

### Pattern 5: Split Type Parsing
```typescript
// OLD
const parts = str.split(',');
const value = parts[0]; // possibly undefined

// NEW
const parts = str.split(',');
const value = parts[0] ?? ''; // fallback
```

### Pattern 6: Type-Only Imports
```typescript
// Mixed usage causing circular deps
import { MyType } from './file';

// Separate type imports
import type { MyType } from './file';
```

### Pattern 7: Split Guard Pattern (NEW - Session 3)
```typescript
// After string.split(), values could be undefined
const [semester, academicYear] = semesterAndYear.split('-');

// Add guard immediately after split
if (!semester || !academicYear) {
  return <ErrorComponent message="Invalid format" />;
}

// Now safe to use semester and academicYear
const result = await fetchData(semester, academicYear);
```

### Pattern 8: Regex Match Guard (NEW - Session 3)
```typescript
// Regex match returns null if no match, capture groups could be undefined
const match = str?.match(/pattern(\d)/);

// Guard both the match object AND the capture group
if (!match || !match[1]) return false;

// Now safe to use
const value = parseInt(match[1]);
```

## Session 3 Files Fixed (20 fixes)

### Management Directory (5 fixes) ✅
1. `management/rooms/component/RoomsTable.tsx` (2 fixes)
   - Line 55: `r.RoomName?.toLowerCase()` (optional chaining)
   - Line 55: `data.RoomName?.toLowerCase()` (optional chaining)

2. `management/subject/component/ConfirmDeleteModal.tsx` (1 fix)
   - Line 38: `checkedList: string[]` (type annotation)

3. `management/teacher/component/ConfirmDeleteModal.tsx` (1 fix)
   - Line 39: `checkedList: string[]` (type annotation)

4. `management/teacher/component/EditModalForm.tsx` (2 fixes)
   - Line 145: Dropdown `handleChange: (value: unknown)`
   - Line 237: Dropdown `handleChange: (value: unknown)`

### Schedule/Arrange Directory (31 fixes) ✅

5. `schedule/[semesterAndyear]/arrange/_components/SearchableSubjectPalette.tsx` (1 fix)
   - Line 96: `if (!match || !match[1])` (regex guard)

6. `schedule/[semesterAndyear]/arrange/_components/GradeClassView.tsx` (3 fixes)
   - Line 151: `schedules[0]?.subject` (optional chaining)
   - Line 152: `schedules[0]?.teachers_responsibility` (optional chaining)
   - Line 163: `subject?.SubjectName` (optional chaining)

7. `schedule/[semesterAndyear]/arrange/_components/TimetableGrid.tsx` (2 fixes)
   - Line 84: `organized[slot.DayOfWeek]?.push()` (optional chaining)
   - Line 90: `organized[day]?.sort()` (optional chaining)

8. `schedule/[semesterAndyear]/arrange/component/SelectRoomToTimeslotModal.tsx` (2 fixes)
   - Line 117: `renderItem: ({ data }: { data: unknown })`
   - Line 123: `handleChange: (data: unknown)`

9. `schedule/[semesterAndyear]/arrange/component/TimeslotCell.tsx` (2 fixes)
   - Line 127: `item.subject ?? null` (nullish coalescing)
   - Line 207: `(item.subject.roomName ?? "").substring()` (nullish coalescing)
   - Added `item.subject && (...)` wrapper for subject details block

10. `schedule/[semesterAndyear]/arrange/page.tsx` (3 fixes)
    - Added guard after `semesterAndYear.split('-')`
    - Lines 120, 231, 248: All semester undefined issues resolved

## Remaining Work: 205 Errors

### High Priority (~30 errors, ~30 mins estimated)

1. **teacher-arrange/page.tsx** (~10 errors)
   - Location: `schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`
   - Issues:
     - Line 501-518: Object possibly undefined (5 errors)
     - Line 877: `Type 'SubjectData | null' is not assignable to type 'SubjectData'`
     - Line 1301: Function parameter signature `(subject: SubjectData | null, timeSlotID: string) => void`
     - Line 1302: `Type 'SubjectPayload | null' is not assignable to type 'SubjectPayload'`
   - Pattern: Add null guards and update function signatures

2. **assign/SelectClassRoomModal.tsx** (1 error)
   - Line 50: ClassRoomItem type with `GradeID?: string | undefined`
   - Fix: Update ClassRoomItem interface or use Partial<ClassRoomItem>

3. **assign/ShowTeacherData.tsx** (1 error)
   - Line 122: `Type 'unknown' is not assignable to type 'ReactNode'`
   - Fix: Type assertion or proper typing for Box component children

### Medium Priority (~70 errors, ~2 hours estimated)

4. **assign/teacher_responsibility/page.tsx** (~20 errors)
   - Location: `schedule/[semesterAndyear]/assign/teacher_responsibility/page.tsx`
   - Issues:
     - Line 38: `string | undefined` argument
     - Lines 97-112: Heavy implicit `any` in data transformations
     - Multiple callback parameters lacking types
   - Pattern: Add type annotations for all callbacks and parameters

5. **config directory** (~20 errors)
   - TimeslotPreview components
   - Undefined guards needed for component props
   - Pattern: Optional chaining and default props

### Lower Priority (~100 errors, deferred)

6. **dashboard/utility directory** (~81 errors)
   - Teacher/student table components
   - Export functions (Excel/PDF)
   - Defer until user-facing features stabilized

## Testing Strategy

### Unit Tests (Jest) - All Passing ✅
- **Status**: 50+ tests passing across 4 test files
- **Workaround**: `forceExit: true` in jest.config.js (Issue #46)
- **Coverage**: Business logic, validation, repository methods

### Type Checking
```bash
# Fast iteration (10x faster than build)
pnpm typecheck

# Watch mode
pnpm typecheck:watch

# Full build validation
pnpm build
```

### E2E Tests (Playwright)
- **Status**: Not yet run with strict mode changes
- **Action**: Run before merging to main
- **Command**: `pnpm test:e2e`

## Next Session Plan

### Target: teacher-arrange/page.tsx (~10 errors, 30 mins)

1. **Lines 501-518**: Add object existence guards
```typescript
// Before
const subject = schedules[0].subject;
const teacher = schedules[0].teachers_responsibility[0].teacher;

// After
const subject = schedules[0]?.subject;
const teacher = schedules[0]?.teachers_responsibility[0]?.teacher;
```

2. **Line 877**: Handle null case
```typescript
// Update function signature or add null guard
if (!subject) return;
handleSubject(subject, timeSlotID);
```

3. **Lines 1301-1302**: Update function signatures
```typescript
// Update interface to accept null
type HandleSubject = (subject: SubjectData | null, timeSlotID: string) => void;
```

### Estimated Timeline
- **Next session**: 30 minutes (teacher-arrange.tsx + quick wins)
- **Following session**: 2 hours (assign/teacher_responsibility heavy any types)
- **Final cleanup**: 1 hour (remaining scattered errors)
- **Total remaining**: ~3.5 hours estimated

## Technical Notes

### Known Issues
- **Next.js 16 + Jest**: Stack overflow with unhandled rejections (Issue #46)
  - Workaround: `forceExit: true` in jest.config.js
  - Waiting for Next.js 16.1+ upstream fix

### Build Configuration
- TypeScript strict mode: ✅ Enabled
- Sentry: ❌ Temporarily disabled (reduce build noise)
- Next.js: 16.0.1 with Turbopack default

### Performance Metrics
- **Session 1**: 543 → 241 (302 fixed, ~2 hours) = 151 errors/hour
- **Session 3**: 241 → 205 (36 fixed, ~15 mins) = 144 errors/hour
- **Average**: ~120-150 errors/hour with patterns
- **Velocity trend**: Stable with pattern application

### Commits
- Session 1: `7fc2fc7` (302 errors fixed)
- Session 3: `ae6e925` (36 errors fixed)

## References
- **Issue**: [#50](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/50)
- **Docs**: AGENTS.md (Section 5: Coding Standards)
- **Patterns**: Based on Next.js 16, MUI 7, TypeScript 5.7 best practices
