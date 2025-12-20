# E2E Test Expansion Plan - 80%+ Critical Path Coverage

**Issue Reference**: #36  
**Estimated Effort**: 5 weeks  
**Framework**: Playwright with TypeScript  
**Pattern**: Page Object Model (POM)

---

## 📋 Executive Summary

This plan outlines expansion of E2E test coverage from current basic flows to 80%+ critical path coverage across all user roles (Admin, Teacher, Student). Following Playwright best practices and Page Object Model pattern for maintainability.

---

## 🎯 Coverage Goals

### Current State

- ✅ Basic navigation tests (home, public pages)
- ✅ Data management CRUD operations
- ✅ Schedule configuration basic flows
- ✅ Timetable arrangement page loads
- ✅ Viewing and export page loads
- ✅ Drag-and-drop basic tests

### Target State (80%+ Coverage)

- **Admin Role**: Complete schedule lifecycle (create → assign → resolve conflicts → lock → export)
- **Teacher Role**: View personal schedule, export, view student schedules
- **Student Role**: View class schedule, mobile-responsive navigation
- **Error Scenarios**: All conflict detection, network errors, session timeout

---

## 🏗️ Architecture Pattern: Page Object Model

### Benefits

1. **Separation of Concerns**: UI locators separate from test logic
2. **Reusability**: Same page objects across multiple tests
3. **Maintainability**: UI changes only affect page objects, not tests
4. **Readability**: Tests read like user stories
5. **Type Safety**: TypeScript interfaces for all page objects

### Structure

```
e2e/
├── pages/                          # Page Object Models
│   ├── admin/
│   │   ├── ScheduleAssignmentPage.ts
│   │   ├── TeacherManagementPage.ts
│   │   ├── SubjectManagementPage.ts
│   │   ├── ClassroomManagementPage.ts
│   │   └── ConflictResolutionPage.ts
│   ├── teacher/
│   │   ├── TeacherSchedulePage.ts
│   │   └── StudentScheduleViewPage.ts
│   ├── student/
│   │   └── ClassSchedulePage.ts
│   └── common/
│       ├── LoginPage.ts
│       ├── NavigationPage.ts
│       └── ExportPage.ts
├── fixtures/                       # Custom test fixtures
│   ├── admin.fixture.ts
│   ├── teacher.fixture.ts
│   ├── student.fixture.ts
│   └── seed-data.fixture.ts
├── tests/                          # Test specifications
│   ├── admin/
│   │   ├── schedule-assignment.spec.ts
│   │   ├── data-management.spec.ts
│   │   └── conflict-resolution.spec.ts
│   ├── teacher/
│   │   └── schedule-viewing.spec.ts
│   ├── student/
│   │   └── schedule-viewing.spec.ts
│   └── errors/
│       └── conflict-scenarios.spec.ts
└── helpers/                        # Existing helpers (keep)
    ├── auth.ts
    ├── navigation.ts
    └── drag-drop.helper.ts
```

---

## 📝 Implementation Phases

### Phase 1: Admin Role Tests (2 weeks) - Priority 1

#### 1.1 Page Object Models

Create comprehensive POMs for admin workflows:

**ScheduleAssignmentPage.ts**

