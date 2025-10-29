# Analytics Dashboard E2E Tests

**Complete test suite for the Analytics Dashboard feature**

## Test Coverage

### Total: 54 Test Scenarios

1. **Dashboard Visibility** (4 tests)
   - Header display with emoji and title
   - Expand/collapse button presence
   - Default expanded state
   - Conditional display (only when semesters exist)

2. **Collapse/Expand Functionality** (5 tests)
   - Collapse on button click
   - Expand on second click
   - Smooth animation transitions
   - Icon toggle (ExpandMore ↔ ExpandLess)
   - Animation completion timing

3. **Overview Statistics Cards** (5 tests)
   - Display all 4 stat cards
   - Numeric values for each stat
   - Icons for each card
   - Tooltip functionality (optional)
   - Average completeness validation (0-100%)

4. **Status Distribution Section** (4 tests)
   - Section visibility
   - All 4 status types (Draft, Published, Locked, Archived)
   - Progress bars for each status
   - Percentage sum validation (~100%)

5. **Completeness Distribution Section** (4 tests)
   - Section visibility
   - 3 completeness ranges (Low <31%, Medium 31-79%, High 80%+)
   - Color coding (red/orange/green)
   - Percentage sum validation (100%)

6. **Resource Totals Section** (5 tests)
   - Section visibility
   - All 4 resource types (Classes, Teachers, Subjects, Rooms)
   - Numeric counts
   - Icons for each resource
   - 4-column responsive layout on desktop

7. **Academic Year Distribution Section** (5 tests)
   - Section visibility
   - Maximum 5 years displayed
   - Progress bars
   - Percentage displays
   - Descending sort by count

8. **Responsive Design** (3 tests)
   - Tablet viewport adaptation (768px)
   - Mobile viewport adaptation (375px)
   - Readable text on all screen sizes

9. **Loading States** (2 tests)
   - Skeleton display during initial load
   - Smooth transition from skeleton to dashboard

10. **Data Accuracy** (2 tests)
    - Total semesters match semester count
    - All statistics are non-negative

11. **Accessibility** (4 tests)
    - Keyboard navigation
    - Enter key activation on toggle button
    - Proper heading hierarchy
    - Progress bars with role="progressbar"

12. **Performance** (3 tests)
    - Dashboard renders within 2 seconds
    - Collapse/expand completes within 1 second
    - No layout shifts

13. **Edge Cases** (3 tests)
    - Zero semesters handled gracefully
    - All semesters with same status
    - Extreme values (100% completeness)

## Test File Structure

```
e2e/
└── dashboard/
    └── analytics-dashboard.spec.ts (54 tests, 715 lines)
```

## Authentication

Tests use **dev bypass mode** configured in `.env.test`:

```env
ENABLE_DEV_BYPASS=true
DEV_USER_EMAIL=admin@test.local
DEV_USER_NAME=E2E Admin
DEV_USER_ROLE=admin
```

No manual authentication required - protected routes automatically authenticate with test user.

## Running the Tests

### Run All Dashboard Tests

```bash
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts
```

### Run Specific Test Suite

```bash
# Visibility tests only
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts -g "Dashboard Visibility"

# Performance tests only
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts -g "Performance"

# Responsive tests only
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts -g "Responsive Design"
```

### Run with UI Mode (Interactive)

```bash
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts --ui
```

### Run with Debug Mode

```bash
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts --debug
```

### Generate HTML Report

```bash
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts
npx playwright show-report
```

## Test Configuration

From `playwright.config.ts`:

- **Base URL**: http://localhost:3000
- **Test Directory**: ./e2e
- **Workers**: 1 (sequential execution)
- **Timeout**: 30 seconds per test
- **Retries**: 2 on failure
- **Screenshots**: On failure only
- **Videos**: Retain on failure
- **Trace**: On first retry

## Expected Results

All 54 tests should **PASS** ✅ if:

