# Subject Feature Migration - Complete ✅

**Date:** 2025-10-25  
**Status:** Complete - 0 TypeScript errors  
**Pattern:** Clean Architecture + Server Actions (React 19)  
**Complexity:** Low

---

## Summary

Successfully migrated the **subject** feature from API Routes to Clean Architecture following the established pattern. The migration includes 4 files implementing 8 Server Actions with dual uniqueness validation (SubjectCode + SubjectName) and automatic whitespace trimming.

---

## Files Created

### 1. Application Layer - Schemas
**File:** `src/features/subject/application/schemas/subject.schemas.ts`  
**Lines:** 74  
**Purpose:** Valibot validation schemas

```typescript
// 6 schemas defined
- createSubjectSchema (SubjectCode, SubjectName, Credit, Category, ProgramID)
- createSubjectsSchema (array)
- updateSubjectSchema (SubjectCode, SubjectName, Credit, Category, ProgramID)
- updateSubjectsSchema (array)
- deleteSubjectsSchema (SubjectCode[])
- getSubjectByCodeSchema (SubjectCode)
```

**Key Points:**
- Uses Valibot v1.1.0 syntax (v.object, v.pipe, v.enum, v.nullable)
- `subject_credit` enum from Prisma (CREDIT_05, CREDIT_10, CREDIT_15, CREDIT_20)
- ProgramID is nullable (optional relation)
- Bulk operation support
- Thai error messages

---

### 2. Infrastructure Layer - Repository
**File:** `src/features/subject/infrastructure/repositories/subject.repository.ts`  
**Lines:** 103  
**Purpose:** Prisma database operations

```typescript
// 7 repository methods
- findAll() // ordered by SubjectCode
- findByCode(subjectCode)
- findByName(subjectName) // for duplicate check
- create(data)
- update(subjectCode, data)
- deleteMany(subjectCodes[])
- count()
```

**Key Logic:**
- **SubjectCode is primary key** (unique constraint)
- **Ordered by SubjectCode** for consistent display
- **Dual lookup methods:** by code and by name for validation

---

### 3. Domain Layer - Validation Service
**File:** `src/features/subject/domain/services/subject-validation.service.ts`  
**Lines:** 134  
**Purpose:** Business logic and validation rules

```typescript
// 6 validation/utility functions
- trimSubjectCode(code) => string  // removes ALL whitespace
- validateNoDuplicateSubjectCode(code) => string | null
- validateNoDuplicateSubjectName(name) => string | null
- validateSubjectExists(code) => string | null
- validateBulkCreateSubjects(subjects[]) => string[]
- validateBulkUpdateSubjects(subjects[]) => string[]
```

**Business Rules:**
1. **SubjectCode Trimming:** Remove all whitespace (e.g., "MATH 101" → "MATH101")
2. **Dual Uniqueness:** Both SubjectCode AND SubjectName must be unique
3. **Bulk Validation:** Check internal duplicates + database duplicates
4. **Update Validation:** Subject must exist before update

**Error Messages (Thai):**
- `"มีวิชานี้อยู่แล้ว กรุณาตรวจสอบอีกครั้ง"` (duplicate SubjectCode)
- `"มีชื่อวิชานี้อยู่แล้ว กรุณาตรวจสอบอีกครั้ง"` (duplicate SubjectName)
- `"ไม่พบวิชานี้ กรุณาตรวจสอบอีกครั้ง"` (not found)
- `"รายการที่ X: รหัสวิชาซ้ำกับรายการที่ Y"` (internal duplicate)

---

### 4. Application Layer - Server Actions
**File:** `src/features/subject/application/actions/subject.actions.ts`  
**Lines:** 275  
**Purpose:** Server Actions with validation

```typescript
// 8 Server Actions
✅ getSubjectsAction() // no auth needed
✅ getSubjectByCodeAction(subjectCode)
✅ createSubjectAction(input) // single with dual validation
✅ createSubjectsAction(inputs[]) // bulk with dual validation
✅ updateSubjectAction(input) // single with existence check
✅ updateSubjectsAction(inputs[]) // bulk with existence check
✅ deleteSubjectsAction(subjectCodes[]) // bulk delete
✅ getSubjectCountAction() // statistics
```

