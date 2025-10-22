# Data Model and Business Rules

## Database Schema Overview

### Core Entities

#### 1. Teacher
```prisma
model teacher {
  TeacherID               String
  Firstname               String
  Lastname                String
  Department              String
  Email                   String
  Role                    String
  teachers_responsibility teachers_responsibility[]
}
```

**Business Rules:**
- Each teacher must have a unique `TeacherID`
- Teachers can be assigned to multiple classes
- Teachers cannot be double-booked in the same timeslot
- Teachers have roles: Admin or Teacher

#### 2. Grade Level
```prisma
model gradelevel {
  GradeID                 String  @id
  Year                    Int     # e.g., 1 = ม.1, 4 = ม.4
  Number                  Int     # Class number within year
  class_schedule          class_schedule[]
  teachers_responsibility teachers_responsibility[]
  program                 program[]
}
```

**Business Rules:**
- `GradeID` format: `{Year}/{Number}` (e.g., "4/1" = ม.4/1)
- Year range: 1-6 (ม.1 to ม.6)
- Classes cannot be double-booked in the same timeslot

#### 3. Subject
```prisma
model subject {
  SubjectCode             String  @id
  SubjectName             String
  Category                String  # ทั่วไป, ภาษา, คณิต, etc.
  Credit                  Decimal
  ProgramID               String
  program                 program
  class_schedule          class_schedule[]
  teachers_responsibility teachers_responsibility[]
}
```

**Business Rules:**
- Each subject has a unique `SubjectCode`
- Subjects are linked to programs (curriculum structure)
- Credit values determine weekly teaching hours

#### 4. Room
```prisma
model room {
  RoomID         Int     @id @default(autoincrement())
  RoomName       String  @unique
  Building       String  @default("-")
  Floor          String  @default("-")
  class_schedule class_schedule[]
}
```

**Business Rules:**
- Rooms can only be used by one class at a time
- Room names must be unique
- Rooms are optional for some schedules

#### 5. Timeslot
```prisma
model timeslot {
  TimeslotID              String
  DayOfWeek               String  # Mon, Tue, Wed, Thu, Fri
  AcademicYear            Int
  Semester                Int     # 1 or 2
  StartTime               String
  EndTime                 String
  BreakTime               Boolean
  class_schedule          class_schedule[]
}
```

**Business Rules:**
- Each timeslot represents a specific period on a specific day
- `TimeslotID` format: `{AcademicYear}/{Semester}/{DayOfWeek}/{StartTime}`
- BreakTime slots cannot be used for classes
- School operates Monday-Friday only

#### 6. Class Schedule (Main Timetable Entity)
```prisma
model class_schedule {
  ClassID                 String  @id
  TimeslotID              String
  SubjectCode             String
  RoomID                  Int?
  GradeID                 String
  IsLocked                Boolean @default(false)
  gradelevel              gradelevel
  room                    room?
  subject                 subject
  timeslot                timeslot
  teachers_responsibility teachers_responsibility[]
}
```

**Business Rules:**
- Represents one class assignment in the timetable
- Locked schedules cannot be modified (for assemblies, clubs, etc.)
- Must respect all conflict rules (teacher, class, room)

#### 7. Teacher Responsibility
```prisma
model teachers_responsibility {
  RespID                  String  @id
  TeacherID               String
  GradeID                 String
  SubjectCode             String
  AcademicYear            Int
  Semester                Int
  TeachHour               Int     # Weekly hours to teach
  class_schedule          class_schedule?
  gradelevel              gradelevel
  subject                 subject
  teacher                 teacher
}
```

**Business Rules:**
- Links teachers to subjects and classes they teach
- `TeachHour` defines how many hours per week this teacher teaches this subject to this class
- Used for assignment validation

#### 8. Program (Curriculum Structure)
```prisma
model program {
  ProgramID               String  @id
  ProgramName             String
  Semester                Int
  subjects                subject[]
  gradelevel              gradelevel[]
}
```

**Business Rules:**
- Defines curriculum structure per semester
- Links subjects to grade levels
- Each grade level has a specific program

#### 9. Table Config
```prisma
model table_config {
  ConfigID                String  @id
  AcademicYear            Int
  Semester                Int
  ConfigJSON              String  # JSON-serialized configuration
}
```

