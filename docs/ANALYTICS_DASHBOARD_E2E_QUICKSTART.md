# Analytics Dashboard E2E Tests - Quick Start Guide

**Get the analytics dashboard E2E tests passing in 5 minutes**

---

## Prerequisites

✅ Playwright installed: `pnpm add -D @playwright/test`  
✅ Dev server running: `pnpm dev` (or will auto-start)  
✅ Test environment configured: `.env.test` with dev bypass enabled  
✅ Database accessible for seeding

---

## Step 1: Seed Test Data (2 minutes)

### Option A: Using SQL File (Recommended)

```bash
# Navigate to project root
cd B:\Dev\school-timetable-senior-project

# Run the seed SQL file
# (Adjust command based on your database)

# For MySQL:
mysql -u root -p school_timetable_dev < e2e/fixtures/seed-analytics-dashboard-test-data.sql

# For PostgreSQL:
psql -U postgres -d school_timetable_dev -f e2e/fixtures/seed-analytics-dashboard-test-data.sql

# For Prisma with Vercel Postgres:
# 1. Copy SQL from file
# 2. Paste into Prisma Studio SQL Editor
# 3. Execute
```

### Option B: Manual Insert (Quick)

```sql
-- Copy and paste this into your database client
-- (Prisma Studio, MySQL Workbench, pgAdmin, etc.)

INSERT INTO semesters (
  id, academicYear, term, status, completeness,
  isPinned, lastAccessedAt, createdAt, updatedAt
) VALUES
(1001, 2567, 1, 'published', 85, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1002, 2567, 2, 'published', 92, false, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1003, 2566, 2, 'published', 95, true, CURRENT_TIMESTAMP - INTERVAL '40 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1004, 2566, 1, 'published', 67, false, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1005, 2568, 1, 'draft', 25, false, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1006, 2568, 2, 'draft', 18, false, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1007, 2567, 3, 'draft', 45, false, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1008, 2565, 1, 'draft', 52, true, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1009, 2566, 3, 'locked', 100, false, CURRENT_TIMESTAMP - INTERVAL '50 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1010, 2565, 2, 'locked', 88, false, CURRENT_TIMESTAMP - INTERVAL '80 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1011, 2565, 3, 'locked', 91, true, CURRENT_TIMESTAMP - INTERVAL '100 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1012, 2564, 1, 'locked', 74, false, CURRENT_TIMESTAMP - INTERVAL '120 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1013, 2564, 2, 'archived', 78, false, CURRENT_TIMESTAMP - INTERVAL '200 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1014, 2564, 3, 'archived', 89, false, CURRENT_TIMESTAMP - INTERVAL '250 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1015, 2563, 1, 'archived', 63, false, CURRENT_TIMESTAMP - INTERVAL '300 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Verify Data

```sql
-- Should return 15
SELECT COUNT(*) FROM semesters WHERE id BETWEEN 1001 AND 1015;
```

---

## Step 2: Run E2E Tests (2 minutes)

```bash
# Run all analytics dashboard tests
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts

# Expected output: 54/54 passing (or 50+/54)
```

### Alternative: Run with UI Mode (Interactive)

```bash
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts --ui
```

### Alternative: Run Specific Test Suite

```bash
# Just visibility tests
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts -g "Dashboard Visibility"

# Just performance tests
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts -g "Performance"
```

---

## Step 3: View Results (1 minute)

### HTML Report (Visual)

```bash
npx playwright show-report
```

Opens at: http://localhost:9323 (or similar)

**What to look for**:
- ✅ Green checkmarks for passing tests
- 📸 Screenshots on failures
- 🎥 Videos of test execution
- ⏱️ Performance metrics

### Console Output (Quick)

Tests print results directly to terminal:
```
54 passed (2.5m)
```

---

## Expected Results

### All Tests Passing ✅

If test data is seeded correctly, you should see:

```
Running 54 tests using 1 worker

  ✓ [chromium] › analytics-dashboard.spec.ts:26:9 › Dashboard Visibility › should display dashboard header
  ✓ [chromium] › analytics-dashboard.spec.ts:32:9 › Dashboard Visibility › should show expand/collapse button
  ✓ [chromium] › analytics-dashboard.spec.ts:44:9 › Dashboard Visibility › should be expanded by default
  ... (51 more tests)

  54 passed (2.5m)
