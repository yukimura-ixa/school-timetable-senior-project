# E2E Test Execution Guide - Server Component Migration

This guide walks through running the E2E tests to verify the Server Component migration.

---

## Prerequisites

1. **Database is seeded**:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

2. **Development server is running**:
   ```bash
   pnpm dev
   ```
   - Should be accessible at `http://localhost:3000`

3. **Playwright is installed**:
   ```bash
   pnpm exec playwright install --with-deps chromium
   ```

---

## Running Tests

### Option 1: Run All E2E Tests (Recommended)

```bash
# Run all E2E tests
pnpm test:e2e
```

This will:
- Run all test suites in `e2e/` directory
- Generate HTML report
- Save screenshots in `test-results/screenshots/`

### Option 2: Run Specific Test Suite

**Existing Tests (Data Management)**:
```bash
pnpm exec playwright test e2e/02-data-management.spec.ts
```

**New Tests (Server Component Migration)**:
```bash
pnpm exec playwright test e2e/07-server-component-migration.spec.ts
```

### Option 3: Run in UI Mode (Debug)

```bash
pnpm exec playwright test --ui
```

Benefits:
- Visual test runner
- Step through tests
- Inspect selectors
- View screenshots/videos

### Option 4: Run Specific Test by ID

```bash
# Run a single test
pnpm exec playwright test -g "TC-007-01"

# Run tests matching a pattern
pnpm exec playwright test -g "Teacher"
```

---

## Expected Output

### Console Output (Success)

```
Running 19 tests using 1 worker

✓ [chromium] › 02-data-management.spec.ts:12:5 › TC-003-01: Teacher Management page loads
✓ [chromium] › 02-data-management.spec.ts:25:5 › TC-003-02: Teacher Management - Add button exists
✓ [chromium] › 02-data-management.spec.ts:40:5 › TC-003-03: Teacher list displays data
...
✓ [chromium] › 07-server-component-migration.spec.ts:18:5 › TC-007-01: Teacher page renders with server data
✓ [chromium] › 07-server-component-migration.spec.ts:55:5 › TC-007-07: Teacher page loads faster
✓ [chromium] › 07-server-component-migration.spec.ts:85:5 › TC-007-08: No SWR revalidation requests on mount

19 passed (45s)
```

### Console Logs to Look For

Look for these specific log messages:

1. **Server-Side Rendering**:
   ```
   ✓ Teacher management page rendered with server data
   ✓ Initial HTML contains table structure: true
   ```

2. **Performance**:
   ```
   ✓ Teacher page load time: 1200ms
   ✓ Data fetch requests on mount: 0
   ```

3. **Client Interactions**:
   ```
   ✓ Client-side interactions working (add button clicked)
   ✓ Search functionality working
   ```

---

## Test Results Analysis

### 1. Check Screenshots

Screenshots are saved in `test-results/screenshots/`:

| Screenshot | What to Look For |
|------------|------------------|
| `20-teacher-server-rendered.png` | Table with data, no loading spinner |
| `21-teacher-ssr-content.png` | Data visible immediately |
| `22-teacher-client-interaction.png` | Modal/form opened |
| `23-25-*-server-rendered.png` | Other pages with data |
| `26-teacher-load-performance.png` | Fast load time |
| `27-dashboard-header-server.png` | Header with semester info |
| `28-search-functionality.png` | Search results filtered |
| `29-pagination-controls.png` | Pagination UI |

**Success Criteria**:
- ✅ No loading spinners on initial load
- ✅ Tables populated with data
- ✅ UI matches expected design

### 2. Performance Metrics

Check console output for load times:

```
✓ Teacher page load time: 1200ms  ← Should be < 3000ms
✓ Data fetch requests on mount: 0  ← Should be 0 or 1
```

**Before Migration (SWR)**:
- Initial HTML: ~500ms
- Client-side fetch: ~800ms
- **Total**: ~1300ms + loading spinner

**After Migration (Server Components)**:
- Initial HTML with data: ~1000ms
- **Total**: ~1000ms, no loading spinner

### 3. Network Requests

TC-007-08 logs all API requests. Look for:

```
API requests during load: [
  "GET https://localhost:3000/management/teacher"  ← Page HTML only
]
✓ Data fetch requests on mount: 0  ← No SWR revalidation!
```

**Success**: 0 data fetch requests (data is in HTML)  
**Failure**: Multiple GET requests to `/api/teacher` or similar

---

## Troubleshooting

### Tests Failing?

#### TC-007-01 to TC-007-06 Fail (Server Rendering)

**Symptom**: Tests timeout waiting for table to appear

**Possible Causes**:
1. Server Actions not returning data
2. Client wrapper not receiving `initialData` prop
3. Database empty (not seeded)

