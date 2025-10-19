# E2E Test Execution Guide

## Overview
This guide provides step-by-step instructions for executing end-to-end tests for the School Timetable Management System.

---

## 🚀 Quick Start

### 1. Prerequisites Setup

```bash
# Install dependencies (if not already done)
pnpm install

# Install Playwright browsers
pnpm playwright:install
```

### 2. Prepare Test Environment

```bash
# Make sure your database is running
# Update .env file with correct database credentials

# Apply Prisma migrations
pnpm prisma migrate dev

# (Optional) Seed test data
# pnpm prisma db seed
```

### 3. Start Development Server

```bash
# In one terminal, start the dev server
pnpm dev

# Wait for server to start on http://localhost:3000
```

### 4. Run E2E Tests

```bash
# In another terminal, run all E2E tests
pnpm test:e2e

# Or run with UI mode for interactive debugging
pnpm test:e2e:ui
```

---

## 📊 Test Execution Modes

### Mode 1: Headless (Default - CI/CD)
```bash
pnpm test:e2e
```
- Runs in background
- Fastest execution
- Captures screenshots/videos on failure
- Best for automated testing

### Mode 2: Headed (Visual)
```bash
pnpm test:e2e:headed
```
- Shows browser window
- Watch tests execute in real-time
- Good for debugging
- Slower than headless

### Mode 3: UI Mode (Interactive)
```bash
pnpm test:e2e:ui
```
- Interactive test explorer
- Step through tests
- Inspect DOM
- Time-travel debugging
- Best for development

### Mode 4: Debug Mode
```bash
pnpm test:e2e:debug
```
- Opens Playwright Inspector
- Set breakpoints
- Step through test code
- Inspect page state
- Best for troubleshooting failures

---

## 🎯 Running Specific Tests

### Run Single Test File
```bash
pnpm playwright test e2e/01-home-page.spec.ts
```

### Run Tests by Pattern
```bash
# Run all data management tests
pnpm playwright test e2e/02-data-management

# Run specific test case
pnpm playwright test e2e/01-home-page.spec.ts -g "Home page loads"
```

### Run Tests by Tag (if configured)
```bash
pnpm playwright test --grep @critical
pnpm playwright test --grep @smoke
```

---

## 📹 Capturing Evidence

### Always Record Videos
```bash
pnpm playwright test --video=on
```
Videos saved to: `test-results/artifacts/`

### Capture All Screenshots
```bash
pnpm playwright test --screenshot=on
```
Screenshots saved to: `test-results/screenshots/`

### Full Trace
```bash
pnpm playwright test --trace=on
```
Trace files saved to: `test-results/`

---

## 📈 Viewing Reports

### HTML Report
```bash
# After test run, view HTML report
pnpm test:report

# Or manually
npx playwright show-report
```

The report includes:
- Pass/fail summary
- Screenshots of failures
- Videos of failed tests
- Execution timeline
- Test duration statistics

### JSON Report
Results are also saved to: `test-results/results.json`

---

## 🧪 Test Execution Workflow

### Full Test Suite Execution

```bash
# Step 1: Clean previous results
rm -rf test-results/ playwright-report/

# Step 2: Ensure dev server is running
pnpm dev &

# Step 3: Wait for server to be ready
# (Check http://localhost:3000)

# Step 4: Run tests with full recording
pnpm test:e2e --video=on --screenshot=on

# Step 5: View report
pnpm test:report

# Step 6: Stop dev server if started in background
# kill %1  # or press Ctrl+C
```

### Iterative Test Development

```bash
# Run in UI mode for development
pnpm test:e2e:ui

# Make changes to tests in your editor
# Tests auto-reload in UI mode
# Step through and debug interactively
```

---

## 📝 Test Case Coverage

### Phase 1: Critical Path (Must Pass)
- **TC-001**: Authentication
- **TC-003**: Teacher Management
- **TC-007**: Semester Configuration
- **TC-009**: Subject Assignment
- **TC-010**: Drag-and-Drop Scheduling
- **TC-011, TC-012, TC-013**: Conflict Detection
- **TC-017**: View Teacher Schedule
- **TC-021**: Export to Excel

### Phase 2: Core Features
- **TC-004, TC-005, TC-006**: Subject/Room/Grade Management
- **TC-008**: Copy from Previous Semester
- **TC-014**: Student Arrangement
- **TC-015**: Lock Timeslots
- **TC-018**: View Student Schedule
- **TC-022, TC-023, TC-024**: Export Functions

### Phase 3: Extended Features
- **TC-016**: Unlock Timeslots
- **TC-019, TC-020**: Summary Views
- **TC-025, TC-026, TC-027**: Edge Cases
- **TC-028, TC-029**: Mobile Responsiveness

---

## 🔍 Interpreting Results