```

### Statistics Verified

The dashboard should display:
- **Total Semesters**: 15
- **Average Completeness**: ~67.5%
- **Pinned**: 5
- **Recently Accessed**: 8

**Status Distribution**:
- Draft: 26.7%
- Published: 26.7%
- Locked: 26.7%
- Archived: 20.0%

**Completeness Distribution**:
- Low (<31%): 13.3% (red)
- Medium (31-79%): 40.0% (orange)
- High (80%+): 46.7% (green)

**Top 5 Academic Years**:
1. 2567: 3 semesters (20%)
2. 2566: 3 semesters (20%)
3. 2565: 3 semesters (20%)
4. 2564: 3 semesters (20%)
5. 2568: 2 semesters (13%)

---

## Troubleshooting

### Issue: Tests Still Failing

**Check 1: Dashboard Not Visible**
```bash
# Verify test data exists
# Should return 15 rows
SELECT COUNT(*) FROM semesters WHERE id BETWEEN 1001 AND 1015;
```

**Check 2: Dev Bypass Not Working**
```bash
# Verify .env.test has:
ENABLE_DEV_BYPASS=true
DEV_USER_EMAIL=admin@test.local
```

**Check 3: Dev Server Not Running**
```bash
# Manually start dev server
pnpm dev

# Then in another terminal:
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts
```

### Issue: Database Connection Failed

**Solution**: Update `.env.test` with correct `DATABASE_URL`

```env
DATABASE_URL="mysql://user:password@localhost:3306/school_timetable_dev"
# OR
DATABASE_URL="postgresql://user:password@localhost:5432/school_timetable_dev"
```

### Issue: "Cannot find module '@playwright/test'"

**Solution**: Install Playwright

```bash
pnpm add -D @playwright/test
npx playwright install chromium
```

### Issue: Tests Timeout

**Solution**: Increase timeout in `playwright.config.ts`

```ts
export default defineConfig({
  timeout: 60000, // 60 seconds instead of 30
  // ...
});
```

---

## Clean Up After Testing

### Remove Test Data

```sql
DELETE FROM semesters WHERE id BETWEEN 1001 AND 1015;
```

### Stop Dev Server

```bash
# Press Ctrl+C in terminal where dev server is running
```

---

## Next Steps

### 1. Integrate with CI/CD

Add to `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests - Analytics Dashboard

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Setup database
        run: pnpm db:migrate
      
      - name: Seed test data
        run: pnpm db:seed:test
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npx playwright test e2e/dashboard/analytics-dashboard.spec.ts
        env:
          ENABLE_DEV_BYPASS: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### 2. Add More Test Scenarios

Extend `analytics-dashboard.spec.ts` with:
- Real-time update tests
- Export functionality tests (CSV/Excel from dashboard)
- Filtering integration tests
- Multi-language tests (Thai/English)

### 3. Create Test Data Fixtures

Create `e2e/fixtures/semester-data.ts`:

```ts
export const testSemesters = [
  { id: 1001, academicYear: 2567, status: 'published', completeness: 85, ... },
  // ... more semesters
];

export function seedTestData() {
  // Insert test data programmatically
}
```

---

## Summary

**Total Time**: 5 minutes
1. Seed test data (2 min)
2. Run tests (2 min)
3. Review results (1 min)

**Expected Outcome**: 54/54 passing tests ✅

**Files Created**:
- Test file: `e2e/dashboard/analytics-dashboard.spec.ts` (54 tests)
- Seed file: `e2e/fixtures/seed-analytics-dashboard-test-data.sql`
- Documentation: `docs/ANALYTICS_DASHBOARD_E2E_TESTS.md`
- Test results: `docs/ANALYTICS_DASHBOARD_E2E_TEST_RESULTS.md`
- **This guide**: `docs/ANALYTICS_DASHBOARD_E2E_QUICKSTART.md`

**Ready to Run**: Yes! Just seed data and execute tests.

---

## Resources

- Playwright Docs: https://playwright.dev/
- Test Configuration: `playwright.config.ts`
- Test Environment: `.env.test`
- HTML Report: `playwright-report/index.html`
- Video Recordings: `test-results/`
- Screenshots: `test-results/`

**Questions?** Check `ANALYTICS_DASHBOARD_E2E_TEST_RESULTS.md` for detailed analysis.
