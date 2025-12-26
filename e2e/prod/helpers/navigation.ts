import type { Page } from "@playwright/test";
import { getSemesterRouteParts } from "./env";

async function gotoAndReady(page: Page, pathname: string) {
  await page.goto(pathname, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // Avoid networkidle: Next.js streaming + WS can keep the network busy.
  await page
    .locator("main,[role='main'],table,[data-testid='timeslot-grid']")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {});

  // Let late layout settle a touch (MUI hydration, fonts, client transitions).
  await page.waitForTimeout(250);
}

export async function goToDashboardAllTimeslots(page: Page) {
  const term = getSemesterRouteParts();
  await gotoAndReady(
    page,
    `/dashboard/${term.academicYear}/${term.semester}/all-timeslot`,
  );
}

export async function goToTeachers(page: Page) {
  await gotoAndReady(page, "/management/teacher");
}

export async function goToSubjects(page: Page) {
  await gotoAndReady(page, "/management/subject");
}

export async function goToRooms(page: Page) {
  await gotoAndReady(page, "/management/rooms");
}

export async function goToGradeLevels(page: Page) {
  await gotoAndReady(page, "/management/gradelevel");
}

export async function goToPrograms(page: Page) {
  await gotoAndReady(page, "/management/program");
}

export async function goToScheduleConfig(page: Page) {
  const term = getSemesterRouteParts();
  await gotoAndReady(
    page,
    `/schedule/${term.academicYear}/${term.semester}/config`,
  );
}

export async function goToScheduleAssign(page: Page) {
  const term = getSemesterRouteParts();
  await gotoAndReady(
    page,
    `/schedule/${term.academicYear}/${term.semester}/assign`,
  );
}

export async function goToTeacherArrange(page: Page) {
  const term = getSemesterRouteParts();
  await gotoAndReady(
    page,
    `/schedule/${term.academicYear}/${term.semester}/arrange`,
  );
}

export async function goToLockOverview(page: Page) {
  const term = getSemesterRouteParts();
  await gotoAndReady(
    page,
    `/schedule/${term.academicYear}/${term.semester}/lock`,
  );
}

export async function goToConflictDetector(page: Page) {
  const term = getSemesterRouteParts();
  await gotoAndReady(
    page,
    `/dashboard/${term.academicYear}/${term.semester}/conflicts`,
  );
}

export async function goToExportEntry(page: Page) {
  const term = getSemesterRouteParts();
  await gotoAndReady(
    page,
    `/dashboard/${term.academicYear}/${term.semester}/all-program`,
  );
}


