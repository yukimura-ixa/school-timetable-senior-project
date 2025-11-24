# Exam Arrange Mode - Future Feature Design Document

**Status**: 📋 Design Phase - Out of Scope for Current Sprint  
**Priority**: P2/P3 - High Value, Medium-High Effort  
**Estimated Effort**: 16-20 hours  
**Target Release**: Future (After P1-P2 completion)

---

## Problem Statement

Currently, the school timetable system lacks a dedicated mechanism for scheduling and managing examination periods. The lock schedule system was initially considered for this purpose, but **exams are fundamentally different from schedule locks**:

- **Locks** = Recurring weekly constraints (scouts, assemblies, activities)
- **Exams** = Temporary, one-time scheduling events requiring specialized workflows

### Current Gaps:

1. ❌ No dedicated exam period configuration
2. ❌ No exam-specific scheduling grid
3. ❌ No exam timetable validation (all subjects covered, no conflicts)
4. ❌ No specialized exam timetable exports
5. ❌ Confusion: Using EXAM lock type conflates two different concepts

---

## Business Requirements

### Use Cases:

**UC1: Configure Exam Period**

- **Actor**: Admin
- **Goal**: Define exam period parameters (dates, name, scope)
- **Flow**:
  1. Admin navigates to Exam Arrange mode
  2. Clicks "Create Exam Period"
  3. Fills form: Name, Start Date, End Date, Semester, Academic Year
  4. Selects included grades (all or specific levels)
  5. System validates dates don't overlap with other exam periods
  6. System creates exam period and generates empty exam grid

**UC2: Schedule Exam Slots**

- **Actor**: Admin
- **Goal**: Assign subjects to specific exam time slots
- **Flow**:
  1. Admin opens exam period
  2. Views grid: Days (columns) × Periods (rows) × Grades (tabs/sections)
  3. Drags subject from sidebar to exam slot
  4. System validates:
     - Subject not already scheduled for this grade
     - Room capacity sufficient
     - No teacher conflicts (if teacher info available)
  5. System saves exam assignment
  6. Grid updates with color-coded subject card

**UC3: Validate Exam Coverage**

- **Actor**: Admin
- **Goal**: Ensure all subjects have exam slots before finalizing
- **Flow**:
  1. Admin clicks "Validate Coverage" button
  2. System checks:
     - All core subjects have exam slots
     - No subject scheduled multiple times for same grade
     - All exam slots are within configured exam period dates
     - Room assignments are valid
  3. System shows report:
     - ✅ Subjects with exams (green checkmarks)
     - ⚠️ Subjects missing exams (yellow warnings)
     - ❌ Conflicts detected (red errors)
  4. Admin addresses issues before finalizing

**UC4: Export Exam Timetables**

- **Actor**: Admin, Teacher, Student
- **Goal**: Generate printable/downloadable exam schedules
- **Flows**:
  - **By Grade**: All exams for ม.1/1, ม.1/2, etc. (student view)
  - **By Date**: All exams on May 15, May 16, etc. (school-wide view)
  - **By Room**: All exams in Room 101, Room 102, etc. (facility management)
  - **By Teacher**: All exams supervised by Teacher X (invigilator schedule)
  - **Individual Student**: Personalized exam schedule with dates/times/rooms

**UC5: Publish Exam Schedule**

- **Actor**: Admin
- **Goal**: Make exam schedule visible to students/teachers
- **Flow**:
  1. Admin finalizes exam period (validation passes)
  2. Clicks "Publish" button
  3. System marks exam period as published
  4. Students/teachers can now view their exam schedules
  5. Admin can still make emergency adjustments (with audit log)

---

## Functional Requirements

### 1. Exam Period Management

**Features**:

- Create new exam period
- Edit existing exam period (if not started)
- Delete exam period (if no exams scheduled)
- Clone exam period from previous term
- Archive completed exam periods

**Data Required**:

