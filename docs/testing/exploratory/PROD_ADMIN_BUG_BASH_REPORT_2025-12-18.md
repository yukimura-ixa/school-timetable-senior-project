# Exploratory Bug Bash Report (Admin, Production) — 2025-12-18

Charter: Act as a real school timetable administrator preparing the next term; explore production safely (read-only where possible), surface high-impact defects/UX traps, and propose Playwright automation candidates.

Environment:
- Base URL: `https://phrasongsa-timetable.vercel.app`
- Browser: Chromium (Playwright MCP)
- Date run: 2025-12-18
- Role: Admin (via `admin@school.local`)
- Semesters observed/used: `1-2567` (primary), `1-2568` exists in selector

Evidence bundle:
- Screenshots: `docs/testing/exploratory/artifacts/bugbash-2025-12-18/`

## A) Session Report (SBTM-style)

### Timebox & Coverage
- Total timebox: ~75 minutes (Session 1 earlier + Session 2 follow-up)
- Recon: `/signin`, `/dashboard`, semester switcher, navbar/sidebars
- Admin “Day-0 Setup” mapping (read-only): `/management`, `/management/teacher`, `/management/subject`, `/management/rooms`, `/management/gradelevel`, `/management/program`, `/management/program/year/1`
- Scheduling surfaces (read-only): `/schedule/1-2567/config`, `/schedule/1-2567/arrange`, `/schedule/1-2567/lock`
- Dashboard timetable views: `/dashboard/1-2567/all-timeslot`, `/dashboard/1-2567/teacher-table`, `/dashboard/1-2567/student-table`, `/dashboard/1-2567/all-program`

### Notes (Learning)
- Production has seeded “E2E-*” teachers visible in `/management/teacher`, which is helpful for deterministic test selection.
- Semester selector includes `1/2568`, `2/2567`, and `1/2567`.
- Timetable surfaces (teacher arrange + teacher/student tables) render a time row, which is a high-signal regression target for timezone issues.

### Issues / Risks
- Multiple pages emit React hydration error `Minified React error #418` in console; this can cause transient UI mismatch and unpredictable runtime behavior.
- The admin “student table” flow appears to have server 500s and a broken grade label dropdown, blocking reliable student timetable viewing.
- Scheduling conflict logic and “last-minute chaos” operational edits were not exercised in this run to avoid mutating production data.

### Bugs (Triage Summary)
- P0/P1 issues found in this follow-up run:
  - Timetable times display in UTC (01:30… vs expected school-day local times like 08:30…)
  - Semester-scoped dashboard sidebar links drop semester context (navigates to `/dashboard`)
  - Student table grade selector labels are malformed (e.g., `ม.1/0`, `ม.7/-1`) and triggers 500s
  - Teacher table intermittently shows “โหลดข้อมูลคาบเรียนไม่ได้” and emits hydration errors

Full details: see the “Bugs” section below.

### Follow-ups (Next Charters)
1) Scheduling & Conflict Tour (safe dataset): attempt collisions (teacher/room/class) and verify conflict messages.
2) Operational Change / Last-Minute Chaos Tour (safe dataset): swap teachers/rooms, verify downstream refresh + exports.
3) Export checks: validate Excel/PDF export for teacher/student views; confirm filename correctness.

## Bugs

### P0 — Timetable times render in UTC (timezone shift)
- Impact: Schedules show incorrect period times (e.g., `01:30–02:20` instead of expected local morning times like `08:30–09:20`), undermining trust and potentially causing operational mistakes.
- Environment/URLs:
  - `/schedule/1-2567/arrange?TeacherID=620`
  - `/dashboard/1-2567/teacher-table` (after selecting a teacher)
  - `/dashboard/1-2567/student-table` (after selecting a class)
- Repro:
  1. Go to the teacher arrange board and select a teacher (example: `TeacherID=620`).
  2. Observe the “เวลา” row.
  3. Repeat on teacher table and student table.
- Expected: period times reflect Thai local time configuration (Asia/Bangkok) (e.g., start ~08:30).
- Actual: period times start at ~01:30 (UTC offset symptom).
- Evidence:
  - `docs/testing/exploratory/artifacts/bugbash-2025-12-18/arrange-teacher-time-row.png`
  - `docs/testing/exploratory/artifacts/bugbash-2025-12-18/dashboard-teacher-table-time-row.png`
  - `docs/testing/exploratory/artifacts/bugbash-2025-12-18/student-table-time-row-and-500.png`

