# Quick Start: Monitor Test Results

## Real-Time Monitoring

### 1. View Test Report (HTML - Interactive)
```bash
pnpm exec playwright show-report
```
This opens the Playwright HTML report in your default browser with:
- Test status (passed/failed/skipped)
- Execution times
- Screenshots, videos, traces on failure
- Full test list with details

### 2. Stream Log Output (Live)
```bash
Get-Content test-results/full-suite-*.log -Wait
```
Shows live test output as tests execute

### 3. Check JSON Results (Once complete)
```bash
cat test-results/results.json | jq '.stats'
```
Returns test statistics in JSON format

### 4. View JUnit XML (CI Integration)
```bash
Get-Content test-results/results.xml | Select-Object -First 100
```

## After Tests Complete

### 1. Overall Summary
```bash
# Count passed/failed/skipped
jq '.stats' test-results/results.json
```

### 2. Find Failed Tests
```bash
jq '.tests[] | select(.status == "failed") | {title: .title, error: .error}' test-results/results.json
```

### 3. Check Drag-and-Drop Specific Results
```bash
jq '.tests[] | select(.title | contains("drag") or contains("DND")) | {title: .title, status: .status, duration: .duration}' test-results/results.json
```

### 4. Review Execution Times
```bash
jq '.tests | sort_by(-.duration) | .[0:10] | .[] | {title: .title, duration: .duration}' test-results/results.json
```

## Key Success Metrics

✅ **All drag-and-drop tests execute** (not skipped)
```bash
jq '.tests[] | select(.title | contains("drag")) | {title: .title, status: .status}' test-results/results.json
```

✅ **Failure rate < 5%**
```bash
jq '{passed: ([.tests[] | select(.status == "passed")] | length), failed: ([.tests[] | select(.status == "failed")] | length), total: (.tests | length)}' test-results/results.json
```

✅ **No timeout errors**
```bash
jq '.tests[] | select(.error | contains("timeout")) | {title: .title, error: .error}' test-results/results.json
```

## File Locations

| Item | Path |
|------|------|
| **Log Output** | `test-results/full-suite-*.log` |
| **JSON Results** | `test-results/results.json` |
| **JUnit XML** | `test-results/results.xml` |
| **HTML Report** | `playwright-report/index.html` |
| **Test Artifacts** | `playwright-report/` |
| **Summary** | `PRODUCTION_TEST_RUN_20251210.md` |

## Expected Results

### Drag-and-Drop Tests (Most Important)
```
✅ TC-DND-001: Subject list drag operations (4 tests) - SHOULD PASS
✅ TC-DND-002: Between timeslots (3 tests) - RE-ENABLED, SHOULD PASS
✅ TC-DND-003: Conflict detection (3 tests) - RE-ENABLED, SHOULD PASS
✅ TC-DND-004: Lock state behavior (3 tests) - RE-ENABLED, SHOULD PASS
✅ TC-DND-006: Student arrange page (2 tests) - RE-ENABLED, SHOULD PASS
✅ TC-DND-007: Performance & edge cases (2 tests) - RE-ENABLED, SHOULD PASS
```

### Overall Expectations
- **Total Tests:** 1000+
- **Target Pass Rate:** >95% (improvement from 70% with skipped tests)
- **Target Failure Rate:** <5%
- **Timeout Issues:** 0
- **Database Errors:** 0
- **Expected Duration:** 20-30 minutes

## Debugging Failed Tests

If tests fail:

1. **Get the test name and error:**
   ```bash
   jq '.tests[] | select(.status == "failed") | {title: .title, error: .error}' test-results/results.json | head -20
   ```

2. **Check the HTML report for traces:**
   - Open `playwright-report/index.html`
   - Find the failed test
   - Review screenshots, videos, and trace files

3. **Run a specific test to debug:**
   ```bash
   pnpm exec playwright test --grep "test name" --headed
   ```

4. **Check server logs:**
   - Review Next.js compilation errors
   - Check database connection issues
   - Look for timeout patterns

## Cleanup

Once tests complete and you've reviewed results:

```bash
# Optional: Clean up test artifacts (keeps reports)
rm -r playwright-report/test-results

# Optional: Full cleanup (keeps summary)
docker-compose -f docker-compose.test.yml down
```

## Related Information

- **Commit:** 60decdc (drag-and-drop fix)
- **Issue:** #162 (drag-and-drop flakiness)
- **Test File:** e2e/08-drag-and-drop.spec.ts
- **Playwright Docs:** https://playwright.dev/docs/test-reports

---

**Status:** Tests running. Check back in ~25 minutes for full results.
