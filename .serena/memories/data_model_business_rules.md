# Data Model & Business Rules

**Last Updated:** October 31, 2025

## Database Overview

**ORM:** Prisma 6.18.0  
**Database:** PostgreSQL (Vercel Storage)  
**Schema Location:** `prisma/schema.prisma`

## Core Entities

### 1. Config (Semester Configuration)

```prisma
model config {
  ConfigID         String   @id  // Format: "1-2567" (SEMESTER-YEAR)
  AcademicYear     String
  Semester         String   // "1", "2", "3"
  NumberOfPeriod   Int      // Periods per day (e.g., 10)
  TimePerPeriod    Int      // Minutes per period (e.g., 50)
  Break            String   // JSON: [{"after": 4, "duration": 20}]
  SchoolDays       String   // JSON: ["MON", "TUE", "WED", "THU", "FRI"]
  CopiedFromID     String?  // Reference to previous term config
  CreatedAt        DateTime @default(now())
  UpdatedAt        DateTime @updatedAt

  // Relations
  timeslots        timeslot[]
  assigned_subject assigned_subject[]
  classschedule    classschedule[]
  locked_resource  locked_resource[]
}
```

**Business Rules:**

- ConfigID format: `/^[1-3]-\d{4}$/` (e.g., "1-2567")
- ConfigID is UNIQUE and immutable
- Used as prefix for TimeslotID: `"{ConfigID}-{Day}{Period}"` (e.g., "1-2567-MON1")
- Break is JSON array of objects: `{ after: number, duration: number }`
- SchoolDays is JSON array of day codes: `["MON", "TUE", "WED", "THU", "FRI"]`
- CopiedFromID allows copying configuration from previous term

**Server Actions:**

- `getConfigsAction()` - Get all configs
- `getConfigByIdAction({ ConfigID })` - Get specific config
- `createConfigAction({ AcademicYear, Semester, ... })` - Create new config
- `updateConfigAction({ ConfigID, ... })` - Update existing config
- `copyConfigAction({ fromConfigId, toConfigId })` - Copy from previous term

---

### 2. Teacher

```prisma
model teacher {
  TeacherID        String   @id
  Name             String
  Surname          String
  MaxHours         Int      // Maximum teaching hours per week
  AcademicYear     String
  Semester         String
  ConfigID         String
  CreatedAt        DateTime @default(now())
  UpdatedAt        DateTime @updatedAt

  // Relations
  assigned_subject assigned_subject[]
  classschedule    classschedule[]
  locked_teacher   locked_teacher[]
}
```

**Business Rules:**

- TeacherID format: Usually 5-digit number (e.g., "10001")
- MaxHours typical range: 18-25 hours
- Teacher cannot teach more than MaxHours per week
- Teacher cannot teach two classes at the same time
- Same teacher can teach multiple subjects (but not simultaneously)

**Server Actions:**

- `getTeachersAction({ AcademicYear, Semester })` - Get all teachers for term
- `getTeacherByIdAction({ TeacherID })` - Get single teacher
- `createTeacherAction({ Name, Surname, MaxHours, ... })` - Create teacher
- `updateTeacherAction({ TeacherID, ... })` - Update teacher
- `deleteTeacherAction({ TeacherID })` - Delete teacher

**Validation:**

```typescript
// features/teacher/domain/services/teacher-validation.service.ts
export function validateTeacherNotOverbooked(
  teacher: teacher,
  assignments: assigned_subject[],
): { valid: boolean; error?: string } {
  const totalHours = assignments
    .filter((a) => a.TeacherID === teacher.TeacherID)
    .reduce((sum, a) => sum + a.NumberOfHours, 0);

  if (totalHours > teacher.MaxHours) {
    return {
      valid: false,
      error: `ครูสอนเกิน ${teacher.MaxHours} ชั่วโมง (${totalHours} ชั่วโมง)`,
    };
  }

  return { valid: true };
}
```

