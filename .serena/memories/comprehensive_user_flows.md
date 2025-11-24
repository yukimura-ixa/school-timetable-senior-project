# Comprehensive User Flows - SubSentinel Timetable System

**Last Updated:** January 2025  
**Version:** 1.0  
**Stack:** Next.js 16.0.1, Prisma 6.18.0, MUI 7.3.4, Auth.js 5.0.0-beta.29

---

## System Overview

**Purpose:** School timetable management system for secondary schools (ม.1-6) in Thailand  
**User Roles:** Admin, Teacher, Student, Public Visitor  
**Architecture:** Clean Architecture with Server Actions, ActionResult<T> pattern  
**Authentication:** Auth.js with Google OAuth

---

## 1. Authentication Flow

### 1.1 Login Process (Google OAuth)

**Route:** `/login` or `/signin`

**Flow:**

1. User visits any protected route (e.g., `/dashboard`)
2. System checks session via `auth()` from Auth.js
3. If no session → Redirect to `/login`
4. User clicks "Sign in with Google" button
5. OAuth flow redirects to Google consent screen
6. User grants permission
7. Google redirects back with authorization code
8. Auth.js exchanges code for user info
9. System checks if user email is authorized admin
10. If authorized → Create session, redirect to `/dashboard/select-semester`
11. If not authorized → Show error, deny access

**Key Components:**

- `src/app/login/page.tsx` - Login page with Google button
- `src/auth.ts` - Auth.js configuration
- `src/app/_providers/Providers.tsx` - SessionProvider wrapper

**Authorization Logic:**

```typescript
// Only users with @admin.school.ac.th emails can access admin features
const authorizedAdmins = [
  "admin@school.ac.th",
  // ... other admin emails
];

callbacks: {
  async signIn({ user }) {
    return authorizedAdmins.includes(user.email);
  }
}
```

**Session Management:**

- Session stored in JWT token
- Session expires after 30 days (default)
- Automatic refresh on page navigation
- Logout via `signOut()` from Auth.js

---

## 2. Admin Flows (Protected Routes)

**Prerequisite:** Must be authenticated admin user

### 2.1 Semester Selection Flow

**Route:** `/dashboard/select-semester`

**Purpose:** Choose which academic term to work with

**Flow:**

1. Admin logs in successfully
2. Lands on semester selection page
3. Sees list of all configs (semesters) ordered by latest first
4. Each config shows:
   - Semester/Year (e.g., "ภาคเรียนที่ 1/2567")
   - Status badge (Draft/Published/Locked)
   - Number of periods, school days
   - Quick stats (schedules count, completion rate)
5. Admin clicks on a semester card
6. System redirects to `/dashboard/{ConfigID}` (e.g., `/dashboard/1-2567`)
7. ConfigID is stored in Zustand global state via `useSemesterSync`
8. All subsequent pages use this ConfigID for data filtering

**Key Features:**

- Create new semester button → Opens config creation modal
- Copy from previous semester option
- Delete semester (cascade deletes all related data)
- Filter by academic year or status

**Components:**

- `src/app/dashboard/select-semester/page.tsx`
- `src/features/semester/presentation/components/SemesterCard.tsx`
- `src/features/semester/presentation/components/CreateSemesterModal.tsx`

---

### 2.2 Dashboard Overview Flow

**Route:** `/dashboard/[semesterAndyear]`

**Purpose:** High-level view of timetable status for selected semester

**Flow:**

1. Admin selects semester (e.g., "1-2567")
2. Lands on dashboard page
3. Page fetches all relevant data in parallel:
   - Config details
   - All schedules for this semester
   - All teachers, grades, timeslots, subjects
   - Teacher responsibilities
4. Dashboard displays 4 stat cards:
   - **Teachers:** Total count, with/without schedules
   - **Classes:** Total count, completion status
   - **Scheduled Hours:** Total vs. possible slots
   - **Completion Rate:** Percentage + conflict count
5. Quick Actions menu shows 7 buttons:
   - Teacher Table (view all teacher schedules)
   - Student Table (view all class schedules)
   - All Timeslots (view timeslot grid)
   - All Programs (curriculum management)
   - Conflicts (detect conflicts)
   - Lock Timeslots (schedule locking)
   - Analytics (new! data visualization)
6. Two charts show:
   - Top 10 teachers by workload
   - Top 10 subjects by distribution
7. Health indicators highlight issues:
   - Teachers without schedules
   - Classes with no schedule
   - Classes with partial schedule
   - Detected conflicts

**Navigation Options:**

- Click any Quick Action button → Navigate to specific feature
- View full teacher/class list → Go to respective tables
- Check conflicts → Go to conflict detection page

**Components:**

- `src/app/dashboard/[semesterAndyear]/page.tsx`
- `src/features/dashboard/infrastructure/repositories/dashboard.repository.ts`
- `src/features/dashboard/presentation/components/StatCard.tsx`

---

### 2.3 Configuration Management Flow

**Route:** `/schedule/[semesterAndyear]/config`

**Purpose:** Set up semester structure (periods, breaks, school days)

**Flow:**

1. Admin navigates from dashboard or sidebar
2. Lands on config page
3. If config doesn't exist → Shows creation form
4. If config exists → Shows current settings + edit form
5. Admin configures:
   - **Academic Year** (e.g., "2567")
   - **Semester** (1, 2, or 3)
   - **Number of Periods** (e.g., 10 periods per day)
   - **Time Per Period** (e.g., 50 minutes)
   - **School Days** (MON-FRI checkboxes)
   - **Breaks** (after which period, duration in minutes)
6. System validates:
   - ConfigID uniqueness (SEMESTER-YEAR format)
   - At least 1 school day selected
   - Periods must be 1-12
   - Time per period must be 30-90 minutes
7. On save:
   - Creates/updates config record
   - Auto-generates timeslots based on config
   - Timeslot ID format: `{ConfigID}-{Day}{Period}` (e.g., "1-2567-MON1")
   - Calculates start/end times considering breaks
8. Shows success message + preview of generated timeslots

**Timeslot Generation Logic:**

```typescript
// Example: 10 periods, 50 min each, break after period 4 (20 min)
Timeslots generated:
1-2567-MON1: 08:00-08:50
1-2567-MON2: 08:50-09:40
1-2567-MON3: 09:40-10:30
1-2567-MON4: 10:30-11:20
[Break: 11:20-11:40]
1-2567-MON5: 11:40-12:30
... (continues for all periods and days)
```

