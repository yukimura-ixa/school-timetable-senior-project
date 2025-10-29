# Lock Feature Migration - Complete ✅

**Date:** 2025-10-25  
**Status:** Complete - 0 TypeScript errors  
**Pattern:** Clean Architecture + Server Actions (React 19)  
**Complexity:** Medium

---

## Summary

Successfully migrated the **lock** feature from API Routes to Clean Architecture following the established pattern. The migration includes 4 files implementing 4 Server Actions with complex Prisma queries, nested loop bulk creation (cartesian product), and sophisticated data grouping logic.

---

## Files Created

### 1. Application Layer - Schemas
**File:** `src/features/lock/application/schemas/lock.schemas.ts`  
**Lines:** 65  
**Purpose:** Valibot validation schemas

```typescript
// 3 schemas defined
- getLockedSchedulesSchema (AcademicYear, Semester)
- createLockSchema (SubjectCode, RoomID, timeslots[], GradeIDs[], RespIDs[])
- deleteLocksSchema (ClassID[])
```

**Key Points:**
- Uses Valibot v1.1.0 syntax (v.object, v.pipe, v.enum, v.array, v.number)
- `semester` enum from Prisma (SEMESTER_1, SEMESTER_2)
- RoomID and RespIDs are Int (not String)
- Minimum length validation for arrays
- Thai error messages

---

### 2. Infrastructure Layer - Repository
**File:** `src/features/lock/infrastructure/repositories/lock.repository.ts`  
**Lines:** 147  
**Purpose:** Prisma database operations

```typescript
// 4 repository methods
- findLockedSchedules(academicYear, semester) // complex query with includes
- createLock(data) // single class_schedule create with relations
- deleteMany(classIds[])
- count(academicYear, semester)
```

**Key Logic:**
- **Complex query with includes:** room, timeslot, subject with teachers_responsibility
- **distinct: ['TeacherID']** prevents duplicate teachers
- **Returns RawLockedSchedule[]** with all relations for grouping
- **Connects 5 relations:** teachers_responsibility[], subject, timeslot, room, gradelevel

---

### 3. Domain Layer - Validation Service
**File:** `src/features/lock/domain/services/lock-validation.service.ts`  
**Lines:** 147  
**Purpose:** Business logic and data transformation

```typescript
// 5 pure functions
- generateClassID(timeslotId, subjectCode, gradeId) => string
- groupSchedulesBySubject(schedules[]) => GroupedLockedSchedule[]
- validateLockInput(input) => string | null
- calculateTotalSchedules(timeslotsCount, gradesCount) => number
```

**Business Rules:**
1. **ClassID Pattern:** `${TimeslotID}-${SubjectCode}-${GradeID}` (deterministic)
2. **Grouping Logic:** Groups by SubjectCode, collecting unique GradeIDs, timeslots, and all ClassIDs
3. **Minimum Requirements:** ≥1 timeslot, ≥1 grade, ≥1 responsibility
4. **Cartesian Product:** Total schedules = timeslots.length × grades.length

**Complex Grouping Logic:**
```typescript
// Groups schedules with same SubjectCode together
// Collects:
// - Unique GradeIDs (deduplicates)
// - Unique Timeslots (by TimeslotID)
// - All ClassIDs
// - Teachers and room info (from first occurrence)
```

---

### 4. Application Layer - Server Actions
**File:** `src/features/lock/application/actions/lock.actions.ts`  
**Lines:** 118  
**Purpose:** Server Actions with validation

```typescript
// 4 Server Actions
✅ getLockedSchedulesAction(input) // query + grouping
✅ createLockAction(input) // nested loop bulk create
✅ deleteLocksAction(classIds[]) // bulk delete
✅ getLockedScheduleCountAction(input) // statistics
```

**Patterns:**
- Uses `createAction()` wrapper for auth + validation
- Auto-validates with Valibot schemas
- Returns grouped data for GET (not raw database records)
- **Nested loops for bulk create** (timeslots × grades)
- Generates ClassIDs using domain service
- Thai error messages

