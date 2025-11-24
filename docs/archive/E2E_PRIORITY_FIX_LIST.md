# E2E Test Priority Fix List

**Created**: November 12, 2025  
**Test Run**: 190 passed / 353 failed / 9 skipped (543 total)  
**Pass Rate**: 54%  
**Target**: 80%+ pass rate

---

## 🔴 P0 - Critical (Blocking 353 tests)

### 1. Teacher Dropdown Selector Reliability ⚡ HIGH IMPACT

**Issue**: `locator('[role="button"]').filter({ hasText: 'เลือกครู' })` timeout (10s)  
**Location**: `e2e/page-objects/ArrangePage.ts:105` (selectTeacher method)  
**Impact**: 353 test failures across 30+ spec files  
**Affected Files**:

- `schedule-assignment.spec.ts` (multiple failures)
- `drag-and-drop.spec.ts` (multiple failures)
- `public-homepage.spec.ts` (17 failures)
- `analytics-dashboard.spec.ts` (50+ failures)
- `dashboard.spec.ts` (20+ failures)

**Root Cause**:

- Teacher dropdown not consistently visible when tests expect it
- Timing issue between page load and UI element availability
- Data-dependent UI state (teacher selection may be required first)

**Proposed Fix**:

```typescript
// Update ArrangePage.selectTeacher() with robust waiting
async selectTeacher(teacherName: string) {
  // Wait for dropdown to be visible AND enabled
  await expect(this.teacherDropdown).toBeVisible({ timeout: 15000 });
  await expect(this.teacherDropdown).toBeEnabled({ timeout: 5000 });

  // Add retry logic for click
  await this.teacherDropdown.click({ timeout: 10000 });

  // Wait for options list to appear
  await this.page.waitForSelector('[role="listbox"], [role="option"]', {
    timeout: 5000
  });

  // Select option with retry
  await this.teacherOption(teacherName).click({ timeout: 5000 });
  await this.waitForPageLoad();
}
```

**Validation**:

- Run `pnpm test:e2e -- schedule-assignment.spec.ts`
- Verify teacher dropdown works in all test scenarios
- Check pass rate improvement (target: 70%+ after fix)

**Estimated Effort**: 2-3 hours  
**Expected Impact**: +30-40% pass rate increase

---

### 2. Prisma Mock Missing Models 🛠️ HIGH PRIORITY

**Issue**: `jest.setup.js` missing mock for `teachers_responsibility` model  
**Location**: `jest.setup.js:89-186` (Prisma Client mock section)  
**Impact**: Jest test failures in teaching assignment repository tests  
**Affected Files**:

- `__test__/features/teaching-assignment/teaching-assignment.repository.test.ts`

**Current Error**:

```
TypeError: Cannot read properties of undefined (reading 'findMany')
at Object.findAllTeachers (...teaching-assignment.repository.ts:209:11)
```

**Missing Mock Models**:

1. ✅ `teachers_responsibility` - **CRITICAL** (used in 10+ tests)
2. ❌ `program_subject` - may be needed
3. ❌ Other junction tables (check schema)

**Proposed Fix**:
Add to `jest.setup.js` after line 160:

```javascript
teachers_responsibility: {
  findMany: jest.fn().mockResolvedValue([]),
  findUnique: jest.fn().mockResolvedValue(null),
  findFirst: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
  createMany: jest.fn().mockResolvedValue({ count: 0 }),
  update: jest.fn().mockResolvedValue({}),
  updateMany: jest.fn().mockResolvedValue({ count: 0 }),
  delete: jest.fn().mockResolvedValue({}),
  deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  count: jest.fn().mockResolvedValue(0),
  upsert: jest.fn().mockResolvedValue({}),
},
program_subject: {
  findMany: jest.fn().mockResolvedValue([]),
  findUnique: jest.fn().mockResolvedValue(null),
  findFirst: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
  createMany: jest.fn().mockResolvedValue({ count: 0 }),
  update: jest.fn().mockResolvedValue({}),
  updateMany: jest.fn().mockResolvedValue({ count: 0 }),
  delete: jest.fn().mockResolvedValue({}),
  deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  count: jest.fn().mockResolvedValue(0),
  upsert: jest.fn().mockResolvedValue({}),
},
```

**Validation**:

- Run `pnpm test` to verify all Jest tests pass
- Check that all repository tests complete successfully
- Verify no remaining "Cannot read properties of undefined" errors

**Estimated Effort**: 30 minutes  
**Expected Impact**: Fix all Jest test failures related to Prisma mocks

---

## 🟡 P1 - High Priority

### 3. Test Data Consistency