---

### 3. Subject

```prisma
model subject {
  SubjectID        String   @id
  Name_TH          String
  Name_EN          String
  Credits          Int
  Category         String   // "พื้นฐาน", "เพิ่มเติม", "กิจกรรม"
  Color            String?  // Hex color for UI
  AcademicYear     String
  Semester         String
  ConfigID         String
  CreatedAt        DateTime @default(now())
  UpdatedAt        DateTime @updatedAt

  // Relations
  assigned_subject assigned_subject[]
  program_subject  program_subject[]
}
```

**Business Rules:**

- SubjectID format: 5-character code (e.g., "ท21101")
- Category types: "พื้นฐาน" (core), "เพิ่มเติม" (elective), "กิจกรรม" (activity)
- Credits typical values: 0.5, 1.0, 1.5, 2.0
- Activity subjects (กิจกรรม) typically have 1 credit
- Subject must be assigned to program before assignment to class

**Server Actions:**

- `getSubjectsAction({ AcademicYear, Semester })` - Get all subjects
- `getSubjectsByGradeAction({ GradeID })` - Get subjects for specific grade ✅ NEW (Oct 2025)
- `createSubjectAction({ SubjectID, Name_TH, ... })` - Create subject
- `updateSubjectAction({ SubjectID, ... })` - Update subject
- `deleteSubjectAction({ SubjectID })` - Delete subject

---

### 4. Room

```prisma
model room {
  RoomID           String   @id
  Name             String
  Capacity         Int?
  RoomType         String?  // "ห้องเรียน", "ห้องปฏิบัติการ", etc.
  AcademicYear     String
  Semester         String
  ConfigID         String
  CreatedAt        DateTime @default(now())
  UpdatedAt        DateTime @updatedAt

  // Relations
  classschedule    classschedule[]
  locked_room      locked_room[]
}
```

**Business Rules:**

- RoomID format: Building + Room number (e.g., "A101", "LAB1")
- Capacity typical range: 20-50 students
- Room cannot be used by multiple classes at same time
- Lab rooms (ห้องปฏิบัติการ) should be assigned to science/computer subjects

**Server Actions:**

- `getRoomsAction({ AcademicYear, Semester })` - Get all rooms
- `getAvailableRoomsAction({ Day, Period, ConfigID })` - Get rooms not in use ✅
- `createRoomAction({ RoomID, Name, ... })` - Create room
- `updateRoomAction({ RoomID, ... })` - Update room
- `deleteRoomAction({ RoomID })` - Delete room

---

### 5. GradeLevel (Class)

```prisma
model gradelevel {
  GradeID          String   @id
  GradeName        String   // "ม.1/1", "ม.2/3", "ม.6/5"
  Level            Int      // 1-6 for มัธยมศึกษาปีที่ 1-6
  Section          Int      // Section/room number
  ProgramID        String
  AcademicYear     String
  Semester         String
  ConfigID         String
  CreatedAt        DateTime @default(now())
  UpdatedAt        DateTime @updatedAt

  // Relations
  program          program  @relation(fields: [ProgramID], references: [ProgramID])
  assigned_subject assigned_subject[]
  classschedule    classschedule[]
  locked_class     locked_class[]
}
```

**Business Rules:**

- GradeID format: "{Level}-{Section}" (e.g., "1-1" for ม.1/1)
- GradeName format: "ม.{Level}/{Section}" (e.g., "ม.1/1")
- Level range: 1-6 (มัธยมศึกษาปีที่ 1-6)
- Each grade is associated with exactly one program
- Students in same grade attend same classes (no individual tracking)

**Server Actions:**

- `getGradeLevelsAction({ AcademicYear, Semester })` - Get all grades
- `getGradeLevelsForLockAction({ AcademicYear, Semester })` - Get grades for locking ✅
- `createGradeLevelAction({ Level, Section, ProgramID, ... })` - Create grade
- `updateGradeLevelAction({ GradeID, ... })` - Update grade
- `deleteGradeLevelAction({ GradeID })` - Delete grade

