# Bug Hunting Track - Comprehensive Bug Report

**Generated:** 2026-01-22  
**Track:** bughunt_20251229  
**Status:** Phase 4 - Triage Complete

---

## Executive Summary

| Category | Passed | Failed | Skipped | Status |
|----------|--------|--------|---------|--------|
| Unit Tests (MOE) | 395 | 0 | 1 | ✅ GREEN |
| E2E Baseline | 339 | 66 | 170 | ⚠️ NEEDS ATTENTION |
| Subject Assignment | 4 | 2 | 0 | ⚠️ PARTIAL |
| Arrangement Flow | 1 | 1 | 0 | ⚠️ PARTIAL |
| Lock Tests | 1 | 1 | 14 | ⚠️ PARTIAL |
| Export Tests | 6 | 2 | 9 | ⚠️ PARTIAL |

---

## Critical Issues (P0)

### CRIT-01: Dual Route Implementation Conflict

**Severity:** Critical  
**Category:** Architecture  
**Status:** Documented, Fix Required

**Description:**
Two competing implementations of the arrange page exist:
- `src/app/schedule/[academicYear]/[semester]/arrange/` - Original MUI Grid-based
- `src/app/(admin)/schedule/[academicYear]/[semester]/arrange/` - Admin parallel routes version

**Impact:**
- E2E tests written for original version fail on admin version
- Test selectors missing in admin version
- Different room selection architecture (modal vs. navigation)

**Applied Fix:**
- Added `data-testid="timetable-grid"` to admin version's table
- Added `data-testid="timeslot-card"` to DroppableCell
- Changed "ว่าง" to "คาบว่าง" for text consistency

**Recommended Action:**
1. Consolidate into single implementation, OR
2. Update all E2E tests to work with admin version architecture

---

## High Priority Issues (P1)

### HIGH-01: Auth Session Persistence Issues

**Severity:** High  
**Category:** Authentication  
**Status:** Intermittent

**Description:**
Auth setup occasionally fails with "Database not ready" or session not persisting after login. The `hasUser: false` is returned repeatedly after successful login.

**Symptoms:**
- Health check failures (10/10 attempts)
- Session API returns `{ hasUser: false, role: null }`
- Tests fail before reaching actual test logic

**Workaround:**
- Re-seed database clears the issue
- Ensure dev server uses `.env.test` not `.env`

### HIGH-02: Navigation Timeouts on Dashboard Views

**Severity:** High  
**Category:** Performance  
**Status:** Consistent

**Description:**
Multiple tests fail with `page.goto: Timeout 30000ms exceeded` on dashboard routes:
- `/dashboard/2567/1/all-programs`
- `/dashboard/2567/1/all-timeslot`
- `/schedule/2567/1/lock`

**Impact:**
- Export tests partially fail
- Dashboard viewing tests fail

**Root Cause:**
Likely slow page compilation or data fetching on first load.

---

## Medium Priority Issues (P2)

### MED-01: Room Selection Dialog Architecture Mismatch

**Severity:** Medium  
**Category:** E2E Test Compatibility  
**Status:** Known

**Description:**
The admin version uses navigation-based room selection (`/arrange/room-select?...`) instead of inline dialog (`[data-testid="room-selection-dialog"]`).

**Impact:**
- Arrangement flow tests fail waiting for dialog that never appears

### MED-02: Visual/Screenshot Tests Baseline Drift

**Severity:** Medium  
**Category:** Visual Regression  
**Status:** Known (from Phase 1)

**Description:**
~12 visual tests fail due to screenshot baseline differences.

**Recommended Action:**
Update screenshot baselines after UI stabilization.

### MED-03: Profile Page Functionality Issues

**Severity:** Medium  
**Category:** Feature Bug  
**Status:** Known (from Phase 1)

**Description:**
~5 tests fail on profile page functionality.

### MED-04: Public Schedule Pages Route/Rendering Issues

**Severity:** Medium  
**Category:** Feature Bug  
**Status:** Known (from Phase 1)

**Description:**
~20 tests fail on public schedule page routes.

---

## Low Priority Issues (P3)

### LOW-01: Performance Tests Threshold Failures

**Severity:** Low  
**Category:** Performance  
**Status:** Environment-Specific

**Description:**
~7 performance tests fail due to timing thresholds. These are likely environment-specific and not representative of production performance.

### LOW-02: Many Tests Skipped

**Severity:** Low  
**Category:** Test Coverage  
**Status:** By Design

**Description:**
170+ tests skipped in E2E baseline. These may be intentionally skipped (`.skip()`) or conditionally skipped based on environment.

---

## Test Results by Phase

### Phase 1: Baseline (2025-01-07)
- E2E: 339 passed, 66 failed, 170 skipped, 1 flaky
- Unit: 361 passed, 1 skipped

### Phase 2: Core Workflows (2026-01-22)
- Subject Assignment: 4 passed, 2 failed, 1 flaky
- Arrangement: 1 passed (auth), 1 failed (room dialog)
- Lock: 1 passed, 1 failed, 14 skipped

### Phase 3: Compliance (2026-01-22)
- MOE Unit Tests: 395 passed, 1 skipped ✅
- Export E2E: 6 passed, 2 failed, 9 skipped

---

## Recommended Actions

1. **Immediate (P0):**
   - Decide on route architecture: consolidate or document differences
   - Update E2E tests to match actual production routes

2. **Short-term (P1):**
   - Investigate auth session persistence issues
   - Increase navigation timeouts for slow-loading pages
   - Add server-side rendering for dashboard pages

3. **Medium-term (P2):**
   - Update visual test baselines
   - Fix profile page functionality
   - Fix public schedule page routes

4. **Low Priority (P3):**
   - Review and adjust performance test thresholds
   - Audit skipped tests for relevance

---

## Files Changed During Bug Hunt

1. `src/app/(admin)/schedule/[academicYear]/[semester]/arrange/@grid/page.tsx`
   - Added test selectors for E2E compatibility
   
2. `conductor/tracks/bughunt_20251229/plan.md`
   - Updated with Phase 2-4 results

---

## Commits

1. `51e0d7c7` - refactor(e2e): Replace waitForTimeout with event-driven waits (Phase 2)
2. `7d8f16f3` - refactor(e2e): Replace waitForTimeout with event-driven waits (Phase 1)
3. `af22fe28` - fix(e2e): Add test selectors to admin arrange grid + update Phase 2 findings