```typescript
interface ExamPeriod {
  id: string;
  name: string; // "Midterm 1/2567", "Final Exam 2/2567"
  academicYear: number;
  semester: Semester;
  startDate: Date;
  endDate: Date;
  includedGrades: number[]; // [101, 102, ...] or [] for all
  status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Exam Scheduling Grid

**Features**:

- Visual grid: Days × Periods × Grades
- Drag-and-drop subject assignment
- Color coding by subject category or grade
- Quick info tooltips (hover)
- Detail dialog (click)
- Undo/redo support
- Copy exam from one grade to another
- Auto-schedule button (AI suggestion)

**Grid Structure**:

```typescript
interface ExamGridCell {
  date: Date;
  timeslotId: string;
  gradeId: number;
  subjectCode: string | null;
  roomId: string | null;
  duration: number; // minutes
  teacherIds: string[]; // invigilators
}
```

### 3. Conflict Detection & Validation

**Rules**:

- ✅ Each subject scheduled exactly once per grade
- ✅ No room double-booking (room capacity respected)
- ✅ No teacher conflicts (if teacher supervises multiple exams)
- ✅ Exam duration fits within period (or spans multiple periods)
- ✅ All core subjects covered
- ✅ Optional subjects handled (if offered to grade)

**Real-time Validation**:

- Warning badges on cells with conflicts
- Coverage progress bar (X/Y subjects scheduled)
- Filter view: "Show only conflicts", "Show missing subjects"

### 4. Export Templates

**PDF Exports**:

1. **Student Exam Schedule** (Individual)
   - Header: Student name, grade, student ID
   - Table: Date, Time, Subject, Room
   - Footer: Total exams, school contact info
2. **Class Exam Schedule** (Per Grade)
   - Header: Grade (e.g., ม.1/1), Academic Year, Semester
   - Table: Date, Time, Subject, Room, Duration
   - Color-coded by date
3. **Daily Exam Schedule** (School-wide)
   - Header: Date, Exam period name
   - Grouped by time slot
   - Lists all grades taking exams at that time
4. **Room Exam Schedule** (Facility)
   - Header: Room name/number
   - Table: Date, Time, Grade, Subject, Capacity
   - Useful for room preparation

**Excel Exports**:

- Same formats as PDF but editable
- Includes raw data for further analysis
- Formulas for calculating exam duration totals

### 5. Student Portal Integration

**Public View** (No login required):

- Enter student ID → View personal exam schedule
- Download PDF of personal schedule
- Add to calendar (iCal format)

**Authenticated View** (After login):

- Dashboard showing upcoming exams
- Countdown timers to each exam
- Exam preparation resources (if linked)
- Past exam history (if stored)

---

## Technical Architecture

### Database Schema

```prisma
// Exam Period
model exam_period {
  ExamPeriodID    String   @id @default(cuid())
  Name            String
  AcademicYear    Int
  Semester        Semester
  StartDate       DateTime
  EndDate         DateTime
  IncludedGrades  Int[]    // Empty array = all grades
  Status          ExamPeriodStatus @default(DRAFT)
  CreatedBy       String
  CreatedAt       DateTime @default(now())
  UpdatedAt       DateTime @updatedAt

  exam_schedules  exam_schedule[]

  @@unique([Name, AcademicYear, Semester])
  @@index([AcademicYear, Semester, Status])
}

enum ExamPeriodStatus {
  DRAFT      // Being configured
  PUBLISHED  // Visible to students/teachers
  COMPLETED  // Exams finished
  ARCHIVED   // Historical record
}

// Individual Exam Assignment
model exam_schedule {
  ExamScheduleID  String   @id @default(cuid())
  ExamPeriodID    String
  SubjectCode     String
  GradeID         Int
  Date            DateTime
  TimeslotID      String
  RoomID          String
  Duration        Int      @default(60) // Minutes
  InvigilatorIDs  String[] // Teacher IDs supervising
  Notes           String?  // Special instructions
  CreatedAt       DateTime @default(now())
  UpdatedAt       DateTime @updatedAt

  exam_period  exam_period @relation(fields: [ExamPeriodID], references: [ExamPeriodID], onDelete: Cascade)
  subject      subject     @relation(fields: [SubjectCode], references: [SubjectCode])
  grade        grade_level @relation(fields: [GradeID], references: [GradeID])
  room         room        @relation(fields: [RoomID], references: [RoomID])
  timeslot     timeslot    @relation(fields: [TimeslotID], references: [TimeslotID])

  @@unique([ExamPeriodID, SubjectCode, GradeID])
  @@index([ExamPeriodID, Date])
  @@index([Date, TimeslotID, RoomID]) // For conflict detection
}

