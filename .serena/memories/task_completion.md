# Task Completion Checklist

## When a Task is Completed

Follow these steps **in order** to ensure code quality and prevent regressions:

### 1. Database Changes (if applicable)

If you modified `prisma/schema.prisma`:

```powershell
# Generate Prisma Client to update TypeScript types
pnpm prisma generate

# Create and apply migration (development)
pnpm prisma migrate dev --name <descriptive-migration-name>

# Example migration names:
# - add_user_preferences_table
# - add_index_to_class_schedule
# - update_teacher_role_enum
# - standardize_configid_format
```

**For production:**
```powershell
# Apply migrations to production database
pnpm prisma migrate deploy
```

### 2. Code Verification

#### a. TypeScript Compilation
```powershell
# Verify TypeScript compiles without errors
pnpm tsc --noEmit --skipLibCheck
```

If there are errors:
- Fix type errors immediately
- Don't suppress with `@ts-ignore` unless absolutely necessary
- Update types in affected files

#### b. Linting
```powershell
# Check for linting errors
pnpm lint

# Auto-fix fixable issues
pnpm lint:fix

# Manual ESLint run with specific options
pnpm eslint src/**/*.ts --max-warnings=0
```

**Common lint errors to watch for:**
- Unused variables/imports
- Missing return types
- `any` types (avoid when possible)
- Console.log statements (use warn/error only)

#### c. Formatting
```powershell
# Check code formatting
pnpm prettier --check .

# Auto-format all files
pnpm format
```

### 3. Testing

#### a. Unit Tests (Jest)
```powershell
# Run all unit tests
pnpm test

# Run specific test file
pnpm test <test-file-path>

# Run with coverage
pnpm test --coverage

# Run in watch mode (during development)
pnpm test:watch
```

**When to write unit tests:**
- Pure functions (constraint checks, utilities, parsers)
- Business logic functions in domain layer
- Validation services
- Complex calculations
- Data transformations
- ConfigID parsing/generation functions

**Example test structure:**
```typescript
import { generateConfigID, parseConfigID } from '@/features/config/domain/services/config-validation.service';

describe('Config Validation Service', () => {
  describe('generateConfigID', () => {
    it('should generate ConfigID in SEMESTER-YEAR format', () => {
      expect(generateConfigID('1', 2567)).toBe('1-2567');
      expect(generateConfigID('2', 2568)).toBe('2-2568');
    });
  });

  describe('parseConfigID', () => {
    it('should parse valid ConfigID', () => {
      const result = parseConfigID('1-2567');
      expect(result).toEqual({ semester: '1', academicYear: 2567 });
    });

    it('should throw error for invalid format', () => {
      expect(() => parseConfigID('invalid')).toThrow();
    });
  });
});
```

#### b. E2E Tests (Playwright)
```powershell
# Install browsers (first time only)
pnpm playwright:install

# Run all E2E tests
pnpm test:e2e

# Run with UI mode (debugging)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test file
pnpm test:e2e e2e/smoke/semester-smoke.spec.ts

# Show test report
pnpm test:report
```

**When to write E2E tests:**
- Critical user flows (login, schedule creation)
- New features that affect user interaction
- Bug fixes for user-facing issues
- After ConfigID migration (verify all routes work)
- Multi-page workflows

