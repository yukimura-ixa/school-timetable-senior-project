# Config Feature Migration - Complete ✅

**Date:** 2025-10-25  
**Status:** Complete - 0 TypeScript errors  
**Pattern:** Clean Architecture + Server Actions (React 19)  
**Complexity:** High

---

## Summary

Successfully migrated the **config** feature from API Routes to Clean Architecture following the established pattern. The migration includes 4 files implementing 7 Server Actions with complex copy operation, Prisma transactions, JSON configuration management, and cross-feature dependencies.

---

## Files Created

### 1. Application Layer - Schemas
**File:** `src/features/config/application/schemas/config.schemas.ts`  
**Lines:** 102  
**Purpose:** Valibot validation schemas

```typescript
// 6 schemas defined
- getConfigByTermSchema (AcademicYear, Semester)
- createConfigSchema (ConfigID, AcademicYear, Semester, Config)
- updateConfigSchema (ConfigID, optional fields)
- deleteConfigSchema (ConfigID)
- copyConfigSchema (from, to, assign, lock, timetable)
```

**Key Points:**
- Uses Valibot v1.1.0 syntax
- `semester` enum from Prisma (SEMESTER_1, SEMESTER_2)
- ConfigID regex validation: `/^\d+\/\d{4}$/` (format: "1/2566")
- Config field uses `v.unknown()` for JSON data
- Copy schema with boolean flags for conditional operations
- Thai error messages

---

### 2. Infrastructure Layer - Repository
**File:** `src/features/config/infrastructure/repositories/config.repository.ts`  
**Lines:** 109  
**Purpose:** Prisma database operations

```typescript
// 7 repository methods
- findAll() // ordered by ConfigID
- findByTerm(academicYear, semester) // findFirst by term
- findByConfigId(configId) // findUnique by PK
- create(data)
- update(configId, data)
- deleteById(configId)
- count()
```

**Key Logic:**
- **ConfigID is primary key** (String, format: "SEMESTER/YEAR")
- **Config is Prisma.JsonValue** (unstructured JSON data)
- **Ordered by ConfigID** for consistent display
- **findByTerm** returns null if not found (used for uniqueness check)

---

### 3. Domain Layer - Validation Service
**File:** `src/features/config/domain/services/config-validation.service.ts`  
**Lines:** 161  
**Purpose:** Business logic and validation rules

```typescript
// 11 pure functions/validation methods
- generateConfigID(semesterNum, year) => string
- parseConfigID(configId) => { semester, academicYear }
- validateConfigIDFormat(configId) => string | null
- validateConfigExists(configId) => Promise<string | null>
- validateNoDuplicateConfig(academicYear, semester, excludeConfigId?) => Promise<string | null>
- replaceConfigIDInString(str, from, to) => string
- getSemesterNumber(semester enum) => string
- parseSemesterEnum(semesterNum) => semester
- validateCopyInput(from, to) => Promise<string | null>
```

**Business Rules:**
1. **ConfigID Format:** "SEMESTER/YEAR" (e.g., "1/2566", "2/2567")
2. **Uniqueness:** Only one config per AcademicYear + Semester combination
3. **Copy Validation:**
   - from ≠ to (cannot copy to same term)
   - from must exist
   - to must not exist (prevent overwrite)
4. **ID Replacement:** Pure function for replacing ConfigID pattern in strings

**Pure Functions:**
```typescript
// Generate ConfigID
generateConfigID("1", 2566) => "1/2566"

// Parse ConfigID
parseConfigID("2/2567") => { semester: "2", academicYear: 2567 }

// Replace in string (for copy operation)
replaceConfigIDInString("MON-1/2566-1", "1/2566", "2/2567") => "MON-2/2567-1"
```

---

### 4. Application Layer - Server Actions
**File:** `src/features/config/application/actions/config.actions.ts`  
**Lines:** 414  
**Purpose:** Server Actions with complex copy operation

```typescript
// 7 Server Actions
✅ getAllConfigsAction() // list all
✅ getConfigByTermAction(input) // query by term
✅ createConfigAction(input) // with uniqueness check
✅ updateConfigAction(input) // with existence + uniqueness check
✅ deleteConfigAction(configId) // with existence check
✅ copyConfigAction(input) // COMPLEX: transaction-based copy
✅ getConfigCountAction() // statistics
```

