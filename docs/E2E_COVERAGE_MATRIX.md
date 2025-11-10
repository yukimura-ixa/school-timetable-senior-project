# E2E Test Coverage Matrix

> **Last Updated**: January 2025  
> **Status**: Comprehensive coverage with identified gaps addressed

---

## Overview

This document provides a complete mapping of all application routes to their corresponding Playwright E2E test coverage. The matrix tracks which user journeys are tested, test counts, and coverage status for each route.

### Coverage Summary

- **Total Routes**: 40+
- **Routes with E2E Coverage**: 38+  
- **Routes Needing Coverage**: 2-3 (advanced features planned for Phase 2+)
- **Total E2E Tests**: 100+ across 70+ spec files
- **Test Execution Time**: 15-25 minutes (optimized with parallel execution)

### Legend

- ✅ **Complete**: Full coverage with happy paths + error scenarios
- 🔶 **Partial**: Happy paths covered, some edge cases missing
- ❌ **Missing**: No test coverage yet
- 🚧 **Planned**: Feature not yet implemented, tests to be added later

---

## Public Routes (Unauthenticated Access)

| Route | Spec File | Test Count | Journeys Covered | Status |
|-------|-----------|------------|------------------|--------|
| `/` | `06-public-homepage.spec.ts` | 15+ | Homepage load, quick stats, mini charts, tab navigation (teachers/classes), search, pagination, responsive design | ✅ Complete |
| `/teachers/[id]/[semesterAndyear]` | `public-schedule-pages.spec.ts` | 12 | Load without auth, grid layout validation, period/time display, subject details with grades, room information, empty cell handling, error handling (invalid ID, missing semester), print functionality, back navigation, semester info display | ✅ Complete |
| `/classes/[gradeId]/[semesterAndyear]` | `public-schedule-pages.spec.ts` | 9 | Load without auth, class info display, grid structure validation, teacher names with honorifics, subject code display, navigation, multiple periods per day, program information, error handling (invalid gradeId) | ✅ Complete |
| `/` (Common Features) | `public-schedule-pages.spec.ts` | 8 | PII protection (no emails/phones), responsive design (mobile 375px, tablet 768px), performance (<5s load), accessibility (semantic HTML), text overflow handling, consistent navigation | ✅ Complete |
| `/` (Public Data API) | `public-data-api.spec.ts` | 27 | PII protection validation, data structure validation, pagination (limit/offset), search functionality, teacher/class endpoints, data integrity, cache headers, error responses | ✅ Complete |

**Public Routes Total**: 71 tests across 3 spec files

---

## Dashboard Routes (Authenticated - Admin/Teacher)

| Route | Spec File | Test Count | Journeys Covered | Status |
|-------|-----------|------------|------------------|--------|
| `/dashboard/select-semester` | `07-server-component-migration.spec.ts` | 8+ | Semester selection, card display, semester info (year/term), navigation to dashboard, create new semester, authentication required | ✅ Complete |
| `/dashboard/[semesterAndyear]` | `08-dashboard-landing.spec.ts` | 6+ | Dashboard landing, quick actions, summary cards, navigation to features (conflicts, analytics, assign, arrange, lock), semester context display | ✅ Complete |
| `/dashboard/[semesterAndyear]/analytics` | `analytics-dashboard.spec.ts` | 30+ | Overview stats (scheduled hours, completion rate, active teachers, conflicts count), teacher workload analysis (list with status indicators, progress bars, sorting by workload), room utilization analysis (occupancy rates, status chips, sorting by usage), data accuracy validation (realistic percentages, non-negative counts), UI/UX (scrollable lists, responsive mobile), performance (<10s load) | ✅ Complete |
| `/dashboard/[semesterAndyear]/conflicts` | `12-conflict-detector.spec.ts` | 12+ | Conflict detection, teacher conflicts (same time), room conflicts (double booking), timeslot conflicts (schedule overlap), conflict resolution workflow, conflict highlighting, conflict count badge, filter by type | ✅ Complete |
| `/dashboard/[semesterAndyear]/teacher-table` | `issue-84-teacher-table-pdf.spec.ts`, `issue-85-teacher-table-select-all.spec.ts`, `issue-87-teacher-table-export-many.spec.ts` | 20+ | Teacher list display, checkbox selection (individual, select all, select none), PDF export (single, multiple teachers), export configuration (paper size, layout), print preview, performance (handling 50+ teachers), error handling (no selection) | ✅ Complete |
| `/dashboard/[semesterAndyear]/student-table` | `10-student-schedule.spec.ts` | 8+ | Student schedule display, class-based grouping, timetable grid, subject details, teacher assignments, navigation | ✅ Complete |

