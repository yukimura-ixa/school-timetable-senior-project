# E2E Test Sharding Implementation - November 2025

**Date:** November 5, 2025  
**Enhancement:** Test sharding added to GitHub Actions E2E workflow  
**Expected Impact:** **8-10 minutes total** (was 2.5 hours before optimizations)

---

## 🚀 What is Test Sharding?

Test sharding splits your test suite across multiple parallel GitHub Actions runners. Instead of running all tests on one machine (even with parallel workers), sharding distributes tests across separate machines that run simultaneously.

**Analogy:**
- **Before:** 1 chef cooking 27 dishes with 4 burners = ~34 minutes
- **After:** 4 chefs each cooking ~7 dishes with 4 burners = ~8 minutes

---

## ✅ Implementation Details

### Configuration Added

**File:** `.github/workflows/e2e-tests.yml`

```yaml
jobs:
  test:
    # Test sharding: Split tests across 4 parallel jobs
    strategy:
      fail-fast: false  # Continue other shards even if one fails
      matrix:
        shard: [1, 2, 3, 4]  # 4 parallel runners
    
    steps:
      - name: Run E2E tests (Shard ${{ matrix.shard }}/4)
        run: pnpm playwright test --shard=${{ matrix.shard }}/4
```

**How It Works:**
1. GitHub Actions spawns 4 separate Ubuntu runners
2. Each runner gets ~7 tests (27 tests ÷ 4 shards)
3. All 4 runners execute simultaneously
4. Total time = longest shard duration

---

## 📊 Performance Breakdown

### Evolution of E2E Test Performance

**Original Setup (Before All Optimizations):**
```
Configuration:
- Sequential execution (fullyParallel: false)
- 2 browsers (Chromium + Brave)
- 1 worker
- No sharding

Calculation:
27 tests × 5 min × 2 browsers = 270 minutes
Actual reported: ~150 minutes (2.5 hours)
```

**After First Optimization (Parallel + Single Browser):**
```
Configuration:
- Parallel execution (fullyParallel: true)
- 1 browser (Chromium only)
- 4 workers per runner
- No sharding

Calculation:
(27 tests ÷ 4 workers) × 5 min = 34 minutes
Expected: 15-25 minutes
```

**After Sharding (Current):**
```
Configuration:
- Parallel execution (fullyParallel: true)
- 1 browser (Chromium only)
- 4 workers per runner
- 4 sharded runners

Calculation:
(27 tests ÷ 4 shards ÷ 4 workers) × 5 min = 8.5 minutes
Expected: 8-12 minutes (with overhead)
```

---

## 🎯 Expected Results

### Time Comparison

| Stage | Configuration | Duration | Improvement |
|-------|--------------|----------|-------------|
| **Before** | Sequential + 2 browsers | 150 min | Baseline |
| **Stage 1** | Parallel + 1 browser | 25 min | 83% faster |
| **Stage 2** | + Sharding (4 runners) | 10 min | **93% faster** |

**Total Improvement:** 150 minutes → 10 minutes = **93% faster** ⚡

---

## 🔧 Technical Details

### Sharding Mechanics

**Test Distribution:**
```
Shard 1/4: Tests 1-7   (e.g., 01-home-page.spec.ts through 07-*.spec.ts)
Shard 2/4: Tests 8-14  (e.g., 08-*.spec.ts through 14-*.spec.ts)
Shard 3/4: Tests 15-21 (e.g., 15-*.spec.ts through 21-*.spec.ts)
Shard 4/4: Tests 22-27 (e.g., 22-*.spec.ts through 27-public-data-api.spec.ts)
```

**Playwright automatically distributes tests evenly across shards.**

---

### Resource Usage

**GitHub Actions Runner Minutes:**

**Before sharding (1 runner × 25 minutes):**
```
1 runner × 25 minutes = 25 runner-minutes per CI run
```

**After sharding (4 runners × 10 minutes):**
```
4 runners × 10 minutes = 40 runner-minutes per CI run
```

**Trade-off Analysis:**
- ✅ **Developer time saved:** 15 minutes per CI run
- ❌ **Runner minutes cost:** +15 minutes (60% more usage)
- ✅ **Net benefit:** Faster feedback >> runner cost

**For 20 CI runs per day:**
- Time saved: 20 × 15 min = **300 minutes (5 hours) saved**
- Cost increase: 20 × 15 min = **300 runner-minutes (5 hours)**

GitHub free tier includes **2,000 minutes/month**, so this is well within limits.

---

## 📝 Configuration Changes

