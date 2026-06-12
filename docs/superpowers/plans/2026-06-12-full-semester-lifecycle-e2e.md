# Full Semester Lifecycle Cross-Role E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cross-role E2E coverage: admin publishes a term, teacher verifies it logged-in and via public view, student verifies via public class view; plus a draft-term role-boundary spec.

**Architecture:** Scenario A extends `e2e/25-publish-happy.spec.ts` (only environment with real PUBLISHED state; same file avoids test-ordering and config changes). Scenario B is a new main-suite spec against the default seed. Both need a seeded better-auth teacher login, mirroring the existing admin seeding.

**Tech Stack:** Playwright, better-auth (`auth.api.signUpEmail`), Prisma seed scripts, pnpm.

**Spec:** `docs/superpowers/specs/2026-06-12-full-semester-lifecycle-e2e-design.md`

**Verified facts (do not re-derive):**
- Public class route: `/classes/[gradeId]/[academicYear]/[semester]` (e.g. `/classes/M4-HAPPY-1/2568/1`). Grade param accepts `GradeID` string.
- Public teacher route: `/teachers/[id]`, numeric `TeacherID`. Publish-happy seed TRUNCATEs with RESTART IDENTITY → its teacher is always `TeacherID = 1`.
- `/management` layout: no session → redirect `/signin`; non-admin role → `forbidden()` (403).
- Sign-in lands on `/dashboard` (`SignInForm` callbackURL).
- Public data layer (`src/lib/infrastructure/repositories/public-data.repository.ts` `getCurrentTerm`, line ~201) picks the newest `table_config` with **no PUBLISHED filter** — drafts are publicly visible. Product bug, filed in Task 1; do NOT assert draft invisibility.
- Publish-happy world: admin `admin@school.local`/`ADMIN_PASSWORD ?? admin123`, teacher row `teacher.happy@school.ac.th`, grade `M4-HAPPY-1`, term `1-2568`, 5 MON slots, subjects `ท31101` etc.
- Default seed: teacher row `e2e.teacher@school.ac.th` with pinned responsibility `ค21201`/M1-1/1-2568; only auth user is admin.

---

### Task 1: File the public-drafts product bug

**Files:** none (tracker only)

- [ ] **Step 1: Create bead**

```bash
bd create --title="Public routes serve unpublished terms (no PUBLISHED filter)" \
  --description="src/lib/infrastructure/repositories/public-data.repository.ts getCurrentTerm() picks table_config by AcademicYear desc with no Status filter, so (public)/teachers and (public)/classes show DRAFT terms. Found while designing cross-role lifecycle E2E (spec docs/superpowers/specs/2026-06-12-full-semester-lifecycle-e2e-design.md). Decide: filter to PUBLISHED (fallback to latest published) or accept as product behavior and document." \
  --type=bug --priority=2
```

- [ ] **Step 2: Commit beads state**

```bash
git add .beads/issues.jsonl && git commit -m "chore(beads): file public-draft-visibility bug"
```

### Task 2: Seed teacher auth users (both seeds)

**Files:**
- Modify: `prisma/seed.ts` (after the admin-user block that ends with the "Admin user created" log, ~line 1502)
- Modify: `prisma/seed-publish-happy.ts` (`createAdmin` area, ~line 85)
- Modify: `.env.test` (after `ADMIN_PASSWORD=admin123`)

- [ ] **Step 1: Add teacher auth seeding to `prisma/seed.ts`**

Insert after the admin success log, before `// ===== SEEDING MODE SELECTION =====`:

```ts
// ===== TEACHER AUTH USER (E2E) =====
// Login for the pinned E2E teacher fixture (e2e.teacher@school.ac.th).
const teacherPassword = process.env.TEACHER_PASSWORD ?? "teacher123";
const teacherEmail = "e2e.teacher@school.ac.th";

const existingTeacherUser = await withRetry(
  () => prisma.user.findUnique({ where: { email: teacherEmail } }),
  "Check existing teacher user",
);
if (existingTeacherUser) {
  await withRetry(
    () =>
      prisma.account.deleteMany({
        where: { userId: existingTeacherUser.id },
      }),
    "Delete teacher accounts",
  );
  await withRetry(
    () => prisma.user.delete({ where: { id: existingTeacherUser.id } }),
    "Delete teacher user",
  );
}

const teacherSignUp = await auth.api.signUpEmail({
  body: {
    email: teacherEmail,
    password: teacherPassword,
    name: "E2E ทดสอบ",
  },
});
if (!teacherSignUp?.user) {
  throw new Error("Failed to create teacher user via better-auth API");
}
await withRetry(
  () =>
    prisma.user.update({
      where: { id: teacherSignUp.user.id },
      data: { role: "teacher", emailVerified: true },
    }),
  "Update teacher user role",
);
console.log(`✅ Teacher auth user created (${teacherEmail})`);
```

