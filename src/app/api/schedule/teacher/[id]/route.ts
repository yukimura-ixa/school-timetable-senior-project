import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const role = normalizeAppRole(session.user?.role);
    if (!isAdminRole(role)) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 },
      );
    }

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
          some: {
            TeacherID: teacherId,
            AcademicYear: academicYear,
            Semester: semesterEnum,
          },
        },
      },
      select: {
        ClassID: true,
        TimeslotID: true,
        SubjectCode: true,
        GradeID: true,
        RoomID: true,
        subject: { select: { SubjectName: true } },
        gradelevel: { select: { Year: true, Number: true } },
        room: { select: { RoomName: true } },
      },
      orderBy: [
        { timeslot: { DayOfWeek: "asc" } },
        { timeslot: { StartTime: "asc" } },
      ],
    });

    return NextResponse.json({
      success: true,
      data: schedule.map((entry) => ({
        ...entry,
        gradelevel: {
          GradeName: `M.${entry.gradelevel.Year}/${entry.gradelevel.Number}`,
        },
      })),
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
