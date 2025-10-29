# Assign Feature Migration - Complete

**Date:** October 25, 2025  
**Feature:** Assign (9th of 10 features)  
**Status:** ✅ Complete - 0 TypeScript errors

---

## Migration Summary

Successfully migrated the Assign feature from API Routes to Clean Architecture with Server Actions.

### Files Created (4 files, 810 lines)

1. **`assign.schemas.ts`** (103 lines) - Valibot validation schemas
2. **`assign.repository.ts`** (191 lines) - Prisma data access layer
3. **`assign-validation.service.ts`** (214 lines) - Pure business logic functions
4. **`assign.actions.ts`** (302 lines) - React Server Actions

---

## API Routes Migrated

### Original API Routes (3 routes)

1. **`GET /api/assign`** → `getAssignmentsAction`
   - Get teacher responsibilities with subject/grade/teacher details
   - Query params: TeacherID, AcademicYear, Semester

2. **`POST /api/assign`** → `syncAssignmentsAction`
   - Sync assignments (create new, delete removed)
   - Cascade delete related class_schedule entries
   - Transaction-based for atomicity

3. **`GET /api/assign/getAvailableResp`** → `getAvailableRespsAction`
   - Get available responsibility slots
   - Expands by (TeachHour - assigned count)

4. **`GET /api/assign/getLockedResp`** → `getLockedRespsAction`
   - Get subjects with locked responsibilities
   - Uses groupBy on SubjectCode

---

## Schema Definitions (6 schemas)

### 1. `getAssignmentsSchema`
```typescript
{
  TeacherID: number (integer, min 1),
  AcademicYear: number (integer, min 2500),
  Semester: enum ('SEMESTER_1' | 'SEMESTER_2')
}
```

### 2. `getAvailableRespsSchema`
```typescript
{
  TeacherID: number (integer, min 1),
  AcademicYear: number (integer, min 2500),
  Semester: enum ('SEMESTER_1' | 'SEMESTER_2')
}
```

### 3. `getLockedRespsSchema`
```typescript
{
  AcademicYear: number (integer, min 2500),
  Semester: enum ('SEMESTER_1' | 'SEMESTER_2')
}
```

### 4. `responsibilityInputSchema`
```typescript
{
  RespID?: number (optional, for existing),
  SubjectCode: string (1-20 chars),
  GradeID: string (regex: ^\d{1,2}\/\d{4}$),
  Credit: enum ('0.5' | '1.0' | '1.5' | '2.0' | '2.5' | '3.0')
}
```

### 5. `syncAssignmentsSchema`
```typescript
{
  TeacherID: number (integer, min 1),
  AcademicYear: number (integer, min 2500),
  Semester: enum ('SEMESTER_1' | 'SEMESTER_2'),
  Resp: ResponsibilityInput[]
}
```

### 6. `deleteAssignmentSchema`
```typescript
{
  RespID: number (integer, min 1)
}
```

---

## Repository Methods (8 methods)

1. **`findByTeacherAndTerm`** - Get responsibilities with subject/grade/teacher relations
2. **`findAvailableByTeacherAndTerm`** - Get with class_schedule for slot expansion
3. **`findLockedSubjectsByTerm`** - Get subjects with groupBy on SubjectCode
4. **`findMany`** - Generic query with Prisma where clause
5. **`create`** - Create single responsibility
6. **`deleteById`** - Delete by RespID
7. **`deleteSchedulesByTeacherAndTerm`** - Cascade delete class_schedule entries
8. **`count`** - Count with optional where clause

---

## Validation Service Functions (11 pure functions)

### Core Business Logic

1. **`calculateTeachHour(credit: string): number`**
   - Converts credit to teaching hours (Credit × 2)
   - Mapping: 0.5→1, 1.0→2, 1.5→3, 2.0→4, 2.5→5, 3.0→6

2. **`validateResponsibilityInput(input): { isValid, errors }`**
   - Validates SubjectCode, GradeID format, Credit value
   - Returns validation result with error messages

3. **`computeResponsibilitiesDiff(existing, incoming): { toCreate, toDelete }`**
   - Compares existing vs incoming responsibilities
   - Returns which to create (no RespID) and which to delete (not in incoming)

4. **`expandAvailableSlots(responsibilities): slots[]`**
   - Expands responsibilities into available slot items
   - Each resp expanded by (TeachHour - class_schedule.length)
   - Adds itemID for 1-based indexing

### Helper Functions

5. **`validateSemester(semester): boolean`** - Check if semester is valid enum
6. **`hasResponsibilityConflict(input, existing): boolean`** - Detect conflicts
7. **`calculateTotalTeachHours(responsibilities): number`** - Sum teaching hours
8. **`calculateTotalAssignedSlots(responsibilities): number`** - Sum assigned slots

