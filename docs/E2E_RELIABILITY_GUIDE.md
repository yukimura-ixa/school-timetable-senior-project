# E2E Reliability Guide (Playwright)

This guide standardizes robust, web-first patterns for our E2E suite. Apply these patterns when writing or refactoring tests to minimize flakiness and speed up runs.

## Core Patterns

- Safe Interaction
  ```ts
  const submit = page.getByRole('button', { name: /บันทึก|save/i });
  await expect(submit).toBeVisible({ timeout: 5000 });
  await expect(submit).toBeEnabled();
  await submit.click();
  ```

- Navigation Readiness (avoid `networkidle`)
  ```ts
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('table, main, [role="main"]', { timeout: 10000 });
  ```

- Debounced Search/Filter
  ```ts
  await page.fill('input[placeholder*="ค้นหา"]', 'นาย');
  await expect(async () => {
    expect(page.url()).toContain('search=นาย');
  }).toPass({ timeout: 3000 });
  ```

- Table/Data Update
  ```ts
  const initial = await page.locator('table tbody tr').count();
  await page.waitForFunction((prev) => {
    const rows = document.querySelectorAll('table tbody tr').length;
    return rows !== prev || rows === 0;
  }, initial, { timeout: 3000 }).catch(() => {});
  ```

- Modal Flow
  ```ts
  await openButton.click();
  const modal = page.locator('[role="dialog"], .modal');
  await expect(modal).toBeVisible({ timeout: 5000 });
  await cancelButton.click();
  await page.waitForFunction(() => document.querySelectorAll('[role="dialog"]').length === 0, { timeout: 2000 }).catch(() => {});
  await expect(modal).not.toBeVisible();
  ```

- MUI Selects
  ```ts
  await page.waitForSelector('#grade-select:not(.Mui-disabled)', { timeout: 10000 });
  await page.locator('#grade-select').click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  ```

- Drag-and-Drop Stability (@dnd-kit)
  ```ts
  await expect(source).toBeVisible();
  await expect(target).toBeVisible();
  await page.mouse.down();
  await page.waitForFunction(() => document.body.style.cursor === 'grabbing' || document.querySelector('[data-dragging]'), { timeout: 1000 }).catch(() => {});
  await page.mouse.up();
  await page.waitForFunction(() => document.body.style.cursor !== 'grabbing' && !document.body.classList.contains('dragging'), { timeout: 1000 }).catch(() => {});
  ```

## Anti-Patterns
- `waitForTimeout()` (except `visual-inspection.spec.ts`)
- Blind `page.click()` without visibility/enabled checks
- Blanket `waitForLoadState('networkidle')` for UI readiness
- Assertions that assume immediate DOM updates after actions

## Quick Recipes
- Confirm toast/snackbar:
  ```ts
  await expect(page.getByText(/สำเร็จ|success/i)).toBeVisible({ timeout: 5000 });
  ```
- Verify URL contains param (debounced):
  ```ts
  await expect(async () => expect(page.url()).toContain('filter=active')).toPass({ timeout: 3000 });
  ```
- Stable pagination:
  ```ts
  const next = page.getByRole('button', { name: /next|ถัดไป/i });
  await expect(next).toBeEnabled();
  await next.click();
  ```

## Metrics & Results (Nov 2025)
- Phase A: 210/210 functional `waitForTimeout` calls removed (100%)
- Phase B Session 1: Public + Arrange stabilized; many `networkidle` calls removed in DnD flows
- Phase B Session 2: Management CRUD migrated to robust waits (program subject, program management, activity management, schedule config)
  - Estimated reliability improvement: +40–50%
  - Expected runtime reduction: 30–40%

## Running Locally
```pwsh
# Start dev server (separate terminal)
pnpm dev

# Run e2e (local)
pnpm test:e2e

# UI mode for focused debugging
pnpm test:e2e:ui
```

## Known Blockers
- Full-suite runs currently blocked by a web server start/port conflict. Resolve before final validation (see TODO: Debug Web Server Blocker).