---

## API Coverage

### Original API Routes (Migrated)

1. **GET /api/lock?AcademicYear=X&Semester=Y** → `getLockedSchedulesAction(input)`
   - Returns grouped schedules by SubjectCode
   - Includes teachers, room, timeslots, grades

2. **POST /api/lock** (bulk create) → `createLockAction(input)`
   - Input: { SubjectCode, RoomID, timeslots[], GradeIDs[], RespIDs[] }
   - Creates N schedules (timeslots × grades)
   - All IsLocked: true

3. **DELETE /api/lock** → `deleteLocksAction(classIds[])`
   - Bulk delete by ClassID array

**Additional Actions:**
- `getLockedScheduleCountAction()` (statistics)

---

## Key Features

### Cartesian Product Bulk Create

**Nested loop pattern:**
```typescript
// Input: 2 timeslots × 3 grades = 6 class schedules created
for (const timeslotId of input.timeslots) {      // ["MON-1", "TUE-1"]
  for (const gradeId of input.GradeIDs) {        // ["101", "102", "103"]
    const classId = generateClassID(timeslotId, input.SubjectCode, gradeId);
    // Creates: "MON-1-MATH101-101", "MON-1-MATH101-102", ...
    await lockRepository.createLock({ ... });
  }
}
```

**Example:**
- 2 timeslots × 3 grades = **6 class schedules**
- All share: same SubjectCode, RoomID, RespIDs, IsLocked: true
- Differ by: TimeslotID, GradeID, ClassID

### ClassID Generation Pattern

**Formula:**
```typescript
ClassID = `${TimeslotID}-${SubjectCode}-${GradeID}`
```

**Examples:**
- `MON-1-MATH101-101`
- `TUE-2-SCI101-201`

**Why deterministic:**
- Prevents duplicate schedules
- Easy to query/delete
- Human-readable format

### Complex Data Grouping

**Input (raw database records):**
```json
[
  { ClassID: "MON-1-MATH101-101", SubjectCode: "MATH101", GradeID: "101", ... },
  { ClassID: "MON-1-MATH101-102", SubjectCode: "MATH101", GradeID: "102", ... },
  { ClassID: "TUE-2-MATH101-101", SubjectCode: "MATH101", GradeID: "101", ... }
]
```

**Output (grouped by SubjectCode):**
```json
[
  {
    "SubjectCode": "MATH101",
    "SubjectName": "คณิตศาสตร์",
    "teachers": [{ ... }],
    "room": { ... },
    "GradeIDs": ["101", "102"],              // Unique grades
    "timeslots": [{ ... }, { ... }],         // Unique timeslots
    "ClassIDs": ["MON-1-...", "TUE-2-..."]   // All ClassIDs
  }
]
```

**Why group:**
- UI shows schedules by subject, not individual records
- Reduces data transfer
- Easier to display/manage locks

### Complex Prisma Query

```typescript
findMany({
  where: {
    timeslot: { AcademicYear, Semester },
    IsLocked: true,
  },
  include: {
    room: true,                          // RoomID, RoomName, Building, Floor
    timeslot: true,                      // Full timeslot data
    subject: {
      include: {
        teachers_responsibility: {
          distinct: ['TeacherID'],       // Prevent duplicate teachers
          include: { teacher: true },    // Full teacher data
        },
      },
    },
  },
})
```

**Includes 3 levels:**
1. Direct relations: room, timeslot, subject
2. Nested relation: subject → teachers_responsibility
3. Nested nested relation: teachers_responsibility → teacher

---

## Business Rules

1. **IsLocked Flag:**
   - All created schedules have `IsLocked: true`
   - Distinguishes locked schedules from regular class schedules

2. **Cartesian Product:**
   - Every timeslot × every grade combination creates one schedule
   - Example: 3 timeslots × 4 grades = 12 schedules

