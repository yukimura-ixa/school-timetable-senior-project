# Prisma Seed E2E Cloud Test Environment - October 31, 2025

## Overview
Enhanced the test environment configuration with comprehensive Prisma seed setup for E2E testing in cloud environments (CI/CD, GitHub Actions).

## File Updated
**Location**: `.github/copilot-test-environment.md`

## Changes Made

### 1. Enhanced Environment Variables Section

**Added Prisma Seed Variables**:
```env
# Prisma Seed Configuration for E2E Tests
SEED_FOR_TESTS="true"           # Enables test mode in seed script
SEED_CLEAN_DATA="false"         # Set to "true" to delete all data before seeding
```

**Added to Test-Specific Config** (`.env.test.local`):
```env
SEED_FOR_TESTS="true"
SEED_CLEAN_DATA="false"
```

### 2. New Section: "Prisma Seed for E2E Cloud Tests"

Comprehensive guide including:

#### A. Seed Commands
```bash
# Standard seed (preserves existing data)
pnpm db:seed

# Clean seed (DELETES ALL DATA - use carefully!)
pnpm db:seed:clean

# Manual with env vars
SEED_FOR_TESTS=true tsx prisma/seed.ts
SEED_CLEAN_DATA=true SEED_FOR_TESTS=true tsx prisma/seed.ts
```

#### B. Verify Seed Data
- Instructions for using Prisma Studio
- Expected test semesters: 1-2567, 2-2567, 1-2568

#### C. Seed Data Reference
Documented seeded test data from `prisma/seed.ts`:
- **Semesters**: 1-2567, 2-2567, 1-2568
- **Teachers**: Multiple with departments
- **Subjects**: Core subjects (TH, EN, MA, SCI, SOC)
- **Programs**: M1-SCI, M1-LANG, M2-SCI, M2-LANG
- **Grade Levels**: M.1/1, M.1/2, M.2/1, M.2/2
- **Rooms**: Multiple classrooms
- **Timeslots**: Full schedule grid (MON-FRI, 8 periods/day)

Example usage in tests:
```typescript
// Use seeded semester IDs
await page.goto('/schedule/1-2567/assign');

// Use seeded teacher IDs
await page.selectOption('select[name="teacherId"]', 'seeded-teacher-id');

// Use seeded class IDs
await page.selectOption('select[name="gradeLevel"]', 'M.1/1');
```

#### D. Cloud CI/CD Seed Strategy

Complete GitHub Actions workflow example:
```yaml
name: E2E Tests
jobs:
  test:
    steps:
      - name: Setup environment
        run: echo "SEED_FOR_TESTS=true" >> .env.test.local
      
      - name: Apply database migrations
        run: pnpm db:deploy
      
      - name: Seed test database
        run: pnpm db:seed
        env:
          SEED_FOR_TESTS: "true"
          SEED_CLEAN_DATA: "false"
      
      - name: Run E2E tests
        run: pnpm test:e2e
```

#### E. Environment-Specific Seed Flags Table

| Environment | `SEED_FOR_TESTS` | `SEED_CLEAN_DATA` | Use Case |
|-------------|------------------|-------------------|----------|
| **Local Dev** | `false` | `false` | Preserve data |
| **Local Test** | `true` | `false` | Add test data |
| **CI/CD** | `true` | `true` | Clean slate |
| **Staging** | `false` | `false` | Preserve staging |
| **Production** | `false` | `false` | Never delete |

#### F. Seed Data Consistency Best Practices
- Document seed data IDs in comments
- Use deterministic IDs (T001, S001)
- Keep seed data minimal but sufficient
- Update tests when seed data changes
- Version control seed script with tests

## Key Safety Features

### Warning Highlighted
```
⚠️ SEED_CLEAN_DATA=true DELETES ALL DATA
Only use in:
✅ Test databases
✅ CI/CD ephemeral databases
❌ NEVER in production
❌ NEVER in staging
```

## How This Helps

### For Cloud Test Environments
1. ✅ Clear setup instructions for CI/CD
2. ✅ GitHub Actions workflow example
3. ✅ Environment-specific configuration table
4. ✅ Safety warnings for destructive operations

### For E2E Test Development
1. ✅ Documented seed data reference
2. ✅ Example code showing how to use seeded IDs
3. ✅ Verification steps with Prisma Studio
4. ✅ Consistency best practices

### For AI Assistants (Copilot)
1. ✅ Knows which environment variables to set
2. ✅ Understands seed data structure
3. ✅ Can generate tests using seeded IDs
4. ✅ Follows safety guidelines for SEED_CLEAN_DATA

## Related Environment Variables

From `prisma/seed.ts`:
```typescript
const shouldCleanData = process.env.SEED_CLEAN_DATA === 'true' || 
                       process.env.SEED_FOR_TESTS === 'true';
const isTestMode = process.env.SEED_FOR_TESTS === 'true';
```

From `package.json`:
```json
"db:seed": "tsx prisma/seed.ts",
"db:seed:clean": "SEED_CLEAN_DATA=true tsx prisma/seed.ts"
```

## Usage Example

### Local E2E Testing
```bash
# 1. Set environment
export SEED_FOR_TESTS=true
export SEED_CLEAN_DATA=false

# 2. Apply migrations
pnpm db:deploy

# 3. Seed database
pnpm db:seed

# 4. Verify
pnpm db:studio

# 5. Run E2E tests
pnpm test:e2e
```

### GitHub Actions (Cloud)
```yaml
- name: Seed test database
  run: pnpm db:seed
  env:
    SEED_FOR_TESTS: "true"
    SEED_CLEAN_DATA: "true"  # Clean slate for CI
```

## Impact

### Before This Update
- ❌ No clear guidance on seed environment variables
- ❌ No cloud CI/CD seed strategy documented
- ❌ Seed data reference scattered or missing
- ❌ Safety warnings not prominent

### After This Update
- ✅ Complete seed environment variable reference
- ✅ Full GitHub Actions workflow example
- ✅ Documented seed data for test reference
- ✅ Prominent safety warnings
- ✅ Environment-specific configuration guide
- ✅ Best practices for seed data consistency

## Verification

**File Compiled**: ✅ No errors in `.github/copilot-test-environment.md`

**Consistency Check**:
- ✅ Matches `prisma/seed.ts` environment variables
- ✅ Matches `package.json` seed scripts
- ✅ Aligns with existing test documentation

## Next Steps for Users

1. **Set up cloud CI/CD**:
   - Add test database URL to GitHub Secrets
   - Copy GitHub Actions workflow example
   - Configure `SEED_FOR_TESTS` in CI environment

2. **Local testing**:
   - Create `.env.test.local` with seed flags
   - Run `pnpm db:seed` before E2E tests
   - Verify with `pnpm db:studio`

3. **Test development**:
   - Reference documented seed data IDs
   - Use seeded semesters (1-2567, etc.)
   - Keep seed data in sync with tests

## Summary

Successfully enhanced the test environment configuration with:
- ✅ Prisma seed environment variables
- ✅ Cloud CI/CD seed strategy (GitHub Actions)
- ✅ Seed data reference documentation
- ✅ Environment-specific configuration table
- ✅ Safety warnings for destructive operations
- ✅ Best practices for consistency
- ✅ Complete workflow examples

The cloud Copilot test environment now has comprehensive Prisma seed support for E2E testing in CI/CD pipelines! 🎯
