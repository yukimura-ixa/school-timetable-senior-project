# Timeslot Feature Migration - Complete ✅

**Date:** 2025-10-25  
**Status:** Complete - 0 TypeScript errors  
**Pattern:** Clean Architecture + Server Actions (React 19)  
**Complexity:** Medium (DateTime handling, complex generation algorithm)

---

## Summary

Successfully migrated the **timeslot** feature from API Routes to Clean Architecture. This was the most complex migration so far, involving DateTime calculations, complex timeslot generation algorithms, and transactional operations. The migration includes 4 files implementing 6 Server Actions with sophisticated business logic.

---

## Files Created

### 1. Application Layer - Schemas
**File:** `src/features/timeslot/application/schemas/timeslot.schemas.ts`  
**Lines:** 67  
**Purpose:** Valibot validation schemas

```typescript
// 4 schemas defined
- createTimeslotsSchema (complex configuration object)
- getTimeslotsByTermSchema (AcademicYear, Semester)
- deleteTimeslotsByTermSchema (AcademicYear, Semester)
- getTimeslotByIdSchema (TimeslotID)
```

**Key Points:**
- Uses Valibot v1.1.0 syntax (v.object, v.enum, v.array, v.boolean)
- Complex nested objects (MiniBreak, BreakTimeslots)
- Enums: semester, day_of_week, breaktime (from Prisma)
- Configuration-driven bulk creation
- Thai error messages

---

### 2. Infrastructure Layer - Repository
**File:** `src/features/timeslot/infrastructure/repositories/timeslot.repository.ts`  
**Lines:** 149  
**Purpose:** Prisma database operations

```typescript
// 3 sub-repositories with 13 total methods

timeslotRepository:
- findByTerm(academicYear, semester)
- findById(timeslotId)
- findFirst(academicYear, semester)
- createMany(timeslots[])
- deleteByTerm(academicYear, semester)
- count()
- countByTerm(academicYear, semester)

tableConfigRepository:
- findByTerm(academicYear, semester)
- create(academicYear, semester, config)
- deleteByTerm(academicYear, semester)

teachersResponsibilityRepository:
- deleteByTerm(academicYear, semester) // for cascade
```

**Key Logic:**
- **Multi-entity management:** timeslot, table_config, teachers_responsibility
- **ConfigID generation:** `${semester[9]}/${academicYear}` (e.g., "1/2567")
- **Cascade deletion support:** Helper methods for related data cleanup

---

### 3. Domain Layer - Service
**File:** `src/features/timeslot/domain/services/timeslot.service.ts`  
**Lines:** 161  
**Purpose:** Complex business logic and algorithms

```typescript
// 6 pure functions

- generateTimeslotId(semester, academicYear, dayOfWeek, slotNumber) => string
- calculateBreaktime(slotNumber, breakConfig) => breaktime
- generateTimeslots(config) => timeslot[]  // COMPLEX ALGORITHM
- sortTimeslots(timeslots[]) => timeslot[]
- validateNoExistingTimeslots(academicYear, semester) => string | null
- validateTimeslotsExist(academicYear, semester) => string | null
```

**Complex Algorithm: `generateTimeslots()`**
```typescript
// For each day:
//   Start at configured StartTime
//   For each slot (1 to TimeslotPerDay):
//     1. Apply mini break if configured
//     2. Determine breaktime enum (BREAK_BOTH/BREAK_SENIOR/BREAK_JUNIOR/NOT_BREAK)
//     3. Calculate EndTime (Duration or BreakDuration)
//     4. Generate TimeslotID
//     5. Create timeslot record
//     6. Set next slot StartTime = current EndTime
```

**TimeslotID Pattern (Updated October 2025):**
- Format: `"SEMESTER-YEAR-DAYPERIOD"`
- Example: `"1-2567-MON1"`, `"2-2567-FRI8"`

**Breaktime Logic:**
```typescript
Junior=4, Senior=5, Current=4 → BREAK_JUNIOR
Junior=4, Senior=5, Current=5 → BREAK_SENIOR
Junior=4, Senior=4, Current=4 → BREAK_BOTH
Otherwise → NOT_BREAK
```

**Custom Sorting:**
```typescript
// Sort by: MON < TUE < WED < THU < FRI < SAT < SUN
// Then by: Slot number extracted from TimeslotID
```