---

### 6. Program (Curriculum)

```prisma
model program {
  ProgramID        String   @id
  ProgramName      String   // "วิทยาศาสตร์-คณิตศาสตร์", "ศิลป์-คำนวณ"
  Track            String?  // "วิทย์-คณิต", "ศิลป์-คำนวณ"
  AcademicYear     String
  Semester         String
  ConfigID         String
  CreatedAt        DateTime @default(now())
  UpdatedAt        DateTime @updatedAt

  // Relations
  gradelevel       gradelevel[]
  program_subject  program_subject[]
}
```

**Business Rules:**

- ProgramID format: Short code (e.g., "SCI-MATH", "ART-COMP")
- Common tracks: วิทย์-คณิต, ศิลป์-คำนวณ, ศิลป์-ภาษา
- Program defines curriculum (set of subjects) for grades
- Each program can have multiple subjects with credits

**Server Actions:**

- `getProgramsAction({ AcademicYear, Semester })` - Get all programs
- `getProgramByGradeAction({ GradeID })` - Get program for specific grade ✅ NEW (Oct 2025)
- `createProgramAction({ ProgramID, ProgramName, ... })` - Create program
- `updateProgramAction({ ProgramID, ... })` - Update program
- `deleteProgramAction({ ProgramID })` - Delete program

**Repository Pattern:**

```typescript
// features/program/infrastructure/repositories/program.repository.ts
export const programRepository = {
  async findByGrade(gradeId: string) {
    const gradelevel = await prisma.gradelevel.findUnique({
      where: { GradeID: gradeId },
      include: {
        program: {
          include: {
            program_subject: {
              include: { subject: true },
              orderBy: { SortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!gradelevel?.program) return null;

    // Transform program_subject to subjects array
    return {
      ...gradelevel.program,
      subjects: gradelevel.program.program_subject.map((ps) => ({
        ...ps.subject,
        Credits: ps.Credits,
        Category: ps.Category,
        SortOrder: ps.SortOrder,
      })),
    };
  },
};
```

---

### 7. Program_Subject (Junction)

```prisma
model program_subject {
  ProgramID        String
  SubjectID        String
  Credits          Int
  Category         String   // Overrides subject.Category if different
  SortOrder        Int      // Display order in curriculum

  @@id([ProgramID, SubjectID])

  // Relations
  program          program  @relation(fields: [ProgramID], references: [ProgramID])
  subject          subject  @relation(fields: [SubjectID], references: [SubjectID])
}
```

**Business Rules:**

- Defines which subjects belong to which program
- Can override subject Credits/Category at program level
- SortOrder determines display order in curriculum view
- Total credits per program should meet ministry requirements (e.g., 20 credits per semester)

---

### 8. Assigned_Subject

```prisma
model assigned_subject {
  AssignID         String   @id @default(uuid())
  GradeID          String
  SubjectID        String
  TeacherID        String
  NumberOfHours    Int      // Weekly teaching hours for this assignment
  AcademicYear     String
  Semester         String
  ConfigID         String
  CreatedAt        DateTime @default(now())
  UpdatedAt        DateTime @updatedAt

  // Relations
  config           config     @relation(fields: [ConfigID], references: [ConfigID])
  gradelevel       gradelevel @relation(fields: [GradeID], references: [GradeID])
  subject          subject    @relation(fields: [SubjectID], references: [SubjectID])
  teacher          teacher    @relation(fields: [TeacherID], references: [TeacherID])
}
```

**Business Rules:**

- Represents "Teacher X teaches Subject Y to Grade Z for N hours"
- NumberOfHours must equal subject Credits (e.g., 2 credit subject = 2 hours/week)
- Total NumberOfHours per teacher cannot exceed teacher.MaxHours
- Same subject can have multiple teachers for different grades
- Same teacher can teach multiple subjects to same grade

