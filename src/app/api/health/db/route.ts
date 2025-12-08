/**
 * Database Health Check API Route
 *
 * Provides health status for database connectivity and seed verification.
 * Used by:
 * - CI/CD pipelines to ensure database is ready before running E2E tests
 * - Monitoring systems to check database availability
 * - E2E test setup scripts to wait for proper initialization
 *
 * @route GET /api/health/db
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const log = createLogger("HealthDb");

export const dynamic = "force-dynamic";

interface HealthCheckResponse {
  ready: boolean;
  counts: {
    teachers: number;
    schedules: number;
    timeslots: number;
    grades: number;
    subjects: number;
  };
  minExpected: {
    teachers: number;
    schedules: number;
    timeslots: number;
    grades: number;
    subjects: number;
  };
  timestamp: string;
}

interface ErrorResponse {
  ready: false;
  error: string;
  timestamp: string;
}

/**
 * GET handler for database health check
 *
 * Returns 200 with health status if database is accessible
 * Returns 500 if database connection fails
 */
export async function GET(): Promise<
  NextResponse<HealthCheckResponse | ErrorResponse>
> {
  try {
    // Check database connectivity and seed status with parallel queries
    const [
      teacherCount,
      scheduleCount,
      timeslotCount,
      gradeCount,
      subjectCount,
    ] = await Promise.all([
      prisma.teacher.count(),
      prisma.class_schedule.count(),
      prisma.timeslot.count(),
      prisma.gradelevel.count(),
      prisma.subject.count(),
    ]);

    // Define minimum expected counts for a properly seeded database
    // These are conservative minimums that work for both demo and full test modes
    const minExpected = {
      teachers: 8, // Demo mode has 8 teachers, full test has 40+
      schedules: 30, // Demo mode has ~36 schedules
      timeslots: 80, // 2 semesters × 5 days × 8 periods = 80
      grades: 3, // Demo mode has 3 grade levels (M.1/1-3)
      subjects: 8, // Demo mode has 10 subjects (8 core + 2 activities)
    };

    // Database is considered "ready" if all counts meet minimums
    const isSeeded =
      teacherCount >= minExpected.teachers &&
      scheduleCount >= minExpected.schedules &&
      timeslotCount >= minExpected.timeslots &&
      gradeCount >= minExpected.grades &&
      subjectCount >= minExpected.subjects;

    return NextResponse.json<HealthCheckResponse>(
      {
        ready: isSeeded,
        counts: {
          teachers: teacherCount,
          schedules: scheduleCount,
          timeslots: timeslotCount,
          grades: gradeCount,
          subjects: subjectCount,
        },
        minExpected,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    log.logError(error, { route: "health/db" });

    return NextResponse.json<ErrorResponse>(
      {
        ready: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
