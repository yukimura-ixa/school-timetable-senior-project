# Program Feature Migration - Complete ✅

**Date:** 2025-10-25  
**Status:** Complete - 0 TypeScript errors  
**Pattern:** Clean Architecture + Server Actions (React 19)

---

## Summary

Successfully migrated the **program** feature from API Routes to Clean Architecture following the established pattern. The migration includes 4 files implementing 7 Server Actions with many-to-many relation management for gradelevels and subjects.

---

## Files Created

### 1. Application Layer - Schemas
**File:** `src/features/program/application/schemas/program.schemas.ts`  
**Lines:** 87  
**Purpose:** Valibot validation schemas

```typescript
// 5 schemas defined
- createProgramSchema (ProgramName, Semester, gradelevel[], subject[])
- updateProgramSchema (ProgramID, ProgramName, Semester, gradelevel[], subject[])
- deleteProgramSchema (ProgramID)
- getProgramByIdSchema (ProgramID)
- getProgramsByYearSchema (Year)
```

**Key Points:**
- Uses Valibot v1.1.0 syntax (v.object, v.pipe, v.enum, v.array)
- Semester uses Prisma `semester` enum
- Gradelevel and subject are arrays of objects with IDs
- Validates minimum 1 gradelevel and 1 subject required
- Thai error messages throughout

---

### 2. Infrastructure Layer - Repository
**File:** `src/features/program/infrastructure/repositories/program.repository.ts`  
**Lines:** 154  
**Purpose:** Prisma database operations

```typescript
// 8 repository methods
- findAll() // with gradelevel and subject relations
- findByYear(year) // complex query: gradelevel.every.Year
- findById(programId) // with relations
- findByName(programName) // for duplicate check
- create(data) // with connect relations
- update(programId, data) // set: [] then connect pattern
- delete(programId)
- count()
```

**Key Logic:**
- **Many-to-Many Relations:** Connects to gradelevel[] and subject[] via IDs
- **Complex Query:** `findByYear()` uses `gradelevel: { every: { Year } }`
- **Update Pattern:** Uses `set: []` to clear existing connections, then `connect` new ones
- **Always includes relations** in queries for complete data

---

### 3. Domain Layer - Validation Service
**File:** `src/features/program/domain/services/program-validation.service.ts`  
**Lines:** 58  
**Purpose:** Pure business logic and validation rules

```typescript
// 3 validation functions
- validateNoDuplicateProgram(programName) => string | null
- validateNoDuplicateProgramForUpdate(programId, programName) => string | null
- validateProgramExists(programId) => string | null
```

**Business Rules:**
1. **ProgramName Uniqueness:** Must be unique across all programs
2. **Update Validation:** Allows keeping same name when updating
3. **Existence Check:** Validates program exists before update/delete

**Error Messages (Thai):**
- `"มีชื่อหลักสูตรนี้อยู่แล้ว กรุณาตรวจสอบอีกครั้ง"` (duplicate)
- `"ไม่พบหลักสูตรที่ระบุ"` (not found)

---

### 4. Application Layer - Server Actions
**File:** `src/features/program/application/actions/program.actions.ts`  
**Lines:** 237  
**Purpose:** Server Actions with auth + validation

```typescript
// 7 Server Actions
✅ getProgramsAction() // no auth needed
✅ getProgramsByYearAction(year)
✅ getProgramByIdAction(programId)
✅ createProgramAction(input)
✅ updateProgramAction(input)
✅ deleteProgramAction(programId)
✅ getProgramCountAction() // statistics
```

**Patterns:**
- Uses `createAction()` wrapper for auth + validation
- Auto-validates with Valibot schemas
- Returns `{ success: true, data }` or `{ success: false, error }`
- Validates uniqueness and existence before mutations
- Thai error messages

**Notes:**
- `revalidateTag()` commented out (Next.js 16 requires 2nd param)
- Update replaces all relations (not additive)

---

## API Coverage

### Original API Routes (Migrated)

1. **GET /api/program?Year={year}** → `getProgramsByYearAction({ Year })`
2. **POST /api/program** → `createProgramAction(input)`
3. **PUT /api/program** → `updateProgramAction(input)`
4. **DELETE /api/program** → `deleteProgramAction({ ProgramID })`

**Additional Actions:**
- `getProgramsAction()` (all programs, no filter)
- `getProgramByIdAction()` (single program)
- `getProgramCountAction()` (statistics)

---

## Key Features

### Many-to-Many Relation Management

**Create:**
```typescript
const result = await createProgramAction({
  ProgramName: "วิทยาศาสตร์-คณิตศาสตร์",
  Semester: "SEMESTER_1",
  gradelevel: [{ GradeID: "101" }, { GradeID: "102" }],
  subject: [{ SubjectCode: "MATH101" }, { SubjectCode: "SCI101" }],
});
```

**Update (Replaces Relations):**
```typescript
const result = await updateProgramAction({
  ProgramID: 1,
  ProgramName: "วิทยาศาสตร์-คณิตศาสตร์",
  Semester: "SEMESTER_1",
  gradelevel: [{ GradeID: "101" }], // New list replaces old
  subject: [{ SubjectCode: "MATH101" }], // New list replaces old
});
```

