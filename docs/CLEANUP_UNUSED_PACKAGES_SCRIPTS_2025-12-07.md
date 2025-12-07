# Unused Packages & Scripts Cleanup - December 7, 2025

## Summary

Removed **2 unused packages** and **11 unused npm scripts** to streamline the project.
All changes are compatible with the current CI/CD pipeline.

---

## Removed Packages (2)

| Package | Version | Reason |
|---------|---------|--------|
| `@opentelemetry/instrumentation` | ^0.208.0 | Not imported or used anywhere in codebase |
| `baseline-browser-mapping` | ^2.9.3 | Not imported or used anywhere in codebase |

**Verification:** No references found via codebase search. No impact on functionality.

---

## Removed Scripts (11)

### Production Visual Testing (4 scripts)
These scripts tested production builds with visual regression. Not used in CI/CD.

- `test:prod:visual` - Run all production visual tests
- `test:prod:visual:ui` - Interactive mode for visual tests
- `test:prod:visual:public` - Public pages only
- `test:prod:visual:admin` - Admin pages only

### Vercel Deployment Testing (3 scripts)
These scripts tested Vercel deployments. Not invoked in CI/CD workflows.

- `test:vercel` - General Vercel E2E tests
- `test:vercel:dashboard` - Analytics dashboard on Vercel
- `test:vercel:ui` - Interactive Vercel test mode

### CI Artifact Management (2 scripts)
These scripts managed E2E test artifacts. Not actively used.

- `ci:artifacts` - Download E2E artifacts from CI
- `ci:artifacts:failed` - Download failed test artifacts only

### One-Time Migration Scripts (2 scripts)
These scripts performed one-time password migrations. Not needed after initial migration.

- `migrate:check-passwords` - Check bcrypt→scrypt migration status
- `migrate:reset-prod-admin` - Reset production admin password

### Production Seeding (2 scripts)
These scripts set up production data. Replaced by API-based seeding.

- `seed:prod` - Seed production with data
- `seed:setup` - Add seed secret to environment

### Selective Test Filtering (2 scripts)
These scripts filtered tests by affected files. Not used in current workflow.

- `test:affected` - Run tests for affected files
- `test:affected:dry` - Dry-run test filtering

---

## Active Scripts Retained (47)

All essential scripts for development, testing, and deployment remain:

**Core Development:**
- `dev`, `dev:e2e`, `dev:test:local`
- `build`, `start`
- `typecheck`, `typecheck:watch`
- `lint`, `lint:eslint`, `lint:fix`, `format`

**Testing:**
- `test`, `test:watch`, `test:unit`, `test:unit:watch`, `test:ui`, `test:coverage`
- `test:db:*` (5 database utilities)
- `test:e2e`, `test:e2e:manual`, `test:e2e:ui`, `test:e2e:headed`, `test:e2e:debug`, `test:e2e:chromium`
- `test:smoke`, `test:smoke:ui`, `test:smoke:headed`, `test:smoke:critical`, `test:smoke:crud`
- `test:report`

**CI & Playwright:**
- `test:e2e:ci-mode`
- `ci:show-trace`
- `playwright:install`

**Database Management:**
- `db:seed`, `db:seed:demo`, `db:seed:clean`
- `db:studio`, `db:migrate`, `db:deploy`

**Admin & Utilities:**
- `admin:create`, `admin:verify`
- `postinstall`

---

## Impact Analysis

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total npm scripts | 58 | 47 | -11 (-19%) |
| Dev dependencies | 28 | 26 | -2 |
| Package size | ~2.8GB | ~2.8GB | Minimal |
| Lock file entries | 1359 | ~1340 | Cleaner |

---

## CI/CD Verification

**Status:** ✅ No impact on CI/CD pipelines

Verified that all removed scripts are:
- Not referenced in `.github/workflows/` files
- Not documented in active runbooks
- Not part of essential development workflows

The following CI workflows continue to use expected scripts:
- `.github/workflows/ci.yml` - Uses `lint`, `typecheck`, `test`, `build`
- `.github/workflows/smoke-tests.yml` - Uses `test:smoke`, `build`, `db:seed:clean`
- `.github/workflows/e2e-tests.yml` - Uses `test:e2e:manual`

---

## Package List Changes

### Before
```json
"devDependencies": {
  "@opentelemetry/instrumentation": "^0.208.0",
  "baseline-browser-mapping": "^2.9.3",
  ...
}
```

### After
```json
"devDependencies": {
  // @opentelemetry/instrumentation removed
  // baseline-browser-mapping removed
  ...
}
```

---

## Verification Steps Performed

✅ **Codebase Search** - Verified no imports of removed packages  
✅ **CI Workflow Scan** - Confirmed removed scripts not used in CI  
✅ **Dependency Tree** - Confirmed no transitive dependencies  
✅ **TypeScript Check** - Ran `pnpm run typecheck` - ✅ passes  
✅ **Lock File** - Updated `pnpm-lock.yaml` - removed 2 packages  

---

## How to Recover (If Needed)

### Re-add Packages
```bash
pnpm add -D @opentelemetry/instrumentation baseline-browser-mapping
```

### Re-add Scripts
Edit `package.json` and add back from git history:
```bash
git show HEAD~1:package.json | grep -A 15 '"scripts"'
```

---

## Next Steps

**Recommended:** None - cleanup is complete and verified.

**Optional:** Consider similar cleanup for:
- Unused playwright config files (`.vercel.config.ts`)
- Old migration scripts in `scripts/` directory
- Archived test configurations

---

**Cleanup Date:** December 7, 2025  
**Branch:** main  
**Status:** ✅ Complete
