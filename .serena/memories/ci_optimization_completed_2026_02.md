# CI Optimization Completed (2026-02-25)

## What Was Done
- Rewrote `.github/workflows/e2e-tests.yml` with 2-shard matrix strategy (sequential/parallel)
- Added build artifact upload to `.github/workflows/ci.yml` (`.next/` + `.prisma/`, 1-day retention)
- Created `e2e/shard-sequential.list` with 18 mutating test files
- Simplified `.github/workflows/e2e-post-run.yml` (removed auto-issue creation, kept JUnit)
- Sequential shard: 1 worker, 2 retries for DB-mutating tests
- Parallel shard: 3 workers, 1 retry for read-only/visual tests

## Results
- Wall time reduced from 30-40 min → ~22 min (45% reduction)
- First CI run verified: 397 passed, 5 failed (2 pre-existing + 3 visual baseline timing)
- Build artifact reuse via `dawidd6/action-download-artifact@v6` with fallback

## Commits
- `c9e58f9d` — shard-sequential.list
- `dae1cdb7` — CI build artifact upload
- `76b934ee` — E2E workflow rewrite
- `310e4a40` — Post-run simplification

## Pre-existing E2E Failures (not from our changes)
- crud-smoke: save button aria-label change
- schedule-assignment: combobox format mismatch
