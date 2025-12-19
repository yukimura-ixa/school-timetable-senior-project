# TITLE

Exploratory Bug Bash Charter (60–90 min): “Real Admin” Production Walkthrough + Visual Evidence
Project: https://github.com/yukimura-ixa/school-timetable-senior-project/

ROLE (act like a real person)
You are the School Timetable System Administrator for a secondary school preparing next term. You have authority to create/edit teachers, rooms, subjects, classes, and timetables. Your mindset is: “ship-safe, no surprises.”

GOAL
Run a time-boxed (fixed-duration) exploratory bug bash session to learn the product fast while uncovering high-impact defects and UX traps, then convert the best findings into actionable bug reports + candidate Playwright visual tests.

TARGET
Production (preferred) or the deployed environment used by the team.
If production is protected, use the same environment that real admins use (no dev-bypass unless the team explicitly allows it).
Base URL: use the project’s known deployment (e.g., the Vercel dev URL shown in the repo) or what the runner provides.

TOOLS / CONSTRAINTS

- Use Playwright MCP to drive the browser like a user. Capture screenshots/video/trace as evidence.
- Do NOT use destructive actions that would harm real data. If you must create records, tag them clearly (e.g., “ZZ-TEST-\*”) and clean up afterward if safe.
- Keep a running session log: Notes, Bugs, Issues, Follow-ups.

SESSION STRUCTURE (pick 75–90 minutes total) 0) 5 min — Setup

- Confirm environment + login works.
- Start Playwright tracing/video.
- Confirm you can identify test data vs real data.

1. 10 min — Recon / “Map the Product”
   - Navigate the main admin areas.
   - Identify core objects (teachers/classes/rooms/subjects/timetables) and their CRUD flows.

2. 50–60 min — Execute the 3 Micro-Charters (in order)
   Charter A: “Admin Day-0 Setup Tour”
   - Create or verify: teachers, rooms, subjects, classes.
   - Stress common admin behaviors: bulk-ish entry patterns, search/filter/sort, pagination, validation, required fields.
   - Edge cases: Thai names, long strings, special characters, duplicate names/codes, missing required fields.

   Charter B: “Scheduling & Conflict Tour”
   - Create/edit a timetable and attempt realistic assignments.
   - Try to trigger conflicts: same teacher two rooms same time, room collision, class collision.
   - Verify the system prevents conflicts (or explains them clearly).
   - Observe performance and UI responsiveness during heavier operations.

   Charter C: “Operational Change / Last-Minute Chaos Tour”
   Scenario: Monday 07:10, a teacher is absent and a room becomes unavailable.
   - Swap teachers, move rooms, adjust periods.
   - Verify downstream impact: conflicts re-check, updated views, printing/export views, and any “summary” or “report” pages.
   - Look for stale UI (data not refreshing), partial saves, or silent failures.

3. 10–15 min — Consolidate + Debrief Package
   - Deduplicate issues.
   - Rank severity and business impact.
   - Propose what to automate as Playwright tests (especially visual snapshots on the most fragile screens).

WHAT TO LOOK FOR (heuristics)

- Permissions & role leakage (can you access admin-only pages as non-admin?).
- Data integrity (saving wrong relationships, partial updates).
- UX clarity (error messages, confirmations, “are you sure?” moments).
- Reliability (flaky navigation, stuck loading, race conditions).
- Accessibility basics (keyboard navigation, focus traps) and responsive layout regressions.

BUG REPORT FORMAT (make it dev-ready)
For each bug:

- Title
- Severity (P0/P1/P2) + Impact (plain language)
- Environment + URL
- Repro steps (numbered, minimal)
- Expected vs Actual
- Evidence (screenshot/trace/video)
- Suspected area (optional) + suggested fix direction (optional)

FINAL OUTPUT (single markdown report)
A) Session Report (SBTM-style)

- Charter (mission statement)
- Timebox used + what you covered
- Notes (learning)
- Issues (questions/risks)
- Bugs (with links/evidence)
- Follow-ups (next charters)

B) “Automation Candidates”

- 5–10 top journeys to turn into Playwright tests
- 3–5 pages/components for visual snapshots (stable selectors, deterministic data notes)

DEFINITION CHECK (keep shared language)

- “Time-boxed” = fixed duration; stop when time ends.
- “Triage” = quickly sorting issues by severity/priority so the team acts fast.
- “Charter” = a focused mission for what you will explore in this session.
