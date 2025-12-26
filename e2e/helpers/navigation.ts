import { Page } from "@playwright/test";
import { waitForAppReady } from "./wait-for-app-ready";

/**
 * Navigation helpers for E2E tests
 *
 * URL format: /schedule/{academicYear}/{semester}/...
 * Example: /schedule/2567/1/arrange
 */

export class NavigationHelper {
  constructor(private page: Page) {}

  private normalizeTerm(
    academicYearOrTerm: number | string,
    semester?: number | string,
  ): { academicYear: string; semester: string } {
    if (semester !== undefined) {
      return {
        academicYear: String(academicYearOrTerm),
        semester: String(semester),
      };
    }

    const term = String(academicYearOrTerm);
    if (term.includes("/")) {
      const [year, sem] = term.split("/");
      return { academicYear: year, semester: sem };
    }
    if (term.includes("-")) {
      const [sem, year] = term.split("-");
      return { academicYear: year, semester: sem };
    }

    throw new Error(`[NavigationHelper] Invalid term format: ${term}`);
  }

  private async gotoAndReady(path: string) {
    await this.page.goto(path, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    // Light readiness check; avoid networkidle which stalls on streaming/WS
    await waitForAppReady(this.page);
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
    const term = this.normalizeTerm(academicYear, semester);
    await this.gotoAndReady(`/schedule/${term.academicYear}/${term.semester}`);
  }

  async goToConfig(academicYear: number | string, semester?: number | string) {
    const term = this.normalizeTerm(academicYear, semester);
    await this.gotoAndReady(
      `/schedule/${term.academicYear}/${term.semester}/config`,
    );
  }

  async goToAssign(academicYear: number | string, semester?: number | string) {
    const term = this.normalizeTerm(academicYear, semester);
    await this.gotoAndReady(
      `/schedule/${term.academicYear}/${term.semester}/assign`,
    );
  }

  async goToTeacherArrange(
    academicYearOrTerm: number | string,
    semesterOrTeacherId?: number | string,
    teacherId = "1",
  ) {
    if (typeof academicYearOrTerm === "string") {
      const hasDelimiter =
        academicYearOrTerm.includes("/") || academicYearOrTerm.includes("-");
      if (hasDelimiter) {
        const term = this.normalizeTerm(academicYearOrTerm);
        const resolvedTeacherId =
          semesterOrTeacherId !== undefined
            ? String(semesterOrTeacherId)
            : teacherId;
        await this.gotoAndReady(
          `/schedule/${term.academicYear}/${term.semester}/arrange?TeacherID=${resolvedTeacherId}`,
        );
        return;
      }
    }

    const term = this.normalizeTerm(academicYearOrTerm, semesterOrTeacherId);
    await this.gotoAndReady(
      `/schedule/${term.academicYear}/${term.semester}/arrange?TeacherID=${teacherId}`,
    );
  }

  async goToLockTimeslots(
    academicYear: number | string,
    semester?: number | string,
  ) {
    const term = this.normalizeTerm(academicYear, semester);
    await this.gotoAndReady(
      `/schedule/${term.academicYear}/${term.semester}/lock`,
    );
  }

  /**
   * Navigate to dashboard
   */
  async goToDashboardSelector() {
    await this.gotoAndReady("/dashboard");
  }

  async goToTeacherTable(
    academicYear: number | string,
    semester?: number | string,
  ) {
    const term = this.normalizeTerm(academicYear, semester);
    await this.gotoAndReady(
      `/dashboard/${term.academicYear}/${term.semester}/teacher-table`,
    );
  }

  async goToStudentTable(
    academicYear: number | string,
    semester?: number | string,
  ) {
    const term = this.normalizeTerm(academicYear, semester);
    await this.gotoAndReady(
      `/dashboard/${term.academicYear}/${term.semester}/student-table`,
    );
  }

  async goToAllPrograms(
    academicYear: number | string,
    semester?: number | string,
  ) {
    const term = this.normalizeTerm(academicYear, semester);
    await this.gotoAndReady(
      `/dashboard/${term.academicYear}/${term.semester}/all-program`,
    );
  }

  async goToAllTimeslots(
    academicYear: number | string,
    semester?: number | string,
  ) {
    const term = this.normalizeTerm(academicYear, semester);
    await this.gotoAndReady(
      `/dashboard/${term.academicYear}/${term.semester}/all-timeslot`,
    );
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