**Server Actions:**

- `getAssignmentsAction({ AcademicYear, Semester })` - Get all assignments ✅
- `createAssignmentAction({ GradeID, SubjectID, TeacherID, ... })` - Create assignment
- `updateAssignmentAction({ AssignID, ... })` - Update assignment
- `deleteAssignmentAction({ AssignID })` - Delete assignment

**Validation:**

```typescript
export function validateAssignmentHoursMatchCredits(
  subject: subject,
  numberOfHours: number,
): { valid: boolean; error?: string } {
  if (numberOfHours !== subject.Credits) {
    return {
      valid: false,
      error: `จำนวนชั่วโมง (${numberOfHours}) ไม่ตรงกับหน่วยกิต (${subject.Credits})`,
    };
  }
  return { valid: true };
}
```

---

### 9. Timeslot

```prisma
model timeslot {
  TimeslotID       String   @id  // Format: "{ConfigID}-{Day}{Period}" (e.g., "1-2567-MON1")
  Day              String   // "MON", "TUE", "WED", "THU", "FRI"
  PeriodStart      Int      // Period number (1-10)
  PeriodEnd        Int?     // For multi-period slots (optional)
  StartTime        String   // "08:00"
  EndTime          String   // "08:50"
  AcademicYear     String
  Semester         String
  ConfigID         String
  CreatedAt        DateTime @default(now())
  UpdatedAt        DateTime @updatedAt

  // Relations
  config           config  @relation(fields: [ConfigID], references: [ConfigID])
  classschedule    classschedule[]
}
```

**Business Rules:**

- TimeslotID format: `"{ConfigID}-{Day}{Period}"` (e.g., "1-2567-MON1")
- Day must be in config.SchoolDays
- PeriodStart must be 1 to config.NumberOfPeriod
- PeriodEnd allows multi-period slots (e.g., lab classes)
- StartTime/EndTime calculated from config.TimePerPeriod and config.Break
- Each timeslot represents a single teaching period in the week

**Server Actions:**

- `getTimeslotsAction({ ConfigID })` - Get all timeslots for config
- `getTimeslotsByTermAction({ AcademicYear, Semester })` - Get all timeslots for term ✅
- `createTimeslotAction({ Day, PeriodStart, ... })` - Create timeslot
- `updateTimeslotAction({ TimeslotID, ... })` - Update timeslot
- `deleteTimeslotAction({ TimeslotID })` - Delete timeslot

**Generation:**

```typescript
export function generateTimeslots(config: config): Partial<timeslot>[] {
  const schoolDays = JSON.parse(config.SchoolDays) as string[];
  const breaks = JSON.parse(config.Break) as {
    after: number;
    duration: number;
  }[];
  const timeslots: Partial<timeslot>[] = [];

  for (const day of schoolDays) {
    let currentTime = "08:00"; // School start time

    for (let period = 1; period <= config.NumberOfPeriod; period++) {
      const timeslotId = `${config.ConfigID}-${day}${period}`;
      const startTime = currentTime;
      const endTime = addMinutes(currentTime, config.TimePerPeriod);

      timeslots.push({
        TimeslotID: timeslotId,
        Day: day,
        PeriodStart: period,
        StartTime: startTime,
        EndTime: endTime,
        ConfigID: config.ConfigID,
        AcademicYear: config.AcademicYear,
        Semester: config.Semester,
      });

      currentTime = endTime;

      // Add break if configured
      const breakConfig = breaks.find((b) => b.after === period);
      if (breakConfig) {
        currentTime = addMinutes(currentTime, breakConfig.duration);
      }
    }
  }

  return timeslots;
}
```

---

### 10. ClassSchedule

