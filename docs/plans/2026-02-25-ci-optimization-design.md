# CI Optimization Design

**Date:** 2026-02-25  
**Status:** Approved  
**Approach:** Build artifact sharing + 2-shard E2E (Approach A)

## Problem

The CI pipeline takes 30–40 minutes end-to-end, primarily due to the E2E workflow:

- Single Playwright worker running ~51 test files sequentially
- Redundant `next build` (CI already builds, E2E rebuilds)
- 2 retries on all tests regardless of stability
- Post-run workflow creates noisy failure issues

## Constraints

- ~15 mutating test files share DB state and must run sequentially
- ~30 read-only/visual test files are safe to parallelize
- `workflow_dispatch` for snapshot updates must keep working
- Cost is not a concern; optimize for speed

## Design

### 1. Build Artifact Sharing

**CI `build` job** uploads `.next/` and `node_modules/.prisma/` as a `build-output` artifact (1-day retention).

**E2E workflow** attempts to download `build-output` from the latest successful CI run on the same commit SHA:

- If found: skips `next build`, starts server directly
- If not found (e.g. `workflow_dispatch`): falls back to its own `next build`

**Savings:** ~4 min per E2E run.

### 2. Two-Shard E2E Strategy

Matrix strategy with `shard: [sequential, parallel]`. Each shard gets its own runner and PostgreSQL service container.

#### Shard `sequential` (mutating tests)

- **Workers:** 1
- **Retries:** 2
- **Files** (listed in `e2e/shard-sequential.list`):
  - `02-data-management.spec.ts`
  - `03-schedule-config.spec.ts`
  - `08-drag-and-drop.spec.ts`
  - `09-program-management.spec.ts`
  - `10-program-subject-assignment.spec.ts`
  - `11-activity-management.spec.ts`
  - `13-bulk-lock.spec.ts`
  - `14-lock-templates.spec.ts`
  - `16-publish-gate.spec.ts`
  - `20-subject-assignment.spec.ts`
  - `21-arrangement-flow.spec.ts`
  - `critical-path/cp-03-lock-integration.spec.ts`
  - `edge-cases/admin-edge-cases.spec.ts`
  - `profile/profile-management.spec.ts`
  - `smoke/crud-smoke.spec.ts`
  - `smoke/critical-smoke.spec.ts`
  - `tests/admin/schedule-assignment.spec.ts`
  - `debug-full-fill.spec.ts`

#### Shard `parallel` (read-only + visual tests)

- **Workers:** 3
- **Retries:** 1
- **Files:** Everything not in `shard-sequential.list`

#### Merge step

A `merge-results` job runs after both shards complete:

- Downloads JUnit XML and HTML reports from both
- Uploads combined artifacts

**Savings:** ~10–15 min (wall time = max of both shards ≈ 15–18 min).

### 3. Post-Run Simplification

- **Keep** `publish-report` job (JUnit → GitHub Check via `dorny/test-reporter`)
- **Update** artifact download to handle both shard names
- **Remove** `create-failure-issue` job entirely
- **Simplify** permissions: drop `issues: write`

### 4. Additional Optimizations

#### Smarter retries

- Sequential shard: `retries: 2` (mutating tests are flakier)
- Parallel shard: `retries: 1` (read-only tests are more deterministic)

#### Snapshot dispatch optimization

When `update_snapshots` is triggered via `workflow_dispatch`, only the parallel shard runs (visual tests live there).

### Skipped

**CI job deduplication** (shared `setup` job): Rejected. The 3 CI jobs run in parallel and complete in ~2–3 min each. Adding a serial setup dependency would increase wall time for negligible savings.

## Files Modified

| File | Change |
|---|---|
| `.github/workflows/ci.yml` | `build` job uploads artifact |
| `.github/workflows/e2e-tests.yml` | 2-shard matrix, build artifact download, retry tuning, snapshot dispatch |
| `.github/workflows/e2e-post-run.yml` | Remove failure issue job, update artifact names |
| `e2e/shard-sequential.list` | New file listing mutating test paths |

## Expected Results

| Metric | Before | After |
|---|---|---|
| E2E wall time | 30–40 min | 15–18 min |
| Build duplication | 2× (CI + E2E) | 1× (CI only, E2E reuses) |
| Failure noise | Auto-created issues | JUnit check only |
| Snapshot update time | Full run | Parallel shard only |

## Risks

- **Cross-workflow artifact dependency:** If CI build fails or hasn't run, E2E falls back to own build (mitigated by fallback logic).
- **Shard classification drift:** New test files need manual classification. Mitigate with a lint check or README note.
- **Parallel shard flakes:** Read-only tests running with 3 workers could hit resource contention. Mitigate by using `retries: 1` and monitoring.
