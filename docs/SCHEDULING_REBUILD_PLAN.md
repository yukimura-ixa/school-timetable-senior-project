# Scheduling Page Rebuild Plan (Thai Academic Process)

Date: 2025-10-27

> Note: Do NOT change the existing drag-and-drop page without explicit approval.

## Objectives

- Align scheduling flow with Thai academic subject scheduling process.
- Programs are year-specific (Matthayom 1–6); scheduling flows must use selected Year + Semester + AcademicYear context.
- Preserve existing DnD UI for placement; improve pre/post steps around it.

## Proposed Flow

1. Configure Context
   - Select Year (M1–M6), Semester (1/2), and Academic Year (YYYY) — required
   - Lock once scheduling starts (with admin override)
2. Define Constraints & Inputs
   - Teacher availability (teaching load, unavailable periods)
   - Room constraints (capacity, special equipment)
   - Class/Grade requirements (weekly lessons per subject) by Year per MOE standards
   - Fixed events (assemblies, exams) — time locks
3. Generate Draft Slots
   - Pre-allocate required lesson counts per class/subject/teacher
   - Detect conflicts and mark problematic pairs
4. Arrange via DnD (existing page)
   - Keep current drag-and-drop board
   - Surface conflict indicators (teacher/room/class collisions)
   - Inline suggestions for available rooms/slots
5. Validation & Review
   - Run comprehensive conflict checks
   - Summaries: teacher load matrix, class timetable preview, per-Year completion status
6. Publish & Export
   - Publish to public endpoints
   - Export PDF/Excel

## Data & APIs

- Preflight APIs
  - `getSchedulingContext({ year, semester, academicYear })`
  - `getConstraints()` (teachers, rooms, subjects, fixed events)
  - `getDraftAllocation()` for lesson counts
- Mutation APIs
  - `lockContext()` / `unlockContext()`
  - `applyAutoPlacement(strategy)` (optional future)
  - `saveScheduleChanges(changes)` — idempotent batch writes
- Validation API
  - `validateSchedule()` returns conflict list with codes and messages

## UI Enhancements (Non-DnD)

- Pre-scheduling wizard to collect constraints
- Status bar with:
  - Progress (allocated vs required)
  - Conflict count
  - Last saved timestamp
- Side panel filters: teacher/class/room/subject

## Acceptance Criteria

- Users can complete scheduling following Thai academic steps without modifying the DnD page.
- Context selection requires Year (M1–M6), Semester, and AcademicYear.
- Conflict checks catch teacher/class/room collisions and unavailable times.
- Schedules can be saved and reloaded idempotently.

## Risks

- Data model coupling with subjects/programs might need refinement (lesson counts mapping).
- Performance with large datasets during validation.

## Next Steps

- Confirm data model for weekly lessons per class/subject.
- Implement preflight constraints pages and APIs.
- Extend validation service with codes and human-readable reasons.
- Add integration tests covering the end-to-end scheduling flow.