```prisma
model classschedule {
  ScheduleID       String   @id @default(uuid())
  GradeID          String
  SubjectID        String
  TeacherID        String
  RoomID           String
  TimeslotID       String
  AcademicYear     String
  Semester         String
  ConfigID         String
  CreatedAt        DateTime @default(now())
  UpdatedAt        DateTime @updatedAt

  // Relations
  config           config     @relation(fields: [ConfigID], references: [ConfigID])
  gradelevel       gradelevel @relation(fields: [GradeID], references: [GradeID])
  teacher          teacher    @relation(fields: [TeacherID], references: [TeacherID])
  room             room       @relation(fields: [RoomID], references: [RoomID])
  timeslot         timeslot   @relation(fields: [TimeslotID], references: [TimeslotID])
}
```

**Business Rules:**

- Represents one class session in the timetable
- **Class cannot have two subjects at same time** (unique GradeID + TimeslotID)
- **Teacher cannot teach two classes at same time** (unique TeacherID + TimeslotID)
- **Room cannot be used by two classes at same time** (unique RoomID + TimeslotID)
- Must reference existing assigned_subject (GradeID + SubjectID + TeacherID)
- Total schedule entries per subject must equal assigned_subject.NumberOfHours

**Server Actions:**

- `getClassSchedulesAction({ GradeID?, TeacherID? })` - Get schedules filtered ✅
- `getSummaryAction({ AcademicYear, Semester })` - Get schedule summary ✅
- `createScheduleAction({ GradeID, SubjectID, ... })` - Create schedule entry
- `updateScheduleAction({ ScheduleID, ... })` - Update schedule entry
- `deleteScheduleAction({ ScheduleID })` - Delete schedule entry

**Conflict Detection:**

```typescript
export function validateNoScheduleConflict(
  newSchedule: Partial<classschedule>,
  existingSchedules: classschedule[],
): { valid: boolean; error?: string } {
  // Check class conflict
  const classConflict = existingSchedules.find(
    (s) =>
      s.GradeID === newSchedule.GradeID &&
      s.TimeslotID === newSchedule.TimeslotID,
  );
  if (classConflict) {
    return {
      valid: false,
      error: `ชั้นเรียน ${newSchedule.GradeID} มีวิชาอื่นในช่วงเวลานี้แล้ว`,
    };
  }

  // Check teacher conflict
  const teacherConflict = existingSchedules.find(
    (s) =>
      s.TeacherID === newSchedule.TeacherID &&
      s.TimeslotID === newSchedule.TimeslotID,
  );
  if (teacherConflict) {
    return {
      valid: false,
      error: `ครู ${newSchedule.TeacherID} สอนวิชาอื่นในช่วงเวลานี้แล้ว`,
    };
  }

  // Check room conflict
  const roomConflict = existingSchedules.find(
    (s) =>
      s.RoomID === newSchedule.RoomID &&
      s.TimeslotID === newSchedule.TimeslotID,
  );
  if (roomConflict) {
    return {
      valid: false,
      error: `ห้อง ${newSchedule.RoomID} ถูกใช้โดยชั้นอื่นในช่วงเวลานี้แล้ว`,
    };
  }

  return { valid: true };
}
```

---

### 11. Locked Resources (Schedule Locking)

```prisma
model locked_resource {
  LockedID         String   @id @default(uuid())
  ResourceType     String   // "CLASS", "TEACHER", "ROOM"
  ResourceID       String   // GradeID, TeacherID, or RoomID
  TimeslotID       String
  Reason           String?  // "ชุมนุม", "สอบกลางภาค", etc.
  AcademicYear     String
  Semester         String
  ConfigID         String
  CreatedAt        DateTime @default(now())

  // Relations
  config           config  @relation(fields: [ConfigID], references: [ConfigID])
  locked_class     locked_class?
  locked_teacher   locked_teacher?
  locked_room      locked_room?
}

model locked_class {
  LockedID         String         @id
  GradeID          String
  locked_resource  locked_resource @relation(fields: [LockedID], references: [LockedID])
  gradelevel       gradelevel      @relation(fields: [GradeID], references: [GradeID])
}

model locked_teacher {
  LockedID         String         @id
  TeacherID        String
  locked_resource  locked_resource @relation(fields: [LockedID], references: [LockedID])
  teacher          teacher         @relation(fields: [TeacherID], references: [TeacherID])
}

model locked_room {
  LockedID         String         @id
  RoomID           String
  locked_resource  locked_resource @relation(fields: [LockedID], references: [LockedID])
  room             room            @relation(fields: [RoomID], references: [RoomID])
}
```

