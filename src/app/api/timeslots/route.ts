import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { semester } from "@/prisma/generated/client";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";

/**
 * GET /api/timeslots
 *
 * Fetches timeslots for a specific academic year and semester.
 * Replaces: getTimeslotsByTermAction() called via SWR
 *
 * Query params:
 *   - year: Academic year (required, e.g., "2567")
 *   - semester: Semester number (required, "1" or "2")
 *
 * Response format matches Server Action:
 * { success: true, data: Timeslot[] }
 */
export async function GET(request: NextRequest) {
  await connection();
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const semesterNum = searchParams.get("semester");

    if (!year || !semesterNum) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Missing required parameters: year and semester" },
        },
        { status: 400 },
      );
    }

    const academicYear = parseInt(year);
    const semesterEnum =
      semesterNum === "1" ? semester.SEMESTER_1 : semester.SEMESTER_2;

    const timeslots = await prisma.timeslot.findMany({
      where: {
        AcademicYear: academicYear,
        Semester: semesterEnum,
      },
      orderBy: [{ DayOfWeek: "asc" }, { StartTime: "asc" }],
      select: {
        TimeslotID: true,
        AcademicYear: true,
        Semester: true,
        DayOfWeek: true,
        // Period: true, // Removed, derived from ID
        StartTime: true,
        EndTime: true,
        Breaktime: true,
      },
    });

    const timeslotsWithPeriod = timeslots.map((ts) => ({
      ...ts,
      Period: extractPeriodFromTimeslotId(ts.TimeslotID),
    }));

    return NextResponse.json({
      success: true,
      data: timeslotsWithPeriod,
    });
  } catch (error) {
    console.error("[API] GET /api/timeslots error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch timeslots",
        },
      },
      { status: 500 },
    );
  }
}
