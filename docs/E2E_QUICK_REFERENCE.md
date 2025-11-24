# E2E Test Quick Reference Card

**Updated:** 2025-11-21 | **Phase 1:** E2E Test Reliability

---

## 🚀 Quick Start

### Standard Test Pattern

```typescript
import { test, expect } from "./fixtures/admin.fixture";

test("feature description", async ({ authenticatedAdmin }) => {
  const { page } = authenticatedAdmin;

  await page.goto("/your-route");
  await expect(page.locator("h1")).toBeVisible();

  // Your test logic...
});
```

---

## ✅ Web-First Cheat Sheet

| ❌ **DON'T**                          | ✅ **DO**                                          |
| ------------------------------------- | -------------------------------------------------- |
| `await page.waitForTimeout(3000)`     | `await expect(locator).toBeVisible()`              |
| `await page.waitForSelector("h1")`    | `await expect(page.locator("h1")).toBeVisible()`   |
| `await page.waitForLoadState()`       | `await expect(page.locator("main")).toBeVisible()` |
| `page.goto("/url", {waitUntil: 'X'})` | `page.goto("/url")` + `expect().toBeVisible()`     |
| `if (await el.isVisible())`           | `await expect(el).toBeVisible()`                   |

---

## 🔑 Common Assertions

```typescript
// Visibility
await expect(page.locator("button")).toBeVisible();
await expect(page.locator("error")).toBeHidden();

// Text
await expect(page.locator("h1")).toHaveText("Welcome");
await expect(page.locator("p")).toContainText("success");

// URL
await expect(page).toHaveURL(/\/dashboard/);

// State
await expect(page.locator("checkbox")).toBeChecked();
await expect(page.locator("button")).toBeEnabled();

// Count
await expect(page.locator("li")).toHaveCount(5);
```

---

## 🔒 Authentication

### Authenticated Test (99% of cases)

```typescript
test("example", async ({ authenticatedAdmin }) => {
  const { page, session } = authenticatedAdmin;
  // Already logged in as admin@test.com
});
```

### Public Test (rare)

```typescript
test("public page", async ({ page }) => {
  // No authentication
});
```

---

## 🛠️ Migration Tools

### Migrate Files

```powershell
# Preview
.\scripts\migrate-e2e-tests.ps1 -DryRun

# Apply
.\scripts\migrate-e2e-tests.ps1
```

### Run Tests

```powershell
# All tests
pnpm test:e2e

# Single file
pnpm playwright test 01-home-page.spec.ts

# UI mode (recommended)
pnpm test:e2e:ui

# Debug mode
pnpm playwright test file.spec.ts --headed --debug
```

---

## 📚 Full Documentation

- **Migration Guide:** `docs/E2E_MIGRATION_GUIDE.md`
- **Progress Report:** `docs/E2E_FIXTURE_CONSOLIDATION_PROGRESS.md`
- **Session Summary:** `docs/E2E_SESSION_SUMMARY_2025-11-21.md`
- **Fixture Docs:** `e2e/fixtures/admin.fixture.ts` (header comments)

---

## ⚠️ Common Pitfalls

1. ❌ Mixing `@playwright/test` with `admin.fixture`
2. ❌ Using `waitForTimeout()` (use web-first)
3. ❌ Manual authentication in tests
4. ❌ Waiting for "everything to load"
5. ❌ Using `page` and `authenticatedAdmin` together

---

## 🎯 Success Checklist

- [ ] Import from `./fixtures/admin.fixture`
- [ ] Use `authenticatedAdmin` fixture
- [ ] No `waitForTimeout()` in test code
- [ ] All assertions are web-first
- [ ] Page actions wait for element visibility

---

**Need Help?** See full migration guide or fixture documentation above.
