# Teacher-Assignment UI Redesign — Grade Coverage Matrix

Date: 2026-06-27
Status: Approved (design); pending implementation plan
Related: bd `70t` (save RespID fix, done), bd `gqd` (seed code fix, done)

## Problem

The teacher-assignment page (`/management/teacher-assignment`) has two siloed
modes — `by-teacher` (`TeacherCentricEditor`) and `by-grade`
(`SubjectAssignmentTable`). Three pains:

1. **No coverage overview.** You can't see, for a grade, which (class, subject)
   slots still lack a teacher, or how teacher workload is distributed.
2. **Slow entry.** Assigning one teacher to the same subject across several
   sections is a repetitive per-cell, two-dialog flow.
3. **"Assign twice" across semesters.** Assignments are per-semester; the
   existing carry-over (`copyAssignmentsAction` / `mapAssignmentsForTarget`)
   copies the **same `SubjectCode`** into the next semester — wrong for this
   school, where S1 and S2 are different courses with different codes.

## Decisions

- **Keep assignments per-semester. Do NOT unify.** Confirmed with the user:
  S1 and S2 teach genuinely different courses with different codes. Unifying
  would be domain-incorrect (and schedules are per-semester regardless).
- **Solve "assign twice" with smarter carry-over, not unification.**
- **Primary layout = a class × subject coverage matrix per grade level.**
  Unifies the two modes; `by-teacher` becomes a read-only workload lens.

## Domain facts that shape the design

- **Ragged programs within a grade level.** Sections of the same grade can run
  different programs (e.g. ม.5/1 วิทย์-คณิต, ม.5/2 ศิลป์-คำนวณ, ม.5/4 ทั่วไป), so
  they don't share one subject list. Juniors (ม.1–3) are uniform (one GEN
  program); only seniors (ม.4–6) are ragged.
- **S1→S2 code relation: mostly `…1 → …2`, with exceptions.** Core subjects
  follow the last-digit semester flip (`ค21101` → `ค21102`); electives/special
  courses may not.
- **Teacher may change between semesters** for the same (class, subject).
  Carry-over is a *suggestion*, never an assumption.

## Design

### Matrix layout

- Select grade level (ม.1) + semester + academic year → a grid.
- **Columns** = the grade's sections (ม.1/1, ม.1/2, …).
- **Rows** = the **union** of subjects across the grade's sections, grouped by
  learning area (ภาษาไทย, คณิตศาสตร์, วิทยาศาสตร์, …).
- **Cell** = assigned teacher chip, or `[+]` gap (⚠), or greyed `—` when the
  subject is **not in that section's program** (not editable, not counted).
- **Header** shows live coverage `filled / required ▮▮▮▯`.

### Coverage

`coverage = filled required cells ÷ total required cells`, where required =
each section's program subjects. Greyed `—` cells are excluded.

### Carry-over ("นำเข้าจากภาคเรียนก่อน")

- Explicit button; **never automatic, never auto-saves**.
- For each prev-semester responsibility in the grade: map subject `…1 → …2`
  **iff** the S2 subject exists in that section's program; place the previous
  teacher into the matching S2 cell as an **editable suggestion** (dashed /
  tinted "unsaved" chip).
- **Exceptions** (no `…2` target, or non-mapping elective) → leave a ⚠ gap for
  manual pick.
- **Never overwrites** a cell that already has a saved S2 assignment.
- Because teachers can change per semester, every suggested cell is freely
  swappable before saving.

### Per-cell edit

Click a cell → searchable teacher picker → set / replace / clear. Greyed `—`
cells are not clickable.

### Bulk "brush"

Pick a teacher in the toolbar, then click multiple cells to stamp that teacher
across sections (e.g. one Math teacher over all 3 sections). Toggle off to stop.
Fills empty/⚠ cells and replaces filled ones.

### Save / dirty state

- Matrix tracks dirty cells; one explicit **Save**, one **Discard**.
- Save groups dirty cells **per teacher** and reuses the fixed
  `computeResponsibilitiesDiff` (RespID-preserving) so existing rows keep their
  `RespID` and only genuine adds/removes hit the DB.
- Live workload warning (เกิน 22 ชม.) recomputes as cells change.

## Data layer & actions

**New**
- `getGradeMatrixAction({ gradeYear, academicYear, semester })` → sections +
  each section's program, union of subjects (grouped by learning area) with
  per-section applicability, and existing assignments **including `RespID`**.
  Built by fanning `getSubjectsByGradeAction` over sections + one assignments
  query for the grade.
- `syncGradeMatrixAction(dirtyCells)` → groups by teacher, reuses
  `computeResponsibilitiesDiff`, persists. Server re-validates each cell's
  subject ∈ section program (defense-in-depth).
- `previewCarryOverAction({ gradeYear, targetSemester, targetYear })` →
  read-only `{ mapped[], exceptions[] }` using `…1→…2` + target-exists check.

**Reused**
- `TeacherPicker`, `TeacherWorkloadCard`, `calculateTeachHour`,
  `computeTeacherStats` (+22h warning), `hasResponsibilityConflict`,
  the fixed `assignmentsToEditState` / `buildSyncResp` RespID round-trip.

**Retired (for this view)**
- `copyAssignmentsAction` / `mapAssignmentsForTarget` same-code copy — replaced
  by `previewCarryOverAction` with code mapping. (Keep until the create-semester
  wizard is migrated or confirmed unaffected.)

## Components

- **New:** `GradeCoverageMatrix` (grid), `TeacherBrush` (toolbar),
  `CarryOverDialog`, `CoverageHeader`.
- **Reuse:** `TeacherPicker`, `TeacherWorkloadCard`, credit/teach-hour utils.
- **Routing:** `mode=by-grade` → matrix (new default). `mode=by-teacher` kept
  as a read-only workload lens (drill-down from a teacher chip).

## Testing (TDD)

- Unit: code-mapping (`…1→…2` + existence), coverage calc, matrix→diff
  grouping (mirrors `teacher-centric-editor.logic.test.ts`).
- E2E: carry-over spec (S1 → S2 with exceptions) — follow-on.

## Out of scope (YAGNI)

Drag-and-drop, multi-user realtime sync, any change to schedule generation, and
migrating the create-semester wizard's copy step (tracked separately).

## Risks / open questions

- Wide grids for grade levels with many sections × many subjects — may need
  sticky headers / horizontal scroll; acceptable for ≤4 sections.
- The `…1→…2` exceptions list is data-dependent; carry-over must degrade
  gracefully (exception → ⚠ gap) rather than guess.