**Business Rules:**
- Stores timetable configuration (periods per day, durations, breaks)
- One config per academic year/semester
- Used to generate timeslots

## Conflict Detection Rules

### 1. Teacher Conflict
**Rule:** A teacher cannot be assigned to multiple classes in the same timeslot.

**Check:**
```typescript
// Pseudo-code
function checkTeacherConflict(teacherId: string, timeslotId: string): boolean {
  const existingAssignments = await prisma.class_schedule.findMany({
    where: {
      teachers_responsibility: {
        some: { TeacherID: teacherId }
      },
      TimeslotID: timeslotId
    }
  });
  return existingAssignments.length > 0;
}
```

### 2. Class Conflict
**Rule:** A class (grade level) cannot have multiple subjects in the same timeslot.

**Check:**
```typescript
// Pseudo-code
function checkClassConflict(gradeId: string, timeslotId: string): boolean {
  const existingAssignments = await prisma.class_schedule.findMany({
    where: {
      GradeID: gradeId,
      TimeslotID: timeslotId
    }
  });
  return existingAssignments.length > 0;
}
```

### 3. Room Conflict
**Rule:** A room cannot be used by multiple classes in the same timeslot.

**Check:**
```typescript
// Pseudo-code
function checkRoomConflict(roomId: number, timeslotId: string): boolean {
  const existingAssignments = await prisma.class_schedule.findMany({
    where: {
      RoomID: roomId,
      TimeslotID: timeslotId
    }
  });
  return existingAssignments.length > 0;
}
```

### 4. Locked Timeslot
**Rule:** Locked timeslots (IsLocked = true) cannot be modified or deleted.

**Check:**
```typescript
// Pseudo-code
function isTimeslotLocked(classId: string): boolean {
  const schedule = await prisma.class_schedule.findUnique({
    where: { ClassID: classId }
  });
  return schedule?.IsLocked ?? false;
}
```

### 5. Break Time
**Rule:** Classes cannot be scheduled during break times.

**Check:**
```typescript
// Pseudo-code
function isBreakTime(timeslotId: string): boolean {
  const timeslot = await prisma.timeslot.findUnique({
    where: { TimeslotID: timeslotId }
  });
  return timeslot?.BreakTime ?? false;
}
```

### 6. Teaching Hours
**Rule:** A teacher's total teaching hours per week should not exceed their assigned responsibility hours.

**Check:**
```typescript
// Pseudo-code
function checkTeachingHours(
  teacherId: string, 
  gradeId: string, 
  subjectCode: string
): boolean {
  const responsibility = await prisma.teachers_responsibility.findFirst({
    where: { TeacherID: teacherId, GradeID: gradeId, SubjectCode: subjectCode }
  });
  
  const scheduledHours = await prisma.class_schedule.count({
    where: {
      teachers_responsibility: {
        some: { TeacherID: teacherId, GradeID: gradeId, SubjectCode: subjectCode }
      }
    }
  });
  
  return scheduledHours < (responsibility?.TeachHour ?? 0);
}
```

## Workflow States

### 1. Data Management
- Create/Update/Delete: Teachers, Rooms, Subjects, Grade Levels, Programs
- No constraints beyond database validation

### 2. Assignment Phase
- Assign teachers to subjects and classes
- Define weekly teaching hours
- Constraints: Teacher must exist, Class must exist, Subject must exist

### 3. Configuration Phase
- Set academic year, semester, periods, breaks
- Generate timeslots based on configuration
- Constraints: Valid academic year, semester (1 or 2)

### 4. Arrangement Phase
- Assign subjects to specific timeslots
- Apply conflict detection rules
- Constraints: All conflict rules must pass
- Locked timeslots cannot be modified

### 5. Lock Phase
- Lock specific timeslots for multi-class activities
- Constraints: Cannot lock already scheduled timeslots

### 6. View/Export Phase
- Generate schedules for teachers, classes
- Export to Excel, PDF
- No constraints, read-only operations

## Future Improvements

1. **Soft Delete**: Add `deletedAt` field instead of hard deletes
2. **Audit Log**: Track who made what changes when
3. **Version Control**: Keep history of timetable changes
4. **Optimization**: Add database indexes for common queries
5. **Validation**: Add check constraints at database level
6. **Normalization**: Consider splitting `ConfigJSON` into separate table
