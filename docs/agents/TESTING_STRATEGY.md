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
2. **Integration tests** – repository + Prisma, key server actions, API endpoints.
3. **E2E tests** – full flows for critical user journeys only.

Key principles:​:contentReference[oaicite:9]{index=9}

- Use the **lowest level** that proves the behavior.
- Keep tests **fast, deterministic, and meaningful**.
- Avoid fragile E2E tests for things that can be unit-tested.

---

## 2. CI-First Model

- CI (GitHub Actions) runs:
  - lint
  - typecheck
  - unit tests
  - E2E tests
  - build
- Local full test runs are **optional**, not mandatory.
- Preferred workflow:
  - Implement using MCP (Context7 + Serena).
  - Add/update relevant tests.
  - Commit and push.
  - Use CI logs to debug failures.

Agents should **not** suggest pre-commit hooks or “always run all tests locally”
as standard practice.

---

## 3. Unit Tests (Jest)

### 3.1 Scope

Use unit tests for:

- SubjectCode validation
- Curriculum credit/hour rules
- Timetable conflict detection
- Domain entities & mappers
- Validation schemas (Valibot)
- Small pure utility functions

### 3.2 Patterns

- Use AAA (Arrange–Act–Assert).
- Use table-driven tests for multiple scenarios.
- Mock Prisma and external APIs at **module boundary** only.

Example patterns (pseudocode):

```ts
describe("validateSubjectCode", () => {
  const cases = [
    { code: "ท21101", learningArea: "THAI", level: "มัธยมต้น", valid: true },
    { code: "TH101", learningArea: "THAI", level: "มัธยมต้น", valid: false },
  ];

  it.each(cases)(
    "validates $code (expected: $valid)",
    ({ code, learningArea, level, valid }) => {
      const result = validateSubjectCode(code, learningArea, level);
      expect(result.valid).toBe(valid);
    },
  );
});
4. Integration Tests
Where appropriate, use integration tests for:

Prisma repositories against a real or containerized Postgres.

Server actions / APIs that combine validation + DB operations.

Business flows that depend on DB constraints (e.g. unique keys).

Guidelines:

Prefer Testcontainers or equivalent for DB realism.

Use realistic seed data that mirrors MOE structure (SubjectCode, credits).

5. E2E Tests (Playwright)
5.1 What E2E should cover
Reserve E2E tests for critical journeys:

Login / logout / session handling

Admin: configure semester, create timetable, publish

Teacher: view timetable, check load, export personal schedule

Student: view timetable (read-only)

Export flows (PDF/Excel) for timetables

Key MOE compliance behaviors:

blocked publish when curriculum invalid

error messages visible in Thai

5.2 Reliability rules
No waitForTimeout() except in explicitly marked visual/manual specs.

Always assert visibility/enabled before clicking.

Prefer data-testid and semantic roles over brittle selectors.

Use small, focused specs tagged with intent:

[journey], [smoke], [a11y], [visual].

Example:

ts
Copy code
test("[journey] admin publishes compliant timetable", async ({ page }) => {
  await page.goto("/login");
  // login steps ...
  await page.goto("/dashboard/1-2567/review");
  await expect(page.getByText("หลักสูตรครบถ้วนตามเกณฑ์ สพฐ.")).toBeVisible();
  await page.getByRole("button", { name: /เผยแพร่ตารางเรียน/i }).click();
  await expect(page.getByText("เผยแพร่สำเร็จ")).toBeVisible();
});
6. MOE-Specific Testing
Because MOE compliance is critical:

Unit tests must assert:

correct SubjectCode patterns for each learning area/level.

credit/hour minimums per grade and learning area.

E2E tests must assert:

non-compliant timetables cannot be published.

user-facing reasons are clear and in Thai.

These tests are considered blocking; do not “comment them out” to push a release.

7. Test Data & Seeds
Keep consistent schema of seeded data:

semesters: 1–2567, 2–2567, etc.

representative set of teachers, rooms, subjects with real MOE-style codes.

E2E tests should refer to known, stable IDs/labels from seeds only.

When updating seeds, update E2E tests and this doc if semantics change.

8. Flakiness Management
If an E2E test flakes:

Re-run with trace/video enabled.

Fix root cause (locators, timing) before adding retries.

Retries are allowed in CI (e.g. retries: 2) but must not mask genuine bugs.

Long-term flaky tests:

Isolate into a separate spec or mark as [flaky] and file an issue.

9. Agent Checklist (per change)
For any change that touches logic:

Identify where the logic belongs (unit / integration / E2E).

Use Context7 + Serena to find existing tests and patterns.

Add/update tests at the lowest appropriate level.

Run targeted tests locally if needed (not entire suite).

Push and let CI validate end-to-end.
```
