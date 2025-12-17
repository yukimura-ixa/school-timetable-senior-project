# Product Documentation: Use Cases

**Location:** `docs/product/use-cases.md`  
**Created:** December 16, 2025  
**Size:** ~36KB  
**Format:** Cockburn "Fully Dressed" Style

## Summary

20 use cases documenting all major system functionality with stakeholders, preconditions, postconditions, main success scenarios, and extensions.

## Use Case Index

| ID | Name | Actor | Level |
|----|------|-------|-------|
| UC-01 | Authenticate Administrator | Admin | User Goal |
| UC-02 | Create Semester Configuration | Admin | User Goal |
| UC-03 | Manage Teacher Records | Admin | User Goal |
| UC-04 | Manage Subject Records | Admin | User Goal |
| UC-05 | Manage Room Records | Admin | User Goal |
| UC-06 | Manage Grade/Class Records | Admin | User Goal |
| UC-07 | Assign Teaching Responsibilities | Admin | User Goal |
| UC-08 | Arrange Class Schedule (Drag-Drop) | Admin | User Goal |
| UC-09 | Lock Timeslots | Admin | User Goal |
| UC-10 | Detect Schedule Conflicts | System/Admin | User Goal |
| UC-11 | Resolve Schedule Conflicts | Admin | User Goal |
| UC-12 | Export Schedule to Excel | Admin | User Goal |
| UC-13 | Publish Semester Schedule | Admin | User Goal |
| UC-14 | View Teacher Schedule (Public) | Public User | User Goal |
| UC-15 | View Class Schedule (Public) | Public User | User Goal |
| UC-16 | Manage Program Curriculum | Admin | User Goal |
| UC-17 | Configure Subject for Program | Admin | Subfunction |
| UC-18 | Apply Lock Template | Admin | Subfunction |
| UC-19 | View Analytics Dashboard | Admin | User Goal |
| UC-20 | Bulk Delete Schedules | Admin | User Goal |

## Use Case Structure (Cockburn Format)

Each use case includes:
- **Header:** ID, Name, Scope, Level, Primary Actor
- **Stakeholders & Interests:** Who cares and why
- **Preconditions:** What must be true before
- **Success Guarantee:** Postconditions when successful
- **Main Success Scenario:** Numbered steps (1-N)
- **Extensions:** Alternate flows (e.g., 3a, 6b)
- **Special Requirements:** NFRs, constraints
- **Technology & Data Variations:** Implementation notes
- **Frequency:** How often this occurs

## Key Use Cases Detail

### UC-01: Authentication
- Google OAuth via Better Auth
- Rate limit: 50 auth/hour/IP
- Session: HttpOnly, Secure, SameSite=Lax, 7-day expiry

### UC-07: Assign Teaching Responsibilities
- Creates `teachers_responsibility` records
- `syncAssignmentsAction` handles diff-based sync
- Max recommended: 20 hours/week (warning only)

### UC-08: Drag-Drop Scheduling
- Uses @dnd-kit library
- Real-time conflict detection
- Room selection modal on drop
- Creates `class_schedule` records

### UC-09: Lock Timeslots
- Templates: lunch (junior/senior), assemblies, clubs
- Datetime-based matching (HH:mm:ss format)
- Sets `timeslot.IsLocked = true`

### UC-13: Publish Semester
- Requires ≥30% completeness
- Status progression: DRAFT → PUBLISHED → LOCKED → ARCHIVED
- Clears draft caches on publish

## Lock Templates Available

| Name | Criteria |
|------|----------|
| พักกลางวัน (ม.ต้น) | 10:40-11:30, Mon-Fri |
| พักกลางวัน (ม.ปลาย) | 10:55-11:45, Mon-Fri |
| กิจกรรมเข้าแถว | 08:00-08:30, Mon-Fri |
| กิจกรรมชุมนุม | 14:00-16:00, Wed |
| ประชุมระดับชั้น | 14:00-16:00, Fri |

## Data Entities Referenced

- `teacher`, `subject`, `room`, `gradelevel`
- `program`, `program_subject`
- `timeslot`, `class_schedule`, `teachers_responsibility`
- `table_config` (semester configuration)
- `User`, `Session`, `Account` (Better Auth)
