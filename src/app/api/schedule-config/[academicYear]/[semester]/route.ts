import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { normalizeAppRole, isAdminRole } from "@/lib/authz";
import { semesterRepository } from "@/features/semester/infrastructure/repositories/semester.repository";
import { createLogger } from "@/lib/logger";

const log = createLogger("ScheduleConfigAPI");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ academicYear: string; semester: string }> },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "You must be logged in to perform this action",
          code: "UNAUTHORIZED",
        },
      },
      { status: 401 },
    );
  }

  const role = normalizeAppRole(session.user.role);
  if (!isAdminRole(role)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "You do not have permission to perform this action",
          code: "FORBIDDEN",
        },
      },
      { status: 403 },
    );
  }

  const { academicYear: academicYearParam, semester: semesterParam } =
    await params;

  const academicYear = Number.parseInt(academicYearParam, 10);
  const semester = Number.parseInt(semesterParam, 10);

  if (!Number.isFinite(academicYear) || (semester !== 1 && semester !== 2)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid academic year or semester",
          code: "VALIDATION_ERROR",
        },
      },
      { status: 400 },
    );
  }

  try {
    const config = await semesterRepository.findByYearAndSemester(
      academicYear,
      semester,
    );

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    log.error("GET /api/schedule-config failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to fetch schedule configuration",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    );
  }
}