**Copy Feature:**

- Option to copy config from previous semester
- Copies: NumberOfPeriod, TimePerPeriod, Break, SchoolDays
- Creates new ConfigID, links via CopiedFromID
- Does NOT copy: schedules, assignments (only structure)

**Components:**

- `src/app/schedule/[semesterAndyear]/config/page.tsx`
- `src/features/config/presentation/components/ConfigForm.tsx`
- `src/features/config/presentation/components/TimeslotPreview.tsx`
- `src/features/config/application/actions/config.actions.ts`
- `src/features/config/domain/services/timeslot-generator.service.ts`

---

### 2.4 Master Data Management Flows

**Route:** `/management/{entity}`

**Purpose:** CRUD operations for core entities

**Entities:**

- `gradelevel` - Classes (ม.1/1, ม.2/3, etc.)
- `program` - Curriculum tracks (วิทย์-คณิต, ศิลป์-คำนวณ)
- `rooms` - Classrooms and labs
- `subject` - Subjects/courses
- `teacher` - Teaching staff

#### 2.4.1 Teacher Management

**Route:** `/management/teacher`

**Flow:**

1. Admin clicks "จัดการข้อมูลครู" from sidebar
2. Lands on teacher management page
3. Sees table with all teachers:
   - TeacherID (5-digit number)
   - Name, Surname
   - MaxHours (teaching capacity per week)
   - Current workload (auto-calculated from schedules)
   - Actions: Edit, Delete
4. **Create New Teacher:**
   - Clicks "+ เพิ่มครู" button
   - Modal opens with form fields:
     - TeacherID (auto-generated or manual)
     - Name (ชื่อ)
     - Surname (นามสกุล)
     - MaxHours (18-25 typical range)
     - AcademicYear, Semester (auto-filled from context)
   - Validates: Required fields, MaxHours > 0
   - On save: Creates teacher record
   - Shows success snackbar
5. **Edit Teacher:**
   - Clicks edit icon on teacher row
   - Modal opens with pre-filled form
   - Can change: Name, Surname, MaxHours (NOT TeacherID)
   - On save: Updates teacher record
   - Shows success snackbar
6. **Delete Teacher:**
   - Clicks delete icon on teacher row
   - Confirmation dialog appears
   - Checks if teacher has assignments or schedules
   - If yes → Shows warning "Teacher has X assignments, delete anyway?"
   - If confirmed → Cascade deletes:
     - assigned_subject records
     - classschedule records
     - locked_teacher records
   - Shows success snackbar

**Validation Rules:**

- TeacherID must be unique
- MaxHours must be positive integer
- Cannot delete if teacher has active responsibilities (optional check)

**Components:**

- `src/app/management/teacher/page.tsx`
- `src/app/management/teacher/AddTeacherModal.tsx`
- `src/app/management/teacher/EditTeacherModal.tsx`
- `src/app/management/teacher/DeleteTeacherModal.tsx`
- `src/features/teacher/application/actions/teacher.actions.ts`

#### 2.4.2 Subject Management

**Route:** `/management/subject`

**Flow:**

1. Admin clicks "จัดการวิชา" from sidebar
2. Sees subject list grouped by category:
   - **พื้นฐาน** (Core subjects)
   - **เพิ่มเติม** (Elective subjects)
   - **กิจกรรม** (Activity subjects)
3. Each subject shows:
   - SubjectID (5-char code, e.g., "ท21101")
   - Name_TH, Name_EN
   - Credits (0.5, 1.0, 1.5, 2.0)
   - Category
   - Color tag for UI
   - Actions: Edit, Delete
4. **Create New Subject:**
   - Clicks "+ เพิ่มวิชา" button
   - Modal with fields:
     - SubjectID (manual input)
     - Name_TH (Thai name)
     - Name_EN (English name)
     - Credits (dropdown: 0.5, 1.0, 1.5, 2.0)
     - Category (พื้นฐาน/เพิ่มเติม/กิจกรรม)
     - Color (color picker)
   - Validates: SubjectID format, Credits > 0
   - On save: Creates subject record
5. **Edit Subject:**
   - Opens modal with pre-filled form
   - Can change all fields except SubjectID
   - Updates subject record
6. **Delete Subject:**
   - Checks if subject is in any program or assignment
   - If yes → Shows warning
   - Cascade deletes:
     - program_subject records
     - assigned_subject records
     - classschedule records

**Activity Subjects Special Case:**

- Category = "กิจกรรม"
- Always 1 credit
- No grades (for transcript)
- Typically scheduled as single blocks

**Components:**

- `src/app/management/subject/page.tsx`
- `src/features/subject/presentation/components/SubjectTable.tsx`
- `src/features/subject/presentation/components/SubjectModals.tsx`

#### 2.4.3 Room Management

**Route:** `/management/rooms`

**Flow:**

1. Admin sees room list with:
   - RoomID (e.g., "A101", "LAB1")
   - Name (friendly name)
   - Capacity (student count)
   - RoomType (ห้องเรียน, ห้องปฏิบัติการ, etc.)
   - Current utilization rate
2. **Create Room:** Standard CRUD modal
3. **Edit Room:** Can change all fields except RoomID
4. **Delete Room:** Checks for schedules using this room

**Room Types:**

- ห้องเรียน (Regular classroom)
- ห้องปฏิบัติการ (Lab - science/computer)
- ห้องกิจกรรม (Activity room)
- อื่นๆ (Other)

**Components:**

- `src/app/management/rooms/page.tsx`
- `src/features/room/application/actions/room.actions.ts`

#### 2.4.4 Grade Level Management

**Route:** `/management/gradelevel`

**Flow:**

1. Admin sees class list organized by level (ม.1 to ม.6)
2. Each class shows:
   - GradeID (e.g., "1-1" for ม.1/1)
   - GradeName (e.g., "ม.1/1")
   - Level (1-6)
   - Section (room number)
   - Associated ProgramID
3. **Create Grade:**
   - Selects Level (1-6)
   - Enters Section number
   - Selects Program from dropdown
   - System generates GradeID = "{Level}-{Section}"
   - GradeName auto-filled as "ม.{Level}/{Section}"
4. **Edit Grade:**
   - Can change: Section, ProgramID
   - Cannot change: Level (would break GradeID)
5. **Delete Grade:**
   - Checks for assignments and schedules
   - Cascade deletes all related records

**Components:**

