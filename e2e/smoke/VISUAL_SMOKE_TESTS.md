# Visual Smoke Tests

Visual smoke tests use **screenshot comparison** to detect unexpected UI changes. These tests capture screenshots of critical pages and compare them against baseline images to catch visual regressions.

## What Are Visual Smoke Tests?

Visual smoke tests answer the question: **"Does the UI still look correct?"**

They complement functional smoke tests by verifying:

- Layout and styling remain consistent
- No unexpected visual changes crept in
- Responsive design works at different screen sizes
- Components render correctly
- Dark mode (if applicable) looks right

## Test Files

### `visual-smoke.spec.ts`

**Critical Pages** (8 tests):

1. Home page
2. Teachers management
3. Subjects management
4. Rooms management
5. Schedule configuration
6. Teacher arrange
7. Dashboard all-timeslot
8. Export page

**UI Components** (3 tests):

- Navigation bar
- Data table with pagination
- Empty timeslot grid

**Responsive Design** (2 tests):

- Mobile view (iPhone SE - 375x667)
- Tablet view (iPad - 768x1024)

**Dark Mode** (1 test):

- Teachers page in dark mode

## Running Visual Smoke Tests

### First Time Setup (Create Baselines)

```bash
# Generate baseline screenshots
pnpm playwright test e2e/smoke/visual-smoke.spec.ts --update-snapshots
```

This creates baseline images in `e2e/smoke/visual-smoke.spec.ts-snapshots/`

### Run Visual Tests

```bash
# Run all visual smoke tests
pnpm playwright test e2e/smoke/visual-smoke.spec.ts

# Run in UI mode to see comparison side-by-side
pnpm playwright test e2e/smoke/visual-smoke.spec.ts --ui

# Run specific test
pnpm playwright test e2e/smoke/visual-smoke.spec.ts -g "Home page"
```

### Update Baselines (After Intentional UI Changes)

```bash
# Update all snapshots
pnpm playwright test e2e/smoke/visual-smoke.spec.ts --update-snapshots

# Update specific snapshot
pnpm playwright test e2e/smoke/visual-smoke.spec.ts -g "Home page" --update-snapshots
```

## Understanding Results

### Test Passes ✅

- Screenshot matches baseline (within tolerance)
- No visual changes detected
- UI is consistent

### Test Fails ❌

- Screenshot differs from baseline
- Visual regression detected
- Review diff image to identify change

**Diff Images Location**: `test-results/` directory

Playwright generates three images on failure:

1. `actual.png` - Current screenshot
2. `expected.png` - Baseline screenshot
3. `diff.png` - Highlighted differences

## Configuration

Visual tests use these settings (in test file):

```typescript
test.use({
  expect: {
    toHaveScreenshot: { maxDiffPixels: 100 }, // Allow 100 pixels difference
  },
});
```

- **maxDiffPixels**: Maximum number of different pixels allowed
- **animations: 'disabled'**: Disable CSS animations for consistent screenshots
- **fullPage**: Capture entire scrollable page vs viewport only

## When to Update Baselines

✅ **Update baselines when**:

- You intentionally changed the UI
- You added new features that change layout
- You fixed a UI bug
- You updated CSS/styling

❌ **Don't update baselines when**:

- Tests randomly fail (investigate why first)
- You're not sure why the screenshot changed
- The change looks wrong or buggy

## Best Practices

1. **Review Diffs Carefully**
   - Always inspect the diff image before updating baselines
   - Make sure changes are intentional

2. **Use Appropriate Tolerances**
   - Static pages: Low tolerance (maxDiffPixels: 100)
   - Dynamic content: Higher tolerance (maxDiffPixels: 300)

3. **Wait for Stability**
   - Add `waitForLoadState('networkidle')` before screenshots
   - Use `waitForTimeout()` to let animations complete
   - Disable animations in screenshot options

4. **Keep Screenshots Focused**
   - Screenshot specific components, not always full page
   - Avoids failing due to unrelated changes

5. **Test Multiple Viewports**
   - Desktop (default 1280x720)
   - Mobile (375x667)
   - Tablet (768x1024)

## Troubleshooting

### Screenshots Keep Failing

- Check if database has consistent seed data
- Ensure animations are disabled
- Increase `maxDiffPixels` for dynamic content
- Add longer waits for slow-loading content

### Baseline Images Look Wrong

- Delete baseline: `rm -rf e2e/smoke/visual-smoke.spec.ts-snapshots/`
- Regenerate: `pnpm playwright test e2e/smoke/visual-smoke.spec.ts --update-snapshots`

### Tests Pass Locally But Fail in CI

- CI may render fonts/images differently
- Use Docker image for consistent environment
- Set specific viewport sizes (avoid default)
- Disable system fonts if needed

### Different Screenshots on Different Machines

- Ensure same Playwright version
- Use same browser version (Chromium)
- Check font rendering settings
- Consider using Docker for consistency

## CI Integration

Visual smoke tests can run in CI, but:

⚠️ **Important**: Baseline images must be committed to git

```bash
# After creating baselines locally
git add e2e/smoke/visual-smoke.spec.ts-snapshots/
git commit -m "Add visual smoke test baselines"
git push
```

CI will then compare against these committed baselines.

## Comparison with Functional Smoke Tests

| Aspect          | Functional Smoke             | Visual Smoke              |
| --------------- | ---------------------------- | ------------------------- |
| **Purpose**     | Verify functionality works   | Verify UI looks correct   |
| **Tests**       | User interactions, data flow | Screenshot comparison     |
| **Speed**       | ~10-15 minutes               | ~3-5 minutes              |
| **Detects**     | Broken features, errors      | Layout bugs, style issues |
| **Maintenance** | Low (stable tests)           | Medium (update baselines) |

**Recommendation**: Run both for comprehensive coverage.

## Example Workflow

```bash
# 1. Make UI change (e.g., update button color)
# ... edit CSS files ...

# 2. Run visual tests (will fail)
pnpm playwright test e2e/smoke/visual-smoke.spec.ts

# 3. Review diff images in test-results/
# ... inspect actual vs expected ...

# 4. If change looks good, update baseline
pnpm playwright test e2e/smoke/visual-smoke.spec.ts --update-snapshots

# 5. Commit updated baselines
git add e2e/smoke/visual-smoke.spec.ts-snapshots/
git commit -m "Update visual baselines for button color change"

# 6. Run functional tests to ensure nothing broke
pnpm test:smoke:critical
```

## Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Screenshot Testing Best Practices](https://playwright.dev/docs/best-practices#visual-comparisons)