```typescript
export class ScheduleAssignmentPage {
  constructor(private page: Page) {}

  // Locators
  private get semesterDropdown() {
    return this.page.locator('[data-testid="semester-selector"]');
  }
  private get teacherDropdown() {
    return this.page.locator('[data-testid="teacher-selector"]');
  }
  private get subjectList() {
    return this.page.locator('[data-testid="subject-list"]');
  }
  private get timeslotGrid() {
    return this.page.locator('[data-testid="timeslot-grid"]');
  }
  private get conflictIndicator() {
    return this.page.locator('[data-testid="conflict-indicator"]');
  }

  // Actions
  async goto(semester: string) {
    await this.page.goto(`/schedule/${semester}/arrange`);
    await this.page.waitForLoadState("networkidle");
  }

  async selectTeacher(teacherId: string) {
    await this.teacherDropdown.selectOption(teacherId);
  }

  async dragSubjectToTimeslot(
    subjectCode: string,
    day: string,
    period: number,
  ) {
    const subject = this.subjectList.filter({ hasText: subjectCode });
    const timeslot = this.timeslotGrid.locator(
      `[data-day="${day}"][data-period="${period}"]`,
    );
    await subject.dragTo(timeslot);
  }

  async getConflictMessage(): Promise<string | null> {
    if (await this.conflictIndicator.isVisible()) {
      return await this.conflictIndicator.textContent();
    }
    return null;
  }

  async lockTimeslot(day: string, period: number) {
    const timeslot = this.timeslotGrid.locator(
      `[data-day="${day}"][data-period="${period}"]`,
    );
    await timeslot.click({ button: "right" }); // Context menu
    await this.page.locator("text=Lock").click();
  }

  async exportSchedule(format: "excel" | "pdf") {
    await this.page.locator('[data-testid="export-button"]').click();
    await this.page.locator(`text=${format.toUpperCase()}`).click();
  }
}
```

**TeacherManagementPage.ts**

```typescript
export class TeacherManagementPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/management/teachers");
  }

  async createTeacher(data: TeacherData) {
    await this.page.locator('[data-testid="add-teacher-button"]').click();
    await this.page.locator('[name="teacherName"]').fill(data.name);
    await this.page.locator('[name="teacherCode"]').fill(data.code);
    await this.page.locator('[type="submit"]').click();
  }

  async updateTeacher(teacherId: string, data: Partial<TeacherData>) {
    await this.page
      .locator(`[data-teacher-id="${teacherId}"] [data-testid="edit-button"]`)
      .click();
    if (data.name)
      await this.page.locator('[name="teacherName"]').fill(data.name);
    await this.page.locator('[type="submit"]').click();
  }

  async deleteTeacher(teacherId: string) {
    await this.page
      .locator(`[data-teacher-id="${teacherId}"] [data-testid="delete-button"]`)
      .click();
    await this.page.locator('[data-testid="confirm-delete"]').click();
  }

  async searchTeacher(query: string) {
    await this.page.locator('[data-testid="search-input"]').fill(query);
  }

  async getTeacherCount(): Promise<number> {
    return await this.page.locator('[data-testid="teacher-row"]').count();
  }
}
```

#### 1.2 Test Specifications

Create comprehensive admin tests:

**schedule-assignment.spec.ts**

```typescript
import { test, expect } from "@playwright/test";
import { ScheduleAssignmentPage } from "../pages/admin/ScheduleAssignmentPage";

test.describe("Admin: Schedule Assignment Flow", () => {
  let schedulePage: ScheduleAssignmentPage;

  test.beforeEach(async ({ page }) => {
    schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto("1-2567");
  });

  test("should assign subject to timeslot successfully", async () => {
    await schedulePage.selectTeacher("TCH001");
    await schedulePage.dragSubjectToTimeslot("TH101", "MON", 1);

    const conflict = await schedulePage.getConflictMessage();
    expect(conflict).toBeNull();
  });

  test("should detect teacher double-booking conflict", async () => {
    await schedulePage.selectTeacher("TCH001");
    await schedulePage.dragSubjectToTimeslot("TH101", "MON", 1);
    await schedulePage.dragSubjectToTimeslot("TH102", "MON", 1); // Same timeslot

    const conflict = await schedulePage.getConflictMessage();
    expect(conflict).toContain("ครูสอนซ้ำซ้อน"); // Thai: Teacher conflict
  });

  test("should detect room double-booking conflict", async () => {
    await schedulePage.selectTeacher("TCH001");
    await schedulePage.dragSubjectToTimeslot("TH101", "MON", 1);

    await schedulePage.selectTeacher("TCH002");
    await schedulePage.dragSubjectToTimeslot("MA201", "MON", 1); // Same room

    const conflict = await schedulePage.getConflictMessage();
    expect(conflict).toContain("ห้องเรียนซ้ำซ้อน"); // Thai: Room conflict
  });

  test("should lock timeslot for school-wide activity", async () => {
    await schedulePage.lockTimeslot("MON", 1);

    await schedulePage.selectTeacher("TCH001");
    await schedulePage.dragSubjectToTimeslot("TH101", "MON", 1);

    const conflict = await schedulePage.getConflictMessage();
    expect(conflict).toContain("ช่วงเวลาถูกล็อก"); // Thai: Locked timeslot
  });

  test("should export schedule to Excel", async () => {
    const [download] = await Promise.all([
      schedulePage.page.waitForEvent("download"),
      schedulePage.exportSchedule("excel"),
    ]);

    expect(download.suggestedFilename()).toMatch(/.*\.xlsx$/);
  });

  test("should export schedule to PDF", async () => {
    const [download] = await Promise.all([
      schedulePage.page.waitForEvent("download"),
      schedulePage.exportSchedule("pdf"),
    ]);

    expect(download.suggestedFilename()).toMatch(/.*\.pdf$/);
  });
});
```

