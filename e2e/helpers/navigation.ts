import { Page } from '@playwright/test';

/**
 * Navigation helpers for E2E tests
 */

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to home page
   */
  async goHome() {
    await this.page.goto('/');
  }

  /**
   * Navigate to management section
   */
  async goToManagement() {
    await this.page.goto('/management/teacher');
  }

  async goToTeacherManagement() {
    await this.page.goto('/management/teacher');
  }

  async goToSubjectManagement() {
    await this.page.goto('/management/subject');
  }

  async goToRoomManagement() {
    await this.page.goto('/management/rooms');
  }

  async goToGradeLevelManagement() {
    await this.page.goto('/management/gradelevel');
  }

  async goToProgramManagement() {
    await this.page.goto('/management/program');
  }

  /**
   * Navigate to schedule section
   */
  async goToScheduleSelector() {
    await this.page.goto('/schedule/select-semester');
  }

  async goToSchedule(semesterAndYear: string) {
    await this.page.goto(`/schedule/${semesterAndYear}`);
  }

  async goToConfig(semesterAndYear: string) {
    await this.page.goto(`/schedule/${semesterAndYear}/config`);
  }

  async goToAssign(semesterAndYear: string) {
    await this.page.goto(`/schedule/${semesterAndYear}/assign`);
  }

  async goToTeacherArrange(semesterAndYear: string) {
    await this.page.goto(`/schedule/${semesterAndYear}/arrange/teacher-arrange`);
  }

  async goToStudentArrange(semesterAndYear: string) {
    await this.page.goto(`/schedule/${semesterAndYear}/arrange/student-arrange`);
  }

  async goToLockTimeslots(semesterAndYear: string) {
    await this.page.goto(`/schedule/${semesterAndYear}/lock`);
  }

  /**
   * Navigate to dashboard
   */
  async goToDashboardSelector() {
    await this.page.goto('/dashboard/select-semester');
  }

  async goToTeacherTable(semesterAndYear: string) {
    await this.page.goto(`/dashboard/${semesterAndYear}/teacher-table`);
  }

  async goToStudentTable(semesterAndYear: string) {
    await this.page.goto(`/dashboard/${semesterAndYear}/student-table`);
  }

  async goToAllPrograms(semesterAndYear: string) {
    await this.page.goto(`/dashboard/${semesterAndYear}/all-program`);
  }

  async goToAllTimeslots(semesterAndYear: string) {
    await this.page.goto(`/dashboard/${semesterAndYear}/all-timeslot`);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }
}