3. **ClassID Uniqueness:**
   - ClassID = TimeslotID-SubjectCode-GradeID
   - Prevents duplicate schedules at same timeslot for same subject/grade

4. **Required Relations:**
   - Subject (must exist)
   - Room (must exist, can be null in DB)
   - Timeslot (must exist)
   - GradeLevel (must exist)
   - Teachers_Responsibility (≥1 required)

5. **Query Filtering:**
   - Always filtered by AcademicYear + Semester
   - Only returns IsLocked: true records

---

## Testing Notes

### Unit Test Coverage Needed

```typescript
// lock-validation.service.test.ts
describe('generateClassID', () => {
  it('should generate ClassID with pattern TimeslotID-SubjectCode-GradeID', () => {
    const result = generateClassID('MON-1', 'MATH101', '101');
    expect(result).toBe('MON-1-MATH101-101');
  });
});

describe('groupSchedulesBySubject', () => {
  it('should group schedules by SubjectCode', () => {
    const schedules = [
      { SubjectCode: 'MATH101', GradeID: '101', ... },
      { SubjectCode: 'MATH101', GradeID: '102', ... },
      { SubjectCode: 'SCI101', GradeID: '101', ... },
    ];
    const grouped = groupSchedulesBySubject(schedules);
    expect(grouped).toHaveLength(2);
    expect(grouped[0].SubjectCode).toBe('MATH101');
    expect(grouped[0].GradeIDs).toEqual(['101', '102']);
  });

  it('should deduplicate GradeIDs and Timeslots', () => {
    // Test deduplication logic
  });
});

describe('validateLockInput', () => {
  it('should return error if timeslots is empty', () => {
    const error = validateLockInput({ timeslots: [], GradeIDs: ['101'], RespIDs: [1] });
    expect(error).toContain('คาบเรียน');
  });
});

describe('calculateTotalSchedules', () => {
  it('should return cartesian product', () => {
    expect(calculateTotalSchedules(3, 4)).toBe(12);
  });
});
```

### E2E Test Scenarios

```typescript
// Lock feature E2E
test('Admin can create locked schedules for multiple timeslots and grades', async ({ page }) => {
  // Select subject, room, 2 timeslots, 3 grades
  // Submit
  // Verify 6 schedules created (2 × 3)
  // Verify all have IsLocked: true
});

test('Admin can view locked schedules grouped by subject', async ({ page }) => {
  // Navigate to locks page
  // Verify schedules grouped by SubjectCode
  // Verify each group shows: teachers, room, timeslots, grades
});

test('Admin can delete locked schedules in bulk', async ({ page }) => {
  // Select multiple locked schedules
  // Delete
  // Verify all removed
});
```

---

## Migration Progress

| Feature | Status | Files | Actions | Complexity | Notes |
|---------|--------|-------|---------|------------|-------|
| **Teacher** | ✅ Complete | 4 | 7 | Low | Reference |
| **Room** | ✅ Complete | 4 | 8 | Low | Available rooms |
| **GradeLevel** | ✅ Complete | 4 | 8 | Low | Lock query |
| **Program** | ✅ Complete | 4 | 7 | Low | Many-to-many |
| **Timeslot** | ✅ Complete | 4 | 6 | Medium | Complex algorithm |
| **Subject** | ✅ Complete | 4 | 8 | Low | Dual uniqueness |
| **Lock** | ✅ Complete | 4 | 4 | Medium | **Cartesian product** |
| Config | ⏳ Pending | - | - | High | Next |
| Assign | ⏳ Pending | - | - | Medium | - |
| Class | ⏳ Pending | - | - | High | - |

**Total Progress:** 7/10 features complete (70%) 🎉

---

## Next Steps

### 1. Config Feature Migration
- Priority: Next (Priority 2)
- Complexity: High
- Estimated: 4 hours
- Files: 4 (schemas, repository, validation, actions)
- Key: JSON configuration management, complex validation

