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
```

### 2. Code Verification

#### a. TypeScript Compilation
```powershell
# Verify TypeScript compiles without errors
# (This happens automatically during build)
pnpm build
```

#### b. Linting
```powershell
# Check for linting errors
pnpm lint

# Auto-fix fixable issues
pnpm lint --fix
```

#### c. Formatting
```powershell
# Check code formatting
pnpm prettier --check .

# Auto-format all files
pnpm prettier --write .
```

### 3. Testing

#### a. Unit Tests (Jest)
```powershell
# Run all unit tests
pnpm test

# Run specific test file
pnpm test <test-file-name>

# Run tests in watch mode (during development)
pnpm test:watch
```

**When to write unit tests:**
- Pure functions (constraint checks, utilities, parsers)
- Business logic functions
- Complex calculations
- Data transformations

#### b. E2E Tests (Playwright)
```powershell
# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e <test-file-name>

# Run with UI mode (debugging)
pnpm test:e2e:ui
```

**When to write E2E tests:**
- Critical user flows
- New features that affect user interaction
- Bug fixes for user-facing issues

### 4. Documentation

Update documentation if:
- You added a new feature
- You changed the API or public interfaces
- You modified the database schema significantly
- You changed configuration or environment variables

### 5. Git Workflow

```powershell
# 1. Check what changed
git status

# 2. Review your changes
git diff

# 3. Stage changes
git add .

# 4. Commit with descriptive message
git commit -m "feat: add teacher conflict detection

- Implement checkTeacherConflict function
- Add unit tests for conflict scenarios
- Update API route to use new validation"

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
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `perf`: Performance improvements
- `chore`: Maintenance tasks

### 6. Pre-Deployment Checklist

Before deploying to production:

```powershell
# 1. Ensure clean build
pnpm build

# 2. Run all tests
pnpm test
pnpm test:e2e

# 3. Check for type errors
# (Covered by build step)

# 4. Verify linting
pnpm lint

# 5. Check environment variables
# Ensure all required env vars are set in production
```

### 7. Post-Task Verification

After completing a task:

- [ ] Code compiles without errors
- [ ] All tests pass (unit + E2E)
- [ ] No linting errors
- [ ] Code is formatted consistently
- [ ] Database migrations applied (if any)
- [ ] Documentation updated (if needed)
- [ ] Changes committed with descriptive message
- [ ] Feature verified in development environment

## Special Cases

### Prisma Schema Changes

When modifying `schema.prisma`:

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
   pnpm prisma db seed
   ```

4. **Verify in Prisma Studio:**
   ```powershell
   pnpm prisma studio
   ```

### Breaking Changes

If your changes break existing functionality:

1. **Update all affected code** before committing
2. **Update tests** to reflect new behavior
3. **Document the breaking change** in commit message
4. **Consider migration path** for existing data

### Performance-Critical Changes

For changes affecting performance:

1. **Benchmark before and after**
2. **Test with realistic data volumes**
3. **Monitor database query performance**
4. **Consider indexing** for new query patterns

## Error Recovery

If tests fail after changes:

1. **Read the error message carefully**
2. **Run failing test in isolation:**
   ```powershell
   pnpm test <test-name>
   ```
3. **Use debugger or console.log** to investigate
4. **Fix the issue** and re-run tests
5. **Verify all tests pass** before committing

If build fails:

1. **Check TypeScript errors** in output
2. **Verify all imports** are correct
3. **Ensure Prisma Client is generated**
4. **Check for missing dependencies**

## Quick Reference

**Most Common Workflow:**
```powershell
# 1. Make changes
# 2. Generate Prisma (if schema changed)
pnpm prisma generate

# 3. Test
pnpm test

# 4. Lint & Format
pnpm lint --fix
pnpm prettier --write .

# 5. Build
pnpm build

# 6. Commit
git add .
git commit -m "feat: your change description"
git push
```
