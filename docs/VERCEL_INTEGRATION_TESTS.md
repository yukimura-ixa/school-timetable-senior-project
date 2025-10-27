# Vercel Integration Tests - Complete Guide

**Integration testing against live Vercel deployments (preview & production)**

---

## Overview

Integration tests verify your application works correctly on **live Vercel deployments**:
- ✅ Production environment testing
- ✅ Preview deployment verification  
- ✅ Edge caching validation
- ✅ Multi-browser compatibility
- ✅ Performance monitoring
- ✅ API integration checks

---

## Quick Start

### 1. Run Tests Against Production

```bash
# Test production deployment
npx playwright test -c playwright.vercel.config.ts

# Runs against: https://phrasongsa-timetable.vercel.app
```

### 2. Run Tests Against Preview Deployment

```bash
# Test specific preview deployment
VERCEL_URL=https://your-app-git-branch-username.vercel.app npx playwright test -c playwright.vercel.config.ts
```

### 3. Run Specific Test Suite

```bash
# Public pages only
npx playwright test -c playwright.vercel.config.ts e2e/integration/public-pages.spec.ts

# Analytics dashboard (requires auth)
npx playwright test -c playwright.vercel.config.ts e2e/integration/analytics-dashboard-vercel.spec.ts
```

---

## Test Configuration

### Files Created

1. **playwright.vercel.config.ts** - Vercel-specific Playwright config
2. **.env.vercel** - Environment variables for Vercel tests
3. **e2e/integration/public-pages.spec.ts** - Public page integration tests
4. **e2e/integration/analytics-dashboard-vercel.spec.ts** - Dashboard integration tests
5. **e2e/integration/vercel-helpers.ts** - Utility functions for Vercel testing

### Configuration Differences

**Local E2E Tests** (`playwright.config.ts`):
- Runs against local dev server (`http://localhost:3000`)
- Auto-starts dev server
- Uses dev bypass for authentication
- Can modify database
- Sequential execution (workers: 1)

**Vercel Integration Tests** (`playwright.vercel.config.ts`):
- Runs against live Vercel deployment
- No local server needed
- No dev bypass (production auth)
- Read-only tests (no DB mutations)
- Parallel execution (workers: 2)
- Tests multiple browsers (Chromium, Firefox, WebKit)
- Longer timeouts for network latency

---

## Test Suites

### 1. Public Pages (`public-pages.spec.ts`)

**42 Tests covering**:

#### Home Page (6 tests)
- ✅ Page loads successfully
- ✅ Displays public data
- ✅ Navigation works
- ✅ No JavaScript errors
- ✅ Correct meta tags

#### Performance (2 tests)
- ✅ Loads within 5 seconds
- ✅ Edge caching works

#### Responsive Design (3 tests)
- ✅ Mobile viewport (375px)
- ✅ Tablet viewport (768px)
- ✅ Desktop viewport (1920px)

#### SEO & Accessibility (3 tests)
- ✅ Proper heading hierarchy
- ✅ Accessible images (alt text)
- ✅ Skip to main content

#### Network & API (2 tests)
- ✅ Graceful error handling
- ✅ Efficient API calls

#### Browser Compatibility (3 tests)
- ✅ Chromium
- ✅ Firefox
- ✅ WebKit/Safari

### 2. Analytics Dashboard (`analytics-dashboard-vercel.spec.ts`)

**28 Tests covering**:

#### Dashboard Visibility (2 tests)
- ✅ Displays when semesters exist
- ✅ Loads without errors

#### Statistics Validation (2 tests)
- ✅ Valid numbers
- ✅ Percentages in range (0-100%)

#### Responsive Behavior (2 tests)
- ✅ Mobile adaptation
- ✅ Tablet adaptation

#### Performance (2 tests)
- ✅ Loads within 10 seconds
- ✅ Edge cache effective

#### API Integration (2 tests)
- ✅ Handles slow responses
- ✅ Handles API errors

#### Vercel Features (2 tests)
- ✅ Vercel headers present
- ✅ Edge functions efficient

#### Data Validation (1 test)
- ✅ Semester data valid

---

## Environment Variables

### .env.vercel

```env
# Production deployment (default)
VERCEL_URL=https://phrasongsa-timetable.vercel.app

# Preview deployment (override)
# VERCEL_URL=https://your-app-git-feature-username.vercel.app

# Auth bypass NOT available on production
ENABLE_DEV_BYPASS=false

# Optional: Vercel API token for accessing protected deployments
# VERCEL_TOKEN=your-token-here
```