### 2. Frontend Updates (After All Migrations)
- Update lock management UI to use `createLockAction()`
- Display grouped schedules by subject
- Show cartesian product preview (N timeslots × M grades = X schedules)
- Handle bulk delete with confirmation
- Use React 19 `use()` hook for async data

---

## Verification Checklist

- ✅ All files have 0 TypeScript errors
- ✅ Follows established pattern from previous features
- ✅ Uses Valibot (not Zod) for validation
- ✅ All repository methods use Prisma
- ✅ Pure validation/grouping functions in domain layer
- ✅ Server Actions use `createAction()` wrapper
- ✅ Thai error messages throughout
- ✅ Bulk operations supported
- ✅ ClassID generation is deterministic
- ✅ Complex grouping logic extracted to domain service
- ✅ Cartesian product bulk create pattern preserved
- ✅ Type safety: RoomID and RespID are Int (not String)

---

## Evidence Panel

### Library Versions (from context7)
```json
{
  "next": "16.0.0",
  "react": "19.2.0",
  "valibot": "1.1.0",
  "prisma": "6.18.0",
  "@prisma/client": "6.18.0"
}
```

### APIs Used
- **Valibot:** `v.object`, `v.pipe`, `v.string`, `v.number`, `v.enum`, `v.array`, `v.integer`, `v.minValue`, `v.minLength`, `InferOutput`
- **Prisma:** `findMany`, `create`, `deleteMany`, `count`, complex `include` with nested relations
- **Prisma Enums:** `semester`
- **JavaScript:** `Array.reduce()`, `Array.map()`, `Array.find()`, nested loops
- **Next.js:** Server Actions (`'use server'`), `createAction` wrapper

---

## Known Issues & Future Work

### ClassID Update/Delete Cascades
```typescript
// ClassID is referenced by:
// - teachers_responsibility.class_schedule (many-to-many)
// Consider: ON DELETE CASCADE behavior
```

### Duplicate Prevention
```typescript
// Current: ClassID pattern prevents duplicates
// Future: Add unique constraint in Prisma schema?
// model class_schedule {
//   @@unique([TimeslotID, SubjectCode, GradeID])
// }
```

### Bulk Create Performance
```typescript
// Current: Sequential creates in nested loops
// Future: Use Prisma createMany for better performance
// Note: createMany doesn't support nested connects
// Tradeoff: Performance vs relation handling
```

### Grouping Logic Testing
```typescript
// Complex reduce logic needs thorough testing
// Edge cases:
// - Empty input
// - Single schedule
// - Multiple subjects
// - Duplicate detection
```

---

## Complexity Analysis

**Why Medium Complexity:**

1. **Complex Prisma Query**
   - 3-level nested includes
   - distinct filtering
   - Multiple relations

2. **Cartesian Product Logic**
   - Nested loops
   - N × M creates
   - Deterministic ClassID generation

3. **Data Transformation**
   - Raw DB records → Grouped by subject
   - Deduplication logic (GradeIDs, Timeslots)
   - Array aggregation

4. **Multiple Relations**
   - Connects: subject, room, timeslot, gradelevel, teachers_responsibility[]
   - Validates: all relations must exist

5. **Pure Function Extraction**
   - generateClassID
   - groupSchedulesBySubject
   - calculateTotalSchedules
   - All testable independently

---

## Rollback Plan

If issues arise:
1. Keep API routes at `src/app/api/lock/` active
2. Feature flags in frontend to switch between API/Server Actions
3. Monitor for ClassID generation issues
4. Monitor for bulk create performance
5. Full rollback: delete `src/features/lock/` directory

---

**Migration Completed By:** AI Agent (Sequential-Thinking + Serena + context7)  
**Review Required:** Yes - verify cartesian product logic and grouping behavior  
**Deploy Status:** Ready for staging after frontend integration