### ✅ All Tests Pass
```
Test Suites: 5 passed, 5 total
Tests:       29 passed, 29 total
Time:        2m 15s
```
✓ All functionality working as expected  
✓ No regressions detected  
✓ Ready for deployment

### ⚠️ Some Tests Fail
```
Test Suites: 2 failed, 3 passed, 5 total
Tests:       5 failed, 24 passed, 29 total
```
1. Check HTML report for failure details
2. Review screenshots of failed tests
3. Watch failure videos
4. Fix issues and re-run

### 🔴 Authentication Tests Fail
Common causes:
- Google OAuth not configured
- Test environment needs auth bypass
- Session handling issues

**Solution**: Review `e2e/helpers/auth.ts` and configure mock auth

### 🔴 Data Management Tests Fail
Common causes:
- Database not seeded with test data
- API endpoints returning errors
- Authorization issues

**Solution**: Verify database state and API responses

### 🔴 Arrangement Tests Fail
Common causes:
- Complex drag-and-drop interactions
- Timing issues with UI updates
- Conflict detection not working

**Solution**: Add wait conditions, verify UI state

---

## 🎬 Recording Test Execution

### Create Video Documentation

```bash
# Run tests with video recording on all tests
pnpm playwright test --video=on --output=test-results/videos

# Convert test videos to documentation format
# (Use video editing software or screen recording)
```

### Screenshot Documentation

All test files already include screenshot capture:
```typescript
await page.screenshot({ 
  path: 'test-results/screenshots/XX-description.png',
  fullPage: true 
});
```

Screenshots are automatically organized by test case number.

### Create Test Report Document

1. Run all tests: `pnpm test:e2e`
2. Generate HTML report: `pnpm test:report`
3. Collect screenshots from: `test-results/screenshots/`
4. Collect videos from: `test-results/artifacts/`
5. Create summary document with:
   - Test case numbers
   - Pass/fail status
   - Screenshot of each major step
   - Video links for complex interactions
   - Notes on expected vs actual behavior

---

## 🐛 Troubleshooting

### Tests Won't Run

**Issue**: `Error: browserType.launch: Executable doesn't exist`
```bash
# Solution: Install browsers
pnpm playwright:install
```

**Issue**: `Error: Cannot find module '@playwright/test'`
```bash
# Solution: Install dependencies
pnpm install
```

### Tests Time Out

**Issue**: Tests hang or timeout
```bash
# Solution 1: Increase timeout in playwright.config.ts
# timeout: 60000  // 60 seconds

# Solution 2: Check dev server is running
curl http://localhost:3000

# Solution 3: Run with more debug output
DEBUG=pw:api pnpm test:e2e
```

### Database Errors

**Issue**: Tests fail with database connection errors
```bash
# Solution: Verify database connection
pnpm prisma db push

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Authentication Fails

**Issue**: All tests redirect to sign-in
```bash
# Solution: Implement test authentication
# Option 1: Mock auth in test environment
# Option 2: Set up test credentials
# Option 3: Bypass auth for test routes
```

### Screenshots Not Captured

**Issue**: test-results/screenshots/ is empty
```bash
# Solution: Create directory
mkdir -p test-results/screenshots

# Check write permissions
chmod -R 755 test-results
```

---

## 📚 Additional Resources

- **Test Plan**: See `e2e/TEST_PLAN.md` for detailed test cases
- **Test Code**: See `e2e/*.spec.ts` for test implementations
- **Helpers**: See `e2e/helpers/` for reusable utilities
- **Playwright Docs**: https://playwright.dev/docs/intro

---

## 👥 For CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Install Playwright
        run: pnpm playwright:install
        
      - name: Setup database
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: mysql://root:test@localhost:3306/test_db
          
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          BASE_URL: http://localhost:3000
          DATABASE_URL: mysql://root:test@localhost:3306/test_db
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
          
      - name: Upload screenshots
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: test-results/screenshots/
          retention-days: 30
```

---

## ✅ Checklist for Test Execution

Before running tests:
- [ ] Development server is running
- [ ] Database is accessible
- [ ] Migrations are applied
- [ ] Test data is seeded (optional)
- [ ] Playwright browsers installed
- [ ] Environment variables configured

After running tests:
- [ ] Review HTML report
- [ ] Check all screenshots
- [ ] Watch failure videos (if any)
- [ ] Document any issues found
- [ ] Update test cases if needed
- [ ] Archive test results

---

## 📞 Support

For issues with E2E tests:
1. Check this guide first
2. Review `e2e/README.md`
3. Consult `e2e/TEST_PLAN.md`
4. Open an issue in the repository
5. Contact the development team

---

**Last Updated**: 2025-01-19  
**Version**: 1.0  
**Status**: Initial E2E test suite implemented