**Example E2E test:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard - 1-2567', () => {
  test('should display schedule config page', async ({ page }) => {
    await page.goto('/dashboard/1-2567/all-timeslot');
    
    // Check for 200 OK
    expect(page.url()).toContain('1-2567');
    
    // Check UI elements
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('h1')).toContainText('ตาราง');
    
    // No console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.waitForLoadState('networkidle');
    expect(consoleErrors).toHaveLength(0);
  });
});
```

### 4. Documentation

Update documentation if:
- You added a new feature
- You changed the API or public interfaces
- You modified the database schema significantly
- You changed configuration or environment variables
- You completed a migration (like ConfigID standardization)

**Files to update:**
- `README.md` - User-facing changes
- `docs/*.md` - Technical documentation
- Inline code comments (JSDoc for public functions)
- `AGENTS.md` - If changing agent workflows

### 5. Git Workflow

```powershell
# 1. Check what changed
git status

# 2. Review your changes
git diff

# 3. Stage changes
git add .

# 4. Commit with descriptive message
git commit -m "feat: standardize ConfigID format to SEMESTER-YEAR

- Update validation service to use canonical format
- Update schemas regex patterns
- Update route parsing logic
- Update action layers for TimeslotID generation
- Update seed API to use new format

Affects: validation, routes, actions, repositories
Breaking change: ConfigID format changed from SEMESTER/YEAR to SEMESTER-YEAR
"

# 5. Push to remote
git push
```

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no behavior change)
- `test`: Adding tests
- `docs`: Documentation changes
- `style`: Formatting, semicolons, etc.
- `perf`: Performance improvements
- `chore`: Maintenance tasks (deps, build)

### 6. Pre-Deployment Checklist

Before deploying to production:

```powershell
# 1. Ensure clean build
pnpm build

# 2. Run all tests
pnpm test
pnpm test:e2e

# 3. Check for type errors
pnpm tsc --noEmit --skipLibCheck

# 4. Verify linting
pnpm lint

# 5. Check environment variables
# Ensure all required env vars are set in Vercel
```

**Environment variables to verify:**
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SEED_SECRET` (for production seed API)

### 7. Post-Task Verification

After completing a task:

- [ ] Code compiles without errors (`pnpm tsc --noEmit --skipLibCheck`)
- [ ] All tests pass (unit + E2E)
- [ ] No linting errors (`pnpm lint`)
- [ ] Code is formatted consistently (`pnpm format`)
- [ ] Database migrations applied (if any)
- [ ] Documentation updated (if needed)
- [ ] Changes committed with descriptive message
- [ ] Feature verified in development environment
- [ ] E2E smoke tests pass for affected routes

### 8. Special Cases

#### Prisma Schema Changes

When modifying `prisma/schema.prisma`:

1. **Always generate client first:**
   ```powershell
   pnpm prisma generate
   ```

2. **Create migration:**
   ```powershell
   pnpm prisma migrate dev --name <descriptive-name>
   ```

3. **Test with seeded data:**
   ```powershell
   pnpm db:seed
   ```

4. **Verify in Prisma Studio:**
   ```powershell
   pnpm db:studio
   ```

#### Breaking Changes

If your changes break existing functionality:

1. **Update all affected code** before committing
2. **Update tests** to reflect new behavior
3. **Document the breaking change** in commit message
4. **Consider migration path** for existing data
5. **Communicate to team** if in collaborative environment

**Example breaking change commit:**
```
refactor: standardize ConfigID format (BREAKING CHANGE)

BREAKING CHANGE: ConfigID format changed from "SEMESTER/YEAR" to "SEMESTER-YEAR"

Migration required:
- Update existing database records
- Update all hardcoded ConfigID references
- Run integration tests after deployment

Affected areas:
- Validation layer (regex patterns)
- Route parsing
- TimeslotID generation
- Seed operations

Rollback plan: Revert commit and redeploy previous version
```

#### Performance-Critical Changes

For changes affecting performance:

1. **Benchmark before and after**
2. **Test with realistic data volumes**
3. **Monitor database query performance**
4. **Consider indexing** for new query patterns

**Example:**
```powershell
# Before optimization: measure query time
# After optimization: measure again
# Document improvement in commit message
```

### 9. Error Recovery

If tests fail after changes:

1. **Read the error message carefully**
2. **Run failing test in isolation:**
   ```powershell
   pnpm test <specific-test-file>
   ```
3. **Use debugger or console.log** to investigate
4. **Fix the issue** and re-run tests
5. **Verify all tests pass** before committing

If build fails:

1. **Check TypeScript errors** in output
2. **Verify all imports** are correct
3. **Ensure Prisma Client is generated**
   ```powershell
   pnpm prisma generate
   ```
4. **Check for missing dependencies**
   ```powershell
   pnpm install
   ```

### 10. ConfigID Migration Specific Checklist

For the recent ConfigID standardization work:

#### Phase-by-Phase Verification
```powershell
# After Phase 1 (Validation)
pnpm test src/features/config/domain/services/config-validation.service.test.ts

# After Phase 2 (Routes)
pnpm test:e2e e2e/smoke/semester-smoke.spec.ts

# After Phase 3 (Actions)
pnpm test src/features/semester/application/actions/semester.actions.test.ts

# After Phase 4 (Repository)
pnpm test __test__/integration/seed-endpoint.integration.test.ts

# After Phase 5 (Tests)
pnpm test

# After Phase 6 (Database)
# Run SQL verification query
# Check no old format records remain

# After Phase 7 (Docs)
# Manual review of all docs

# After Phase 8 (Deploy)
pnpm test:e2e
pnpm build
# Deploy to Vercel
# Monitor production logs
```

### Quick Reference

**Most Common Workflow:**
```powershell
# 1. Make changes

# 2. Generate Prisma (if schema changed)
pnpm prisma generate

# 3. Test
pnpm test

# 4. Lint & Format
pnpm lint:fix
pnpm format

# 5. Type check
pnpm tsc --noEmit --skipLibCheck

# 6. Build
pnpm build

# 7. Commit
git add .
git commit -m "feat: your change description"
git push
```

## Summary

Always remember the golden rule:

> **Before committing: test → lint → format → type-check → build**

This ensures code quality and prevents regressions from reaching production.
