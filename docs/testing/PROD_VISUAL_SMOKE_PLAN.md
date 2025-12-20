# Production Visual Smoke – Real Admin Scenario Plan

This document defines realistic “day-in-the-life” Admin journeys for **production visual smoke testing** using Playwright screenshot + ARIA snapshots.

## Actors

- **Admin** (primary): manages master data, verifies dashboards, verifies timetable/scheduling surfaces, verifies export entry points.
- **Teacher** (secondary, read-only verification): views assigned schedule (optional; only if a known teacher account exists in the test tenant).
- **Student** (secondary, read-only verification): views published timetable (optional; only if known fixture exists).

## Preconditions

- A **dedicated test tenant / dataset** exists for production smoke runs, or all created records are tagged with **`E2E-`** and cleaned up in the same run.
- Admin credentials are available via environment secrets:
  - `E2E_ADMIN_EMAIL`
  - `E2E_ADMIN_PASSWORD`
- A target environment URL exists:
  - `E2E_BASE_URL` (preferred) or `BASE_URL` (legacy)
- A “current semester” exists and is reachable:
  - `E2E_SEMESTER_ID` (recommended, e.g. `1-2567`) or fallback `SEMESTER_ID`
- Baseline data exists (at least some teachers/subjects/rooms/programs) so list pages render deterministically.

## Critical Journeys (8–12)

All journeys are intended to be **non-destructive** unless explicitly marked “CRUD”, and must include **visual checkpoints** (stable screenshots and/or aria snapshots).

### J1 — Admin auth + shell loads (Happy path)

Steps:
1. Open `/signin`
2. Login with `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`
3. Navigate to a canonical landing route (Dashboard)

Expected:
- Auth succeeds and user is not redirected back to `/signin`
- Session API returns `role=admin` (where available)

Visual checkpoints:
- Login page (unauthenticated) – stable form layout
- Post-login shell (header + left nav + main container)

### J2 — Start-of-semester dashboard loads (Happy path)

Steps:
1. Open `/dashboard/{SEMESTER}/all-timeslot`

Expected:
- No redirect loops
- The timetable grid / dashboard content renders

Visual checkpoints:
- Dashboard “all timeslot” grid viewport
- Header + navigation chrome (masked user menu)

### J3 — Teachers management list loads + search (Happy path)

Steps:
1. Open `/management/teacher`
2. Use search/filter input (if present) to narrow results (read-only)

Expected:
- Table header renders with expected columns
- Searching updates visible rows deterministically

Visual checkpoints:
- Teachers table header + first rows (locator screenshot)
- Empty state (only if deterministic in the test dataset)

### J4 — Subjects management list loads (Happy path)

Steps:
1. Open `/management/subject`

Expected:
- Table renders with stable headers (subject code / name / credits / hours if present)

Visual checkpoints:
- Subjects table header + first rows (locator screenshot)

### J5 — Rooms management list loads (Happy path)

Steps:
1. Open `/management/rooms`

Expected:
- Table renders and shows key attributes (e.g., building/floor/room name if present)

Visual checkpoints:
- Rooms table header + first rows (locator screenshot)

### J6 — Grade levels / Programs / Curriculum surface loads (Happy path)

Steps (pick whichever route exists and is stable in the app):
- Open `/management/gradelevel`
- Open `/management/program` (curriculum/program view)

Expected:
- Page loads without 500s
- Key content region renders (table or form)

Visual checkpoints:
- Main content region ARIA snapshot (stable structure)
- Any primary table header (locator screenshot)

### J7 — Schedule configuration surface loads (Happy path)

Steps:
1. Open `/schedule/{SEMESTER}/config`

Expected:
- No redirect loops
- Form or configuration content is visible

Visual checkpoints:
- Config page “main” container screenshot (mask transient toasts)
- ARIA snapshot for form structure (if pixel diff too noisy)

### J8 — Timetable arrange surface loads (Happy path)

Steps:
1. Open `/schedule/{SEMESTER}/arrange`

Expected:
- Grid renders OR a stable “select teacher / empty schedule” prompt appears

Visual checkpoints:
- Timeslot grid area (locator screenshot)
- Conflict badge styling (if deterministic fixture exists)

### J9 — Lock / publish gate surface loads (Happy path)

Steps:
1. Open `/schedule/{SEMESTER}/lock`

Expected:
- Lock overview renders (even if empty)

Visual checkpoints:
- Main container screenshot (mask transient banners/toasts)

### J10 — Export / print entry points exist (Happy path)

Steps:
1. Open `/dashboard/{SEMESTER}/all-program` (or the page where export is exposed)
2. Verify export UI entry point is present (do not download unless safe)

Expected:
- Export button/menu is present and clickable

Visual checkpoints:
- Export entry section screenshot
- Export modal screenshot (if opening does not mutate state)

### N1 — Unauthenticated access redirect (Negative path)

Steps:
1. Open `/management/teacher` in a fresh context (no storage state)

Expected:
- Redirect to `/signin`

Visual checkpoints:
- `/signin` page rendered after redirect

### N2 — Invalid login shows error (Negative path)

Steps:
1. Open `/signin`
2. Attempt login with invalid credentials (use hardcoded fake values, never secrets)

Expected:
- Remains on `/signin`
- Error message displayed (Thai/English acceptable)

Visual checkpoints:
- Error banner/toast region (locator screenshot)

### N3 — Missing semester selection handled (Negative path)

Steps:
1. Open a semester-scoped route without setting any localStorage (fresh context)

Expected:
- App selects default semester or navigates to semester selector without looping

Visual checkpoints:
- Selector page or resulting dashboard shell (ARIA snapshot)

## Visual Target Strategy

Preferred screenshot targets (low flake):
- `main` content container (mask transient toasts + user menu)
- Specific “table header + first rows” locators instead of full-page
- Modal dialogs (export/config) after they settle

Use ARIA snapshots when:
- Tables are too dynamic (row ordering, pagination counters, async loading)
- Fonts differ between runner environments

## User-Flow Diagram (Mermaid)

```mermaid
flowchart TD
  A[Open /signin] -->|Valid creds| B[Admin session active]
  A -->|Invalid creds| N2[Error shown on /signin]
  B --> D[Dashboard /dashboard/{sem}/all-timeslot]
  D --> T[Teachers /management/teacher]
  D --> S[Subjects /management/subject]
  D --> R[Rooms /management/rooms]
  D --> G[Gradelevel /management/gradelevel]
  D --> P[Program/Curriculum /management/program]
  D --> C[Schedule config /schedule/{sem}/config]
  D --> A1[Arrange /schedule/{sem}/arrange]
  D --> L[Lock /schedule/{sem}/lock]
  D --> E[Export entry /dashboard/{sem}/all-program]
  U[Unauth context] -->|Visit protected route| N1[Redirect to /signin]
```


