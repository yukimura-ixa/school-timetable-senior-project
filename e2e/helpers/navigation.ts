import { Page } from "@playwright/test";

/**
 * Navigation helpers for E2E tests
 *
 * URL format: /schedule/{academicYear}/{semester}/...
 * Example: /schedule/2567/1/arrange
 */

export class NavigationHelper {
  constructor(private page: Page) {}

  private async gotoAndReady(path: string) {
    await this.page.goto(path, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    // Light readiness check; avoid networkidle which stalls on streaming/WS
    await this.page
      .waitForSelector("main,[role='main'],table", { timeout: 20_000 })
      .catch(() => {});
  }

  /**
   * Navigate to home page
   */
  async goHome() {
    await this.gotoAndReady("/");
  }

  /**
   * Navigate to management section
   */
  async goToManagement() {
    await this.gotoAndReady("/management/teacher");
  }

  async goToTeacherManagement() {
    await this.gotoAndReady("/management/teacher");
  }

  async goToSubjectManagement() {
    await this.gotoAndReady("/management/subject");
  }

  async goToRoomManagement() {
    await this.gotoAndReady("/management/rooms");
  }

  async goToGradeLevelManagement() {
    await this.gotoAndReady("/management/gradelevel");
  }

  async goToProgramManagement() {
    await this.gotoAndReady("/management/program");
  }

  /**
   * Navigate to schedule section
   * Note: Redirects to dashboard (semester selection page)
   */
  async goToScheduleSelector() {
    await this.gotoAndReady("/dashboard");
  }

  async goToSchedule(academicYear: number | string, semester: number | string) {
    await this.gotoAndReady(`/schedule/${academicYear}/${semester}`);
  }

  async goToConfig(academicYear: number | string, semester: number | string) {
    await this.gotoAndReady(`/schedule/${academicYear}/${semester}/config`);
  }

  async goToAssign(academicYear: number | string, semester: number | string) {
    await this.gotoAndReady(`/schedule/${academicYear}/${semester}/assign`);
  }

  async goToTeacherArrange(
    academicYear: number | string,
    semester: number | string,
    teacherId = "1",
  ) {
    await this.gotoAndReady(
      `/schedule/${academicYear}/${semester}/arrange?TeacherID=${teacherId}`,
    );
  }

  async goToLockTimeslots(
    academicYear: number | string,
    semester: number | string,
  ) {
    await this.gotoAndReady(`/schedule/${academicYear}/${semester}/lock`);
  }

  /**
   * Navigate to dashboard
   */
  async goToDashboardSelector() {
    await this.gotoAndReady("/dashboard");
  }

  async goToTeacherTable(
    academicYear: number | string,
    semester: number | string,
  ) {
    await this.gotoAndReady(
      `/dashboard/${academicYear}/${semester}/teacher-table`,
    );
  }

  async goToStudentTable(
    academicYear: number | string,
    semester: number | string,
  ) {
    await this.gotoAndReady(
      `/dashboard/${academicYear}/${semester}/student-table`,
    );
  }

  async goToAllPrograms(
    academicYear: number | string,
    semester: number | string,
  ) {
    await this.gotoAndReady(
      `/dashboard/${academicYear}/${semester}/all-program`,
    );
  }

  async goToAllTimeslots(
    academicYear: number | string,
    semester: number | string,
  ) {
    await this.gotoAndReady(
      `/dashboard/${academicYear}/${semester}/all-timeslot`,
    );
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