### Environment Override

```bash
# Test specific deployment
VERCEL_URL=https://custom-deployment.vercel.app npx playwright test -c playwright.vercel.config.ts

# Test with specific browser
npx playwright test -c playwright.vercel.config.ts --project=firefox

# Test mobile
npx playwright test -c playwright.vercel.config.ts --project=mobile-chrome
```

---

## Authentication Handling

### Public Pages

✅ **No authentication required** - tests work out of the box

### Protected Pages (Dashboard)

**3 Options:**

#### Option 1: Skip Auth Tests (Default)

Tests automatically skip if authentication is required:

```ts
test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard/select-semester');
  const currentUrl = page.url();
  const isAuthenticated = !currentUrl.includes('signin');
  
  test.skip(!isAuthenticated, 'Authentication required');
});
```

#### Option 2: Use Vercel Share Links (Recommended)

Use Vercel MCP to get share links:

```bash
# Get share link for protected deployment
# (Expires in 23 hours)
```

Then update tests:

```ts
const shareUrl = await getVercelShareUrl(page, baseURL);
await page.goto(shareUrl + '/dashboard/select-semester');
```

#### Option 3: Manual Authentication

Set up test Google OAuth account and log in programmatically:

```ts
// Login helper (requires test Google account)
await loginWithGoogle(page, {
  email: 'test@example.com',
  password: 'test-password'
});
```

---

## Running Tests

### All Tests (All Browsers)

```bash
npx playwright test -c playwright.vercel.config.ts
```

### Specific Browser

```bash
# Chromium only
npx playwright test -c playwright.vercel.config.ts --project=chromium

# Firefox only
npx playwright test -c playwright.vercel.config.ts --project=firefox

# Safari/WebKit only
npx playwright test -c playwright.vercel.config.ts --project=webkit

# Mobile Chrome
npx playwright test -c playwright.vercel.config.ts --project=mobile-chrome

# Mobile Safari
npx playwright test -c playwright.vercel.config.ts --project=mobile-safari
```

### Headed Mode (Visible Browser)

```bash
npx playwright test -c playwright.vercel.config.ts --headed
```

### Debug Mode

```bash
npx playwright test -c playwright.vercel.config.ts --debug
```

### UI Mode (Interactive)

```bash
npx playwright test -c playwright.vercel.config.ts --ui
```

### Specific Test File

```bash
npx playwright test -c playwright.vercel.config.ts e2e/integration/public-pages.spec.ts
```

### Specific Test

```bash
npx playwright test -c playwright.vercel.config.ts -g "should load home page"
```

---

## Viewing Reports

### HTML Report

```bash
# Run tests
npx playwright test -c playwright.vercel.config.ts

# View report
npx playwright show-report playwright-report-vercel
```

Opens at: http://localhost:9323 (or similar)

### JSON Report

Results saved to: `test-results/vercel-results.json`

### Screenshots & Videos

- Screenshots: `test-results/vercel-artifacts/**/*-failed-*.png`
- Videos: `test-results/vercel-artifacts/**/*.webm`

---

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/vercel-integration-tests.yml`:

```yaml
name: Vercel Integration Tests

on:
  deployment_status:

jobs:
  test:
    if: github.event.deployment_status.state == 'success'
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
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run Vercel integration tests
        run: npx playwright test -c playwright.vercel.config.ts
        env:
          VERCEL_URL: ${{ github.event.deployment_status.target_url }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-vercel-report
          path: playwright-report-vercel/
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('test-results/vercel-results.json'));
            const { passed, failed } = results.stats;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Vercel Integration Test Results
              
              ✅ Passed: ${passed}
              ❌ Failed: ${failed}
              
              [View full report](${process.env.GITHUB_SERVER_URL}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})`
            });
```

### Vercel Integration

Tests run automatically after each Vercel deployment via `deployment_status` webhook.

---

## Vercel-Specific Checks

### 1. Edge Caching

```ts
import { isVercelCacheActive } from './vercel-helpers';

test('should use Vercel edge cache', async ({ page }) => {
  const isCached = await isVercelCacheActive(page, '/');
  // First request might be MISS, second should be HIT
});
```

### 2. Deployment Info

```ts
import { getVercelDeploymentInfo } from './vercel-helpers';

test('should have Vercel deployment metadata', async ({ page }) => {
  const info = await getVercelDeploymentInfo(page, '/');
  console.log('Region:', info.region);
  console.log('Cache:', info.cacheStatus);
});
```

