# CI Monitoring & Analysis Report
**Generated:** December 7, 2025  
**Repository:** yukimura-ixa/school-timetable-senior-project

---

## Executive Summary

### Current Status
- **Total Runs (last 10):** 10
- **Passed:** 4 ✅
- **Failed:** 4 ❌
- **In Progress:** 2 ⏳

### Failed Runs
1. **Run #204** - CI (FAILURE) - Created: 2025-12-07 14:28:18
2. **Run #37** - E2E Post-Run (FAILURE) - Created: 2025-12-07 10:26:09
3. **Run #385** - E2E Tests (FAILURE) - Created: 2025-12-07 10:10:52
4. **Run #203** - CI (FAILURE) - Created: 2025-12-07 10:10:52

---

## CI Workflow Status

### Recent Successful Runs ✅
- Run #265 - Push on main
- Run #264 - Push on main
- Run #263 - Push on main
- Run #146 - Smoke Tests

### Recent In-Progress Runs ⏳
- Run #386 - E2E Tests (Started: 2025-12-07 14:28:18)
- Run #147 - Smoke Tests (Started: 2025-12-07 14:28:18)

---

## Failure Analysis

### Pattern Recognition

**CI Runs (Runs #204, #203):**
- Both CI workflow runs have **failed**
- Time correlation: Created within 4 minutes of each other
- Likely root cause: Same code change or environment issue

**E2E Tests (Run #385):**
- E2E tests have failed
- May be related to database health or test infrastructure
- Often transient if infrastructure is unstable

**E2E Post-Run (Run #37):**
- Post-run processing failed
- Usually indicates artifact upload or reporting issues
- Secondary effect of primary E2E failure

---

## Current In-Progress Runs

### Run #386 - E2E Tests
- Status: In Progress (since 2025-12-07 14:28:18)
- **Action:** Monitor for completion
- Latest updates: Check GitHub Actions UI directly

### Run #147 - Smoke Tests  
- Status: In Progress (since 2025-12-07 14:28:18)
- **Action:** Monitor for completion
- If fails: May indicate infrastructure or test environment issues

---

## Recommended Actions

### Priority 1: Immediate Investigation
1. **Check latest commit** on main branch
   ```bash
   git log --oneline -5
   ```
   - May have introduced breaking changes
   - Check for recent package updates

2. **Review the recent cleanup changes**
   - Recent unused package/script removal may have affected CI
   - Check if any CI scripts were accidentally removed

3. **Check database health**
   ```bash
   pnpm test:db:logs
   ```
   - E2E failures often indicate DB connection issues

### Priority 2: Local Reproduction
Run tests locally to reproduce failures:

```bash
# Lint & TypeCheck
pnpm run lint
pnpm run typecheck

# Unit Tests
pnpm test

# E2E Tests (if DB available)
pnpm test:e2e:manual
```

### Priority 3: CI Configuration Review
1. Check GitHub Actions configuration:
   - `.github/workflows/ci.yml`
   - `.github/workflows/e2e-tests.yml`
   - `.github/workflows/smoke-tests.yml`

2. Verify environment variables in GitHub:
   - Database credentials
   - API keys
   - Build environment

3. Check resource constraints:
   - Runner memory/CPU limits
   - Timeout settings
   - Cache configuration

---

## Monitoring Tool Usage

### Check CI Status
```bash
# View last 10 runs, skip downloads
pwsh scripts/monitor-ci.ps1 -MaxRuns 10 -NoDownload

# Download artifacts from failed runs
pwsh scripts/monitor-ci.ps1 -MaxRuns 5

# Download all artifacts
pwsh scripts/monitor-ci.ps1 -DownloadAll
```

### Live Monitoring
```bash
# Watch GitHub Actions dashboard
https://github.com/yukimura-ixa/school-timetable-senior-project/actions
```

---

## Failure Recovery Steps

### If CI Workflow Fails

1. **Identify the root cause:**
   ```bash
   # Check git history for recent changes
   git log --oneline -10
   
   # Look at what changed in the latest commit
   git show HEAD --name-only
   ```

2. **Run locally to reproduce:**
   ```bash
   # Install dependencies
   pnpm install --frozen-lockfile
   
   # Generate Prisma client
   pnpm prisma generate
   
   # Run linting
   pnpm run lint
   
   # Run type checking
   pnpm run typecheck
   
   # Run tests
   pnpm test
   ```

3. **Fix and push:**
   ```bash
   # Make fixes
   git add .
   git commit -m "fix: resolve CI failures"
   git push origin main
   ```

### If E2E Tests Fail

1. **Check test database:**
   ```bash
   # View database logs
   pnpm test:db:logs
   
   # Restart database
   pnpm test:db:restart
   ```

2. **Run E2E tests locally:**
   ```bash
   # Ensure database is running
   pnpm test:db:up
   
   # Run migrations
   pnpm test:db:migrate
   
   # Seed test data
   pnpm test:db:seed
   
   # Run E2E tests
   pnpm test:e2e:manual
   ```

3. **Check for flaky tests:**
   - E2E tests can be flaky due to timing
   - Re-running often resolves transient issues
   - Check Playwright traces for actual errors

### If Smoke Tests Fail

1. **Check build output:**
   ```bash
   pnpm build
   ```

2. **Run smoke tests:**
   ```bash
   pnpm test:smoke
   ```

3. **Check for specific failures:**
   ```bash
   pnpm test:smoke:critical
   pnpm test:smoke:crud
   ```

---

## Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| CI Lint/TypeCheck | < 2 min | Check logs |
| Unit Tests | < 3 min | Check logs |
| Build | < 5 min | Check logs |
| Smoke Tests | < 3 min | Check logs |
| E2E Tests | < 15 min | Check logs |
| Total CI Time | < 30 min | Check logs |

---

## Common Issues & Solutions

### Issue: TypeScript Errors
```bash
pnpm run typecheck
# Fix errors and commit
```

### Issue: Lint Failures
```bash
pnpm run lint:fix  # Auto-fix formatting
pnpm run lint      # Check remaining issues
```

### Issue: Test Failures (Unit)
```bash
pnpm test          # Run all tests
pnpm test:watch    # Interactive debugging
```

### Issue: Test Failures (E2E)
```bash
pnpm test:e2e:debug         # Debug mode
pnpm test:e2e:headed        # See browser interactions
pnpm test:report            # View last report
```

### Issue: Build Failures
```bash
pnpm run build              # Check for build errors
pnpm run typecheck          # Type errors might cause build issues
```

---

## Next Steps

### Today
- [ ] Review recent commits
- [ ] Check if cleanup affected CI configuration
- [ ] Monitor in-progress runs (#386, #147)
- [ ] Verify local tests pass

### This Week
- [ ] Fix any identified issues
- [ ] Ensure all CI runs pass consistently
- [ ] Document any edge cases
- [ ] Review CI/CD pipeline efficiency

### Long-term
- [ ] Optimize test run times
- [ ] Reduce flaky test occurrences
- [ ] Improve error reporting
- [ ] Set up CI status notifications

---

## References

- **GitHub Actions UI:** https://github.com/yukimura-ixa/school-timetable-senior-project/actions
- **Workflows Directory:** `.github/workflows/`
- **Monitoring Script:** `scripts/monitor-ci.ps1`
- **Test Configuration:** `playwright.config.ts`, `vitest.config.ts`

---

**Report Generated By:** CI Monitoring Tool  
**Last Updated:** 2025-12-07 21:31:47 UTC  
**Data Source:** GitHub Actions API via gh CLI