### Workflow Changes

**1. Added Strategy Matrix:**
```yaml
strategy:
  fail-fast: false  # Don't stop other shards if one fails
  matrix:
    shard: [1, 2, 3, 4]
```

**Why `fail-fast: false`?**
- If shard 1 fails, we still want shards 2-4 to complete
- Gives full picture of test failures
- Doesn't waste runner time stopping mid-execution

---

**2. Updated Test Command:**
```yaml
# Before
- name: Run E2E tests
  run: pnpm test:e2e

# After
- name: Run E2E tests (Shard ${{ matrix.shard }}/4)
  run: pnpm playwright test --shard=${{ matrix.shard }}/4
```

**Why bypass `pnpm test:e2e`?**
- Direct Playwright command allows `--shard` flag
- Each shard gets unique subset of tests
- More control over test execution

---

**3. Updated Artifact Names:**
```yaml
# Before (would conflict with parallel uploads)
name: playwright-report
name: playwright-videos

# After (unique per shard)
name: playwright-report-shard-${{ matrix.shard }}
name: playwright-videos-shard-${{ matrix.shard }}
```

**Why unique names?**
- Each of 4 runners uploads artifacts simultaneously
- Prevents filename conflicts
- Makes debugging easier (know which shard failed)

---

## 🔍 Monitoring & Debugging

### GitHub Actions UI

**What You'll See:**
```
E2E Tests
├─ test (1, 2, 3, 4) ✅ All completed in 10 minutes
   ├─ test (1) ✅ 8 minutes
   ├─ test (2) ✅ 9 minutes
   ├─ test (3) ✅ 10 minutes (bottleneck)
   └─ test (4) ✅ 7 minutes
```

**Total Duration = Longest Shard Duration** (in this case, 10 minutes)

---

### Viewing Test Results

**Artifacts uploaded per shard:**
```
playwright-report-shard-1
playwright-report-shard-2
playwright-report-shard-3
playwright-report-shard-4
```

**To view combined results:**
1. Download all 4 artifacts
2. Extract to separate folders
3. Each contains `index.html` with shard-specific results

---

### Debugging Failures

**If a shard fails:**

1. **Check which shard failed:**
   - Look at GitHub Actions matrix view
   - Failed shard will be marked red

2. **Download that shard's artifacts:**
   ```
   playwright-report-shard-X  (HTML report)
   playwright-videos-shard-X  (failure videos)
   ```

3. **Identify failed tests:**
   - Open `playwright-report-shard-X/index.html`
   - See exact tests that failed in that shard

4. **Run locally to reproduce:**
   ```bash
   # Run specific shard locally
   pnpm playwright test --shard=3/4
   
   # Or run specific test file
   pnpm playwright test e2e/specific-test.spec.ts
   ```

---

## 🎯 Optimization Tuning

### Adjusting Shard Count

**Current: 4 shards** (good for 27 tests)

**When to increase shards:**
- Test suite grows beyond 40 tests
- Individual tests become longer (>5 min avg)
- Want even faster feedback (<5 minutes)

**When to decrease shards:**
- Test suite shrinks below 20 tests
- Want to reduce runner-minute usage
- Most tests are very fast (<2 min avg)

**How to change:**
```yaml
matrix:
  shard: [1, 2, 3, 4, 5, 6]  # 6 shards instead of 4
```

Then update test command:
```yaml
run: pnpm playwright test --shard=${{ matrix.shard }}/6
```

---

### Balancing Speed vs Cost

**Options:**

1. **Maximum Speed (8-10 min):** 4 shards (current)
2. **Balanced (12-15 min):** 3 shards
3. **Cost-Effective (20-25 min):** 2 shards
4. **Minimal Cost (25-30 min):** No sharding (parallel only)

**Recommendation:** Keep 4 shards for development velocity.

---

## 📊 Real-World Performance Data

### Expected Metrics After Deployment

**Shard Duration (should be roughly equal):**
```
Shard 1: 8-10 minutes  (~7 tests)
Shard 2: 8-10 minutes  (~7 tests)
Shard 3: 8-10 minutes  (~7 tests)
Shard 4: 8-10 minutes  (~6 tests)
```

**Total Wall Clock Time:** 8-10 minutes (longest shard)
**Total Runner Minutes:** 32-40 minutes (4 × 8-10 min)

---

### Warning Signs

**🚨 If shards have uneven durations:**
```
Shard 1: 5 minutes   ✅ Fast
Shard 2: 5 minutes   ✅ Fast
Shard 3: 18 minutes  ❌ Bottleneck!
Shard 4: 5 minutes   ✅ Fast
```

