# Data Model & Business Rules

## Database Schema Overview

### Core Entities

#### 1. Semester & Configuration (`table_config`)
**Purpose**: Stores semester metadata and timetable configuration

**Key Fields**:
- `ConfigID` (PK): **Format: "SEMESTER-YEAR"** (e.g., "1-2567", "2-2568")
- `AcademicYear`: Integer (e.g., 2567, 2568)
- `Semester`: Enum (`SEMESTER_1`, `SEMESTER_2`)
- `Config`: JSON object with timetable settings
- `status`: Enum (`DRAFT`, `PUBLISHED`, `LOCKED`, `ARCHIVED`)
- `configCompleteness`: Integer (0-100 percentage)
- `isPinned`: Boolean

**Business Rules**:
- ConfigID must match pattern: `/^[1-3]-\d{4}$/`
- ConfigID must be unique across the system
- ConfigID format: `"${semesterNumber}-${academicYear}"` where semesterNumber is 1, 2, or 3
- One config per academic year + semester combination
- Config JSON contains: `periodsPerDay`, `startTime`, `periodDuration`, `schoolDays`, `lunchBreak`, `breakTimes`

#### 2. Timeslot (`timeslot`)
**Purpose**: Defines available time periods for scheduling

**Key Fields**:
- `TimeslotID` (PK): **Format: "SEMESTER-YEAR-DAYPERIOD"** (e.g., "1-2567-MON1", "2-2568-FRI8")
- `AcademicYear`: Integer
- `Semester`: Enum (`SEMESTER_1`, `SEMESTER_2`)
- `DayOfWeek`: Enum (`MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`, `SUN`)
- `StartTime`: DateTime
- `EndTime`: DateTime
- `Breaktime`: Enum (`NOT_BREAK`, `BREAK_JUNIOR`, `BREAK_SENIOR`)

**Business Rules**:
- TimeslotID must include ConfigID prefix for isolation
- Timeslots are created in sets (e.g., 40 slots = 5 days × 8 periods)
- Break times vary by grade level (junior/senior)
- Timeslots cannot overlap for the same day
- Standard schedule: 8 periods/day, 5 days/week

#### 3. Teacher (`teacher`)
**Key Fields**:
- `TeacherID` (PK): Integer (auto-increment)
- `Prefix`: String (e.g., "นาย", "นาง", "นางสาว")
- `Firstname`, `Lastname`: String
- `Department`: String (subject group)
- `Email`: String (unique)
- `Role`: Enum (`TEACHER`, `ADMIN`)

**Business Rules**:
- Email must be unique
- Teachers can have role `ADMIN` for system access
- Department groups teachers by subject area

#### 4. Subject (`subject`)
**Key Fields**:
- `SubjectCode` (PK): String (e.g., "ENG101", "MATH201")
- `SubjectName`: String
- `Level`: String (grade level)
- `HoursPerWeek`: Integer
- `Category`: Enum (`CORE`, `ADDITIONAL`, `ELECTIVE`)

**Business Rules**:
- SubjectCode must be unique
- HoursPerWeek determines weekly teaching hours
- Categories affect curriculum requirements

#### 5. GradeLevel (`gradelevel`)
**Key Fields**:
- `GradeID` (PK): Integer (auto-increment)
- `GradeLevel`: Integer (e.g., 7, 8, 9 for M.1, M.2, M.3)
- `Section`: Integer (room number)
- `ProgramCode`: String (FK to `program`)

**Business Rules**:
- Combination of GradeLevel + Section must be unique
- Each grade belongs to one program (e.g., "M1-SCI", "M2-LANG")

#### 6. Room (`room`)
**Key Fields**:
- `RoomID` (PK): Integer (auto-increment)
- `RoomName`: String
- `Building`: String
- `Floor`: String

**Business Rules**:
- RoomName must be unique
- Rooms can be assigned to multiple schedules if timeslots don't conflict

#### 7. ClassSchedule (`class_schedule`)
**Purpose**: Core scheduling entity linking teachers, subjects, classes, and timeslots

