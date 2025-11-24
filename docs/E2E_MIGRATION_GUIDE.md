# E2E Test Migration Guide

**Date:** 2025-11-21  
**Phase:** Phase 1 - E2E Test Reliability  
**Objective:** Migrate all E2E tests to use admin.fixture and web-first assertions

---

## Quick Start

### Automated Migration

```powershell
# Preview changes (dry run)
.\scripts\migrate-e2e-tests.ps1 -DryRun

# Apply all migrations
.\scripts\migrate-e2e-tests.ps1

# Migrate specific files
.\scripts\migrate-e2e-tests.ps1 -TargetFiles "01-home-page.spec.ts,02-auth.spec.ts"
```

### Manual Migration Checklist

For each test file:

- [ ] Replace import statement
- [ ] Update test signatures
- [ ] Remove manual authentication
- [ ] Apply web-first assertions
- [ ] Test and verify

---

## Step-by-Step Migration

### Step 1: Update Import Statement

**❌ Before:**

```typescript
import { test, expect } from "@playwright/test";
```

**✅ After:**

```typescript
import { test, expect } from "./fixtures/admin.fixture";
```

---

### Step 2: Update Test Signatures

**❌ Before:**

```typescript
test("should do something", async ({ page }) => {
  // Test code
});
```

**✅ After:**

```typescript
test("should do something", async ({ authenticatedAdmin }) => {
  const { page } = authenticatedAdmin;
  // Test code - already authenticated!
});
```

**Alternative (if auth not needed):**

```typescript
// For tests that don't need authentication (rare)
test("public page test", async ({ page }) => {
  // Uses base page without auth
});
```

---

### Step 3: Remove Manual Authentication

