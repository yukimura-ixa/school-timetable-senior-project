# E2E Activity Management Tests - CI Investigation

**Date**: 2025-12-12  
**CI Run**: #475  
**Status**: 4/5 tests FAILING in CI, all passed locally

---

## Executive Summary

Re-enabled 5 activity management CRUD tests that were previously skipped. Local tests pass (1.5m runtime), but CI run #475 shows 4/5 tests failing. The pattern suggests **save operations fail in CI production build** but work locally in dev server.

### Test Results

| Test | Local | CI (Run #475) | Failure Point |
|------|-------|---------------|---------------|
| TC-ACT-001 (Create) | โœ… PASS | โŒ FAIL (3 attempts) | Save and verify creation |
| TC-ACT-002 (Edit) | โœ… PASS | โŒ FAIL (3 attempts) | Modify subject name |
| TC-ACT-003 (Delete) | โœ… PASS | โŒ FAIL (3 attempts) | Create subject to delete |
| TC-ACT-004 (Cancel) | โœ… PASS | โœ… PASS (931ms) | No save operation |
| TC-ACT-005 (Validate) | โœ… PASS | โŒ FAIL (3 attempts) | Try to save with empty fields |

**Key Pattern**: Tests involving save operations fail. Test without save (cancel) passes.

---

## Environment Comparison: CI vs Local

### CI Environment (GitHub Actions)

```yaml
Environment:
  NODE_ENV: production
  Build: Next.js production build (pnpm build)
  Database: PostgreSQL 16 (GitHub service container)
  Host: postgres (docker network)
  Port: 5432
  Parallelization: 4 shards
  Browser: Chromium (Playwright)
  Retries: 3 attempts per test
  Timeout: 30s per test
```

**CI Workflow Steps**:
1. Build production bundle: `pnpm build`
2. Start production server: `pnpm start`
3. Run Playwright tests in 4 parallel shards
4. Each test gets 3 retry attempts

### Local Environment

```yaml
Environment:
  NODE_ENV: development
  Build: Dev server with hot reload
  Database: PostgreSQL (localhost:5433)
  Parallelization: No sharding
  Browser: Chromium (Playwright)
  Retries: Configurable
```

**Local Test Command**:
```bash
pnpm exec playwright test e2e/11-activity-management.spec.ts
```

---

## Key Differences

### 1. **Build Mode**

| Aspect | Local (Dev) | CI (Production) |
|--------|-------------|-----------------|
| Mode | `next dev` | `next build` + `next start` |
| Caching | Minimal | Aggressive (React cache, fetch) |
| Bundling | On-demand | Pre-compiled |
| RSC | Dev mode | Production optimized |
| Errors | Verbose | Silent/Minimal |

### 2. **Database Connection**

| Aspect | Local | CI |
|--------|-------|-----|
| Host | localhost | postgres (docker network) |
| Port | 5433 | 5432 |
| Connection Pool | Dev defaults | Production defaults |
| Latency | ~1ms | ~5-10ms (container network) |

### 3. **Timing & Race Conditions**

| Aspect | Local | CI |
|--------|-------|-----|
| Network Speed | Fast (loopback) | Slower (container network) |
| CPU | Dedicated | Shared (runner) |
| I/O | SSD direct | Container filesystem |
| Server Actions | Fast response | Potential delays |

---

## Hypothesis: Root Cause Analysis

### Primary Hypothesis: **Server Action Timeout in Production**

**Evidence**:
1. โœ… TC-ACT-004 (cancel - no save) passes
2. โŒ All save-related tests fail at save step
3. โœ… Tests passed in CI previously (run 426, Dec 10)
4. โœ… Tests pass locally (dev server)

**Suspected Issues**:

#### A. Production Build Cache/RSC Issues
- Production builds use React Server Component cache
- `fetch` responses cached by default in production
- Server Actions may not invalidate caches properly
- `revalidatePath` or `revalidateTag` might not work in test environment

#### B. Database Connection Pool Exhaustion
- Production connection pool limits
- Tests run in parallel (4 shards)
- Connections not released properly
- Timeouts waiting for available connection

#### C. Network Latency + Playwright Timing
- CI uses `page.waitForSelector` with 10s timeout
- Production server response slower than dev
- Database operations take longer in containerized environment
- Test doesn't wait for `networkidle` state

#### D. Production Build Optimizations Breaking Tests
- Tree shaking removes necessary code
- Dead code elimination affects test paths
- Minification changes behavior
- React Compiler optimizations

---

## Debugging Strategy Added

### 1. **Comprehensive Logging**

Added structured logging at 3 layers:

#### Layer 1: Server Action (`subject.actions.ts`)
```typescript
log.info("[CREATE_SUBJECT_START]", {
  nodeEnv: process.env.NODE_ENV,
  originalCode: input.SubjectCode,
  subjectName: input.SubjectName,
});
// ... validation steps with debug logs
log.info("[CREATE_SUBJECT_SUCCESS]", { subjectCode, subjectName });
```

#### Layer 2: Repository (`subject.repository.ts`)
```typescript
log.info("[REPOSITORY_CREATE_START]", { subjectCode, subjectName });
// ... prisma operation
log.info("[REPOSITORY_CREATE_SUCCESS]", { subjectCode });
```

#### Layer 3: UI Component (`EditableTable.tsx`)
```typescript
console.log("[EDITABLE_TABLE_SAVE_START]", { title, data });
const result = await onCreate(newRow);
console.log("[EDITABLE_TABLE_ONCREATE_RESULT]", {
  success: result.success,
  hasData: !!result.data,
});
```

#### Layer 4: E2E Tests (`11-activity-management.spec.ts`)
```typescript
console.log("[E2E_TEST] Clicked save button, waiting for network...");
await page.waitForLoadState("networkidle", { timeout: 15000 });
console.log("[E2E_TEST] Subject verified in table");
```

### 2. **Enhanced Wait Conditions**

Updated tests to add explicit `networkidle` waits:

```typescript
// Before save
await saveButton.click();

// After save - NEW
await page.waitForLoadState("networkidle", { timeout: 15000 });
await page.waitForSelector("text=/สำเร็จ|success/i", { timeout: 10000 });
await page.waitForTimeout(1000); // Extra persistence wait
```

---

## Next Steps

### Immediate Actions

1. **Run CI with New Logging**
   ```bash
   git add -A
   git commit -m "debug: Add comprehensive logging to activity CRUD flow"
   git push
   ```

2. **Analyze CI Logs**
   - Check for `[CREATE_SUBJECT_START]` โ†' `[CREATE_SUBJECT_SUCCESS]` flow
   - Look for missing log entries (indicates where it fails)
   - Check timing between log entries
   - Verify database operations complete

3. **Check CI Artifacts**
   - Screenshots at failure point
   - Playwright trace files
   - Test videos (if enabled)
   - Look for error states in UI

### Investigation Questions

1. **Does the server action start?**
   - Look for `[CREATE_SUBJECT_START]` in logs
   - If missing: Client-side issue (form data, validation)
   - If present: Server-side issue

2. **Does validation pass?**
   - Check `[VALIDATE_CODE_SUCCESS]` and `[VALIDATE_NAME_SUCCESS]`
   - If missing: Validation failing (duplicate check issue?)

3. **Does Prisma create execute?**
   - Look for `[REPOSITORY_CREATE_START]`
   - If missing: Issue before database call
   - If present but no success: Database operation failed

4. **Does the result return to UI?**
   - Check `[EDITABLE_TABLE_ONCREATE_RESULT]`
   - Verify `success: true` is present
   - Check if `onMutate` completes

### Potential Fixes

#### Fix 1: Add Explicit Revalidation
```typescript
// In subject.actions.ts
import { revalidatePath } from "next/cache";

export const createSubjectAction = createAction(
  createSubjectSchema,
  async (input: CreateSubjectInput) => {
    // ... existing code ...
    const subject = await subjectRepository.create({...});
    
    // Add revalidation
    revalidatePath("/management/subject");
    
    return subject;
  },
);
```

#### Fix 2: Increase Database Connection Pool
```typescript
// In lib/prisma.ts or prisma config
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 20  // Increase from default
}
```

#### Fix 3: Add Production-Specific Wait
```typescript
// In E2E tests
const isCI = !!process.env.CI;
const waitTime = isCI ? 3000 : 1000;
await page.waitForTimeout(waitTime);
```

#### Fix 4: Disable Fetch Cache for Tests
```typescript
// In next.config.mjs
export default {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Add for testing
  ...(process.env.CI && {
    experimental: {
      isrMemoryCacheSize: 0, // Disable ISR cache
    },
  }),
};
```

---

## Success Criteria

Tests will be considered fixed when:

1. โœ… All 5 activity tests pass in CI (3/3 attempts)
2. โœ… Logs show complete flow: START โ†' VALIDATE โ†' CREATE โ†' SUCCESS
3. โœ… No timeouts or network errors
4. โœ… Consistent results across multiple CI runs
5. โœ… Local tests still pass

---

## Reference: Working CI Run

- **Run #426** (2025-12-10)
- **Commit**: `8d526db`
- **Status**: All activity tests PASSED
- **Comparison**: What changed between 8d526db and current HEAD?

```bash
git diff 8d526db HEAD -- e2e/11-activity-management.spec.ts
git diff 8d526db HEAD -- src/features/subject/
git diff 8d526db HEAD -- src/components/tables/EditableTable.tsx
```

---

## Log Markers Reference

Use these markers to trace flow in CI logs:

### Server Action Flow
1. `[CREATE_SUBJECT_START]` - Entry point
2. `[TRIM_CODE]` - Code normalization
3. `[VALIDATE_CODE_START/SUCCESS/FAILED]` - Duplicate code check
4. `[VALIDATE_NAME_START/SUCCESS/FAILED]` - Duplicate name check
5. `[REPOSITORY_CREATE_START]` - Database call start
6. `[REPOSITORY_CREATE_SUCCESS]` - Database call success
7. `[CREATE_SUBJECT_SUCCESS]` - Action complete

### Client Flow
1. `[EDITABLE_TABLE_SAVE_START]` - UI save initiated
2. `[EDITABLE_TABLE_ONCREATE_CALL]` - Server action called
3. `[EDITABLE_TABLE_ONCREATE_RESULT]` - Server action returned
4. `[EDITABLE_TABLE_SAVE_SUCCESS]` - UI updated
5. `[EDITABLE_TABLE_ONMUTATE_CALL]` - Refetch started
6. `[EDITABLE_TABLE_ONMUTATE_COMPLETE]` - Refetch done

### E2E Test Flow
1. `[E2E_TEST] Clicked save button, waiting for network...`
2. `[E2E_TEST] Checking for success message...`
3. `[E2E_TEST] Waited for persistence, verifying...`
4. `[E2E_TEST] Subject verified in table`

---

## Appendix: Related Files

### Modified for Debugging
- `src/features/subject/application/actions/subject.actions.ts` - Server action logging
- `src/features/subject/infrastructure/repositories/subject.repository.ts` - DB logging
- `src/components/tables/EditableTable.tsx` - UI save logging
- `e2e/11-activity-management.spec.ts` - Test logging + network waits

### Investigation Files
- `E2E_SKIPPED_TESTS_RESOLUTION.md` - Original investigation
- `E2E_ACTIVITY_TESTS_CI_INVESTIGATION.md` - This document

### Next.js Config
- `next.config.mjs` - Build configuration
- `playwright.config.ts` - E2E test configuration
- `.github/workflows/e2e-tests.yml` - CI workflow

---

**Status**: โณ **Awaiting CI Run** with new logging to identify exact failure point.
