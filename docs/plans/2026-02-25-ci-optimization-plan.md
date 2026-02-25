# CI Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce E2E CI wall time from 30–40 min to 15–18 min via build artifact sharing and 2-shard parallelism.

**Architecture:** CI `build` job uploads `.next/` as artifact. E2E workflow uses 2-shard matrix (sequential for mutating tests, parallel for read-only). Post-run workflow drops issue creation, keeps JUnit reporting.

**Tech Stack:** GitHub Actions, Playwright, pnpm, Next.js, PostgreSQL 16

---

### Task 1: Create Shard Classification File

**Files:**
- Create: `e2e/shard-sequential.list`

**Step 1: Create the sequential test list**

```text
# Tests that mutate database state — must run sequentially (1 worker).
# All other test files run in the parallel shard (3 workers).
# When adding a new E2E test, classify it here if it creates/updates/deletes data.

02-data-management.spec.ts
03-schedule-config.spec.ts
08-drag-and-drop.spec.ts
09-program-management.spec.ts
10-program-subject-assignment.spec.ts
11-activity-management.spec.ts
13-bulk-lock.spec.ts
14-lock-templates.spec.ts
16-publish-gate.spec.ts
20-subject-assignment.spec.ts
21-arrangement-flow.spec.ts
critical-path/cp-03-lock-integration.spec.ts
edge-cases/admin-edge-cases.spec.ts
profile/profile-management.spec.ts
smoke/crud-smoke.spec.ts
smoke/critical-smoke.spec.ts
tests/admin/schedule-assignment.spec.ts
debug-full-fill.spec.ts
```

**Step 2: Commit**

```bash
git add e2e/shard-sequential.list
git commit -m "ci: add shard-sequential.list for E2E test classification"
```

---

### Task 2: Update CI Build Job to Upload Artifact

**Files:**
- Modify: `.github/workflows/ci.yml` (end of `build` job, after the `Build` step)

**Step 1: Add upload-artifact step**

After the existing `- name: Build` / `run: pnpm build` step in the `build` job, add:

```yaml
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: |
            .next/
            node_modules/.prisma/
          retention-days: 1
```

**Step 2: Verify the change locally**

