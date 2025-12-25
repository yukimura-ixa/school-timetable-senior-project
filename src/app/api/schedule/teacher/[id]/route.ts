import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { semester } from "@/prisma/generated/client";

/**
 * GET /api/schedule/teacher/[id]
 *
 * Fetches a teacher's schedule for the current semester.
 * Replaces: getTeacherScheduleAction() called via SWR
 *
 * Route params:
 *   - id: Teacher ID
 *
 * Query params:
 *   - year: Academic year (required)
 *   - semester: Semester number (required, "1" or "2")
 *
 * Response format matches Server Action:
 * { success: true, data: ClassSchedule[] }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const teacherId = parseInt(id);
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

    const schedule = await prisma.class_schedule.findMany({
      where: {
        teachers_responsibility: {
          TeacherID: teacherId,
          AcademicYear: academicYear,
          Semester: semesterEnum,
        },
      },
      include: {
        subject: true,
        gradelevel: true,
        room: true,
        timeslot: true,
        teachers_responsibility: {
          include: {
            teacher: true,
          },
        },
      },
      orderBy: [
        { timeslot: { DayOfWeek: "asc" } },
        { timeslot: { StartTime: "asc" } },
      ],
    });

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error("[API] GET /api/schedule/teacher/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch teacher schedule",
        },
      },
      { status: 500 },
    );
  }
}
