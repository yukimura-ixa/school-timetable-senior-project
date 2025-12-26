# Testing Strategy – Phrasongsa Timetable

This document defines the testing strategy for the timetable project:

- Unit tests (Jest)
- Integration tests (where applicable)
- E2E tests (Playwright)
- CI-first execution model

It expands the brief testing rules from `AGENTS.md`.

---

## 1. Testing Philosophy

We follow a **test pyramid**:

1. **Unit tests** – business logic, validation, store reducers, pure functions.
2. **Integration tests** – repository + Prisma, selected server actions, critical APIs.
3. **E2E tests** – full flows for critical user journeys only.

Key principles:

- Use the **lowest level** that proves the behavior.
- Keep tests **fast, deterministic, and meaningful**.
- Avoid fragile E2E tests for behavior that can be unit-tested.

---

## 2. CI-First Model

- CI (GitHub Actions) runs:
  - lint
  - typecheck
  - unit tests
  - E2E tests
  - build
- Local full test runs are **optional**, not mandatory.

Preferred workflow:

1. Implement using MCP tools (Context7 + Serena) for facts and repo context.
2. Add/update relevant tests.
3. Commit and push.
4. Use CI logs to debug and only run narrow local tests when needed.

Agents should **not** suggest pre-commit / pre-push hooks or “always run all tests locally” as the default.

---

## 3. Unit Tests (Jest)

### 3.1 Scope

Use unit tests for:

- SubjectCode validation (Thai MOE rules)
- Curriculum credit/hour rules
- Timetable conflict detection
- Domain entities and mappers
- Validation schemas (Valibot)
- Pure utility functions

### 3.2 Patterns

Use AAA (Arrange–Act–Assert) and table-driven tests.

Example structure (pseudo-code):

- Describe the function name.
- Arrange inputs clearly.
- Act by calling the function.
- Assert on return values and side effects.

For SubjectCode, for example:

- Valid code for each learning area and level.
- Invalid formats (wrong letters, wrong digits, wrong length).
- Edge cases around boundaries (minimum/maximum credits, etc.).

Mocking guidelines:

- Mock Prisma and external APIs at **module boundaries** only.
- Reset mocks between tests (`beforeEach`).

---

## 4. Integration Tests

Use integration tests for cases where behavior depends on:

- Real database semantics (constraints, relations)
- Server actions that combine validation + DB operations
- Important API endpoints

Guidelines:

- Prefer Testcontainers or an equivalent approach to run Postgres in tests.
- Use realistic seed data mirroring MOE-style subject codes and credits.
- Keep integration test suites focused and not too broad.

---

## 5. E2E Tests (Playwright)

### 5.1 What E2E should cover

Reserve E2E tests for **critical journeys**:

- Login / logout / session handling
- Admin:
  - configure semester
  - create timetable
  - verify MOE compliance
  - publish timetable
- Teacher:
  - view timetable
  - verify own load
  - export personal schedule (PDF/Excel)
- Student:
  - view timetable (read-only)
- Export flows (PDF/Excel) for timetables
- Key MOE compliance behavior:
  - non-compliant timetable is blocked from publishing
  - clear Thai-language error messages for the user

### 5.2 Reliability rules

- Avoid `waitForTimeout()` except in explicitly-marked visual/manual specs.
- Always assert visibility/enabled before clicking.
- Prefer `data-testid` and semantic roles (e.g. `getByRole`) over brittle CSS selectors.
- Keep specs short and focused; tag titles with intent:
  - `[journey]`, `[smoke]`, `[a11y]`, `[visual]`, `[flaky]`.

Example intent:

- `"[journey] admin publishes compliant timetable"`
- `"[journey] teacher exports personal timetable PDF"`

---

## 6. MOE-Specific Testing

Because MOE compliance is critical:

- Unit tests must assert:
  - correct SubjectCode patterns for each learning area and level.
  - correct credit/hour totals per grade and learning area (min/max thresholds).
- E2E tests must assert:
  - non-compliant timetables **cannot** be published.
  - user-facing reasons are visible and in Thai.
  - admin cannot bypass these checks through the UI.

These tests are considered **blocking**; do not disable them just to “get green”.

---

## 7. Test Data & Seeds

- Keep a consistent schema for seeded data:
  - semesters: e.g. `1-2567`, `2-2567`, etc.
  - realistic teachers, rooms, subjects using MOE-style SubjectCodes.
- E2E tests should rely on **stable seed data**, not random data.
- When seeds change in meaning (not just content), update:
  - E2E tests
  - any references in this doc if assumptions change.

---

## 8. Flakiness Management

When an E2E test flakes:

1. Re-run it with trace/video enabled.
2. Fix root causes (locators, incorrect waits, timing) before increasing retries.
3. If failures show a persistent loading state ("กำลังโหลด…" / "กำลังโหลดข้อมูล..."),
   verify semester/config data is available and wait for loading indicators to disappear
   before asserting tables or page structure.
4. Use retries in CI (e.g. `retries: 1–2`) **only** as a backup, not as a band-aid.

Long-term flaky tests:

- Isolate into their own files or tag with `[flaky]`.
- File a GitHub issue with:
  - stack traces
  - screenshots
  - trace links
  - hypothesis on root cause.

---

## 9. Agent Checklist (per change)

Before merging a change that affects logic:

1. Decide the **lowest** appropriate test level (unit / integration / E2E).
2. Use Context7 + Serena to locate existing tests and patterns.
3. Add/update tests to cover the new behavior and edge cases.
4. Optionally run targeted tests locally for fast feedback.
5. Push and let CI validate the full pipeline.
6. If CI fails, use logs and artifacts (HTML report, traces) to debug and fix.