// Audit Log for Changes
model exam_schedule_audit {
  AuditID         String   @id @default(cuid())
  ExamScheduleID  String?  // Null if exam deleted
  Action          AuditAction
  ChangedBy       String
  ChangedAt       DateTime @default(now())
  OldValue        Json?
  NewValue        Json?
  Reason          String?
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  PUBLISH
  UNPUBLISH
}
```

### API Routes (Server Actions)

```typescript
// Exam Period Actions
createExamPeriodAction(data: CreateExamPeriodInput): Promise<Result<ExamPeriod>>
updateExamPeriodAction(id: string, data: UpdateExamPeriodInput): Promise<Result<ExamPeriod>>
deleteExamPeriodAction(id: string): Promise<Result<void>>
publishExamPeriodAction(id: string): Promise<Result<ExamPeriod>>
getExamPeriodsAction(filters: ExamPeriodFilters): Promise<Result<ExamPeriod[]>>

// Exam Schedule Actions
createExamScheduleAction(data: CreateExamScheduleInput): Promise<Result<ExamSchedule>>
updateExamScheduleAction(id: string, data: UpdateExamScheduleInput): Promise<Result<ExamSchedule>>
deleteExamScheduleAction(id: string): Promise<Result<void>>
getExamSchedulesAction(examPeriodId: string): Promise<Result<ExamSchedule[]>>

// Validation Actions
validateExamCoverageAction(examPeriodId: string): Promise<Result<ValidationReport>>
detectExamConflictsAction(examPeriodId: string): Promise<Result<Conflict[]>>

// Export Actions
exportExamSchedulePDFAction(examPeriodId: string, type: ExportType): Promise<Result<Blob>>
exportExamScheduleExcelAction(examPeriodId: string, type: ExportType): Promise<Result<Blob>>

// Public API (Student Portal)
getStudentExamScheduleAction(studentId: string): Promise<Result<ExamSchedule[]>>
```

### Validation Service

```typescript
class ExamValidationService {
  // Check if all subjects have exams
  validateCoverage(examPeriodId: string): ValidationResult {
    // Get all subjects for included grades
    // Check which have exam assignments
    // Return missing subjects list
  }

  // Check for scheduling conflicts
  validateConflicts(examPeriodId: string): ConflictResult {
    // Check room double-booking
    // Check teacher conflicts
    // Check duplicate subject assignments
    // Return conflict list with severity
  }

  // Check if exam period is valid
  validateExamPeriod(examPeriod: ExamPeriod): boolean {
    // Dates are valid (start < end)
    // Dates don't overlap with other exam periods
    // At least one grade included
    // Name is unique for term
  }