- `src/app/management/gradelevel/page.tsx`
- `src/features/gradelevel/presentation/components/GradeLevelTable.tsx`

#### 2.4.5 Program Management

**Route:** `/management/program`

**Flow:**

1. Admin sees program list with curriculum details
2. Each program shows:
   - ProgramID (e.g., "SCI-MATH")
   - ProgramName (e.g., "วิทยาศาสตร์-คณิตศาสตร์")
   - Track (e.g., "วิทย์-คณิต")
   - Subjects assigned with credits
   - Total credits per year (should be ~20 per semester)
3. **Create Program:**
   - Enters ProgramID, ProgramName, Track
   - On save: Creates program record
4. **Assign Subjects to Program:**
   - Opens subject assignment modal
   - Shows available subjects list
   - For each subject can specify:
     - Credits (may override subject.Credits)
     - Category (may override subject.Category)
     - SortOrder (display order)
   - Creates program_subject junction records
5. **Edit Program:**
   - Can update: ProgramName, Track, subject assignments
   - Cannot change: ProgramID
6. **Delete Program:**
   - Checks if any gradelevel uses this program
   - If yes → Must reassign grades first

**Ministry Standards Check:**

- Core subjects (พื้นฐาน): Minimum credits required
- Total credits per semester: ~20 credits
- Activity subjects: 1 credit minimum

**Components:**

- `src/app/management/program/page.tsx`
- `src/features/program/presentation/components/ProgramTable.tsx`
- `src/features/program/presentation/components/SubjectAssignmentModal.tsx`

---

### 2.5 Subject Assignment Flow

**Route:** `/schedule/[semesterAndyear]/assign`

**Purpose:** Assign subjects to classes with teachers

**Flow:**

1. Admin navigates to assign page
2. Sees current assignments grouped by grade
3. For each grade, shows:
   - GradeName (e.g., "ม.1/1")
   - Program name
   - List of assigned subjects with:
     - SubjectID, Subject name
     - TeacherID, Teacher name
     - NumberOfHours
   - Progress bar (assigned hours vs. required hours)