### P1 — Semester-scoped dashboard sidebar links drop semester context
- Impact: From a semester dashboard (e.g., `1-2567`), clicking sidebar links sends the user back to `/dashboard` (semester picker) instead of the intended semester-scoped page. This breaks admin flow and feels like data loss.
- Environment/URL: `/dashboard/1-2567` → sidebar “แสดงตารางรวมครู” (and similar) → navigates to `/dashboard`
- Repro:
  1. Open `/dashboard/1-2567`.
  2. Click “แสดงตารางรวมครู” in the left sidebar.
  3. Observe URL becomes `/dashboard` (not `/dashboard/1-2567/all-timeslot`).
- Expected: `/dashboard/1-2567/all-timeslot` (and other semester-scoped routes).
- Actual: navigates to `/dashboard` (semester picker view).
- Evidence:
  - `docs/testing/exploratory/artifacts/bugbash-2025-12-18/dashboard-1-2567-overview.png`
  - `docs/testing/exploratory/artifacts/bugbash-2025-12-18/sidebar-link-loses-semester.png`

### P1 — Student table grade selector labels are malformed and triggers 500s
- Impact: Admin cannot reliably view student timetables; dropdown options are confusing/invalid (e.g., `ม.1/0`, `ม.7/-1`), and selecting options triggers server 500 responses.
- Environment/URL: `/dashboard/1-2567/student-table`
- Repro:
  1. Open `/dashboard/1-2567/student-table`.
  2. Open the class selector dropdown.
  3. Observe invalid labels like `ม.1/0`, `ม.7/-1`.
  4. Select one option (example: `ม.1/0`) and observe console/network errors.
- Expected: meaningful class options like `ม.1/1`, `ม.1/2`, etc (aligned to grade level records) and no 500s.
- Actual: malformed labels and repeated console “Failed to load resource: 500”.
- Evidence:
  - `docs/testing/exploratory/artifacts/bugbash-2025-12-18/student-table-grade-dropdown-broken.png`
  - `docs/testing/exploratory/artifacts/bugbash-2025-12-18/student-table-m1-0.png`
  - `docs/testing/exploratory/artifacts/bugbash-2025-12-18/student-table-time-row-and-500.png`

### P1 — Intermittent teacher table load error + hydration error #418
- Impact: Admin sees “ไม่สามารถโหลดข้อมูลคาบเรียนได้” and React hydration errors; this can hide real defects and makes key dashboard views unreliable.
- Environment/URL: `/dashboard/1-2567/teacher-table`
- Repro:
  1. Navigate to `/dashboard/1-2567/teacher-table`.
  2. Observe intermittent error banner and console error #418.
- Expected: stable render and no hydration/runtime errors.
- Actual: intermittent UI error and console logs: `Minified React error #418`.
- Evidence:
  - `docs/testing/exploratory/artifacts/bugbash-2025-12-18/dashboard-teacher-table-error.png`

### P2 — Login page emits “Password field is not contained in a form” warning
- Impact: accessibility/autofill/Enter-to-submit behavior risk; console noise.
- Environment/URL: `/signin`
- Evidence:
  - (console-only; screenshot not required)
  - Also captured earlier in Session 1 notes.

### P1 — Logout appears broken (403 / session sticky) (from Session 1)
- Impact: cannot reliably log out; security/privacy risk on shared devices.
- Status: not re-validated in Session 2; keep as high-priority reconfirm.

## B) Automation Candidates

Top journeys to automate (Playwright):
1) Auth: invalid credentials → Thai error toast; no redirect; console must be clean.
2) Auth: admin login → dashboard → semester switch to `1-2567` → refresh persists session.
3) Dashboard sidebar routing: from `/dashboard/1-2567` click “แสดงตารางรวมครู” → assert URL stays semester-scoped.
4) Timetable timezone sanity: teacher-table and teacher-arrange should show `08:30` start (or match configured start time), not `01:30`.
5) Student table: dropdown options should be valid (no `/0` or negative) and selecting a class should not trigger 500s.
6) Management lists smoke: teacher/subject/rooms/gradelevel/program pages load and tables render without console errors.
7) Export entry points: all-timeslot export button exists; teacher-table/student-table export buttons enabled after selection.

Visual snapshots to add (stable/deterministic):
- `/signin` form (layout + error toast style)
- `/dashboard` semester picker tiles
- `/dashboard/1-2567/all-timeslot` “read-only” banner + export buttons
- `/management/teacher` table first page (mask dynamic values if needed)
- `/schedule/1-2567/arrange` “เลือกครูเพื่อเริ่มจัดตาราง” prompt + grid header