  // Auto-suggest exam schedule
  suggestExamSchedule(examPeriodId: string): ExamSchedule[] {
    // Use algorithm to distribute exams optimally
    // Consider: Room capacity, subject difficulty, spacing
    // Return suggested schedule for admin review
  }
}
```

---

## UI/UX Design

### Navigation Structure

```
Schedule Management
├── Dashboard
├── Config
├── Manage
├── Assign
├── Arrange
├── Lock
├── 📝 Exam Arrange (NEW)
│   ├── Exam Periods List
│   ├── Create/Edit Exam Period
│   ├── Exam Scheduling Grid
│   ├── Validation Dashboard
│   └── Export Center
└── Export
```

### Main Components

**1. ExamPeriodsList**

- Table showing all exam periods
- Columns: Name, Date Range, Status, Grades, Progress
- Actions: Create, Edit, Delete, Publish, Clone
- Filters: Academic Year, Semester, Status

**2. ExamPeriodForm**

- Modal dialog for create/edit
- Fields: Name, Date Range, Semester, Academic Year, Included Grades
- Date picker with calendar view
- Grade multi-select with "Select All" option
- Save/Cancel buttons

**3. ExamSchedulingGrid**

- Similar to arrange tab but for exams
- Header: Exam period name, date range, progress bar
- Tabs: One per grade level (ม.1/1, ม.1/2, etc.)
- Grid: Days (columns) × Periods (rows)
- Sidebar: Subject list with search/filter
- Drag-and-drop from sidebar to grid
- Cell content: Subject code, room, duration
- Color coding: By subject category or grade
- Hover: Quick tooltip with details
- Click: Full detail dialog with edit/delete

**4. ValidationDashboard**

- Coverage section:
  - Progress bars per grade (X/Y subjects scheduled)
  - List of missing subjects (clickable to auto-suggest slots)
  - Subject category breakdown (core vs. optional)
- Conflicts section:
  - List of conflicts with severity badges
  - Clickable to navigate to conflicting cells
  - Quick fix suggestions
- Overall status indicator:
  - 🔴 Red: Conflicts or missing subjects
  - 🟡 Yellow: All subjects covered but warnings exist
  - 🟢 Green: Ready to publish

**5. ExportCenter**

- Tab navigation: PDF, Excel, iCal
- Export type selector: By Grade, By Date, By Room, By Teacher, Individual Student
- Preview pane (for PDF)
- Download button
- Batch export option (all grades at once)

**6. StudentExamPortal**

- Public page: `/exam-schedule`
- Input: Student ID field
- Output: Personal exam schedule table
- Download button (PDF)
- Add to calendar button (iCal download)

---

## User Workflows

### Workflow 1: Setup Exam Period

```
1. Admin navigates to Exam Arrange tab
2. Clicks "Create Exam Period" button
3. Modal opens:
   - Name: "Midterm 1/2567"
   - Date Range: May 15-17, 2567
   - Semester: 1
   - Academic Year: 2567
   - Grades: [Select All]
4. Click Save
5. System creates exam period and opens scheduling grid
```

### Workflow 2: Schedule Exams

```
1. Admin opens exam period
2. Selects grade tab (e.g., ม.1/1)
3. Views subject sidebar (all subjects for ม.1)
4. Drags "คณิตศาสตร์" to Monday 8:00 AM slot
5. System prompts for room selection
6. Selects "Room 101"
7. System saves exam assignment
8. Cell updates with subject card (color-coded)
9. Progress bar increments (1/12 subjects scheduled)
10. Repeat for all subjects across all grades
```

### Workflow 3: Validate & Publish

```
1. Admin clicks "Validate" button
2. System runs validation:
   - Coverage: 95/96 subjects scheduled (98%)
   - Missing: ภาษาอังกฤษ for ม.3/5
   - Conflicts: None detected
3. Admin adds missing exam
4. Re-validates: 100% coverage, 0 conflicts
5. Clicks "Publish" button
6. Confirmation dialog: "Publish exam schedule? Students/teachers will be notified."
7. Confirms
8. System marks as PUBLISHED
9. Exam schedules now visible to students/teachers
```

### Workflow 4: Student Views Schedule

```
1. Student visits school website
2. Clicks "Exam Schedule" link
3. Enters student ID: 12345
4. System displays personal exam schedule:
   - May 15, 8:00-9:30 AM: คณิตศาสตร์, Room 101
   - May 15, 10:00-11:30 AM: ภาษาไทย, Room 102
   - May 16, 8:00-9:30 AM: ภาษาอังกฤษ, Room 101
   - ...
5. Clicks "Download PDF"
6. Receives printable exam schedule
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (6 hours)

- Database schema migration
- Server actions (CRUD for exam periods and schedules)
- Basic validation service
- Unit tests for validation logic

### Phase 2: Admin UI (8 hours)

- ExamPeriodsList component
- ExamPeriodForm modal
- Basic exam scheduling grid (no drag-and-drop yet)
- Manual cell assignment (click to assign)

### Phase 3: Enhanced Scheduling (4 hours)

- Drag-and-drop functionality
- Grid interactions (hover, click, delete)
- Real-time validation feedback
- Progress tracking

### Phase 4: Validation & Export (6 hours)

- ValidationDashboard component
- Coverage checking
- Conflict detection
- PDF export templates
- Excel export templates

### Phase 5: Student Portal (4 hours)

- Public exam schedule lookup
- Student authentication integration
- Personal schedule view
- Download/calendar export

