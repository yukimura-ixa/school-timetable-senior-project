# Vercel Integration Tests - Quick Reference

## 🚀 Run Commands

```bash
# All tests, all browsers
npx playwright test -c playwright.vercel.config.ts

# Public pages only (recommended first run)
npx playwright test -c playwright.vercel.config.ts e2e/integration/public-pages.spec.ts

# Chromium only (fastest)
npx playwright test -c playwright.vercel.config.ts --project=chromium

# With UI (interactive)
npx playwright test -c playwright.vercel.config.ts --ui

# View report
npx playwright show-report playwright-report-vercel
```

## 📂 File Structure

```
├── playwright.vercel.config.ts          # Vercel test config
├── .env.vercel                          # Vercel environment
├── e2e/integration/
│   ├── public-pages.spec.ts             # 42 public page tests ✅
│   ├── analytics-dashboard-vercel.spec.ts # 28 dashboard tests ⏭️
│   └── vercel-helpers.ts                # Utility functions
└── docs/
    ├── VERCEL_INTEGRATION_TESTS.md      # Complete guide
    └── VERCEL_INTEGRATION_TESTS_SUMMARY.md # This summary
```

## ✅ Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Public Pages | 42 | ✅ Ready |
| Dashboard | 28 | ⏭️ Auth required |
| **Total** | **70** | **Ready to run** |

## 🌐 Browsers Tested

- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop)
- ✅ WebKit/Safari (Desktop)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 13)

## 📊 What Gets Verified

### Every Test Run
- ✅ Deployment is live (200 OK)
- ✅ No JavaScript errors
- ✅ No server errors (500s)
- ✅ Page loads within 5-10s
- ✅ Responsive at all sizes
- ✅ Vercel edge cache working
- ✅ API endpoints responding

### Performance Baselines
- ⏱️ Load Time: < 5s
- 🚀 TTFB: < 1s
- 🎨 FCP: < 2s
- 📊 LCP: < 3s

## 🔧 Environment Variables

```env
# .env.vercel
VERCEL_URL=https://phrasongsa-timetable.vercel.app

# Override for preview deployments
VERCEL_URL=https://your-preview.vercel.app
```

## 📈 CI/CD Integration

```yaml
# .github/workflows/vercel-integration-tests.yml
on:
  deployment_status:

jobs:
  test:
    if: github.event.deployment_status.state == 'success'
    steps:
      - run: npx playwright test -c playwright.vercel.config.ts
```

## 🎯 Common Use Cases

### Test Production Deployment
```bash
npx playwright test -c playwright.vercel.config.ts
```

### Test Preview Deployment
```bash
VERCEL_URL=https://preview.vercel.app npx playwright test -c playwright.vercel.config.ts
```

### Test Specific Page
```bash
npx playwright test -c playwright.vercel.config.ts -g "home page"
```

### Debug Failing Test
```bash
npx playwright test -c playwright.vercel.config.ts --debug
```

## 📝 Quick Tips

### ✅ Do
- Run public page tests first
- Test after each deployment
- Monitor performance trends
- Use multiple browsers
- Check edge caching

### ❌ Don't
- Modify production data
- Run too frequently (rate limits)
- Expect instant results (cold starts)
- Skip error handling tests
- Ignore performance regressions

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase `timeout: 90000` in config |
| Auth required | Tests auto-skip (expected) |
| Cache issues | Add `?nocache=` parameter |
| Cold start slow | Use `waitForVercelDeployment()` |
| Flaky tests | Add retries: `retries: 2` |

## 📚 Documentation

- **Full Guide**: `docs/VERCEL_INTEGRATION_TESTS.md`
- **Summary**: `docs/VERCEL_INTEGRATION_TESTS_SUMMARY.md`
- **Quick Ref**: This file

## 🎉 Success Checklist

- [x] Configuration created
- [x] 70 tests written
- [x] Helper utilities ready
- [x] Documentation complete
- [ ] First test run (run command above)
- [ ] CI/CD integrated (optional)
- [ ] Performance baseline set (optional)

## 🚀 Get Started Now

```bash
# 1. Run tests (2-3 minutes)
npx playwright test -c playwright.vercel.config.ts e2e/integration/public-pages.spec.ts --project=chromium

# 2. View report
npx playwright show-report playwright-report-vercel

# 3. Done! 🎉
```

**Expected Result**: 42/42 passing ✅

---

**Quick Help**: See `docs/VERCEL_INTEGRATION_TESTS.md` for complete guide.