**❌ Before - Remove all of this:**

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Manual auth handling
  if (page.url().includes("signin")) {
    await page.fill('[name="email"]', "admin@test.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  }
});
```

**✅ After - Completely remove beforeEach:**

```typescript
// No beforeEach needed!
// authenticatedAdmin fixture handles all authentication
```

---

### Step 4: Apply Web-First Assertions

#### Pattern 1: Replace `waitForSelector()`

**❌ Before:**

```typescript
await page.waitForSelector("h1, h2", { timeout: 10000 });
await page.waitForSelector('main, [role="main"]', { timeout: 10000 });
```

**✅ After:**

```typescript
await expect(page.locator("h1, h2")).toBeVisible();
await expect(page.locator("main, [role='main']")).toBeVisible();
```

#### Pattern 2: Replace `waitForLoadState()`

**❌ Before:**

```typescript
await page.goto("/dashboard");
await page.waitForLoadState("networkidle");
await page.waitForLoadState("domcontentloaded");
```

**✅ After:**

```typescript
await page.goto("/dashboard");
// Wait for specific element indicating page is ready
await expect(page.locator("h1, h2")).toBeVisible();
```

#### Pattern 3: Replace `waitForTimeout()`

**❌ Before:**

```typescript
await page.waitForTimeout(3000); // Wait for data to load
```

**✅ After:**

```typescript
// Wait for the data that should appear
await expect(page.locator("table tbody tr").first()).toBeVisible();
```

#### Pattern 4: Replace `goto()` with `waitUntil`

**❌ Before:**

```typescript
await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
await page.goto("/dashboard", { waitUntil: "networkidle" });
```

**✅ After:**

```typescript
await page.goto("/dashboard");
// Use web-first assertion to verify load
await expect(page.locator("main")).toBeVisible();
```

#### Pattern 5: Replace conditional visibility checks

**❌ Before:**

```typescript
const button = page.locator("button");
if (await button.isVisible()) {
  await button.click();
}
```

**✅ After:**

```typescript
const button = page.locator("button");
await expect(button).toBeVisible();
await button.click();
```

#### Pattern 6: Replace URL waiting

**❌ Before:**

```typescript
await page.waitForURL("/dashboard");
await page.waitForURL((url) => url.includes("/dashboard"));
```

**✅ After:**

```typescript
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveURL("/dashboard");
```

---

## Common Scenarios

### Scenario 1: Navigation Test

**❌ Before:**

```typescript
test("should navigate to dashboard", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".sign-in-button", { timeout: 10000 });

  // Manual sign in
  await page.click(".sign-in-button");
  await page.fill('[name="email"]', "admin@test.com");
  await page.fill('[name="password"]', "password");
  await page.click('button[type="submit"]');

  await page.waitForURL("/dashboard");
  await page.waitForSelector("h1", { timeout: 10000 });
});
```

**✅ After:**

```typescript
test("should navigate to dashboard", async ({ authenticatedAdmin }) => {
  const { page } = authenticatedAdmin;

  await page.goto("/dashboard");

  // ✅ Web-first: Verify dashboard loaded
  await expect(page.locator("h1")).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard/);
});
```

### Scenario 2: Form Interaction Test

**❌ Before:**

```typescript
test("should create new item", async ({ page }) => {
  await page.goto("/management/items");
  await page.waitForLoadState("networkidle");

  await page.click('button:has-text("Add New")');
  await page.waitForTimeout(1000);

  await page.fill('[name="name"]', "Test Item");
  await page.click('button:has-text("Save")');

  await page.waitForTimeout(2000);
  const success = page.locator(".success-message");
  expect(await success.isVisible()).toBe(true);
});
```

**✅ After:**

```typescript
test("should create new item", async ({ authenticatedAdmin }) => {
  const { page } = authenticatedAdmin;

  await page.goto("/management/items");

  // ✅ Web-first: Wait for page to load
  await expect(page.locator("h1, h2")).toBeVisible();

  // ✅ Web-first: Click and wait for dialog
  const addButton = page.locator('button:has-text("Add New")');
  await expect(addButton).toBeVisible();
  await addButton.click();

  // ✅ Web-first: Wait for form
  await expect(page.locator('[name="name"]')).toBeVisible();

  await page.fill('[name="name"]', "Test Item");
  await page.click('button:has-text("Save")');

  // ✅ Web-first: Wait for success message
  await expect(page.locator(".success-message")).toBeVisible();
});
```

### Scenario 3: Table Data Test

**❌ Before:**

```typescript
test("should display table data", async ({ page }) => {
  await page.goto("/data/table");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);

  const rows = page.locator("table tbody tr");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});
```

**✅ After:**

```typescript
test("should display table data", async ({ authenticatedAdmin }) => {
  const { page } = authenticatedAdmin;

  await page.goto("/data/table");

  // ✅ Web-first: Wait for table to populate
  const rows = page.locator("table tbody tr");
  await expect(rows.first()).toBeVisible();

  // Now safe to count
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});
```

---

## Anti-Patterns to Avoid

### 1. Don't Mix Import Styles

**❌ Bad:**

```typescript
import { test } from "@playwright/test";
import { expect } from "./fixtures/admin.fixture";
```

**✅ Good:**

```typescript
import { test, expect } from "./fixtures/admin.fixture";
```

### 2. Don't Use Both `page` and `authenticatedAdmin`

**❌ Bad:**

```typescript
test("example", async ({ page, authenticatedAdmin }) => {
  // Confusing - which page to use?
});
```

**✅ Good:**

```typescript
test("example", async ({ authenticatedAdmin }) => {
  const { page } = authenticatedAdmin;
  // Clear and consistent
});
```

### 3. Don't Use Arbitrary Timeouts

**❌ Bad:**

```typescript
await page.waitForTimeout(5000); // "Should be enough time"
```

**✅ Good:**

```typescript
await expect(page.locator("target-element")).toBeVisible();
// Auto-retries for up to 5 seconds by default
```

### 4. Don't Wait for Everything to Load

**❌ Bad:**

```typescript
await page.goto("/dashboard");
await page.waitForLoadState("networkidle");
await page.waitForLoadState("domcontentloaded");
await page.waitForLoadState("load");
```

**✅ Good:**

```typescript
await page.goto("/dashboard");
await expect(page.locator("main-content-element")).toBeVisible();
// Wait only for what you need
```

---

## Web-First Assertion Reference

### Visibility Assertions

```typescript
// Element is visible
await expect(page.locator("button")).toBeVisible();