**Dashboard Routes Total**: 84+ tests across 6 spec files

---

## Management Routes (Authenticated - Admin Only)

| Route | Spec File | Test Count | Journeys Covered | Status |
|-------|-----------|------------|------------------|--------|
| `/management/teacher` | `02-teacher-management.spec.ts` | 10+ | Create teacher (with Thai honorifics), edit teacher, delete teacher, list teachers, search/filter, department assignment, validation (required fields), error handling, pagination | ✅ Complete |
| `/management/subject` | `03-subject-management.spec.ts` | 10+ | Create subject (Thai code format), edit subject, delete subject, list subjects, credit validation (0.5-2.0), learning area assignment (8 Thai MOE areas), subject type (core/elective), validation, search | ✅ Complete |
| `/management/room` | `04-room-management.spec.ts` | 8+ | Create room, edit room, delete room, list rooms, building assignment, capacity setting, room type, validation | ✅ Complete |
| `/management/gradelevel` | `05-gradelevel-management.spec.ts` | 8+ | Create grade level (M.1-M.6 format), edit grade level, delete grade level, list grade levels, section assignment, program linkage, validation | ✅ Complete |
| `/management/program` | `11-program-management.spec.ts` | 12+ | Create program (Thai curriculum), edit program, delete program, list programs, grade level association, subject requirements, program type, validation, search/filter | ✅ Complete |
| `/management/config` | `09-config-management.spec.ts` | 10+ | Create semester config, edit config, delete config, config copy functionality, timeslot configuration, break time settings, validation (unique semester-year), error handling | ✅ Complete |

**Management Routes Total**: 58+ tests across 6 spec files

---

## Schedule Routes (Authenticated - Admin/Teacher)

| Route | Spec File | Test Count | Journeys Covered | Status |
|-------|-----------|------------|------------------|--------|
| `/schedule/[semesterAndyear]/config` | `specs/timeslot-config.spec.ts` | 6+ | Timeslot configuration, period setup (8 periods/day), time range setting, break time configuration, validation (no overlap), save config | ✅ Complete |
| `/schedule/[semesterAndyear]/assign` | `issue-94-teacher-assignment.spec.ts` | 20 | Quick assignment mode, teacher selection, subject assignment, room allocation, timeslot picker (day/period), conflict detection during assignment, bulk assignment, validation (required fields), error handling, success feedback | ✅ Complete |
| `/schedule/[semesterAndyear]/assign` (Tab Navigation) | `specs/assign-tab-navigation.spec.ts` | 8+ | Tab switching (assign/view/conflicts), state persistence, smooth transitions, URL updates, breadcrumb navigation, responsive tabs | ✅ Complete |
| `/schedule/[semesterAndyear]/arrange` | `specs/arrange-feature.spec.ts` | 15+ | Arrange mode, drag-and-drop scheduling, timeslot grid, schedule rearrangement, conflict validation on drop, undo/redo, save arrangements, calendar view, responsive design | ✅ Complete |
| `/schedule/[semesterAndyear]/arrange/teacher/*` | `specs/teacher-arrange-migration.spec.ts` | 12+ | Teacher-specific arrangement view, filter by teacher, teacher schedule grid, assignment management, conflict highlighting specific to teacher, save changes | ✅ Complete |
| `/schedule/[semesterAndyear]/lock` | `13-bulk-lock.spec.ts` | 10+ | Timeslot locking, bulk lock operations, lock by period, lock by day, lock by room, unlock functionality, lock status display, validation (prevent scheduling on locked slots) | ✅ Complete |
| `/schedule/[semesterAndyear]/lock/templates` | `14-lock-templates.spec.ts` | 8+ | Lock template creation, template naming, template application, save templates, load templates, template management (edit/delete), validation | ✅ Complete |

**Schedule Routes Total**: 79+ tests across 7 spec files

---

## Advanced Features & Utilities

| Route/Feature | Spec File | Test Count | Journeys Covered | Status |
|---------------|-----------|------------|------------------|--------|
| Drag & Drop Functionality | `specs/drag-and-drop.spec.ts` | 6+ | Drag schedule cards, drop zones, conflict detection on drop, visual feedback, undo drag, error handling (invalid drop) | ✅ Complete |
| PDF Export & Customization | `15-pdf-customization.spec.ts` | 8+ | PDF generation, page size selection (A4/Letter), layout options (portrait/landscape), header/footer customization, font settings, preview before download, batch export | ✅ Complete |
| Search & Filter | Multiple spec files | 15+ | Search teachers, filter by department, search subjects, filter by learning area, search rooms, filter by building, pagination with search, clear filters | ✅ Complete |
| Authentication & Authorization | `auth.spec.ts`, integrated in all specs | 20+ | Google OAuth login, admin role verification, teacher role verification, student role verification, unauthenticated redirect, session persistence, logout | ✅ Complete |
| Smoke Tests (Critical Paths) | `smoke/critical-paths.spec.ts` | 6+ | Core workflows end-to-end (create config → assign → arrange → lock → export), data integrity across features, performance benchmarks | ✅ Complete |