**Key Fields**:
- `ClassScheduleID` (PK): Integer (auto-increment)
- `ConfigID`: String (FK to `table_config`)
- `TeacherID`: Integer (FK to `teacher`)
- `SubjectCode`: String (FK to `subject`)
- `GradeID`: Integer (FK to `gradelevel`)
- `TimeslotID`: String (FK to `timeslot`)
- `RoomID`: Integer (FK to `room`, nullable)
- `IsLocked`: Boolean (prevents changes)

**Business Rules**:
- **No teacher conflicts**: A teacher cannot be assigned to two schedules in the same timeslot
- **No class conflicts**: A grade cannot have two schedules in the same timeslot
- **No room conflicts**: A room cannot be assigned to two schedules in the same timeslot
- Locked schedules cannot be modified (for assemblies, exams, etc.)
- All schedules must belong to a valid ConfigID (semester)

#### 8. TeachersResponsibility (`teachers_responsibility`)
**Purpose**: Assigns subjects to teachers for a semester

**Key Fields**:
- `TeacherResponsibilityID` (PK): Integer (auto-increment)
- `ConfigID`: String (FK to `table_config`)
- `TeacherID`: Integer (FK to `teacher`)
- `SubjectCode`: String (FK to `subject`)
- `GradeID`: Integer (FK to `gradelevel`)
- `TeachHour`: Integer (weekly hours)

**Business Rules**:
- Defines "who can teach what" for a semester
- TeachHour must not exceed subject's HoursPerWeek
- One teacher can have multiple responsibilities

#### 9. Program (`program`)
**Purpose**: Defines curriculum structure

**Key Fields**:
- `ProgramCode` (PK): String (e.g., "M1-SCI")
- `SubjectCode`: String (FK to `subject`)
- `AcademicYear`: Integer
- `Semester`: Enum (`SEMESTER_1`, `SEMESTER_2`)
- `MinCredits`: Integer
- `IsMandatory`: Boolean

**Business Rules**:
- Programs define required subjects for each grade
- Mandatory subjects must be scheduled
- MinCredits enforces curriculum requirements

## Critical Business Rules

### 1. ConfigID Format (CANONICAL)
```typescript
// Format: "SEMESTER-YEAR"
// Valid examples:
"1-2567"  // Semester 1, Year 2567
"2-2568"  // Semester 2, Year 2568
"3-2567"  // Summer semester (rare)

// Invalid formats (legacy, being phased out):
"1/2567"           // Slash separator (old)
"SEMESTER_1_2567"  // Verbose format (old)
"2567-SEMESTER_1"  // Year-first (old)
```

### 2. Conflict Detection Rules

**Teacher Conflict**:
```typescript
// A teacher cannot teach two classes simultaneously
function checkTeacherConflict(teacherId: number, timeslotId: string): boolean {
  const existingSchedule = await findSchedule({
    TeacherID: teacherId,
    TimeslotID: timeslotId,
  });
  return existingSchedule !== null;
}
```

**Class Conflict**:
```typescript
// A grade cannot have two subjects in the same timeslot
function checkClassConflict(gradeId: number, timeslotId: string): boolean {
  const existingSchedule = await findSchedule({
    GradeID: gradeId,
    TimeslotID: timeslotId,
  });
  return existingSchedule !== null;
}
```

**Room Conflict**:
```typescript
// A room cannot be used by two classes simultaneously
function checkRoomConflict(roomId: number, timeslotId: string): boolean {
  const existingSchedule = await findSchedule({
    RoomID: roomId,
    TimeslotID: timeslotId,
  });
  return existingSchedule !== null;
}
```

### 3. Locked Timeslot Rules
- Locked schedules (`IsLocked = true`) cannot be:
  - Modified
  - Deleted
  - Moved to different timeslots
- Used for:
  - School assemblies
  - Exams
  - Special events
- Affects all classes in that timeslot

### 4. Semester Lifecycle

**Status Flow**:
```
DRAFT → PUBLISHED → LOCKED → ARCHIVED
```

