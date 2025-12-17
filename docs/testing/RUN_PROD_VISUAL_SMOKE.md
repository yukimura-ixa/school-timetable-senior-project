# Run Production Visual Smoke Tests

These tests are **production-safe visual smokes** (read-only) intended to run against a **dedicated test tenant / dataset** on the deployed site.

## Required Environment Variables

- `E2E_BASE_URL` (recommended) or `BASE_URL` (legacy)
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`
- `E2E_SEMESTER_ID` (recommended) or `SEMESTER_ID` (legacy), e.g. `1-2567`

Optional:

- `E2E_START_WEBSERVER=true` to run `pnpm dev` locally (only when `E2E_BASE_URL` points to `http://localhost:3000`)
- `PLAYWRIGHT_PROD_AUTH_FILE` to override the storageState location (default `playwright/.auth/prod-admin.json`)
- `E2E_ALLOW_MUTATIONS=true` to enable CRUD smoke tests that create/update/delete `E2E-*` tagged records

## Commands

Run the full production visual smoke suite:

```bash
pnpm test:prod:visual
```

Run in interactive UI mode:

```bash
pnpm test:prod:visual:ui
```

Run a single test (example):

```bash
pnpm test:prod:visual -- -g "dashboard all-timeslot renders"
```

Open the HTML report:

```bash
pnpm test:prod:visual:report
```

Run scheduling (read-only) smoke checks (no screenshot baselines required):

```bash
pnpm test:prod:scheduling
```

Run mutating CRUD smoke (requires opt-in):

```bash
# Set E2E_ALLOW_MUTATIONS=true in your environment, then:
pnpm test:prod:crud
```

## Baselines (Screenshots + ARIA)

First-time / intentional UI change workflow:

1. Confirm you are targeting a **test tenant** (or safe dataset).
2. Generate/update baselines:

```bash
pnpm test:prod:visual:update
```

3. Review diffs in the Playwright report, then commit the snapshot artifacts:
   - `e2e/prod/visual/*.spec.ts-snapshots/` (PNG baselines)
   - `e2e/prod/visual/*.aria.yml` (ARIA baselines)

## Artifacts and Debugging

- Failure artifacts go to `test-results/prod-artifacts/`
- HTML report goes to `playwright-report-prod/`

Notes:

- The **auth setup** test types real credentials, so it **disables trace/video/screenshot** to avoid capturing secrets.
- All post-login tests keep `trace: retain-on-failure` for actionable debugging without leaking credentials.

## Interpreting Visual Diffs

When a screenshot assertion fails, Playwright produces:

- `expected.png` – committed baseline
- `actual.png` – current run output
- `diff.png` – highlighted pixel differences

Open the HTML report and inspect the diff images before updating baselines.

## CI (GitHub Actions)

Workflow: `.github/workflows/prod-visual-smoke.yml`

Configure:

- Repository secrets:
  - `E2E_ADMIN_EMAIL`
  - `E2E_ADMIN_PASSWORD`
- Repository variables (recommended):
  - `E2E_BASE_URL`
  - `E2E_SEMESTER_ID`

Mutating CRUD workflow (manual-only): `.github/workflows/prod-crud-smoke.yml`

- Uses the same secrets/vars as above
- Forces `E2E_ALLOW_MUTATIONS=true` for the run
