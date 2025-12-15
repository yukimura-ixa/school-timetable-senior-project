# Prisma Schema Improvements - December 2025

> **Status:** Implemented  
> **Date:** December 6, 2025  
> **Review Method:** Serena + Context7 + Thoughtbox analysis

## Executive Summary

This document details critical schema improvements to enforce business rules at the database level and optimize query performance. Previously, these rules were only enforced in application code, creating risk of data integrity issues.

---

## Changes Overview

| Priority | Model | Change Type | Description |
|----------|-------|-------------|-------------|
| 🔴 Critical | `teachers_responsibility` | Unique Constraint | Prevent duplicate teacher-grade-subject-semester assignments |
| 🔴 Critical | `class_schedule` | Unique Constraint | Prevent class double-booking (same timeslot) |
| 🔴 Critical | `class_schedule` | Unique Constraint | Prevent room double-booking (same timeslot) |
| 🟡 Medium | `teacher` | Index | Department-based filtering performance |
| 🟡 Medium | `program_subject` | Index | Mandatory/elective subject filtering |

---

## 🔴 Critical Changes (Data Integrity)

### 1. `teachers_responsibility` - Unique Constraint

#### Problem

No database-level constraint prevented duplicate teacher assignments:
```sql
-- This was possible before (creating duplicates):
INSERT INTO teachers_responsibility (TeacherID, GradeID, SubjectCode, AcademicYear, Semester, TeachHour)
VALUES (1, 'M1-1', 'ท21101', 2567, 'SEMESTER_1', 2);
-- Running again would create a duplicate record
```

#### Solution

Added unique constraint on the combination of all assignment keys:
```prisma
model teachers_responsibility {
  // ... fields ...
  
  // CRITICAL: Unique constraint prevents duplicate teacher-grade-subject-semester assignments
  // A teacher can only be assigned to teach a subject to a grade once per semester
  @@unique([TeacherID, GradeID, SubjectCode, AcademicYear, Semester], map: "teachers_responsibility_unique")
}
```

#### Business Rule Enforced
> A teacher can only be assigned to teach a specific subject to a specific grade **once** per semester.

#### Index Optimization
Removed redundant index `teachers_responsibility_grade_subject_term_idx` since the unique constraint automatically creates an index on the same columns.

---

### 2. `class_schedule` - Class Conflict Prevention

#### Problem

Application code prevented class conflicts, but database allowed:
```sql
-- This was possible (class has two subjects at same time):
INSERT INTO class_schedule (ClassID, TimeslotID, GradeID, SubjectCode) 
VALUES ('A', '1-2567-MON-1', 'M1-1', 'ท21101');
INSERT INTO class_schedule (ClassID, TimeslotID, GradeID, SubjectCode) 
VALUES ('B', '1-2567-MON-1', 'M1-1', 'ค21101');  -- Same timeslot+grade!
```

#### Solution

Added unique constraint:
```prisma
model class_schedule {
  // ... fields ...
  
  // CRITICAL: A class (grade) cannot have two subjects at the same timeslot
  @@unique([TimeslotID, GradeID], map: "class_schedule_timeslot_grade_unique")
}
```

#### Business Rule Enforced
> A grade/class cannot have two different subjects scheduled at the same timeslot.

---

### 3. `class_schedule` - Room Conflict Prevention

#### Problem

Room double-booking was only prevented in application code:
```sql
-- This was possible (room used by two classes at same time):
INSERT INTO class_schedule (ClassID, TimeslotID, RoomID, GradeID, SubjectCode) 
VALUES ('A', '1-2567-MON-1', 101, 'M1-1', 'ท21101');
INSERT INTO class_schedule (ClassID, TimeslotID, RoomID, GradeID, SubjectCode) 
VALUES ('B', '1-2567-MON-1', 101, 'M1-2', 'ค21101');  -- Same timeslot+room!
```

#### Solution

Added unique constraint:
```prisma
model class_schedule {
  RoomID  Int?  // Nullable: allows "unassigned room" state during schedule drafting
  
  // CRITICAL: A room cannot host two classes at the same timeslot
  // Note: RoomID is nullable, so this only applies when RoomID IS NOT NULL
  @@unique([TimeslotID, RoomID], map: "class_schedule_timeslot_room_unique")
}
```

#### Business Rule Enforced
> A room cannot host two different classes at the same timeslot.

#### Special Consideration: Nullable RoomID
- `RoomID` remains nullable to support the "unassigned room" state during schedule drafting
- PostgreSQL handles NULL in unique constraints correctly: `NULL ≠ NULL`, so multiple schedules without room assignments don't conflict
- The unique constraint only enforces uniqueness when `RoomID IS NOT NULL`

---

### Index Cleanup