**data-management.spec.ts**

```typescript
import { test, expect } from "@playwright/test";
import { TeacherManagementPage } from "../pages/admin/TeacherManagementPage";
import { SubjectManagementPage } from "../pages/admin/SubjectManagementPage";
import { ClassroomManagementPage } from "../pages/admin/ClassroomManagementPage";

test.describe("Admin: CRUD Operations", () => {
  test.describe("Teacher Management", () => {
    let teacherPage: TeacherManagementPage;

    test.beforeEach(async ({ page }) => {
      teacherPage = new TeacherManagementPage(page);
      await teacherPage.goto();
    });

    test("should create new teacher", async () => {
      const initialCount = await teacherPage.getTeacherCount();

      await teacherPage.createTeacher({
        name: "ทดสอบ ครูใหม่",
        code: "TCH999",
        email: "test@example.com",
      });

      const newCount = await teacherPage.getTeacherCount();
      expect(newCount).toBe(initialCount + 1);
    });

    test("should update teacher information", async () => {
      await teacherPage.updateTeacher("TCH001", {
        name: "ชื่อใหม่ นามสกุลใหม่",
      });

      await teacherPage.searchTeacher("ชื่อใหม่");
      const count = await teacherPage.getTeacherCount();
      expect(count).toBeGreaterThan(0);
    });

    test("should delete teacher", async () => {
      const initialCount = await teacherPage.getTeacherCount();

      await teacherPage.deleteTeacher("TCH999");

      const newCount = await teacherPage.getTeacherCount();
      expect(newCount).toBe(initialCount - 1);
    });

    test("should search teachers by name", async () => {
      await teacherPage.searchTeacher("สมชาย");
      const count = await teacherPage.getTeacherCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  // Similar tests for Subject, Classroom, Grade Level management
});
```

#### 1.3 Custom Fixtures

Create admin-specific fixtures:

**admin.fixture.ts**

```typescript
import { test as base } from "@playwright/test";
import { ScheduleAssignmentPage } from "../pages/admin/ScheduleAssignmentPage";
import { TeacherManagementPage } from "../pages/admin/TeacherManagementPage";

type AdminFixtures = {
  schedulePage: ScheduleAssignmentPage;
  teacherPage: TeacherManagementPage;
  authenticatedAdmin: void;
};

export const test = base.extend<AdminFixtures>({
  authenticatedAdmin: [
    async ({ page }, use) => {
      // Login as admin before each test
      await page.goto("/");
      await page.locator('[data-testid="admin-login"]').click();
      await page.waitForURL("**/dashboard");
      await use();
    },
    { auto: true },
  ],

  schedulePage: async ({ page }, use) => {
    await use(new ScheduleAssignmentPage(page));
  },

  teacherPage: async ({ page }, use) => {
    await use(new TeacherManagementPage(page));
  },
});

export { expect } from "@playwright/test";
```