- **DRAFT**: Editable, schedules can be created/modified
- **PUBLISHED**: Visible to teachers/students, still editable by admin
- **LOCKED**: Read-only, no changes allowed
- **ARCHIVED**: Historical record, not shown in active lists

### 5. Data Integrity Rules

**Referential Integrity**:
- Cannot delete a teacher with assigned schedules
- Cannot delete a subject used in programs
- Cannot delete a timeslot with existing schedules
- ConfigID must exist before creating related records

**Uniqueness Constraints**:
- Email (teacher)
- SubjectCode (subject)
- RoomName (room)
- ConfigID (table_config)
- TimeslotID (timeslot)

## Data Seeding Rules

### Baseline Seeding
When creating a new semester, optionally seed:

1. **Semesters** (always):
   - Create `table_config` record with ConfigID
   - Set status to `DRAFT`
   - Initialize Config JSON

2. **Timeslots** (optional with `-SeedData`):
   - 40 timeslots = 5 days × 8 periods
   - Days: MON-FRI
   - Periods: 1-8 (08:30-16:10)
   - Breaks: Period 4 (junior), Period 5 (senior)

3. **Table Config** (optional with `-SeedData`):
   - `periodsPerDay`: 8
   - `startTime`: "08:30"
   - `periodDuration`: 50 minutes
   - `schoolDays`: ["MON", "TUE", "WED", "THU", "FRI"]
   - `lunchBreak`: { after: 4, duration: 60 }

### Idempotency Requirements
All seed operations must be **idempotent**:
```typescript
// Good: Check before create
const existing = await prisma.timeslot.findFirst({ where: { ConfigID } });
if (!existing) {
  await prisma.timeslot.createMany({ data: timeslots, skipDuplicates: true });
}

// Good: Use upsert
await prisma.table_config.upsert({
  where: { ConfigID },
  update: { Config: newConfig },
  create: { ConfigID, Config: newConfig },
});
```

## Validation Rules

### ConfigID Validation
```typescript
// Regex: /^[1-3]-\d{4}$/
function validateConfigIDFormat(configId: string): boolean {
  return /^[1-3]-\d{4}$/.test(configId);
}

// Parse ConfigID
function parseConfigID(configId: string): { semester: number; year: number } {
  const [semStr, yearStr] = configId.split('-');
  return {
    semester: parseInt(semStr),
    year: parseInt(yearStr),
  };
}
```

### Academic Year Validation
- Must be >= 2500 (Thai Buddhist calendar)
- Typically current year ± 2 years

### Semester Validation
- Must be 1, 2, or 3 (rare)
- Enum values: `SEMESTER_1`, `SEMESTER_2`

## Query Patterns

### Find by ConfigID
```typescript
const config = await prisma.table_config.findUnique({
  where: { ConfigID: "1-2567" },
});
```

### Find by Term
```typescript
const config = await prisma.table_config.findFirst({
  where: {
    AcademicYear: 2567,
    Semester: "SEMESTER_1",
  },
});
```

### Find Schedules with Conflicts
```typescript
const conflicts = await prisma.class_schedule.findMany({
  where: {
    ConfigID: "1-2567",
    TimeslotID: "1-2567-MON1",
    TeacherID: teacherId,
  },
});
```

## Export/Import Rules

### Excel Export
- Teacher timetables: Group by teacher
- Class timetables: Group by grade
- Summary tables: All teachers × all timeslots
- Format: `.xlsx` with proper Thai character encoding

### PDF Export
- Use `react-to-print` for client-side generation
- Include school logo and semester info
- Landscape orientation for wide tables

## Common Anti-Patterns to Avoid

❌ **Don't** use multiple ConfigID formats
✅ **Do** use canonical "SEMESTER-YEAR" format everywhere

❌ **Don't** assume ConfigID exists without validation
✅ **Do** validate ConfigID in route layouts and API handlers

❌ **Don't** allow duplicate schedules in the same timeslot
✅ **Do** check for conflicts before creating schedules

❌ **Don't** modify locked schedules
✅ **Do** check `IsLocked` flag before updates

❌ **Don't** create orphan records (missing FK references)
✅ **Do** validate foreign keys before inserts