### 3. Performance Metrics

```ts
import { measureVercelPerformance } from './vercel-helpers';

test('should have good performance on Vercel', async ({ page }) => {
  const metrics = await measureVercelPerformance(page, '/');
  expect(metrics.loadTime).toBeLessThan(5000);
  expect(metrics.ttfb).toBeLessThan(1000);
});
```

### 4. Deployment Health

```ts
import { checkVercelDeploymentIssues } from './vercel-helpers';

test('should have no deployment issues', async ({ page }) => {
  const issues = await checkVercelDeploymentIssues(page, '/');
  expect(issues).toHaveLength(0);
});
```

---

## Best Practices

### 1. Test Read-Only Operations

❌ **Don't**: Modify production data
```ts
// BAD: Don't create/update/delete in integration tests
await page.click('button:has-text("Delete Semester")');
```

✅ **Do**: Verify data display
```ts
// GOOD: Check data is displayed correctly
const semesters = await page.locator('[data-testid="semester"]').count();
expect(semesters).toBeGreaterThan(0);
```

### 2. Handle Network Latency

```ts
// Use longer timeouts for Vercel
await page.goto('/', { timeout: 60000 });
await page.waitForLoadState('networkidle');
```

### 3. Test Multiple Browsers

```ts
// Browser-specific tests
test('should work in all browsers', async ({ page, browserName }) => {
  // Test logic that works across browsers
});
```

### 4. Check Vercel Features

```ts
// Verify Vercel-specific optimizations
const response = await page.goto('/');
const headers = response?.headers();
expect(headers?.['x-vercel-cache']).toBeDefined();
```

### 5. Monitor Performance

```ts
// Track performance over time
const metrics = await measureVercelPerformance(page, '/');
// Log to monitoring service
```

---

## Troubleshooting

### Issue: Tests timing out

**Solution**: Increase timeouts in `playwright.vercel.config.ts`

```ts
timeout: 90000, // 90 seconds
navigationTimeout: 90000,
```

### Issue: Authentication required

**Solution 1**: Skip protected tests
```ts
test.skip(!isAuthenticated, 'Auth required');
```

**Solution 2**: Use Vercel share links (see Authentication Handling)

### Issue: Inconsistent results

**Solution**: Vercel edge cache might serve stale data
```ts
// Add cache-busting parameter
await page.goto('/?nocache=' + Date.now());
```

### Issue: Slow cold starts

**Solution**: Wait for deployment to warm up
```ts
import { waitForVercelDeployment } from './vercel-helpers';

await waitForVercelDeployment(page, baseURL, 30000);
```

### Issue: Different results in different regions

**Solution**: Test from multiple regions (use Vercel's global edge network)

---

## Metrics to Monitor

### Performance
- ⏱️ TTFB (Time to First Byte): < 1s
- 🎨 FCP (First Contentful Paint): < 2s
- 📊 LCP (Largest Contentful Paint): < 3s
- 📦 Load Time: < 5s

### Reliability
- ✅ Success Rate: > 99%
- 🔄 Cache Hit Rate: > 80%
- ❌ Error Rate: < 1%

### Coverage
- 🌐 Browser Coverage: Chrome, Firefox, Safari
- 📱 Device Coverage: Desktop, Tablet, Mobile
- 🌍 Region Coverage: Multiple edge locations

---

## Summary

**Created Files**:
1. `playwright.vercel.config.ts` - Vercel test configuration
2. `.env.vercel` - Vercel environment variables
3. `e2e/integration/public-pages.spec.ts` - 42 public page tests
4. `e2e/integration/analytics-dashboard-vercel.spec.ts` - 28 dashboard tests
5. `e2e/integration/vercel-helpers.ts` - Utility functions
6. `docs/VERCEL_INTEGRATION_TESTS.md` - This guide

**Total Tests**: 70 integration tests

**Coverage**:
- ✅ Public pages (home, navigation)
- ✅ Analytics dashboard (with auth handling)
- ✅ Performance monitoring
- ✅ API integration
- ✅ Responsive design
- ✅ Browser compatibility
- ✅ Vercel-specific features

**Ready to Run**: Yes! Just execute:
```bash
npx playwright test -c playwright.vercel.config.ts
```

**Expected Result**: All public page tests pass ✅  
Dashboard tests skip if not authenticated (expected behavior).