```bash
# Just validate YAML syntax
python -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" 2>/dev/null || echo "Install pyyaml or use yq"
yq eval '.jobs.build.steps[-1].name' .github/workflows/ci.yml
# Expected: "Upload build artifact"
```

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: upload build artifact from CI build job"
```

---

### Task 3: Rewrite E2E Workflow with 2-Shard Matrix

**Files:**
- Modify: `.github/workflows/e2e-tests.yml` (full rewrite of jobs section)

This is the largest change. Replace the entire `jobs:` section.

**Step 1: Replace `e2e-tests.yml` with 2-shard version**

The new workflow structure:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main]
    paths-ignore:
      - "**.md"
      - "docs/**"
      - "screenshots/**"
      - "LICENSE"
      - ".gitignore"
  workflow_dispatch:
    inputs:
      update_snapshots:
        description: "Update Playwright visual baselines"
        required: false
        default: "false"
        type: boolean

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  DATABASE_URL: postgresql://test_user:test_password@localhost:5433/test_timetable
  BETTER_AUTH_URL: http://localhost:3005
  BASE_URL: http://localhost:3005
  AUTO_MANAGE_TEST_DB: "false"
  NEXT_TELEMETRY_DISABLED: "1"

jobs:
  test:
    name: E2E (${{ matrix.shard }})
    runs-on: ubuntu-latest
    timeout-minutes: 45
    permissions:
      contents: read
      actions: read  # needed for artifact download from other workflow

    strategy:
      fail-fast: false
      matrix:
        shard: [sequential, parallel]

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_timetable
        ports:
          - 5433:5432
        options: >-
          --health-cmd "pg_isready -U test_user -d test_timetable"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: pnpm

      - name: Setup env files
        run: |
          cat > .env.test << 'ENVEOF'
          DATABASE_URL=postgresql://test_user:test_password@localhost:5433/test_timetable
          BETTER_AUTH_SECRET=${{ secrets.BETTER_AUTH_SECRET }}
          BETTER_AUTH_URL=http://localhost:3005
          BASE_URL=http://localhost:3005
          AUTH_GOOGLE_ID=dummy-client-id
          AUTH_GOOGLE_SECRET=dummy-client-secret
          SEED_SECRET=${{ secrets.SEED_SECRET }}
          SEED_FOR_TESTS=true
          SEED_CLEAN_DATA=true
          NEXT_TELEMETRY_DISABLED=1
          NODE_ENV=test
          CI=true
          ENVEOF
          cp .env.test .env.test.local
          cp .env.test .env.local
          cp .env.test .env.production

      - name: Install & generate
        run: |
          pnpm install --frozen-lockfile
          pnpm prisma generate

      - name: Migrate & seed
        run: |
          pnpm prisma migrate deploy
          pnpm db:seed:clean
        env:
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          SEED_FOR_TESTS: "true"
          SEED_CLEAN_DATA: "true"

      - name: Verify database seed
        run: pnpm exec tsx scripts/verify-test-db.ts

      # --- Build: try reusing CI artifact, fallback to own build ---
      - name: Download CI build artifact
        id: download-build
        uses: actions/download-artifact@v4
        with:
          name: build-output
          github-token: ${{ secrets.GITHUB_TOKEN }}
          run-id: ${{ github.event.workflow_run.id || '' }}
        continue-on-error: true

      - name: Try download build from latest CI run
        if: steps.download-build.outcome == 'failure'
        id: download-build-latest
        uses: dawidd6/action-download-artifact@v6
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          workflow: ci.yml
          branch: ${{ github.ref_name }}
          name: build-output
          path: .
          check_artifacts: true
          search_artifacts: true
          if_no_artifact_found: warn
        continue-on-error: true

      - name: Cache Next.js build & Prisma
        if: steps.download-build.outcome == 'failure' && steps.download-build-latest.outcome == 'failure'
        uses: actions/cache@v4
        with:
          path: |
            .next/cache
            node_modules/.prisma
          key: ${{ runner.os }}-e2e-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ hashFiles('prisma/schema.prisma') }}
          restore-keys: ${{ runner.os }}-e2e-

      - name: Build (fallback)
        if: steps.download-build.outcome == 'failure' && steps.download-build-latest.outcome == 'failure'
        run: pnpm build
        env:
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          AUTH_GOOGLE_ID: dummy-client-id
          AUTH_GOOGLE_SECRET: dummy-client-secret
          SEED_FOR_TESTS: "true"
          NODE_ENV: production

      # --- Playwright setup ---
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        id: pw-cache
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/pnpm-lock.yaml') }}

      - name: Install Playwright browsers
        if: steps.pw-cache.outputs.cache-hit != 'true'
        run: pnpm exec playwright install --with-deps chromium

      - name: Install Playwright deps (cached)
        if: steps.pw-cache.outputs.cache-hit == 'true'
        run: pnpm exec playwright install-deps chromium

      # --- Compute test file list for this shard ---
      - name: Compute shard test files
        id: shard
        run: |
          SEQ_FILE="e2e/shard-sequential.list"
          # Read sequential list (skip comments and blank lines)
          SEQ_PATTERNS=$(grep -v '^#' "$SEQ_FILE" | grep -v '^\s*$' | sed 's|^|e2e/|' | paste -sd ' ')

          if [ "${{ matrix.shard }}" = "sequential" ]; then
            echo "files=$SEQ_PATTERNS" >> "$GITHUB_OUTPUT"
            echo "workers=1" >> "$GITHUB_OUTPUT"
            echo "retries=2" >> "$GITHUB_OUTPUT"
          else
            # Parallel shard: find all spec files NOT in the sequential list
            ALL_FILES=$(find e2e -name '*.spec.ts' -not -path '*/prod/*' | sort)
            PARALLEL_FILES=""
            for f in $ALL_FILES; do
              MATCH=false
              for s in $SEQ_PATTERNS; do
                if [ "$f" = "$s" ]; then
                  MATCH=true
                  break
                fi
              done
              if [ "$MATCH" = "false" ]; then
                PARALLEL_FILES="$PARALLEL_FILES $f"
              fi
            done
            echo "files=$PARALLEL_FILES" >> "$GITHUB_OUTPUT"
            echo "workers=3" >> "$GITHUB_OUTPUT"
            echo "retries=1" >> "$GITHUB_OUTPUT"
          fi

      # --- Run tests ---
      - name: Run E2E tests (${{ matrix.shard }})
        run: |
          EXTRA_ARGS=""
          if [ "${{ inputs.update_snapshots }}" = "true" ]; then
            EXTRA_ARGS="--update-snapshots"
          fi
          pnpm exec playwright test \
            --timeout=90000 \
            --workers=${{ steps.shard.outputs.workers }} \
            --retries=${{ steps.shard.outputs.retries }} \
            $EXTRA_ARGS \
            ${{ steps.shard.outputs.files }}
        env:
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          AUTH_GOOGLE_ID: dummy-client-id
          AUTH_GOOGLE_SECRET: dummy-client-secret
          CI: "true"
          SKIP_DB_SEED: "true"

      - name: Server logs (on failure)
        if: failure()
        run: |
          if [ -f server.log ]; then tail -200 server.log; else echo "No server.log"; fi

      # --- Upload artifacts (shard-specific names) ---
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results-${{ matrix.shard }}
          path: |
            test-results/
            artifacts/
          retention-days: 14

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-html-report-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 14

      - name: Upload JUnit results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-junit-${{ matrix.shard }}
          path: test-results/**/*.xml
          retention-days: 14
          if-no-files-found: ignore

      - name: Upload updated snapshots
        if: always() && inputs.update_snapshots == true && matrix.shard == 'parallel'
        uses: actions/upload-artifact@v4
        with:
          name: updated-snapshots
          path: |
            e2e/**/*-snapshots/*.png
            e2e/visual/**/*.png
          retention-days: 30
          if-no-files-found: warn

  # --- Merge results from both shards ---
  merge-results:
    name: Merge E2E Results
    runs-on: ubuntu-latest
    if: always()
    needs: [test]
    timeout-minutes: 5
    steps:
      - name: Download all JUnit results
        uses: actions/download-artifact@v4
        with:
          pattern: playwright-junit-*
          merge-multiple: true
          path: test-results

      - name: Upload merged JUnit
        uses: actions/upload-artifact@v4
        with:
          name: playwright-junit
          path: test-results/**/*.xml
          retention-days: 14
          if-no-files-found: ignore

      - name: Download all HTML reports
        uses: actions/download-artifact@v4
        with:
          pattern: playwright-html-report-*
          path: playwright-reports

      - name: Upload merged HTML reports
        uses: actions/upload-artifact@v4
        with:
          name: playwright-html-reports-combined
          path: playwright-reports/
          retention-days: 14
```