---

### Phase 2: Teacher Role Tests (1 week) - Priority 2

#### 2.1 Page Object Models

**TeacherSchedulePage.ts**

```typescript
export class TeacherSchedulePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/schedule/teacher");
  }

  async selectSemester(semester: string) {
    await this.page
      .locator('[data-testid="semester-selector"]')
      .selectOption(semester);
  }

  async filterByWeek(weekNumber: number) {
    await this.page
      .locator('[data-testid="week-filter"]')
      .selectOption(String(weekNumber));
  }

  async getScheduledClasses(): Promise<number> {
    return await this.page.locator('[data-testid="schedule-item"]').count();
  }

  async exportSchedule(format: "excel" | "pdf") {
    await this.page.locator('[data-testid="export-button"]').click();
    await this.page.locator(`text=${format.toUpperCase()}`).click();
  }

  async viewClassroomAssignment(classId: string): Promise<string> {
    const classItem = this.page.locator(`[data-class-id="${classId}"]`);
    return (
      (await classItem.locator('[data-testid="room-name"]').textContent()) || ""
    );
  }
}
```

#### 2.2 Test Specifications

**schedule-viewing.spec.ts**

```typescript
import { test, expect } from "../fixtures/teacher.fixture";

test.describe("Teacher: Schedule Viewing", () => {
  test("should view personal teaching schedule", async ({
    teacherSchedulePage,
  }) => {
    await teacherSchedulePage.goto();
    await teacherSchedulePage.selectSemester("1-2567");

    const classCount = await teacherSchedulePage.getScheduledClasses();
    expect(classCount).toBeGreaterThan(0);
  });

  test("should filter schedule by week", async ({ teacherSchedulePage }) => {
    await teacherSchedulePage.goto();
    await teacherSchedulePage.selectSemester("1-2567");
    await teacherSchedulePage.filterByWeek(2);

    const classCount = await teacherSchedulePage.getScheduledClasses();
    expect(classCount).toBeGreaterThan(0);
  });

  test("should export personal schedule to Excel", async ({
    teacherSchedulePage,
    page,
  }) => {
    await teacherSchedulePage.goto();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      teacherSchedulePage.exportSchedule("excel"),
    ]);

    expect(download.suggestedFilename()).toMatch(/.*\.xlsx$/);
  });

  test("should view classroom assignments", async ({ teacherSchedulePage }) => {
    await teacherSchedulePage.goto();
    await teacherSchedulePage.selectSemester("1-2567");

    const roomName =
      await teacherSchedulePage.viewClassroomAssignment("CLS001");
    expect(roomName).toBeTruthy();
  });
});

test.describe("Teacher: Student Schedule Viewing", () => {
  test("should browse student schedules by grade", async ({
    studentScheduleViewPage,
  }) => {
    await studentScheduleViewPage.goto();
    await studentScheduleViewPage.selectGrade("ม.1");

    const classList = await studentScheduleViewPage.getClassList();
    expect(classList.length).toBeGreaterThan(0);
  });

  test("should view specific class timetable", async ({
    studentScheduleViewPage,
  }) => {
    await studentScheduleViewPage.goto();
    await studentScheduleViewPage.viewClassSchedule("ม.1/1");

    const subjectCount = await studentScheduleViewPage.getSubjectCount();
    expect(subjectCount).toBeGreaterThan(0);
  });

  test("should export student schedule", async ({
    studentScheduleViewPage,
    page,
  }) => {
    await studentScheduleViewPage.goto();
    await studentScheduleViewPage.viewClassSchedule("ม.1/1");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      studentScheduleViewPage.exportSchedule("pdf"),
    ]);

    expect(download.suggestedFilename()).toMatch(/.*\.pdf$/);
  });
});
```

---

### Phase 3: Student Role Tests (1 week) - Priority 3

#### 3.1 Page Object Models

