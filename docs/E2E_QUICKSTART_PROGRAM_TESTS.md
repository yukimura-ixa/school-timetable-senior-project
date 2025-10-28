# Quick Start: E2E Tests for Program/Activity Management

## 🚀 Running the Tests

### Prerequisites
```powershell
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Ensure database is seeded
pnpm prisma db seed
```

### Run Tests (Choose One)

#### Option 1: UI Mode (Recommended - Interactive)
```powershell
pnpm test:e2e:ui
# Then select:
# - e2e/10-program-subject-assignment.spec.ts
# - e2e/11-activity-management.spec.ts
```

#### Option 2: Headless (CI-like)
```powershell
pnpm test:e2e e2e/10-program-subject-assignment.spec.ts e2e/11-activity-management.spec.ts
```

#### Option 3: Headed (See Browser)
```powershell
pnpm test:e2e:headed e2e/10-program-subject-assignment.spec.ts
pnpm test:e2e:headed e2e/11-activity-management.spec.ts
```

#### Option 4: Debug Mode
```powershell
pnpm test:e2e:debug e2e/10-program-subject-assignment.spec.ts
```

---

## 📋 What's Being Tested

### File 1: `10-program-subject-assignment.spec.ts`
- ✅ Create program → Assign subjects with custom credits
- ✅ Edit MinCredits/MaxCredits per subject
- ✅ Toggle mandatory status
- ✅ MOE validation feedback (compliant/errors/warnings)
- ✅ Invalid credit scenarios
- ✅ Program-to-gradelevel assignment

### File 2: `11-activity-management.spec.ts`
- ✅ Create activity (CLUB/SCOUT/GUIDANCE/SOCIAL_SERVICE)
- ✅ Edit activity details
- ✅ Delete activity with confirmation
- ✅ Cancel deletion
- ✅ Form validation
- ✅ Table auto-refresh
- ✅ Empty state

---

## 📊 View Test Results

```powershell
# After test run, view HTML report
pnpm playwright show-report

# Screenshots saved to:
# test-results/screenshots/
```

---

## 🐛 Troubleshooting

### Tests Fail to Start
```powershell
# Install Playwright browsers
pnpm exec playwright install chromium
```

### Element Not Found
- Check if dev server is running (`http://localhost:3000`)
- Verify database is seeded
- Ensure authentication is bypassed or admin logged in

### Slow/Timeout Errors
- Increase timeout in `playwright.config.ts`: `actionTimeout: 30000`
- Check network speed (tests use `networkidle`)

---

## 🎯 Test Coverage Summary

| Feature | Tests | Status |
|---------|-------|--------|
| Program creation | 2 | ✅ |
| Subject assignment (editable credits) | 4 | ✅ |
| MOE validation | 2 | ✅ |
| Gradelevel assignment | 1 | ✅ |
| Activity CRUD | 7 | ✅ |
| Form validation | 2 | ✅ |
| **Total** | **18** | ✅ |

---

## 📚 Documentation

Full details: `docs/E2E_TESTS_MOE_PROGRAM.md`
