# E2E Auth Flow Fix (Dec 2025)

## Changes
- Updated `e2e/auth.setup.ts` login navigation: replaced `Promise.all([waitForNavigation, click])` with click + `expect(page).toHaveURL(/\/dashboard\//, { timeout: 60000 })` to align with SPA routing and prevent DOM detach.
- Auth setup still seeds semester storage fallback when hook is slow.
- Auth spec now forces clean state: `test.use({ storageState: { cookies: [], origins: [] } });` and clears cookies/localStorage in `beforeEach`.

## Outcome
- Targeted run of `pnpm exec playwright test e2e/01-auth/admin-auth-flow.spec.ts --project=chromium --reporter=line --grep "invalid credentials"` now passes.

## Notes
- Full E2E suite not re-run; other previously seen export/responsive test failures remain unvalidated.
- Keep docker test DB up via `docker-compose -f docker-compose.test.yml up -d` before running tests.