**Step 2: Validate YAML**

```bash
# Quick syntax check
cat .github/workflows/e2e-tests.yml | head -5
# Should show the YAML header without errors
```

**Step 3: Commit**

```bash
git add .github/workflows/e2e-tests.yml
git commit -m "ci: rewrite E2E workflow with 2-shard matrix + build reuse

- Sequential shard: 1 worker, 2 retries, mutating tests
- Parallel shard: 3 workers, 1 retry, read-only + visual tests
- Downloads CI build artifact when available, falls back to own build
- Shard-specific artifact uploads + merge-results job"
```

---

### Task 4: Simplify Post-Run Workflow

**Files:**
- Modify: `.github/workflows/e2e-post-run.yml`

**Step 1: Remove `create-failure-issue` job and simplify**

Replace the entire file with:

```yaml
# .github/workflows/e2e-post-run.yml
# Publishes JUnit test reports from E2E Tests workflow
name: E2E Post-Run

on:
  workflow_run:
    workflows: ["E2E Tests"]
    types: [completed]
    branches: [main, develop]

permissions:
  contents: read
  checks: write

concurrency:
  group: ${{ github.workflow }}-${{ github.event.workflow_run.id }}
  cancel-in-progress: false

jobs:
  publish-report:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Download Playwright JUnit artifacts
        uses: actions/download-artifact@v4
        with:
          pattern: playwright-junit*
          merge-multiple: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
          run-id: ${{ github.event.workflow_run.id }}
          path: test-results
        continue-on-error: true

      - name: Detect JUnit files
        id: junit
        run: |
          shopt -s nullglob
          files=(test-results/*.xml test-results/**/*.xml)
          if [ ${#files[@]} -eq 0 ]; then
            echo "found=false" >> "$GITHUB_OUTPUT"
            echo "No JUnit files downloaded; skipping report"
          else
            echo "found=true" >> "$GITHUB_OUTPUT"
            echo "JUnit files:" "${files[@]}"
          fi

      - name: Publish Playwright E2E test check
        if: steps.junit.outputs.found == 'true'
        uses: dorny/test-reporter@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          name: Playwright E2E
          reporter: java-junit
          path: test-results/**/*.xml
```