**ClassSchedulePage.ts**

```typescript
export class ClassSchedulePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/schedule/student");
  }

  async selectSemester(semester: string) {
    await this.page
      .locator('[data-testid="semester-selector"]')
      .selectOption(semester);
  }

  async navigateToWeek(direction: "next" | "prev") {
    await this.page.locator(`[data-testid="week-${direction}"]`).click();
  }

  async getCurrentWeek(): Promise<number> {
    const weekText = await this.page
      .locator('[data-testid="current-week"]')
      .textContent();
    return parseInt(weekText?.match(/\d+/)?.[0] || "0");
  }

  async getScheduleItems(): Promise<number> {
    return await this.page.locator('[data-testid="schedule-item"]').count();
  }

  async isMobileResponsive(): Promise<boolean> {
    // Check if mobile navigation is visible at mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    const mobileNav = this.page.locator('[data-testid="mobile-nav"]');
    return await mobileNav.isVisible();
  }
}
```

#### 3.2 Test Specifications

**schedule-viewing.spec.ts**

```typescript
import { test, expect } from "../fixtures/student.fixture";

test.describe("Student: Class Schedule Viewing", () => {
  test("should login and view class timetable", async ({
    classSchedulePage,
  }) => {
    await classSchedulePage.goto();
    await classSchedulePage.selectSemester("1-2567");

    const itemCount = await classSchedulePage.getScheduleItems();
    expect(itemCount).toBeGreaterThan(0);
  });

  test("should navigate between weeks", async ({ classSchedulePage }) => {
    await classSchedulePage.goto();

    const initialWeek = await classSchedulePage.getCurrentWeek();
    await classSchedulePage.navigateToWeek("next");
    const nextWeek = await classSchedulePage.getCurrentWeek();

    expect(nextWeek).toBe(initialWeek + 1);
  });

  test("should display mobile-responsive view", async ({
    classSchedulePage,
  }) => {
    await classSchedulePage.goto();

    const isMobile = await classSchedulePage.isMobileResponsive();
    expect(isMobile).toBe(true);
  });
});
```

---

### Phase 4: Error Scenarios (3 days) - Priority 1

#### 4.1 Test Specifications

**conflict-scenarios.spec.ts**

```typescript
import { test, expect } from "@playwright/test";
import { ScheduleAssignmentPage } from "../pages/admin/ScheduleAssignmentPage";

test.describe("Error Scenarios: Conflict Detection", () => {
  test("should prevent double-booking teacher", async ({ page }) => {
    const schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto("1-2567");

    await schedulePage.selectTeacher("TCH001");
    await schedulePage.dragSubjectToTimeslot("TH101", "MON", 1);
    await schedulePage.dragSubjectToTimeslot("TH102", "MON", 1);

    const conflict = await schedulePage.getConflictMessage();
    expect(conflict).toContain("ครูสอนซ้ำซ้อน");
  });

  test("should prevent double-booking room", async ({ page }) => {
    const schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto("1-2567");

    await schedulePage.selectTeacher("TCH001");
    await schedulePage.dragSubjectToTimeslot("TH101", "MON", 1);

    await schedulePage.selectTeacher("TCH002");
    await schedulePage.dragSubjectToTimeslot("MA201", "MON", 1); // Same room

    const conflict = await schedulePage.getConflictMessage();
    expect(conflict).toContain("ห้องเรียนซ้ำซ้อน");
  });

  test("should prevent assignment to locked timeslot", async ({ page }) => {
    const schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto("1-2567");

    await schedulePage.lockTimeslot("MON", 1);
    await schedulePage.selectTeacher("TCH001");
    await schedulePage.dragSubjectToTimeslot("TH101", "MON", 1);

    const conflict = await schedulePage.getConflictMessage();
    expect(conflict).toContain("ช่วงเวลาถูกล็อก");
  });

  test("should prevent assignment during break time", async ({ page }) => {
    const schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto("1-2567");

    await schedulePage.selectTeacher("TCH001");
    await schedulePage.dragSubjectToTimeslot("TH101", "MON", 4); // Break period

    const conflict = await schedulePage.getConflictMessage();
    expect(conflict).toContain("พักเที่ยง"); // Thai: Lunch break
  });
});

test.describe("Error Scenarios: Network & Session", () => {
  test("should handle network error gracefully", async ({ page, context }) => {
    // Intercept and fail API requests
    await context.route("**/api/**", (route) => route.abort("failed"));

    const schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto("1-2567");

    // Expect error message to be displayed
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toContainText("เกิดข้อผิดพลาด"); // Thai: Error occurred
  });

  test("should handle session timeout", async ({ page, context }) => {
    const schedulePage = new ScheduleAssignmentPage(page);
    await schedulePage.goto("1-2567");

    // Clear session cookies
    await context.clearCookies();

    // Try to perform action
    await schedulePage.selectTeacher("TCH001");

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});
```