**Patterns:**
- Uses `createAction()` wrapper for auth + validation
- Auto-validates with Valibot schemas
- **Complex copy operation uses Prisma `$transaction`** for atomicity
- Conditional copying based on boolean flags
- Returns detailed results (counts for each copied entity)
- Thai error messages

---

## API Coverage

### Original API Routes (Migrated)

1. **GET /api/config** → `getAllConfigsAction()`
   - List all configs

2. **GET /api/config/getConfig?AcademicYear=X&Semester=Y** → `getConfigByTermAction(input)`
   - Query by term
   - Returns 404 if not found

3. **POST /api/config/copy** → `copyConfigAction(input)`
   - COMPLEX: Copy entire term configuration
   - Input: { from, to, assign, lock, timetable }
   - Uses transaction for atomicity

**Additional Actions:**
- `createConfigAction()` (CRUD create)
- `updateConfigAction()` (CRUD update)
- `deleteConfigAction()` (CRUD delete)
- `getConfigCountAction()` (statistics)

---

## Key Features

### Complex Copy Operation (High Complexity)

**What it does:**
Clones an entire term's configuration to a new term, including:
1. **table_config** (Config JSON)
2. **timeslots** (with ID replacement)
3. **teachers_responsibility** (if `assign: true`)
4. **class_schedule (locked)** (if `lock: true`)
5. **class_schedule (timetable)** (if `timetable: true`)

**Transaction-based for atomicity:**
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Copy config
  await tx.table_config.create({ ... });
  
  // 2. Copy timeslots
  await tx.timeslot.createMany({ ... });
  
  // 3. Copy assignments (if flag)
  if (input.assign) {
    await tx.teachers_responsibility.createMany({ ... });
    
    // 4. Copy locks (if flag)
    if (input.lock) { ... }
    
    // 5. Copy timetables (if flag)
    if (input.timetable) { ... }
  }
});
```

**Example:**
```typescript
const result = await copyConfigAction({
  from: "1/2566",           // Semester 1, Year 2566
  to: "2/2567",             // Semester 2, Year 2567
  assign: true,             // Copy teacher assignments
  lock: true,               // Copy locked schedules
  timetable: false,         // Skip non-locked schedules
});

// Returns:
// {
//   config: { ... },
//   timeslots: 35,          // 35 timeslots copied
//   assignments: 120,       // 120 teacher assignments copied
//   locks: 15,              // 15 locked schedules copied
//   timetables: 0           // 0 timetables copied
// }
```

### ID Replacement Pattern

**Problem:** IDs contain ConfigID pattern and must be updated when copying

**Solution:** Pure function replaces ConfigID in all related IDs

```typescript
// Original IDs (Semester 1, Year 2566)
TimeslotID: "MON-1/2566-1"
ClassID: "MON-1/2566-1-MATH101-101"

// After copy to Semester 2, Year 2567
TimeslotID: "MON-2/2567-1"
ClassID: "MON-2/2567-1-MATH101-101"