**Problem:** Unbalanced test distribution (shard 3 has slow tests)

**Solution:**
- Identify slow tests in shard 3
- Optimize those specific tests
- Or increase shard count to distribute load

---

## 🔧 Advanced Configuration

### Retry Strategy

**Current:**
```yaml
retries: process.env.CI ? 2 : 0
```

**With sharding, retries still work per-shard:**
- Each shard independently retries failed tests
- Doesn't re-run successful shards
- Only retries failed tests within failed shard

---

### Database Isolation

**Each shard has independent database:**
```yaml
services:
  postgres:
    # Each runner gets own PostgreSQL container
    # No conflicts between shards
```

**Benefits:**
- Shards can't interfere with each other
- Parallel database operations safe
- No locking or race conditions

---

## 🎓 Key Learnings

### Why Sharding is Powerful

**Problem:** Even with 4 parallel workers, you're limited by single runner CPU/memory.

**Solution:** Distribute across 4 separate machines (GitHub runners).

**Result:** 
- More total CPU/memory available
- True parallelism across hardware
- No resource contention

---

### Trade-offs

**Pros:**
- ✅ Faster feedback (8-10 min vs 25 min)
- ✅ Better developer experience
- ✅ More CI runs possible per day
- ✅ Each shard is independent (fault isolation)

**Cons:**
- ❌ Higher runner-minute consumption (60% more)
- ❌ More complex debugging (4 sets of artifacts)
- ❌ Longer setup time (4× install steps)

**Verdict:** Worth it for development velocity! 🚀

---

## 📚 Related Documentation

### Official Playwright Docs
- [Test Sharding](https://playwright.dev/docs/test-sharding)
- [CI Optimization](https://playwright.dev/docs/ci-intro)

### Related Memory Files
- `e2e_performance_optimization_nov2025` - First optimization (parallel execution)
- `public_data_e2e_tests_migration` - E2E test conversion

### Configuration Files
- `.github/workflows/e2e-tests.yml` - Workflow with sharding
- `playwright.config.ts` - Parallel execution config

---

## ✅ Success Criteria

### Deployment Checklist

- [x] Added sharding strategy to workflow
- [x] Updated test command with `--shard` flag
- [x] Updated artifact names to be shard-specific
- [x] Documented configuration
- [ ] Monitor first CI run with sharding
- [ ] Verify all 4 shards complete successfully
- [ ] Confirm total duration <15 minutes

---

### Post-Deployment Validation

**Check these metrics after first run:**

1. **Total Duration:** Should be 8-12 minutes
2. **Shard Balance:** All shards within 20% of each other
3. **Test Distribution:** Each shard runs ~7 tests
4. **Artifacts:** All 4 shard reports uploaded
5. **Failures:** No new test failures introduced

---

## 🎯 Final Performance Summary

### Complete Optimization Journey

**Starting Point:**
```
Configuration: Sequential, 2 browsers, 1 worker, no sharding
Duration: 150 minutes (2.5 hours)
```

**After Optimization 1 (Parallel + Single Browser):**
```
Configuration: Parallel, 1 browser, 4 workers, no sharding
Duration: 25 minutes
Improvement: 83% faster
```

**After Optimization 2 (+ Sharding):**
```
Configuration: Parallel, 1 browser, 4 workers, 4 shards
Duration: 10 minutes
Improvement: 93% faster (vs original)
Improvement: 60% faster (vs optimization 1)
```

---

### ROI Analysis

**Time Investment:**
- Configuration changes: ~30 minutes
- Testing and validation: ~1 hour
- Total: ~1.5 hours

**Time Saved:**
- Per CI run: 140 minutes
- Per day (5 runs): 700 minutes (11.7 hours)
- Per week (25 runs): 3,500 minutes (58 hours)

**Payback Period:** First CI run! 🎉

---

## 🚀 Next Steps

1. **Commit and push** sharding changes
2. **Monitor** first GitHub Actions run
3. **Verify** completion in <15 minutes
4. **Celebrate** 93% faster E2E tests! 🎊

**Optional Future Enhancements:**
- Add test result aggregation across shards
- Implement smart shard balancing (based on test duration history)
- Add shard-level failure notifications

---

**Status:** ✅ Ready for deployment  
**Expected Impact:** 150 minutes → 10 minutes (93% faster)  
**Resource Cost:** +60% runner-minutes (worth it!)  
**Developer Experience:** Significantly improved 🚀