### Phase 6: Polish & Testing (4 hours)

- E2E tests
- Performance optimization
- Mobile responsive design
- User documentation

**Total Estimated Effort**: 32 hours (4 work days)

---

## Success Metrics

### Quantitative:

- Time to schedule full exam period: < 2 hours (vs. manual process ~4-6 hours)
- Validation accuracy: 100% (catch all conflicts before publish)
- Export generation time: < 10 seconds for full timetable
- Student portal response time: < 2 seconds
- Zero exam scheduling conflicts after publish

### Qualitative:

- Admin feedback: "Much easier than manual Excel scheduling"
- Student feedback: "Clear, easy to find my exam schedule"
- Teacher feedback: "Helpful for invigilator planning"
- School feedback: "Professional, printable timetables"

---

## Risk Analysis

### Technical Risks:

- **Risk**: Complex validation logic (room conflicts, teacher conflicts)
  - **Mitigation**: Incremental validation, clear error messages
- **Risk**: Performance issues with large schools (many grades/subjects)
  - **Mitigation**: Pagination, lazy loading, database indexing
- **Risk**: Date/time handling across timezones
  - **Mitigation**: Store as UTC, display in school's timezone

### Business Risks:

- **Risk**: Admin learns new workflow (change resistance)
  - **Mitigation**: Product tour, video tutorials, gradual rollout
- **Risk**: Edge cases not covered (split exams, makeup exams)
  - **Mitigation**: Flexible design, custom fields, future iterations

### Data Risks:

- **Risk**: Accidental exam schedule deletion
  - **Mitigation**: Soft delete, audit log, backup/restore
- **Risk**: Unauthorized access to unpublished exams
  - **Mitigation**: Role-based access control, status checks

---

## Future Enhancements (P3+)

1. **AI Auto-Scheduler**: ML model suggests optimal exam schedule
2. **Conflict Resolution Wizard**: Step-by-step guide to fix conflicts
3. **Mobile App**: Native iOS/Android app for students
4. **SMS Notifications**: Send exam reminders via SMS
5. **Seating Arrangement**: Generate seating plans per exam room
6. **Exam Statistics**: Analytics on exam distribution, room usage
7. **Multi-Language Support**: Exam schedules in English/Thai
8. **Accessibility**: Screen reader support, high-contrast mode

---

## Dependencies

### Required:

- Prisma schema migration
- PDF generation library (e.g., jsPDF, Puppeteer)
- Excel generation library (e.g., exceljs)
- Date handling library (date-fns or dayjs)
- Drag-and-drop library (dnd-kit or react-beautiful-dnd)

### Optional:

- Email service for notifications
- SMS gateway for reminders
- Calendar integration (Google Calendar, Outlook)

---

## Alternatives Considered

### Alternative 1: Extend Lock Schedule

- **Pros**: No new feature, reuse existing code
- **Cons**: Conflates two different concepts, confusing UX, limited validation
- **Decision**: ❌ Rejected - Exams are fundamentally different

### Alternative 2: Manual Excel Entry

- **Pros**: Simple, no development needed
- **Cons**: No validation, error-prone, hard to share, no student portal
- **Decision**: ❌ Not scalable

### Alternative 3: Third-Party Exam Scheduling Tool

- **Pros**: Off-the-shelf solution, mature features
- **Cons**: Integration complexity, recurring costs, data privacy concerns
- **Decision**: ❌ Custom solution better fits existing system

---

## Conclusion

The Exam Arrange Mode is a **high-value feature** that addresses a real pain point in school administration. By providing a dedicated, purpose-built interface for exam scheduling, we:

1. ✅ Separate concerns (exams vs. locks)
2. ✅ Enable specialized workflows
3. ✅ Provide validation and conflict detection
4. ✅ Generate professional outputs
5. ✅ Improve student/teacher experience

**Recommendation**: Prioritize for **P2 implementation** after completing P1 features (Quick Assignment Panel, Unified State Management) and P2 conflict detection.

---

_Design Document Version: 1.0_  
_Created: October 31, 2025_  
_Status: Awaiting Approval for Future Implementation_  
_Next Step: Review with stakeholders, refine requirements_