// Implementation
replaceConfigIDInString(originalId, "1/2566", "2/2567")
```

### ConfigID Format

**Pattern:** "SEMESTER/YEAR"

**Examples:**
- `"1/2566"` - Semester 1, Academic Year 2566
- `"2/2567"` - Semester 2, Academic Year 2567

**Validation:**
- Regex: `/^\d+\/\d{4}$/`
- Semester must be 1 or 2
- Year must be 4 digits ≥ 2500

**Generation:**
```typescript
generateConfigID("1", 2566) => "1/2566"
```

### JSON Configuration Storage

**Prisma Schema:**
```prisma
model table_config {
  ConfigID     String   @id
  AcademicYear Int
  Semester     semester
  Config       Json      // Unstructured JSON data
}
```

**Handling in TypeScript:**
- Valibot: `v.unknown()` (accepts any JSON-serializable value)
- Prisma: `Prisma.JsonValue` type
- Type cast: `input.Config as any` for flexibility

**Example Config:**
```json
{
  "periodsPerDay": 8,
  "startTime": "08:00",
  "periodDuration": 50,
  "breakDurations": [10, 50, 10],
  "schoolDays": ["MON", "TUE", "WED", "THU", "FRI"]
}
```

### Conditional Copying with Flags

**Flags control what gets copied:**
```typescript
{
  assign: boolean,     // Copy teachers_responsibility?
  lock: boolean,       // Copy locked class_schedule? (requires assign: true)
  timetable: boolean   // Copy non-locked class_schedule? (requires assign: true)
}
```

**Dependencies:**
- `lock` and `timetable` require `assign: true`
- If `assign: false`, locks and timetables are skipped
- Allows flexible partial copying

### Duplicate Prevention

**Teachers Assignment:**
```typescript
// Check each assignment before creating
for (const resp of toResp) {
  const existing = await tx.teachers_responsibility.findFirst({
    where: resp, // Exact match on all fields
  });
  if (existing) {
    throw new Error('มีการมอบหมายซ้ำกัน');
  }
}
```

**Class Schedule:**
```typescript
// Try-catch for each schedule
try {
  await tx.class_schedule.create({ ... });
  copiedLocks++;
} catch (error) {
  // Skip if already exists
  console.error('Error copying locked schedule:', error);
}
```

---

## Business Rules

1. **ConfigID Uniqueness:**
   - Primary key
   - Format: "SEMESTER/YEAR"
   - Must match regex pattern

2. **Term Uniqueness:**
   - Only one config per AcademicYear + Semester combination
   - Validated before create/update

3. **Copy Constraints:**
   - Source (from) must exist
   - Destination (to) must NOT exist
   - Cannot copy to same term (from ≠ to)

4. **Copy Dependencies:**
   - Locks and timetables require assignments
   - All or nothing (transaction ensures atomicity)

5. **Config JSON:**
   - No structure validation (accepts any valid JSON)
   - Application layer defines expected structure
   - Stored as-is in database

---

## Testing Notes

### Unit Test Coverage Needed

```typescript
// config-validation.service.test.ts
describe('generateConfigID', () => {
  it('should generate ConfigID with format SEMESTER/YEAR', () => {
    expect(generateConfigID('1', 2566)).toBe('1/2566');
    expect(generateConfigID('2', 2567)).toBe('2/2567');
  });
});

describe('parseConfigID', () => {
  it('should parse ConfigID into components', () => {
    const result = parseConfigID('1/2566');
    expect(result).toEqual({ semester: '1', academicYear: 2566 });
  });
  
  it('should throw error for invalid format', () => {
    expect(() => parseConfigID('invalid')).toThrow();
    expect(() => parseConfigID('1-2566')).toThrow();
  });
});

describe('replaceConfigIDInString', () => {
  it('should replace ConfigID pattern in string', () => {
    const result = replaceConfigIDInString(
      'MON-1/2566-1',
      '1/2566',
      '2/2567'
    );
    expect(result).toBe('MON-2/2567-1');
  });
});

describe('validateCopyInput', () => {
  it('should return error if from === to', async () => {
    const error = await validateCopyInput('1/2566', '1/2566');
    expect(error).toContain('เดียวกัน');
  });
  
  it('should return error if from does not exist', async () => {
    // Mock repository.findByConfigId to return null
  });
  
  it('should return error if to already exists', async () => {
    // Mock repository to find existing destination
  });
});
```

### E2E Test Scenarios

```typescript
// Config feature E2E
test('Admin can create config for a new term', async ({ page }) => {
  // Navigate to config page
  // Create new config with ConfigID "1/2567"
  // Verify config appears in list
});

test('Admin can copy entire term configuration', async ({ page }) => {
  // Select source term "1/2566"
  // Select destination term "2/2567"
  // Check all flags (assign, lock, timetable)
  // Copy
  // Verify all data copied correctly
  // Verify timeslots have new IDs
  // Verify class schedules have new IDs
});