### Complex Year Filter

**Original API:**
```typescript
// GET /api/program?Year=1
where: {
  gradelevel: {
    every: { Year: 1 }
  }
}
```

**New Server Action:**
```typescript
const result = await getProgramsByYearAction({ Year: 1 });
// Returns programs where ALL gradelevels have Year=1
```

---

## Prisma Relation Pattern

### Update Strategy (Important!)

The update operation uses a special Prisma pattern:

```typescript
// Clear existing relations first
gradelevel: {
  set: [],        // Remove all connections
  connect: [...]  // Add new connections
}
```

This ensures:
- ✅ Old connections are removed
- ✅ New connections are added
- ✅ No duplicate connections
- ✅ Atomic operation (all or nothing)

---

## Testing Notes

### Unit Test Coverage Needed

```typescript
// program-validation.service.test.ts
describe('validateNoDuplicateProgram', () => {
  it('should return error if duplicate exists', async () => {
    // Mock repository.findByName
  });
});

describe('validateNoDuplicateProgramForUpdate', () => {
  it('should allow same name for same program', async () => {
    // Mock repository.findByName
  });
  
  it('should reject duplicate name for different program', async () => {
    // Mock repository.findByName
  });
});

// program.repository.test.ts
describe('update', () => {
  it('should clear and reconnect relations', async () => {
    // Test set: [] then connect pattern
  });
});
```

---

## Migration Progress

| Feature | Status | Files | Actions | Notes |
|---------|--------|-------|---------|-------|
| **Teacher** | ✅ Complete | 4 | 7 | Reference implementation |
| **Room** | ✅ Complete | 4 | 8 | Includes available rooms query |
| **GradeLevel** | ✅ Complete | 4 | 8 | Includes lock feature query |
| **Program** | ✅ Complete | 4 | 7 | Many-to-many relations |
| Timeslot | ⏳ Pending | - | - | Next priority |
| Subject | ⏳ Pending | - | - | Priority 2 |
| Lock | ⏳ Pending | - | - | Priority 2 |
| Config | ⏳ Pending | - | - | Priority 2 |
| Assign | ⏳ Pending | - | - | Priority 3 |
| Class | ⏳ Pending | - | - | Priority 3 |

**Total Progress:** 4/10 features complete (40%)

---

## Next Steps

### 1. Timeslot Feature Migration
- Priority: Next
- Complexity: Medium (complex timeslot logic, DateTime fields)
- Estimated: 2 hours
- Files: 4 (schemas, repository, validation, actions)

### 2. Frontend Updates (After All Migrations)
- Update `app/admin/program/page.tsx` to use Server Actions
- Replace `fetch('/api/program')` with `getProgramsByYearAction()`
- Use React 19 `use()` hook for async data
- Update form submissions to use Server Actions

---

## Verification Checklist

- ✅ All files have 0 TypeScript errors
- ✅ Follows established pattern from teacher/room/gradelevel features
- ✅ Uses Valibot (not Zod) for validation
- ✅ All repository methods use Prisma
- ✅ Pure validation functions in domain layer
- ✅ Server Actions use `createAction()` wrapper
- ✅ Thai error messages throughout
- ✅ Many-to-many relation management (gradelevel, subject)
- ✅ Complex Year filter query implemented
- ✅ ProgramName uniqueness validation
- ✅ Update uses set: [] then connect pattern

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
- **Valibot:** `v.object`, `v.pipe`, `v.string`, `v.number`, `v.enum`, `v.array`, `InferOutput`
- **Prisma:** `findMany`, `findUnique`, `create`, `update`, `delete`, `count`
- **Prisma Relations:** `include`, `connect`, `set: []` (clear connections)
- **Prisma Filters:** `where: { gradelevel: { every: { Year } } }`
- **Next.js:** Server Actions (`'use server'`), `createAction` wrapper

---

## Known Issues & Future Work

### revalidateTag() Optional
```typescript
// Commented out in all actions (Next.js 16 requires 2nd param)
// revalidateTag('programs');
```
**Resolution:** Add back when Next.js 16 API stabilizes or use proper cache tags.

### Update Behavior
```typescript
// Update REPLACES all relations, not additive
// If you want to ADD a gradelevel, must include all existing + new
```
**Documentation:** Make this clear in frontend to avoid accidentally removing relations.

### Relation Validation
Currently, Prisma will throw if GradeID or SubjectCode doesn't exist.  
**Future:** Consider adding explicit validation in domain service for better error messages.

---

## Rollback Plan

If issues arise:
1. Keep API routes at `src/app/api/program/` active
2. Feature flags in frontend to switch between API/Server Actions
3. Monitor for performance/error rate differences
4. Full rollback: delete `src/features/program/` directory

---

**Migration Completed By:** AI Agent (Sequential-Thinking + Serena + context7)  
**Review Required:** Yes - verify relation management behavior with product owner  
**Deploy Status:** Ready for staging after frontend integration