4. **Create New Assignment:**
   - Clicks "+ มอบหมายวิชา" button
   - Modal opens with form:
     - Select Grade (dropdown)
     - Select Subject (filtered by grade's program)
     - Select Teacher (dropdown with available teachers)
     - NumberOfHours (auto-filled from subject.Credits)
   - Validates:
     - Subject must be in grade's program
     - NumberOfHours must equal subject.Credits
     - Teacher's total hours cannot exceed MaxHours
     - No duplicate assignment (GradeID + SubjectID must be unique per teacher)
   - On save:
     - Creates assigned_subject record
     - Updates teacher's workload counter
5. **Edit Assignment:**
   - Can change: TeacherID, NumberOfHours (with validation)
   - Cannot change: GradeID, SubjectID (delete and recreate instead)
6. **Delete Assignment:**
   - Checks if there are schedules for this assignment
   - If yes → Shows warning "This assignment has X schedule entries"
   - On confirm:
     - Deletes assigned_subject record
     - Cascade deletes related classschedule records

**Validation Examples:**

**Success Case:**

```
Grade: ม.1/1
Subject: ท21101 (Thai, 2 credits)
Teacher: 10001 (MaxHours = 20, Current = 12)
NumberOfHours: 2
Result: ✅ Valid (Teacher has 8 hours remaining)
```

**Failure Case - Teacher Overbooked:**

```
Grade: ม.2/3
Subject: ค21101 (Math, 3 credits)
Teacher: 10002 (MaxHours = 18, Current = 17)
NumberOfHours: 3
Result: ❌ Error "ครูสอนเกิน 18 ชม. (ปัจจุบัน 17 + ใหม่ 3)"
```

**Failure Case - Hours Mismatch:**

```
Grade: ม.3/1
Subject: อ31101 (English, 2 credits)
Teacher: 10003
NumberOfHours: 3
Result: ❌ Error "จำนวนชั่วโมงต้องเท่ากับหน่วยกิต (2)"
```

**Components:**

- `src/app/schedule/[semesterAndyear]/assign/page.tsx`
- `src/features/assign/presentation/components/AssignmentList.tsx`
- `src/features/assign/presentation/components/AssignmentModal.tsx`
- `src/features/assign/application/actions/assign.actions.ts`
- `src/features/assign/domain/services/assign-validation.service.ts`

---

### 2.6 Schedule Arrangement Flow (Drag-and-Drop)

**Routes:**

- `/schedule/[semesterAndyear]/arrange/student-arrange` (Class view)
- `/schedule/[semesterAndyear]/arrange/teacher-arrange` (Teacher view)

**Purpose:** Visually arrange schedule by dragging subjects to timeslots

#### 2.6.1 Student Arrange (Class View)

**Flow:**

1. Admin navigates to student arrange page
2. Sees list of all grades on left sidebar
3. Selects a grade (e.g., "ม.1/1")
4. Main area shows:
   - **Subject Palette** (left): Available subjects to assign
     - Shows only subjects assigned to this grade
     - Each subject shows:
       - Subject name, code
       - Teacher name
       - NumberOfHours (how many slots needed)
       - Color indicator
     - Counts remaining slots (e.g., "2 remaining")
   - **Timetable Grid** (right): Week view (MON-FRI × Periods)
     - Columns: Days (MON, TUE, WED, THU, FRI)
     - Rows: Periods (1-10 based on config)
     - Each cell represents one timeslot
     - Cells show:
       - Subject name (if scheduled)
       - Teacher name
       - Room name
       - Color background
       - Delete button (X)
5. **Drag-and-Drop to Schedule:**
   - Admin drags subject from palette
   - Drops onto timetable cell
   - Modal opens:
     - TimeslotID (pre-filled from target cell)
     - Subject, Teacher (pre-filled from dragged item)
     - Room (dropdown showing available rooms for this timeslot)
   - Validates:
     - No class conflict (this grade doesn't have another subject at same time)
     - No teacher conflict (this teacher isn't teaching elsewhere at same time)
     - No room conflict (this room isn't used by another class at same time)
     - Timeslot not locked for this class
     - Subject has remaining slots (not all hours scheduled yet)
   - On save:
     - Creates classschedule record
     - Decrements subject's remaining slots counter
     - Shows success snackbar
     - Updates grid immediately (optimistic UI)
6. **Delete Schedule Entry:**
   - Clicks X button on timetable cell
   - Confirmation dialog appears
   - On confirm:
     - Deletes classschedule record
     - Increments subject's remaining slots counter
     - Removes from grid
7. **Visual Conflict Indicators:**
   - If conflict detected after drag:
     - Cell border turns red
     - Error message shown
     - Schedule NOT saved
   - Conflicting cells highlighted in grid

**Subject Palette Counter Logic:**

```typescript
// Example: Math subject with 3 credits = 3 hours needed
// User has scheduled 2 slots
// Remaining = 3 - 2 = 1
// Palette shows: "คณิตศาสตร์ (ค21101) - ครู 10001 - เหลือ 1 คาบ"
```

**Components:**

- `src/app/schedule/[semesterAndyear]/arrange/student-arrange/page.tsx`
- `src/features/arrange/presentation/components/SubjectPalette.tsx`
- `src/features/arrange/presentation/components/TimetableGrid.tsx`
- `src/features/arrange/presentation/components/RoomSelectionDialog.tsx`
- `src/features/arrange/presentation/hooks/useDragAndDrop.ts`
- `src/features/arrange/application/actions/arrange.actions.ts`

#### 2.6.2 Teacher Arrange (Teacher View)

**Flow:**

1. Similar to Student Arrange but perspective flipped
2. Selects a teacher from left sidebar
3. Subject Palette shows:
   - All subjects assigned to this teacher
   - Across all grades (not just one class)
4. Timetable Grid shows:
   - This teacher's weekly schedule
   - All classes they teach
5. Drag-and-drop works same way
6. Validates:
   - Teacher not double-booked
   - Selected grade doesn't have conflict
   - Selected room is available

**Use Case:**

- Admin wants to optimize teacher's schedule
- Minimize gaps between classes
- Ensure teacher isn't overloaded on specific days

**Components:**

- `src/app/schedule/[semesterAndyear]/arrange/teacher-arrange/page.tsx`
- (Reuses same components as Student Arrange with different data source)

---

### 2.7 Schedule Locking Flow

**Route:** `/schedule/[semesterAndyear]/lock`

**Purpose:** Block specific timeslots for special events (assembly, exams, club activities)

**Flow:**

1. Admin navigates to lock page
2. Sees calendar view of entire week (MON-FRI × Periods)
3. Current locked timeslots highlighted in red/yellow
4. **Lock Single Timeslot:**
   - Clicks on timeslot cell
   - Modal opens:
     - Resource Type: CLASS, TEACHER, or ROOM
     - Resource: Dropdown of available resources
     - Reason: "ชุมนุม", "สอบกลางภาค", "กิจกรรม", "อื่นๆ"
   - On save:
     - Creates locked_resource record
     - Creates linked record (locked_class, locked_teacher, or locked_room)
     - Updates calendar view
5. **Bulk Lock (Template):**
   - Clicks "Bulk Lock" button
   - Modal shows predefined templates:
     - **Assembly Time:** Lock all classes MON 08:00-08:50
     - **Club Activities:** Lock all classes FRI periods 9-10
     - **Exam Week:** Lock all classes entire week
   - Admin selects template
   - System batch-creates locked_resource records
   - Shows progress indicator
6. **Custom Bulk Lock:**
   - Clicks "Custom Lock" button
   - Multi-select interface:
     - Days (checkboxes: MON-FRI)
     - Periods (checkboxes: 1-10)
     - Resource Type (CLASS/TEACHER/ROOM)
     - Resources (multi-select dropdown)
     - Reason (text input)
   - Validates: At least 1 day, 1 period, 1 resource
   - On save: Batch creates all combinations
7. **Unlock Timeslot:**
   - Clicks on locked cell
   - Shows lock details (reason, who locked, when)
   - "Unlock" button deletes locked_resource record
8. **View Locked Summary:**
   - Sidebar shows list of all locks:
     - Grouped by resource type
     - Shows count per resource
     - Quick unlock buttons

**Validation:**

- Cannot lock past timeslots
- If timeslot has existing schedule → Shows warning
- "Proceed anyway?" → If yes, schedule remains but shows warning in arrange view

**Lock Effect on Arrangement:**

- In arrange view, locked cells show lock icon
- Cannot drag subjects to locked cells
- Error message: "คาบนี้ถูกล็อค: {Reason}"

**Templates Example:**

**Assembly Template:**

```
Lock Type: CLASS
Resources: ALL grades (ม.1/1 through ม.6/8)
Timeslots: MON period 1 (08:00-08:50)
Reason: "ชุมนุม"
Result: 48 locked_resource records created
```

**Components:**

- `src/app/schedule/[semesterAndyear]/lock/page.tsx`
- `src/features/lock/presentation/components/LockCalendarView.tsx`
- `src/features/lock/presentation/components/BulkLockModal.tsx`
- `src/features/lock/presentation/components/LockTemplatesModal.tsx`
- `src/features/lock/application/actions/lock.actions.ts`

---

### 2.8 Conflict Detection Flow

**Route:** `/dashboard/[semesterAndyear]/conflicts`

**Purpose:** Automatically detect and highlight scheduling conflicts

**Flow:**

1. Admin navigates to conflicts page
2. System runs conflict detection algorithm:
   - **Teacher Conflicts:** Teacher teaching 2+ classes at same time
   - **Class Conflicts:** Class has 2+ subjects at same time
   - **Room Conflicts:** Room used by 2+ classes at same time
   - **Teacher Overload:** Teacher exceeding MaxHours
3. Page displays 3 sections (expandable):
   - **🚨 Critical Conflicts (Red):**
     - Teacher/Class/Room double-bookings
     - Must be fixed before publishing
   - **⚠️ Warnings (Yellow):**
     - Teacher approaching MaxHours (90% utilization)
     - Classes with incomplete schedule
   - **✅ No Issues (Green):**
     - All constraints satisfied
4. For each conflict, shows:
   - Conflict type (icon + label)
   - Affected resources (teacher name, class name, room ID)
   - Timeslot details (Day, Period, Time)
   - Conflicting schedule entries (up to 5 listed)
   - "Resolve" button → Jumps to arrange view
5. **Quick Actions:**
   - "Export Conflict Report" (PDF)
   - "Notify Teachers" (if teacher overbooked)
   - "Auto-Resolve" (AI suggestion - future feature)
6. **Real-time Updates:**
   - Conflict count shown in badge
   - Auto-refresh every 5 seconds (polling)
   - Shows "Checking..." indicator during validation

**Conflict Detection Logic:**

```typescript
// Pseudocode for teacher conflict detection
function detectTeacherConflicts(schedules: classschedule[]) {
  const grouped = groupBy(schedules, (s) => `${s.TeacherID}-${s.TimeslotID}`);
  return Object.entries(grouped)
    .filter(([key, entries]) => entries.length > 1)
    .map(([key, entries]) => ({
      type: "TEACHER_CONFLICT",
      teacherId: key.split("-")[0],
      timeslotId: key.split("-").slice(1).join("-"),
      conflicts: entries,
    }));
}
```

**Example Conflict Display:**

```
🚨 ครูสอน 2 ชั้นพร้อมกัน
- ครู: นาย สมชาย ใจดี (10001)
- คาบ: วันจันทร์ คาบ 3 (09:40-10:30)
- ชั้นเรียน: ม.1/1 (วิชา ท21101), ม.2/3 (วิชา ค21101)
[ปุ่ม: แก้ไข]
```

**Components:**

- `src/app/dashboard/[semesterAndyear]/conflicts/page.tsx`
- `src/features/conflict/application/actions/conflict.actions.ts`
- `src/features/conflict/domain/services/conflict-detector.service.ts`
- `src/features/conflict/presentation/components/ConflictList.tsx`

---

### 2.9 Analytics Dashboard Flow

**Route:** `/dashboard/[semesterAndyear]/analytics`

**Purpose:** Data visualization and insights (NEW - Phase 1 complete)

**Flow:**

1. Admin navigates to analytics from dashboard Quick Actions
2. Page fetches analytics data in parallel (3 server actions)
3. Displays 3 sections:

#### Section 1: Overview Stats (4 Cards)

- **Total Scheduled Hours:** Count of all schedule entries
- **Completion Rate:** Percentage of filled timeslots
- **Active Teachers:** Count of teachers with schedules
- **Conflicts:** Count of detected conflicts (color-coded)

#### Section 2: Teacher Workload Analysis

- List of all teachers sorted by totalHours descending
- For each teacher:
  - Name, MaxHours, Assigned Hours, Scheduled Hours
  - Status chip:
    - ใช้งานต่ำ (< 40% MaxHours) - Gray
    - เหมาะสม (40-70%) - Green
    - สูง (70-100%) - Orange
    - สูงเกินไป (> 100%) - Red
  - Visual progress bar (width = hours/MaxHours \* 100%)
  - Color matches status
- Scrollable list (max 600px height)

#### Section 3: Room Utilization Analysis

- List of all rooms sorted by occupancyRate descending
- For each room:
  - RoomID, Name, Total Periods Available
  - Scheduled Periods (count)
  - Occupancy Rate (percentage)
  - Status chip:
    - ≥80% - Red (Overutilized)
    - 60-79% - Green (Optimal)
    - 40-59% - Yellow (Moderate)
    - 20-39% - Blue (Underutilized)
    - <20% - Gray (Barely used)
  - Visual progress bar
  - Optional: Day-by-day breakdown chips

**Future Phases (Planned):**

- Phase 2: Subject Distribution, Quality Metrics, Time Distribution, Compliance
- Phase 3: Recharts visualizations (bar charts, pie charts, line graphs)
- Phase 4: Filtering, export, date range selection

**Components:**

- `src/app/dashboard/[semesterAndyear]/analytics/page.tsx`
- `src/features/analytics/presentation/components/OverviewSection.tsx`
- `src/features/analytics/presentation/components/TeacherWorkloadSection.tsx`
- `src/features/analytics/presentation/components/RoomUtilizationSection.tsx`
- `src/features/analytics/application/actions/analytics.actions.ts`
- `src/features/analytics/infrastructure/repositories/` (7 repositories)

---

### 2.10 Table Views Flow

#### 2.10.1 Teacher Table

**Route:** `/dashboard/[semesterAndyear]/teacher-table`

**Purpose:** View all teachers' schedules in table format

**Flow:**

1. Admin navigates from dashboard
2. Sees dropdown to select teacher
3. Selects teacher → Table loads
4. Table shows teacher's schedule:
   - Rows: Timeslots (Day + Period)
   - Columns: Class, Subject, Room
5. Summary below table:
   - Total hours taught
   - Utilization rate
   - List of grades taught
6. Export options:
   - Print view (print-friendly layout)
   - Excel export (via XLSX library)
   - PDF export (via PDF library)

**Components:**

- `src/app/dashboard/[semesterAndyear]/teacher-table/page.tsx`
- `src/features/schedule-arrangement/presentation/components/TeacherScheduleTable.tsx`

#### 2.10.2 Student Table (Class Table)

**Route:** `/dashboard/[semesterAndyear]/student-table`

**Purpose:** View class schedules in table format

**Flow:**

1. Admin selects grade from dropdown
2. Table shows class schedule:
   - Rows: Timeslots
   - Columns: Subject, Teacher, Room
3. Summary:
   - Total hours
   - Completion rate
   - Missing subjects
4. Export options (same as teacher table)

**Components:**

- `src/app/dashboard/[semesterAndyear]/student-table/page.tsx`
- `src/features/schedule-arrangement/presentation/components/ClassScheduleTable.tsx`

#### 2.10.3 All Timeslots View

**Route:** `/dashboard/[semesterAndyear]/all-timeslot`

**Purpose:** Master view of all timeslots and their usage

**Flow:**

1. Admin lands on page
2. Sees full timetable matrix:
   - Rows: All grades (ม.1/1 through ม.6/X)
   - Columns: All timeslots (MON1 through FRI10)
   - Cells: Subject code or empty
3. Color-coded cells:
   - Green: Scheduled
   - Red: Conflict
   - Yellow: Locked
   - White: Empty
4. Click on cell → Opens schedule detail modal
5. Summary stats at bottom:
   - Total utilization rate
   - Busiest timeslots
   - Emptiest timeslots

**Components:**

- `src/app/dashboard/[semesterAndyear]/all-timeslot/page.tsx`
- `src/features/timeslot/presentation/components/TimeslotMatrix.tsx`

#### 2.10.4 All Programs View

**Route:** `/dashboard/[semesterAndyear]/all-program`

**Purpose:** Curriculum overview for all programs

**Flow:**

1. Admin sees list of all programs
2. For each program:
   - Program name, track
   - List of subjects with credits
   - Total credits (per year, per semester)
   - Grades using this program
3. Click on program → Expands to show:
   - Full curriculum breakdown by year
   - Subject distribution chart
   - Ministry standards compliance check
4. Export program curriculum (PDF)

**Components:**

- `src/app/dashboard/[semesterAndyear]/all-program/page.tsx`
- `src/features/program/presentation/components/ProgramOverview.tsx`

---

## 3. Public Access Flows (Non-Authenticated)

**Routes:** `/(public)`

**Purpose:** Allow teachers, students, parents to view schedules without login

### 3.1 Public Homepage

**Route:** `/` (public)

**Flow:**

1. Visitor lands on homepage
2. Sees two tabs:
   - **Teachers** (default)
   - **Classes**
3. Quick stats cards show:
   - Total teachers
   - Total classes
   - Quick actions (search, filter)
4. Each tab shows table with search and pagination
5. Click on teacher/class → Navigate to detail page

**Features:**

- Search by name/ID
- Sort by various columns
- Pagination (20 items per page)
- Responsive design (mobile-friendly)

**Components:**

- `src/app/(public)/page.tsx`
- `src/app/(public)/_components/QuickStats.tsx`
- `src/app/(public)/_components/TabNavigation.tsx`
- `src/app/(public)/_components/PublicTeachersTable.tsx`
- `src/app/(public)/_components/PublicClassesTable.tsx`

### 3.2 Public Teacher Schedule View

**Route:** `/(public)/teachers/[teacherId]`

**Flow:**

1. Visitor clicks on teacher from homepage table
2. Lands on teacher detail page
3. Sees:
   - Teacher info (Name, ID, Department)
   - Current schedule (latest semester)
   - Timetable grid (MON-FRI × Periods)
   - Each cell shows: Subject, Class, Room, Time
4. Summary stats:
   - Total hours taught
   - Number of classes
   - Subjects taught
5. Semester selector dropdown (view previous terms)
6. Print button for print-friendly view

**Data Source:**

- Fetches from public API (no auth required)
- Only shows published schedules (config.status = "PUBLISHED")
- Drafts not visible

**Components:**

- `src/app/(public)/teachers/[teacherId]/page.tsx`
- `src/features/teacher/presentation/components/PublicTeacherSchedule.tsx`

### 3.3 Public Class Schedule View

**Route:** `/(public)/classes/[gradeId]`

**Flow:**

1. Visitor clicks on class from homepage table
2. Lands on class detail page
3. Sees:
   - Class info (Grade name, Program)
   - Current schedule (latest semester)
   - Timetable grid
   - Each cell shows: Subject, Teacher, Room, Time
4. Summary stats:
   - Total hours per week
   - Number of subjects
   - Teacher list
5. Semester selector dropdown
6. Print button

**Components:**

- `src/app/(public)/classes/[gradeId]/page.tsx`
- `src/features/gradelevel/presentation/components/PublicClassSchedule.tsx`

---

## 4. Common User Journeys

### 4.1 Journey: New Semester Setup (Admin)

**Steps:**

1. Login → Dashboard → Select Semester → "+ Create New"
2. Fill config form (periods, breaks, days)
3. Save → System generates timeslots
4. Navigate to Management:
   - Add/update teachers (if roster changed)
   - Add/update subjects (new courses)
   - Add/update rooms (if facilities changed)
   - Create/update grades (new classes)
   - Assign subjects to programs
5. Navigate to Assign:
   - Assign subjects to each class
   - Select teachers for each subject
   - Validate teacher workload
6. Navigate to Lock (optional):
   - Lock assembly time (MON period 1)
   - Lock club activities (FRI periods 9-10)
7. Navigate to Arrange:
   - Drag subjects from palette to timetable
   - Fill each class's schedule
   - Resolve conflicts as detected
8. Navigate to Conflicts:
   - Review all conflicts
   - Fix any issues
9. Publish schedule (config.status = "PUBLISHED")
10. Notify teachers via email/SMS

**Total Time:** 2-3 days for 40 classes, 80 teachers, 50 subjects

---

### 4.2 Journey: Mid-Semester Adjustment (Admin)

**Scenario:** Teacher 10001 is sick, need to reassign their classes temporarily

**Steps:**

1. Login → Dashboard → Select current semester
2. Navigate to Teacher Table → Select teacher 10001
3. View their schedule (10 classes per week)
4. Navigate to Assign:
   - Find all assignments for teacher 10001
   - For each assignment:
     - Edit → Change TeacherID to backup teacher
     - Validate backup teacher has capacity
5. Navigate to Arrange:
   - Existing schedules now show new teacher
   - Check for conflicts (backup teacher may have time conflicts)
   - Rearrange if necessary (drag-and-drop to different timeslots)
6. Navigate to Conflicts:
   - Verify no new conflicts introduced
7. Save changes
8. Notify affected classes and new teacher

**Total Time:** 30-60 minutes

---

### 4.3 Journey: Schedule Publication (Admin)

**Steps:**

1. Complete all scheduling (100% completion rate)
2. Navigate to Conflicts → Verify 0 conflicts
3. Navigate to Analytics → Review stats:
   - Teacher workload balanced
   - Room utilization optimal
   - No quality issues
4. Navigate to Dashboard → Click "Publish Schedule"
5. Confirmation modal:
   - "Are you sure? This will make schedules visible to public."
   - Checkbox: "Send notification emails"
6. On confirm:
   - Update config.status = "PUBLISHED"
   - Trigger email notifications to all teachers
   - Schedule becomes visible on public homepage
7. Success message with link to public view

---

### 4.4 Journey: Teacher Viewing Own Schedule

**Steps:**

1. Teacher receives email: "Your schedule for 1/2567 is published"
2. Clicks link in email → Redirects to `/(public)/teachers/{teacherId}`
3. Sees personal schedule on public page
4. No login required
5. Can print or share link with students/parents
6. Semester dropdown to view previous terms

---

### 4.5 Journey: Parent Checking Child's Schedule

**Steps:**

1. Parent opens browser → Goes to school website
2. Clicks "ตารางเรียน" link → Redirects to `/(public)`
3. Switches to "Classes" tab
4. Searches for child's class (e.g., "ม.1/1")
5. Clicks on class → Sees full timetable
6. Notes subjects, teachers, room numbers
7. Optionally prints for reference

---

## 5. Data Flow Through System Layers

### Example: Creating New Schedule Entry

**User Action:** Admin drags "Math (ค21101)" to "MON Period 3" for class "ม.1/1"

**Layer Flow:**

1. **Presentation Layer:**
   - `TimetableGrid.tsx` detects drop event
   - `useDragAndDrop.ts` hook extracts drag data
   - Opens `RoomSelectionDialog.tsx` modal

2. **Application Layer:**
   - Modal form submitted
   - Calls `createScheduleAction({ GradeID, SubjectID, TeacherID, RoomID, TimeslotID })`
   - Server Action validates input via Valibot schema

3. **Domain Layer:**
   - `conflict-detector.service.ts` runs validation:
     - Check class availability
     - Check teacher availability
     - Check room availability
     - Check timeslot not locked
   - Returns `{ valid: boolean, error?: string }`

4. **Infrastructure Layer:**
   - `schedule.repository.ts` queries database:
     - `findConflictingSchedules()`
     - `findLockedResource()`
   - If valid: `prisma.classschedule.create()`
   - Returns ActionResult<classschedule>

5. **Response Path:**
   - ActionResult propagates back to Server Action
   - Server Action returns to client component
   - Client component updates UI:
     - Success: Add cell to grid, show snackbar
     - Error: Show error message, revert drag

**Diagram:**

```
User Drag → UI Component → Hook → Server Action
                                        ↓
                                  Valibot Schema
                                        ↓
                              Domain Service (validate)
                                        ↓
                              Repository (query DB)
                                        ↓
                              Prisma (create record)
                                        ↓
                              ActionResult<T>
                                        ↓
Client Update ← UI Feedback ← Server Action Response
```

---

## 6. Error Handling Patterns

### 6.1 Validation Errors (400 Bad Request)

**Example:** Teacher MaxHours exceeded

**Flow:**

1. User tries to assign 5-hour subject to teacher with 18/18 hours used
2. Domain service validates: `teacherHours (18) + newHours (5) > MaxHours (18)`
3. Returns: `{ success: false, error: "ครูสอนเกิน 18 ชม. (ปัจจุบัน 18 + ใหม่ 5)" }`
4. Client shows error in Snackbar (red)
5. Form stays open for correction

### 6.2 Conflict Errors (409 Conflict)

**Example:** Teacher double-booking

**Flow:**

1. User tries to schedule teacher for MON period 3 at two classes
2. Conflict detector finds existing schedule
3. Returns: `{ success: false, error: "ครู 10001 สอนวิชาอื่นในช่วงเวลานี้แล้ว" }`
4. Client highlights conflicting cell in red
5. Shows resolution options:
   - "View Conflict" → Jump to teacher schedule
   - "Change Teacher" → Edit assignment
   - "Change Timeslot" → Drag to different time

### 6.3 Database Errors (500 Internal Server Error)

**Example:** Prisma query timeout

**Flow:**

1. User saves complex schedule change
2. Database connection times out
3. Prisma throws error
4. Server Action catches: `catch (error) { return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" } }`
5. Client shows generic error message
6. Error logged to console for debugging

### 6.4 Authorization Errors (403 Forbidden)

**Example:** Non-admin user tries to access management

**Flow:**

1. User manually types URL: `/management/teacher`
2. Middleware checks session
3. User not in authorized admin list
4. Redirects to `/login` with error message
5. Shows: "You don't have permission to access this page"

---

## 7. Key Business Rules Summary

### Hard Constraints (MUST NOT violate):

1. Class cannot have 2 subjects at same time
2. Teacher cannot teach 2 classes at same time
3. Room cannot be used by 2 classes at same time
4. Teacher cannot exceed MaxHours
5. Cannot schedule during locked timeslots
6. NumberOfHours must equal subject.Credits
7. ConfigID is immutable once created
8. ConfigID format: `/^[1-3]-\d{4}$/`

### Soft Constraints (SHOULD avoid):

1. Minimize gaps in teacher's schedule
2. Distribute subjects evenly across week
3. Assign lab rooms to science subjects
4. Keep same subject on alternating days
5. Balance teacher workload (aim for 70-90% utilization)
6. Room utilization 60-80% is optimal
7. Avoid scheduling all core subjects on same day

### Ministry Standards (Thailand):

1. Core subjects (พื้นฐาน): Minimum credits required per year
2. Elective subjects (เพิ่มเติม): Student choice
3. Activity subjects (กิจกรรม): 1 credit, no grades
4. Total credits per semester: ~20 credits
5. Grade levels: ม.1-6 (equivalent to grades 7-12)
6. School days: Monday-Friday (5 days)
7. Max students per class: 40-50 (not enforced in DB, informational)

---

## 8. Technical Patterns

### 8.1 Server Actions Pattern

All data mutations use Server Actions with ActionResult:

```typescript
// features/{domain}/application/actions/{entity}.actions.ts
import { createAction } from "@/lib/action-result";

export const createTeacherAction = createAction(
  createTeacherSchema, // Valibot schema
  async (input: CreateTeacherInput): Promise<teacher> => {
    // Validation
    const existingTeacher = await teacherRepository.findById(input.TeacherID);
    if (existingTeacher) {
      throw new Error("รหัสครูซ้ำ");
    }

    // Business logic
    const teacher = await teacherRepository.create(input);

    // Return data
    return teacher;
  }
);

// Client usage
const result = await createTeacherAction({ ... });
if (result.success) {
  console.log("Created:", result.data);
} else {
  console.error("Error:", result.error);
}
```

### 8.2 Repository Pattern

All database access through repositories:

```typescript
// features/{domain}/infrastructure/repositories/{entity}.repository.ts
export const teacherRepository = {
  async findAll(configId: string) {
    return prisma.teacher.findMany({
      where: { ConfigID: configId },
      orderBy: { Name: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.teacher.findUnique({
      where: { TeacherID: id },
      include: {
        assigned_subject: {
          include: { subject: true },
        },
      },
    });
  },

  async create(data: Partial<teacher>) {
    return prisma.teacher.create({ data });
  },

  async update(id: string, data: Partial<teacher>) {
    return prisma.teacher.update({
      where: { TeacherID: id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.teacher.delete({
      where: { TeacherID: id },
    });
  },
};
```

### 8.3 Global State Pattern (Zustand)

Semester context shared via Zustand:

```typescript
// src/store/semester-store.ts
import { create } from "zustand";

interface SemesterState {
  semesterAndyear: string | null;
  setSemester: (configId: string) => void;
}

export const useSemesterSync = create<SemesterState>((set) => ({
  semesterAndyear: null,
  setSemester: (configId) => set({ semesterAndyear: configId }),
}));

// Usage in component
const { semesterAndyear, setSemester } = useSemesterSync();
```

### 8.4 Optimistic UI Pattern

Immediate feedback before server response:

```typescript
// Drag-and-drop schedule entry
const handleDrop = async (subjectId, timeslotId) => {
  // 1. Optimistic update
  setSchedules(prev => [...prev, { SubjectID: subjectId, TimeslotID: timeslotId }]);

  // 2. Server call
  const result = await createScheduleAction({ ... });

  // 3. Rollback if failed
  if (!result.success) {
    setSchedules(prev => prev.filter(s => s.TimeslotID !== timeslotId));
    showSnackbar(result.error, 'error');
  } else {
    showSnackbar('บันทึกสำเร็จ', 'success');
  }
};
```

---

## 9. Navigation Map

```
/ (public)
├─ /teachers/[teacherId] - Public teacher schedule
└─ /classes/[gradeId] - Public class schedule

/login - Google OAuth login
/signin - Alternative login route

/dashboard/select-semester - Semester selection
/dashboard/[semesterAndyear]
  ├─ / - Dashboard overview
  ├─ /analytics - Analytics dashboard (NEW)
  ├─ /teacher-table - Teacher schedules table
  ├─ /student-table - Class schedules table
  ├─ /all-timeslot - Master timeslot grid
  ├─ /all-program - Curriculum overview
  └─ /conflicts - Conflict detection

/management
  ├─ /teacher - Teacher CRUD
  ├─ /subject - Subject CRUD
  ├─ /rooms - Room CRUD
  ├─ /gradelevel - Class CRUD
  └─ /program - Program CRUD

/schedule/[semesterAndyear]
  ├─ /config - Semester config
  ├─ /assign - Subject assignment
  ├─ /arrange
  │   ├─ /student-arrange - Class view drag-and-drop
  │   └─ /teacher-arrange - Teacher view drag-and-drop
  └─ /lock - Timeslot locking
```

---

## 10. Testing Scenarios

### 10.1 Happy Path Tests

1. **Create Config → Generate Timeslots:**
   - Input: 10 periods, 5 days, 1 break after period 4
   - Expected: 50 timeslots created (10×5)

2. **Assign Subject → Schedule → Verify:**
   - Assign Math (2 hours) to ม.1/1 with teacher 10001
   - Schedule to MON period 1-2
   - Verify: 2 classschedule records, teacher workload += 2

3. **Detect Conflict → Resolve:**
   - Schedule teacher 10001 to ม.1/1 at MON period 3
   - Try to schedule same teacher to ม.2/3 at MON period 3
   - Expected: Error "ครูสอน 2 ชั้นพร้อมกัน"
   - Resolve: Change to different timeslot

### 10.2 Edge Case Tests

1. **Teacher MaxHours Boundary:**
   - Teacher with MaxHours=18, current=17
   - Try to assign 2-hour subject
   - Expected: Error "ครูสอนเกิน 18 ชม."

2. **Locked Timeslot:**
   - Lock MON period 1 for all classes
   - Try to schedule any subject to MON period 1
   - Expected: Error "คาบนี้ถูกล็อค"

3. **Delete Teacher with Schedules:**
   - Teacher 10001 has 10 schedule entries
   - Try to delete
   - Expected: Warning "Teacher has 10 schedules"
   - On confirm: Cascade deletes all schedules

### 10.3 E2E Test Scenarios

Located in `e2e/` directory:

```typescript
// e2e/semester-setup.spec.ts
test("Admin can set up new semester", async ({ page }) => {
  await page.goto("/login");
  await page.click("text=Sign in with Google");
  // ... OAuth flow

  await page.goto("/dashboard/select-semester");
  await page.click("text=+ Create New");

  await page.fill('[name="AcademicYear"]', "2568");
  await page.selectOption('[name="Semester"]', "1");
  await page.fill('[name="NumberOfPeriod"]', "10");
  await page.fill('[name="TimePerPeriod"]', "50");
  await page.click('button[type="submit"]');

  await expect(page.locator("text=สร้างสำเร็จ")).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/1-2568/);
});
```

Run with: `pnpm test:e2e`

---

## 11. Future Enhancements

### Phase 2 (Planned):

1. **Analytics Phase 2:**
   - Subject Distribution charts
   - Quality Metrics (gaps, balance)
   - Time Distribution analysis
   - Compliance checks (Ministry standards)

2. **Auto-Schedule Algorithm:**
   - Genetic algorithm for optimal schedule
   - Constraint satisfaction problem (CSP) solver
   - "Generate Schedule" button

3. **Notifications:**
   - Email/SMS to teachers when schedule published
   - Push notifications for schedule changes
   - Weekly digest for admins

4. **Mobile App:**
   - React Native app for teachers/students
   - Push notifications
   - Offline viewing

5. **Export Enhancements:**
   - Excel templates with school branding
   - PDF generation with school logo
   - iCal/Google Calendar integration

6. **Multi-Language:**
   - English interface option
   - Localized date/time formats

7. **Audit Log:**
   - Track all changes (who, when, what)
   - Rollback capability
   - Change history view

---

## Appendix: Common Questions

**Q: Can I delete a semester?**
A: Yes, but it will cascade delete ALL related data (schedules, assignments, locks). Use with caution.

**Q: Can I change ConfigID after creation?**
A: No, ConfigID is immutable. Create a new semester instead.

**Q: What if I need to swap two teachers' entire schedules?**
A: Edit all assignments, system will keep existing schedules but change teachers.

**Q: Can students have different schedules (individualized)?**
A: No, this system uses class-based scheduling. All students in same class attend same subjects.

**Q: Can I schedule multi-period subjects (e.g., 2-hour lab)?**
A: Yes, use PeriodEnd in timeslot table to create merged timeslots.

**Q: What if two classes want to take the same elective?**
A: Assign same subject to both classes, but schedule at different timeslots.

**Q: Can I view historical schedules?**
A: Yes, use semester selector dropdown to switch between terms. All data is preserved.

**Q: How do I backup my data?**
A: Database is on Vercel Postgres with automatic backups. Manual export via Prisma Studio or SQL export.

---

**End of User Flows Documentation**

**Total Features Documented:** 18 major flows  
**Total User Roles:** 4 (Admin, Teacher, Student, Public)  
**Total Routes:** 25+ pages  
**Lines of Code:** 20,000+ (as of Jan 2025)
