# Jest Test Suite Remaining Issues

## Current Status (as of 2025-11-01)
- **Test Suites:** 15/21 passing (71%)
- **Tests:** 290/328 passing (88.4%)
- **Failing Tests:** 38 (down from 71)
- **Progress:** 46% improvement

## Successfully Fixed (5 test suites)
1. ✅ `lock-template.service.test.ts` (23/23 tests)
   - Fixed: Test fixture data structure mismatches
   - Changed property names from `grades`/`timeslots` to `availableGrades`/`availableTimeslots`
   - Fixed return type expectations (`valid` not `isValid`, `gradeCount` not `matchingGradesCount`)
   - Updated test expectations to match actual service behavior (warnings vs errors)

2. ✅ `schedule.repository.test.ts` (initially fixed)
   - Removed duplicate `jest.mock('@/lib/prisma')` declaration
   - Added typed mock references
   - Pattern: `const mockTable = prisma.table as jest.Mocked<typeof prisma.table>`

3. ✅ `conflict.repository.test.ts` (initially fixed)
   - Removed duplicate `jest.mock("@/lib/prisma")` declarations
   - Added typed mock references

4. ✅ `config-lifecycle.actions.test.ts` (initially fixed)
   - Changed ~60 instances from `.mockResolvedValue()` to `.mockImplementation(() => Promise.resolve(...))`
   - Pattern works for re-mocking already-initialized mocks

5. ✅ `schedule-arrangement.actions.test.ts` (initially fixed)
   - Removed duplicate auth and prisma mocks
   - Using global mocks with typed references

## Remaining Issues (6 test suites - TO FIX LATER)

### Issue 1: Mock Re-initialization Problems (4 suites)
**Affected Files:**
- `config-lifecycle.actions.test.ts`
- `conflict.repository.test.ts`
- `schedule.repository.test.ts`
- `schedule-arrangement.actions.test.ts`

**Root Cause:**
Tests that were "fixed" are failing again when run as part of full test suite. The global mock in `jest.setup.js` uses `jest.fn().mockResolvedValue([])`, but tests need to re-mock with different data per test. Calling `.mockResolvedValue()` again fails with "mockResolvedValue is not a function".

**Solution Required:**
Must use `.mockImplementation(() => Promise.resolve(...))` pattern consistently across ALL test files for re-mocking. Automated regex replacement caused syntax errors, so manual fixes needed.

**Pattern to Apply:**
```typescript
// WRONG (fails on re-mock)
mockTable.findMany.mockResolvedValue(data);

// CORRECT (works for re-mock)
(mockTable.findMany as jest.Mock).mockImplementation(() => Promise.resolve(data));
```

### Issue 2: Worker Process Leak
**Affected File:** `config-lifecycle.actions.test.ts`

**Error Message:**
```
A worker process has failed to exit gracefully and has been force exited. 
This is likely caused by tests leaking due to improper teardown. 
Try running with --detectOpenHandles to find leaks.
```

**Possible Causes:**
- Unclosed database connections
- Pending timers/setTimeouts
- Event listeners not cleaned up
- Async operations not awaited

**Solution Required:**
- Add proper `afterEach`/`afterAll` cleanup
- Ensure all Prisma connections are mocked (not real)
- Check for setTimeout/setInterval that need clearing
- Run with `--detectOpenHandles` to identify leak source

### Issue 3: Empty Test Database
**Affected File:** `public-data-layer.test.ts`

**Root Cause:**
Tests expect seeded database data but test DB is empty.

**Error Pattern:**
```typescript
expect(result.length).toBeGreaterThan(0)  // Expected: > 0, Received: 0
```

**Solution Options:**
1. **Mock the queries** (Recommended) - Mock Prisma responses with test data
2. **Seed test DB** - Add beforeAll hook to seed test data
3. **Use fixtures** - Import fixture data and mock repository responses

**Recommended Approach:**
```typescript
beforeEach(() => {
  (mockPrisma.table.findMany as jest.Mock).mockImplementation(() => 
    Promise.resolve([/* test fixture data */])
  );
});
```

### Issue 4: Auth Middleware Blocking
**Affected File:** `seed-endpoint.integration.test.ts`

**Root Cause:**
Integration tests hitting actual API routes that have auth middleware.

**Error:** `Expected: 200, Received: 401 Unauthorized`

**Solution Options:**
1. **Mock auth in test file** - Add `jest.mock('@/lib/auth')` specifically for this integration test
2. **Provide test credentials** - Add valid auth headers to fetch requests
3. **Bypass auth for tests** - Add test-specific route that bypasses auth

**Recommended Approach:**
```typescript
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: { id: 1, email: 'test@test.com', role: 'ADMIN' }
  }))
}));
```

## Key Patterns and Learnings

### Next.js 16 + Jest Limitations
- **Async Server Components NOT supported** in Jest
- Use E2E tests (Playwright) for async server components
- Jest works for: synchronous components, pure logic, repositories

### Global Mock Setup (jest.setup.js)
```javascript
jest.mock('@/lib/prisma', () => ({
  default: {
    table: {
      findMany: jest.fn().mockResolvedValue([]),
      // ... other methods
    }
  }
}));
```

### Test File Pattern
```typescript
// NO duplicate jest.mock() - use global mock
const mockTable = prisma.table as jest.Mocked<typeof prisma.table>;

beforeEach(() => {
  jest.clearAllMocks();
  // Re-mock with test-specific data
  (mockTable.findMany as jest.Mock).mockImplementation(() => 
    Promise.resolve(testData)
  );
});
```

### Common Pitfalls
1. ❌ Duplicate `jest.mock()` in test files → Conflicts with global mock
2. ❌ Chaining `.mockResolvedValue()` on initialized mocks → "not a function" error
3. ❌ Missing `jest.clearAllMocks()` in beforeEach → State leaks between tests
4. ❌ Test fixture structure mismatch → "Cannot read properties of undefined"

## Action Plan for Later
1. **Fix mock patterns** in 4 test files (manual editing, not regex)
2. **Run with --detectOpenHandles** to find worker leak
3. **Add test fixtures** for public-data-layer tests
4. **Mock auth** for integration tests
5. **Verify all 21 suites pass** after fixes

## Resources
- Memory: `jest_testing_nextjs_patterns` - Best practices and patterns
- Next.js Docs: https://nextjs.org/docs/app/guides/testing/jest
- Jest Docs: https://jestjs.io/docs/mock-functions
