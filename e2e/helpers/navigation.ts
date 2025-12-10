import { Page } from "@playwright/test";

/**
 * Navigation helpers for E2E tests
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

  async goToSchedule(semesterAndYear: string) {
    await this.gotoAndReady(`/schedule/${semesterAndYear}`);
  }

  async goToConfig(semesterAndYear: string) {
    await this.gotoAndReady(`/schedule/${semesterAndYear}/config`);
  }

  async goToAssign(semesterAndYear: string) {
    await this.gotoAndReady(`/schedule/${semesterAndYear}/assign`);
  }

  async goToTeacherArrange(semesterAndYear: string, teacherId = "1") {
    await this.gotoAndReady(
      `/schedule/${semesterAndYear}/arrange/teacher-arrange?TeacherID=${teacherId}`,
    );
  }

  async goToStudentArrange(semesterAndYear: string) {
    await this.gotoAndReady(
      `/schedule/${semesterAndYear}/arrange/student-arrange`,
    );
  }

  async goToLockTimeslots(semesterAndYear: string) {
    await this.gotoAndReady(`/schedule/${semesterAndYear}/lock`);
  }

  /**
   * Navigate to dashboard
   */
  async goToDashboardSelector() {
    await this.gotoAndReady("/dashboard");
  }

  async goToTeacherTable(semesterAndYear: string) {
    await this.gotoAndReady(`/dashboard/${semesterAndYear}/teacher-table`);
  }

  async goToStudentTable(semesterAndYear: string) {
    await this.gotoAndReady(`/dashboard/${semesterAndYear}/student-table`);
  }

  async goToAllPrograms(semesterAndYear: string) {
    await this.gotoAndReady(`/dashboard/${semesterAndYear}/all-program`);
  }

  async goToAllTimeslots(semesterAndYear: string) {
    await this.gotoAndReady(`/dashboard/${semesterAndYear}/all-timeslot`);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