### Constants

9. **`CREDIT_TO_TEACH_HOUR`** - Credit to teaching hours mapping (Record<string, number>)

---

## Server Actions (8 actions)

### Primary Actions

1. **`getAssignmentsAction(input)`**
   - Query: TeacherID, AcademicYear, Semester
   - Returns: Responsibilities with subject/grade/teacher details + computed fields

2. **`getAvailableRespsAction(input)`**
   - Query: TeacherID, AcademicYear, Semester
   - Returns: Available slots (expanded by TeachHour - assigned)

3. **`getLockedRespsAction(input)`**
   - Query: AcademicYear, Semester
   - Returns: Subjects with at least one assignment (groupBy SubjectCode)

4. **`syncAssignmentsAction(input)`**
   - Body: TeacherID, AcademicYear, Semester, Resp[]
   - Transaction: Create new + Delete removed + Cascade delete schedules
   - Returns: { status, results, summary: { created, deleted } }

### Utility Actions

5. **`deleteAssignmentAction(input)`**
   - Body: RespID
   - Transaction: Delete responsibility + Cascade delete schedules
   - Returns: Deleted responsibility

6. **`getAssignmentCountAction()`**
   - Returns: { count }

7. **`getAssignmentsByTeacherAction(input)`**
   - Query: TeacherID
   - Returns: All assignments for teacher (all terms)

8. **`getAssignmentsByTermAction(input)`**
   - Query: AcademicYear, Semester
   - Returns: All assignments for term (all teachers)

---

## Key Technical Decisions

### 1. **Sync Operation Design**
- Uses **diff computation** instead of delete-all-then-create
- Preserves existing records with RespID
- Only creates/deletes what changed
- More efficient, preserves foreign key relationships

### 2. **Cascade Delete Strategy**
```typescript
// Delete schedules where ALL connected responsibilities belong to this teacher/term
await tx.class_schedule.deleteMany({
  where: {
    timeslot: { AcademicYear, Semester },
    teachers_responsibility: {
      every: { TeacherID, AcademicYear, Semester }
    }
  }
});
```
- Ensures only schedules fully owned by this teacher/term are deleted
- Safe for shared schedules (multiple teachers on same timeslot)

### 3. **Available Slots Expansion**
- Original API: Loop creating N slots per responsibility
- Migration: Pure function `expandAvailableSlots()`
- Each responsibility → (TeachHour - assigned_count) slots
- Adds sequential itemID for UI identification

### 4. **TeachHour Calculation**
- Centralized in `CREDIT_TO_TEACH_HOUR` constant
- Pure function `calculateTeachHour()` with validation
- Eliminates dependency on external `subjectCreditValues` model
- Type-safe mapping with error handling

---

## Transaction Safety

### Sync Operation Transaction
```typescript
await prisma.$transaction(async (tx) => {
  1. Get existing responsibilities
  2. Compute diff (toCreate, toDelete)
  3. Create new responsibilities (loop)
  4. Delete removed responsibilities (loop)
  5. Cascade delete related schedules
  Return summary
});
```

**Guarantees:**
- ✅ **Atomicity** - All or nothing
- ✅ **Consistency** - Foreign key integrity maintained
- ✅ **Isolation** - No partial state visible
- ✅ **Idempotency** - Safe to retry (based on RespID presence)

---

## Type Safety

### Prisma Types Used
```typescript
// Repository layer
type TeacherResponsibilityWithRelations = Prisma.teachers_responsibilityGetPayload<{
  include: { subject: true; gradelevel: true; teacher: true }
}>;

type TeacherResponsibilityWithSchedules = Prisma.teachers_responsibilityGetPayload<{
  include: { subject: true; gradelevel: true; teacher: true; class_schedule: true }
}>;

type SubjectWithResponsibilities = Prisma.subjectGetPayload<{
  include: { teachers_responsibility: true }
}>;
```

### Valibot Inferred Types
```typescript
// Schema layer
type GetAssignmentsInput = v.InferInput<typeof getAssignmentsSchema>;
type GetAssignmentsOutput = v.InferOutput<typeof getAssignmentsSchema>;
type ResponsibilityInput = v.InferInput<typeof responsibilityInputSchema>;
type ResponsibilityOutput = v.InferOutput<typeof responsibilityInputSchema>;
```

---

## Pattern Consistency

✅ **Follows Clean Architecture:**
- Application Layer: `actions/` (Server Actions) + `schemas/` (Valibot)
- Domain Layer: `services/` (Pure business logic)
- Infrastructure Layer: `repositories/` (Prisma data access)