**Patterns:**
- Uses `createAction()` wrapper for auth + validation
- Auto-validates with Valibot schemas
- Returns `{ success: true, data }` or `{ success: false, error }`
- **Trims SubjectCode before all operations**
- **Validates both SubjectCode and SubjectName uniqueness**
- Bulk operations validate all before processing
- Thai error messages

---

## API Coverage

### Original API Routes (Migrated)

1. **GET /api/subject** → `getSubjectsAction()`
2. **POST /api/subject** (bulk) → `createSubjectsAction(inputs[])`
3. **PUT /api/subject** (bulk) → `updateSubjectsAction(inputs[])`
4. **DELETE /api/subject** → `deleteSubjectsAction(subjectCodes[])`

**Additional Actions:**
- `getSubjectByCodeAction()` (single subject)
- `createSubjectAction()` (single)
- `updateSubjectAction()` (single)
- `getSubjectCountAction()` (statistics)

---

## Key Features

### Dual Uniqueness Validation

**Both constraints enforced:**
```typescript
// 1. SubjectCode must be unique (primary key)
const codeError = await validateNoDuplicateSubjectCode(trimmedCode);

// 2. SubjectName must also be unique
const nameError = await validateNoDuplicateSubjectName(input.SubjectName);
```

### Automatic Whitespace Trimming

**Business Rule:**
```typescript
// Input: "MATH 101" or "MATH  101" or " MATH101 "
// Output: "MATH101"
const trimmedCode = trimSubjectCode(input.SubjectCode);
// Implementation: subjectCode.replace(/\s/g, '')
```

**Applied to:**
- Create operations (single and bulk)
- Update operations (single and bulk)

### Subject Credit Enum

**Prisma Schema:**
```prisma
enum subject_credit {
  CREDIT_05  // 0.5 credits
  CREDIT_10  // 1.0 credits
  CREDIT_15  // 1.5 credits
  CREDIT_20  // 2.0 credits
}
```

**Usage:**
```typescript
const result = await createSubjectAction({
  SubjectCode: "MATH101",
  SubjectName: "คณิตศาสตร์พื้นฐาน",
  Credit: "CREDIT_10",      // 1.0 credits
  Category: "พื้นฐาน",
  ProgramID: null,
});
```

### Bulk Operation Example

```typescript
const result = await createSubjectsAction([
  {
    SubjectCode: "MATH 101",  // Will be trimmed
    SubjectName: "คณิตศาสตร์",
    Credit: "CREDIT_10",
    Category: "พื้นฐาน",
    ProgramID: null,
  },
  {
    SubjectCode: "SCI 101",   // Will be trimmed
    SubjectName: "วิทยาศาสตร์",
    Credit: "CREDIT_10",
    Category: "พื้นฐาน",
    ProgramID: null,
  },
]);

// Validates:
// - No internal duplicates
// - No database duplicates (SubjectCode)
// - No database duplicates (SubjectName)
// If all valid, creates all subjects
```

---

## Business Rules

1. **SubjectCode:**
   - Primary key (unique)
   - All whitespace removed automatically
   - Cannot be empty

2. **SubjectName:**
   - Must be unique across all subjects
   - Cannot be empty

3. **Credit:**
   - Must be one of: CREDIT_05, CREDIT_10, CREDIT_15, CREDIT_20
   - Required field

4. **Category:**
   - String field
   - Cannot be empty
   - Default: "-" (in schema)

5. **ProgramID:**
   - Nullable (optional)
   - Foreign key to program table
   - Set to null for subjects not yet assigned to a program

---

## Testing Notes

### Unit Test Coverage Needed

