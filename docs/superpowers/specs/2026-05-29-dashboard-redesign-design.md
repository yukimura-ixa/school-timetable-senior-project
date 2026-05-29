# Dashboard Redesign — Action-First Overview

**Date:** 2026-05-29
**Page:** `src/app/dashboard/[academicYear]/[semester]/page.tsx`
**Status:** Approved design, ready for implementation plan

## Problem

The current semester dashboard is redundant and over-stacked. Seven vertical
blocks (Header, ReadinessIssues banner, QuickStats 4 cards, QuickActions,
Charts, HealthIndicators, SummaryInfo) repeat the same facts:

- `teacherCount` and `gradeCount` render in **both** QuickStats and SummaryInfo.
- Publish readiness appears **twice**: the `ReadinessIssues` banner and the
  `PublishReadinessCard` stat tile.
- `HealthIndicators` re-derives schedule completion already implied by the stat
  cards.

It is also the lone hand-rolled-Tailwind page in an otherwise MUI app, and uses
emoji as its icon system.

## Decisions

| Question | Decision |
| --- | --- |
| Dashboard's primary job | "What must I fix?" — action/health-first |
| Sections kept | Quick-action nav, Charts |
| Sections cut | QuickStats, SummaryInfo, status chip, standalone readiness/health blocks |
| Layout | B — Split command center (worklist left 2/3, nav right 1/3, charts full-width below) |
| Styling | Unify to MUI using the existing `src/app/theme.ts` tokens |

## Target Layout

```
Header: ภาพรวมภาคเรียน  ·  ภาคเรียนที่ X/YYYY

┌──────────────────────────────┬──────────────────┐
│  ActionCenter (flex 2)        │  QuickNav (flex 1)│
│  ต้องแก้ก่อน · N รายการ        │  เมนูด่วน          │
│  [severity rows + แก้ button] │  [7 tool links]   │
└──────────────────────────────┴──────────────────┘
┌──────────────────────────────┬──────────────────┐
│  TeacherWorkloadChart         │  SubjectDistrib.  │
└──────────────────────────────┴──────────────────┘
```

## Components

### Page (server component)
- Keeps the existing per-section `<Suspense>` streaming architecture.
- Keeps the existing year/semester validation guards (rendered as MUI alerts).
- Replaces Tailwind markup with MUI `Box`/`Paper`/`Typography`/`Grid`.
- Renders: Header → command-center row (`ActionCenter` + `QuickNav`) → charts row.

### ActionCenter (async server component, in Suspense)
The single consolidated worklist. Replaces `ReadinessIssues`,
`PublishReadinessCard`, and `HealthIndicators`.

- Data (no new queries — reuse existing):
  - `dashboardRepository.getScheduleStatsData`, `getGradesBasic`, `getQuickStats`
  - `dashboard-stats.service`: `detectConflicts`, `countTeachersWithSchedules`,
    `countClassCompletion`
  - `getPublishReadiness(semesterAndyear)`
- Builds an ordered list of issue rows, each `{ severity, title, detail, href }`:

  | Issue | Severity (theme color) | Condition | Deep link |
  | --- | --- | --- | --- |
  | Publish blocked | `error` | readiness.status ∈ {moe-failed, conflicts, incomplete} | `/schedule/{year}/{semester}/lock` |
  | Schedule conflicts | `error` | totalConflicts > 0 | `…/conflicts` |
  | Classes incomplete | `warning` | classCompletion.none + partial > 0 | `…/student-table` |
  | Teachers without schedule | `info` | withoutSchedules > 0 | `…/teacher-table` |

  Order: `error` rows first (publish blocker, then conflicts), then `warning`,
  then `info`.
- Each row: severity icon in tinted square + 4px left-border accent, title,
  one-line detail (e.g. `ครู 2 · ชั้นเรียน 1 · ห้องเรียน 0` for conflicts;
  first readiness issue string for the publish row), and a pill
  `Button` "แก้" linking via plain `href` string.
- Readiness detail: readiness `issues` is a `string[]` with no per-issue link;
  show the first issue as the detail line; the row links to the publish flow.
- **Empty state:** when the list is empty, render a `success`-colored panel
  with a `CheckCircle` icon and "ทุกอย่างเรียบร้อย".

### QuickNav (static, no data)
- `Paper` titled "เมนูด่วน" with a vertical `List` of `ListItemButton` links.
- The 7 existing destinations: teacher-table, student-table, all-timeslot,
  all-program, conflicts, `/schedule/{year}/{semester}/lock`, analytics.
- Real `@mui/icons-material` icons replace emoji: Person, School/Groups,
  Schedule, MenuBook, WarningAmber, Lock, BarChart.

### ChartsSection (async server component, in Suspense — unchanged)
- Reuses `TeacherWorkloadChart` and `SubjectDistributionChart` as-is, in a
  2-column `Grid`.

## Constraints

- **RSC + MUI:** ActionCenter, QuickNav, and the page are server components.
  Use plain `href` strings on MUI `Button`/`ListItemButton` — never
  `component={Link}` in a server component (runtime RSC serialization crash;
  `pnpm build` does not catch it).
- **Icons:** accompany every icon with accessible text; decorative-only icons
  get `aria-hidden`.
- **No new data fetching** — only consolidation of existing repository/service
  calls.
- Keep loading skeletons; reshape them to match the new two-column layout.

## Out of Scope

- The semester-select page (`src/app/dashboard/page.tsx`).
- The analytics page (charts stay; deeper analysis already lives there).
- Any change to `dashboard-stats.service` or `dashboardRepository` logic.

## Success Criteria

- Seven stacked blocks reduced to three (header, command center, charts).
- No metric appears in more than one place.
- Every number that survives is actionable (sits in a row with a fix link).
- Page renders in MUI with theme tokens; no emoji icons; no Tailwind utility
  classes remain on this page.
- Per-section Suspense streaming preserved; `pnpm build`, `pnpm lint`,
  `pnpm typecheck` pass.