---

## 🔧 Configuration Updates

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: "./e2e",

  // Enable parallelization with sharding for faster runs
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined, // Use 4 workers in CI

  // Test matching patterns
  testMatch: [
    "**/tests/**/*.spec.ts",
    "**/*.spec.ts", // Keep existing tests
  ],

  // Retries for flaky tests
  retries: process.env.CI ? 2 : 0,

  // Timeouts
  timeout: 60 * 1000, // 60 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Custom action timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // Desktop Chrome
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // Mobile Chrome (for student responsive tests)
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: "**/student/**/*.spec.ts",
    },

    // Tablet (optional)
    {
      name: "tablet",
      use: { ...devices["iPad Pro"] },
      testIgnore: "**/mobile/**",
    },
  ],

  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
    // Add JUnit reporter for CI integration
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

## 📊 Test Data Management

### Fixtures Strategy

Use seeded data consistently across tests:

**seed-data.fixture.ts**

```typescript
import { test as base } from "@playwright/test";

type SeedDataFixtures = {
  testSemester: string;
  testTeacher: { id: string; name: string; code: string };
  testSubject: { code: string; name: string };
  testClassroom: { id: string; name: string };
};

export const test = base.extend<SeedDataFixtures>({
  testSemester: async ({}, use) => {
    await use("1-2567"); // From seed.ts
  },

  testTeacher: async ({}, use) => {
    await use({
      id: "TCH001",
      name: "สมชาย ใจดี",
      code: "TCH001",
    });
  },

  testSubject: async ({}, use) => {
    await use({
      code: "TH101",
      name: "ภาษาไทย 1",
    });
  },

  testClassroom: async ({}, use) => {
    await use({
      id: "ROOM101",
      name: "ห้อง 101",
    });
  },
});
```

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4] # Parallel sharding
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm playwright install --with-deps chromium

      - name: Setup test database
        run: |
          pnpm db:deploy
          pnpm db:seed

      - name: Run E2E tests (Shard ${{ matrix.shard }}/4)
        run: pnpm test:e2e --shard=${{ matrix.shard }}/4

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results-${{ matrix.shard }}
          path: test-results/

  merge-reports:
    needs: e2e-tests
    runs-on: ubuntu-latest
    steps:
      - name: Download all reports
        uses: actions/download-artifact@v3

      - name: Merge HTML reports
        run: npx playwright merge-reports --reporter html ./playwright-report-*

      - name: Publish HTML report
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📈 Success Metrics

### Coverage Tracking