```typescript
// subject-validation.service.test.ts
describe('trimSubjectCode', () => {
  it('should remove all whitespace', () => {
    expect(trimSubjectCode('MATH 101')).toBe('MATH101');
    expect(trimSubjectCode(' MATH  101 ')).toBe('MATH101');
    expect(trimSubjectCode('MATH101')).toBe('MATH101');
  });
});

describe('validateNoDuplicateSubjectCode', () => {
  it('should return error if duplicate exists', async () => {
    // Mock repository.findByCode
  });
});

describe('validateNoDuplicateSubjectName', () => {
  it('should return error if duplicate exists', async () => {
    // Mock repository.findByName
  });
});

describe('validateBulkCreateSubjects', () => {
  it('should detect internal SubjectCode duplicates', async () => {
    const subjects = [
      { SubjectCode: 'MATH101', SubjectName: 'Math A', ... },
      { SubjectCode: 'MATH101', SubjectName: 'Math B', ... },
    ];
    const errors = await validateBulkCreateSubjects(subjects);
    expect(errors).toContain('รหัสวิชาซ้ำ');
  });
  
  it('should detect internal SubjectName duplicates', async () => {
    const subjects = [
      { SubjectCode: 'MATH101', SubjectName: 'Math', ... },
      { SubjectCode: 'SCI101', SubjectName: 'Math', ... },
    ];
    const errors = await validateBulkCreateSubjects(subjects);
    expect(errors).toContain('ชื่อวิชาซ้ำ');
  });
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
| **Subject** | ✅ Complete | 4 | 8 | Low | **Dual uniqueness** |
| Lock | ⏳ Pending | - | - | Medium | Next |
| Config | ⏳ Pending | - | - | High | - |
| Assign | ⏳ Pending | - | - | Medium | - |
| Class | ⏳ Pending | - | - | High | - |

**Total Progress:** 6/10 features complete (60%) 🎉

---

## Next Steps

### 1. Lock Feature Migration
- Priority: Next (Priority 2)
- Complexity: Medium
- Estimated: 2-3 hours
- Files: 4 (schemas, repository, validation, actions)
- Key: Complex query for locked timeslots

### 2. Frontend Updates (After All Migrations)
- Update subject management UI to use `createSubjectsAction()`
- Update form to show SubjectCode will be trimmed
- Handle dual uniqueness validation errors
- Use React 19 `use()` hook for async data

---

## Verification Checklist

- ✅ All files have 0 TypeScript errors
- ✅ Follows established pattern from previous features
- ✅ Uses Valibot (not Zod) for validation
- ✅ All repository methods use Prisma
- ✅ Pure validation functions in domain layer
- ✅ Server Actions use `createAction()` wrapper
- ✅ Thai error messages throughout
- ✅ Bulk operations supported
- ✅ Dual uniqueness validation (SubjectCode + SubjectName)
- ✅ Automatic whitespace trimming
- ✅ subject_credit enum properly typed

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
- **Valibot:** `v.object`, `v.pipe`, `v.string`, `v.number`, `v.enum`, `v.array`, `v.nullable`, `InferOutput`
- **Prisma:** `findMany`, `findUnique`, `findFirst`, `create`, `update`, `deleteMany`, `count`
- **Prisma Enums:** `subject_credit`
- **JavaScript:** `String.replace()`, `Promise.all()`
- **Next.js:** Server Actions (`'use server'`), `createAction` wrapper

---

## Known Issues & Future Work

### SubjectCode Update Warning
```typescript
// Updating SubjectCode may break relations
// Subject is referenced by:
// - class_schedule (via SubjectCode)
// - teachers_responsibility (via SubjectCode)
// - program.subject[] (many-to-many)

// Consider: Prevent SubjectCode updates or cascade properly
```

### ProgramID Null Handling
```typescript
// Currently sets ProgramID to null in create/update
// This is correct for initial creation
// Program assignment happens via program feature
```

### Whitespace Trimming Visibility
```typescript
// User may input "MATH 101" but gets "MATH101"
// Frontend should either:
// 1. Show preview of trimmed code
// 2. Auto-trim in UI before submission
// 3. Display warning about trimming
```

---

## Rollback Plan

If issues arise:
1. Keep API routes at `src/app/api/subject/` active
2. Feature flags in frontend to switch between API/Server Actions
3. Monitor for SubjectCode trimming issues
4. Full rollback: delete `src/features/subject/` directory

---

**Migration Completed By:** AI Agent (Sequential-Thinking + Serena + context7)  
**Review Required:** Yes - verify dual uniqueness behavior and SubjectCode trimming  
**Deploy Status:** Ready for staging after frontend integration
