# ClassID Int Migration - Phase 2 TODO

**Status**: Phase 1 Complete (Schema + Types Updated)  
**Date**: December 6, 2025  
**Migration**: `20251206092424_add_displayid_string_classid_int`

---

## ✅ Phase 1 Completed

### Schema Changes
- ✅ `gradelevel.DisplayID` added as `String @unique`
- ✅ `class_schedule.ClassID` changed from `String @id` to `Int @id @default(autoincrement())`
- ✅ Migration generated and applied to local database
- ✅ Prisma Client regenerated

### Code Updates
- ✅ Seed file updated (demo + full test data)
  - DisplayID: `String((year * 100) + number)` (e.g., "101", "102", "605")
  - ClassID generation removed (now autoincrement)
- ✅ Utility function created: `src/utils/grade-display.ts`
  - `formatGradeDisplay("101")` → `"ม.1/1"`
  - `parseGradeIdToDisplayId("M1-1")` → `"101"`
- ✅ Type definitions updated (5 files)
  - `ClassID?: string` → `ClassID?: number`
- ✅ Valibot schemas updated (3 schemas)
  - String validation → Number validation (integer, minValue 1)

### Database State
- ✅ Local database migrated and seeded successfully
- ⚠️ Production/test databases need migration after Phase 2 completion

---

## 🚧 Phase 2 Required Changes

**Total TypeScript Errors**: 29 errors across 9 files

### Category 1: Remove parseInt() Calls (4 errors)
**File**: `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`

Lines 534, 734, 787: Remove `parseInt()` wrapper since ClassID is now number
```typescript
// BEFORE
itemID: parseInt(matchedSlot.ClassID)

// AFTER
itemID: matchedSlot.ClassID
```

---

### Category 2: Repository Method Signatures (10+ errors)
**Files**:
- `src/features/schedule-arrangement/infrastructure/repositories/schedule.repository.ts`
- `src/features/schedule-arrangement/application/actions/schedule-arrangement.actions.ts`

**Changes Needed**:
1. Update repository method signatures:
   - `findScheduleById(classId: string)` → `findScheduleById(classId: number)`
   - `deleteSchedule(classId: string)` → `deleteSchedule(classId: number)`
   - `updateSchedule(classId: string, ...)` → `updateSchedule(classId: number, ...)`

2. Update Prisma where clauses:
   ```typescript
   // BEFORE
   where: { ClassID: classId } // classId is string
   
   // AFTER
   where: { ClassID: classId } // classId is number
   ```

---

### Category 3: Domain Models - scheduleId Type (4 errors)
**File**: `src/features/conflict/infrastructure/repositories/conflict.repository.ts`

**Affected Interfaces** (lines 72, 90, 108, 121):
```typescript
// BEFORE
export interface TeacherConflict {
  conflicts: Array<{
    scheduleId: string;  // CHANGE TO number
    // ...
  }>;
}

export interface RoomConflict {
  conflicts: Array<{
    scheduleId: string;  // CHANGE TO number
    // ...
  }>;
}

export interface ClassConflict {
  conflicts: Array<{
    scheduleId: string;  // CHANGE TO number
    // ...
  }>;
}

export interface UnassignedSchedule {
  scheduleId: string;  // CHANGE TO number
  // ...
}
```

**Map Operations** (lines 241, 282, 325, 365): Update to use `schedule.ClassID` directly (already number)

---

### Category 4: Domain Models - Input Types (4 errors)
**File**: `src/features/schedule-arrangement/domain/models/conflict.model.ts`

Line 86: Update ScheduleArrangementInput
```typescript
// BEFORE
export interface ScheduleArrangementInput {
  classId: string;
  // ...
}

// AFTER
export interface ScheduleArrangementInput {
  classId?: number;  // Optional since it's autoincrement
  // ...
}
```

**Impact**: This affects schedule-arrangement.actions.ts error on line 81, 101

---

### Category 5: Mock Grade Data - Missing DisplayID (6 errors)
**File**: `src/features/teaching-assignment/presentation/components/AssignmentFilters.tsx`

Lines 46-87: Add DisplayID to all grade mock objects
```typescript
// BEFORE
{
  GradeID: "ม.1/1",
  Year: 1,
  Number: 1,
  StudentCount: 35,
  ProgramID: null,
}

// AFTER
{
  GradeID: "ม.1/1",
  Year: 1,
  Number: 1,
  DisplayID: "101",  // ADD THIS
  StudentCount: 35,
  ProgramID: null,
}
```