**Advanced Features Total**: 55+ tests across 5+ spec files

---

## Integration Tests (Data Layer & API)

| Feature/API | Spec File | Test Count | Journeys Covered | Status |
|-------------|-----------|------------|------------------|--------|
| Public Data API | `public-data-api.spec.ts` | 27 | GET /teachers, GET /classes, PII protection, pagination, search, cache headers, error responses (404, 500), data structure validation | ✅ Complete |
| Seed Validation | `__test__/seed-validation.test.ts` | 10+ | Seed data integrity, teacher count (56 expected), subject count (50+), room count (40), grade level count (18), relationship integrity (teacher-subject, subject-room) | ✅ Complete |
| Management Server Actions | `__test__/management-server-actions.test.ts` | 15+ | CRUD operations via Server Actions, validation logic, error handling, authorization checks, data mutations, idempotency | ✅ Complete |

**Integration Tests Total**: 52+ tests across 3 spec files

---

## Feature-Specific Test Files (GitHub Issues)

| Issue | Spec File | Test Count | Journeys Covered | Status |
|-------|-----------|------------|------------------|--------|
| [#84](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/84) Teacher Table PDF | `issue-84-teacher-table-pdf.spec.ts` | 8 | PDF export functionality, single teacher export, download verification | ✅ Complete |
| [#85](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/85) Teacher Table Select All | `issue-85-teacher-table-select-all.spec.ts` | 6 | Select all checkbox, select none, partial selection state | ✅ Complete |
| [#87](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/87) Export Many Teachers | `issue-87-teacher-table-export-many.spec.ts` | 6 | Batch PDF export, multiple teacher selection, performance with 20+ PDFs | ✅ Complete |
| [#94](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/94) Teacher Assignment Flow | `issue-94-teacher-assignment.spec.ts` | 20 | Complete assignment workflow, quick assignment mode, conflict detection, validation | ✅ Complete |
| [#57](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/57) Conflict Detection Phase 1 | `specs/issue-57-conflict-ui.spec.ts` | 8 | UI integration for conflict detector, conflict highlighting, filter by type | ✅ Complete |

**Issue-Specific Tests Total**: 48 tests across 5 spec files

---

## Identified Gaps & Future Work

### Missing Coverage (To Be Added)

1. **Exam Arrange Mode** (`/schedule/[semesterAndyear]/exam-arrange`)  
   - Status: 🚧 Planned for Phase 2  
   - Design documented in `exam_arrange_mode_design_future_feature` memory  
   - Not yet implemented in UI

2. **Analytics Dashboard Phase 2+** (`/dashboard/[semesterAndyear]/analytics`)  
   - Status: 🔶 Partial (Phase 1 complete, Phase 2+ pending)  
   - Covered: Overview stats, teacher workload, room utilization  
   - Missing: Subject distribution charts, quality metrics, time distribution analysis, compliance checks  
   - Plan: Add tests when Phase 2 features implemented

3. **Advanced Lock Template Features**  
   - Status: 🔶 Partial  
   - Covered: Basic template CRUD  
   - Missing: Template sharing between semesters, template versioning, template presets

### Test Quality Improvements Needed

1. **Replace `waitForTimeout` with Event-Driven Waits**  
   - Priority: High  
   - Action: Use `grep_search` to find all `waitForTimeout` usage  
   - Replace with: `toBeVisible()`, `networkidle`, URL changes  
   - Estimate: 10-15 occurrences across test suite

2. **Add Missing `data-testid` Attributes**  
   - Priority: Medium  
   - Components needing stable selectors:
     - Teacher/class schedule grid components: `timetable-grid`, `teacher-name`, `class-name`
     - Analytics components: `stat-card-*`, `teacher-entry`, `room-entry`, `workload-status`, `occupancy-status`
     - Navigation: `semester-selector`, `back-button`  
   - Estimate: 15-20 attributes across 5-8 files

3. **Expand Error Scenario Coverage**  
   - Priority: Medium  
   - Focus areas:
     - Network failures and retry logic
     - Concurrent user edits (optimistic locking)
     - Database constraint violations
     - File upload/download failures

---

## Test Execution Configuration

### Local Execution

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific spec file
pnpm playwright test e2e/public-schedule-pages.spec.ts

# Run with UI mode (debugging)
pnpm test:e2e:ui

# Run with headed browser
pnpm playwright test --headed

# Generate HTML report
pnpm test:e2e --reporter=html
```

### CI Configuration

- **Browsers**: Chromium only (Brave disabled for performance)
- **Workers**: 4 parallel workers
- **Execution Mode**: `fullyParallel: true`
- **Timeouts**: 
  - Action: 10 seconds  
  - Navigation: 20 seconds  
  - Test: 60 seconds
- **Retries**: 2 (on CI), 0 (on local)
- **Database**: Docker PostgreSQL on port 5433
- **Seed Data**: 56 teachers, 50+ subjects, 40 rooms, 18 grade levels, 3 semesters

### Performance Benchmarks

- **Initial State** (Nov 2024): 2.5 hours for full suite
- **Current State** (Jan 2025): 15-25 minutes for full suite  
- **Optimization**: 90% faster via parallel execution + chromium-only + database reuse

---

## Test Patterns & Best Practices

### Selector Strategy

1. **Preferred Order**:
   - `page.getByRole('button', { name: 'Submit' })` - Semantic, accessible
   - `page.getByLabel('Teacher Name')` - Form inputs
   - `page.getByTestId('teacher-card')` - Stable data-testid
   - `page.locator('table')` - Generic element (last resort)

2. **Avoid**:
   - CSS class selectors (`.btn-primary`) - brittle, changes with styling
   - Text-based selectors for dynamic content
   - Complex CSS selectors (`:nth-child(3)`)

### Wait Strategies

```typescript
// ✅ GOOD: Event-driven waits
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
await page.waitForLoadState('networkidle');
await page.waitForURL(/\/dashboard\/\d+-\d{4}/);

// ❌ BAD: Arbitrary timeouts
await page.waitForTimeout(3000); // Brittle! Fails on slow machines
```

### Test Structure (AAA Pattern)

```typescript
test('should create new teacher', async ({ page }) => {
  // Arrange - Setup initial state
  await page.goto('/management/teacher');
  
  // Act - Perform action
  await page.getByRole('button', { name: 'Create Teacher' }).click();
  await page.getByLabel('First Name').fill('สมชาย');
  await page.getByRole('button', { name: 'Save' }).click();
  
  // Assert - Verify outcome
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(page.locator('table')).toContainText('สมชาย');
});
```

### Data Seeding for Tests

All E2E tests rely on consistent seeded data from `prisma/seed.ts`:

- **Semesters**: `1-2567`, `2-2567`, `1-2568`
- **Teachers**: 56 teachers across 8 departments
- **Subjects**: 50+ subjects with Thai codes (TH101, MA101, etc.)
- **Rooms**: 40 rooms in 2 buildings (A, B)
- **Grade Levels**: 18 levels (M.1-M.6, 3 sections each)

**Important**: Tests assume specific teacher/class IDs:
- Teacher ID `1` - Admin user (สมชาย ใจดี)
- Grade ID `101` - M.1/1 (Matthayom 1, Section 1)
- Room ID `1` - Room A101

---

## Coverage Matrix Maintenance

### When to Update This Document

1. **New Route Added**: Create corresponding E2E test file, update matrix
2. **Feature Implementation**: Add test count and journeys covered
3. **Test Refactoring**: Update status if coverage improved/changed
4. **Gap Identified**: Add to "Identified Gaps" section with priority

### Review Schedule

- **Monthly**: Review coverage matrix for accuracy
- **Pre-Release**: Verify all critical paths have E2E coverage
- **Post-Incident**: Add regression tests for bugs found in production

### Owners

- **Test Suite Maintainer**: Development Team
- **Coverage Auditor**: Tech Lead
- **CI/CD Pipeline**: GitHub Actions + Vercel

---

## Related Documentation

- [Testing Strategy (Issue #94)](../memories/issue_94_testing_strategy_e2e_focus) - E2E-first philosophy
- [E2E Performance Optimization](../memories/e2e_performance_optimization_nov2025) - 90% speed improvement
- [Public Data E2E Tests Migration](../memories/public_data_e2e_tests_migration) - 27 tests from Jest integration
- [User Flows Documentation](../memories/comprehensive_user_flows) - 18 major flows, 25+ pages
- [Playwright Configuration](../playwright.config.ts) - Test setup and timeouts
- [GitHub Issue/PR Policy](./github_issue_pr_policy) - Issue creation for test gaps

---

**Last Updated**: January 2025  
**Next Review**: February 2025  
**Status**: ✅ Comprehensive E2E coverage with 2-3 identified gaps for future work
