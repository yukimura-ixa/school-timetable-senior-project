# Automation Candidates – 2025-12-18

Consolidated report with evidence bundle:
- `docs/testing/exploratory/PROD_ADMIN_BUG_BASH_REPORT_2025-12-18.md`

Prioritized by risk - effort (highest first).

1) **Auth invalid credentials** – Assert Thai error message renders and no redirect; ensure console free of form-structure warnings.
2) **Auth happy path (admin)** – Login redirects to dashboard; assert no React console errors (#418 regression) and session persists after reload.
3) **Logout** – Header “ออกจากระบบ” clears session, returns to `/signin`, and subsequent `/dashboard` access requires re-login.
4) **Dashboard semester routing** – From `/dashboard/2567/1`, clicking sidebar “แสดงตารางรวมครู” stays within `/dashboard/2567/1/*` (no bounce to `/dashboard`).
5) **Timezone sanity (timetables)** – Teacher arrange + teacher/student tables show configured local start time (e.g., `08:30`) and never `01:30`.
6) **Student table selector sanity** – Dropdown options are valid class labels (no `/0` or negative values) and selection triggers no 500s.
7) **Public teacher list pagination/search** – Verify pagination controls advance pages and search filters rows deterministically.
8) **Teacher schedule deep-link** – Opening `/teachers/{id}/{semester}` loads without auth prompt and shows timetable grid (or clear empty state).
9) **Visual snapshot: signin form** – Catch layout/font/icon regressions and error-toast styling.
10) **Visual snapshot: dashboard semester picker** – Detect layout regressions on semester cards and primary actions.
11) **Visual snapshot: all-timeslot read-only banner + export buttons** – Guard fragile dashboard UI/exports entry points.
12) **Arrange page load & teacher selector** – Navigate to `/schedule/{semester}/arrange`, ensure teacher dropdown populated and grid renders/prompt stable.