**All 6 grades**:
- ม.1/1 → DisplayID: "101"
- ม.2/1 → DisplayID: "201"
- ม.3/1 → DisplayID: "301"
- ม.4/1 → DisplayID: "401"
- ม.5/1 → DisplayID: "501"
- ม.6/1 → DisplayID: "601"

---

### Category 6: Analytics Repository (1 error)
**File**: `src/features/analytics/infrastructure/repositories/teacher.repository.ts`

Line 98: Change Set usage
```typescript
// BEFORE
data.hours.add(schedule.ClassID); // ClassID was string

// AFTER
data.hours.add(schedule.ClassID); // ClassID is now number (no change needed in code, just type)
```

**Note**: The Set type needs to be `Set<number>` instead of `Set<string>`

---

### Category 7: Arrange Actions (1 error)
**File**: `src/features/arrange/application/actions/arrange.actions.ts`

Line 135: Update BasicSchedule type definition
```typescript
// Find the BasicSchedule interface and update ClassID type
interface BasicSchedule {
  ClassID: number;  // Changed from string
  TimeslotID: string;
}
```

---

### Category 8: Class Actions (1 error)
**File**: `src/features/class/application/actions/class.actions.ts`

Line 185: Remove ClassID from create input (autoincrement handles it)
```typescript
// BEFORE
await prisma.class_schedule.create({
  data: {
    ClassID: input.ClassID,  // REMOVE THIS
    TimeslotID: input.TimeslotID,
    // ...
  }
});

// AFTER
await prisma.class_schedule.create({
  data: {
    TimeslotID: input.TimeslotID,
    // ... (ClassID auto-generated)
  }
});
```

---

### Category 9: Lock Actions Type Cast (1 error)
**File**: `src/features/lock/application/actions/lock.actions.ts`

Line 377: Update type cast
```typescript
// BEFORE
return rawSchedules as class_schedule[]; // RawLockedSchedule has ClassID: string

// AFTER
// Option 1: Update RawLockedSchedule type to have ClassID: number
// Option 2: Remove type cast and let TypeScript infer
```

**RawLockedSchedule interface** needs ClassID type updated from string to number.

---

### Category 10: Any Type Errors (2 errors)
**File**: `src/lib/public/classes.ts`

Lines 225-226: Fix day order indexing
```typescript
// Add proper type annotation
const dayOrder: Record<day_of_week, number> = { /* ... */ };

// Then the sort will work without implicit any errors
.sort((a, b) =>
  (dayOrder[a.timeslot.DayOfWeek] ?? 0) -
  (dayOrder[b.timeslot.DayOfWeek] ?? 0)
);
```

---

## 🔧 Additional Refactoring Required

### Remove generateClassID() Helper Function
**Impact**: 11 call sites across codebase

**Files to Update**:
1. `src/features/arrange/domain/services/arrange-validation.service.ts` (lines 143-149)
   - Remove `generateClassID()` function definition
   
2. `src/features/lock/domain/services/lock-validation.service.ts` (lines 47-54)
   - Remove `generateClassID()` function definition

3. `src/features/lock/application/actions/lock.actions.ts` (3 calls: lines 76, 162, 307)
   - Remove import
   - Remove all `generateClassID()` calls
   - Let database generate ClassID via autoincrement

4. `src/features/arrange/domain/services/arrange-validation.service.ts` (2 calls: lines 233, 257)
   - Remove `generateClassID()` calls in validation logic

5. `src/app/schedule/[semesterAndyear]/arrange/page.tsx` (line 767)
   - Remove import and call

6. `src/features/schedule-arrangement/presentation/components/examples/DraggableSubjectCard.tsx` (lines 224-235)
   - Remove comments referencing ClassID format
   - Update to use database-generated IDs

**Strategy**:
- For CREATE operations: Remove ClassID from input, let autoincrement handle it
- For UPDATE operations: Use existing ClassID (already a number from DB)
- For CONFLICT checks: Use `(TimeslotID, SubjectCode, GradeID)` tuple instead of composite ClassID string

---

## 📋 Systematic Fix Order

**Recommended sequence to minimize cascading errors**:

1. ✅ **Domain Models First** (Categories 3 & 4)
   - Fix conflict.repository.ts interface types
   - Fix ScheduleArrangementInput in conflict.model.ts
   - This unblocks many downstream errors

2. ✅ **Repository Layer** (Category 2)
   - Update schedule.repository.ts method signatures
   - Update all repository implementations

3. ✅ **Application Actions** (Categories 7, 8, 9)
   - Fix arrange.actions.ts BasicSchedule type
   - Fix class.actions.ts create operation
   - Fix lock.actions.ts type cast

