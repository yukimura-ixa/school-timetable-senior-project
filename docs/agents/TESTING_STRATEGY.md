# Testing Strategy – Phrasongsa Timetable

Doc defines testing strategy for timetable project:

- Unit tests (Jest)
- Integration tests (where applicable)
- E2E tests (Playwright)
- CI-first execution model

Expands brief testing rules from `AGENTS.md`.

---

## 1. Testing Philosophy

Follow **test pyramid**:

1. **Unit tests** – business logic, validation, store reducers, pure functions.
2. **Integration tests** – repository + Prisma, selected server actions, critical APIs.
3. **E2E tests** – full flows for critical user journeys only.

Key principles:

- Use **lowest level** that proves behavior.
- Tests **fast, deterministic, meaningful**.
- No fragile E2E for behavior unit-testable.

---

## 2. CI-First Model

- CI (GitHub Actions) runs:
  - lint
  - typecheck
  - unit tests
  - E2E tests
  - build
- Local full test runs **optional**, not mandatory.

Preferred workflow:

1. Implement with MCP tools (Context7 + Serena) for facts + repo context.
2. Add/update relevant tests.
3. Commit, push.
4. Debug via CI logs; narrow local tests only when needed.

Agents must **not** suggest pre-commit / pre-push hooks or "always run all tests locally" as default.

---

## 3. Unit Tests (Jest)

### 3.1 Scope

Unit tests for:

- SubjectCode validation (Thai MOE rules)
- Curriculum credit/hour rules
- Timetable conflict detection
- Domain entities, mappers
- Validation schemas (Valibot)
- Pure utility functions

### 3.2 Patterns

AAA (Arrange–Act–Assert) + table-driven tests.

Example structure (pseudo-code):

- Describe function name.
- Arrange inputs clear.
- Act: call function.
- Assert return values + side effects.

SubjectCode example:

- Valid code per learning area + level.
- Invalid formats (wrong letters, wrong digits, wrong length).
- Edge cases at boundaries (min/max credits, etc.).

Mocking:

- Mock Prisma + external APIs at **module boundaries** only.
- Reset mocks between tests (`beforeEach`).

---

## 4. Integration Tests

Integration tests when behavior depends on:

- Real database semantics (constraints, relations)
- Server actions combining validation + DB operations
- Important API endpoints

Guidelines:

- Prefer Testcontainers or equivalent for Postgres in tests.
- Realistic seed data mirroring MOE-style subject codes + credits.
- Keep suites focused, not too broad.

---

## 5. E2E Tests (Playwright)

### 5.1 What E2E should cover

Reserve E2E for **critical journeys**:

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
  - non-compliant timetable blocked from publishing
  - clear Thai-language error messages for user

### 5.2 Reliability rules

- No `waitForTimeout()` except explicitly-marked visual/manual specs.
- Always assert visibility/enabled before click.
- Prefer `data-testid` + semantic roles (e.g. `getByRole`) over brittle CSS selectors.
- Specs short, focused; tag titles with intent:
  - `[journey]`, `[smoke]`, `[a11y]`, `[visual]`, `[flaky]`.

Example intent:

- `"[journey] admin publishes compliant timetable"`
- `"[journey] teacher exports personal timetable PDF"`

---

## 6. MOE-Specific Testing

MOE compliance critical:

- Unit tests assert:
  - correct SubjectCode patterns per learning area + level.
  - correct credit/hour totals per grade + learning area (min/max thresholds).
- E2E tests assert:
  - non-compliant timetables **cannot** publish.
  - user-facing reasons visible, in Thai.
  - admin cannot bypass checks through UI.

Tests **blocking**; never disable just to "get green".

---

## 7. Test Data & Seeds

- Consistent schema for seeded data:
  - semesters: e.g. `1-2567`, `2-2567`, etc.
  - realistic teachers, rooms, subjects with MOE-style SubjectCodes.
- E2E tests rely on **stable seed data**, not random.
- Seeds change in meaning (not just content) → update:
  - E2E tests
  - references in this doc if assumptions change.

---

## 8. Flakiness Management

E2E test flakes:

1. Re-run with trace/video enabled.
2. Fix root causes (locators, wrong waits, timing) before increasing retries.
3. Failures show persistent loading state ("กำลังโหลด…" / "กำลังโหลดข้อมูล...") →
   verify semester/config data available, wait for loading indicators disappear
   before asserting tables or page structure.
4. CI retries (e.g. `retries: 1–2`) **only** backup, not band-aid.

Long-term flaky tests:

- Isolate into own files or tag `[flaky]`.
- File GitHub issue with:
  - stack traces
  - screenshots
  - trace links
  - root-cause hypothesis.

---

## 9. Agent Checklist (per change)

Before merging change that affects logic:

1. Decide **lowest** test level (unit / integration / E2E).
2. Context7 + Serena to locate existing tests + patterns.
3. Add/update tests for new behavior + edge cases.
4. Optional: run targeted tests locally for fast feedback.
5. Push; CI validates full pipeline.
6. CI fails → use logs + artifacts (HTML report, traces) to debug + fix.