Note: `auth` is already imported above via `const { auth } = await import("../src/lib/auth.js")` — reuse that binding (the insert point is after it in the same scope).

- [ ] **Step 2: Add teacher auth seeding to `prisma/seed-publish-happy.ts`**

Extend `createAdmin` into a shared helper, or simplest: add below `createAdmin`:

```ts
async function createTeacherLogin() {
  const password = process.env.TEACHER_PASSWORD ?? "teacher123";
  const email = "teacher.happy@school.ac.th";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.account.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const { auth } = await import("../src/lib/auth.js");
  const result = await auth.api.signUpEmail({
    body: { email, password, name: "ทดสอบ เผยแพร่" },
  });
  if (!result?.user) {
    throw new Error("Failed to create teacher login via better-auth API");
  }
  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: "teacher", emailVerified: true },
  });
  console.log(`✅ Teacher login ready (${email})`);
}
```

And call it in `main()` right after `await createAdmin();`:

```ts
await createAdmin();
await createTeacherLogin();
```

- [ ] **Step 3: Add password to `.env.test`**

```
TEACHER_PASSWORD=teacher123
```

(`.env.test.local` is gitignored and generated; the publish-happy setup loads `.env.test.local` — the `?? "teacher123"` fallback covers it. Do not commit secrets beyond this test-only default, same trust level as `ADMIN_PASSWORD`.)

- [ ] **Step 4: Verify seed runs clean**

Run: `pnpm dev:db:up && pnpm test:db:migrate && pnpm test:db:seed`
Expected: log lines `✅ Admin user created…` and `✅ Teacher auth user created (e2e.teacher@school.ac.th)`, exit 0.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts prisma/seed-publish-happy.ts .env.test
git commit -m "feat(seed): teacher auth logins for cross-role E2E"
```

### Task 3: Shared role-login helper

**Files:**
- Create: `e2e/helpers/login.ts`

- [ ] **Step 1: Write the helper**

```ts
import { expect, type Browser, type Page } from "@playwright/test";

export type RoleCredentials = { email: string; password: string };

export const TEACHER_E2E: RoleCredentials = {
  email: "e2e.teacher@school.ac.th",
  password: process.env.TEACHER_PASSWORD ?? "teacher123",
};

export const TEACHER_HAPPY: RoleCredentials = {
  email: "teacher.happy@school.ac.th",
  password: process.env.TEACHER_PASSWORD ?? "teacher123",
};

/**
 * Fresh, storage-state-free context logged in via the real signin UI.
 * Caller owns the context: `const { page, context } = await loginAs(...)`,
 * then `await context.close()` when done.
 */
