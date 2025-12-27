# E2E Tests for School Timetable System

## Overview

This directory contains end-to-end (E2E) tests for the School Timetable Management System using Playwright.

**Test Suite Size:** 32 E2E test files (updated Dec 2025)  
**Estimated Runtime:** 30-40 minutes (full suite)  
**Last Updated:** 2025-12-21

## Quick Start

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm playwright install --with-deps

# Run all E2E tests
pnpm test:e2e

# Run smoke tests only (critical path - 10-15 min)
pnpm playwright test e2e/smoke/
```

---

## Test Structure

The test suite is organized into **3 tiers** for optimal coverage and performance:

### 📁 Tier 1: Smoke Tests (Critical Path)

**Location:** `e2e/smoke/`  
**Runtime:** 10-15 minutes  
**Purpose:** Core user journeys validation

- `critical-smoke.spec.ts` ⭐ **ESSENTIAL** - 8 core user journeys:
  1. Authentication Flow
  2. Data Management (Teachers CRUD)
  3. Schedule Configuration
  4. Subject Assignment to Teachers
  5. Timetable Creation (Teacher Arrange)
  6. Conflict Detection
  7. View Teacher Schedule
  8. Export to Excel

- `crud-smoke.spec.ts` - Create operations for all entities
- `semester-smoke.spec.ts` - Semester routing and navigation

### 📁 Tier 2: Feature Tests (Core Functionality)

**Location:** `e2e/` (root level)  
**Runtime:** 20-25 minutes  
**Purpose:** Comprehensive feature coverage

#### Authentication & Security

- `01-auth/admin-auth-flow.spec.ts` - Auth flow + role enforcement
- `security-role-enforcement.spec.ts` - Role-based access control
- `14-security-pii-exposure.spec.ts` - PII data protection

#### Data Management

- `02-data-management.spec.ts` - Teachers, subjects, rooms CRUD
- `03-schedule-config.spec.ts` - Schedule configuration
- `01-home-page.spec.ts` - Home page and navigation

#### Scheduling & Arrangement

- `08-drag-and-drop.spec.ts` - Comprehensive drag-drop scenarios
- `05-view-teacher-schedule.spec.ts` - Schedule viewing
- `20-subject-assignment.spec.ts` - Subject assignment flow **(NEW - Dec 2025)**
- `21-arrangement-flow.spec.ts` - Arrangement core workflow (drag-drop, room, save)

#### Conflicts & Validation

- `04-conflict-prevention.spec.ts` - Conflict detection
- `12-conflict-detector.spec.ts` - Advanced conflict scenarios

#### Locking & Templates

- `13-bulk-lock.spec.ts` - Bulk timeslot locking
- `14-lock-templates.spec.ts` - Lock template management

#### Program & Curriculum

- `09-program-management.spec.ts` - Program CRUD operations
- `10-program-subject-assignment.spec.ts` - Subject assignments to programs
- `11-activity-management.spec.ts` - Student activity management

#### Export & Publishing

- `06-export/viewing-exports.spec.ts` - Export functionality
- `15-pdf-customization.spec.ts` - PDF customization
- `16-publish-gate.spec.ts` - Publishing workflow
- `17-all-timeslot-ux.spec.ts` - All-timeslot UI/UX

#### Server Components

- `07-server-component-migration.spec.ts` - Server component behavior

### 📁 Tier 3: API & Integration Tests

**Location:** `e2e/api/`, `e2e/integration/`, `e2e/dashboard/`  
**Runtime:** 5-10 minutes  
**Purpose:** API endpoints and integration scenarios

- `api/seed-endpoint.spec.ts` - Seeding API endpoint
- `public-data-api.spec.ts` - Public API endpoints
- `public-schedule-pages.spec.ts` - Public schedule pages
- `dashboard/analytics-dashboard.spec.ts` - Analytics dashboard
- `integration/analytics-dashboard-vercel.spec.ts` - Vercel-specific features

### 📁 Visual Tests (Optional)

**Location:** `e2e/visual/`  
**Runtime:** 5 minutes  
**Purpose:** Spot checks for visual regressions

- `visual/visual-inspection.spec.ts` - Visual regression checks

---

## Running Tests

### Recommended: Smoke Tests First

```bash
# Run critical path smoke tests (fastest validation)
pnpm playwright test e2e/smoke/critical-smoke.spec.ts
```

### Run by Tier

```bash
# Tier 1: Smoke tests
pnpm playwright test e2e/smoke/

# Tier 2: Feature tests
pnpm playwright test e2e/ --ignore-snapshots

# Tier 3: API & Integration
pnpm playwright test e2e/api/ e2e/integration/ e2e/dashboard/
```

### Run Specific Features

```bash
# Authentication tests
pnpm playwright test e2e/01-auth/ e2e/security-role-enforcement.spec.ts

# Drag-and-drop only
pnpm playwright test e2e/08-drag-and-drop.spec.ts e2e/21-arrangement-flow.spec.ts

# Conflict detection
pnpm playwright test e2e/04-conflict-prevention.spec.ts e2e/12-conflict-detector.spec.ts
```

### Optional Suites (Env Flags)

Some suites are opt-in to keep CI stable while UIs or data requirements are in flux.
Enable them by setting env flags:

```bash
# Feature suites
E2E_ACTIVITY_MANAGEMENT=true
E2E_LOCK_TEMPLATES=true
E2E_PDF_EXPORT=true
E2E_ANALYTICS_DASHBOARD=true
E2E_ADMIN_EDGE_CASES=true
E2E_DASHBOARD_VIEWS=true
E2E_LOCK_INTEGRATION=true
E2E_COMPLIANCE_UI=true
E2E_PROGRAM_ASSIGNMENT=true
E2E_SCHEDULE_ASSIGNMENT_EXTENDED=true
UNIT_ANALYTICS_OVERVIEW=true

