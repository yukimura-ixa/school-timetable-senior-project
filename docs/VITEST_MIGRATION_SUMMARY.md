# Vitest Migration Summary

## Overview

Successfully migrated from Jest to Vitest to resolve Next.js 16 compatibility issues (Issue #141).

**Date:** January 2025  
**Migration Duration:** ~1 hour  
**Tests Migrated:** 168 tests across 14 test files

## Changes Made

### Dependencies

**Removed:**
- `jest` (v29.7.0)
- `@types/jest`
- `ts-jest`
- `jest-environment-jsdom`
- `@jest/globals`
- `eslint-plugin-jest`
- `eslint-plugin-jest-dom`
- `jest-mock-extended`

**Added:**
- `vitest` (v4.0.14)
- `@vitest/coverage-v8`
- `@vitest/ui`
- `happy-dom`

**Kept:**
- `@testing-library/jest-dom` (v6.9.1) - Used via `/vitest` subpath

### Configuration Files

| File | Status | Notes |
|------|--------|-------|
| `jest.config.ts` | ❌ Deleted | Replaced by vitest.config.ts |
| `jest.setup.ts` | ❌ Deleted | Replaced by vitest.setup.ts |
| `jest.polyfills.ts` | ❌ Deleted | Not needed with Vitest |
| `vitest.config.ts` | ✅ Created | Main Vitest configuration |
| `vitest.setup.ts` | ✅ Created | Setup with mocks |
| `tsconfig.test.json` | ✅ Updated | Changed jest types to vitest/globals |
| `eslint.config.mjs` | ✅ Updated | Removed Jest plugin, added Vitest globals |

### CI Workflow

Updated `.github/workflows/ci.yml`:
- Re-enabled `unit-tests` job (was disabled due to Jest + Next.js 16 issues)
- Renamed to "Unit Tests (Vitest)"
- Updated cache paths from `.jest-cache` to `node_modules/.vite`
- Added `unit-tests` back to `trigger-e2e` job dependencies

### Test File Changes

**Pattern Replacements (all ~30 test files):**
```typescript
// Import changes
jest.fn()           → vi.fn()
jest.spyOn          → vi.spyOn  
jest.mock           → vi.mock
jest.clearAllMocks  → vi.clearAllMocks
jest.resetAllMocks  → vi.resetAllMocks
jest.Mocked<T>      → MockedObject<T>
jest.MockedFunction → Mock

// Environment directive
@jest-environment   → @vitest-environment

// Import actual module
jest.requireActual  → vi.importActual (async)
```

**Vitest-Specific Patterns:**

1. **vi.mock with default exports:**
   ```typescript
   vi.mock("module", () => ({
     default: mockImplementation,  // Required for ESM
   }));
   ```

2. **vi.hoisted for variable hoisting:**
   ```typescript
   const { mockFn } = vi.hoisted(() => ({ mockFn: vi.fn() }));
   vi.mock("module", () => ({ fn: mockFn }));
   ```

3. **vi.importActual (async):**
   ```typescript
   vi.mock("module", async (importOriginal) => {
     const actual = await importOriginal();
     return { ...actual, fn: vi.fn() };
   });
   ```

4. **Class mocks (for constructors like jsPDF):**
   ```typescript
   vi.mock("jspdf", () => {
     const MockJsPDF = class {
       method = vi.fn();
     };
     return { default: MockJsPDF };
   });
   ```

## Key Configuration (vitest.config.ts)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ...other aliases
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["__test__/**/*.{test,spec}.{ts,tsx}"],
    exclude: TEST_PATH_IGNORE_PATTERNS,
    testTimeout: 30000,
    hookTimeout: 30000,
    reporters: ["verbose"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    // Match Jest behavior
    mockReset: false,
    clearMocks: true,
    restoreMocks: false,
  },
});
```

## Setup File (vitest.setup.ts)

Key mocks provided:
- Next.js Cache Components APIs (`cacheTag`, `cacheLife`)
- `next/image` component (using React.createElement)
- Prisma client with all model methods

## Benefits

1. **Resolved Stack Overflow:** No more `forceExit: true` needed
2. **Better Performance:** ~18s test runs vs inconsistent Jest times
3. **Modern Architecture:** Native ESM support, faster transforms
4. **Better DX:** Built-in UI mode (`pnpm test:ui`)
5. **Simpler Mocking:** `vi.hoisted()` for cleaner mock patterns

## Skipped Tests

5 tests skipped (same as before migration):
- `overview.repository.test.ts` (4 tests) - Prisma DB queries
- `batchPdfGenerator.test.ts` (1 test) - Error handling edge case

## Commands

```bash
pnpm test           # Run all tests
pnpm test:watch     # Watch mode
pnpm test:ui        # UI mode
pnpm test:coverage  # Coverage report
```

## References

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Migration from Jest](https://vitest.dev/guide/migration.html)
- [Issue #141 - Jest + Next.js 16 compatibility](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/141)