```typescript
// scripts/calculate-coverage.ts
import { readFileSync } from "fs";

interface TestResults {
  totalTests: number;
  passedTests: number;
  coverage: {
    admin: number;
    teacher: number;
    student: number;
    errors: number;
  };
}

function calculateCoverage(): TestResults {
  const results = JSON.parse(
    readFileSync("test-results/results.json", "utf-8"),
  );

  // Count tests by category
  const adminTests = results.suites.filter((s) =>
    s.file.includes("admin"),
  ).length;
  const teacherTests = results.suites.filter((s) =>
    s.file.includes("teacher"),
  ).length;
  const studentTests = results.suites.filter((s) =>
    s.file.includes("student"),
  ).length;
  const errorTests = results.suites.filter((s) =>
    s.file.includes("errors"),
  ).length;

  return {
    totalTests: results.stats.expected,
    passedTests: results.stats.ok,
    coverage: {
      admin: (adminTests / 20) * 100, // 20 critical admin paths
      teacher: (teacherTests / 8) * 100, // 8 critical teacher paths
      student: (studentTests / 5) * 100, // 5 critical student paths
      errors: (errorTests / 6) * 100, // 6 critical error scenarios
    },
  };
}

const results = calculateCoverage();
console.log(
  `Total Coverage: ${(results.passedTests / results.totalTests) * 100}%`,
);
console.log(`Admin Coverage: ${results.coverage.admin}%`);
console.log(`Teacher Coverage: ${results.coverage.teacher}%`);
console.log(`Student Coverage: ${results.coverage.student}%`);
console.log(`Error Coverage: ${results.coverage.errors}%`);
```

### README Badge

```markdown
[![E2E Tests](https://github.com/yukimura-ixa/school-timetable-senior-project/actions/workflows/e2e.yml/badge.svg)](https://github.com/yukimura-ixa/school-timetable-senior-project/actions/workflows/e2e.yml)
[![E2E Coverage](https://img.shields.io/badge/E2E%20Coverage-85%25-brightgreen)](./e2e/TEST_RESULTS_SUMMARY.md)
```

---

## ✅ Acceptance Criteria Checklist

- [ ] **Phase 1 Complete**: All 20 admin critical paths tested
- [ ] **Phase 2 Complete**: All 8 teacher critical paths tested
- [ ] **Phase 3 Complete**: All 5 student critical paths tested
- [ ] **Phase 4 Complete**: All 6 error scenarios tested
- [ ] **80%+ Coverage**: Minimum 33/39 critical paths passing (85%)
- [ ] **CI Integration**: Tests run on every PR automatically
- [ ] **Performance**: Complete test suite runs in < 10 minutes
- [ ] **Stability**: < 5% flakiness rate over 50 runs
- [ ] **Documentation**: All page objects documented with TSDoc
- [ ] **HTML Report**: Generated and archived on every run
- [ ] **Coverage Badge**: Added to README with accurate percentage

---

## 📚 References

- **Playwright Docs**: https://playwright.dev/docs/intro
- **Page Object Model**: https://playwright.dev/docs/pom
- **Test Fixtures**: https://playwright.dev/docs/test-fixtures
- **Parallelization**: https://playwright.dev/docs/test-parallel
- **CI Integration**: https://playwright.dev/docs/ci-intro
- **AGENTS.md**: Section 8 (Testing Strategy)
- **Issue #36**: https://github.com/yukimura-ixa/school-timetable-senior-project/issues/36

---

## 🎯 Next Steps

1. **Week 1-2**: Implement Phase 1 (Admin tests + POMs)
2. **Week 3**: Implement Phase 2 (Teacher tests + POMs)
3. **Week 4**: Implement Phase 3 (Student tests + POMs)
4. **Week 5 (Days 1-3)**: Implement Phase 4 (Error scenarios)
5. **Week 5 (Days 4-5)**: CI/CD integration, coverage reporting, documentation

**Start Command**:

```bash
# Create directory structure
mkdir -p e2e/{pages/{admin,teacher,student,common},fixtures,tests/{admin,teacher,student,errors}}

# Install additional dependencies (if needed)
pnpm add -D @playwright/test@latest

# Run tests
pnpm test:e2e
```

**Blockers**:

- Ensure dev server is stable
- Seed data must be consistent
- Auth flow must work reliably

**Success Definition**:

- 85%+ critical path coverage
- All tests passing in CI
- < 10 minute full suite execution
- HTML report published and accessible

