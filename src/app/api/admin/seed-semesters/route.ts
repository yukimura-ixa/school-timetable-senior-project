import { NextResponse } from "next/server";
import { semesterRepository } from "@/features/semester/infrastructure/repositories/semester.repository";
import prisma from "@/lib/prisma";
import { day_of_week, semester, breaktime } from "@/prisma/generated/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Issue #158: Extract magic numbers to named constants
// Thai school timetable standard configuration
const TIMETABLE_CONFIG = {
  /** Number of periods per day (MOE standard: 8 periods) */
  PERIODS_PER_DAY: 8,
  /** Period duration in minutes */
  PERIOD_DURATION_MINUTES: 50,
  /** School start time (24-hour format) */
  START_TIME: "08:30",
  /** Lunch break duration in minutes */
  LUNCH_BREAK_DURATION: 60,
  /** Period number after which lunch break occurs for junior high (M.1-3) */
  JUNIOR_LUNCH_AFTER_PERIOD: 4,
  /** Period number after which lunch break occurs for senior high (M.4-6) */
  SENIOR_LUNCH_AFTER_PERIOD: 5,
  /** School days (Monday to Friday) */
  SCHOOL_DAYS: ["MON", "TUE", "WED", "THU", "FRI"] as day_of_week[],
  /** Valid academic year range */
  MIN_ACADEMIC_YEAR: 2000,
  MAX_ACADEMIC_YEAR: 3000,
} as const;

/** Standard 8-period school day schedule */
const STANDARD_PERIODS = [
  { start: "08:30", end: "09:20", break: "NOT_BREAK" },
  { start: "09:20", end: "10:10", break: "NOT_BREAK" },
  { start: "10:10", end: "11:00", break: "NOT_BREAK" },
  { start: "11:00", end: "11:50", break: "NOT_BREAK" },
  { start: "12:50", end: "13:40", break: "BREAK_JUNIOR" }, // Lunch break before
  { start: "13:40", end: "14:30", break: "BREAK_SENIOR" },
  { start: "14:30", end: "15:20", break: "NOT_BREAK" },
  { start: "15:20", end: "16:10", break: "NOT_BREAK" },
] as const;

function parseYearsParam(param?: string): number[] {
  if (!param) return [];
  return param
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter(
      (n) =>
        Number.isInteger(n) &&
        n > TIMETABLE_CONFIG.MIN_ACADEMIC_YEAR &&
        n < TIMETABLE_CONFIG.MAX_ACADEMIC_YEAR,
    );
}

/**
 * Create baseline timeslots for a term
 * Idempotent - skips if timeslots already exist
 */
async function seedTimeslots(
  academicYear: number,
  sem: semester,
): Promise<number> {
  const existing = await prisma.timeslot.count({
    where: { AcademicYear: academicYear, Semester: sem },
  });

  if (existing > 0) {
    return existing; // Already seeded
  }

  const semesterNum = sem === "SEMESTER_1" ? 1 : 2;

  const timeslots = [];
  for (const day of TIMETABLE_CONFIG.SCHOOL_DAYS) {
    for (let periodNum = 1; periodNum <= STANDARD_PERIODS.length; periodNum++) {
      const period = STANDARD_PERIODS[periodNum - 1];
      if (!period) continue;
      timeslots.push({
        TimeslotID: `${semesterNum}-${academicYear}-${day}${periodNum}`,
        AcademicYear: academicYear,
        Semester: sem,
        StartTime: new Date(`2024-01-01T${period.start}:00`),
        EndTime: new Date(`2024-01-01T${period.end}:00`),
        Breaktime: period.break as breaktime,
        DayOfWeek: day,
      });
    }
  }

  await prisma.timeslot.createMany({ data: timeslots, skipDuplicates: true });
  return timeslots.length;
}

/**
 * Create baseline table_config for a term
 * Idempotent - updates config if already exists
 */
async function seedTableConfig(
  academicYear: number,
  sem: semester,
): Promise<void> {
  const semesterNum = sem === "SEMESTER_1" ? 1 : 2;
  const configId = `${semesterNum}-${academicYear}`;

  const config = {
    periodsPerDay: TIMETABLE_CONFIG.PERIODS_PER_DAY,
    startTime: TIMETABLE_CONFIG.START_TIME,
    periodDuration: TIMETABLE_CONFIG.PERIOD_DURATION_MINUTES,
    schoolDays: TIMETABLE_CONFIG.SCHOOL_DAYS,
    lunchBreak: {
      after: TIMETABLE_CONFIG.JUNIOR_LUNCH_AFTER_PERIOD,
      duration: TIMETABLE_CONFIG.LUNCH_BREAK_DURATION,
    },
    breakTimes: {
      junior: { after: TIMETABLE_CONFIG.JUNIOR_LUNCH_AFTER_PERIOD },
      senior: { after: TIMETABLE_CONFIG.SENIOR_LUNCH_AFTER_PERIOD },
    },
  };

  await prisma.table_config.upsert({
    where: { ConfigID: configId },
    update: { Config: config },
    create: {
      ConfigID: configId,
      AcademicYear: academicYear,
      Semester: sem,
      Config: config,
      status: "DRAFT",
      configCompleteness: 0,
      isPinned: false,
    },
  });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret") || undefined;
    const yearsParam = url.searchParams.get("years") || undefined; // e.g., 2567,2568
    const seedData = url.searchParams.get("seedData") === "true"; // If true, also create timeslots + config

    // AuthZ: require secret token
    const expected = process.env.SEED_SECRET;
    if (!expected || !secret || secret !== expected) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Issue #153: Additional admin session verification in production
    // In production, require both secret AND admin session for extra security
    if (process.env.NODE_ENV === "production") {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user || session.user.role !== "admin") {
        return NextResponse.json(
          { ok: false, error: "Admin session required" },
          { status: 403 },
        );
      }
    }

    const years = parseYearsParam(yearsParam);
    const targetYears = years.length > 0 ? years : [2567, 2568];

    const results: Array<{
      year: number;
      semester: 1 | 2;
      created: boolean;
      configId: string;
      timeslots?: number;
      tableConfig?: boolean;
    }> = [];

    for (const year of targetYears) {
      for (const sem of [1, 2] as const) {
        const semEnum = sem === 1 ? "SEMESTER_1" : "SEMESTER_2";

        // Ensure semester record exists
        const existing = await semesterRepository.findByYearAndSemester(
          year,
          sem,
        );
        let configId: string;
        let created: boolean;

        if (existing) {
          configId = existing.ConfigID;
          created = false;
        } else {
          const newSemester = await semesterRepository.create({
            academicYear: year,
            semester: sem,
            config: {},
          });
          configId = newSemester.ConfigID;
          created = true;
        }

        const result: {
          year: number;
          semester: 1 | 2;
          created: boolean;
          configId: string;
          timeslots?: number;
          tableConfig?: boolean;
        } = { year, semester: sem, created, configId };

        // Optionally seed timeslots and table config
        if (seedData) {
          const timeslotCount = await seedTimeslots(year, semEnum);
          result.timeslots = timeslotCount;

          await seedTableConfig(year, semEnum);
          result.tableConfig = true;
        }

        results.push(result);
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: unknown) {
    console.error("[seed-semesters] error", err);
    let message: string;
    if (err instanceof Error) message = err.message;
    else if (typeof err === "string") message = err;
    else {
      try {
        message = JSON.stringify(err);
      } catch {
        message = "Unknown error";
      }
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Allow GET for convenience (same behavior as POST)
  return POST(req);
}