**Issue**: Some tests fail due to inconsistent seed data state  
**Impact**: Intermittent failures in schedule creation tests  
**Proposed Fix**:

- Verify seed data is loaded correctly before tests
- Add data validation assertions in `beforeAll` hooks
- Ensure `1-2567` semester always has expected 56 teachers

**Estimated Effort**: 1-2 hours

### 4. Page Load Timing Improvements

**Issue**: `waitForPageReady()` doesn't guarantee all data is loaded  
**Impact**: Tests fail when attempting actions before UI is ready  
**Proposed Fix**:

- Add explicit waits for data-loaded attributes
- Check for skeleton/loading state completion
- Wait for API calls to complete (networkidle alternative)

**Estimated Effort**: 2-3 hours

---

## 🟢 P2 - Medium Priority

### 5. Error Handling for Missing UI Elements

**Issue**: Tests crash when optional elements are missing  
**Impact**: Brittle tests that fail on legitimate UI states  
**Proposed Fix**:

- Add graceful fallbacks in page objects
- Use `isVisible().catch(() => false)` pattern
- Provide better error messages for debugging

**Estimated Effort**: 2 hours

### 6. Locator Stability (data-testid)

**Issue**: Some locators use text-based selection (fragile)  
**Impact**: Tests break when UI text changes (Thai language)  
**Proposed Fix**:

- Add `data-testid` attributes to critical elements
- Update page objects to prefer testId over text
- Document testId naming convention

**Estimated Effort**: 3-4 hours

---

## 🔵 P3 - Low Priority

### 7. Test Parallelization Optimization

**Issue**: E2E tests take 46.9 minutes (too slow)  
**Impact**: Long CI/CD feedback loop  
**Proposed Fix**:

- Enable test sharding (4 workers)
- Optimize test data setup
- Cache authentication state better

**Estimated Effort**: 2-3 hours  
**Expected Impact**: Reduce runtime to 20-25 minutes

### 8. Flaky Test Investigation

**Issue**: Some tests pass/fail intermittently  
**Impact**: Reduced confidence in test suite  
**Proposed Fix**:

- Run tests 10 times to identify flaky tests
- Add retry logic (max 2 retries in CI)
- Fix root causes of flakiness

**Estimated Effort**: 4-5 hours

---

## Execution Strategy

### Phase 1 - Critical Fixes (Day 1)

1. ✅ Fix Prisma mock missing models (30 min) - **DO THIS FIRST**
2. ⚡ Fix teacher dropdown selector reliability (2-3 hours)
3. ✅ Run targeted tests to validate fixes

**Expected Outcome**: Pass rate 70%+ (from 54%)

### Phase 2 - High Priority Fixes (Day 2-3)

1. Test data consistency improvements
2. Page load timing enhancements
3. Full E2E test run to measure progress

**Expected Outcome**: Pass rate 80%+ (from 70%)

### Phase 3 - Medium Priority Fixes (Week 2)

1. Error handling improvements
2. Locator stability (data-testid)
3. Documentation updates

**Expected Outcome**: Pass rate 85%+ (from 80%)

### Phase 4 - Low Priority Optimizations (Future)

1. Test parallelization
2. Flaky test investigation
3. Performance optimizations

**Expected Outcome**: Pass rate 90%+, runtime < 25 minutes

---

## Success Metrics

| Metric            | Current  | Target (P1) | Target (P2) | Target (P3) |
| ----------------- | -------- | ----------- | ----------- | ----------- |
| Pass Rate         | 54%      | 70%         | 80%         | 90%         |
| Runtime           | 46.9 min | 45 min      | 35 min      | 25 min      |
| Flaky Tests       | Unknown  | <5          | <3          | 0           |
| Critical Failures | 353      | <100        | <50         | <10         |

---

## Dependencies

- ✅ Dev server running on port 3000
- ✅ Test database seeded with MOE data
- ✅ Auth setup working (storage state)
- ✅ Docker PostgreSQL on port 5433
- ❌ All Prisma models mocked in jest.setup.js

---

## Notes

- Teacher dropdown issue is the **PRIMARY BLOCKER** - fix this first after Prisma mocks
- Prisma mock fix is **QUICKEST WIN** - do this immediately
- Most tests are well-structured, just need reliability improvements
- E2E infrastructure is solid, issues are mostly timing/selector related
- Consider using Playwright's auto-waiting features more extensively

---

## Related Documentation

- `AGENTS.md` - E2E Reliability Patterns (Nov 2025)
- `e2e/README.md` - E2E test structure and conventions
- `docs/E2E_README_OLD.md` - Historical E2E testing context
- `playwright.config.ts` - Test configuration and settings
