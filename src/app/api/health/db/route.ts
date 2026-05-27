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
  const dbUrl = process.env.DATABASE_URL ?? "";
  const isPrismaAccelerate =
    dbUrl.startsWith("prisma+postgres://") || dbUrl.startsWith("prisma://");

  if (isPrismaAccelerate) {
    const skippedResponse: HealthCheckResponse = {
      ready: true,
      counts: {
        teachers: 0,
        schedules: 0,
        timeslots: 0,
        grades: 0,
        subjects: 0,
      },
      minExpected: {
        teachers: 0,
        schedules: 0,
        timeslots: 0,
        grades: 0,
        subjects: 0,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json<HealthCheckResponse>(skippedResponse, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Healthcheck-Skipped": "prisma-accelerate",
      },
    });
  }

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

    // Define minimum expected counts for a properly seeded database.
    // Defaults are conservative minimums for both demo and full test modes.
    // The isolated publish-happy E2E suite seeds a deliberately tiny world, so
    // it overrides these via HEALTH_MIN_* env vars on its dev server. Defaults
    // are unchanged, so the main suite's readiness gate is unaffected.
    const minOverride = (name: string, fallback: number): number => {
      const raw = process.env[name];
      const parsed = raw === undefined ? NaN : Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const minExpected = {
      teachers: minOverride("HEALTH_MIN_TEACHERS", 8),
      schedules: minOverride("HEALTH_MIN_SCHEDULES", 30),
      timeslots: minOverride("HEALTH_MIN_TIMESLOTS", 80),
      grades: minOverride("HEALTH_MIN_GRADES", 3),
      subjects: minOverride("HEALTH_MIN_SUBJECTS", 8),
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
