# CI Troubleshooting Guide

> **Quick reference for debugging GitHub Actions failures**

## Table of Contents

- [Common Failures](#common-failures)
- [Lint & Type Check Failures](#lint--type-check-failures)
- [Unit Test Failures](#unit-test-failures)
- [Build Failures](#build-failures)
- [E2E Test Failures](#e2e-test-failures)
- [Environment & Setup Issues](#environment--setup-issues)
- [Debugging Strategies](#debugging-strategies)

---

## Common Failures

### Dependency Installation Failures

**Symptom:** `pnpm install` fails or hangs

```
ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE
```

**Solution:**

```bash
# Locally: Update lockfile
pnpm install

# Commit updated pnpm-lock.yaml
git add pnpm-lock.yaml
git commit -m "chore: update pnpm lockfile"
git push
```

**Prevention:** Run `pnpm install` after pulling changes that modify `package.json`

---

### Prisma Client Generation Failures

**Symptom:** `pnpm prisma generate` fails

```
Error: Cannot find module '@/prisma/generated/client'
```

**Solution:**

```bash
# Check schema syntax
pnpm prisma validate

# Regenerate client locally
pnpm prisma generate

# If schema changed, commit the schema
git add prisma/schema.prisma
git commit -m "feat: update database schema"
git push
```

**Prevention:** Always run `pnpm prisma generate` after schema changes

---

### Environment Variable Issues

**Symptom:** Missing `DATABASE_URL`, `AUTH_SECRET`, etc.

```
Error: Environment variable DATABASE_URL is not set
```

**Solution:** Check `.github/workflows/*.yml` for required env vars

**CI Environment Variables:**
- `DATABASE_URL` - Set per-job in workflows
- `AUTH_SECRET` - Dummy value for build (`build-time-secret`)
- `AUTH_GOOGLE_ID` - Dummy value (`dummy-client-id`)
- `AUTH_GOOGLE_SECRET` - Dummy value (`dummy-client-secret`)
- `NEXT_TELEMETRY_DISABLED=1` - Always set to avoid telemetry
- `NODE_ENV=test` - For test jobs

**Prevention:** Never rely on `.env` files in CI (they're not committed)

---

## Lint & Type Check Failures

### ESLint Errors

**Symptom:** `pnpm lint` fails

```
error  'foo' is defined but never used  @typescript-eslint/no-unused-vars
```

**Solution:**

```bash
# Run lint locally with auto-fix
pnpm lint:fix

# If auto-fix doesn't work, manually fix the issues
# Then commit the fixes
git add .
git commit -m "fix: resolve linting errors"
git push
```

**Common Issues:**
- Unused imports → Remove them
- Missing dependencies in `useEffect` → Add to deps array
- `any` types → Add proper types (see `AGENTS.md` for typing standards)

---

### TypeScript Type Errors

**Symptom:** `pnpm typecheck` fails

```
error TS2322: Type 'string' is not assignable to type 'number'.
```

**Solution:**

```bash
# Run type-check locally
pnpm typecheck

# Fix type errors in IDE (VS Code shows red squiggles)
# Commit fixes
git add .
git commit -m "fix: resolve type errors"
git push
```

**Common Issues:**
- Missing type annotations → Add explicit types
- Incorrect prop types → Check component interfaces
- Prisma type mismatches → Regenerate client (`pnpm prisma generate`)

---

### Jest Setup Linting (Historical Issue - RESOLVED)

**Symptom:** `jest.setup.js` linting errors (9 errors)

**Status:** ✅ **RESOLVED** - Migrated to `jest.setup.ts` with TypeScript

**Details:** See conversation history or commit `9e1459d`

---

## Unit Test Failures

### Test Execution Failures

**Symptom:** `pnpm test` exits with errors

```
FAIL __test__/features/teacher/export.test.ts
  ● Export Teacher PDF › should generate valid PDF
    TypeError: Cannot read properties of undefined (reading 'id')
```

**Solution:**

```bash
# Run specific test file locally
pnpm test __test__/features/teacher/export.test.ts

# Debug with verbose output
pnpm test --verbose

# Fix the test or implementation
# Commit fixes
git add .
git commit -m "test: fix teacher export test"
git push
```

**Common Issues:**
- Mock setup issues → Check `jest.setup.ts` for proper mocks
- Prisma mock conflicts → Ensure single `jest.mock('@/lib/prisma')` declaration
- Missing test data → Add fixtures or seed data in test

---

### Jest Stack Overflow (Issue #46)

**Symptom:** Tests pass but process hangs indefinitely

**Status:** ✅ **WORKAROUND APPLIED** - `forceExit: true` in `jest.config.ts`

**Details:**
- Next.js 16.0.1 + Jest incompatibility
- Unhandled rejection handler causes `setImmediate` recursion
- Workaround: `forceExit: true` (lines 34-37 of `jest.config.ts`)
- See `nextjs_16_jest_stack_overflow_issue` memory or Issue #46

**What NOT to do:**
- ❌ Remove `forceExit` flag
- ❌ Try to mock Next.js rejection module
- ❌ Wrap `setImmediate`

**Long-term:** Wait for Next.js 16.1+ upstream fix

---

### Test Coverage Issues

**Symptom:** Coverage reports missing or incomplete

**Solution:**

```bash
# Generate coverage locally
pnpm test --coverage

# Check coverage thresholds in jest.config.ts
# CI uploads coverage to artifacts automatically
```

**CI Artifacts:** Coverage reports saved for 30 days in GitHub Actions artifacts

---

## Build Failures

### Next.js Build Errors

**Symptom:** `pnpm build` fails

```
Error: Build failed because of TypeScript errors.
```

**Solution:**

```bash
# Run build locally (catches issues faster)
pnpm build

# Check specific error in output
# Fix TypeScript errors, then rebuild
pnpm typecheck  # Verify types
pnpm build      # Verify build
git add .
git commit -m "fix: resolve build errors"
git push
```

**Common Issues:**
- Type errors in pages/components → Fix types
- Missing environment variables → Check `next.config.mjs`
- Import errors → Check path aliases (`@/...`)

---

### Cache Components Mode Issues

**Symptom:** Errors related to `cacheComponents` flag

**Status:** ✅ Project uses Cache Components mode (Next.js 16)

**Solution:** See `nextjs_cache_components_deep_knowledge` memory

**Common Issues:**
- Missing `Suspense` boundaries → Add `<Suspense>` wrappers
- Async components without `"use cache"` → Add directive if needed
- Hydration mismatches → Check server/client component split

---

### Bundle Size Issues

**Symptom:** Build succeeds but bundle is too large

**Solution:**

```bash
# Analyze bundle locally (if configured)
pnpm analyze

# Check for large dependencies
# Use dynamic imports for heavy libraries
const { default: jsPDF } = await import('jspdf');
```

---

## E2E Test Failures

### Playwright Test Failures

**Symptom:** E2E tests fail in CI but pass locally

**Common Causes:**
1. **Timing issues** - CI is slower than local
2. **Database state** - Seed data mismatch
3. **Environment variables** - Missing `ENABLE_DEV_BYPASS` flags
4. **Browser differences** - Chromium vs local browser

**Solution:**

```bash
# Run E2E tests locally with same config
pnpm test:e2e

# Use Playwright UI mode for debugging
pnpm test:e2e:ui

# Check test artifacts in CI (uploaded on failure)
# Download from GitHub Actions → Artifacts → test-results-shard-X
```

---

### Database Seeding Issues

**Symptom:** E2E tests fail with "Record not found"

```
Error: No teacher with id=1 found
```

**Solution:**

Check `.github/workflows/e2e-tests.yml`:

```yaml
- name: Seed test database
  run: pnpm db:seed:clean
  env:
    SEED_FOR_TESTS: "true"
    SEED_CLEAN_DATA: "true"
```

**Verify seed data:**
- 56 teachers created
- 82 subjects created
- 3 semesters (1-2567, 2-2567, 1-2568)

**Reference:** `prisma/seed.ts` for expected data

---

### Authentication Bypass Issues

**Symptom:** E2E tests can't bypass auth

```
Error: Login button not found
```

**Solution:**

Ensure **BOTH** environment variables are set in workflow:

```yaml
env:
  ENABLE_DEV_BYPASS: "true"              # Server-side check
  NEXT_PUBLIC_ENABLE_DEV_BYPASS: "true"  # Client-side visibility
```

**Why both?**
- `ENABLE_DEV_BYPASS` - Server Action auth bypass
- `NEXT_PUBLIC_ENABLE_DEV_BYPASS` - Button visibility (build-time inline)

---

### Playwright Timeout Issues

**Symptom:** Tests timeout waiting for elements

```
Error: Timeout 30000ms exceeded
```

**Solution:**

Use E2E reliability patterns from `E2E_RELIABILITY_GUIDE.md`:

```typescript
// ✅ GOOD: Assert visibility before click
const submit = page.getByRole('button', { name: /บันทึก|save/i });
await expect(submit).toBeVisible({ timeout: 5000 });
await expect(submit).toBeEnabled();
await submit.click();

// ❌ BAD: Blind click
await page.click('button[type="submit"]');
```

**Anti-patterns to avoid:**
- `waitForTimeout()` (except `visual-inspection.spec.ts`)
- Blind `page.click()` without visibility checks
- Blanket `waitForLoadState('networkidle')`

---

### Flaky E2E Tests

**Symptom:** Tests pass/fail inconsistently

**Solution:**

1. **Check CI artifacts** - Download Playwright reports
2. **Use retries** - CI configured with `retries: 2`
3. **Review reliability patterns** - See `E2E_RELIABILITY_GUIDE.md`
4. **File GitHub issue** - If flake persists, downshift to integration test

**Current E2E metrics (Nov 2025):**
- Phase A: 210/210 `waitForTimeout` calls removed ✅
- Phase B: DnD and management flows stabilized
- Target: <2% flake rate

---

## Environment & Setup Issues

### Node Version Mismatches

**Symptom:** Different behavior locally vs CI

**Solution:**

```bash
# Check CI Node version (workflow files)
# .github/workflows/ci.yml: node-version: '20'

# Match locally
node -v  # Should be v20.x.x

# Use nvm/fnm to switch versions
nvm use 20
# or
fnm use 20
```

---

### PNPM Version Issues

**Symptom:** `pnpm` command not found or version mismatch

**Solution:**

```bash
# CI auto-detects pnpm version from package.json:
# "packageManager": "pnpm@10.22.0"

# Match locally
pnpm -v  # Should be 10.22.0

# Update if needed
npm install -g pnpm@10.22.0
```

---

### PostgreSQL Connection Issues (E2E only)

**Symptom:** Database connection refused in E2E tests

**Solution:**

Check `services:` block in `.github/workflows/e2e-tests.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: test_timetable
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**This is automatic** - CI spins up temporary PostgreSQL container

---

## Debugging Strategies

### 1. Reproduce Locally

```bash
# Match CI environment
node -v        # Node 20
pnpm -v        # PNPM 10.22.0

# Run exact CI commands
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

### 2. Check CI Logs

**Navigate to GitHub Actions:**
1. Go to repository → Actions tab
2. Click on failed workflow run
3. Click on failed job (e.g., "Lint & Type Check")
4. Expand failing step
5. Read full error output

**Download artifacts:**
- Test results (E2E failures)
- Coverage reports (unit tests)
- Playwright reports (E2E screenshots/videos)

---

### 3. Use Draft PRs

**While debugging:**
1. Create pull request as **draft**
2. Push commits to trigger CI
3. Review CI failures
4. Push fixes
5. Mark as ready for review when all checks pass

**Benefits:**
- CI still runs (same as normal PR)
- Reviewers know it's WIP
- Can iterate without blocking team

---

### 4. Inspect Workflow Files

**Check configuration:**
- `.github/workflows/ci.yml` - Lint, test, build jobs
- `.github/workflows/e2e-tests.yml` - E2E test matrix
- `jest.config.ts` - Unit test config
- `playwright.config.ts` - E2E test config
- `next.config.mjs` - Build config

---

### 5. Use Workflow Dispatch (E2E)

**Manual E2E trigger:**
1. Go to Actions → E2E Tests
2. Click "Run workflow"
3. Select branch
4. Choose shard count (1-8)
5. Run workflow

**Use cases:**
- Test specific branch without creating PR
- Adjust shard count for faster iteration (fewer shards)
- Re-run E2E after merging new changes

---

## Quick Reference

### CI Job Matrix

| Job                | Runs On     | Timeout | Triggers                  |
|--------------------|-------------|---------|---------------------------|
| Lint & Type Check  | ubuntu-latest | 10 min  | Push to main/develop, PRs |
| Unit Tests         | ubuntu-latest | 15 min  | Push to main/develop, PRs |
| Build              | ubuntu-latest | 15 min  | Push to main/develop, PRs |
| E2E Tests          | ubuntu-latest | 60 min  | Triggered by CI job       |

### Common Commands

```bash
# Reproduce CI locally
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e

# Quick fixes
pnpm lint:fix                    # Auto-fix linting
pnpm test __test__/path/file.ts  # Run specific test
pnpm build                       # Verify build works
```

### When to Contact Team

**Escalate if:**
- CI fails consistently but works locally
- Infrastructure issues (GitHub Actions down)
- Flaky tests with >2% failure rate
- Performance degradation (CI taking >20 min)

**How to escalate:**
1. File GitHub issue with `ci` label
2. Include workflow run URL
3. Include error logs
4. Include steps to reproduce

---

## Related Documentation

- [CI First Workflow Guide](./CI_FIRST_WORKFLOW.md) - Philosophy and daily workflow
- [E2E Reliability Guide](./E2E_RELIABILITY_GUIDE.md) - E2E testing patterns
- [AGENTS.md](../AGENTS.md) - AI agent development guidelines

---

**Remember:** CI failures are **normal** during development. The system is designed to catch issues early. Trust the feedback, fix the issues, and push again. 🚀