---

### 4. Application Layer - Server Actions
**File:** `src/features/timeslot/application/actions/timeslot.actions.ts`  
**Lines:** 248  
**Purpose:** Server Actions with transactions

```typescript
// 6 Server Actions

✅ getTimeslotsByTermAction(academicYear, semester) // with sorting
✅ getTimeslotByIdAction(timeslotId)
✅ createTimeslotsAction(config) // transactional, complex
✅ deleteTimeslotsByTermAction(academicYear, semester) // cascade delete
✅ getTimeslotCountAction() // statistics
✅ getTimeslotCountByTermAction(academicYear, semester) // statistics
```

**Transactional Operations:**

**Create (Atomicity):**
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create table_config
  await tx.table_config.create({ ... });
  
  // 2. Create all timeslots
  await tx.timeslot.createMany({ data: timeslots });
});
```

**Delete (Cascade):**
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Delete table_config
  await tx.table_config.delete({ ... });
  
  // 2. Delete all timeslots
  await tx.timeslot.deleteMany({ ... });
  
  // 3. Delete teacher responsibilities
  await tx.teachers_responsibility.deleteMany({ ... });
});
```

---

## API Coverage

### Original API Routes (Migrated)

1. **GET /api/timeslot?AcademicYear={year}&Semester={sem}** → `getTimeslotsByTermAction()`
2. **POST /api/timeslot** → `createTimeslotsAction(config)`
3. **DELETE /api/timeslot** → `deleteTimeslotsByTermAction()`

**Additional Actions:**
- `getTimeslotByIdAction()` (single timeslot)
- `getTimeslotCountAction()` (all timeslots)
- `getTimeslotCountByTermAction()` (term-specific)

---

## Key Features

### DateTime Handling

**UTC Time Calculations:**
```typescript
// Parse start time
let slotStart = new Date(`1970-01-01T${config.StartTime}:00Z`);

// Add mini break
slotStart.setUTCMinutes(slotStart.getUTCMinutes() + miniBreakDuration);

// Calculate end time
const endTime = new Date(slotStart);
endTime.setUTCMinutes(endTime.getUTCMinutes() + duration);
```

**Prisma Time Type:**
- Database: `@db.Time(0)` (MySQL TIME)
- JavaScript: `Date` object
- Format: UTC timezone, 1970-01-01 date placeholder

### Complex Configuration Example

```typescript
const config = {
  AcademicYear: 2567,
  Semester: "SEMESTER_1",
  Days: ["MON", "TUE", "WED", "THU", "FRI"],
  StartTime: "08:00",           // First slot starts at 08:00
  Duration: 50,                 // Regular slots: 50 minutes
  BreakDuration: 15,            // Break slots: 15 minutes
  TimeslotPerDay: 8,            // 8 slots per day
  HasMinibreak: true,           // Enable mini break
  MiniBreak: {
    SlotNumber: 3,              // After slot 3
    Duration: 10,               // 10 minutes
  },
  BreakTimeslots: {
    Junior: 4,                  // Slot 4 is junior break
    Senior: 5,                  // Slot 5 is senior break
  },
};

// Generates: 5 days × 8 slots = 40 timeslots
```

**Generated Schedule:**
```
MON1: 08:00-08:50 (NOT_BREAK)
MON2: 08:50-09:40 (NOT_BREAK)
MON3: 09:40-10:30 (NOT_BREAK)
      + 10 min mini break
MON4: 10:40-10:55 (BREAK_JUNIOR)
MON5: 10:55-11:10 (BREAK_SENIOR)
MON6: 11:10-12:00 (NOT_BREAK)
MON7: 12:00-12:50 (NOT_BREAK)
MON8: 12:50-13:40 (NOT_BREAK)
... (repeat for TUE, WED, THU, FRI)
```

---

## Business Rules

1. **Uniqueness:** Only one set of timeslots per term (AcademicYear + Semester)
2. **Atomicity:** Config and timeslots created together (transaction)
3. **Cascade Delete:** Deleting timeslots also deletes config and teacher assignments
4. **Mini Break:** Optional, applies BEFORE specified slot
5. **Break Slots:** Can be different for junior/senior students
6. **Sorting:** Always sorted by day then slot number for consistency

---