1. Analytics dashboard is implemented correctly
2. All 13 statistics are calculated properly
3. All 6 sections display correctly
4. Collapse/expand functionality works
5. Responsive layout adapts to all screen sizes
6. Loading states transition smoothly
7. Data accuracy is maintained

## Test Data Requirements

Tests assume:

- At least 1 semester exists in the database (for full coverage)
- Semesters have varied statuses (Draft, Published, Locked, Archived)
- Semesters have different completeness percentages
- Multiple academic years represented
- Resource data (classes, teachers, subjects, rooms) exists

For **zero semester testing**, the edge case test verifies graceful handling.

## Troubleshooting

### Test Failures

1. **Auth-related failures**:
   - Verify `.env.test` has `ENABLE_DEV_BYPASS=true`
   - Check that dev bypass is implemented in `proxy.ts`

2. **Timeout failures**:
   - Increase timeout in `playwright.config.ts`
   - Check network speed (slow API responses)

3. **Element not found**:
   - Verify dashboard is integrated in `page.tsx`
   - Check that semesters exist in database
   - Ensure `showAnalytics` default is `true`

4. **Percentage sum failures**:
   - Rounding errors may cause ±1% variance
   - Tests allow 99-101% range

5. **Layout shift failures**:
   - Check for dynamic content loading after initial render
   - Verify skeleton matches dashboard structure exactly

### Debug Commands

```bash
# Run single test with trace
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts -g "should display dashboard header" --trace on

# Run with headed browser (visible)
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts --headed

# Run with slowmo (slowed down for observation)
npx playwright test e2e/dashboard/analytics-dashboard.spec.ts --headed --slow-mo 1000
```

## Coverage Gaps (Future Enhancements)

These scenarios are **not yet covered** and could be added:

1. **API Error Handling**: Test dashboard behavior when API fails
2. **Real-time Updates**: Test dashboard updates when semesters change
3. **Export Functionality**: Test CSV/Excel export from dashboard (if added)
4. **Filtering**: Test dashboard statistics with applied filters (if added)
5. **Multi-user Scenarios**: Test concurrent access (requires multiple sessions)
6. **Pagination Integration**: Test dashboard with paginated semester lists
7. **Search Integration**: Test dashboard with active search filters

## Integration with CI/CD

### GitHub Actions Example

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
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npx playwright test e2e/dashboard/analytics-dashboard.spec.ts
        env:
          ENABLE_DEV_BYPASS: true
          DEV_USER_EMAIL: admin@test.local
          DEV_USER_NAME: E2E Admin
          DEV_USER_ROLE: admin
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Maintenance

### When to Update Tests

1. **UI Changes**: Update selectors if component structure changes
2. **New Features**: Add tests for new statistics or sections
3. **Breaking Changes**: Update expectations if data format changes
4. **MUI Updates**: Verify component selectors after MUI upgrades
5. **Performance Thresholds**: Adjust timeout expectations based on hardware

### Best Practices

- Keep tests independent (no shared state)
- Use semantic selectors (`text=/.../, data-testid`)
- Avoid brittle CSS class selectors
- Test user behavior, not implementation
- Keep assertions specific and meaningful

## Related Documentation

- [ANALYTICS_DASHBOARD_SUMMARY.md](../docs/ANALYTICS_DASHBOARD_SUMMARY.md) - Implementation details
- [ANALYTICS_DASHBOARD_TESTING_CHECKLIST.md](../docs/ANALYTICS_DASHBOARD_TESTING_CHECKLIST.md) - Manual testing guide
- [playwright.config.ts](../playwright.config.ts) - Test configuration
- [.env.test](../.env.test) - Test environment setup

## Credits

**Tests Created**: Based on Analytics Dashboard feature implementation (600 lines)  
**Test Framework**: Playwright with TypeScript  
**Coverage**: 54 comprehensive test scenarios  
**Status**: ✅ Ready to run
