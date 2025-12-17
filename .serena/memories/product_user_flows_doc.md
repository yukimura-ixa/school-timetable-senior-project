# Product Documentation: User Flows

**Location:** `docs/product/user-flows.md`  
**Created:** December 16, 2025  
**Size:** ~21KB

## Summary

Comprehensive user flows documentation for the Phrasongsa Timetable System.

## Personas (4)

| Actor | Role Code | Description |
|-------|-----------|-------------|
| System Administrator | `admin` | Full access, creates semesters, manages data, builds schedules |
| Teacher | `teacher` | Views personal schedule, no edit access |
| Student | `student` | Views class schedule, no edit access |
| Public Guest | `guest` | Browses published schedules only |

## User Flows (12)

1. **Admin Login & Semester Selection** - OAuth flow, semester picker
2. **Create New Semester Configuration** - Year, term, timeslot generation
3. **Teacher CRUD Operations** - Create/edit/delete teachers
4. **Assign Teaching Responsibilities** - Link teachers to subjects/classes
5. **Drag-and-Drop Schedule Arrangement** - @dnd-kit based scheduling
6. **Bulk Timeslot Locking** - Templates for lunch, assemblies, clubs
7. **Conflict Detection & Resolution** - Teacher/class/room conflicts
8. **Export Timetable to Excel** - ExcelJS-based exports
9. **Publish Semester Schedule** - DRAFT → PUBLISHED status
10. **Public Schedule Viewing** - Homepage search and browse
11. **Program/Curriculum Management** - MOE-compliant programs
12. **Analytics Dashboard Viewing** - Recharts visualizations

## Key Mermaid Diagrams Included

- Login flow with OAuth
- Semester creation wizard
- Drag-drop scheduling with conflict detection
- Lock template application
- Publish gate with completeness check
- Flow dependency diagram (all flows interconnected)

## Flow Dependencies

```
Login → Create Semester → [Teachers, Subjects, Rooms, Classes]
                       ↓
              Assign Responsibilities
                       ↓
              Arrange Schedule ←→ Lock Timeslots
                       ↓
              Detect Conflicts → Resolve → Publish → Public View
```

## Edge Cases Documented

- Google OAuth denial
- Duplicate semester prevention
- Delete with dependencies blocked
- No teachers empty state
- All rooms occupied
- Template matches nothing
- Completeness < 30% blocks publish