## Testing Notes

### Unit Test Coverage Needed

```typescript
// timeslot.service.test.ts
describe('generateTimeslotId', () => {
  it('should format correctly', () => {
    expect(generateTimeslotId('SEMESTER_1', 2567, 'MON', 1)).toBe('1-2567-MON1');
  });
});

describe('calculateBreaktime', () => {
  it('should return BREAK_BOTH when both match', () => {
    expect(calculateBreaktime(4, { Junior: 4, Senior: 4 })).toBe('BREAK_BOTH');
  });
});

describe('generateTimeslots', () => {
  it('should generate correct number of timeslots', () => {
    const config = { Days: ['MON', 'TUE'], TimeslotPerDay: 8, ... };
    const result = generateTimeslots(config);
    expect(result).toHaveLength(16); // 2 days × 8 slots
  });
  
  it('should apply mini break correctly', () => {
    // Test mini break time adjustment
  });
  
  it('should calculate break times correctly', () => {
    // Test regular vs break slot durations
  });
});

describe('sortTimeslots', () => {
  it('should sort by day then slot', () => {
    // Test custom sorting logic
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
| **Timeslot** | ✅ Complete | 4 | 6 | Medium | **Complex** |
| Subject | ⏳ Pending | - | - | Low | Next |
| Lock | ⏳ Pending | - | - | Medium | - |
| Config | ⏳ Pending | - | - | High | - |
| Assign | ⏳ Pending | - | - | Medium | - |
| Class | ⏳ Pending | - | - | High | - |

**Total Progress:** 5/10 features complete (50%) 🎉

---

## Next Steps

### 1. Subject Feature Migration
- Priority: Next
- Complexity: Low
- Estimated: 2 hours
- Files: 4 (schemas, repository, validation, actions)

### 2. Frontend Updates (After All Migrations)
- Update timeslot configuration form to use `createTimeslotsAction()`
- Update timeslot display to use `getTimeslotsByTermAction()`
- Handle transaction errors appropriately
- Show progress during bulk creation

---

## Verification Checklist

- ✅ All files have 0 TypeScript errors
- ✅ Follows established pattern from previous features
- ✅ Uses Valibot (not Zod) for validation
- ✅ Complex generation algorithm preserved
- ✅ DateTime calculations preserved
- ✅ Custom sorting logic preserved
- ✅ Transactional operations for atomicity
- ✅ Cascade deletion logic preserved
- ✅ Thai error messages throughout
- ✅ Pure functions in domain layer
- ✅ Server Actions use `createAction()` wrapper

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
- **Valibot:** `v.object`, `v.pipe`, `v.string`, `v.number`, `v.enum`, `v.array`, `v.boolean`, `InferOutput`
- **Prisma:** `findMany`, `findUnique`, `findFirst`, `createMany`, `deleteMany`, `count`, `$transaction`
- **Prisma Types:** `timeslot`, `semester`, `day_of_week`, `breaktime`
- **JavaScript:** `Date`, `setUTCMinutes()`, `toISOString()`, array sort
- **Next.js:** Server Actions (`'use server'`), `createAction` wrapper

---

## Known Issues & Future Work

### Transaction Error Handling
```typescript
// Currently throws error on transaction failure
// Consider adding more granular error messages for:
// - Config creation failure
// - Timeslot creation failure
// - Partial success scenarios
```

### Mini Break Validation
```typescript
// No validation that MiniBreak.SlotNumber is within range
// Future: Add validation that SlotNumber <= TimeslotPerDay
```

### Time Format
```typescript
// StartTime expects "HH:mm" format as string
// Future: Consider using more robust time parsing with validation
```

### Cascade Delete Scope
```typescript
// Deletes ALL teacher responsibilities for term
// This is correct but should be clearly documented
```

---

## Rollback Plan

If issues arise:
1. Keep API routes at `src/app/api/timeslot/` active
2. Feature flags in frontend to switch between API/Server Actions
3. Monitor transaction failures and rollback behavior
4. Full rollback: delete `src/features/timeslot/` directory

---

**Migration Completed By:** AI Agent (Sequential-Thinking + Serena + context7)  
**Review Required:** Yes - verify DateTime calculations and transaction behavior  
**Deploy Status:** Ready for staging after thorough testing of generation algorithm