test('Copy operation is atomic (rolls back on error)', async ({ page }) => {
  // Attempt copy with duplicate assignments
  // Verify entire operation rolled back
  // Verify destination config not created
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
| **Lock** | ✅ Complete | 4 | 4 | Medium | Cartesian product |
| **Config** | ✅ Complete | 4 | 7 | High | **Copy transaction** |
| Assign | ⏳ Pending | - | - | Medium | Next |
| Class | ⏳ Pending | - | - | High | - |

**Total Progress:** 8/10 features complete (80%) 🎉

---

## Next Steps

### 1. Assign Feature Migration
- Priority: Next (Priority 2)
- Complexity: Medium
- Estimated: 3 hours
- Files: 4 (schemas, repository, validation, actions)
- Key: Teachers_responsibility CRUD

### 2. Frontend Updates (After All Migrations)
- Update config management UI to use Server Actions
- Implement copy dialog with flag checkboxes
- Show progress/results after copy
- Handle JSON Config editor
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
- ✅ Complex copy operation uses `$transaction` for atomicity
- ✅ ID replacement logic extracted to pure function
- ✅ ConfigID format validation with regex
- ✅ JSON Config uses `v.unknown()` and type casting

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
- **Valibot:** `v.object`, `v.pipe`, `v.string`, `v.number`, `v.enum`, `v.boolean`, `v.unknown`, `v.optional`, `v.regex`, `InferOutput`
- **Prisma:** `findMany`, `findFirst`, `findUnique`, `create`, `update`, `delete`, `count`, `createMany`, `$transaction`
- **Prisma Types:** `Prisma.JsonValue`
- **Prisma Enums:** `semester`
- **JavaScript:** `String.split()`, `String.replace()`, `parseInt()`, `Array.map()`, `Array.filter()`, `Promise.all()`
- **Next.js:** Server Actions (`'use server'`), `createAction` wrapper

---

## Known Issues & Future Work

### Config Structure Validation
```typescript
// Current: Config accepts any JSON
// Future: Define and validate Config structure
// interface TimetableConfig {
//   periodsPerDay: number;
//   startTime: string;
//   periodDuration: number;
//   breakDurations: number[];
//   schoolDays: string[];
// }
```

### Copy Performance
```typescript
// Current: Sequential creates in loops
// Future: Optimize with batch operations
// Note: Transaction ensures atomicity, so batch carefully
```

### Copy Error Handling
```typescript
// Current: Try-catch skips individual schedule errors
// Future: Collect all errors and report to user
// Tradeoff: Partial success vs all-or-nothing
```

### ConfigID Update Cascades
```typescript
// Current: ConfigID is in timeslot.TimeslotID and class_schedule.ClassID
// Issue: Updating ConfigID would require cascading updates
// Consider: Prevent ConfigID updates or implement cascade logic
```

---

## Complexity Analysis

**Why High Complexity:**

1. **Prisma Transaction**
   - Multi-step operation
   - All-or-nothing atomicity
   - Error handling across steps

2. **Cross-Feature Dependencies**
   - Copies from: timeslot, teachers_responsibility, class_schedule
   - Must maintain referential integrity
   - ID replacement across multiple tables

3. **Conditional Logic**
   - Boolean flags control execution paths
   - Nested conditions (lock/timetable require assign)
   - Flexible partial copying

4. **ID Replacement**
   - Pattern matching and replacement
   - Must update: TimeslotID, ClassID
   - Deterministic pure function

5. **JSON Field Handling**
   - Unstructured data (any valid JSON)
   - Type casting for flexibility
   - No schema validation

6. **Duplicate Detection**
   - Check before creating assignments
   - Skip existing schedules
   - Error vs warning tradeoff

7. **Complex Validation**
   - Format validation (regex)
   - Uniqueness validation (database)
   - Copy-specific validation (existence, conflicts)

---

## Rollback Plan

If issues arise:
1. Keep API routes at `src/app/api/config/` active
2. Feature flags in frontend to switch between API/Server Actions
3. Monitor for transaction failures in copy operation
4. Monitor for ID replacement issues
5. Full rollback: delete `src/features/config/` directory

---

**Migration Completed By:** AI Agent (Sequential-Thinking + Serena + context7)  
**Review Required:** Yes - verify transaction atomicity and copy operation behavior  
**Deploy Status:** Ready for staging after frontend integration