**Step 2: Commit**

```bash
git add .github/workflows/e2e-post-run.yml
git commit -m "ci: simplify post-run workflow, remove auto-issue creation

Keep JUnit report publishing. Drop failure issue creation (noisy).
Update artifact download pattern for 2-shard names."
```

---

### Task 5: Test the Pipeline End-to-End

**Step 1: Push all changes**

```bash
git push origin main
```

**Step 2: Monitor CI build job**

```bash
# Wait for CI to complete, check build artifact was uploaded
gh run list --workflow=ci.yml --limit=1
gh run view <run-id> --json jobs --jq '.jobs[] | {name, conclusion}'
```

Verify the `build` job has a `build-output` artifact.

**Step 3: Monitor E2E workflow**

```bash
gh run list --workflow=e2e-tests.yml --limit=1
gh run view <run-id> --json jobs --jq '.jobs[] | {name, status, conclusion}'
```

Expected:
- `E2E (sequential)` — running, ~18 min
- `E2E (parallel)` — running concurrently, ~10 min
- `Merge E2E Results` — runs after both complete

**Step 4: Verify timing improvement**

```bash
# Compare total wall time
gh run view <run-id> --json createdAt,updatedAt --jq '"\(.createdAt) -> \(.updatedAt)"'
```

Expected: total under 20 min (down from 30–40).

**Step 5: Verify post-run**

```bash
gh run list --workflow="E2E Post-Run" --limit=1
```

Expected: JUnit report published, no failure issue created.

---

### Task 6: Fix Issues from First Run

This is a buffer task for any issues discovered during the first CI run.

**Likely adjustments:**
- Test files in wrong shard (test fails because ordering dependency wasn't caught)
- Build artifact download path mismatch (`.next/` subfolder nesting)
- Parallel shard flakiness (increase retries from 1 to 2 if needed)

**Step 1: Check E2E results from both shards**

```bash
# Download and inspect JUnit results
gh run download <run-id> --name playwright-junit-sequential
gh run download <run-id> --name playwright-junit-parallel
```

**Step 2: Move misclassified tests between shards**

If any parallel shard test fails due to DB mutation, add it to `e2e/shard-sequential.list`.

**Step 3: Commit fixes**

```bash
git add -A
git commit -m "ci: fix shard classification from first run"
git push origin main
```
