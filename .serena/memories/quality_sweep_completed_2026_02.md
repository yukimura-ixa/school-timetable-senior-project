# Quality Sweep — February 2026

## Summary
Two-phase quality sweep completed. All 3 GitHub issues (#3, #4, #5) closed.

## Phase 1: Fix Broken Things
- **Prebuild script**: Added `clean` and `prebuild` npm scripts to package.json to prevent stale `.next/types` cache causing phantom TS errors. Uses `rimraf`.
- **crud-smoke E2E fix**: Updated save button selector from `aria-label="save"` to `aria-label="บันทึก"` (Thai locale).
- **schedule-assignment E2E fix**: Added `data-testid={teacher-option-${TeacherID}}` to teacher Autocomplete `renderOption` in `HeaderClient.tsx`. Updated POM `ArrangePage.ts` with `locateByTestId` fallback strategy.
- **GitHub issues**: #3 (dual arrange pages) closed — admin route was already removed. #5 (auth flakiness) closed — retry/backoff already extensive.

### Phase 1 Commits
- `333c1eb9` — clean/prebuild scripts
- `facbd776` — crud-smoke Thai selector
- `8769128b` — data-testid on teacher Autocomplete
- `9d4f9898` — schedule-assignment + POM fix

## Phase 2: Content-Aware Loading Skeletons
- **Shared component**: `src/components/feedback/TimetableGridSkeleton.tsx` — pure Tailwind, SSR-compatible (no "use client"), configurable `rows`/`cols` props. Separate from the existing MUI-based `TimetableGridSkeleton` in `LoadingStates.tsx`.
- **5 loading.tsx files created**:
  - `dashboard/.../all-timeslot/loading.tsx` — title + actions + grid skeleton
  - `schedule/.../lock/loading.tsx` — title + toggle + 2×2 card grid
  - `dashboard/.../teacher-table/loading.tsx` — selector + grid + export buttons
  - `dashboard/.../student-table/loading.tsx` — dual selector + grid + export buttons
  - `dashboard/.../conflicts/loading.tsx` — summary card + tabs + table skeleton
- **GitHub issue #4**: Closed — all loading skeletons added.

### Phase 2 Commits
- `f25bb843` — TimetableGridSkeleton component
- `59fb5fcb` — 5 loading.tsx files

## Design Docs
- `docs/plans/2026-02-25-quality-sweep-design.md`
- `docs/plans/2026-02-25-quality-sweep-plan.md`