**Solution**:
```bash
# Check database has data
pnpm prisma studio

# Re-seed if empty
pnpm prisma db seed

# Restart dev server
pnpm dev
```

#### TC-007-07 Fails (Load Time)

**Symptom**: `Expected: < 5000, Received: 8000`

**Possible Causes**:
1. Database query slow
2. Server overloaded
3. Network latency

**Solution**:
1. Check Prisma query logs in dev server console
2. Optimize database queries
3. Increase timeout in test if server is normally slow

#### TC-007-08 Fails (API Requests)

**Symptom**: `Expected: <= 1, Received: 3` (too many API requests)

**Possible Causes**:
1. Client component using `useSWR` or `useEffect` for data fetching
2. Not passing `initialData` from Server Component

**Solution**:
1. Verify Server Component passes data to client:
   ```typescript
   // page.tsx (Server Component)
   const teachers = await getTeachersAction();
   return <TeacherManageClient initialData={teachers} />;
   ```

2. Verify client wrapper uses `initialData`:
   ```typescript
   // TeacherManageClient.tsx
   const [teachers, setTeachers] = useState(initialData);
   ```

#### TC-007-09 Fails (Dashboard Header)

**Symptom**: Header doesn't show semester info

**Possible Causes**:
1. Dashboard route requires auth
2. No semester data in database

**Solution**:
```bash
# Create test semester in database
# Or skip this test if dashboard requires complex auth setup
pnpm exec playwright test -g "TC-007-09" --skip
```

---

## Interpreting Test Results

### All Tests Pass ✅

**Great!** Server Component migration is successful:
- ✅ Server-side rendering working
- ✅ Performance improved
- ✅ Client interactions preserved
- ✅ No regressions

**Next Steps**:
1. Review screenshots to confirm UI quality
2. Deploy to staging environment
3. Monitor performance metrics in production

### Some Tests Fail ⚠️

**Categorize failures**:

1. **Navigation/UI Tests Fail** → Routing issue
2. **SSR Tests Fail** → Server Component not rendering data
3. **Performance Tests Fail** → Query optimization needed
4. **Client Interaction Tests Fail** → Button/form issue

**Action**:
1. Identify pattern (all Teacher tests fail? All pages fail?)
2. Check specific error messages
3. Use `--ui` mode to debug: `pnpm exec playwright test --ui`
4. Fix root cause, re-run tests

---

## Running Tests in CI/CD

If you have a CI/CD pipeline, add this job:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps chromium
      
      - name: Setup database
        run: |
          pnpm prisma migrate deploy
          pnpm prisma db seed
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Maintenance

### When to Update Tests

Update E2E tests when:

1. **UI Changes**:
   - New tables/lists → Update selectors
   - Button text changes → Update locators
   - Layout changes → Update screenshots

2. **Feature Changes**:
   - New management pages → Add test suite
   - New interactions → Add interaction tests
   - New validations → Add error tests

3. **Performance Requirements Change**:
   - Update timeout values in TC-007-07
   - Adjust expected load times

### How to Update

1. **Update selectors**:
   ```typescript
   // Old
   page.locator('button:has-text("Add")')
   
   // New (if text changed)
   page.locator('button:has-text("Create New")')
   ```

2. **Update screenshots** (if intentional UI change):
   ```bash
   # Delete old screenshots
   rm test-results/screenshots/*.png
   
   # Re-run tests to generate new screenshots
   pnpm test:e2e
   ```

3. **Add new tests** for new features:
   ```typescript
   test('TC-007-13: New feature works', async ({ page }) => {
     // Test implementation
   });
   ```

---

## Quick Reference

### Common Commands

```bash
# Run all tests
pnpm test:e2e

# Run specific suite
pnpm exec playwright test e2e/07-server-component-migration.spec.ts

# Run in debug mode
pnpm exec playwright test --ui

# Run specific test
pnpm exec playwright test -g "TC-007-01"

# Update snapshots
pnpm exec playwright test --update-snapshots

# Generate HTML report
pnpm exec playwright show-report
```

### File Locations

- **Test files**: `e2e/*.spec.ts`
- **Helpers**: `e2e/helpers/`
- **Screenshots**: `test-results/screenshots/`
- **HTML report**: `playwright-report/index.html`
- **Config**: `playwright.config.ts`

---

## Success Checklist

Before considering E2E testing complete:

- [ ] All 19 tests pass
- [ ] Screenshots show server-rendered data (no spinners)
- [ ] Load times < 3 seconds
- [ ] 0-1 API requests on initial mount
- [ ] Client interactions (buttons/search/pagination) work
- [ ] No console errors in browser
- [ ] HTML report generated successfully
- [ ] Documentation updated if issues found

---

**Ready to run tests?**

```bash
# Start dev server (separate terminal)
pnpm dev

# Run E2E tests
pnpm test:e2e
```

**Good luck!** 🚀