export async function loginAs(browser: Browser, creds: RoleCredentials) {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  await page.goto("/signin");
  await page.getByLabel(/อีเมล|email/i).fill(creds.email);
  await page.getByLabel(/รหัสผ่าน|password/i).fill(creds.password);
  await page.getByRole("button", { name: /เข้าสู่ระบบ|sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  return { context, page };
}
```

Implementation note: before relying on the selectors, open `e2e/full-user-journey.spec.ts` "1. Authentication" test and copy its exact, already-green signin selectors if they differ from the above. The helper must use the same selectors that spec uses.

- [ ] **Step 2: Commit**

```bash
git add e2e/helpers/login.ts
git commit -m "test(e2e): shared role-login helper"
```

### Task 4: Scenario A — cross-role verification after publish

**Files:**
- Modify: `e2e/25-publish-happy.spec.ts` (append describe block at end)

- [ ] **Step 1: Append the cross-role block**

```ts
import { TEACHER_HAPPY, loginAs } from "./helpers/login";

// (merge with existing imports at top of file)

test.describe("cross-role verification after publish", () => {
  // Runs after the publish test in this file (Playwright preserves
  // in-file order with a single worker; this project runs serially).

  test("teacher sees own published schedule when logged in", async ({
    browser,
  }) => {
    const { context, page } = await loginAs(browser, TEACHER_HAPPY);
    try {
      await page.goto("/dashboard/2568/1/teacher-table");
      // Own name renders (teacher-scoped view).
      await expect(
        page.getByText(/ทดสอบ\s*เผยแพร่/).first(),
      ).toBeVisible({ timeout: 15000 });
      // A seeded subject from the published term renders.
      await expect(page.getByText(/ท31101|ภาษาไทย/).first()).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("public teacher page shows the published schedule without auth", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    try {
      // Mini-seed truncates with RESTART IDENTITY -> TeacherID 1.
      await page.goto("/teachers/1");
      await expect(
        page.getByText(/ทดสอบ\s*เผยแพร่/).first(),
      ).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/ท31101|ภาษาไทย/).first()).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test("public class page shows the published schedule without auth", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    try {
      await page.goto("/classes/M4-HAPPY-1/2568/1");
      await expect(page.getByText(/ท31101|ภาษาไทย/).first()).toBeVisible({
        timeout: 15000,
      });
    } finally {
      await context.close();
    }
  });

  test("teacher session is forbidden from /management", async ({
    browser,
  }) => {
    const { context, page } = await loginAs(browser, TEACHER_HAPPY);
    try {
      const response = await page.goto("/management/teacher");
      expect(response?.status()).toBe(403);
    } finally {
      await context.close();
    }
  });
});
```

Implementation notes:
- Confirm the exact dashboard teacher-table URL segment by listing `src/app/dashboard/[academicYear]/[semester]/` — use the real folder name.
- If the publish-happy project config sets `fullyParallel`, wrap the whole file (existing + new tests) with `test.describe.configure({ mode: "serial" })` so cross-role tests run after publish.
- Text assertions: prefer the seeded Thai strings above; adjust to actual rendered DOM on first run, but keep assertions on *content*, not styling.

- [ ] **Step 2: Run the publish-happy suite**

Run: `pnpm test:e2e:publish-happy`
Expected: existing publish test + 4 new tests PASS. First run will likely need selector adjustments — fix selectors, not the product.

- [ ] **Step 3: Commit**

```bash
git add e2e/25-publish-happy.spec.ts
git commit -m "test(e2e): cross-role verification after publish (teacher + public views)"
```

### Task 5: Scenario B — draft-term role boundaries (main suite)

**Files:**
- Create: `e2e/28-draft-role-visibility.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from "@playwright/test";
import { TEACHER_E2E, loginAs } from "./helpers/login";

/**
 * Role boundaries around the default (unpublished) seed world.
 *
 * NOTE: public draft-invisibility is deliberately NOT asserted —
 * getCurrentTerm() has no PUBLISHED filter (known product bug, see bead
 * filed from the 2026-06-12 lifecycle spec). If that bug is fixed,
 * extend this spec with the draft-absence assertions from the spec doc.
 */
test.describe("draft-term role visibility", () => {
  test("teacher can sign in and reach own dashboard view", async ({
    browser,
  }) => {
    const { context, page } = await loginAs(browser, TEACHER_E2E);
    try {
      await page.goto("/dashboard/2568/1/teacher-table");
      await expect(page.getByText(/E2E\s*ทดสอบ/).first()).toBeVisible({
        timeout: 15000,
      });
    } finally {
      await context.close();
    }
  });

  test("teacher is forbidden from management routes", async ({ browser }) => {
    const { context, page } = await loginAs(browser, TEACHER_E2E);
    try {
      const response = await page.goto("/management/teacher");
      expect(response?.status()).toBe(403);
    } finally {
      await context.close();
    }
  });

  test("anonymous user is redirected from management to signin", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    try {
      await page.goto("/management/teacher");
      await expect(page).toHaveURL(/\/signin/, { timeout: 15000 });
    } finally {
      await context.close();
    }
  });

  test("public class page for the seeded grade renders", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    try {
      await page.goto("/classes/M1-1/2568/1");
      // Page resolves the grade (does not 404) — content-level assertion
      // is intentionally loose while the term is a draft.
      await expect(page.getByText(/ม\.1\/1|M1-1/).first()).toBeVisible({
        timeout: 15000,
      });
    } finally {
      await context.close();
    }
  });
});
```

- [ ] **Step 2: Run the spec (server + test DB must be up)**

Run: `pnpm dev:e2e` (separate terminal, against test DB) then
`pnpm exec playwright test e2e/28-draft-role-visibility.spec.ts --project=chromium --timeout=150000`
Expected: 4 PASS. Adjust selectors to rendered reality; keep assertion intent.

- [ ] **Step 3: Commit**

```bash
git add e2e/28-draft-role-visibility.spec.ts
git commit -m "test(e2e): draft-term role-boundary journey"
```

### Task 6: Full verification + push

- [ ] **Step 1: Quality gates**

Run: `pnpm typecheck && pnpm lint`
Expected: clean (0 errors).

- [ ] **Step 2: Run both E2E surfaces**

Run: `pnpm test:e2e:publish-happy` and the main-suite single-file run from Task 5.
Expected: all green.

- [ ] **Step 3: Update bead + push**

```bash
bd create --title="Extend 28-draft spec with draft-absence assertions once public PUBLISHED filter ships" --type=task --priority=3
git add .beads/issues.jsonl
git commit -m "chore(beads): follow-up for draft-absence assertions"
git pull --rebase && git push
```
