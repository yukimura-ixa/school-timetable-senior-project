# Program (Course Syllabus) Page — UX Plan

Date: 2025-10-27

## Goals
- Fast, clear management of programs (course syllabi) with semester filtering.
- Inline editing with bulk save workflow similar to Rooms.
- Clear validation and error feedback.
- Comply with Thai MOE rule: each Program is designed for a specific year (Matthayom 1–6).

## Proposed UI
- DataGrid (MUI) with the following columns:
  - Program Code
  - Program Name (Thai)
  - Program Name (English) — optional if present in schema
  - Year (Matthayom 1–6)
  - Semester/Academic Year (1/2, YYYY)
  - Weekly Lessons (per subject or total; confirm data model)
  - Actions (Edit, Delete)
- Toolbar
  - Add Program (opens dialog)
  - Filters:
    - Year: M1, M2, M3, M4, M5, M6 (chips or select)
    - Semester: 1 or 2
    - Academic Year: YYYY
  - Search box
  - Edit / Save / Cancel (for selected rows) and Delete
- Pagination: 10/25/50 rows

## Interactions
- Select rows with checkboxes; entering Edit mode switches selected rows to editable cells.
- Save performs bulk update via server action `updateProgramsAction` (new):
  - Input: array of programs with ids and updated fields (validated by valibot)
  - Output: updated ids
- Add Program dialog uses `createProgramsAction` (bulk) with client-side validation and duplicate checks.
- Delete leverages `deleteProgramsAction` (bulk) with confirm dialog.

## Validation
- Use valibot schemas mirroring current Prisma model fields.
- Year is required and must be one of: M1, M2, M3, M4, M5, M6.
- Unique constraints enforced server-side with user-friendly messages:
  - (ProgramCode, Year, Semester, AcademicYear) must be unique.
- If MOE weekly-lesson standards are enabled, validate per-year totals and subject-category minima.

## Server Actions (new)
- `getProgramsAction({ year, semester, academicYear, search })`
- `createProgramsAction(programs)`
- `updateProgramsAction(programs)`
- `deleteProgramsAction({ programIds })`

## Data Model Notes
- Each Program belongs to exactly one Year (Matthayom 1–6) and a Semester/Academic Year context.
- Confirm if program links to subjects or holds curriculum metadata only.
- If subjects mapping per program is required, include nested dialogs to add/remove subject entries with lesson counts.
- Consider an enum for Year in Prisma schema: `enum GradeYear { M1 M2 M3 M4 M5 M6 }` and a column on Program.

## Acceptance Criteria
- Filter by semester/year changes table results without full page reload.
- Create/edit/delete succeed with optimistic feedback (snackbar) and refresh.
- Inline edit with Save/Cancel works on multiple rows.
- Keyboard accessible (Tab, Enter), basic responsiveness retained.
 - Year must be one of M1–M6; duplicate Program in the same (Year, Semester, AcademicYear) is rejected with a friendly message.

## Next Steps
- Scaffold route `src/app/management/program/page.tsx` client component with DataGrid, following Rooms pattern.
- Implement server actions and valibot schemas (include Year enum, unique constraint validation).
- Author MOE standards config (per-year weekly lessons) for validation and seeding.
- Wire E2E tests: create/edit/delete by Year/Semester, filter behaviors, validation errors.