// Element is hidden
await expect(page.locator("error")).toBeHidden();

// Element is attached to DOM
await expect(page.locator("div")).toBeAttached();

// Element is detached from DOM
await expect(page.locator("removed")).not.toBeAttached();
```

### Text Assertions

```typescript
// Exact text match
await expect(page.locator("h1")).toHaveText("Welcome");

// Contains text
await expect(page.locator("p")).toContainText("success");

// Regex match
await expect(page.locator("span")).toHaveText(/\d+ items/);
```

### URL Assertions

```typescript
// Exact URL
await expect(page).toHaveURL("https://example.com/dashboard");

// URL contains
await expect(page).toHaveURL(/dashboard/);

// URL with query params
await expect(page).toHaveURL(/\?id=123/);
```

### State Assertions

```typescript
// Checkbox is checked
await expect(page.locator("input[type='checkbox']")).toBeChecked();

// Input is enabled
await expect(page.locator("button")).toBeEnabled();

// Input is disabled
await expect(page.locator("button")).toBeDisabled();

// Input is focused
await expect(page.locator("input")).toBeFocused();
```

### Count Assertions

```typescript
// Exact count
await expect(page.locator("li")).toHaveCount(5);

// At least one
await expect(page.locator("tr")).not.toHaveCount(0);
```

### Attribute Assertions

```typescript
// Has attribute
await expect(page.locator("a")).toHaveAttribute("href", "/dashboard");

// Has class
await expect(page.locator("div")).toHaveClass(/active/);

// Has value
await expect(page.locator("input")).toHaveValue("test");
```

---

## Testing the Migration

### 1. Run Individual Test

```powershell
pnpm playwright test 01-home-page.spec.ts
```

### 2. Run All E2E Tests

```powershell
pnpm test:e2e
```

### 3. Run in UI Mode (Recommended)

```powershell
pnpm test:e2e:ui
```

### 4. Run with Debugging

```powershell
pnpm playwright test 01-home-page.spec.ts --headed --debug
```

---

## Troubleshooting

### Issue: "Cannot find module './fixtures/admin.fixture'"

**Solution:**

- Ensure the import path is correct (use relative path)
- Check file is in correct directory structure

### Issue: "authenticatedAdmin is not defined"

**Solution:**

- Make sure you imported from admin.fixture, not @playwright/test
- Use `test.extend` if you need custom fixtures

### Issue: "Tests are timing out"

**Solution:**

- Add more specific web-first assertions
- Increase timeout if truly needed: `await expect(locator).toBeVisible({ timeout: 10000 })`
- Check if element selector is correct

### Issue: "Authentication not working"

**Solution:**

- Verify `.auth/admin.json` exists in project root
- Run global setup: `pnpm playwright test --project=setup`
- Check `ENABLE_DEV_BYPASS` is `"true"` in `.env.local`

---

## Success Criteria

- [ ] All test files import from `admin.fixture`
- [ ] All authenticated tests use `authenticatedAdmin` fixture
- [ ] Zero `waitForTimeout()` (except visual inspection tests with INTENTIONAL comment)
- [ ] Zero `waitForLoadState()` calls
- [ ] Zero `waitForSelector()` calls
- [ ] All assertions use web-first patterns
- [ ] E2E pass rate ≥ 60%

---

## Additional Resources

- [Playwright Web-First Assertions](https://playwright.dev/docs/test-assertions)
- [Admin Fixture Documentation](../e2e/fixtures/admin.fixture.ts)
- [E2E Test Best Practices](https://playwright.dev/docs/best-practices)
- [Progress Report](./E2E_FIXTURE_CONSOLIDATION_PROGRESS.md)

---

**Last Updated:** 2025-11-21  
**Status:** Active Migration  
**Target Completion:** End of Phase 1