**Business Rules:**

- Prevents scheduling during specific timeslots (e.g., assembly, exams)
- ResourceType must be "CLASS", "TEACHER", or "ROOM"
- Locked resources cannot be assigned to classschedule during locked timeslots
- Common reasons: "ชุมนุม" (club activities), "สอบกลางภาค" (midterm), "กิจกรรม" (event)

**Server Actions:**

- `getLockedRespsAction({ AcademicYear, Semester })` - Get all locked resources ✅
- `createLockedResourceAction({ ResourceType, ResourceID, TimeslotID, ... })` - Lock resource
- `deleteLockedResourceAction({ LockedID })` - Unlock resource

---

## Query Patterns with Server Actions

### Example 1: Get Teacher's Full Schedule

```typescript
// features/teacher/application/actions/teacher.actions.ts
export const getTeacherScheduleAction = createAction(
  getTeacherScheduleSchema,
  async (input: GetTeacherScheduleInput) => {
    const schedule = await prisma.classschedule.findMany({
      where: {
        TeacherID: input.TeacherID,
        AcademicYear: input.AcademicYear,
        Semester: input.Semester,
      },
      include: {
        gradelevel: true,
        subject: true,
        room: true,
        timeslot: true,
      },
      orderBy: [
        { timeslot: { Day: "asc" } },
        { timeslot: { PeriodStart: "asc" } },
      ],
    });
    return schedule;
  },
);
```

### Example 2: Get Available Rooms for Timeslot

```typescript
// features/room/application/actions/room.actions.ts
export const getAvailableRoomsAction = createAction(
  getAvailableRoomsSchema,
  async (input: GetAvailableRoomsInput) => {
    // Get all rooms
    const allRooms = await prisma.room.findMany({
      where: { ConfigID: input.ConfigID },
    });

    // Get rooms already used in this timeslot
    const usedRooms = await prisma.classschedule.findMany({
      where: { TimeslotID: input.TimeslotID },
      select: { RoomID: true },
    });

    const usedRoomIds = usedRooms.map((r) => r.RoomID);

    // Filter available rooms
    return allRooms.filter((room) => !usedRoomIds.includes(room.RoomID));
  },
);
```

### Example 3: Validate Assignment Before Create

```typescript
// features/assign/application/actions/assign.actions.ts
export const createAssignmentAction = createAction(
  createAssignmentSchema,
  async (input: CreateAssignmentInput) => {
    // 1. Get subject to check credits
    const subject = await prisma.subject.findUnique({
      where: { SubjectID: input.SubjectID },
    });
    if (!subject) throw new Error("ไม่พบวิชา");

    // 2. Validate hours match credits
    if (input.NumberOfHours !== subject.Credits) {
      throw new Error(`จำนวนชั่วโมงต้องเท่ากับหน่วยกิต (${subject.Credits})`);
    }

    // 3. Get teacher to check MaxHours
    const teacher = await prisma.teacher.findUnique({
      where: { TeacherID: input.TeacherID },
      include: { assigned_subject: true },
    });
    if (!teacher) throw new Error("ไม่พบครู");

    const currentHours = teacher.assigned_subject.reduce(
      (sum, a) => sum + a.NumberOfHours,
      0,
    );

    if (currentHours + input.NumberOfHours > teacher.MaxHours) {
      throw new Error(
        `ครูสอนเกิน ${teacher.MaxHours} ชม. (ปัจจุบัน ${currentHours} + ใหม่ ${input.NumberOfHours})`,
      );
    }

    // 4. Create assignment
    return await prisma.assigned_subject.create({
      data: {
        GradeID: input.GradeID,
        SubjectID: input.SubjectID,
        TeacherID: input.TeacherID,
        NumberOfHours: input.NumberOfHours,
        AcademicYear: input.AcademicYear,
        Semester: input.Semester,
        ConfigID: input.ConfigID,
      },
    });
  },
);
```