4. ✅ **UI Components** (Categories 1, 5, 10)
   - Remove parseInt() calls in teacher-arrange page
   - Add DisplayID to AssignmentFilters mock data
   - Fix dayOrder type annotation in classes.ts

5. ✅ **Analytics** (Category 6)
   - Update Set<number> type in teacher.repository.ts

6. ✅ **Remove generateClassID()** (Additional Refactoring)
   - Remove function definitions
   - Remove all call sites
   - Update conflict detection logic

---

## 🧪 Testing Checklist

After completing Phase 2:

- [ ] `pnpm typecheck` passes (0 errors)
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (unit tests)
- [ ] `pnpm db:seed:demo` completes successfully
- [ ] Local manual testing:
  - [ ] Create new schedule (ClassID auto-generated)
  - [ ] Update existing schedule (uses numeric ClassID)
  - [ ] Delete schedule (accepts numeric ClassID)
  - [ ] Conflict detection works without composite ClassID
  - [ ] Lock schedule operations work
- [ ] E2E tests: `pnpm test:e2e` (arrange, teacher-table, assign flows)

---

## 🚀 Deployment Plan

### Local Database
- ✅ Already migrated and seeded

### Test Environment (CI/CD)
1. Merge to main → CI runs migrations automatically
2. Verify E2E tests pass in CI
3. Check GitHub Actions logs for seed success

### Production (Vercel Postgres)
1. **PRE-DEPLOYMENT**:
   - [ ] Announce maintenance window (database reset required)
   - [ ] Backup production data (though it's demo data, good practice)
   
2. **DEPLOYMENT**:
   ```bash
   # Pull production env
   vercel env pull .env
   
   # Run migration (this will reset DB due to breaking changes)
   pnpm prisma migrate deploy
   
   # Re-seed production
   pnpm db:seed:demo
   ```

3. **POST-DEPLOYMENT**:
   - [ ] Verify production seed: Check /dashboard/1-2567/teacher-table
   - [ ] Run production E2E tests: `pnpm test:vercel`
   - [ ] Monitor Sentry for errors

---

## 📝 Documentation Updates Needed

After Phase 2 completion:

- [ ] Update SCHEMA_IMPROVEMENTS_DEC2025.md with:
  - DisplayID field purpose and format
  - ClassID migration from composite string to autoincrement Int
  - Breaking changes and migration impact
  
- [ ] Update AGENTS.md with:
  - New DisplayID utility usage (`formatGradeDisplay()`)
  - Removal of generateClassID() helper
  - ClassID now autoincrement (no manual generation)

- [ ] Add migration guide for other developers:
  - How to handle ClassID in new code
  - When to use DisplayID vs GradeID
  - Conflict detection new patterns

---

## ⚠️ Known Risks

1. **Conflict Detection Logic**: Removing composite ClassID requires refactoring conflict checks to use tuple matching instead of string comparison.

2. **Foreign Key Relations**: The `_class_scheduleToteachers_responsibility` junction table references ClassID. Migration will recreate this relationship.

3. **Existing Production Data**: Current migration DROPS and recreates ClassID column, losing all existing schedules. This is acceptable for demo data but would be catastrophic for real user data.

4. **Serialization**: Any API responses or client state caching ClassID as string will break. Search for JSON.stringify/parse operations involving ClassID.

---

## 🔄 Rollback Plan

If issues arise:

1. **Revert schema changes**:
   ```bash
   git revert <commit-hash>
   pnpm prisma migrate reset --force
   ```

2. **Restore old types**:
   - ClassID: string → number (revert all type files)
   - Add back generateClassID() helper
   
3. **Re-seed with old format**:
   ```bash
   pnpm db:seed:demo
   ```

---

## 📊 Progress Tracking

**Phase 1**: ✅ Complete (Schema + Seed + Types)  
**Phase 2**: ⏳ Pending (29 TypeScript errors to fix)  
**Phase 3**: ⏳ Pending (Testing + Documentation)  
**Phase 4**: ⏳ Pending (Production Deployment)

**Estimated Time for Phase 2**: 2-3 hours  
**Estimated Time for Phase 3**: 1-2 hours  
**Total Remaining**: 3-5 hours

---

## 🎯 Next Steps

1. Fix all 29 TypeScript errors following the systematic order above
2. Remove generateClassID() and refactor conflict detection
3. Run full test suite
4. Update documentation
5. Deploy to test environment
6. Deploy to production with maintenance window

**Start with**: Category 3 & 4 (Domain Models) to unblock the most errors.