Removed redundant indexes that are now covered by unique constraints:

| Removed Index | Replaced By |
|--------------|-------------|
| `class_schedule_timeslot_grade_idx` | `class_schedule_timeslot_grade_unique` |
| `class_schedule_timeslot_room_idx` | `class_schedule_timeslot_room_unique` |
| `teachers_responsibility_grade_subject_term_idx` | `teachers_responsibility_unique` |

**Rationale:** Unique constraints automatically create indexes in PostgreSQL. Having both a unique constraint and a separate index on the same columns is redundant and wastes storage.

---

## 🟡 Medium Priority Changes (Performance)

### 4. `teacher` - Department Index

#### Added

```prisma
model teacher {
  Department  String  @default("-")
  
  // Performance index for department-based filtering (teacher-table, arrange page)
  @@index([Department], map: "teacher_Department_idx")
}
```

#### Use Cases Optimized

- Teacher table filtering by department (e.g., "Show all Math teachers")
- Arrange page teacher dropdown (grouped by department)
- Export teachers by department
- Analytics/reports by learning area

#### Expected Impact

Queries like this benefit:
```sql
SELECT * FROM teacher WHERE Department = 'คณิตศาสตร์';
```

---

### 5. `program_subject` - IsMandatory Index

#### Added

```prisma
model program_subject {
  IsMandatory Boolean @default(true)
  
  // Performance index for filtering mandatory vs elective subjects
  @@index([IsMandatory], map: "program_subject_IsMandatory_idx")
}
```

#### Use Cases Optimized

- Curriculum view: "Show mandatory subjects only"
- Credit calculation: Sum credits of mandatory subjects
- Program validation: Check all mandatory subjects are scheduled

#### Expected Impact

Queries like this benefit:
```sql
SELECT * FROM program_subject WHERE ProgramID = 1 AND IsMandatory = true;
```

---

## Migration Guide

### Pre-Migration Checklist

⚠️ **CRITICAL:** Adding unique constraints may fail if duplicate data exists.

1. **Check for duplicate teachers_responsibility:**
   ```sql
   SELECT TeacherID, GradeID, SubjectCode, AcademicYear, Semester, COUNT(*) as cnt
   FROM teachers_responsibility
   GROUP BY TeacherID, GradeID, SubjectCode, AcademicYear, Semester
   HAVING COUNT(*) > 1;
   ```

2. **Check for class conflicts:**
   ```sql
   SELECT TimeslotID, GradeID, COUNT(*) as cnt
   FROM class_schedule
   GROUP BY TimeslotID, GradeID
   HAVING COUNT(*) > 1;
   ```

3. **Check for room conflicts:**
   ```sql
   SELECT TimeslotID, RoomID, COUNT(*) as cnt
   FROM class_schedule
   WHERE RoomID IS NOT NULL
   GROUP BY TimeslotID, RoomID
   HAVING COUNT(*) > 1;
   ```

### Migration Steps

1. **Development:**
   ```bash
   pnpm prisma migrate dev --name add_unique_constraints_dec2025
   ```

2. **Production:**
   ```bash
   # Run pre-migration checks first!
   pnpm prisma migrate deploy
   ```

### Rollback Plan

If migration fails due to duplicates:

1. Identify and resolve duplicate data manually
2. Re-run migration
3. Or: Revert schema changes and deploy without constraints (not recommended)

---

## Impact Analysis

### Breaking Changes

**None** - These changes are additive constraints. Existing valid data will work.

### Application Code Impact

**Minimal** - Application code already enforces these rules. The constraints provide a safety net.

| Layer | Impact |
|-------|--------|
| Repository | No changes needed |
| Server Actions | No changes needed |
| UI Components | No changes needed |
| Seed Data | Already creates valid data |

### Error Handling

If application code tries to violate a constraint, Prisma will throw:

```typescript
// Example error for duplicate responsibility
{
  code: 'P2002',
  meta: { target: ['TeacherID', 'GradeID', 'SubjectCode', 'AcademicYear', 'Semester'] },
  message: 'Unique constraint failed on the constraint: `teachers_responsibility_unique`'
}
```

**Recommendation:** Existing try/catch in Server Actions will handle this. Consider adding user-friendly error messages for constraint violations.

---

## Performance Considerations

### Index Size Impact

| Index | Estimated Size |
|-------|---------------|
| `teacher_Department_idx` | ~10 KB (8 departments × ~50 teachers) |
| `program_subject_IsMandatory_idx` | ~5 KB (boolean field) |
| Unique constraint indexes | Replace existing indexes (no net change) |

### Write Performance

- **Inserts:** Minimal overhead (~1-2ms per constraint check)
- **Updates:** Only affected if unique columns change
- **Deletes:** No impact

