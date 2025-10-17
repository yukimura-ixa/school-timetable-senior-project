# School Timetable Management System — Project Context

## Mission (1–2 lines)
A web app that lets schools build conflict-free class timetables quickly and publish teacher/student schedules online.

## Users & Roles
- **Admin**: CRUD for teachers, rooms, subjects, grade levels; set timetable params; assign subjects; arrange timetable; lock shared times; exports; dashboards.
- **Teacher**: View own timetable; download PDF/Excel.
- **Student**: View class timetable online.

## Core Capabilities (must not regress)
1) Data management: teachers, rooms, subjects, grade-levels.  
2) **Assign subjects** → teacher × class with weekly lesson counts.  
3) **Set timetable** → year/semester, periods/day, start time, durations, breaks, school days, copy-from-previous-term.  
4) **Arrange timetable** (drag/drop or controls) with **conflict checks**:
   - No teacher double-booked.
   - No class double-booked.
   - Room availability enforced.
   - Honor locked periods and breaks.
5) **Lock timeslots** (e.g., scouts/assemblies across multiple classes/teachers).  
6) **Views/exports**: teacher schedule, class schedule, combined teacher matrix, curriculum summary; export **Excel** and **PDF**.  
7) **Auth**: Google sign-in for Admin/Teacher; students view schedules without auth.

## Tech Stack (current)
- **Frontend/Backend**: Next.js (React)  
- **UI**: Tailwind CSS  
- **ORM**: Prisma  
- **DB**: MySQL (Google Cloud SQL in prod)  
- **Auth**: Google OAuth

## Data Model (essentials)
- `teacher(TeacherID, Firstname, Lastname, Department, Email, Role)`  
- `gradelevel(GradeID, Year, Number)`  
- `subject(SubjectCode, SubjectName, Category, Credit, ProgramID)`  
- `room(RoomID, RoomName, Building, Floor)`  
- `timeslot(TimeslotID, DayOfWeek, AcademicYear, Semester, StartTime, EndTime, BreakTime)`  
- `class_schedule(ClassID, TimeslotID, SubjectCode, RoomID, GradeID, IsLocked)`  
- `teacher_responsibility(RespID, TeacherID, GradeID, SubjectCode, AcademicYear, Semester, TeachHour)`  
- `program(ProgramID, ProgramName, Semester)`  
- `table_config(ConfigID, AcademicYear, Semester, ConfigJSON)`

## Quality Bar
- Conflict detection is **authoritative**: the UI must gray/disable impossible placements before commit.  
- Exports are **deterministic** and human-readable.  
- UI: large, legible text; minimal cognitive load; keyboard-navigable.

## Non-functional
- Cloud-hosted; multi-user safe updates; optimistic UI where possible.  
- Teacher/class queries under 150ms P95 on typical datasets (≤ 120 teachers, ≤ 40 rooms, ≤ 60 classes).

## What to prefer in code
- TypeScript everywhere.  
- Prisma schemas as single source of truth; generate types.  
- Pure functions for constraint checks; unit tests with table-driven cases.  
- Clear separation: `assign`, `lock`, `arrange`, `export` modules.

## Tasks the assistant can do next
- Write a `checkConflicts()` library (teacher/class/room rules + tests).  
- Implement "copy from previous term" endpoint + idempotent DB ops.  
- Build timetable drag/drop with preview of valid slots only.  
- Create `EXPORT: teacher|class|combined` in Excel and PDF (server-side).

## Out of scope (for now)
- Multi-school tenancy, mobile app, offline mode.

## Style cues
- Tailwind utility-first; avoid custom CSS unless needed.  
- Accessible color contrast; large click targets; clear disabled states.