import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { semester } from "@/prisma/generated/client";
import { createLogger } from "@/lib/logger";

const log = createLogger("ClassScheduleAPI");

/**
 * GET /api/schedule/class/[gradeId]
 *
 * Fetches a grade level's full schedule (all teachers/subjects) for the term —
 * used by the read-only class view in the arrange page.
 *
 * Route params:
 *   - gradeId: GradeID (e.g. "M1-1")
 *
 * Query params:
 *   - year: Academic year (required)
 *   - semester: Semester number (required, "1" or "2")
 *
 * Response shape matches the teacher schedule endpoint, plus teacherName.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
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

    const { gradeId } = await params;
    if (!gradeId) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid grade id" } },
        { status: 400 },
      );
    }

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
        GradeID: gradeId,
        teachers_responsibility: {
          some: { AcademicYear: academicYear, Semester: semesterEnum },
        },
      },
      select: {
        ClassID: true,
        TimeslotID: true,
        SubjectCode: true,
        GradeID: true,
        RoomID: true,
        IsLocked: true,
        subject: { select: { SubjectName: true } },
        gradelevel: { select: { Year: true, Number: true } },
        room: { select: { RoomName: true } },
        teachers_responsibility: {
          take: 1,
          select: {
            teacher: {
              select: { Prefix: true, Firstname: true, Lastname: true },
            },
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
      data: schedule.map((entry) => {
        const t = entry.teachers_responsibility[0]?.teacher;
        return {
          ClassID: entry.ClassID,
          TimeslotID: entry.TimeslotID,
          SubjectCode: entry.SubjectCode,
          GradeID: entry.GradeID,
          RoomID: entry.RoomID,
          subject: entry.subject,
          gradelevel: {
            GradeName: `M.${entry.gradelevel.Year}/${entry.gradelevel.Number}`,
          },
          room: entry.room,
          IsLocked: entry.IsLocked,
          teacherName: t
            ? `${t.Prefix}${t.Firstname} ${t.Lastname}`
            : undefined,
        };
      }),
    });
  } catch (error) {
    log.error("GET /api/schedule/class/[gradeId] failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch class schedule",
        },
      },
      { status: 500 },
    );
  }
}