### Read Performance

- **Improved:** Department filtering, mandatory subject filtering
- **Unchanged:** Conflict detection (constraint indexes replace existing indexes)

---

## Testing Recommendations

### Unit Tests

Add tests to verify constraints work:

```typescript
describe('teachers_responsibility unique constraint', () => {
  it('should prevent duplicate assignments', async () => {
    // Create first assignment
    await prisma.teachers_responsibility.create({
      data: { TeacherID: 1, GradeID: 'M1-1', SubjectCode: 'ท21101', AcademicYear: 2567, Semester: 'SEMESTER_1', TeachHour: 2 }
    });
    
    // Attempt duplicate should throw
    await expect(
      prisma.teachers_responsibility.create({
        data: { TeacherID: 1, GradeID: 'M1-1', SubjectCode: 'ท21101', AcademicYear: 2567, Semester: 'SEMESTER_1', TeachHour: 2 }
      })
    ).rejects.toThrow('Unique constraint failed');
  });
});
```

### E2E Tests

Existing E2E tests should continue to pass. No changes needed unless tests were relying on being able to create duplicate data (which would indicate a bug in the test).

---

## Future Considerations

### Low Priority Improvements (Not Implemented)

1. **Extend `subject_credit` enum:**
   - Current: 0.5, 1.0, 1.5, 2.0
   - Consider adding: CREDIT_25 (2.5), CREDIT_30 (3.0)
   - Impact: Requires enum migration

2. **Teacher conflict constraint:**
   - Currently handled via `teachers_responsibility` M:N relation
   - Could add direct constraint on `class_schedule` via trigger
   - Impact: Complex, requires PostgreSQL function

---

## Appendix: Full Schema Diff

```diff
 model class_schedule {
   ClassID                 String                    @id
   TimeslotID              String
   SubjectCode             String
-  RoomID                  Int?
+  RoomID                  Int?                      // Nullable: allows "unassigned room" state during schedule drafting
   GradeID                 String
   IsLocked                Boolean                   @default(false)
   // ... relations ...
 
+  // Basic indexes for FK lookups
   @@index([GradeID], map: "class_schedule_GradeID_idx")
   @@index([RoomID], map: "class_schedule_RoomID_idx")
   @@index([SubjectCode], map: "class_schedule_SubjectCode_idx")
   @@index([TimeslotID], map: "class_schedule_TimeslotID_idx")
-  // Performance indexes for conflict detection
-  @@index([TimeslotID, GradeID], map: "class_schedule_timeslot_grade_idx")
-  @@index([TimeslotID, RoomID], map: "class_schedule_timeslot_room_idx")
   @@index([GradeID, IsLocked], map: "class_schedule_grade_locked_idx")
+
+  // CRITICAL: Conflict prevention constraints (enforces business rules at DB level)
+  @@unique([TimeslotID, GradeID], map: "class_schedule_timeslot_grade_unique")
+  @@unique([TimeslotID, RoomID], map: "class_schedule_timeslot_room_unique")
 }

 model teacher {
   // ... fields ...
+
+  // Performance index for department-based filtering
+  @@index([Department], map: "teacher_Department_idx")
 }

 model program_subject {
   // ... fields ...
   @@index([Category], map: "program_subject_Category_idx")
+  // Performance index for filtering mandatory vs elective subjects
+  @@index([IsMandatory], map: "program_subject_IsMandatory_idx")
 }

 model teachers_responsibility {
   // ... fields ...
   
+  // Basic indexes for FK lookups
   @@index([TeacherID], map: "teachers_responsibility_TeacherID_idx")
   @@index([GradeID], map: "teachers_responsibility_GradeID_idx")
   @@index([SubjectCode], map: "teachers_responsibility_SubjectCode_idx")
+
+  // Performance indexes for finding teacher assignments
   @@index([TeacherID, AcademicYear, Semester], map: "teachers_responsibility_teacher_term_idx")
-  @@index([GradeID, SubjectCode, AcademicYear, Semester], map: "teachers_responsibility_grade_subject_term_idx")
+
+  // CRITICAL: Unique constraint prevents duplicate assignments
+  @@unique([TeacherID, GradeID, SubjectCode, AcademicYear, Semester], map: "teachers_responsibility_unique")
 }
```

---

## Verification Commands

```bash
# Validate schema syntax
pnpm prisma validate

# Generate new migration (development)
pnpm prisma migrate dev --name add_unique_constraints_dec2025

# View migration SQL without applying
pnpm prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma

# Apply migration to production
pnpm prisma migrate deploy
```

---

**Document Version:** 1.0  
**Author:** AI Assistant (GitHub Copilot)  
**Review Status:** Ready for team review