# Mutation-heavy suites
E2E_LOCK_TEMPLATES_MUTATE=true
E2E_BULK_LOCK=true
E2E_BULK_LOCK_MUTATE=true
```

### Interactive Mode

```bash
# Run with Playwright UI (great for debugging)
pnpm test:e2e:ui

# Debug specific test
pnpm playwright test e2e/smoke/critical-smoke.spec.ts --debug
```

### CI/CD Usage

```bash
# Full suite (parallel sharding)
pnpm test:e2e

# With video recording
pnpm test:e2e --video=on

# Generate HTML report
pnpm playwright show-report
```

---

## Test Execution Strategy

### **Pre-Commit** (Fast - 10-15 min)

```bash
pnpm test                              # Jest unit tests (~2 min)
pnpm playwright test e2e/smoke/critical-smoke.spec.ts  # Critical smoke (~10-15 min)
```

### **CI Pipeline** (Full coverage - 30-40 min)

```bash
pnpm test                              # Jest unit tests
pnpm test:e2e                          # All E2E tests (31 files)
```

### **Pre-Release** (Comprehensive - 45+ min)

```bash
pnpm test
pnpm test:e2e
pnpm test:e2e --project=chromium,firefox,webkit  # Cross-browser
```

---

## Test Configuration

Configured via `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium (Brave/Chrome)
- **Retries**: 2 in CI, 0 locally
- **Video**: On failure only
- **Screenshots**: On failure
- **Timeout**: 30s navigation, 15s actions
- **Sharding**: 4 parallel shards in CI

---

## Coverage Summary

### ✅ Core Functionality

- Authentication (credentials + OAuth)
- Role-based access control (admin/guest)
- CRUD operations (teachers, subjects, rooms, programs)
- Schedule configuration and arrangement
- Drag-and-drop interactions (@dnd-kit)
- Conflict detection (teacher/room/time)
- Timeslot locking and templates
- Export to Excel/PDF
- Public API and schedule pages

### ✅ Security

- PII exposure prevention
- Role enforcement
- Unauthorized access blocking

### ✅ Integration

- Vercel deployment features
- Analytics dashboard
- Seeding API endpoints

---

## Test Data Requirements

Ensure test database contains:

- **Teachers**: 5+ with various departments
- **Subjects**: 10+ with different credits (0.5-2.0)
- **Rooms**: 5+ in different buildings
- **Grade Levels**: 3+ with 2-3 classes each
- **Semester**: 1+ configured with timeslots
- **Sample Data**: Some assigned subjects and arranged timetables

Use `pnpm db:seed:clean` to populate with MOE-compliant test data.

---

## Authentication Setup

**Default Test Account:**

- Email: `admin@school.local`
- Password: `admin123`
- Role: `admin`

**OAuth Testing:**
The tests use credential-based auth. For Google OAuth testing, configure:

1. Test Google account credentials (never commit)
2. Update `e2e/auth.setup.ts` with OAuth flow
3. Store credentials in GitHub Secrets for CI

---

## Troubleshooting

### Tests Timing Out

- Increase timeout in `playwright.config.ts`
- Check dev server is running: `pnpm dev`
- Verify network connectivity

### Authentication Failures

- Ensure `.env` configured correctly
- Check database has seeded admin user
- Review `e2e/auth.setup.ts` for login flow

### Database Errors

- Verify PostgreSQL is running
- Apply migrations: `pnpm prisma migrate deploy`
- Seed data: `pnpm db:seed:clean`

### Flaky Tests

- Increase wait times in test
- Check for race conditions
- Review CI logs for timing issues

---

## Test Artifacts

Results stored in:

- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/artifacts/` (on failure)
- **HTML Report**: `playwright-report/`
- **Backups**: `e2e/.backup_YYYYMMDD/` (optimization backups)

---

## Recent Changes

### 2025-11-26: Test Suite Optimization

- **Removed 18 redundant test files** (37.5% reduction)
- **Before:** 48 test files
- **After:** 31 test files
- **Runtime improvement:** 33-40% faster
- **Coverage maintained:** All critical paths via smoke tests

**Removed:**

- Duplicate files (8): `admin-auth-flow.spec.ts`, `visual-inspection.spec.ts`, etc.
- Issue regression tests (6): `issue-83-85-*.spec.ts`, `issue-84-*.spec.ts`, etc.
- Consolidated public pages (2)
- Manual/visual tests (2)

**Backup:** `e2e/.backup_20251126_210906/`

### 2025-12-21: Assignment & Arrangement Flow Tests

- **Added 2 new test files** (14 tests total)
- `20-subject-assignment.spec.ts` - Teacher/subject assignment workflow
- `21-arrangement-flow.spec.ts` - Schedule arrangement with drag-drop
- **Serena Memory:** `e2e_assignment_arrangement_tests_dec2025`

---

## Contributing

When adding new tests:

1. Follow existing naming conventions (numbered or semantic)
2. Add to appropriate tier (smoke/feature/integration)
3. Include descriptive test names and comments
4. Update this README if adding new test categories
5. Ensure tests can run independently
6. Use page objects from `e2e/page-objects/` when available

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Project README](../README.md)
- [Test Optimization Plan](../C:/Users/napat/.gemini/antigravity/brain/0865ce8f-d575-496d-bcfb-15f024c13c58/test-optimization-plan.md)

---

## Contact

For questions about E2E tests:

- Check existing issues in the repository
- Refer to project README for team contacts
- Review `e2e/TEST_PLAN.md` for detailed test case documentation