---

## Common Business Rules Summary

### 1. Semester Lifecycle

1. Admin creates config (semester/year/periods/breaks)
2. System generates timeslots automatically
3. Admin adds teachers/rooms/subjects/grades/programs
4. Admin assigns subjects to programs
5. Admin assigns subjects to classes (with teachers)
6. Admin locks special timeslots (optional)
7. Admin arranges schedule (drag-and-drop)
8. System validates conflicts in real-time
9. Admin publishes schedule
10. Teachers/students view schedule online

### 2. Conflict Prevention

- **Hard Constraints** (MUST NOT violate):
  - Class cannot have 2 subjects at same time
  - Teacher cannot teach 2 classes at same time
  - Room cannot host 2 classes at same time
  - Teacher cannot exceed MaxHours
  - Cannot schedule during locked timeslots

- **Soft Constraints** (SHOULD avoid):
  - Minimize gaps in teacher's schedule
  - Distribute subjects evenly across week
  - Assign lab rooms to science subjects
  - Keep same subject on alternating days (not consecutive)

### 3. Data Integrity

- All entities reference ConfigID (semester-specific)
- ConfigID format enforced: `"SEMESTER-YEAR"`
- Foreign keys with `onDelete: Cascade` where appropriate
- Unique constraints prevent duplicate entries
- Created/UpdatedAt timestamps for audit trail

### 4. Ministry Standards (Thailand)

- Core subjects (พื้นฐาน): Minimum credits required
- Elective subjects (เพิ่มเติม): Student choice
- Activity subjects (กิจกรรม): 1 credit, no grades
- Total credits per semester: ~20 credits
- Max students per class: 40-50 (not enforced in DB)

---

## Anti-Patterns to Avoid

### ❌ Don't Modify ConfigID

```typescript
// ❌ Never change ConfigID after creation
await prisma.config.update({
  where: { ConfigID: "1-2567" },
  data: { ConfigID: "2-2567" }, // WRONG!
});

// ✅ Create new config instead
await prisma.config.create({
  data: {
    ConfigID: "2-2567",
    CopiedFromID: "1-2567", // Reference old config
    // ... other fields
  },
});
```

### ❌ Don't Create Schedule Without Assignment

```typescript
// ❌ Direct schedule creation
await prisma.classschedule.create({
  data: {
    GradeID: "1-1",
    SubjectID: "ท21101",
    TeacherID: "10001",
    // ...
  },
});

// ✅ Check assignment exists first
const assignment = await prisma.assigned_subject.findFirst({
  where: {
    GradeID: "1-1",
    SubjectID: "ท21101",
    TeacherID: "10001",
  },
});
if (!assignment) throw new Error("ไม่พบการมอบหมายวิชา");
```

### ❌ Don't Skip Conflict Validation

```typescript
// ❌ Create schedule without checking
await prisma.classschedule.create({ data: newSchedule });

// ✅ Validate first
const conflicts = await validateNoScheduleConflict(
  newSchedule,
  existingSchedules,
);
if (!conflicts.valid) throw new Error(conflicts.error);
await prisma.classschedule.create({ data: newSchedule });
```

---

**Summary:** This data model enforces school timetable rules at the database level with foreign keys and unique constraints. Business logic in domain services adds additional validation. All queries now use Server Actions with ActionResult pattern for type-safe, validated data access.