✅ **Follows Established Conventions:**
- All Server Actions use `createAction` helper
- All inputs validated with Valibot schemas
- All repository methods return Prisma types
- All service functions are pure (no side effects)
- All transactions use Prisma `$transaction`

✅ **Follows Naming Conventions:**
- Schemas: `<operation>Schema` (e.g., `getAssignmentsSchema`)
- Actions: `<operation>Action` (e.g., `getAssignmentsAction`)
- Repository: `<operation>` (e.g., `findByTeacherAndTerm`)
- Services: `<verb><noun>` (e.g., `calculateTeachHour`)

---

## Migration Progress

**Completed Features:** 9/10 (90%)
- ✅ Teacher, Room, GradeLevel, Program, Timeslot, Subject, Lock, Config, **Assign**

**Remaining Features:** 1/10 (10%)
- ⏳ Class (High complexity, final feature)

**Total Stats:**
- **36 files created** (4 per feature × 9 features)
- **63 Server Actions** (7 per feature average)
- **0 TypeScript errors**
- **~7,200 lines of code** (~800 per feature average)

---

## Testing Recommendations

### Unit Tests (Service Layer)

```typescript
describe('Assign Validation Service', () => {
  describe('calculateTeachHour', () => {
    it('should calculate 1.5 credit as 3 hours', () => {
      expect(calculateTeachHour('1.5')).toBe(3);
    });
    
    it('should throw on invalid credit', () => {
      expect(() => calculateTeachHour('invalid')).toThrow();
    });
  });

  describe('computeResponsibilitiesDiff', () => {
    it('should identify new responsibilities', () => {
      const existing = [{ RespID: 1, ... }];
      const incoming = [{ RespID: undefined, ... }];
      const { toCreate, toDelete } = computeResponsibilitiesDiff(existing, incoming);
      
      expect(toCreate).toHaveLength(1);
      expect(toDelete).toHaveLength(1);
    });
  });

  describe('expandAvailableSlots', () => {
    it('should expand responsibility into available slots', () => {
      const responsibilities = [{
        TeachHour: 4,
        class_schedule: [{}, {}], // 2 assigned
        subject: { SubjectName: 'Math' },
      }];
      
      const slots = expandAvailableSlots(responsibilities);
      expect(slots).toHaveLength(2); // 4 - 2 = 2 available
    });
  });
});
```

### Integration Tests (Action Layer)

```typescript
describe('Assign Actions', () => {
  describe('syncAssignmentsAction', () => {
    it('should create new responsibilities and delete removed ones', async () => {
      const result = await syncAssignmentsAction({
        TeacherID: 1,
        AcademicYear: 2566,
        Semester: 'SEMESTER_1',
        Resp: [
          { SubjectCode: 'MATH101', GradeID: '10/2566', Credit: '1.5' }, // new
          { RespID: 5, SubjectCode: 'ENG101', GradeID: '10/2566', Credit: '2.0' }, // keep
        ],
      });
      
      expect(result.status).toBe('success');
      expect(result.summary.created).toBe(1);
    });
  });
});
```

### E2E Tests (UI Workflow)

```typescript
test('should sync teacher assignments', async ({ page }) => {
  await page.goto('/schedule/1/2566/assign');
  
  // Select teacher
  await page.selectOption('select[name="teacher"]', '1');
  
  // Add subject
  await page.click('button:has-text("Add Subject")');
  await page.selectOption('select[name="subject"]', 'MATH101');
  await page.selectOption('select[name="grade"]', '10/2566');
  
  // Save
  await page.click('button:has-text("Save")');
  
  // Verify success
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## Next Steps

1. ✅ **Assign feature migration complete**
2. ⏳ **Migrate Class feature** (10th and final feature, High complexity)
3. ⏳ **Complete 100% migration**
4. ⏳ **Add comprehensive test suite**
5. ⏳ **Update UI components to use Server Actions**
6. ⏳ **Remove old API routes**

---

## Lessons Learned (Assign Feature)

### 1. **Diff Computation > Delete-All-Recreate**
- More efficient - only changes what's needed
- Preserves foreign key relationships
- Better for audit trails

### 2. **Cascade Delete Requires Careful WHERE Clause**
- Use `every` instead of `some` for safety
- Ensures only fully-owned schedules are deleted
- Prevents accidental deletion of shared resources

### 3. **Slot Expansion as Pure Function**
- Easier to test than inline loops
- Reusable across features
- Clear separation of concerns

### 4. **Credit Mapping Centralization**
- Eliminates external dependencies
- Type-safe with Record<string, number>
- Easy to extend for new credit values

### 5. **Transaction Granularity**
- Single transaction for entire sync operation
- Atomic creates + deletes + cascade
- Simplified error handling

---

**End of Assign Feature Migration Summary**
