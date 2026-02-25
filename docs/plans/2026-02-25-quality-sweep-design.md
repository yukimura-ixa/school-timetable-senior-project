# Quality Sweep — Design Document

**Date**: 2026-02-25
**Approach**: B (Two-Phase: Fix-then-Improve)
**Scope**: Fix broken things, add missing loading states, close/update GitHub issues

---

## Context

Codebase audit revealed:
- **21 phantom TS errors** from stale `.next/` cache referencing deleted `(admin)` route group
- **2 pre-existing E2E failures**: crud-smoke (selector mismatch), schedule-assignment (format mismatch)
- **3 open GitHub issues**: #3 (fully resolved), #4 (partially resolved), #5 (largely resolved)
- **5 dashboard/schedule sub-routes** missing `loading.tsx` (blocks page render during data fetch)
- **Unit tests**: 427 passed, lint clean, CI build passing

## Decisions

| Question | Choice |
|----------|--------|
| Goal | Full quality sweep: fix broken + add loading states |
| Loading pattern | Content-aware skeletons matching actual page layouts |
| GitHub issues | Close all 3 with status comments |
| Cache safeguard | Clear caches + add `prebuild` script |
| schedule-assignment fix | Update test + add `data-testid` to component |

---

## Phase 1: Fix Broken Things

### 1a. Stale Cache + Prebuild Safeguard

- Delete `.next/`, `.next-test/` locally
- Add `package.json` scripts:
  - `"clean": "rimraf .next .next-test"`
  - `"prebuild": "rimraf .next/types .next-test/types .next/dev/types .next-test/dev/types"`
- `prebuild` runs automatically before `build`, clears only the type validator directory (~instant), preserves incremental compilation cache

### 1b. Fix crud-smoke Save Button Selector

- **File**: `e2e/smoke/crud-smoke.spec.ts` ~line 154
- **Change**: `button[aria-label="save"]` → `button[aria-label="บันทึก"]`
- **Also**: Remove the TODO comment (lines ~148-150)

### 1c. Fix schedule-assignment + Add data-testid

**Component change**:
- **File**: `src/app/schedule/[academicYear]/[semester]/arrange/@header/_components/HeaderClient.tsx`
- Add `data-testid={`teacher-option-${teacher.TeacherID}`}` to Autocomplete `renderOption`

**Test changes**:
- **File**: `e2e/tests/admin/schedule-assignment.spec.ts`
- Update teacher name construction to include `(Department)` suffix
- Remove TODO comment

**POM change**:
- **File**: `e2e/page-objects/ArrangePage.ts`
- Update `selectTeacher` to prefer `data-testid` when available, fall back to fuzzy text matching

### 1d. GitHub Issues

| Issue | Action |
|-------|--------|
| #3 (dual arrange pages) | Close — resolved in commits `49b0c36`, `6e75b70`, `e0fcfcc` |
| #5 (auth session flakiness) | Close — addressed via retry/backoff, health checks, hydration waits |
| #4 (dashboard timeouts) | Update with Phase 1 status, close after Phase 2 ships loading states |

---

## Phase 2: Content-Aware Loading Skeletons

### Design Pattern

Follow dashboard main page convention:
- Tailwind `animate-pulse` + `bg-gray-200 rounded` blocks
- Grid layouts mirror actual page content structure
- No MUI dependency — pure Tailwind, renders instantly during SSR streaming
- Each `loading.tsx` is a Next.js route-level file

### Shared Component

**`src/components/feedback/TimetableGridSkeleton.tsx`**
- Props: `rows?: number` (default 8), `cols?: number` (default 5)
- Renders: header row + N data rows, each cell a gray rounded block
- Used by: all-timeslot, teacher-table, student-table

### Route Skeletons

| Route | File | Skeleton Structure |
|-------|------|--------------------|
| all-timeslot | `dashboard/.../all-timeslot/loading.tsx` | Title bar + action buttons + `TimetableGridSkeleton` (5×8) |
| lock | `schedule/.../lock/loading.tsx` | Title bar + toggle buttons + 2×2 card grid (each: title + 3 lines) |
| teacher-table | `dashboard/.../teacher-table/loading.tsx` | Selector (h-14) + `TimetableGridSkeleton` + export button row |
| student-table | `dashboard/.../student-table/loading.tsx` | Same as teacher-table (reuse pattern) |
| conflicts | `dashboard/.../conflicts/loading.tsx` | Summary card (3 stat blocks) + tab bar (3 tabs) + table (header + 5 rows × 4 cols) |

---

## Risks

| Risk | Mitigation |
|------|-----------|
| `prebuild` slows build | Only deletes `/types` subdir (~instant), not full `.next/` cache |
| `data-testid` change breaks other tests | Additive attribute — no existing tests use it, only new POM code will |
| Loading skeletons flash briefly on fast loads | Standard Next.js streaming behavior; skeletons only show if data fetch > ~200ms |
| `rimraf` not available | Already a transitive dep; add as explicit devDep if needed |

## Success Criteria

- [ ] `pnpm tsc --noEmit` passes with 0 errors (after cache clear + rebuild)
- [ ] crud-smoke E2E test passes
- [ ] schedule-assignment E2E test passes (or is unblocked by format fix)
- [ ] All 5 sub-routes show content-aware skeletons during load
- [ ] GitHub issues #3, #4, #5 closed with explanatory comments
- [ ] CI green on both phases
